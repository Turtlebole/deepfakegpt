import { ChartConfiguration } from 'chart.js';
import { ChartData } from '../../components/chat-interface/chat.models';

const PRIMARY_COLOR = '#AF4A4A';

export function createChartConfig(chart: ChartData): ChartConfiguration {
  const labels = chart.data.map(d => d.name);
  const data = chart.data.map(d => d.value);
  const colors = Array(data.length).fill(PRIMARY_COLOR);

  const type = chart.type === 'line' ? 'line' : 'bar';

  const dataset: any = {
    label: chart.title,
    data,
    backgroundColor: colors,
    borderColor: colors,
    borderWidth: 2
  };

  if (type === 'line') {
    dataset.fill = false;
    dataset.tension = 0.4;
    dataset.pointBackgroundColor = colors;
  }

  return {
    type: type as any,
    data: {
      labels,
      datasets: [dataset]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        title: {
          display: !!chart.title,
          text: chart.title,
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  } as ChartConfiguration;
}
