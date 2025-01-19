'use client';

import { useEffect, useState } from 'react';
import { Box, Button, useToast, Text, InputGroup, Select, InputLeftElement, Input, FormControl, } from '@chakra-ui/react'

import { CoursesById, initCoursesById } from '@/types/courses'
import { ToastStatus } from '@/types/handling'

import { editCourse } from '@/lib/course_controller'

import { Timestamp } from 'firebase/firestore'

import { PlusIcon } from '@/Components/SideIcons'

import { useCourses } from '@/context/CourseContext'
import { formatTimestampToTimeString } from '@/handlers/course_handler'

interface IProps{
    onClose: () => void;
    id: string;
}

export default function EditCourseForm({ onClose, id } : IProps){
    const toast = useToast()
    const {data: allCourses } = useCourses()
    
    const [courseVal, setCourseInfo] = useState<CoursesById>(initCoursesById)

    const [loading, setIsLoading] = useState<boolean>(true)

    const [startTime, setStart] = useState<Timestamp>(Timestamp.now())
    const [endTime, setEnd] = useState<Timestamp>(Timestamp.now())

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                if(!allCourses) return

                const fetchedCourse = allCourses && allCourses.find(course => course.id === id)
                if(fetchedCourse){
                    setCourseInfo(fetchedCourse)
                } else {
                    setCourseInfo(initCoursesById)
                }
            } catch (error) {
                console.error('Error getting Course record:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, [id]);

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

    const handleSubmit = async () => {
        const actor: string | null = localStorage.getItem('customToken')
        setIsLoading(true)
        const newCourseInfo = {
            ...courseVal,
            course_fee: Number(courseVal.course_fee),
            startTime: courseVal.startTime === Timestamp.now() ? courseVal.startTime : startTime,
            endTime: courseVal.endTime === Timestamp.now() ? courseVal.endTime : endTime,
        }
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    await editCourse(newCourseInfo, actor)
                    handleToast('Saved Successfully', `New Details for ${newCourseInfo.course_name} has been saved.`, 4000, 'success')
                    res()
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
            onClose()
        })
    }

    return(
        <Box className='flex flex-col space-y-8 py-4'>
            {courseVal && (
            <>
                <Box className='flex justify-between'>
                    <Box className='input-grp w-full md:w-2/5' >
                        <FormControl isRequired>
                            <Input id='course_code' value={courseVal.course_code} onChange={handleChange} fontSize='lg' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                            <label htmlFor='course_code' className='form-label'>Course Code </label>
                        </FormControl>
                    </Box>
                    <Box className='input-grp w-full md:w-2/5' >
                        <FormControl isRequired>
                            <InputGroup>
                                <InputLeftElement pointerEvents='none' color='#a1a1a1' className='z-0'> Php </InputLeftElement>
                                <Input id='course_fee' value={courseVal.course_fee} onChange={handleChange} fontSize='lg' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                <label htmlFor='course_fee' className='form-label-num z-10'>Course Fee</label>
                            </InputGroup>
                        </FormControl>
                    </Box>
                </Box>
                <Box className='input-grp' >
                    <FormControl isRequired>
                        <Input id='course_name' value={courseVal.course_name}  onChange={handleChange} fontSize='lg' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                        <label htmlFor='course_name' className='form-label'>Course </label>
                    </FormControl>
                </Box>
                <Box className='flex space-x-4'>
                    <Box className='input-grp w-full '>
                        <select id='day' onChange={handleSelect} value={courseVal.day}  className='drop form-input w-full' defaultValue='' required>
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
                        <select id='numOfDays' onChange={handleSelect} value={courseVal.numOfDays}  className='drop form-input w-full' defaultValue='' required>
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
                        <Select id='courseType' value={courseVal.courseType} onChange={handleSelect}>
                            <option hidden>Select Type</option>
                            <option value={0}>Marina</option>
                            <option value={1}>In-House</option>
                        </Select>
                    </Box>
                    <Box className='w-full'>
                        <label>Training Mode</label>
                        <Select id='trainingMode' value={courseVal.trainingMode} onChange={handleSelect}>
                            <option hidden>{'Select Mode'}</option>
                            <option value={0}>Non-Simulator</option>
                            <option value={1}>Simulator</option>
                        </Select>
                    </Box>
                </Box>
                <Box className='flex flex-col justify-center space-y-2'>
                    <Text>Old Time Schedule:</Text>
                    <Box className='flex justify-center space-x-6'>
                        <Box className='flex space-x-4 w-1/2'>
                            <Text className='text-gray-400'>Start Time:</Text>
                            <Text>{formatTimestampToTimeString(courseVal.startTime)}</Text>
                        </Box>
                        <Box className='flex space-x-4 w-1/2'>
                            <Text className='text-gray-400'>End Time:</Text>
                            <Text>{formatTimestampToTimeString(courseVal.endTime)}</Text>
                        </Box>
                    </Box>
                </Box>
                <Box className='flex flex-col justify-center space-y-4'>
                    <Text>New Time Schedule:</Text>
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
                </Box>
            </>
            )}
            <Box className='flex justify-end p-3 space-x-6'>
                <Button variant='outline' colorScheme='red' onClick={() => onClose()}>Cancel</Button>
                <Button isLoading={loading} isDisabled={!courseVal.course_code || !courseVal.course_name || !courseVal.course_fee || !courseVal.day || !courseVal.numOfDays} colorScheme='blue' onClick={handleSubmit} loadingText='Saving...' leftIcon={<PlusIcon size='24' color='#fff' />} >Save Changes</Button>
            </Box>
        </Box>
    )
}