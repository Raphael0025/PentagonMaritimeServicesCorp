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
    ttl_simu?: number;
    ttl_non_simu?: number;
    ttl_stcw?: number;
    ttl_mds?: number;
    ttl_safety?: number;
}

interface TrainingModeChartProps {
    batchCourses: BatchCourse[];
}

export const TrainingCategoryChart = ({ batchCourses = [] }: TrainingModeChartProps) => {
    
    // Inside your TrainingCategoryChart component, update this function:
    const getSumForType = (key: 'ttl_simu' | 'ttl_non_simu' | 'ttl_stcw' | 'ttl_mds' | 'ttl_safety') => {
        // Reduce through the calculated courses directly instead of digging deep into single batches
        return batchCourses.reduce((total, bc) => {
            return total + Number(bc[key] || 0);
        }, 0);
    };

    // Now assign your totals easily like this:
    const ttlSimu        = getSumForType('ttl_simu');
    const ttlNonSimu     = getSumForType('ttl_non_simu');
    const ttlSTCW        = getSumForType('ttl_stcw');
    const ttlMDS         = getSumForType('ttl_mds');
    const ttlSafetyCourses = getSumForType('ttl_safety');

    // 2. Calculate Global Total Sum
    const grandTotal = ttlSimu + ttlNonSimu + ttlSTCW + ttlMDS + ttlSafetyCourses;

    // 3. Helper function to safely calculate percentage string
    const getPercentage = (value: number) => {
        if (grandTotal === 0) return '0%';
        return `${((value / grandTotal) * 100).toFixed(1)}%`;
    };

    // 2. Format the configuration payload for Chart.js
    const chartData: ChartData<'pie'> = {
        labels: ['SIMU', 'MDS', 'NON-SIMU', 'STCW', 'SAFETY COURSES'],
        datasets: [
            {
                label: 'Delivered Trainings',
                data: [ttlSimu, ttlMDS, ttlNonSimu, ttlSTCW, ttlSafetyCourses],
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
                    return percentage < 5 ? '#000000' : '#ffffff'; 
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
                    return percentage < 5 ? 'end' : 'start';
                },
                offset: (context: any) => {
                    const value = context.dataset.data[context.dataIndex];
                    const percentage = (value / grandTotal) * 100;
                    return percentage < 5 ? 15 : 0;
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
                        TRAINING CATEGORY
                    </Text>
                    <Box display='flex'>
                        <Text w='100px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600">SIMU</Text>
                        <Text w='100px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600">NON-SIMU</Text>
                        <Text w='100px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600">STCW</Text>
                        <Text w='100px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600">MDS</Text>
                        <Text w='150px' p='1' bg='gray.100' textAlign='center' border='1px solid black' borderBottom='none' fontWeight="600">SAFETY COURSES</Text>
                    </Box>
                    <Box display='flex'>
                        <Text w='100px' p='1' border='1px solid black' textAlign='center' borderRight='none'>{ttlSimu}</Text>
                        <Text w='100px' p='1' border='1px solid black' textAlign='center' borderRight='none'>{ttlNonSimu}</Text>
                        <Text w='100px' p='1' border='1px solid black' textAlign='center' borderRight='none'>{ttlSTCW}</Text>
                        <Text w='100px' p='1' border='1px solid black' textAlign='center' borderRight='none'>{ttlMDS}</Text>
                        <Text w='150px' p='1' border='1px solid black' textAlign='center'>{ttlSafetyCourses}</Text>
                    </Box>
                </Box>
            </Box>
            {/* Dynamic Pie Chart Render Box Container */}
            <Box w={{ base: '220px', md: '310px' }} h={{ base: '220px', md: '300px' }}>
                <Pie data={chartData} options={chartOptions} />
            </Box>
        </Box>
    );
};