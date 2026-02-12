import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import { ChartData, TableData, TableCellValue } from '../models/chat.models';

export interface ParsedContent {
  text: string;
  charts: ChartData[];
  tables: TableData[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private processedLength = 0;
  private baseUrl = environment.baseUrl;

  streamMessage(message: string): Observable<string> {
    this.processedLength = 0;

      return this.http.post(`${this.baseUrl}/api/stream`, { message }, { responseType: 'text', observe: 'events', reportProgress: true }).pipe(
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
    const lines = data.split('\n');

    let currentEventType = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const eventData = line.slice(5);
        if ((currentEventType === 'progress' || currentEventType === '') && eventData) {
          chunks.push(eventData);
        }
        currentEventType = '';
      }
    }

    return chunks;
  }

  parseContent(text: string): ParsedContent {
    const charts: ChartData[] = [];
    const tables: TableData[] = [];

    let cleaned = this.parseCharts(text, charts, tables);
    cleaned = this.parseTables(cleaned, tables);
    cleaned = this.parseMarkdownTables(cleaned, tables);

    return { text: cleaned.trim(), charts, tables };
  }

  private parseCharts(text: string, charts: ChartData[], tables: TableData[]): string {
    return text.replace(/<chart>([\s\S]*?)<\/chart>/g, (_, json) => {
      try {
        const parsed = JSON.parse(json);
        if (parsed?.data?.length) {
          charts.push({ type: parsed.type || 'bar', title: parsed.title || 'Chart', data: parsed.data });
          tables.push(this.dataToTable(parsed.data, parsed.title ? `${parsed.title} (Data)` : undefined));
          return '';
        }
      } catch {
        return `<chart>${json}</chart>`;
      }
      return '';
    });
  }

  private parseTables(text: string, tables: TableData[]): string {
    return text.replace(/<table>([\s\S]*?)<\/table>/g, (_, json) => {
      try {
        const parsed = JSON.parse(json);

        if (parsed?.data?.length) {
          tables.push(this.dataToTable(parsed.data, parsed.title, parsed.summary, parsed.sourceId));
          return '';
        }

        if (parsed?.columns?.length && parsed?.rows?.length) {
          const columns = parsed.columns.filter((c: unknown) => typeof c === 'string');
          const rows = parsed.rows
            .filter((r: unknown) => Array.isArray(r) && r.length === columns.length)
            .map((r: unknown[]) => r.map(this.coerceValue));

          if (columns.length && rows.length) {
            tables.push({ id: crypto.randomUUID(), columns, rows, title: parsed.title, summary: parsed.summary, sourceId: parsed.sourceId });
          }
          return '';
        }
      } catch {
        return `<table>${json}</table>`;
      }
      return '';
    });
  }

  private parseMarkdownTables(text: string, tables: TableData[]): string {
    const regex = /\|(.+)\|[\r\n]+\|([-:\s|]+)\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const columns = match[1].split('|').map(c => c.trim()).filter(Boolean);
      const rows = match[3]
        .split(/[\r\n]+/)
        .filter(line => line.trim())
        .map(line => line.split('|').map(c => c.trim()).slice(1, -1))
        .filter(cells => cells.length === columns.length)
        .map(cells => cells.map(this.coerceValue));

      if (columns.length && rows.length) {
        tables.push({ id: crypto.randomUUID(), columns, rows });
        text = text.replace(match[0], '');
      }
    }

    return text;
  }

  private dataToTable(data: any[], title?: string, summary?: string, sourceId?: string): TableData {
    const columns = Object.keys(data[0]);
    const rows = data.map(item => columns.map(col => this.coerceValue(item[col])));
    return { id: crypto.randomUUID(), columns, rows, title, summary, sourceId };
  }

  private coerceValue = (value: unknown): TableCellValue => {
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true') return true;
      if (lower === 'false') return false;
      if (lower === 'null' || !value) return null;
      const num = parseFloat(value);
      return !isNaN(num) && value.trim() ? num : value;
    }
    return (typeof value === 'number' || typeof value === 'boolean' || value === null)
      ? value as TableCellValue
      : String(value);
  }
}
