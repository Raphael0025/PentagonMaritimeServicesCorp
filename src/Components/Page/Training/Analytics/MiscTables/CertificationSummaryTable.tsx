import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// Interface matching your data block shape
interface TrainingData {
    batch: string;
    regType: number;
    accountType: number;
    cert_status: number;
    [key: string]: any;
}

interface CertificateAndAccountChartProps {
    trainingData: TrainingData[];
}

export const CertificationSummaryTable = ({ trainingData = [] }: CertificateAndAccountChartProps) => {
    
    // 1. Filter data exactly using your specified business rules
    const filteredData = trainingData.filter(t => t.batch !== '1' && t.regType === 0);

    // 2. Extract your distinct metrics
    const traineeChargeCount = filteredData.filter(t => t.accountType === 0).length;
    const companyChargeCount = filteredData.filter(t => t.accountType === 1).length;
    const ttlPending         = filteredData.filter(t => t.cert_status === 0).length;
    const ttlUnClaimed       = filteredData.filter(t => t.cert_status === 1).length;
    const ttlReleased        = filteredData.filter(t => t.cert_status === 2).length;

    const totalAccounts = traineeChargeCount + companyChargeCount;
    const totalCerts = ttlReleased + ttlPending + ttlUnClaimed;

    const certChartData = {
        labels: ['TOTAL PROCESSED', 'ISSUED', 'UN-CLAIMED', 'PENDING', 'TRAINEE CHARGE', 'COMPANY CHARGE'],
        datasets: [
            {
                label: 'Certificates',
                data: [totalCerts, ttlReleased, ttlUnClaimed, ttlPending, traineeChargeCount, companyChargeCount], // Dynamic index 0, hardcoded index 1 matching image placeholder
                backgroundColor: ['#38a169', '#dd6b20', '#FC6E51', '#3182ce', '#319795'],          // Soft Sky Blue
                barThickness: 20,
            },
        ],
    };

    // Reusable configuration settings for clean, gridless layout look
    const createChartOptions = () => ({
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
            },
            // 🟢 Display absolute numerical strings perfectly pinned right above the individual bars
            datalabels: {
                anchor: 'end' as const,
                align: 'right' as const,
                color: '#718096',
                font: {
                    size: 11,
                    weight: 500,
                },
                formatter: (value: number) => (value > 0 ? value : ''),
            },
        },
        scales: {
            x: {
                grid: {
                    color: '#E2E8F0', // Removes vertical columns gridlines
                },
                ticks: {
                    color: '#718096',
                    precision: 0,
                },
                border: {
                    color: '#cbd5e0', // Subtle bottom timeline axis baseline color
                },
            },
            y: {
                grid: {
                    display: false, // Turn off horizontal dividers across name profiles
                },
                ticks: {
                    color: '#4A5568',
                    font: {
                        size: 10,
                        weight: 'bold' as const
                    }
                },
                border: {
                    color: '#CBD5E1'
                }
            }
        },
    })

    return (
        <Box mt='2' display='flex' flexDir='column' gap='2' alignItems='center' w='100%'>
            <Box>
                <Text fontWeight='700' fontSize='lg'>SUMMARY OVERVIEW ANALYSIS</Text>
                <Text display='inline' w='100%' fontSize='10pt' fontWeight='normal'>
                    A total of <Text as='span' fontWeight='bold'>{ ` ${totalCerts} `}</Text>certificates were processed, with 
                    <Text as='span' fontWeight='bold'>{ ` ${ttlReleased} issued `}</Text>, 
                    <Text as='span' fontWeight='bold'>{ ` ${ttlPending} pending `}</Text>, and
                    <Text as='span' fontWeight='bold'>{ ` ${ttlUnClaimed} unclaimed `}</Text>. Among these, 
                    <Text as='span' fontWeight='bold'>{ ` ${traineeChargeCount} `}</Text> were charged to trainees and  
                    <Text as='span' fontWeight='bold'>{ ` ${companyChargeCount} `}</Text> to company-related transactions.
                </Text>
            </Box>
            {/* Split Grid Layout for Metrics summary table */}
            <Box maxW='100%' overflowX='auto'>
                <Box w='750px' display='flex' flexDir='column' border='1px solid black'>
                    <Box display='flex' bg='gray.100' fontWeight="600" fontSize="8pt" borderBottom='1px solid black' textAlign='center'>
                        <Text w='200px' p='1' borderRight='1px solid black'>TOTAL PROCESSED</Text>
                        <Text w='200px' p='1' borderRight='1px solid black'>ISSUED CERT</Text>
                        <Text w='200px' p='1' borderRight='1px solid black'>PENDING CERT</Text>
                        <Text w='200px' p='1' borderRight='1px solid black'>UNCLAIMED CERT</Text>
                        <Text w='200px' p='1' borderRight='1px solid black'>TRAINEE</Text>
                        <Text w='200px' p='1' >COMPANY</Text>
                    </Box>
                    <Box display='flex' textAlign='center' fontSize="8pt">
                        <Text w='200px' p='2' display='flex' alignItems='center' justifyContent='center' gap='2' borderRight='1px solid black'>
                            {totalCerts} 
                        </Text>
                        <Text w='200px' p='2' display='flex' alignItems='center' justifyContent='center' gap='2' borderRight='1px solid black'>
                            {ttlReleased} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalCerts ? ((ttlReleased/totalCerts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                        <Text w='200px' p='2' display='flex' alignItems='center' justifyContent='center' gap='2' borderRight='1px solid black'>
                            {ttlPending} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalCerts ? ((ttlPending/totalCerts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                        <Text w='200px' p='2' display='flex' alignItems='center' justifyContent='center' gap='2' borderRight='1px solid black'>
                            {ttlUnClaimed} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalCerts ? ((ttlUnClaimed/totalCerts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                        <Text w='200px' p='2' display='flex' alignItems='center' justifyContent='center' gap='2' borderRight='1px solid black'>
                            {traineeChargeCount} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalAccounts ? ((traineeChargeCount/totalAccounts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                        <Text w='200px' p='2' display='flex' alignItems='center' justifyContent='center' gap='2' >
                            {companyChargeCount} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalAccounts ? ((companyChargeCount/totalAccounts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                    </Box>
                </Box>
            </Box>
            {/* Displaying both distinct Pie Charts dynamically side-by-side */}
            <Box w='100%' h='250px'>
                <Bar data={certChartData} options={createChartOptions()} />
            </Box>
        </Box>
    );
};