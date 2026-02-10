import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, MarkdownModule],
  templateUrl: './chat-interface.html',
  styleUrl: './chat-interface.css',
})
export class ChatInterface {
  private readonly api = inject(ApiService);
  private readonly messages$ = new BehaviorSubject<ChatMessage[]>([]);
  private readonly loading$ = new BehaviorSubject(false);

  protected userInput = '';
  protected readonly messages = this.messages$.asObservable();
  protected readonly isLoading = this.loading$.asObservable();
  protected readonly suggestion = SUGGESTION;

  sendMessage(text = this.userInput.trim()): void {
    if (!text) return;

    this.addMessage({ id: crypto.randomUUID(), message: text, timestamp: new Date(), isUser: true });
    this.userInput = '';
    this.loading$.next(true);

    const botId = crypto.randomUUID();
    this.addMessage({ id: botId, message: '', timestamp: new Date(), isUser: false, charts: [] });

    this.api.streamMessage(text).pipe(
      scan((fullText, chunk) => fullText + chunk, ''),
      map(content => this.parseCharts(content)),
      finalize(() => this.loading$.next(false))
    ).subscribe(({ text, charts }) => this.updateMessage(botId, text, charts));
  }

  handleKeyPress(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.sendMessage();
    }
  }

  getMaxValue(data: ChartDataPoint[]): number {
    return Math.max(...data.map(d => d.value));
  }

  private addMessage(msg: ChatMessage): void {
    this.messages$.next([...this.messages$.value, msg]);
  }

  private updateMessage(id: string, text: string, charts: ChartData[]): void {
    this.messages$.next(
      this.messages$.value.map(m => m.id === id ? { ...m, message: text, charts } : m)
    );
  }

  private parseCharts(text: string): { text: string; charts: ChartData[] } {
    const charts: ChartData[] = [];
    const cleaned = text.replace(/<chart>([\s\S]*?)<\/chart>/g, (_, json) => {
      try {
        const parsed = JSON.parse(json);
        if (parsed?.data?.length) {
          charts.push({ type: parsed.type || 'bar', title: parsed.title || 'Chart', data: parsed.data });
        }
      } catch {}
      return '';
    });
    return { text: cleaned.trim(), charts };
  }
}
