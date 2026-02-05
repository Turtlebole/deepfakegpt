import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatService } from '../../core/services/chat.service';
import { ChatInput } from '../chat-input/chat-input';

@Component({
  selector: 'app-chat-interface',
  imports: [CommonModule, MatProgressSpinnerModule, ChatInput],
  templateUrl: './chat-interface.html',
  styleUrl: './chat-interface.css',
})
export class ChatInterface {
  protected chatService = inject(ChatService);
}
