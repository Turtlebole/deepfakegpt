export interface ChartDataPoint {
    name: string;
    value: number;
}

export interface ChartData {
    type: string;
    title: string;
    data: ChartDataPoint[];
}

export interface ChatMessage {
    id: string;
    message: string;
    timestamp: Date;
    isUser: boolean;
    charts?: ChartData[];
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