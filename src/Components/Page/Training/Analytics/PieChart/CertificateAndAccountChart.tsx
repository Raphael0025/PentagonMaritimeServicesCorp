import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { Pie } from 'react-chartjs-2';
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

export const CertificateAndAccountChart = ({ trainingData = [] }: CertificateAndAccountChartProps) => {
    
    // 1. Filter data exactly using your specified business rules
    const filteredData = trainingData.filter(t => t.batch !== '1' && t.regType === 0);

    // 2. Extract your distinct metrics
    const traineeChargeCount = filteredData.filter(t => t.accountType === 0).length;
    const companyChargeCount = filteredData.filter(t => t.accountType === 1).length;
    const ttlPending         = filteredData.filter(t => t.cert_status === 0).length;
    const ttlUnClaimed       = filteredData.filter(t => t.cert_status === 1).length;
    const ttlReleased        = filteredData.filter(t => t.cert_status === 2).length;

    // We can show two separate pie charts side-by-side or a clean breakdown!
    // Let's configure two datasets/charts so you get an exact view of both metrics cleanly.

    const createChartData = (labels: string[], data: number[], colors: string[]): ChartData<'pie'> => ({
        labels,
        datasets: [
            {
                data,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2,
            },
        ],
    });

    const accountChartData = createChartData(
        ['TRAINEE CHARGE', 'COMPANY CHARGE'],
        [traineeChargeCount, companyChargeCount],
        ['#3182ce', '#319795'] // Blue, Teal
    );

    const certChartData = createChartData(
        ['RELEASED', 'PENDING', 'UNCLAIMED'],
        [ttlReleased, ttlPending, ttlUnClaimed],
        ['#38a169', '#dd6b20', '#3182ce'] // Green, Red
    );

    const getChartOptions = (totalSum: number) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const val = context.raw || 0;
                        const pct = totalSum === 0 ? '0%' : `${((val / totalSum) * 100).toFixed(1)}%`;
                        return ` ${context.label}: ${val} (${pct})`;
                    }
                }
            },
            datalabels: {
                color: (context: any) => {
                    const val = context.dataset.data[context.dataIndex];
                    const pct = totalSum === 0 ? 0 : (val / totalSum) * 100;
                    return pct < 5 ? '#333333' : '#ffffff';
                },
                font: { weight: 'bold' as const, size: 14 },
                anchor: 'center' as const,
                align: (context: any) => {
                    const val = context.dataset.data[context.dataIndex];
                    const pct = totalSum === 0 ? 0 : (val / totalSum) * 100;
                    return pct < 5 ? 'end' : 'start';
                },
                offset: (context: any) => {
                    const val = context.dataset.data[context.dataIndex];
                    const pct = totalSum === 0 ? 0 : (val / totalSum) * 100;
                    return pct < 5 ? 10 : 0;
                },
                formatter: (value: number) => {
                    if (value === 0) return '';
                    return totalSum === 0 ? '0%' : `${((value / totalSum) * 100).toFixed(1)}%`;
                }
            }
        }
    });

    const totalAccounts = traineeChargeCount + companyChargeCount;
    const totalCerts = ttlReleased + ttlPending + ttlUnClaimed;

    return (
        <Box mt='6' display='flex' flexDir='column' gap='8' alignItems='center' w='100%'>
            {/* Split Grid Layout for Metrics summary table */}
            <Box maxW='100%' overflowX='auto'>
                <Box w='900px' display='flex' flexDir='column' border='1px solid black'>
                    <Text textAlign='center' fontWeight="700" p='2' bg='gray.50' borderBottom='1px solid black'>
                        CERTIFICATES & ACCOUNT TYPES OVERVIEW
                    </Text>
                    <Box display='flex' bg='gray.100' fontWeight="600" fontSize="13px" borderBottom='1px solid black' textAlign='center'>
                        <Text w='200px' p='1' borderRight='1px solid black'>CREW CHARGE</Text>
                        <Text w='200px' p='1' borderRight='1px solid black'>COMPANY CHARGE</Text>
                        <Text w='150px' p='1' borderRight='1px solid black'>RELEASED CERT</Text>
                        <Text w='150px' p='1' borderRight='1px solid black'>PENDING CERT</Text>
                        <Text w='200px' p='1'>UNCLAIMED CERT</Text>
                    </Box>
                    <Box display='flex' textAlign='center' fontSize="14px">
                        <Text w='200px' p='2' borderRight='1px solid black'>
                            {traineeChargeCount} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalAccounts ? ((traineeChargeCount/totalAccounts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                        <Text w='200px' p='2' borderRight='1px solid black'>
                            {companyChargeCount} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalAccounts ? ((companyChargeCount/totalAccounts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                        <Text w='150px' p='2' borderRight='1px solid black'>
                            {ttlReleased} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalCerts ? ((ttlReleased/totalCerts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                        <Text w='150px' p='2' borderRight='1px solid black'>
                            {ttlPending} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalCerts ? ((ttlPending/totalCerts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                        <Text w='200px' p='2'>
                            {ttlUnClaimed} <Box as="span" color="gray.500" display="block" fontSize="11px">({totalCerts ? ((ttlUnClaimed/totalCerts)*100).toFixed(1) : 0}%)</Box>
                        </Text>
                    </Box>
                </Box>
            </Box>
            {/* Displaying both distinct Pie Charts dynamically side-by-side */}
            <Box display='flex' flexDir={{ base: 'column', md: 'row' }} gap='8' justifyContent='center' w='100%'>
                <Box w='400px' h='440px' textAlign='center'>
                    <Text fontWeight='600' mb='2' fontSize='14px'>CERTIFICATE CHARGED TO</Text>
                    <Box h='400px'>
                        <Pie data={accountChartData} options={getChartOptions(totalAccounts)} />
                    </Box>
                </Box>
                <Box w='400px' h='440px' textAlign='center'>
                    <Text fontWeight='600' mb='2' fontSize='14px'>CERTIFICATE STATUS</Text>
                    <Box h='400px'>
                        <Pie data={certChartData} options={getChartOptions(totalCerts)} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};