'use client'

import React, { useState, useEffect } from 'react'
import { Box, Text, Input, FormControl, FormLabel, InputLeftAddon, InputGroup, useDisclosure, Button, Radio, RadioGroup, useToast, Modal, ModalHeader, ModalContent, ModalBody, ModalFooter, ModalOverlay, Alert, AlertTitle, AlertDescription, AlertIcon } from '@chakra-ui/react'
import DatePicker from 'react-datepicker'

import { PlusIcon } from '@/Components/SideIcons'
import { TrashIcon, SearchIcon } from '@/Components/Icons'

import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'

import { TEMP_COURSES } from '@/types/trainees'

import { addTrainingDetails } from '@/lib/trainee_controller'
import { generateDateRanges } from '@/handlers/course_handler'

import { getFormattedDateRange, formatPromoPeriod, ToastStatus } from '@/types/handling'

import { HoliDates } from '@/handlers/course_handler'

interface ModalProp{
    onClose: () => void;
    reg_id: string;
}

export default function InsertTraining({ onClose, reg_id }: ModalProp){
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allClients, companyCharge: companyCharges, courseCodes: companyCourseCodes} = useClients()
    
    const [loading, setLoading] = useState<boolean>(false)
    const [trainingSched, setTrainingSched] = useState<string[]>([])
    const [search, setSearch] = useState<string>('')
    const [courses, setCourses] = useState<TEMP_COURSES[]>([])
    const [tempCourses, setTempCourses] = useState<TEMP_COURSES[]>([])

    const [start_date, setStartDate] = useState<Date | null>(new Date())
    const [end_date, setEndDate] = useState<Date | null>(new Date())

    // temp storage for Course Selection
    const [selectCourse, setSelectedCourse] = useState<string>('')
    const [tempSelectCourse, setTempCourse] = useState<string>('')

    const [days, setDays] = useState<string>('')
    const [courseFee, setCFee] = useState<number>(0)
    const [accountType, setAccountType] = useState<string>('')
    const [paymentMode, setPaymentMode] = useState<string>('')

    const { isOpen: isOpenC, onOpen: onOpenC, onClose: onCloseC } = useDisclosure()

    const handleTempCourses = () => {
        let templateData;
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

        if (Number(days) > 1) {
            templateData = {
                course: selectCourse,
                course_fee: courseFee,
                start_date: startDateStr,
                end_date: endDateStr,
                numOfDays: Number(days),
                accountType: Number(accountType), // 0 - crew | 1 - company
                payment_mode: Number(paymentMode), // 0 - cash | 1 - gcash | 2 - bank
            }
        } else {
            templateData = {
                course: selectCourse,
                course_fee: courseFee,
                start_date: endDateStr,
                end_date: '',
                numOfDays: Number(days),
                accountType: Number(accountType), // 0 - crew | 1 - company
                payment_mode: Number(paymentMode), // 0 - cash | 1 - gcash | 2 - bank
            }
        }
        
        setTempCourses((prev) => [...prev, templateData])
    }

    const handleCourses = () => {
    //     setCourses((prev) => [
    //         ...prev,
    //         ...tempCourses
    //     ])
    //     setTempCourses([])
        alert(tempCourses)
    }

    // const handleRemoveCourse = (index: number) => {
    //     setCourses((prev) => prev.filter((_, i) => i !== index))
    // }

    const handleSelectedCourse = (val: string) => {
        const getCourse = allCourses?.find((course) => course.id === val)
        
        setCFee(getCourse?.course_fee ?? 0)
        setSelectedCourse(getCourse?.course_code ?? '')
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

    const handleCourseFee = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setCFee(Number(val))
    }

    return(
    <>
        <Box bgColor='#fbffff' borderRadius='10px' h='100%' p='10'>
            <Text color='blue.700' fontSize='xl' fontWeight='700'>Insert New Training</Text>
            <Box display='flex' mt='3' flexDir={{base: 'column', md: 'row', lg: 'row'}}>
                <Box mr={4} className='space-y-4' w='50%'>
                    <Box w='100%' className='space-y-3'>
                        <FormControl display='flex' className='space-x-4' alignItems='center' borderBottomWidth='2px' p='2'>
                            <FormLabel m='0' color='gray.500'>Course:</FormLabel>
                            <Button textTransform='uppercase' variant='ghost' onClick={onOpenC}>{`${selectCourse === '' ? 'Select Course' : selectCourse}`}</Button>
                        </FormControl>
                        <FormControl display='flex' flexDir={{base: 'column', md: 'row'}} alignItems='start' borderBottomWidth='2px' p='2'>
                            <FormLabel m='0' color='gray.500'>Course Fee:</FormLabel>
                            <Input type='number' onChange={handleCourseFee} value={courseFee}/>
                        </FormControl>
                        <FormControl display='flex' flexDir='column' alignItems='start' borderBottomWidth='2px' p='2'>
                            <FormLabel m='0' color='gray.500'>Number of Days:</FormLabel>
                            <RadioGroup mt='2' value={days} onChange={setDays}>
                                <Box className='space-x-3'>
                                    {Array.from({ length: 6 }, (_, index) => (
                                        <Radio key={index} value={String(index + 1)}>
                                            {index + 1}
                                        </Radio>
                                    ))}
                                </Box>
                            </RadioGroup>
                        </FormControl>
                        <FormControl display='flex' flexDir='column' alignItems='start' borderBottomWidth='2px' p='2'>
                            <FormLabel m='0' color='gray.500'>Account Type:</FormLabel>
                            <RadioGroup value={accountType} mt='2' onChange={setAccountType}>
                                <Box className='space-x-3'>
                                    <Radio value={'0'}>Crew Charge</Radio>
                                    <Radio value={'1'}>Company Charge</Radio>
                                </Box>
                            </RadioGroup>
                        </FormControl>
                        <FormControl display='flex' flexDir='column' alignItems='start' borderBottomWidth='2px' p='2'>
                            <FormLabel m='0' color='gray.500'>Payment Mode:</FormLabel>
                            <RadioGroup value={paymentMode} mt='2' onChange={setPaymentMode}>
                                <Box className='space-x-3'>
                                    <Radio value={'0'}>Cash</Radio>
                                    <Radio value={'1'}>GCash</Radio>
                                    <Radio value={'2'}>Bank</Radio>
                                </Box>
                            </RadioGroup>
                        </FormControl>
                        <FormControl display='flex' flexDir='column' alignItems='start' borderBottomWidth='2px' p='2'>
                            <FormLabel m='0' color='gray.500'>Start Date:</FormLabel>
                            <DatePicker showPopperArrow={false} selected={start_date} onChange={(date) => setStartDate(date)} filterDate={isSunday} holidays={dynamicHolidays} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd'
                                customInput={<Input id='start_date' textAlign='center' className='shadow-md' /> } />
                            <Text className='mt-2 text-black' style={{fontSize: '11px'}}>You can select a date from the calendar or type it directly in the field above</Text>
                        </FormControl>
                        {Number(days) > 1 ? (
                            <FormControl display='flex' flexDir='column' alignItems='start' borderBottomWidth='2px' p='2'>
                                <FormLabel m='0' color='gray.500'>End Date:</FormLabel>
                                <DatePicker showPopperArrow={false} selected={end_date} onChange={(date) => setEndDate(date)} filterDate={isSunday} holidays={dynamicHolidays} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd'
                                    customInput={<Input id='end_date' textAlign='center' className='shadow-md' /> } />
                                <Text className='mt-2 text-black' style={{fontSize: '11px'}}>You can select a date from the calendar or type it directly in the field above</Text>
                            </FormControl>
                        ) : (
                            null
                        )}
                        <Button onClick={() => handleTempCourses} colorScheme='blue' bgColor='#1c437e' leftIcon={<PlusIcon size={'24'} color={'#fff'} />} >Add</Button>
                    </Box>
                </Box>
                <Box w='50%'>

                </Box>
            </Box>
            <Box display='flex' justifyContent='end'>
                <Button onClick={onClose} shadow='md' mr='3'>Cancel</Button>
                <Button isLoading={loading} onClick={handleCourses} loadingText='Inserting...' bgColor='#1c437e' colorScheme='blue' shadow='md'>Insert</Button>
            </Box>
        </Box>
        <Modal isOpen={isOpenC} closeOnOverlayClick={false} scrollBehavior='inside' size='xl' onClose={onCloseC}>
            <ModalOverlay />
            <ModalContent h='600px'>
                <ModalHeader color='blue.700'>Select a Course</ModalHeader>
                <ModalBody>
                    <Box >
                        <InputGroup className="shadow-md rounded-lg">
                            <InputLeftAddon>
                                <SearchIcon color="#a1a1a1" size="18" />
                            </InputLeftAddon>
                            <Input
                                textTransform='uppercase' 
                                placeholder="type course here..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </Box>      
                    <Box mt='3'>
                    {allCourses && allCourses.filter((course) => course.course_code.toUpperCase().includes(search.toUpperCase()) || course.course_name.toUpperCase().includes(search.toUpperCase())).sort((a,b) => a.course_code.localeCompare(b.course_code)).map((course) => (
                        <Text bgColor={`${tempSelectCourse === course.id ? 'blue.100' : ''}`} borderLeftWidth={`${tempSelectCourse === course.id ? '6px' : ''}`} borderColor={tempSelectCourse === course.id ? 'blue.600' : ''} _hover={{ bgColor: 'gray.100',}} onClick={() => setTempCourse(course.id)} className='hover:cursor-pointer' borderRadius='5px' p='4' fontSize='lg' textTransform='uppercase'  key={course.id}>
                            <Text color={`${tempSelectCourse === course.id ? 'blue.900' : 'blue.500'}`} as='span'>{course.course_code}: </Text>
                            <Text fontSize='sm' as='i'>({course.course_name})</Text>
                        </Text>
                    ))}    
                    </Box>      
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onCloseC} mr={4}>Close</Button>
                    <Button onClick={() => {setSelectedCourse(tempSelectCourse); handleSelectedCourse(tempSelectCourse); onCloseC()}} bgColor='#1c437e' colorScheme='blue'>Select</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}