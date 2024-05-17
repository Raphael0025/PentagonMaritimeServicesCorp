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

// Define the number of data points
const DATA_COUNT = 12;

// Generate random data for the labels
const labels =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Generate random data for each dataset
const datasets = [
  {
    label: 'Dataset 1',
    data: Array.from({ length: DATA_COUNT }, () => Math.floor(Math.random() * 100 )), // Random numbers between -100 and 100
    backgroundColor: 'rgba(255, 99, 132, 0.5)', // Red color with transparency
    stack: 'Stack 0',
  },
  {
    label: 'Dataset 2',
    data: Array.from({ length: DATA_COUNT }, () => Math.floor(Math.random() * 100 )), // Random numbers between -100 and 100
    backgroundColor: 'rgba(54, 162, 235, 0.5)', // Blue color with transparency
    stack: 'Stack 0',
  },
  {
    label: 'Dataset 3',
    data: Array.from({ length: DATA_COUNT }, () => Math.floor(Math.random() * 100 )), // Random numbers between -100 and 100
    backgroundColor: 'rgba(75, 192, 192, 0.5)', // Green color with transparency
    stack: 'Stack 1',
  },
];

// Assemble the data object
const data = {
  labels: labels,
  datasets: datasets,
};

export default function MixedBarChartComponent(){
    return <Bar options={options} data={data} />
}