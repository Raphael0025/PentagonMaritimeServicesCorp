'use client'

import React, { useState } from 'react'
import { Box, Text, Input, FormControl, Select, Button, useToast, Alert, AlertTitle, AlertDescription, AlertIcon } from '@chakra-ui/react'
import DatePicker from 'react-datepicker'

import { PlusIcon } from '@/Components/SideIcons'
import { TrashIcon } from '@/Components/Icons'

import { useCourses } from '@/context/CourseContext'
import { getFormattedDateRange, formatPromoPeriod, ToastStatus } from '@/types/handling'
import { CoursePromo, CoursePromoPeriod, initCoursePromo } from '@/types/courses'

import { INSERT_COURSE_PROMO, INSERT_PROMO_PERIOD } from '@/lib/course_controller'
import { HoliDates } from '@/handlers/course_handler'

interface ModalProp{
    onClose: () => void
}

export default function Page({ onClose }: ModalProp){
    const { data: allCourses } = useCourses()
    const toast = useToast()
    
    const [loading, setLoading] = useState<boolean>(false)
    const [show, setShow] = useState<boolean>(false)

    const [coursePromo, setPromo] = useState<CoursePromo>(initCoursePromo)

    const [promoPeriods, setPeriods] = useState<CoursePromoPeriod[]>([])

    const [customStartDate, setCustomStartDate] = useState<Date | null>(new Date())
    const [numOfDays, setNumOfDays] = useState<number>(0)
    
    const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
        toast({
            title: title,
            description: desc,
            position: 'top-right',
            variant: 'left-accent',
            status: status,
            duration: timer,
            isClosable: true,
        })
    }

    const handleOnChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {id, value} = e.target

        if(id === 'numOfPromoDays'){
            setNumOfDays(Number(value))
        }else{
            setPromo((prev) => ({
                ...prev,
                [id]: value
            }))
        }
    }

    const handleOnChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target

        setPromo((prev) => ({
            ...prev,
            [id]: Number(value)
        }))
    }

    const handleSaveData = async () => {
        if(coursePromo.course_ref === '' || coursePromo.rate === 0 || promoPeriods.length === 0){
            handleToast('Warning', 'Missing fields required...', 4000, 'warning')
            setShow(true)
            return
        }
        setShow(false)
        setLoading(true)

        const getActor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const promoID =  await INSERT_COURSE_PROMO(coursePromo, getActor)
                    if(promoPeriods.length > 0){
                        for(const period of promoPeriods){
                            const newPeriod = {
                                ...period,
                                course_promo_ref: promoID
                            }
                            await INSERT_PROMO_PERIOD(newPeriod, getActor)
                        }
                    }
                    res()
                }catch(error){
                    rej(error)
                }
            }, 2000)
        }).then(() => {
            handleToast('New Promo for this Course has been created!', `Course Promo has been successfully added to the database.`, 5000, 'success')
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setLoading(false)
            onClose()
            setPromo(initCoursePromo)
            setPeriods([])
            setNumOfDays(0)
        })
    }

    const handleInsertPeriod = () => {
        if(customStartDate && numOfDays > 0){
            const dateExists = promoPeriods.some(
                (date) => date.start_date.toDateString() === customStartDate.toDateString()
            )
            if(!dateExists){
                const { endDate } = getFormattedDateRange(customStartDate, numOfDays - 1)
                setPeriods(prev => [
                    ...prev,
                    {
                        start_date: customStartDate,
                        end_date: endDate,
                        numOfPromoDays: numOfDays,
                        forceToEnd: false,
                        course_promo_ref: '',
                    }
                ])
            } else {
                handleToast('Date Selected', `Apparently, this date is already selected. please select another.`, 4000, 'warning')
            }
            setCustomStartDate(new Date())
            setNumOfDays(0)
        } else {
            console.error("Start date or number of promo days is invalid.")
            handleToast('Selection Required', `Please select an item from the dropdown list to proceed.`, 4000, 'warning')
        }
    }

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

    return(
    <> 
        <Box className='px-3 space-y-3'>
            {show && (
                <Alert status='info' variant='left-accent' className='flex-col mb-4 items-center justify-center'>
                    <Box className='flex w-full items-center justify-center'>
                        <AlertIcon />
                        <AlertTitle fontSize='18px' fontWeight='700'>
                            <p>Please provide Required Fields</p>
                        </AlertTitle>
                    </Box>
                    <AlertDescription className='flex w-full'>
                        <Box className='w-full flex px-10'>
                            <Box className='flex flex-col w-full'>
                                <p>{coursePromo.course_ref === '' ? `* Course` : ''}</p>
                                <p>{coursePromo.rate === 0 ? `* Promo Rate` : ''}</p>
                                <p>{promoPeriods.length === 0 ? `* You Haven't inserted any promo dates.` : ''}</p>
                            </Box>
                        </Box>
                    </AlertDescription>
                </Alert>
            )}
            <Box className='flex space-x-3'>
                <Box w='50%' className='space-y-3'>
                    <FormControl className='space-y-2 uppercase'>
                        <label className='text-gray-400' >Course Code:</label>
                        <Select id='course_ref' className='uppercase' onChange={handleOnChangeSelect} size='sm'>
                            <option hidden>Select Course Code</option>
                            {allCourses && allCourses.sort((a, b) => {
                                const courseA = allCourses?.find((course) => course.course_code === a.course_code)?.course_code || '';
                                const courseB = allCourses?.find((course) => course.course_code === b.course_code)?.course_code || '';
                                return courseA.localeCompare(courseB);
                            }).map((course) => (
                                <option key={course.id} value={course.id}>{`${course.course_code} - ${course.course_name}`}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl className='space-y-2 uppercase'>
                        <label className='text-gray-400' >Rate:</label>
                        <Input id='rate' type='number' onChange={handleOnChangeInput} placeholder='e.g. 20' />
                    </FormControl>
                    <FormControl className='flex flex-col space-y-8 uppercase'>
                        <Box className='input-grp '>
                            <label className='text-gray-400'>Start Date:</label>
                            <FormControl isRequired className='flex'>
                                <DatePicker showPopperArrow={false} showIcon selected={customStartDate} onChange={(date) => setCustomStartDate(date)} showMonthDropdown useShortMonthInDropdown showYearDropdown dateFormat='E, MMM. dd, yyyy' minDate={new Date()} filterDate={isSunday} holidays={dynamicHolidays} 
                                    customInput={<Input id='start_date' className='w-full p-2' textAlign='center' size='sm' fontSize='md' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' _hover={{ borderColor: '#2f67b2' }} _focus={{ boxShadow: '0 0 0 0 rgba(88, 144, 255, .75), 0 0 0 rgba(0, 0, 0, .15)' }} /> } />
                            </FormControl>
                        </Box>
                    </FormControl>
                    <FormControl className='space-y-2 uppercase'>
                        <Text color='#a1a1a1'>Number of Promo Days:</Text>
                        <Select id='numOfPromoDays' className='uppercase' onChange={handleOnChangeSelect} value={numOfDays === 1 ? 'Select' : numOfDays} required>
                            <option hidden>Select number of Days</option>
                            <option value={'6'}>6 days</option>
                            <option value={'5'}>5 days</option>
                            <option value={'4'}>4 days</option>
                            <option value={'3'}>3 days</option>
                            <option value={'2'}>2 days</option>
                            <option value={'1'}>1 day</option>
                        </Select>
                    </FormControl>
                    <Box>
                        <Button onClick={handleInsertPeriod} colorScheme='blue' leftIcon={<PlusIcon size='24' color='#2f67b2' />} variant='outline'>Insert Period</Button>
                    </Box>
                </Box>
                <Box w='50%'>
                    <Text className='w-full text-gray-400 font-semibold text-base'>Selected Dates</Text>
                    <Box className='space-y-3'>
                        {promoPeriods.map((val, index) => (
                            <Box key={index} className="p-4 pt-2 border rounded-md shadow-md">
                                <Box className='flex justify-between items-center w-full'>
                                    <Text fontWeight="bold" color='gray.400' >Promo Period:</Text>
                                    <Button size='sm' colorScheme='red' variant='ghost' onClick={() => setPeriods(prev => prev.filter((_, i) => i !== index ))}><TrashIcon size='24' color='red' /></Button>
                                </Box>
                                <Text className='w-full font-bold'>{formatPromoPeriod(val.start_date, val.end_date, val.numOfPromoDays)}</Text>
                                <Text className='w-full'><span className='text-gray-500'>No. of Days:</span> {val.numOfPromoDays}</Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
            <Box className='flex justify-end border-t py-3 border-gray-300'>
                <Button onClick={onClose} size='sm' mr={3}>Cancel</Button>
                <Button onClick={handleSaveData} size='sm' isLoading={loading} loadingText='Creating...' colorScheme='blue'>Create</Button>
            </Box>
        </Box>
    </>
    )
}