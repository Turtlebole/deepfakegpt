import {Component, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';
import { BehaviorSubject } from 'rxjs';
import { finalize, map, scan } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';
import { ChatMessage, ChartData } from '../../core/models/chat.models';

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
  protected readonly isLoading$ = this.loadingSubject$.asObservable();
  protected readonly suggestion = SUGGESTION;
  protected messages = signal<ChatMessage[]>([]);

  sendMessage(text?: string): void {
    const messageText = text || this.userInput?.value?.trim();
    if (!messageText) return;

    this.addMessage({ id: crypto.randomUUID(), message: messageText, timestamp: new Date(), isUser: true });
    this.userInput.reset();
    this.loadingSubject$.next(true);

    const botId = crypto.randomUUID();
    this.addMessage({ id: botId, message: '', timestamp: new Date(), isUser: false, charts: [] });

    this.api.streamMessage(messageText).pipe(
      scan((fullText, chunk) => fullText + chunk, ''),
      map(content => this.parseCharts(content)),
      finalize(() => this.loadingSubject$.next(false))
    ).subscribe((parsed) => {
      this.messages.update((msgs) => msgs.map(m => (
        m.id === botId
          ? { ...m, message: parsed.text, charts: parsed.charts }
          : m
      )));
    });
  }

  handleKeyPress(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.sendMessage();
    }
  }

  private addMessage(message: ChatMessage): void {
    this.messagesSubject$.next([...this.messagesSubject$.value, message]);
    this.messages.update((messages) => [...messages, message]);
  }

  private parseCharts(text: string): { text: string; charts: ChartData[] } {
    const charts: ChartData[] = [];
    const cleaned = text.replace(/<chart>([\s\S]*?)<\/chart>/g, (_, json) => {
      try {
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
