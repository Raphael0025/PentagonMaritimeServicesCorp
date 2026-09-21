'use client';
import React, { useMemo } from 'react';
import { Card, CardBody, Heading, Center, Spinner, Box } from '@chakra-ui/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // For drawing numbers on top of bars

import { useCourses } from '@/context/CourseContext';
import { CourseBatchByID } from '@/types/course-batches';
import { BATCH_ANALYSIS, batchArr } from '@/types/training';

// Register necessary Chart.js modules and the datalabels plugin
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels
);

interface InstructorDoc {
    id: string;
    name: string;
}

interface TrainerPerformanceChartProps {
    batches: BATCH_ANALYSIS[];
    allInstructors: InstructorDoc[];
    courseBatch: CourseBatchByID[];
    isLoading?: boolean;
}

export default function TrainerPerformanceChart({ batches, allInstructors, courseBatch, isLoading }: TrainerPerformanceChartProps) {
    const { data: allCourses } = useCourses();

    const chartDataComputed = useMemo(() => {
        if (!allInstructors || !batches || !courseBatch || !allCourses) return null;

        const performanceMap: Record<string, { name: string; simulator: number; nonSimulator: number }> = {};
        
        allInstructors.forEach(ins => {
            performanceMap[ins.id] = {
                name: ins.name.toUpperCase(), // Match original image's uppercase names
                simulator: 0,
                nonSimulator: 0
            }
        })

        const rawBatchLookup = new Map(courseBatch.map(b => [b.id, b]));

        batches.forEach((courseCategory: BATCH_ANALYSIS) => {
            courseCategory.sortedBatches?.forEach((subBatch: batchArr) => {
                const rawBatchDoc = rawBatchLookup.get(subBatch.batch_id);
                if (!rawBatchDoc) return; 

                const instructorId = rawBatchDoc.act_ins;
                const trainingModeField = rawBatchDoc.training_mode || '';
                const batchMode = trainingModeField.trim().toLowerCase();
                
                const targetCourseId = rawBatchDoc.course;
                const matchedCourseDoc = allCourses.find((c: any) => c.id === targetCourseId);
                const displayCourseName = matchedCourseDoc?.course_code || courseCategory.course;

                if (!instructorId || !performanceMap[instructorId] || !displayCourseName) return;

                // Keep non-modular paths matching your exclusion rule
                if (['olm', 'f2fm'].includes(batchMode)) return;

                const isSimulator = (courseCategory.ttl_simu || 0) > 0;
                const isNonSimulator = (courseCategory.ttl_non_simu || 0) > 0;

                if (isSimulator) {
                    performanceMap[instructorId].simulator += 1;
                } else if (isNonSimulator) {
                    performanceMap[instructorId].nonSimulator += 1;
                }
            })
        })

        // Format fields specifically into separate arrays required by Chart.js config arrays
        const activeTrainers = Object.values(performanceMap).filter(item => item.simulator > 0 || item.nonSimulator > 0);
        
        return {
        labels: activeTrainers.map(t => t.name),
        datasets: [
            {
                label: 'SIMULATOR',
                data: activeTrainers.map(t => t.simulator),
                backgroundColor: '#5B9BD5', // Blue color profile matching image
                barThickness: 20,
            },
            {
                label: 'NON-SIMULATOR',
                data: activeTrainers.map(t => t.nonSimulator),
                backgroundColor: '#ED7D31', // Orange color profile matching image
                barThickness: 20,
            }
        ]
        };
    }, [batches, allInstructors, courseBatch, allCourses]);

    // Chart options to precisely control structural rendering aesthetics
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'center' as const,
                labels: {
                    usePointStyle: false, // Renders clean square box icons
                    boxWidth: 14,
                    boxHeight: 14,
                    font: {
                        size: 11,
                        weight: 'bold' as const,
                    },
                    color: '#4A5568'
                }
            },
            tooltip: {
                enabled: true,
            },
            // 🟢 Handles printing value counters directly over bar pillars
            datalabels: {
                anchor: 'end' as const,
                align: 'top' as const,
                color: '#4A5568',
                font: {
                    weight: 'bold' as const,
                    size: 11
                },
                // Don't draw numbers for zeros to maintain clean visual space
                formatter: (value: number) => (value > 0 ? value : '') 
            }
        },
        scales: {
            x: {
                grid: {
                    display: false, // Turn off vertical gridlines
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
            },
            y: {
                grid: {
                    color: '#E2E8F0', // Light grey horizontal gridlines
                },
                ticks: {
                    color: '#718096',
                    precision: 0, // Enforce integers only on counts axis
                },
                border: {
                    color: '#CBD5E1'
                },
                suggestedMax: 16 // Leaves breathing room at top for highest performance value
            }
        }
    }

    if (isLoading) {
        return (
            <Center p={10}>
                <Spinner size="lg" color="blue.500" />
            </Center>
        );
    }

    return (
        <Card boxShadow="none" mt='5' m="1" bg="white">
            <CardBody p="1">
                <Heading fontSize='9pt' mb="2" fontWeight="bold" color="gray.700" textAlign="center" textTransform="uppercase" letterSpacing="1px">
                    {`Trainer's Performance Highlight`}
                </Heading>
                <Box h="200px" w="100%">
                {chartDataComputed && (
                    <Bar data={chartDataComputed} options={options} />
                )}
                </Box>
            </CardBody>
        </Card>
    )
}