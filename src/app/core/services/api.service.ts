import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

const SUGGESTION_TEXT = 'Who is the strongest in Solo Leveling';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private processedLength = 0;

  streamMessage(message: string): Observable<string> {
    this.processedLength = 0;
    
    const isSuggestion = message.trim() === SUGGESTION_TEXT;
    const endpoint = isSuggestion ? '/api/stream' : '/api/express/stream';
    
    console.log('[API] send req to', endpoint, 'with msg:', message, 'isSuggestion:', isSuggestion);

    return this.http.post(endpoint, { message }, {responseType: 'text', observe: 'events', reportProgress: true}).pipe(
      filter((e: any) => {
        if (e.type === 1) {
          console.log('[API] send req to api/stream');
        }
        if (e.type === 4) {
          console.log('[API] req done');
        }
        if (e.type === 0) {
          console.error('[API] req error:', e);
        }
        return e.type === 3 && e.partialText;
      }),
      map((e: any) => {
        const newData = this.extractNewData(e.partialText);
        if (newData) {
          console.log('[API] received this data chunk:', newData.substring(0, 50));
        }
        return newData;
      }),
      switchMap(data => {
        const parsed = this.parseSSE(data);
        if (parsed.length > 0) {
          console.log('[ApiService] parse sse:', parsed.length);
        }
        return parsed;
      })
    );
  }

  private extractNewData(text: string): string {
    const newData = text.slice(this.processedLength);
    this.processedLength = text.length;
    return newData;
  }

  private parseSSE(data: string): string[] {
    const chunks: string[] = [];
    const events = data.split('\n\n').filter(e => e.trim());
    for (const event of events) {
      const lines = event.split('\n');
      let eventType = '';
      let eventData = '';
      
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          eventData = line.slice(6).trim();
        }
      }
      
      if ((eventType === 'progress' || !eventType) && eventData) {
        chunks.push(eventData + '\n');
      }
    }
    
    return chunks;
  }
}
