import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from '../../chat.models';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-data-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './data-chart.html',
  styleUrl: './data-chart.scss',
})
export class DataChart {
  @Input({ required: true }) charts: ChartData[] = [];
  @Input() getChartConfig!: (chart: ChartData, index: number) => ChartConfiguration;
}
