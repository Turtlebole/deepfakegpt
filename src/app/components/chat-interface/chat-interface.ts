import { Component, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatInput } from '../chat-input/chat-input';

@Component({
  selector: 'app-chat-interface',
  imports: [CommonModule, MatProgressSpinnerModule, ChatInput],
  templateUrl: './chat-interface.html',
  styleUrl: './chat-interface.css',
})
export class ChatInterface {
  protected chatInput = viewChild.required(ChatInput);
}
