'use client';
import React, { useMemo } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Card, CardBody, Heading, Text, Center, Spinner} from '@chakra-ui/react';

import { useCourses } from '@/context/CourseContext'
import { CourseBatchByID } from '@/types/course-batches'
import { BATCH_ANALYSIS, batchArr } from '@/types/training'

import TrainerPerformanceChart from '../BarChart/TrainerPerformanceChart'

interface InstructorDoc {
    id: string; // The doc ID
    name: string; // e.g., "Capt Cruz"
}

interface TrainerPerformanceTableProps {
    batches: BATCH_ANALYSIS[];     // This is your mapped batchCourses array passed from parent
    allInstructors: InstructorDoc[];
    courseBatch: CourseBatchByID[];            // 🟢 Pass down your raw unmapped courseBatch array context
    isLoading?: boolean;
}

export default function TrainerPerformanceTable({ batches, allInstructors, courseBatch, isLoading }: TrainerPerformanceTableProps) {
    const { data: allCourses } = useCourses()

    const trainerData = useMemo(() => {
        if (!allInstructors || !batches || !courseBatch || !allCourses) return [];

        // Initialize mapping container back to image specifications (Simulator vs Non-Simulator)
        const performanceMap: Record<string, { name: string; simulator: Set<string>; nonSimulator: Set<string> }> = {};
        
        allInstructors.forEach(ins => {
            performanceMap[ins.id] = {
                name: ins.name,
                simulator: new Set<string>(),
                nonSimulator: new Set<string>
            };
        });

        // 1. Map out raw courseBatch by id into a fast lookup dictionary
        const rawBatchLookup = new Map(courseBatch.map(b => [b.id, b]));

        // 2. Loop through your processed BATCH_ANALYSIS categories
        batches.forEach((courseCategory: BATCH_ANALYSIS) => {
            // 3. Use sortedBatches array precisely as requested
            courseCategory.sortedBatches?.forEach((subBatch: batchArr) => {
                // 4. Match batch_id directly against the raw courseBatch elements context map
                const rawBatchDoc = rawBatchLookup.get(subBatch.batch_id);
                if (!rawBatchDoc) return; // Skip if no matching contextual backend document found

                // 5. Safely harvest properties from your live DB reference document
                const instructorId = rawBatchDoc.act_ins;
                const trainingModeField = rawBatchDoc.training_mode || rawBatchDoc.training_mode || '';
                const batchMode = trainingModeField.trim().toLowerCase();
                
                // 🟢 FIX: Use rawBatchDoc.course to find the corresponding item inside allCourses
                const targetCourseId = rawBatchDoc.course;
                const matchedCourseDoc = allCourses.find((c: any) => c.id === targetCourseId);

                // Fallback timeline sequence: context shortcode -> fallback state string
                const displayCourseName = matchedCourseDoc?.course_code || courseCategory.course;

                // Safety fallback checks
                if (!instructorId || !performanceMap[instructorId] || !displayCourseName) return;

                // 6. Filter: Isolate non-modular paths strictly by target rules ('olm' and 'f2fm')
                if (['olm', 'f2fm'].includes(batchMode)) return;

                // 7. Route to the right presentation pillar utilizing your calculated metric indicators
                const isSimulator = (courseCategory.ttl_simu || 0) > 0;
                const isNonSimulator = (courseCategory.ttl_non_simu || 0) > 0;

                if (isSimulator) {
                    performanceMap[instructorId].simulator.add(displayCourseName);
                } else if (isNonSimulator) {
                    performanceMap[instructorId].nonSimulator.add(displayCourseName);
                }
            })
        })

    // Format final structure array for display to screen
    return Object.values(performanceMap)
        .map(instructor => ({
            name: instructor.name,
            simulatorText: Array.from(instructor.simulator).join(', '),
            nonSimulatorText: Array.from(instructor.nonSimulator).join(', '),
            hasData: instructor.simulator.size > 0 || instructor.nonSimulator.size > 0
        }))
        .filter(item => item.hasData);
    }, [batches, allInstructors, courseBatch]);

    if (isLoading) {
        return (
        <Center p={10}>
            <Spinner size="lg" color="blue.500" />
        </Center>
        );
    }

    return (
    <>
        <TrainerPerformanceChart batches={batches || []} allInstructors={allInstructors || []} courseBatch={courseBatch || []} />
        <Card boxShadow="none" mt='3' m="1" bg="white">
            <CardBody p="1">
                <TableContainer border="1px solid black">
                    <Table variant="simple" size="md">
                        <Thead bg="white">
                            <Tr borderBottom="2px solid black">
                                <Th w='150px' borderRight="1px solid black" color="black" fontSize="8pt" fontWeight="bold" px="3" py="0" textTransform="none">
                                    Instructor
                                </Th>
                                <Th w='250px' borderRight="1px solid black" color="black" fontSize="8pt" fontWeight="bold" px="3" py="0" textTransform="none">
                                    Simulator Courses
                                </Th>
                                <Th w='250px' color="black" fontSize="8pt" fontWeight="bold" px="3" py="0" textTransform="none">
                                    Non-Simulator Courses
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                        {trainerData.map((row, idx) => (
                            <Tr key={idx} borderBottom="1px solid black" _last={{ borderBottom: 'none' }}>
                                <Td w='150px' borderRight="1px solid black" fontSize="8pt" color="black" verticalAlign="top" px="3" py="0" whiteSpace="normal">
                                    {row.name.toUpperCase()}
                                </Td>
                                <Td w='250px' borderRight="1px solid black" fontSize="8pt" fontWeight='normal' color="gray.700" verticalAlign="top" px="3" py="0" whiteSpace="normal" letterSpacing="0.5px">
                                    {row.simulatorText.toUpperCase() || ''}
                                </Td>
                                <Td w='250px' fontSize="8pt" color="gray.700" verticalAlign="top" px="3" py="0" fontWeight='normal' whiteSpace="normal" letterSpacing="0.5px">
                                    {row.nonSimulatorText.toUpperCase() || ''}
                                </Td>
                            </Tr>
                        ))}
                        {trainerData.length === 0 && (
                            <Tr>
                                <Td colSpan={3} textAlign="center" py="4" color="gray.500" fontSize="8pt">
                                    No matching non-modular training records found.
                                </Td>
                            </Tr>
                        )}
                        </Tbody>
                    </Table>
                </TableContainer>
            </CardBody>
        </Card>
    </>
    );
}