'use client'

import React, { useState } from 'react'
import { Box, Text, FormControl, Button, } from '@chakra-ui/react'
import DatePicker from 'react-datepicker'

interface TabProps{
    setSched: (value: string) => void
}

export default function TrainingCalendar({setSched}: TabProps){

    const [start_date, setStartDate] = useState<Date | null>(new Date())
    const [end_date, setEndDate] = useState<Date | null>(new Date())

    const onChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    }

    const handleSchedule = () => {
        const startDateStr = start_date
        ? new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
        }).format(start_date)
        : '';
    
        const endDateStr = end_date
        ? new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
        }).format(end_date)
        : '';

        if(end_date === null || startDateStr === endDateStr){ // 1 day training | opt 1
            setSched(startDateStr)
        } else if (startDateStr !== endDateStr){ // 1 day training | opt 2
            const combineSched = `${startDateStr} to ${endDateStr}`
            setSched(combineSched)
        }
    }

    return(
    <>
        <Box w="100%" p={4}>
            <FormControl 
                display='flex' flexDir='column' w='100%' alignItems='center' justifyContent={'center'}
            >
                <Text className='text-gray-400'>Training calendar:<Text as='span' color='red.700'>*</Text></Text>
                <DatePicker 
                    inline
                    selectsRange
                    showMonthDropdown 
                    showPopperArrow={false}
                    selected={start_date} 
                    onChange={onChange}
                    startDate={start_date || undefined}
                    endDate={end_date || undefined}
                >
                    <Text color='red.600'>Note:</Text>
                    <Text mt='2' color='red.500'>Click once or twice on a date if your training lasts for a single day.</Text>
                    <Text mt='2' color='red.500'>If training lasts for more than 1 day, click on the first preferred date then click on the last preferred date.</Text>
                </DatePicker>
            </FormControl>
            <Button mt='2' onClick={handleSchedule} colorScheme='blue' bgColor='blue.700' w='100%' shadow='md'>Set Schedule</Button>
            <Text mt='2' color='red.500'>Kindly click the button above before clicking the done button.</Text>
        </Box>
    </>
    )
}