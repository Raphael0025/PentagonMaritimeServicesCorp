import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register necessary Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface Batch {
    trainingMode: string;
    delivered: string | number;
}

interface BatchCourse {
    sortedBatches: Batch[];
}

interface TrainingModeChartProps {
    batchCourses: BatchCourse[];
}

export const TrainingModeChart = ({ batchCourses = [] }: TrainingModeChartProps) => {
    
    // 1. Compute the structural sums cleanly at the top layer
    const getSumForModes = (modes: string[]) => {
        return batchCourses.reduce((total, bc) => {
            return total + (bc.sortedBatches?.reduce((sum, batch) => {
                return sum + (modes.includes(batch.trainingMode) ? Number(batch.delivered || 0) : 0);
            }, 0) || 0);
        }, 0);
    };

    const f2fTotal = getSumForModes(['f2f', 'f2ft', 'f2fp']);
    const olInsTotal = getSumForModes(['ol', 'olt', 'olp']);
    const olModTotal = getSumForModes(['olm']);
    const cbtTotal = getSumForModes(['f2fm']);
    const blendedTotal = getSumForModes(['blended']);

    // 2. Calculate Global Total Sum
    const grandTotal = f2fTotal + olInsTotal + olModTotal + cbtTotal + blendedTotal;

    // 3. Helper function to safely calculate percentage string
    const getPercentage = (value: number) => {
        if (grandTotal === 0) return '0%';
        return `${((value / grandTotal) * 100).toFixed(1)}%`;
    };

    // 2. Format the configuration payload for Chart.js
    const chartData: ChartData<'pie'> = {
        labels: ['F2F', 'CBT', 'OL INS', 'OL MOD', 'BLENDED'],
        datasets: [
            {
                label: 'Delivered Trainings',
                data: [f2fTotal, cbtTotal,olInsTotal, olModTotal,  blendedTotal],
                backgroundColor: [
                    '#3182ce', // blue.500
                    '#319795', // teal.500
                    '#dd6b20', // orange.500
                    '#805ad5', // purple.500
                    '#e53e3e', // red.500
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            tooltip: {
                callbacks: {
                    // This dynamically updates the popup hover label to show the Raw Count + Percentage
                    label: function (context: any) {
                        const rawValue = context.raw || 0;
                        const percentage = getPercentage(rawValue);
                        return ` ${context.label}: ${rawValue} (${percentage})`;
                    }
                }
            },
            datalabels: {
                color: (context: any) => {
                    // Optional: Make text dark if it gets pushed out onto the white background
                    const value = context.dataset.data[context.dataIndex];
                    const percentage = (value / grandTotal) * 100;
                    return percentage < 5 ? '#333333' : '#ffffff'; 
                }, // Text color inside the pie slice
                fontWeight: 'bold',
                font: {
                    weight: 'bold' as const,
                    size: 14,
                },
                anchor: 'center' as const,
                align: (context: any) => {
                    const value = context.dataset.data[context.dataIndex];
                    const percentage = (value / grandTotal) * 100;
                    return percentage < 5 ? 'center' : 'start';
                },
                offset: (context: any) => {
                    const value = context.dataset.data[context.dataIndex];
                    const percentage = (value / grandTotal) * 100;
                    return percentage < 5 ? 8 : 0;
                },
                formatter: (value: number) => {
                    // If the slice value is 0, don't render text to keep it clean
                    if (value === 0) return ''; 
                    
                    // Return the calculated percentage to display permanently
                    return `${((value / grandTotal) * 100).toFixed(1)}%`;
                },
            },
        },
    };

    return (
        <Box mt='4' display='flex' flexDir='column' gap='6' alignItems='center'>
            {/* Original Data Grid Table View */}
            <Box maxW='100%' overflowX='auto'>
                <Box w='500px'>
                    <Text textAlign='center' fontWeight="700" border='1px solid black' borderBottom='none' p='1' bg='gray.50'>
                        MODE OF TRAINING
                    </Text>
                    <Box display='flex'>
                        <Text w='100px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600">F2F</Text>
                        <Text w='100px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600">OL INS</Text>
                        <Text w='100px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600">OL MOD</Text>
                        <Text w='100px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600">CBT</Text>
                        <Text w='100px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' fontWeight="600">BLENDED</Text>
                    </Box>
                    <Box display='flex'>
                        <Text w='100px' p='1' border='1px solid black' textAlign='center' borderRight='none'>{f2fTotal}</Text>
                        <Text w='100px' p='1' border='1px solid black' textAlign='center' borderRight='none'>{olInsTotal}</Text>
                        <Text w='100px' p='1' border='1px solid black' textAlign='center' borderRight='none'>{olModTotal}</Text>
                        <Text w='100px' p='1' border='1px solid black' textAlign='center' borderRight='none'>{cbtTotal}</Text>
                        <Text w='100px' p='1' border='1px solid black' textAlign='center'>{blendedTotal}</Text>
                    </Box>
                </Box>
            </Box>
            {/* Dynamic Pie Chart Render Box Container */}
            <Box w={{ base: '280px', md: '400px' }} h={{ base: '280px', md: '400px' }}>
                <Pie data={chartData} options={chartOptions} />
            </Box>
        </Box>
    );
};