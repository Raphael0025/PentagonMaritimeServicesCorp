'use client'

import React, { useState } from 'react'
import { Box, Text, Input, FormControl, FormLabel, InputLeftAddon, InputGroup, useDisclosure, Button, Radio, RadioGroup, useToast, Modal, ModalHeader, ModalContent, ModalBody, ModalFooter, ModalOverlay, Alert, AlertTitle, AlertDescription, AlertIcon } from '@chakra-ui/react'
import DatePicker from 'react-datepicker'

import { PlusIcon } from '@/Components/SideIcons'
import { TrashIcon, SearchIcon } from '@/Components/Icons'

import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'

import { TEMP_COURSES } from '@/types/trainees'

import { addTrainingDetails } from '@/lib/trainee_controller'

import { getFormattedDateRange, formatPromoPeriod, ToastStatus } from '@/types/handling'

import { HoliDates } from '@/handlers/course_handler'
import { courseCodes } from '@/lib/client-controller'

interface ModalProp{
    onClose: () => void;
    reg_id: string;
    accountType: number;
    c_id: string;
}

export default function InsertTraining({ onClose, c_id, accountType, reg_id }: ModalProp){
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allClients, companyCharge: companyCharges, courseCodes: companyCourseCodes} = useClients()
    
    const [loading, setLoading] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const [tempCourses, setTempCourses] = useState<TEMP_COURSES[]>([])

    const [start_date, setStartDate] = useState<Date | null>(new Date())
    const [end_date, setEndDate] = useState<Date | null>(new Date())

    // temp storage for Course Selection
    const [selectCourse, setSelectedCourse] = useState<string>('')
    const [tempSelectCourse, setTempCourse] = useState<string>('')
    const [previewCourse, setPreviewCourse] = useState<string>('')

    const [days, setDays] = useState<string>('')
    const [courseFee, setCFee] = useState<number>(0)

    const { isOpen: isOpenC, onOpen: onOpenC, onClose: onCloseC } = useDisclosure()

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

    const clearData = () => {
        setStartDate(new Date())
        setEndDate(new Date())
        setSelectedCourse('')
        setDays('')
        setCFee(0)
    }

    const handleTempCourses = () => {
        let templateData;
        if(tempCourses.find((course) => course.course === selectCourse)){
            handleToast('Action Denied!', `It seems that this course is already selected, please select another.`, 4000, 'warning')
            clearData()
            return
        }
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
            }
        } else {
            templateData = {
                course: selectCourse,
                course_fee: courseFee,
                start_date: startDateStr,
                end_date: '',
                numOfDays: Number(days),
                accountType: Number(accountType), // 0 - crew | 1 - company
            }
        }
        
        setTempCourses((prev) => [...prev, templateData])
        clearData()
    }

    const handleCourses = async () => {
        setLoading(true)
       for(const course of tempCourses){
            try{
                if(reg_id){
                    await addTrainingDetails(course, reg_id)
                }
            }catch(error){
                console.error('Failed to process this: ', error)
            }
        }
        setLoading(false)
        setTempCourses([])
        onClose()
    }

    const handleRemoveCourse = (index: number) => {
        setTempCourses((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSelectedCourse = (val: string) => {
        const getCourse = allCourses?.find((course) => course.id === val)
        if(!getCourse){
            const getCompanyCourseCode = companyCourseCodes?.find((course) => course.id === val)
            const getCompanyCourse = allCourses?.find((course) => course.id === getCompanyCourseCode?.id_course_ref)
            const clientCompany = allClients?.find((company) => company.id === c_id)
            const getCompanyCharge = companyCharges?.find((charge) => charge.company_ref === clientCompany?.id && charge.course_ref === getCompanyCourse?.id)
            
            setCFee(getCompanyCharge?.charge_fee ?? 0)
            setSelectedCourse(getCompanyCourseCode?.id ?? '')
            setPreviewCourse(getCompanyCourseCode?.company_course_code ?? '')
        }else{
            setCFee(getCourse?.course_fee ?? 0)
            setSelectedCourse(getCourse?.id ?? '')
            setPreviewCourse(getCourse?.course_code ?? '')
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

    const handleCourseFee = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setCFee(Number(val))
    }

    const handleDisplayCourse =(course: string) => {
        const getCourse = allCourses?.find((c) => c.id === course)
        if(!getCourse){
            return companyCourseCodes?.find((c) => c.id === course)?.company_course_code
        } else {
            return getCourse.course_code
        }
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
                            <Button textTransform='uppercase' variant='ghost' onClick={onOpenC}>{`${selectCourse === '' ? 'Select Course' : previewCourse}`}</Button>
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
                        <Button 
                            size='sm'
                            isDisabled={ 
                                days === '' || 
                                courseFee === 0 || 
                                selectCourse === '' || 
                                (days === '1' ? 
                                    (start_date === null) 
                                    : 
                                    (start_date === null && end_date === null))} 
                            onClick={() => {handleTempCourses()}} 
                            colorScheme='blue' 
                            bgColor='#1c437e' 
                            leftIcon={<PlusIcon size={'24'} color={'#fff'} />} >
                                Add
                        </Button>
                    </Box>
                </Box>
                <Box w='50%' >
                    <Text color='blue.700' fontSize='0.9rem'>Selected Trainings</Text>
                    <Box overflowY='auto' maxH='450px' borderRadius='10px'>
                        {tempCourses.map((temp, index) => (
                            <Box borderWidth='1px' borderColor='gray.400' shadow='md' borderRadius='10px' p='2' color='gray.500' mb='2' key={index}>
                                <Box display='flex' justifyContent={'space-between'}>
                                    <Text display='flex'>
                                        <Text mr='3'>Course:</Text>
                                        <Text textTransform='uppercase' color='gray.700'>
                                            {handleDisplayCourse(temp.course)}
                                        </Text>
                                    </Text>
                                    <Text display='flex' >
                                        <Text mr='3'>Fee:</Text>
                                        <Text color='gray.700'>{temp.course_fee}</Text>
                                    </Text>
                                </Box>
                                <Box display='flex' justifyContent={'space-between'}>
                                    <Text display='flex' >
                                        <Text mr='3'>No. of Days:</Text>
                                        <Text color='gray.700'>{temp.numOfDays}</Text>
                                    </Text>
                                    <Text display='flex' >
                                        <Text mr='3'>Account Type:</Text>
                                        <Text color='gray.700'>{temp.accountType === 0 ? 'Crew' : 'Company'}</Text>
                                    </Text>
                                </Box>
                                <Box display='flex' justifyContent={'space-between'}>
                                    <Text display='flex' >
                                        <Text mr='3'>Start Date:</Text>
                                        <Text color='gray.700'>{temp.start_date}</Text>
                                    </Text>
                                    {temp.numOfDays !== 1 ? (
                                        <Text display='flex' >
                                            <Text mr='3'>End Date:</Text>
                                            <Text color='gray.700'>{temp.end_date}</Text>
                                        </Text>
                                    ) : (
                                        <Text>{''}</Text>
                                    )}
                                </Box>
                                <Box py='2'>
                                    <Button onClick={() => {handleRemoveCourse(index)}} size='xs' w='100%' colorScheme='red' leftIcon={<TrashIcon color='#fff' size='20' />}>Remove</Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
            <Box display='flex' justifyContent='end'>
                <Button onClick={onClose} shadow='md' mr='3'>Cancel</Button>
                <Button isLoading={loading} isDisabled={tempCourses.length === 0} onClick={handleCourses} loadingText='Inserting...' bgColor='#1c437e' colorScheme='blue' shadow='md'>Insert</Button>
            </Box>
        </Box>
        <Modal isOpen={isOpenC} closeOnOverlayClick={false} scrollBehavior='inside' size='xl' onClose={onCloseC}>
            <ModalOverlay />
            <ModalContent h='600px'>
                <ModalHeader color='blue.700'>Select a Course</ModalHeader>
                <ModalBody overflowY='hidden'>
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
                    <Box mt='3' overflowY='auto' maxH='calc(100% - 50px)'>
                        <Box >
                        <Text fontSize='lg' textDecoration='underline' fontWeight='bold' color='blue.600'>Company Specific:</Text>
                        {allCourses?.slice().sort((a, b) => a.course_code.localeCompare(b.course_code)).map((course, index) => {
                            const matchingCharges = companyCharges?.filter(
                                (charge) => charge.course_ref === course.id && charge.company_ref === c_id
                            )

                            if (!matchingCharges || matchingCharges.length === 0) return null;

                            const matchingCourseCodes = companyCourseCodes?.filter(
                                (courseCode) =>
                                    courseCode.id_company_ref === c_id &&
                                    courseCode.id_course_ref === course.id
                            )

                            if (!matchingCourseCodes || matchingCourseCodes.length === 0) return null;

                            return(
                                <Box key={index}>
                                    {matchingCourseCodes.filter((courseC) => courseC.company_course_code.toUpperCase().includes(search.toUpperCase()) || course.course_name.toUpperCase().includes(search.toUpperCase())).map((courseCode) => (
                                        <Box key={courseCode.id}>
                                            <Text bgColor={`${tempSelectCourse === courseCode.id ? 'blue.100' : ''}`} borderLeftWidth={`${tempSelectCourse === courseCode.id ? '6px' : ''}`} borderColor={tempSelectCourse === courseCode.id ? 'blue.600' : ''} _hover={{ bgColor: 'gray.100',}} onClick={() => setTempCourse(courseCode.id)} className='hover:cursor-pointer' borderRadius='5px' p='4' fontSize='lg' textTransform='uppercase' key={courseCode.id}>
                                                <Text color={`${tempSelectCourse === courseCode.id ? 'blue.900' : 'blue.500'}`} as='span'>{courseCode.company_course_code}: </Text>
                                                <Text fontSize='sm' as='i'>({course.course_name})</Text>
                                            </Text>
                                        </Box>
                                    ))}
                                </Box>
                            )
                        })}    
                        <Text fontSize='lg' textDecoration='underline' fontWeight='bold' color='blue.600'>Other Courses:</Text>
                        {allCourses && allCourses.filter((course) => course.course_code.toUpperCase().includes(search.toUpperCase()) || course.course_name.toUpperCase().includes(search.toUpperCase())).sort((a,b) => a.course_code.localeCompare(b.course_code)).map((course) => (
                            <Text bgColor={`${tempSelectCourse === course.id ? 'blue.100' : ''}`} borderLeftWidth={`${tempSelectCourse === course.id ? '6px' : ''}`} borderColor={tempSelectCourse === course.id ? 'blue.600' : ''} _hover={{ bgColor: 'gray.100',}} onClick={() => setTempCourse(course.id)} className='hover:cursor-pointer' borderRadius='5px' p='4' fontSize='lg' textTransform='uppercase'  key={course.id}>
                                <Text color={`${tempSelectCourse === course.id ? 'blue.900' : 'blue.500'}`} as='span'>{course.course_code}: </Text>
                                <Text fontSize='sm' as='i'>({course.course_name})</Text>
                            </Text>
                        ))}    
                        </Box>      
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