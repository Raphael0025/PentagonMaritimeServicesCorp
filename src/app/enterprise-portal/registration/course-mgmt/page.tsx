'use client'

import UnderMaintenance from '@/Components/UnderMaintenance'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react';
import { Box, Button, Heading, Text, useDisclosure, TableContainer, Table, Th, Thead, Tbody, Td, Tr, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, AlertDialog, AlertDialogBody, AlertDialogFooter, useToast, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton, } from '@chakra-ui/react'
import 'animate.css'
import NewCourseForm from '@/Components/NewCourseForm'
import EditCourseForm from '@/Components/EditCourseForm'
import PromoForm from '@/Components/PromoForm'
import EditCompanyCharges from '@/Components/EditCompanyCharges'
import {generateDateRanges, calculateDates, formatTime} from '@/types/handling'

import PlusIcon from '@/Components/Icons/PlusIcon'
import EditIcon from '@/Components/Icons/EditIcon'
import CloseIcon from '@/Components/Icons/CloseIcon'
import { getAllCourses, firestore, deleteCourse } from '@/lib/controller'
import { ReadCourses } from '@/types/document'
import { collection, onSnapshot } from 'firebase/firestore'

export default function Page(){
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [courses, setCourses] = useState<ReadCourses[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [dayRef, setDayRef] = useState<string>('')
    const [numRef, setNumRef] = useState<number>(0)
    const [timeRef, setTimeRef] = useState<string>('')
    const [dates, setDateRange] = useState<string[]>([])
    const [idRef, setIdRef] = useState<string>('')
    const { isOpen: isScheduleOpen, onOpen: openSchedule, onClose: closeSchedule } = useDisclosure()
    const { isOpen: isChargesOpen, onOpen: openCompanyCharges, onClose: closeCC } = useDisclosure()
    const { isOpen: isPromoOpen, onOpen: openPromo, onClose: closePromo } = useDisclosure()
    const { isOpen: isModOpen, onOpen: openViewModal, onClose: closeMod } = useDisclosure()
    const { isOpen: deleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure()

    const trainingSchedRef = useRef<HTMLButtonElement>(null)
    const cancelRef = useRef<HTMLButtonElement>(null)
    const viewRef = useRef<HTMLButtonElement>(null)
    const ccRef = useRef<HTMLButtonElement>(null)
    const promoRef = useRef<HTMLButtonElement>(null)

    const toast = useToast()

    const handleClose = () => {
        onClose()
    }
    
    const handleCloseEdit = () => {
        closeMod()
    }

    const handleClosePromo = () => {
        closePromo()
    }

    const handleCloseCompany = () => {
        closeCC()
    }

    // Example usage:
    // const start = "2024-05-08";
    // const end = "2024-05-29";
    // const days = 1;
    // const occurrence = "Wednesday";
    
    // const dated = calculateDates(start, end, days, occurrence);
    // console.log(dated);
    
    // Example usage
    //const dateRanges = generateDateRanges('Monday', 4, 5);
    const handleRange = (day: string, numOfDays: number) => {
        const dateRanges = generateDateRanges(day, 5, numOfDays.toString());
        setDateRange(dateRanges);
        console.log(dateRanges)
    }

    const db = firestore

    useEffect(() => {
        const fetchData = async () => {
            try {

                const data = await getAllCourses()
                setCourses(data)

                setLoading(false); // Data fetching completed, set loading to false
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false); // Set loading to false even if there's an error
            }
        }

        // Fetch initial data
        fetchData();

        // Set up real-time listener for database changes
        const courseCollection = collection(db, 'course_mgmt');
        const unsubscribe = onSnapshot(courseCollection, (snapshot) => {
            fetchData(); // Fetch data again when database changes
        });
        // Clean up subscription
        return () => {
            unsubscribe(); // Unsubscribe from the real-time listener when component unmounts
        };
    }, []);

    const handleDelete = async () => {
        await deleteCourse(idRef)
    }

    return(
        <>
            <main className='flex flex-col space-y-4 gap-4'>
                <section className='p-2 rounded flex justify-between items-center '>
                    <Heading as='h6' size='md' m={0} color='#a1a1a1'>Course Management</Heading>
                    <Button onClick={() => onOpen()} py={'10px'} bg='#1C437E' className='flex space-x-2' color='white' _hover={{ bg: `blue.600` }}>
                        <PlusIcon />
                        <span className='text-xs'>Add Course</span>
                    </Button>
                </section>
                <section className=' rounded border border-slate-500'>
                    <TableContainer>
                        <Table>
                            <Thead>
                                <Tr bg='gray.600'>
                                    <Th color='white' textAlign='center'>Code</Th>
                                    <Th color='white' textAlign='center'>Course</Th>
                                    <Th color='white' textAlign='center'>Course Fee</Th>
                                    <Th color='white' textAlign='center'>Training Schedules</Th>
                                    <Th color='white' textAlign='center'>Promo</Th>
                                    <Th color='white' textAlign='center'>Company Charge</Th>
                                    <Th color='white' textAlign='center'>Action</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan={7} textAlign="center">Loading...</Td>
                                </Tr>
                            ) : (
                                <>
                                {courses.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={7} textAlign="center">No Courses available</Td>
                                    </Tr>
                                ) : (
                                    courses.map((course: ReadCourses) => (
                                        <>
                                        <Tr key={course.id}>
                                            <Td textAlign='center'>{course.course_code}</Td>
                                            <Td textAlign='center'>{course.course_name}</Td>
                                            <Td textAlign='center'>{course.course_fee}</Td>
                                            <Td textAlign='center'>
                                                <button className='rounded p-3 bg-slate-200' ref={trainingSchedRef} onClick={() => {openSchedule(); setDayRef(course.day); setNumRef(course.numOfDays); setTimeRef(course.timeSched); handleRange(course.day, course.numOfDays)}}>
                                                    View Schedule
                                                </button>
                                            </Td>
                                            <Td textAlign='center'>
                                                <button className='rounded p-3 bg-slate-200' ref={promoRef} onClick={() => {openPromo(); setIdRef(course.id) }}>
                                                    View Promo
                                                </button>
                                            </Td>
                                            <Td textAlign='center'>
                                                <button className='rounded p-3 bg-slate-200' ref={ccRef} onClick={() => {openCompanyCharges(); setIdRef(course.id) }}>
                                                    View Company Charge
                                                </button>
                                            </Td>
                                            <Td>
                                                <Box className='flex justify-center space-x-2 items-center'>
                                                    <button ref={viewRef} onClick={() => {openViewModal(); setIdRef(course.id)}}>
                                                        <EditIcon />
                                                    </button>
                                                    <button ref={cancelRef} onClick={() => {openDeleteDialog(); setIdRef(course.id)}}>
                                                        <CloseIcon />
                                                    </button>
                                                </Box>
                                            </Td>
                                        </Tr>
                                        </>
                                    )))}
                                </>
                            )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </section>
            </main>
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
                            <Box className='flex space-x-4'>
                                <Text fontSize='14px' color='#a1a1a1' as='b'>Time Schedule:</Text>
                                <Text fontSize='14px' as='b'>{formatTime(timeRef)}</Text>
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
            {/** Promos */}
            <Modal onClose={closePromo}  size='xl' scrollBehavior='inside' isOpen={isPromoOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Promo Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <PromoForm onClose={handleClosePromo} id={idRef}/>
                    </ModalBody>
                </ModalContent>
            </Modal>
            {/** Company Charges */}
            <Modal onClose={closeCC}  size='sm' scrollBehavior='inside' isOpen={isChargesOpen}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Company Charge</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <EditCompanyCharges onClose={handleCloseCompany} id={idRef} />
                    </ModalBody>
                </ModalContent>
            </Modal>
            {/** Edit Course */}
            <Modal onClose={closeMod}  size='md' scrollBehavior='inside' isOpen={isModOpen}>
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
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Delete Course?
                        </AlertDialogHeader>
                        <AlertDialogBody>
                        {`Are you sure you want to delete this course? You can't undo this action afterwards.`}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={closeDeleteDialog}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={() => {closeDeleteDialog(); handleDelete(); toast({
                                title: 'Candidate Deleted!',
                                description: "You've successfully deleted this course.",
                                position: 'top-right',
                                isClosable: true,
                                variant: 'left-accent',
                                status: 'success',
                                duration: 5000,
                            })}} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}