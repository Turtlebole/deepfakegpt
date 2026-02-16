import { Injectable, inject, signal, computed } from '@angular/core';
import { Conversation, ChatMessage } from '../../components/chat-interface/chat.models';
import { PromptLibraryService } from './prompt-library.service';
import { ApiService } from './chat-api.service';

@Injectable({
  providedIn: 'root'
})
export class ChatHistoryService {
  private readonly promptLibrary = inject(PromptLibraryService);
  private readonly api = inject(ApiService);

  readonly conversations = signal<Conversation[]>([]);
  readonly activeConversationId = signal<string | null>(null);

  readonly sortedConversations = computed(() =>
    [...this.conversations()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  );

  readonly activeConversation = computed(() => {
    const activeId = this.activeConversationId();
    return this.conversations().find(conv => conv.id === activeId);
  });

  constructor() {
    this.initializeWithPredefinedPrompts();
  }

  createNewConversation(): void {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.conversations.update(conversations => [...conversations, newConversation]);
    this.activeConversationId.set(newConversation.id);
  }

  setActiveConversation(id: string): void {
    this.activeConversationId.set(id);
  }

  addMessageToActiveConversation(message: ChatMessage): void {
    const activeId = this.activeConversationId();
    if (!activeId) return;

    this.conversations.update(conversations =>
      conversations.map(conversation => {
        if (conversation.id === activeId) {
          const updatedMessages = [...conversation.messages, message];
          const title = conversation.messages.length === 0 && message.isUser
            ? message.message.slice(0, 50)
            : conversation.title;
          return { ...conversation, messages: updatedMessages, title, updatedAt: new Date() };
        }
        return conversation;
      })
    );
  }

  updateConversationMessages(conversationId: string, messages: ChatMessage[]): void {
    this.conversations.update(conversations =>
      conversations.map(conversation =>
        conversation.id === conversationId
          ? { ...conversation, messages, updatedAt: new Date() }
          : conversation
      )
    );
  }

  private initializeWithPredefinedPrompts(): void {
    const prompts = this.promptLibrary.getPromptsValue();

    const predefinedConversations: Conversation[] = prompts.map(prompt => {
      const rawMessages = this.promptLibrary.getMessagesForPrompt(prompt.id);
      const messages: ChatMessage[] = rawMessages.map(msg => {
        if (!msg.isUser && msg.message) {
          const parsed = this.api.parseContent(msg.message);
          return { ...msg, message: parsed.text, charts: parsed.charts || [], tables: parsed.tables || [] };
        }
        return msg;
      });

      const conversationDate = new Date();
      return { id: prompt.id, title: prompt.title, messages, createdAt: conversationDate, updatedAt: conversationDate };
    });

    this.conversations.set(predefinedConversations);
    if (predefinedConversations.length > 0) {
      this.activeConversationId.set(predefinedConversations[0].id);
    }
  }
}
