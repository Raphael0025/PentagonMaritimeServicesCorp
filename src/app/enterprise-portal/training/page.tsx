'use client'

import React, { useState } from 'react'
import { Box, useDisclosure, Text, Drawer, DrawerOverlay, DrawerContent } from '@chakra-ui/react';
import { EventCalendar, BatchDetails } from '@/Components/Page/Training';
import { useCourseBatch } from '@/context/BatchContext'

export default function Page(){
    const { data: courseBatch } = useCourseBatch();
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure()
    const [batchID, setBatchID] = useState<string>('')
    const [courseID, setCourseID] = useState<string>('')

    // Helper: convert "Thu, Apr 10" to "2025-04-10"
    const convertStartDate = (batchYear: number, startDate: string): string | null => {
        if (!startDate) return null;
        const [_, monthAbbr, dayStr] = startDate.split(' ');
        const day = parseInt(dayStr);
        const month = new Date(`${monthAbbr} 1, 2000`).getMonth(); // Get month index
        const year = new Date().getFullYear(); // Default to current year or improve this logic if you have the year stored elsewhere

        return `${batchYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const events = courseBatch
        ?.map((batch) => {
            const getBatchYear = batch.createdAt.toDate().getFullYear()
            const convertedDate = convertStartDate(getBatchYear, batch.start_date);
            return convertedDate
                ? { 
                    id: batch.id,
                    course: batch.course,
                    event: `Batch #${batch.batch_no}`, // this is the batch_no. field
                    date: convertedDate, // this is the start_date field
                    end_date: batch.end_date,
                    numOfDays: batch.numOfDays,
                    time_duration: batch.time_duration,
                    training_mode: batch.training_mode,
                    room: batch.room,
                    instructor: batch.instructor,
                    remarks: batch.attendance_remarks,
                }
                : null;
        })
        .filter((event): event is { 
            id: string;
            course: string;
            event: string; // this is the batch_no. field
            date: string; // this is the start_date field
            end_date: string;
            numOfDays: number;
            time_duration: string;
            training_mode: string;
            room: string;
            instructor: string;
            remarks: string;
        } => event !== null); // filter out nulls

    return (
        <>
        <Box>
            <Text textTransform='uppercase' fontWeight='bold' fontSize='lg'>Training Schedule</Text>
        </Box>
        <Box className="flex flex-col items-center justify-center h-screen">
            <EventCalendar events={events || []} setCourseID={setCourseID} setBatchID={setBatchID} onOpen={onDrawerOpen} />
        </Box>
        <Drawer isOpen={isDrawerOpen} closeOnOverlayClick={false} placement='right' onClose={onDrawerClose} size='lg'>
            <DrawerOverlay />
            <DrawerContent>
                <BatchDetails batchID={batchID} courseID={courseID} onClose={onDrawerClose} />
            </DrawerContent> 
        </Drawer>
        </>
    );
}