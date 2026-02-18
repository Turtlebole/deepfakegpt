import {Component, Input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MarkdownModule} from 'ngx-markdown';
import {BaseChartDirective} from 'ng2-charts';
import {ChartConfiguration} from 'chart.js';
import {ChartData, ChatMessage, MessageRole, TableData} from '../chat.models';
import {DataTableComponent} from './data-table/data-table';
import {createChartConfig} from '../../../../common/utils/chart.utils';
import {ContentType} from '../chat.models';

const TYPE_REGEX = /<(chart|table)>([\s\S]*?)<\/\1>/gi;

@Component({
  selector: 'app-interface-renderer',
  standalone: true,
  imports: [CommonModule, MarkdownModule, DataTableComponent, BaseChartDirective],
  templateUrl: './chat-interface-renderer.html',
  styleUrl: './chat-interface-renderer.scss'
})
export class DataChartComponent {

  private readonly messageSignal = signal<ChatMessage | null>(null);

  @Input({ required: true })
  set message(value: ChatMessage) { this.messageSignal.set(value); }

  get message(): ChatMessage { return this.messageSignal()!; }
  private charts: ChartData[] = [];
  private tables: TableData[] = [];
  private chartConfigs: Map<string, ChartConfiguration> = new Map();
  private lastMessageId: string = '';
  private contentParsed = false;

  getContentType(): ContentType {
    if (this.message.role === MessageRole.User) {
      return ContentType.User;
    }

    if (this.message.charts?.length || this.message.tables?.length || TYPE_REGEX.test(this.message.message)) {
      return ContentType.Special;
    }

    return ContentType.Text;
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
          case ContentType.Chart:
            this.charts.push({
              type: parsedData.type || 'bar',
              title: parsedData.title || ContentType.Chart,
              data: parsedData.data || []
            });
            break;

          case ContentType.Table:
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
        }
      } catch (e) {
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

  protected readonly MessageRole = MessageRole;
  protected readonly ContentType = ContentType;

  constructor() {
    void this.MessageRole;
  }
}
