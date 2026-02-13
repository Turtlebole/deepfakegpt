import {Component, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, map, scan } from 'rxjs/operators';

import { ApiService } from '../../common/services/chat-api.service';
import { ChatMessage } from './chat.models';
import { DataChartComponent } from './data-chart/data-chart';
import { noWhitespaceValidator } from '../../common/utils/validators';

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

  protected readonly userInput = new FormControl('', { validators: [Validators.required, noWhitespaceValidator] });
  protected readonly suggestion = SUGGESTION;
  protected readonly isLoading = signal(false);
  protected readonly messages = signal<ChatMessage[]>([]);

  sendMessage(text?: string): void {
    const messageText = text || (this.userInput.valid ? this.userInput.value : null);
    if (!messageText) return;

    this.addMessage({ id: crypto.randomUUID(), message: messageText, timestamp: new Date(), isUser: true });
    this.userInput.reset();
    this.isLoading.set(true);

    const botId = crypto.randomUUID();
    this.addMessage({ id: botId, message: '', timestamp: new Date(), isUser: false, charts: [], tables: [] });

    this.api.streamMessage(messageText).pipe(
      scan((fullText, chunk) => fullText + chunk, ''),
      map(fullText => this.api.parseContent(fullText)),
      finalize(() => this.isLoading.set(false))
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
    this.messages.update((messages) => [...messages, message]);
  }
}
