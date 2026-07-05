'use client';
import React from 'react';
import { Box, SimpleGrid, Heading, Text, Card, CardBody } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register standard Chart.js extensions and the floating data labels plugin
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

// Define TypeScript interfaces for your prop safety
interface InstructorMetrics {
    f2fTrainees: number;
    onlineTrainees: number;
    blendedTrainees: number;
}

interface CategoryTemplate {
    withInstructor: InstructorMetrics;
    withoutInstructor: InstructorMetrics;
}

interface TrainingDashboardChartsProps {
    tableData: {
        simulator: CategoryTemplate;
        nonSimulator: CategoryTemplate;
        stcw: any;
        mds: any;
    }
}

export default function SimuVsNonSimu({ tableData }: TrainingDashboardChartsProps) {
  // 1. Fallback safety: Ensure tableData exists before mapping properties
    if (!tableData) {
        return <Text color="gray.500" fontSize="sm">Awaiting chart telemetry metrics...</Text>;
    }

    /* ==========================================================================
        DYNAMIC DATA EXTRACTION (From your parsed matrix state)
     ========================================================================== */

  // 🟢 Extract Simulator Trainee Values for "DATED" column rows
    const simWithInstructorDated = 
        (tableData.simulator.withInstructor?.f2fTrainees || 0) + 
        (tableData.simulator.withInstructor?.onlineTrainees || 0) + 
        (tableData.simulator.withInstructor?.blendedTrainees || 0);

    const simWithoutInstructorDated = 
        (tableData.simulator.withoutInstructor?.f2fTrainees || 0) + 
        (tableData.simulator.withoutInstructor?.onlineTrainees || 0) + 
        (tableData.simulator.withoutInstructor?.blendedTrainees || 0);

    // 🟢 Extract Non-Simulator Trainee Values for "DATED" column rows
    const nonSimWithInstructorDated = 
        (tableData.nonSimulator.withInstructor?.f2fTrainees || 0) + 
        (tableData.nonSimulator.withInstructor?.onlineTrainees || 0) + 
        (tableData.nonSimulator.withInstructor?.blendedTrainees || 0);

    const nonSimWithoutInstructorDated = 
        (tableData.nonSimulator.withoutInstructor?.f2fTrainees || 0) + 
        (tableData.nonSimulator.withoutInstructor?.onlineTrainees || 0) + 
        (tableData.nonSimulator.withoutInstructor?.blendedTrainees || 0);

    /* ==========================================================================
        CHART.JS DATA & OBJECTS GENERATION
     ========================================================================== */

    const simulatorChartData = {
        labels: ['Instructor', 'Non-Instructor'],
        datasets: [
            {
                label: 'Trainees',
                data: [simWithInstructorDated, simWithoutInstructorDated], // Dynamic index 0, hardcoded index 1 matching image placeholder
                backgroundColor: ['#5D9CEC', '#FC6E51'],          // Soft Sky Blue
                barThickness: 45,
            },
        ],
    };

    const nonSimulatorChartData = {
        labels: ['Instructor', 'Non-Instructor'],
        datasets: [
            {
                label: 'Trainees',
                data: [nonSimWithInstructorDated, nonSimWithoutInstructorDated], 
                backgroundColor: ['#5D9CEC', '#FC6E51'],
                barThickness: 45,
            }
        ],
    }

    // Reusable configuration settings for clean, gridless layout look
    const createChartOptions = (maxConfigValue: number) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Hides standard top legend block
            },
            tooltip: {
                enabled: true,
            },
            // 🟢 Display absolute numerical strings perfectly pinned right above the individual bars
            datalabels: {
                display: true,
                align: 'top' as const,
                anchor: 'end' as const,
                offset: 4,
                color: '#718096',
                font: {
                    size: 12,
                    weight: 500,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false, // Removes vertical columns gridlines
                },
                border: {
                    color: '#cbd5e0', // Subtle bottom timeline axis baseline color
                },
                ticks: {
                    color: '#718096',
                    font: {
                        size: 12,
                        weight: 500,
                    },
                },
            },
            y: {
                display: false, // Disables standard numbers scale lines on left side entirely
                max: maxConfigValue, // Height buffer margin preventing label clipping boundaries
            },
        },
    })

    return (
        <Box width="100%" display='flex' justifyContent='center'>
            {/* CHART A: SIMULATOR PANEL */}
            <Card bg="white">
                <CardBody p="2">
                    <Heading size="md" textAlign="center" color="#4a4a4a" mb="2" fontSize='10pt' letterSpacing="1px">
                    SIMULATOR
                    </Heading>
                    <Box h="450px" w="100%">
                        <Bar data={simulatorChartData} options={createChartOptions(Math.max(simWithInstructorDated, simWithoutInstructorDated) + 15)} />
                    </Box>
                </CardBody>
            </Card>
            {/* CHART B: NON-SIMULATOR PANEL */}
            <Card bg="white">
                <CardBody p="2">
                    <Heading size="md" textAlign="center" color="#4a4a4a" mb="2" fontSize='10pt' letterSpacing="1px">
                        NON-SIMULATOR
                    </Heading>
                    <Box h="450px" w="100%">
                        <Bar data={nonSimulatorChartData} options={createChartOptions(Math.max(nonSimWithInstructorDated, nonSimWithoutInstructorDated) + 30)} />
                    </Box>
                </CardBody>
            </Card>
        </Box>
    )
}