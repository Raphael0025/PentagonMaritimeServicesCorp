import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  chartData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  title: string;
}

const PieChart: React.FC<PieChartProps> = ({ chartData, title }) => {
  // Default chart data
  const defaultChartData = {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 0,
    }],
  };

  return (
    <div className='p-2 shadow-md flex flex-col space-y-2 items-center rounded justify-center border border-slate-500' style={{width: '300px'}}>
      <h2 className='font-large text-start w-full' style={{fontSize: '12px', color: '#a1a1a1'}}>{`${title}`}</h2>
      <Doughnut
        style={{width: '200px', height: '300px'}}
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
        data={chartData || defaultChartData}
      />
    </div>
  );
}

export default PieChart;