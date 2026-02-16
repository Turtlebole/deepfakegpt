import {Component, inject, signal, OnDestroy, effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, map, scan, filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApiService } from '../../common/services/chat-api.service';
import { ChatHistoryService } from '../../common/services/chat-history.service';
import { ChatMessage } from './chat.models';
import { DataChartComponent } from './chat-interface-renderer/chat-interface-renderer';
import { ChatHistoryComponent } from './chat-history/chat-history';
import { noWhitespaceValidator } from '../../common/utils/validators';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, DataChartComponent, ChatHistoryComponent],
  templateUrl: './chat-interface.html',
  styleUrl: './chat-interface.css',
})

export class ChatInterface implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly chatHistory = inject(ChatHistoryService);
  private readonly router = inject(Router);
  private subscriptions = new Subscription();

  protected readonly userInput = new FormControl('', { validators: [Validators.required, noWhitespaceValidator] });
  protected readonly isLoading = signal(false);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly showHistory = signal(false);

  constructor() {
    effect(() => {
      const activeConversation = this.chatHistory.activeConversation();
      if (activeConversation) {
        this.messages.set(activeConversation.messages || []);
      }
    });

    const routerSub = this.router.events.pipe(
      map(event => {
        if (event instanceof NavigationEnd) {
          const urlSegments = event.url.split('/');
          return urlSegments[urlSegments.length - 1];
        }
        return null;
      }),
      filter((id): id is string => !!id && id !== 'chat' && id.includes('-')),
    ).subscribe(id => {
      this.chatHistory.setActiveConversation(id);
    });

    this.subscriptions.add(routerSub);

    const activeId = this.chatHistory.activeConversationId();
    if (activeId) {
      this.updateUrlWithConversationId(activeId);
    } else {
      this.createNewConversation();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateUrlWithConversationId(id: string): void {
    this.router.navigate(['/chat', id], { replaceUrl: true });
  }

  private createNewConversation(): void {
    this.chatHistory.createNewConversation();
    const newId = this.chatHistory.activeConversationId();
    if (newId) {
      this.updateUrlWithConversationId(newId);
    }
  }

  sendMessage(text?: string): void {
    const messageText = text || (this.userInput.valid ? this.userInput.value : null);
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      message: messageText,
      timestamp: new Date(),
      isUser: true,
      role: 'user'
    };

    this.chatHistory.addMessageToActiveConversation(userMessage);
    this.userInput.reset();
    this.isLoading.set(true);

    const botId = crypto.randomUUID();
    const botMessage: ChatMessage = {
      id: botId,
      message: '',
      timestamp: new Date(),
      isUser: false,
      role: 'assistant',
      charts: [],
      tables: []
    };

    this.chatHistory.addMessageToActiveConversation(botMessage);

    this.api.streamMessage(messageText).pipe(
      scan((fullText, chunk) => fullText + chunk, ''),
      map(fullText => this.api.parseContent(fullText)),
      finalize(() => this.isLoading.set(false))
    ).subscribe((parsed) => {
      const activeId = this.chatHistory.activeConversationId();
      if (!activeId) return;

      const conversation = this.chatHistory.conversations().find(c => c.id === activeId);
      if (!conversation) return;

      const updatedMessages = conversation.messages.map(message =>
        message.id === botId
          ? { ...message, message: parsed.text, charts: parsed.charts, tables: parsed.tables }
          : message
      );
      this.chatHistory.updateConversationMessages(activeId, updatedMessages);
    });
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleHistory(): void {
    const currently = this.showHistory();
    if (!currently) {
      const activeId = this.chatHistory.activeConversationId();
      if (!activeId) {
        this.createNewConversation();
      }
    }
    this.showHistory.update(value => !value);
  }

  onNewChatRequested(): void {
    this.createNewConversation();
    this.showHistory.set(false);
  }

  onConversationSelected(conversationId: string): void {
    this.chatHistory.setActiveConversation(conversationId);
    this.updateUrlWithConversationId(conversationId);
    this.showHistory.set(false);
  }
}
