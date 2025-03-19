'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Box, Text, Input, Button, FormControl, FormLabel, ModalContent, ModalFooter, ModalHeader, ModalBody } from '@chakra-ui/react';
import DatePicker from 'react-datepicker'

import { UPDATE_TRAINING } from '@/lib/trainee_controller'
import { TRAINING_BY_ID } from '@/types/trainees'

import { HoliDates } from '@/handlers/course_handler'
import { currentYear } from '@/handlers/util_handler'

interface PageProps {
    onClose: () => void;
    training: TRAINING_BY_ID;
}

export default function TrainingDate({onClose, training}: PageProps){
    const parentComponentRef = useRef<HTMLDivElement>(null)
    const [parentWidth, setParentWidth] = useState<number>(0)

    const getParentWidth = () => {
        if (parentComponentRef.current) {
            setParentWidth(parentComponentRef.current.offsetWidth);
        }
    }

    useEffect(() => {
        getParentWidth();
        window.addEventListener("resize", getParentWidth)
        return () => window.removeEventListener("resize", getParentWidth)
    }, [])

    const [loading, setLoading] = useState<boolean>(false)

    const [start_date, setStartDate] = useState<Date | null>(new Date())
    const [sdSTR, setSDStr] = useState<string>('')
    const [end_date, setEndDate] = useState<Date | null>(new Date())
    const [edSTR, setEDStr] = useState<string>('')

    useEffect(() => {
        const fetchData = () => {
            const trainingDoc = training
            if(trainingDoc){
                const numOfDay_as_num = trainingDoc.numOfDays

                const start_date = `${trainingDoc.start_date}, ${currentYear}`
                setStartDate(new Date(start_date))
                if(numOfDay_as_num !== 1){
                    const end_date = `${trainingDoc.end_date}, ${currentYear}`
                    setEndDate(new Date(end_date))
                }
            }
        }
        fetchData()
    },[training])

    const currYear = new Date().getFullYear()
    const dynamicHolidays = HoliDates.map(holiday => {
        return {
            ...holiday,
            date: `${currYear}-${holiday.date}`
        }
    })

    const isSunday = (date: Date) => {
        const day = date.getDay()
        return day !== 0
    }

    const handleStartD = (date: Date | null) => {
        const startDateStr = date
        ? new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
          }).format(date)
        : '';

        setSDStr(startDateStr)
    }
    
    const handleEndD = (date: Date | null) => {
        const endDateStr = date
        ? new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            }).format(date)
        : '';

        setEDStr(endDateStr)
    }

    const handleUpdate = async () => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const updateTD = {
                        start_date: sdSTR,
                        end_date: training.numOfDays > 1 ? edSTR : '',
                    }
                    await UPDATE_TRAINING(training.id, updateTD, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            },500)
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            onClose()
        }) 
    }

    return(
    <>
        <ModalContent w='100%' >
            <ModalHeader>Update Training Date</ModalHeader>
            <ModalBody >
                <Box w='100%' ref={parentComponentRef}>
                    <FormControl display='flex' flexDir='column' w='100%' alignItems='start'>
                        <FormLabel m='0' color='gray.500'>Start Date:</FormLabel>
                        <DatePicker preventOpenOnFocus showPopperArrow={false} selected={start_date} onChange={(date) => {setStartDate(date); handleStartD(date);}} filterDate={isSunday} holidays={dynamicHolidays} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd'
                            customInput={<Input id='start_date' w={parentWidth} textAlign='center' className='shadow-md' /> } />
                    </FormControl>
                    {training.end_date !== '' && (
                        <>
                            <FormControl display='flex' flexDir='column' w='100%' alignItems='start'>
                                <FormLabel m='0' color='gray.500'>End Date:</FormLabel>
                                <DatePicker preventOpenOnFocus showPopperArrow={false} selected={end_date} onChange={(date) => {setEndDate(date); handleEndD(date);}} filterDate={isSunday} holidays={dynamicHolidays} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd'
                                    customInput={<Input id='end_date' w={parentWidth} textAlign='center' className='shadow-md' /> } />
                            </FormControl>
                        </>
                    )}
                </Box>
            </ModalBody>
            <ModalFooter display='flex' justifyContent='end'>
                <Button onClick={onClose} mr='3' shadow='md' colorScheme='red' variant='outline'>Cancel</Button>
                <Button onClick={() => {handleUpdate();}} colorScheme='blue' bgColor='blue.700' isLoading={loading} shadow='md'>Update</Button>
            </ModalFooter>
        </ModalContent>
    </>
    )
}