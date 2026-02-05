export interface ChatMessage {
    id: string;
    message: string;
    isUser: boolean;
    timestamp: Date;
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}