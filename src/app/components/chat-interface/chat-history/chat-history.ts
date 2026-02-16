import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ChatHistoryService } from '../../../common/services/chat-history.service';

@Component({
  selector: 'app-chat-history',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './chat-history.html',
  styleUrl: './chat-history.css'
})
export class ChatHistoryComponent {
  private readonly chatHistory = inject(ChatHistoryService);

  readonly conversations = this.chatHistory.sortedConversations;
  readonly activeConversationId = this.chatHistory.activeConversationId;

  readonly conversationSelected = output<string>();
  readonly newChatRequested = output<void>();
  readonly backClicked = output<void>();

  selectConversation(id: string) {
    this.conversationSelected.emit(id);
  }

  createNewChat() {
    this.newChatRequested.emit();
  }

  onBackClick() {
    this.backClicked.emit();
  }
}
