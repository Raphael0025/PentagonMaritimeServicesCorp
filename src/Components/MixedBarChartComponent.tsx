import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend );

export const options = {
  plugins: {
    title: {
      display: true,
      text: 'Total Enrolled Trainees Overtime',
    },
  },
  responsive: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

// Generate random data for the labels
const labels =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface CustomDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  stack: string;
}

export default function MixedBarChartComponent({datasets}: { datasets: CustomDataset[] }) {
  
    // Assemble the data object
    const data = {
      labels: labels,
      datasets: datasets,
    };

    return <Bar options={options} data={data} />
}