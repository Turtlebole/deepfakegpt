import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ChatMessage, ChartData, TableData } from '../chat.models';
import { DataTableComponent } from './data-table/data-table';
import { createChartConfig } from '../../../../common/utils/chart.utils';

type ContentType = 'user' | 'special' | 'text';

const TYPE_REGEX = /<(chart|table)>([\s\S]*?)<\/\1>/gi;

@Component({
  selector: 'app-data-chart',
  standalone: true,
  imports: [CommonModule, MarkdownModule, DataTableComponent, BaseChartDirective],
  templateUrl: './chat-interface-renderer.html',
  styleUrl: './chat-interface-renderer.scss'
})
export class DataChartComponent {
  @Input({ required: true }) message!: ChatMessage; // FIXME: signal

  private charts: ChartData[] = [];
  private tables: TableData[] = [];
  private chartConfigs: Map<string, ChartConfiguration> = new Map();
  private lastMessageId: string = '';
  private contentParsed = false;

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
    if (this.message.id === this.lastMessageId && this.contentParsed) {
      return;
    }

    this.lastMessageId = this.message.id;
    this.contentParsed = true;
    this.chartConfigs.clear();

    this.charts = [...(this.message.charts || [])];
    this.tables = [...(this.message.tables || [])];

    const regex = new RegExp(TYPE_REGEX);
    const matches = [...this.message.message.matchAll(regex)];

    for (const match of matches) {
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
            console.warn(`what type did i get here o0: ${contentType}`);
        }
      } catch (e) {
        console.error(`parse fail ${contentType} data:`, e);
      }
    }

    this.charts.forEach((chart, index) => {
      this.chartConfigs.set(`${chart.title}-${index}`, createChartConfig(chart));
    });
  }

  getCharts(): ChartData[] {
    if (!this.contentParsed || this.message.id !== this.lastMessageId) {
      this.parseSpecialContent();
    }

    return this.charts;
  }

  getTables(): TableData[] {
    if (!this.contentParsed || this.message.id !== this.lastMessageId) {
      this.parseSpecialContent();
    }

    return this.tables;
  }

  getChartConfig(chart: ChartData, index: number): ChartConfiguration {
    const key = `${chart.title}-${index}`;
    const cached = this.chartConfigs.get(key);
    if (cached) {
      return cached;
    }

    const config = createChartConfig(chart);
    this.chartConfigs.set(key, config);
    return config;
  }
}
