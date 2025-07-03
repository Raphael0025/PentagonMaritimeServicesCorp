'use client'

import React, { useState } from 'react';
import {
    Box, Text, Button, Select, Grid, GridItem, useDisclosure,
    Modal, ModalCloseButton, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter
} from '@chakra-ui/react';
import { PrevIcon, NextIcon2 } from '@/Components/SideIcons';
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'

interface ComponentProps {
    setBatchID: (id: string) => void;
    setCourseID: (id: string) => void;
    onOpen: () => void;
    events: { 
        id: string;
        course: string;
        event: string; //this is the batch_no field
        date: string; // this is the start_date field
        end_date: string;
        numOfDays: number;
        time_duration: string;
        training_mode: string;
        room: string;
        instructor: string;
        remarks: string;
    }[];
}

export default function EventCalendar({ events, setCourseID, setBatchID, onOpen }: ComponentProps) {
    const { data: allCourses } = useCourses()
    const { data: courseCodes } = useClients()

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<{ date: string; event: string } | null>(null);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const days = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, index) => {
        const day = index - firstDayOfMonth + 1;
        return day > 0 && day <= daysInMonth ? day : null;
    });

    const formatDate = (year: number, month: number, day: number) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value, 10);
        setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value, 10);
        setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
    };

    const handleNextMonth = () => {
        setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
    };

    const handlePreviousMonth = () => {
        setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
    };

    const handleEventClick = (event: { date: string; event: string }) => {
        setSelectedEvent(event);
        onOpen();
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" height="100%" width="100%" p={4}>
            <Box display='flex' justifyContent='space-between' alignItems='center' w='100%'>
                <Box display="flex" justifyContent="center" alignItems="center" mb={4} gap={4}>
                    <Button shadow='md' size="sm" onClick={handlePreviousMonth}>
                        <PrevIcon size={'24'} color={'#575757'} />
                    </Button>
                    <Select shadow='md' value={currentDate.getMonth()} onChange={handleMonthChange} width="150px">
                        {Array.from({ length: 12 }, (_, index) => (
                            <option key={index} value={index}>
                                {new Date(0, index).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </Select>
                    <Select shadow='md' value={currentDate.getFullYear()} onChange={handleYearChange} width="100px">
                        {Array.from({ length: 21 }, (_, index) => {
                            const year = currentDate.getFullYear() - 10 + index;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </Select>
                    <Button shadow='md' size="sm" onClick={handleNextMonth}>
                        <NextIcon2 size='24' color={'#575757'} />
                    </Button>
                </Box>
                <Text fontSize="xl" fontWeight="bold" textAlign="center">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
            </Box>
            <Grid borderTop='1px solid gray' pt='2' templateColumns="repeat(7, 1fr)" gap={2} flex="1" width="100%" maxHeight="calc(100% - 100px)" overflowY="auto">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} h='0px' fontSize='medium' w='100%' textAlign="center" fontWeight="bold">
                        {day}
                    </Text>
                ))}
                {days.map((day, index) => {
                    const formattedDate = day ? formatDate(currentDate.getFullYear(), currentDate.getMonth(), day) : '';
                    const dayEvents = day
                        ? events.filter((event) => event.date === formattedDate)
                        : [];
                    return (
                        <GridItem shadow='md' key={index} h="auto" minH="80px" display="flex" flexDirection="column" justifyContent="flex-start" bg="gray.200" borderRadius="md" border="1px solid" borderColor="gray.300" position="relative" p={2}>
                            {day && (
                                <Text fontSize="xs" fontWeight="bold" position="absolute" top="2px" border='1px solid black' borderRight='none' borderTop='none' right="1px" p='2'>
                                    {day}
                                </Text>
                            )}
                            <Box mt={4}>
                                {dayEvents.map((event) => {
                                    const courseObj = allCourses?.find((course) => course.id === event.course) || []
                                    return(
                                        <Box key={event.id} as="button" onClick={() => { setCourseID(courseObj.id); setBatchID(event.id); onOpen(); }} textAlign="left" w="100%">
                                            <Text as='span' textTransform='uppercase' display='flex' className='hover:underline underline-offset-2' fontSize="xs" color="blue.600" fontWeight="medium" mb={1}>
                                                {`${courseObj?.course_code ?? ''} ${event.event}`}
                                            </Text>
                                        </Box>
                                    )
                                })}
                            </Box>
                        </GridItem>
                    );
                })}
            </Grid>

        </Box>
    );
}
