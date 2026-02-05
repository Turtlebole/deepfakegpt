export interface ChatMessage {
    id: string;
    message: string;
    timestamp: Date;
    isUser: boolean;
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatResponse {
    text: string;
    error?: string;
}

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
