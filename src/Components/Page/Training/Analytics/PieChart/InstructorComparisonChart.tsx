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

export const InstructorComparisonChart = ({ batchCourses = [] }: TrainingModeChartProps) => {
    
    // 1. Core utility runner to fetch training modes
    const getSumForModes = (modes: string[]) => {
        return batchCourses.reduce((total, bc) => {
            return total + (bc.sortedBatches?.reduce((sum, batch) => {
                return sum + (modes.includes(batch.trainingMode) ? Number(batch.delivered || 0) : 0);
            }, 0) || 0);
        }, 0);
    };

    // 2. Map metrics into the two clean target classifications
    const instructorTotal = getSumForModes(['f2f', 'f2ft', 'f2fp', 'ol', 'olt', 'olp', 'blended']); // F2F + OL Instructor-led
    const nonInstructorTotal = getSumForModes(['olm', 'f2fm']); // Modules + CBT

    // 3. Define the relative denominators
    const grandTotal = instructorTotal + nonInstructorTotal;

    const getPercentage = (value: number) => {
        if (grandTotal === 0) return '0%';
        return `${((value / grandTotal) * 100).toFixed(1)}%`;
    };

    // 4. Update Chart Data Structure to only use 2 Datasets
    const chartData: ChartData<'pie'> = {
        labels: ['INSTRUCTOR', 'NON-INSTRUCTOR'],
        datasets: [
            {
                label: 'Delivered Trainings',
                data: [instructorTotal, nonInstructorTotal],
                backgroundColor: [
                    '#3182ce', // INSTRUCTOR -> blue.500
                    '#dd6b20', // NON-INSTRUCTOR -> orange.500
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
                <Box w='440px'>
                    <Text textAlign='center' fontWeight="700" border='1px solid black' borderBottom='none' p='1' bg='gray.50'>
                        INSTRUCTOR VS NON-INSTRUCTOR
                    </Text>
                    <Box display='flex' bg='gray.100'>
                        <Text w='220px' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600" fontSize="13px">INSTRUCTOR</Text>
                        <Text w='220px' textAlign='center' border='1px solid black' borderBottom='none' fontWeight="600" fontSize="13px">NON-INSTRUCTOR</Text>
                    </Box>
                    <Box display='flex'>
                        <Text w='220px' display='flex' alignItems='center' justifyContent='center' gap='3' border='1px solid black' textAlign='center' borderRight='none' p='2' fontSize="14px">
                            {instructorTotal}
                            <Text as="span" color="gray.500" display="block" fontSize="11px">({getPercentage(instructorTotal)})</Text>
                        </Text>
                        <Text w='220px' display='flex' alignItems='center' justifyContent='center' gap='3' border='1px solid black' textAlign='center' p='2' fontSize="14px">
                            {nonInstructorTotal}
                            <Text as="span" color="gray.500" display="block" fontSize="11px">({getPercentage(nonInstructorTotal)})</Text>
                        </Text>
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