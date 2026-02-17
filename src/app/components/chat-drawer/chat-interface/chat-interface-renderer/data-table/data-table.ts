import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableData } from '../../chat.models';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTableComponent {
  @Input({ required: true }) table!: TableData;
}

