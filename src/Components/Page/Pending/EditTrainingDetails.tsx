'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Box, Text, Input, Button, FormLabel, useToast, RadioGroup, Radio, useDisclosure, FormControl, Modal, ModalOverlay, InputLeftAddon, InputGroup, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import DatePicker from 'react-datepicker'

import { SearchIcon } from '@/Components/Icons'

import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'

import { useTraining } from '@/context/TrainingContext'
import { ToastStatus } from '@/types/handling';

import { TRAINING_BY_ID, initTraining } from '@/types/trainees'
import { UPDATE_TRAINING } from '@/lib/trainee_controller'
import { HoliDates } from '@/handlers/course_handler'
import { currentYear } from '@/handlers/util_handler'

interface PageProps {
    training_id: string;
    onClose: () => void;
    company_id: string;
}

export default function EditTrainingDetails({training_id, company_id, onClose}: PageProps) {
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allTraining } = useTraining()
    const { companyCharge: companyCharges, courseCodes: companyCourseCodes} = useClients()
    
    const [loading, setLoading] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')

    const { isOpen: isOpenC, onOpen: onOpenC, onClose: onCloseC } = useDisclosure()
    
    const [training, setTraining] = useState<TRAINING_BY_ID>(initTraining)
    
    const [start_date, setStartDate] = useState<Date | null>(new Date())
    const [end_date, setEndDate] = useState<Date | null>(new Date())
    
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

    useEffect(() => {
        const fetchData = () => {
            const trainingDoc = allTraining?.find((training) => training.id === training_id)
            if(trainingDoc){
                setTraining(trainingDoc)

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
    },[allTraining])
    
    // temp storage for Course Selection
    const [tempSelectCourse, setTempCourse] = useState<string>('')

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

    const handleDisplayCourse =(course: string) => {
        const getCourse = allCourses?.find((c) => c.id === course)
        if(!getCourse){
            return companyCourseCodes?.find((c) => c.id === course)?.company_course_code
        } else {
            return getCourse.course_code
        }
    }

    const handleSelectedCourse = (val: string) => {
        setTraining(prev => ({
            ...prev,
            course: val
        }))
    }

    const handleCF =(e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setTraining(prev => ({
            ...prev,
            course_fee: Number(value)
        }))
    }
    
    const handleDays =(value: string) => {
        if(Number(value) > 1){
            setTraining(prev => ({
                ...prev,
                numOfDays: Number(value)
            }))
        } else {
            setTraining(prev => ({
                ...prev,
                numOfDays: Number(value),
                end_date: '',
            }))
        }
    }

    const handleUpdateTraining = async () => {
        setLoading(true);
        const actor: string | null = localStorage.getItem('customToken');
        
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
            try {
                await UPDATE_TRAINING(training_id, training, actor)
                res();
            } catch (error) {
                rej(error);
            }
            }, 500);
        })
        .then(() => {
            handleToast( 'Training Details Updated Successfully!', `You have successfully changed this training's data, and it will be logged.`, 5000, 'success' )
            onClose();
        })
        .catch((error) => {
            console.log('Error:', error);
        })
        .finally(() => {
            setLoading(false);
        })
    }

    const handleStartD = (date: Date | null) => {
        const startDateStr = date
        ? new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
          }).format(date)
        : '';

        setTraining(prev => ({
            ...prev,
            start_date: startDateStr,
        }))
    }
    
    const handleEndD = (date: Date | null) => {
        const endDateStr = date
        ? new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            }).format(date)
        : '';

        setTraining(prev => ({
            ...prev,
            end_date: endDateStr
        }))
    }

    return(
    <>
        {/** Below is the main parent of this component use its id */}
        <Box w='100%' ref={parentComponentRef}>
            <Box className='space-y-4' display='flex' flexDir='column' alignItems='start' justifyContent='space-between'>
                <FormControl>
                    <FormLabel color='gray.600'>Training Course</FormLabel>
                    <Text textTransform='uppercase' fontSize='lg' _hover={{color: 'blue.300'}} className='hover:cursor-pointer' color='blue.700' onClick={() => {onOpenC();}} >
                        {handleDisplayCourse(training.course)}
                    </Text>
                </FormControl>
                <FormControl>
                    <FormLabel color='gray.600'>Course Fee</FormLabel>
                    <InputGroup shadow='md'>
                        <InputLeftAddon>Php</InputLeftAddon>
                        <Input type='number' onChange={handleCF} value={training.course_fee}/>
                    </InputGroup>
                </FormControl>
                <FormControl display='flex' flexDir='column' alignItems='start' borderBottomWidth='2px' p='2'>
                    <FormLabel m='0' color='gray.500'>Number of Days:</FormLabel>
                    <RadioGroup mt='2' value={training.numOfDays.toString()} onChange={(value) => {handleDays(value)}}>
                        <Box className='space-x-3'>
                            {Array.from({ length: 6 }, (_, index) => (
                                <Radio key={index} value={String(index + 1)}>
                                    {index + 1}
                                </Radio>
                            ))}
                        </Box>
                    </RadioGroup>
                </FormControl>
                <FormControl display='flex' flexDir='column' w='100%' alignItems='start'>
                    <FormLabel m='0' color='gray.500'>Start Date:</FormLabel>
                    <DatePicker showPopperArrow={false} selected={start_date} onChange={(date) => {setStartDate(date); handleStartD(date);}} filterDate={isSunday} holidays={dynamicHolidays} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd'
                        customInput={<Input id='start_date' w={parentWidth} textAlign='center' className='shadow-md' /> } />
                </FormControl>
                {training.numOfDays > 1 ? (
                    <FormControl display='flex' flexDir='column' w='100%' alignItems='start'>
                        <FormLabel m='0' color='gray.500'>End Date:</FormLabel>
                        <DatePicker showPopperArrow={false} selected={end_date} onChange={(date) => {setEndDate(date); handleEndD(date);}} filterDate={isSunday} holidays={dynamicHolidays} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd'
                            customInput={<Input id='end_date' w={parentWidth} textAlign='center' className='shadow-md' /> } />
                    </FormControl>
                ) : (
                    null
                )}
            </Box>
            <Box display='flex' justifyContent={'end'} py={4}>
                <Button mr={3} onClick={onClose}  shadow='md'>Cancel</Button>
                <Button onClick={handleUpdateTraining} loadingText='Updating...' isLoading={loading} colorScheme='blue' shadow='md' bgColor='#1c437e'>Update</Button>
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
                        <Text fontWeight='normal' color='gray.600' mt='3'>{`Note: When searched for a training course, don't forget to select it before clicking the "Select" button.`}</Text>
                    </Box>      
                    <Box mt='3' overflowY='auto' maxH='calc(100% - 50px)'>
                        <Box >
                        <Text fontSize='lg' textDecoration='underline' fontWeight='bold' color='blue.600'>Company Specific:</Text>
                        {allCourses?.slice().sort((a, b) => a.course_code.localeCompare(b.course_code)).map((course, index) => {
                            const matchingCharges = companyCharges?.filter(
                                (charge) => charge.course_ref === course.id && charge.company_ref === company_id
                            )

                            if (!matchingCharges || matchingCharges.length === 0) return null;

                            const matchingCourseCodes = companyCourseCodes?.filter(
                                (courseCode) =>
                                    courseCode.id_company_ref === company_id &&
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
                    <Button onClick={() => {handleSelectedCourse(tempSelectCourse); onCloseC()}} bgColor='#1c437e' colorScheme='blue'>Select</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}