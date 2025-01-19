'use client';

import { useEffect, useState } from 'react';
import { Box, Button, InputGroup, Alert, AlertIcon, AlertTitle, AlertDescription, useToast, InputLeftElement, Input, Select, FormControl,  } from '@chakra-ui/react'

import { Timestamp } from 'firebase/firestore'

import { PlusIcon } from '@/Components/SideIcons'

import { Courses, initCourses } from '@/types/courses'
import { ToastStatus } from '@/types/handling'

import { addCourse } from '@/lib/course_controller'

import { useCourses } from '@/context/CourseContext'

interface IProps{
    onClose: () => void;
}

export default function NewCourseForm({ onClose } : IProps){
    const toast = useToast()
    const {data: courses } = useCourses()

    const [courseInfo, setCourseInfo] = useState<Courses>(initCourses)
    
    const [loading, setIsLoading] = useState<boolean>(false)

    const [startTime, setStart] = useState<Timestamp>(Timestamp.now())
    const [endTime, setEnd] = useState<Timestamp>(Timestamp.now())
    const [showAlert, setShowAlert] = useState<boolean>(false)

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        setCourseInfo (prevState => ({
            ...prevState,
            [id]: value
        }))
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;
        
        if(id === 'trainingMode' || id === 'courseType'){
            setCourseInfo(prevState => ({ 
                ...prevState,
                [id]: Number(value)
            }));
        } else {
            setCourseInfo(prevState => ({ 
                ...prevState,
                [id]: value
            }));
        }
    }

    const handleSubmit = async () => {
        const actor: string | null = localStorage.getItem('customToken')

        if(courseInfo.course_code === '' || courseInfo.course_name === '' || courseInfo.course_fee === 0 || courseInfo.day === '' || startTime === Timestamp.now() || endTime === Timestamp.now() || courseInfo.numOfDays === 0 || courseInfo.courseType === 2 || courseInfo.trainingMode === 2 ) {
            setShowAlert(true)
            handleToast(
                'Failed to Create Course!',
                `Please fill in the missing fields: `,
                4000,
                'warning'
            )
            console.log(courseInfo)
            return
        } else {
            setShowAlert(false)
            setIsLoading(true)
            const newCourseInfo = {
                ...courseInfo,
                course_fee: Number(courseInfo.course_fee),
                startTime,
                endTime,
            }
            new Promise<void>((res, rej) => {
                setTimeout(async () => {
                    try{
                        if(!courses) return
                        const courseExists = courses && courses.find(course => course.course_code.toLowerCase() === newCourseInfo.course_code.toLowerCase())
                        if(!courseExists){
                            await addCourse(newCourseInfo, actor)
                            handleToast('Created Successfully', `Created ${courseInfo.course_name} as new Course.`, 4000, 'success')
                            onClose()
                            res()
                        } else {
                            handleToast('Failed to Create Course!', `Apparently this course already exists.`, 4000, 'warning')
                            res()
                        }
                    } catch(error) {
                        rej(error)
                    }     
                }, 2000)
            })
            .catch((error) => {
                console.log('Error: ', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
        }
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, id } = e.target;
    
        // Create a new Date object for today's date
        const dateWithTime = new Date();
        const [hours, minutes] = value.split(':').map(Number); // Parse hours and minutes
    
        dateWithTime.setHours(hours, minutes, 0, 0); // Set hours and minutes only, seconds and milliseconds to 0
    
        // Convert dateWithTime to a Firebase Timestamp
        const timestamp = Timestamp.fromDate(dateWithTime);
    
        if (id === 'start_Time') {
            setStart(timestamp); // Use Timestamp instead of Date
        } else if (id === 'end_Time') {
            setEnd(timestamp); // Use Timestamp instead of Date
        }
    }
    
    return(
        <Box className='flex flex-col space-y-8' py={3}>
            {showAlert && (
                <Alert status='info' variant='left-accent' className='flex-col items-center justify-center'>
                    <Box className='flex w-full items-center justify-center'>
                        <AlertIcon />
                        <AlertTitle fontSize='18px' fontWeight='700'>
                            <p>Please provide Required Fields</p>
                        </AlertTitle>
                    </Box>
                    <AlertDescription className='w-full'>Below are the ff. fields need to provide.</AlertDescription>
                    <AlertDescription className='flex justify-start items-start w-full'>
                        <Box className='w-full flex px-10'>
                            {(courseInfo.course_code === '' || courseInfo.course_name === '' || courseInfo.course_fee === 0 || courseInfo.day === '' || startTime === Timestamp.now() || endTime === Timestamp.now()) && (
                                <Box className='flex flex-col w-full justify-between'>
                                    <p>{courseInfo.course_code === '' ? `Course Code` : ''}</p>
                                    <p>{courseInfo.course_name === '' ? `Course Name` : ''}</p>
                                    <p>{courseInfo.course_fee === 0 ? `Course Fee` : ''}</p>
                                    <p>{courseInfo.day === '' ? `Start Day` : ''}</p>
                                    <p>{startTime === Timestamp.now() ? `Start Time` : ''}</p>
                                    <p>{endTime === Timestamp.now() ? `End Time` : ''}</p>
                                </Box>
                            )}
                            <Box className='flex flex-col w-full'>
                                <p>{courseInfo.numOfDays === 0 ? `Number of Days` : ''}</p>
                                <p>{courseInfo.courseType === 2 ? `Course Type` : ''}</p>
                                <p>{courseInfo.trainingMode === 2 ? `Training Mode` : ''}</p>
                            </Box>
                        </Box>
                    </AlertDescription>
                </Alert>
            )}
            <Box className='flex justify-between'>
                <Box className='input-grp w-2/5' >
                    <FormControl isRequired>
                        <Input id='course_code' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 uppercase form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                        <label htmlFor='course_code' className='form-label bg-white' >Course Code </label>
                    </FormControl>
                </Box>
                <Box className='input-grp w-2/5' >
                    <FormControl isRequired>
                        <InputGroup>
                            <InputLeftElement pointerEvents='none' color='#a1a1a1' className='z-0'> Php </InputLeftElement>
                            <Input id='course_fee' onChange={handleChange} fontSize='lg' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                            <label htmlFor='course_fee' className='form-label-num' >Course Fee</label>
                        </InputGroup>
                    </FormControl>
                </Box>
            </Box>
            <Box className='input-grp' >
                <FormControl isRequired>
                    <Input id='course_name' onChange={handleChange} size='lg' placeholder='' type='text' className='p-3 text-base form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                    <label htmlFor='course_name' className='form-label text-base'>Course </label>
                </FormControl>
            </Box>
            <Box className='flex space-x-4'>
                <Box className='input-grp w-full '>
                    <select id='day' onChange={handleSelect} className='drop form-input w-full' defaultValue='' required>
                        <option value='' hidden disabled>Start Day</option>
                        <option value='Monday'>Monday</option>
                        <option value='Tuesday'>Tuesday</option>
                        <option value='Wednesday'>Wednesday</option>
                        <option value='Thursday'>Thursday</option>
                        <option value='Friday'>Friday</option>
                        <option value='Saturday'>Saturday</option>
                    </select>
                </Box>
                <Box className='input-grp w-full '>
                    <select id='numOfDays' onChange={handleSelect} className='drop form-input w-full' defaultValue='' required>
                        <option value='' hidden disabled>Select Number of Days</option>
                        <option value={6}>6 days</option>
                        <option value={5}>5 days</option>
                        <option value={4}>4 days</option>
                        <option value={3}>3 days</option>
                        <option value={2}>2 days</option>
                        <option value={1}>1 day</option>
                    </select>
                </Box>
            </Box>
            <Box className='flex justify-between space-x-6'>
                <Box className='w-full'>
                    <label>Course Type</label>
                    <Select id='courseType' onChange={handleSelect}>
                        <option hidden>Select Type</option>
                        <option value={0}>Marina</option>
                        <option value={1}>In-House</option>
                    </Select>
                </Box>
                <Box className='w-full'>
                    <label>Training Mode</label>
                    <Select id='trainingMode' onChange={handleSelect}>
                        <option hidden>{'Select Mode'}</option>
                        <option value={0}>Non-Simulator</option>
                        <option value={1}>Simulator</option>
                    </Select>
                </Box>
            </Box>
            <Box className='flex justify-center space-x-6'>
                <Box className='input-grp  w-1/2'>
                    <Input id='start_Time' onChange={handleTimeChange} fontSize='xs' size='lg' placeholder='' type='time' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                    <label htmlFor='start_Time' className='form-label'>Start Time </label>
                </Box>
                <Box className='input-grp w-1/2'>
                    <Input id='end_Time' onChange={handleTimeChange} fontSize='xs' size='lg' placeholder='' type='time' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                    <label htmlFor='end_Time' className='form-label'>End Time </label>
                </Box>
            </Box>
            <Box className='flex justify-end p-3 space-x-4'>
                <Button variant='outline' colorScheme='red' onClick={() => onClose()}>Cancel</Button>
                <Button isLoading={loading} colorScheme='blue' onClick={handleSubmit} loadingText='Creating...' leftIcon={<PlusIcon size='24' color='#fff' />} >Create Course</Button>
            </Box>
        </Box>
    );
}