import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatResponse, Conversation } from '../models/chat.models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly baseUrl = '/api';

    constructor(private http: HttpClient) { }

    sendChatMessage(message: string): Observable<string> {
        return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, {message}).pipe(
            map(response => response.text)
        )
    }

    /* currently not for use but will be later */
    getConversations(): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(`${this.baseUrl}/conversations`).pipe(
            map(conversations => conversations.map(conv => ({
                ...conv,
                createdAt: new Date(conv.createdAt),
                updatedAt: new Date(conv.updatedAt),
                messages: conv.messages.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }))
            })))
        );
    }


}
