import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ChatResponse, Conversation } from '../models/chat.models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly baseUrl = '/api';

    constructor(private http: HttpClient) { }

    sendChatMessage(message: string): Observable<string> {
        return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, { message }).pipe(
            map(response => {
                if (response.error) {
                    throw new Error(response.error);
                }
                if (!response.text) {
                    throw new Error('Server didnt respond yet');
                }
                return response.text;
            }),
            catchError((error) => {
                return throwError(() => new Error(error.message));
            }));
    }

    /* currently not for use but will be later */
    getConversations(): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(`${this.baseUrl}/conversations`).pipe(
            catchError((error) => {
                return throwError(() => new Error(error.message));
            })
        );
    }


}
