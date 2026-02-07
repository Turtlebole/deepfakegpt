import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ChatResponse } from '../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);

    sendMessage(message: string) {
        return this.http.post<ChatResponse>('/api/chat', { message }).pipe(map((response) => response.text));
    }
}
