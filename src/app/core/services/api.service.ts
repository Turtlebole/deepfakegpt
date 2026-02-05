import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/environment';
import { Conversation } from '../models/chat.models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;
    constructor(private http: HttpClient) {}
    sendMessage(message: string): Observable<string> {
        return this.http.post<string>(`${this.apiUrl}/chat`, { message });
    }

        getConversations(): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`)
    }
}