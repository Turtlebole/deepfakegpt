import {Component, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject } from 'rxjs';
import { finalize, map, scan } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';
import { ChatMessage } from '../../core/models/chat.models';
import { DataChartComponent } from '../data-chart/data-chart';
import { noWhitespaceValidator } from '../../core/validators/validators';

const SUGGESTION = 'Who is the strongest in Solo Leveling';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, DataChartComponent],
  templateUrl: './chat-interface.html',
  styleUrl: './chat-interface.css',
})

export class ChatInterface {
  private readonly api = inject(ApiService);
  private readonly messagesSubject$ = new BehaviorSubject<ChatMessage[]>([]);
  private readonly loadingSubject$ = new BehaviorSubject(false);

  protected readonly userInput = new FormControl('', { validators: [Validators.required, noWhitespaceValidator] });
  protected readonly isLoading$ = this.loadingSubject$.asObservable();
  protected readonly suggestion = SUGGESTION;
  protected messages = signal<ChatMessage[]>([]);

  sendMessage(text?: string): void {
    const messageText = text || (this.userInput.valid ? this.userInput.value : null);
    if (!messageText) return;

    this.addMessage({ id: crypto.randomUUID(), message: messageText, timestamp: new Date(), isUser: true });
    this.userInput.reset();
    this.loadingSubject$.next(true);

    const botId = crypto.randomUUID();
    this.addMessage({ id: botId, message: '', timestamp: new Date(), isUser: false, charts: [], tables: [] });

    this.api.streamMessage(messageText).pipe(
      scan((fullText, chunk) => fullText + chunk, ''),
      map(content => this.api.parseContent(content)),
      finalize(() => this.loadingSubject$.next(false))
    ).subscribe((parsed) => {
      this.messages.update((messages) => messages.map(message => {
        if (message.id === botId) {
          return { ...message, message: parsed.text, charts: parsed.charts, tables: parsed.tables };
        }
        return message;
      }));
    });
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private addMessage(message: ChatMessage): void {
    this.messagesSubject$.next([...this.messagesSubject$.value, message]);
    this.messages.update((messages) => [...messages, message]);
  }
}
