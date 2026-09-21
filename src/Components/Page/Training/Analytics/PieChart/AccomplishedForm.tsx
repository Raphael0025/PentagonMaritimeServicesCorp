import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register necessary Chart.js modules
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface BatchCourse {
    delivered: string | number;
    cancelled: string | number;
    non_appearance: string | number;
    [key: string]: any; // Allows dynamic indexing safely
}

interface AccomplishedFormProps {
    batchCourses: BatchCourse[];
}

export const AccomplishedForm = ({ batchCourses = [] }: AccomplishedFormProps) => {
    
    // FIXED: Added explicitly typed accumulator ': number' to resolve ts(7006)
    const getSumForType = (key: 'delivered' | 'cancelled' | 'non_appearance') => {
        return batchCourses.reduce((total: number, bc) => {
            const batchSum = bc.sortedBatches?.reduce((sum: number, batch: { [x: string]: any; }) => {
                return sum + Number(batch[key] || 0);
            }, 0) || 0;
            return total + batchSum;
        }, 0);
    }

    // 2. Assign totals
    const d  = getSumForType('delivered');
    const na = getSumForType('non_appearance');
    const c  = getSumForType('cancelled');

    // 3. Define the relative denominators
    const grandTotal = d + na + c;

    const getPercentage = (value: number) => {
        if (grandTotal === 0) return '0%';
        return `${((value / grandTotal) * 100).toFixed(1)}%`;
    };

    // 4. Update Chart Data Structure to use the 3 targets
    const chartData: ChartData<'pie'> = {
        labels: ['DELIVERED', 'NON-APPEARANCE', 'CANCELLED'],
        datasets: [
            {
                label: 'Status Distribution',
                data: [d, na, c],
                backgroundColor: [
                    '#3182ce', // DELIVERED -> blue.500
                    '#dd6b20', // NON-APPEARANCE -> orange.500
                    '#e53e3e', // CANCELLED -> red.500
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const rawValue = context.raw || 0;
                        const percentage = getPercentage(rawValue);
                        return ` ${context.label}: ${rawValue} (${percentage})`;
                    }
                }
            },
            datalabels: {
                color: (context: any) => {
                    const value = context.dataset.data[context.dataIndex];
                    const percentage = (value / grandTotal) * 100;
                    return percentage < 5 ? '#333333' : '#ffffff'; 
                }, 
                font: {
                    weight: 'bold' as const,
                    size: 13,
                },
                anchor: 'end' as const, // Spreads labels outward
                align: (context: any) => {
                    const value = context.dataset.data[context.dataIndex];
                    const percentage = (value / grandTotal) * 100;
                    return percentage < 5 ? 'end' : 'start';
                },
                offset: (context: any) => {
                    const value = context.dataset.data[context.dataIndex];
                    const percentage = (value / grandTotal) * 100;
                    return percentage < 5 ? 10 : 0;
                },
                formatter: (value: number) => {
                    if (value === 0) return ''; 
                    return `${((value / grandTotal) * 100).toFixed(1)}%`;
                },
            },
        },
    };

    return (
        <Box mt='4' display='flex' flexDir='column' gap='6' alignItems='center'>
            {/* Table View */}
            <Box maxW='100%' overflowX='auto'>
                <Box w='510px'>
                    <Text textAlign='center' fontWeight="700" border='1px solid black' borderBottom='none' p='1' bg='gray.50'>
                        TRAINING STATUS ACCOMPLISHMENT
                    </Text>
                    <Box display='flex' bg='gray.100'>
                        <Text w='170px' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600" fontSize="13px">DELIVERED</Text>
                        <Text w='170px' textAlign='center' border='1px solid black' borderBottom='none' borderRight='none' fontWeight="600" fontSize="13px">NON-APPEARANCE</Text>
                        <Text w='170px' textAlign='center' border='1px solid black' borderBottom='none' fontWeight="600" fontSize="13px">CANCELLED</Text>
                    </Box>
                    <Box display='flex'>
                        <Text w='170px' display='flex' gap='3' alignItems='center' justifyContent='center' border='1px solid black' textAlign='center' borderRight='none' p='2' fontSize="14px">
                            {d}
                            <Text as="span" color="gray.500" fontSize="11px">({getPercentage(d)})</Text>
                        </Text>
                        <Text w='170px' display='flex' gap='3' alignItems='center' justifyContent='center' border='1px solid black' textAlign='center' borderRight='none' p='2' fontSize="14px">
                            {na}
                            <Text as="span" color="gray.500" fontSize="11px">({getPercentage(na)})</Text>
                        </Text>
                        <Text w='170px' display='flex' gap='3' alignItems='center' justifyContent='center' border='1px solid black' textAlign='center' p='2' fontSize="14px">
                            {c}
                            <Text as="span" color="gray.500" fontSize="11px">({getPercentage(c)})</Text>
                        </Text>
                    </Box>
                </Box>
            </Box>
            {/* Render Canvas Container */}
            <Box w={{ base: '220px', md: '310px' }} h={{ base: '220px', md: '300px' }}>
                <Pie data={chartData} options={chartOptions} />
            </Box>
        </Box>
    );
};