import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { ChatMessage } from '../../core/models/chat.models';
import { DataTableComponent } from '../data-table/data-table';

@Component({
  selector: 'app-data-chart',
  standalone: true,
  imports: [CommonModule, MarkdownModule, DataTableComponent],
  templateUrl: './data-chart.html',
  styleUrl: './data-chart.css'
})
export class DataChartComponent {
  @Input({ required: true }) message!: ChatMessage;
}



