import {Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {finalize, map, scan} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';

import {ApiService} from '../../../common/services/chat-api.service';
import {ChatHistoryService} from '../../../common/services/chat-history.service';
import {ChatMessage, MessageRole} from './chat.models';
import {DataChartComponent} from './chat-interface-renderer/chat-interface-renderer';
import {ChatHistoryComponent} from '../chat-history/chat-history';
import {noWhitespaceValidator} from '../../../common/utils/validators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, DataChartComponent, ChatHistoryComponent],
  templateUrl: './chat-interface.html',
  styleUrl: './chat-interface.scss',
})

export class ChatInterface {
  private readonly api = inject(ApiService);
  private readonly chatHistory = inject(ChatHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly userInput = new FormControl('', { validators: [Validators.required, noWhitespaceValidator] });
  protected readonly isLoading = signal(false);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly showHistory = signal(false);
  protected readonly chatGuid = signal<string | null>(null);

  constructor() {
    try {
      console.debug('[ChatInterface] conversations', this.chatHistory.conversations());
      console.debug('[ChatInterface] activeConversationId', this.chatHistory.activeConversationId());
      console.debug('[ChatInterface] activeConversation', this.chatHistory.activeConversation());
    } catch (e) {
    }

    const initialActive = this.chatHistory.activeConversation();
    if (initialActive) {
      this.messages.set(initialActive.messages || []);
    }

    effect(() => {
      const activeConversation = this.chatHistory.activeConversation();
      if (activeConversation) {
        this.messages.set(activeConversation.messages || []);
      }
    });

    this.route.paramMap.pipe(
      takeUntilDestroyed(),
    ).subscribe((params) => {
      const guid = params.get('guid');
      if (!guid) {
        return;
      }

      this.chatGuid.set(guid);
    });

    const activeId = this.chatHistory.activeConversationId();
    if (activeId) {
      this.updateUrlWithConversationId(activeId);
    } else {
      this.createNewConversation();
    }
  }

  private updateUrlWithConversationId(id: string): void {
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
      role: MessageRole.User
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
      role: MessageRole.Assistant,
      charts: [],
      tables: []
    };

    this.chatHistory.addMessageToActiveConversation(botMessage);

    this.api.streamMessage(messageText).pipe(
      scan((fullText, chunk) => fullText + chunk, ''),
      map(fullText => this.api.parseContent(fullText)),
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((parsed) => {
      const activeId = this.chatHistory.activeConversationId();
      if (!activeId) return;

      const conversation = this.chatHistory.conversations().find(c => c.id === activeId);
      if (!conversation) return;

      const updatedMessages = conversation.messages.map((message) =>
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
    const currentChat = this.showHistory();
    if (!currentChat) {
      const activeChatId = this.chatHistory.activeConversationId();
      if (!activeChatId) {
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
