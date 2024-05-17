import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: { sample: string; sample1?: number; sample2?: number }[];
  title: string;
}

export default function PieChart() {
  // if (!data || !Array.isArray(data) || data.length === 0) {
  //   // Handle the case when data is undefined, not an array, or an empty array
  //   return <div>No data available</div>;
  // }

  const chartData = {
    labels: ['sample 1', 'sample 2', 'sample 3', 'sample 4', 'sample 5'],
    datasets: [
      {
        label: 'Trainee Classification',
        data: [20, 25, 30, 40, 60],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className='p-2 w-5/12 flex flex-col space-y-2 items-center rounded justify-center border border-slate-500'>
      <h2 className='font-medium text-start text-base'>{`Trainee Classification`}</h2>
      <Doughnut
        className='w-full'
        options={{
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'black',
              },
            },
          },
        }}
        data={chartData}
      />
    </div>
  );
}