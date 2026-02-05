import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ChatMessage, generateId } from '../models/chat.models';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private _messages$ = new BehaviorSubject<ChatMessage[]>([]);
    private _isLoading$ = new BehaviorSubject<boolean>(false);

    readonly messages$: Observable<ChatMessage[]> = this._messages$.asObservable();
    readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

    constructor(private apiService: ApiService) {}

    sendMessage(message: string): Observable<string> {
        const trimmed = message.trim();
        
        if (!trimmed) {
            return throwError(() => new Error('No empty msg'));
        }

        this._addMessage({
            id: generateId(),
            message: trimmed,
            timestamp: new Date(),
            isUser: true
        });

        this._isLoading$.next(true);

        return this.apiService.sendChatMessage(trimmed).pipe(
            tap((text: string) => {
                this._addMessage({
                    id: generateId(),
                    message: text,
                    timestamp: new Date(),
                    isUser: false
                });
            }),
            finalize(() => this._isLoading$.next(false))
        );
    }
    
    private _addMessage(message: ChatMessage): void {
        this._messages$.next([...this._messages$.value, message]);
    }
}