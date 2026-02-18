export interface ChartDataPoint {
    name: string;
    value: number;
}

export interface ChartData {
    type: string;
    title: string;
    data: ChartDataPoint[];
}

export type TableCellValue = string | number | boolean | null;

export interface TableData {
    id: string;
    columns: string[];
    rows: TableCellValue[][];
    title?: string;
    summary?: string;
    sourceId?: string;
}

export enum MessageRole {
    User = 'user',
    Assistant = 'assistant',
}

export enum ContentType {
  Chart = 'chart',
  Table = 'table',
  Text = 'text',
  User = 'user',
  Special = 'special',
}

export interface ChatMessage {
    id: string;
    message: string;
    timestamp: Date;
    isUser: boolean;
    role: MessageRole;
    charts?: ChartData[];
    tables?: TableData[];
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
