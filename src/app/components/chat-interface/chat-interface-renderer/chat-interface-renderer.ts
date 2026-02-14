import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { ChatMessage, ChartData, TableData } from '../chat.models';
import { DataTableComponent } from './data-table/data-table';

type ContentType = 'user' | 'special' | 'text';

const TYPE_REGEX = /<(chart|table)>([\s\S]*?)<\/\1>/gi;

@Component({
  selector: 'app-data-chart',
  standalone: true,
  imports: [CommonModule, MarkdownModule, DataTableComponent],
  templateUrl: './chat-interface-renderer.html',
  styleUrl: './chat-interface-renderer.css'
})
export class DataChartComponent {
  @Input({ required: true }) message!: ChatMessage;

  charts: ChartData[] = [];
  tables: TableData[] = [];

  getContentType(): ContentType {
    if (this.message.role === 'user') {
      return 'user';
    }

    if (this.message.charts?.length || this.message.tables?.length || TYPE_REGEX.test(this.message.message)) {
      return 'special';
    }

    return 'text';
  }

  parseSpecialContent(): void {
    this.charts = [...(this.message.charts || [])];
    this.tables = [...(this.message.tables || [])];

    const regex = new RegExp(TYPE_REGEX);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(this.message.message)) !== null) {
      const contentType = match[1].toLowerCase() as 'chart' | 'table';
      const jsonContent = match[2].trim();

      try {
        const parsedData = JSON.parse(jsonContent);

        switch (contentType) {
          case 'chart':
            this.charts.push({
              type: parsedData.type || 'bar',
              title: parsedData.title || 'Chart',
              data: parsedData.data || []
            });
            break;

          case 'table':
            this.tables.push({
              id: parsedData.id || crypto.randomUUID(),
              columns: parsedData.columns || [],
              rows: parsedData.rows || [],
              title: parsedData.title,
              summary: parsedData.summary,
              sourceId: parsedData.sourceId
            });
            break;
          default:
            console.warn(`no clue which file type is received: ${contentType}`);
        }
      } catch (error) {
        console.error(`parsing failed ${contentType}:`, error);
      }
    }
  }

  getCharts(): ChartData[] {
    if (this.charts.length === 0 && this.getContentType() === 'special') {
      this.parseSpecialContent();
    }
    return this.charts;
  }

  getTables(): TableData[] {
    if (this.tables.length === 0 && this.getContentType() === 'special') {
      this.parseSpecialContent();
    }
    return this.tables;
  }
}
