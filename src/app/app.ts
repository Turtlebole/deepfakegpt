import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AI Chatbot');
  protected messages = signal<Message[]>([
    {
      text: 'Hewwo im ur bot uwu',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  protected userInput = signal('');
  protected isLoading = signal(false);

  constructor(private http: HttpClient) {}

  sendMessage() {
    const message = this.userInput().trim();
    if (!message || this.isLoading()) return;

    this.messages.update(msgs => [...msgs, {
      text: message,
      isUser: true,
      timestamp: new Date()
    }]);

    this.userInput.set('');
    this.isLoading.set(true);

    this.callChatAPI(message).subscribe({
      next: (response: string) => {
        this.messages.update(msgs => [...msgs, {
          text: response,
          isUser: false,
          timestamp: new Date()
        }]);
        this.isLoading.set(false);
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('API Error:', error);
        this.messages.update(msgs => [...msgs, {
          text: 'Sorry, I encountered an error. Please check your API configuration.',
          isUser: false,
          timestamp: new Date()
        }]);
        this.isLoading.set(false);
        this.scrollToBottom();
      }
    });

    this.scrollToBottom();
  }

  private callChatAPI(message: string) {
    return this.http.post<{ text: string; error?: string }>('/api/chat', { message }).pipe(
      map((r) => {
        if (!r?.text) throw new Error(r?.error || 'Empty response');
        return r.text;
      })
    );
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.getElementById('messages');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
