import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule, MatIconModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  protected chatService = inject(ChatService);
  protected userInput = '';

  sendMessage(): void {
    if (!this.userInput.trim()) return;
    this.chatService.sendMessage(this.userInput).subscribe();
    this.userInput = '';
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
