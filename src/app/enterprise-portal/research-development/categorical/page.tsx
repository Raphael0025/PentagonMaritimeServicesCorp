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

    const { isOpen: isVesselOpen, onOpen: onVesselOpen, onClose: onVesselClose } = useDisclosure()
    const [loading, setLoading] = useState<boolean>(false)
    const [vessel, setVessel] = useState<string>('')

    const [numRef, setNumRef] = useState<number>(0)

    const [dayRef, setDayRef] = useState<string>('')
    const [startTimeRef, setStartTimeRef] = useState<Timestamp>(Timestamp.now())
    const [endTimeRef, setEndTimeRef] = useState<Timestamp>(Timestamp.now())
    const [idRef, setIdRef] = useState<string>('')
    const [courseName, setCourse] = useState<string>('')
    const [search, setSearch] = useState<string>('')

    const [courseData, setCourseData] = useState<CoursesById[]>([])
    const [dates, setDateRange] = useState<string[]>([])

    const trainingSchedRef = useRef<HTMLButtonElement>(null)
    const cancelRef = useRef<HTMLButtonElement>(null)
    const viewRef = useRef<HTMLButtonElement>(null)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isScheduleOpen, onOpen: openSchedule, onClose: closeSchedule } = useDisclosure()
    const { isOpen: isModOpen, onOpen: openViewModal, onClose: closeMod } = useDisclosure()
    const { isOpen: deleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure()

    const handleClose = () => {onClose()}
    const handleCloseEdit = () => {closeMod()}

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

    const onChangeVessel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setVessel(value)
    }

    const handleSaveVessel = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')

            await addTypeCatalog('Vessel', vessel, 'categorical', actor)
        }catch(error){

        }finally{
            setLoading(false)
            handleToast('Save Successfully', 'New Data added...', 4000, 'success')
            setVessel('')
            onVesselClose()
        }
    }

    const handleDelete = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')
            await deleteCourse(idRef, courseName, actor)
            handleToast('Course Deleted Successfully', `You have Deleted a Course.`, 4000, 'success')

        }catch(error){
            throw error
        }finally{
            setLoading(false)
        }
    }

    return(
    <>
        <main className='w-full space-y-3'>
            <Box>
                <Text className='text-lg text-sky-700'>{`Vessel's & Courses`}</Text>
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
                        <Button onClick={onOpen} colorScheme='blue' size='sm'>Add Course</Button>
                    </Box>
                    <Box className='space-y-3 ' style={{height: '750px'}}>
                        <Box className='h-full space-y-2'> 
                            <Box className='border-b py-2 px-2 bg-sky-700 rounded  border-gray-400 flex justify-between'>
                                {/* <Text className='text-center text-white w-2/5 '>Code</Text> */}
                                <Text className='text-center text-white w-2/5 '>Course Code</Text>
                                <Text className='text-center text-white w-full '>Course</Text>
                                <Text className='text-center text-white w-1/2 '>Course Fee (Php)</Text>
                                <Text className='text-center text-white w-1/2 '>Training Mode</Text>
                                <Text className='text-center text-white w-1/2 '>Course Type</Text>
                                <Text className='text-center text-white w-1/2 '>Training Schedules</Text>
                                <Text className='text-center text-white w-2/5 '>Action</Text>
                            </Box>
                            <Box className='space-y-2' style={{ height: 'calc(100% - 50px)', overflowY: 'scroll' }}>
                            {filteredCourses.length === 0 ? (
                                <Box className='text-center text-lg p-3 text-gray-500 font-semibold'>No Courses Available.</Box>
                            ) : (
                                filteredCourses.map((course) => (
                                    <Box key={course.id} className='flex items-center justify-center w-full bg-gray-rounded p-3 border border-gray-300 shadow-md'>
                                        {/* <Text fontSize='12px' className='text-center uppercase font-semibold w-2/5'>{course.code}</Text> */}
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
                                        <Box className='flex w-2/5 justify-center'>
                                            <Button size='sm' variant='ghost' colorScheme='blue' ref={viewRef} onClick={() => {openViewModal(); setIdRef(course.id)}}><EditIcon size={'24'} color={'#0D70AB'} /></Button>
                                            <Button size='sm' variant='ghost' colorScheme='red' ref={cancelRef} onClick={() => {openDeleteDialog(); setCourse(course.course_code); setIdRef(course.id)}}><CloseIcon /></Button>
                                        </Box>
                                    </Box>
                                ))
                            )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box className='w-1/4 shadow-md p-3 space-y-3 rounded outline outline-1 outline-gray-300'>
                    <Box className='flex justify-between'>
                        <Text className='text-gray-400'>Vessel Types</Text>
                        <Button onClick={onVesselOpen} colorScheme='blue' size='sm'>Add Vessel</Button>
                    </Box>
                    <Box className=''>
                        <Box className='border-b py-2 px-2 border-gray-400 flex justify-between'>
                            <Text className='text-gray-600'>Vessel</Text>
                            <Text className='text-gray-600'>Action</Text>
                        </Box>
                        {allCategories && allCategories.filter(category => category.category === 'categorical' && category.selectedType === 'Vessel')
                        .map((natData) => (
                            <Box className='flex justify-between p-2' key={natData.id}>
                                <Text className='uppercase'>{natData.type}</Text>
                                <Text>{``}</Text>
                            </Box>
                        ))}
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
                        {/* <Box className='flex space-x-4'>
                            <Text fontSize='14px' color='#a1a1a1' as='b'>Time Schedule:</Text>
                            <Text fontSize='14px' as='b'>{formatTime(startTimeRef, endTimeRef)}</Text>
                        </Box> */}
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
        {/** New Course */}
        <Modal onClose={onClose} closeOnOverlayClick={false} size='xl' scrollBehavior='inside' isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create New Course</ModalHeader>
                <ModalBody>
                    <NewCourseForm onClose={handleClose} />
                </ModalBody>
            </ModalContent>
        </Modal>
        {/** Edit Course */}
        <Modal onClose={closeMod}  size='xl' scrollBehavior='inside' isOpen={isModOpen}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Course Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <EditCourseForm onClose={handleCloseEdit} id={idRef} />
                </ModalBody>
            </ModalContent>
        </Modal>
        {/** Delete Dialog */}
        <AlertDialog isOpen={deleteDialogOpen} leastDestructiveRef={cancelRef} onClose={closeDeleteDialog}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>{`Delete Course?`}</AlertDialogHeader>
                    <AlertDialogBody>
                        <Text fontSize='lg' textAlign='center'>{`Are you sure you want to delete this course? You can't undo this action afterwards.`}</Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={closeDeleteDialog}>
                            {`No, I don't`}
                        </Button>
                        <Button colorScheme='red' isLoading={loading} loadingText='Deleting...' onClick={() => {closeDeleteDialog(); handleDelete();}} ml={3}>
                            Yes, Delete it
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>

        <Modal isOpen={isVesselOpen} closeOnOverlayClick={false} size='xl' onClose={onVesselClose} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-sky-700'>{`Add Vessel`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className='space-y-3'>
                        <InputGroup>
                            <InputLeftAddon>Vessel Type</InputLeftAddon>
                            <Input id='rankCode' onChange={onChangeVessel} value={vessel.toUpperCase()} />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onVesselClose}>Cancel</Button>
                    <Button isDisabled={vessel === ''} onClick={handleSaveVessel} ml={3} colorScheme='blue' isLoading={loading} loadingText='Saving...'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}