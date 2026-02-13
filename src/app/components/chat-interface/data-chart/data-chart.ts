import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { ChatMessage, ChartData, TableData } from '../chat.models';
import { DataTableComponent } from './data-table/data-table';

@Component({
  selector: 'app-data-chart',
  standalone: true,
  imports: [CommonModule, MarkdownModule, DataTableComponent],
  templateUrl: './data-chart.html',
  styleUrl: './data-chart.css'
})
export class DataChartComponent {
  @Input({ required: true }) message!: ChatMessage;

  // Regex patterns for chart and table detection
  private readonly CHART_REGEX = /\[CHART\]([\s\S]*?)\[\/CHART\]/g;
  private readonly TABLE_REGEX = /\[TABLE\]([\s\S]*?)\[\/TABLE\]/g;

  getContentType(): 'user' | 'chart' | 'table' | 'text' {
    if (this.message.isUser) {
      return 'user';
    }

    if (this.message.charts?.length || this.CHART_REGEX.test(this.message.message)) {
      return 'chart';
    }

    if (this.message.tables?.length || this.TABLE_REGEX.test(this.message.message)) {
      return 'table';
    }

    return 'text';
  }

  parseCharts(): ChartData[] {
    if (this.message.charts?.length) {
      return this.message.charts;
    }

    const charts: ChartData[] = [];
    const matches = this.message.message.matchAll(this.CHART_REGEX);

    for (const match of matches) {
      try {
        const chartData = JSON.parse(match[1].trim());
        charts.push(chartData);
      } catch (e) {
        console.error('Failed to parse chart data:', e);
      }
    }

    return charts;
  }

  parseTables(): TableData[] {
    if (this.message.tables?.length) {
      return this.message.tables;
    }

    const tables: TableData[] = [];
    const matches = this.message.message.matchAll(this.TABLE_REGEX);

    for (const match of matches) {
      try {
        const tableData = JSON.parse(match[1].trim());
        tables.push(tableData);
      } catch (e) {
        console.error('Failed to parse table data:', e);
      }
    }

    return tables;
  }
}



