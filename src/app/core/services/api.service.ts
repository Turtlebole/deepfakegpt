import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private processedLength = 0;

  streamMessage(message: string): Observable<string> {
    this.processedLength = 0;

    return this.http.post('/api/stream', { message }, {
      responseType: 'text',
      observe: 'events',
      reportProgress: true
    }).pipe(
      filter((e: any) => e.type === 3 && e.partialText),
      map((e: any) => this.extractNewData(e.partialText)),
      switchMap(data => this.parseSSE(data))
    );
  }

  private extractNewData(text: string): string {
    const newData = text.slice(this.processedLength);
    this.processedLength = text.length;
    return newData;
  }

  private parseSSE(data: string): string[] {
    return data
      .split('\n\n')
      .map(event => event.match(/^data: (.*)$/m)?.[1])
      .filter((chunk): chunk is string => !!chunk);
  }
}
