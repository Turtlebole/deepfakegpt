import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ChatMessage } from '../../core/models/chat.models';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule, MatIconModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  private apiService = inject(ApiService);
  protected userInput = '';

  private _messages$ = new BehaviorSubject<ChatMessage[]>([]);
  private _isLoading$ = new BehaviorSubject<boolean>(false);

  readonly messages$: Observable<ChatMessage[]> = this._messages$.asObservable();
  readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  sendMessage(): void {
    const trimmed = this.userInput.trim();
    
    if (!trimmed) return;

    this._addMessage({
      id: crypto.randomUUID(),
      message: trimmed,
      timestamp: new Date(),
      isUser: true
    });

    this.userInput = '';
    this._isLoading$.next(true);

    this.apiService.sendChatMessage(trimmed).pipe(
      finalize(() => this._isLoading$.next(false))
    ).subscribe((text) => {
      this._addMessage({
        id: crypto.randomUUID(),
        message: text,
        timestamp: new Date(),
        isUser: false
      });
    });
  }

  private _addMessage(message: ChatMessage): void {
    this._messages$.next([...this._messages$.value, message]);
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
