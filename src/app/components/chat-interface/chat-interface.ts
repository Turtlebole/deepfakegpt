import {Component, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';
import { BehaviorSubject } from 'rxjs';
import { finalize, map, scan } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';
import { ChatMessage, ChartData, ChartDataPoint } from '../../core/models/chat.models';

const SUGGESTION = 'Who is the strongest in Solo Leveling';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, MarkdownModule],
  templateUrl: './chat-interface.html',
  styleUrl: './chat-interface.css',
})
export class ChatInterface {
  private readonly api = inject(ApiService);
  private readonly messagesSubject$ = new BehaviorSubject<ChatMessage[]>([]);
  private readonly loadingSubject$ = new BehaviorSubject(false);

  protected readonly userInput = new FormControl('', { validators: [Validators.required] });
  protected readonly messages$ = this.messagesSubject$.asObservable();
  protected readonly isLoading$ = this.loadingSubject$.asObservable();
  protected readonly suggestion = SUGGESTION;


  messages = signal<ChatMessage[]>([]);
  sendMessage( ) : void {
    const text = this.userInput?.value?.trim();
    if (!text) return;

    this.addMessage({ id: crypto.randomUUID(), message: text, timestamp: new Date(), isUser: true });
    this.userInput.reset();
    this.loadingSubject$.next(true);

    const botId = crypto.randomUUID();
    this.addMessage({ id: botId, message: '', timestamp: new Date(), isUser: false, charts: [] });

    this.api.streamMessage(text).pipe(
      scan((fullText, chunk) => fullText + chunk, ''),
      map(content => this.parseCharts(content)),
      finalize(() => this.loadingSubject$.next(false))
    ).subscribe((message) => {
      // const messages = this.messages();
      // this.messages.update([...messages, message]);
    });
  }

  handleKeyPress(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.sendMessage();
    }
  }

  private addMessage(msg: ChatMessage): void {
    this.messagesSubject$.next([...this.messagesSubject$.value, msg]);
  }

  private parseCharts(text: string): { text: string; charts: ChartData[] } {
    const charts: ChartData[] = [];
    const cleaned = text.replace(/<chart>([\s\S]*?)<\/chart>/g, (_, json) => {
      try {
        console.log('json test', json);
        const parsed = JSON.parse(json);
        if (parsed?.data?.length) {
          charts.push({ type: parsed.type || 'bar', title: parsed.title || 'Chart', data: parsed.data });
        }
      } catch { }
      return '';
    });
    return { text: cleaned.trim(), charts };
  }
}
