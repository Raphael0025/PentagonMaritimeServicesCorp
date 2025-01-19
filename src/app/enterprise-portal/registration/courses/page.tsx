'use client'

import { Timestamp } from 'firebase/firestore'
import React, {useState, useRef, useEffect} from 'react'
import { Box, Text, Tooltip, Input, InputLeftAddon, InputGroup, useDisclosure, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, AlertDialog, AlertDialogCloseButton, AlertDialogBody, AlertDialogHeader, AlertDialogOverlay, AlertDialogFooter, AlertDialogContent, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@chakra-ui/react'
import {useCategory} from '@/context/CategoryContext'
import { addTypeCatalog } from '@/lib/type-controller'

import { useCourses } from '@/context/CourseContext'

import NewCourseForm from '@/Components/NewCourseForm'
import EditCourseForm from '@/Components/EditCourseForm'
import { CloseIcon, EditIcon, SearchIcon } from '@/Components/Icons'

import { ToastStatus, parseTrainingSchedule } from '@/types/handling'
import { generateDateRanges } from '@/handlers/course_handler'
import { formatTime  } from '@/handlers/course_handler'
import { CoursesById } from '@/types/courses'

import { deleteCourse } from '@/lib/course_controller'

export default function Page(){
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allCategories } = useCategory()

    const [loading, setLoading] = useState<boolean>(false)

    const [numRef, setNumRef] = useState<number>(0)

    const [dayRef, setDayRef] = useState<string>('')
    const [startTimeRef, setStartTimeRef] = useState<Timestamp>(Timestamp.now())
    const [endTimeRef, setEndTimeRef] = useState<Timestamp>(Timestamp.now())
    const [search, setSearch] = useState<string>('')

    const [courseData, setCourseData] = useState<CoursesById[]>([])
    const [dates, setDateRange] = useState<string[]>([])

    const trainingSchedRef = useRef<HTMLButtonElement>(null)

    const { isOpen: isScheduleOpen, onOpen: openSchedule, onClose: closeSchedule } = useDisclosure()
    const { isOpen: isVesselOpen, onOpen: onVesselOpen, onClose: onVesselClose } = useDisclosure()

    useEffect(() => {
        const fetchData = () => {
            if(!allCourses) return
            const sortedCourses: CoursesById[] = [...allCourses].sort((a: CoursesById, b: CoursesById) =>
                a.course_code.localeCompare(b.course_code)
            )
            setCourseData(sortedCourses)
        }
        fetchData()
    }, [allCourses])

    const filteredCourses = courseData.filter((course) => {
        const lowerCaseSearchTerm = search.toLowerCase()
        return (
            course.course_code.toLowerCase().includes(lowerCaseSearchTerm) ||
            course.course_name.toLowerCase().includes(lowerCaseSearchTerm) ||
            course.code.toLowerCase().includes(lowerCaseSearchTerm) 
        )
    })

    const handleRange = (day: string, numOfDays: number) => {
        const dateRanges = generateDateRanges(day, 5, numOfDays.toString());
        setDateRange(dateRanges)
    }

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

    return(
    <>
        <main className='w-full space-y-3'>
            <Box>
                <Text className='text-lg text-sky-700'>{`Courses`}</Text>
            </Box>
            <Box className='flex space-x-4' >
                <Box className='w-full space-y-3' >
                    <Box className='flex items-center justify-between'>
                        <Box className='w-1/2' _hover={{boxShadow:'4px 4px 6px 0px #e6e6e6, 0 0px 0px rgba(0, 0, 0, .15)'}}>
                            <InputGroup >
                                <InputLeftAddon  >
                                    <SearchIcon size={'20'} color={'#a1a1a1'} />
                                </InputLeftAddon> 
                                <Input onChange={(e) => setSearch(e.target.value)} value={search} placeholder='Search by Code, Course Code or Name...' type='text' fontSize='sm' borderRadius='5px' autoComplete='off'  _focus={{ boxShadow:'0px 0px 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                            </InputGroup>
                        </Box>
                    </Box>
                    <Box className='space-y-3 ' style={{height: '750px'}}>
                        <Box className='h-full space-y-2'> 
                            <Box className='border-b py-2 px-2 bg-sky-700 rounded  border-gray-400 flex justify-between'>
                                <Text className='text-center text-white w-2/5 '>Course Code</Text>
                                <Text className='text-center text-white w-full '>Course</Text>
                                <Text className='text-center text-white w-1/2 '>Course Fee (Php)</Text>
                                <Text className='text-center text-white w-1/2 '>Training Mode</Text>
                                <Text className='text-center text-white w-1/2 '>Course Type</Text>
                                <Text className='text-center text-white w-1/2 '>Training Schedules</Text>
                            </Box>
                            <Box className='space-y-2' style={{ height: 'calc(100% - 50px)', overflowY: 'scroll' }}>
                            {filteredCourses.length === 0 ? (
                                <Box className='text-center text-lg p-3 text-gray-500 font-semibold'>No Courses Available.</Box>
                            ) : (
                                filteredCourses.map((course) => (
                                    <Box key={course.id} className='flex items-center justify-center w-full bg-gray-rounded p-3 border border-gray-300 shadow-md'>
                                        <Text fontSize='12px' className='text-center uppercase font-semibold w-2/5'>{course.course_code}</Text>
                                        <Text fontSize='12px' className='text-wrap uppercase text-center w-full'>{course.course_name}</Text>
                                        <Text fontSize='12px' className='text-center w-1/2 font-semibold'>{course.course_fee}</Text>
                                        <Text fontSize='12px' className='text-center w-1/2 font-semibold'>{course.trainingMode === 0 ? 'Non-Simulator' : 'Simulator'}</Text>
                                        <Text fontSize='12px' className='text-center w-1/2 font-semibold'>{course.courseType === 0 ? 'Marina' : 'In-House'}</Text>
                                        <Box className='flex w-1/2 justify-center'>
                                            <Button variant='ghost' colorScheme='blue' size='sm' ref={trainingSchedRef} onClick={() => {openSchedule(); setDayRef(course.day); setNumRef(course.numOfDays); setStartTimeRef(course.startTime); setEndTimeRef(course.endTime); handleRange(course.day, course.numOfDays)}} >
                                                <Text fontSize='12px'>
                                                    View Schedule
                                                </Text>
                                            </Button>
                                        </Box>
                                    </Box>
                                ))
                            )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </main>
        {/** Training Schedules */}
        <Modal onClose={closeSchedule}  size='sm' scrollBehavior='inside' isOpen={isScheduleOpen}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Training Schedules</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className='flex flex-col space-y-6 justify-center'>
                        <Box className='flex space-x-6 justify-between'>
                            <Box className='flex space-x-6'>
                                <Text fontSize='14px' color='#a1a1a1' as='b'>Day:</Text>
                                <Text fontSize='14px' as='b'>{dayRef}</Text>
                            </Box>
                            <Box className='flex space-x-6'>
                                <Text fontSize='14px' color='#a1a1a1' as='b'>Number of Days:</Text>
                                <Text fontSize='14px' as='b'>{numRef}</Text>
                            </Box>
                        </Box>
                        <Box className='flex flex-col space-y-2'>
                            <Text fontSize='14px' as='b' color='#a1a1a1'>Schedule Dates:</Text>
                            <Box className='flex flex-col space-y-6'>
                                {dates.map((date, index) => (
                                    <Text className='p-2 rounded bg-slate-200 w-full' textAlign='center' key={index} fontSize='14px'>{date}</Text>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
    )
}