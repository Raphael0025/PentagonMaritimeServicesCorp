'use client'

import { useState, useEffect, useRef} from 'react'

import { Box, Text, useToast, Menu, MenuButton, MenuList, MenuItem, useDisclosure, Button, Modal, ModalOverlay, ModalHeader, ModalContent, ModalBody, ModalFooter, ModalCloseButton, } from '@chakra-ui/react'

import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { CourseBatchByID } from '@/types/course-batches'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useRank } from '@/context/RankContext'

import { getFormatDateWithTime } from '@/handlers/util_handler'

import { CreateBatch, EditBatch } from '@/Components/Modal/Batches'
//import { AttendanceForm, CCR } from '@/Components/Page/Forms/TrainingForms'
import { PreviewAttendance, PreviewCCR } from '@/Components/Page/Forms'

import { useReactToPrint } from 'react-to-print'

interface PageProps {
    params: { slug: string[] };
}

export default function Page({params}: PageProps){
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { allData: allTrainingData } = useTraining()
    const { allData: allRegistrations } = useRegistrations()
    const { data: allRanks } = useRank()
    const { courseCodes } = useClients()

    const { isOpen: isOpenMod, onOpen: onOpenMod, onClose: onCloseMod } = useDisclosure()
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
    const { isOpen: isOpenRemove, onOpen: onOpenRemove, onClose: onCloseRemove } = useDisclosure()
    const { isOpen: isOpenER, onOpen: onOpenER, onClose: onCloseER } = useDisclosure()

    const [updateDate, setUpdateDate] = useState<Date | null>(new Date())
    const [hasSelectedBatch, setSelectBatch] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [batch, setBatch] = useState<string>('')
    const [batchID, setBatchID] = useState<string>('')
    const [form, setForm] = useState<string>('')
    const [startD, setStartD] = useState<string>('')
    const [endD, setEndD] = useState<string>('')
    const [batchDetails, setBatchDetails] = useState<CourseBatchByID | null>(null)

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `B${batch} ${form}.pdf`,
    })

    // Extract course ID from slug
    const courseID = Array.isArray(params.slug) && params.slug.length > 0 ? params.slug[0] : undefined;
    // Find the course
    const course = allCourses?.find((course) => course.id === courseID)
    // ====================================================================================
    const [actor, setActor] = useState<string | null>('')
    const [rank, setRank] = useState<number | null>(0)
    const [dept, setDept] = useState<string | null>('')
    const [classification, setClass] = useState<number | null>(0)
    
    useEffect(() => {
        const fetchData = () => {
            const getActor = localStorage.getItem('customToken')
            setActor(getActor)

            const getDept = localStorage.getItem('departmentToken')
            const getRank = localStorage.getItem('rankToken')

            const rankArr = getRank ? getRank.split('/') : []
            const deptArr = getDept ? getDept.split('/') : []

            const targetDept = 'Registration'

            const index = deptArr.indexOf(targetDept)
            if(index !== -1){
                const correspondRank = rankArr[index]
                const correspondDept = deptArr[index]
                setRank(Number(correspondRank))
                setDept(correspondDept)
            }
        }
        fetchData()
    },[])

    useEffect(() => {
        if(rank !== null){
            if(rank < 3){
                setClass(0)
            } else {
                setClass(1)
            }
        }
    }, [rank])
    // ====================================================================================
    if (!courseID) return 
    
    const matchedCourseAndCompanyCourse = courseCodes?.filter((courseCode) => courseCode.id_course_ref === courseID).map((courseCode) => courseCode.id)
    
    // const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
    //     toast({
    //         title: title,
    //         description: desc,
    //         position: 'top-right',
    //         variant: 'left-accent',
    //         status: status,
    //         duration: timer,
    //         isClosable: true,
    //     })
    // }

    return(
    <>
        <main>
            <Box className='space-x-4 flex'>
                <Text className='text-lg' color='gray.600'>Course Code:</Text>
                <Text className='text-lg'>{course?.course_code.toUpperCase()}</Text>
                <Text className='text-lg' color='gray.600'>Course:</Text>
                <Text className='text-lg'>{course?.course_name.toUpperCase()}</Text>
            </Box>
            <Box className='p-3 flex space-x-3'>
                <Box w='30%'>
                    <Box display='flex' alignItems='end' justifyContent='space-between'>
                        <Text className='text-lg'>Batch List</Text>
                    </Box>
                    <Box className='p-4 space-y-3 w-full'>
                        <Box fontSize='14px' color='gray.600' className='w-full flex border-b p-3 space-x-4 items-center'>
                            <Text textAlign='center' w='30%'>Batch #</Text>
                            <Text textAlign='center' w='100%'>Schedule</Text>
                            <Text w='40%'>No. of Days</Text>
                        </Box>
                        {courseBatch && courseBatch.filter((batch) => batch.course === course?.id).length > 0 ? 
                            courseBatch && courseBatch.filter((batch) => batch.course === course?.id)
                            .sort((a,b) => {
                                return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
                            })
                            .map((batch) => (
                                <Box onClick={() => {setBatchDetails(batch); setBatch(batch.batch_no.toString()); setEndD(batch.end_date); setStartD(batch.start_date); setSelectBatch(true); setUpdateDate(batch.updateAt.toDate()); setBatchID(batch.id)}} key={batch.id} className='w-full hover:bg-sky-200 hover:cursor-pointer transition duration-75 delay-75 ease-in-out p-3 border-b'>
                                    <Box className='w-full flex space-x-4 items-center '>
                                        <Text textAlign='center' w='30%'>{batch.batch_no}</Text>
                                        <Text textAlign='center' w='100%'>{`${batch.start_date} ${batch.end_date !== '' ? ` to ${batch.end_date}` : ''}`}</Text>
                                        <Text w='40%'>{batch.numOfDays === 1 ? `${batch.numOfDays} Day` : `${batch.numOfDays} Days`}</Text>
                                    </Box>
                                    <Box mt='3' display='flex' alignItems='center'>
                                        <Text fontSize='11px' as='span' color='gray.500' mr='3'>Created At:</Text>
                                        <Text fontSize='11px' as='span' color='gray.600' fontWeight='normal'>{getFormatDateWithTime(batch.createdAt.toDate())}</Text>
                                    </Box>
                                </Box>
                            )) : (
                                <Text textAlign='center' fontSize='md'>No Batches Created for this course.</Text>
                            )
                        }
                    </Box>
                </Box>
                <Box w='70%' className='border shadow-md space-y-3 w-full p-5'>
                    <Box className='flex justify-between'>
                        <Text w='100px' className='text-gray-500 text-lg'>{`Batch# ${batch}`}</Text>
                        <Text color='gray.600' textTransform='uppercase' className='text-lg'>List of Trainees</Text>
                        <Box>
                            <Menu isLazy >
                                <MenuButton onClick={(e) => {e.stopPropagation();}} fontWeight='normal' isDisabled={batch===''} as={Button} bgColor='#1C437E' colorScheme='blue' size='sm' shadow='md'>Preview Forms</MenuButton>
                                <MenuList>
                                    <MenuItem onClick={(e) => {e.stopPropagation(); onOpenER(); setForm('Attendance Form');}} fontSize='16px' display='flex' justifyContent={'center'}>
                                        <Text fontWeight={'normal'}>Attendance</Text>
                                    </MenuItem>
                                    <MenuItem onClick={(e) => {e.stopPropagation(); onOpenER(); setForm('Course Completion Report');}} fontSize='16px' display='flex' justifyContent={'center'}>
                                        <Text fontWeight={'normal'}>Course Completion</Text>
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </Box>
                    </Box>
                    <Box w='100%' className='space-y-3'>
                        <Box borderBottomWidth='1px' borderColor='gray.400' color='gray.600' className='flex space-x-4 p-3 text-center uppercase' w='100%'>
                            <Text w='20%'>No.</Text>
                            <Text w='100%'>Name of Trainee</Text>
                            <Text w='100%'>Date of Birth</Text>
                            <Text w='100%'>Rank/Position</Text>
                            <Text w='100%'>Date of Enrollment</Text>
                            <Text w='100%'>Registration No.</Text>
                        </Box>
                        {allTrainingData?.filter((training) => (training.course === course?.id || matchedCourseAndCompanyCourse?.includes(training.course)) && training.batch.toString() === batchID)
                        .slice() // Create a shallow copy to avoid mutating the original array
                        .sort((a, b) => {
                            const regNoA = allRegistrations?.find((r) => r.id === a.reg_ref_id)?.reg_no || '';
                            const regNoB = allRegistrations?.find((r) => r.id === b.reg_ref_id)?.reg_no || '';
                    
                            // Extract numeric parts of the registration number
                            const [yearA, numberA] = regNoA.split('-').map(Number);
                            const [yearB, numberB] = regNoB.split('-').map(Number);
                    
                            // Compare by year first, then by number
                            if (yearA !== yearB) {
                                return yearA - yearB;
                            }
                            return numberA - numberB;
                        }).map((training, index) => {
                            const registrations = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                            const trainee = allTrainee?.find((t) => t.id === registrations?.trainee_ref_id)
                            return(
                                <Box key={training.id} w='100%'>
                                    <Box className='flex space-x-4 p-3 text-center uppercase' w='100%'>
                                        <Text w='20%'>{(index + 1)}</Text>
                                        <Text w='100%'>{`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name.charAt(0)}.`}`}</Text>
                                        <Text w='100%'>
                                            {trainee?.birthDate
                                            ? parsingTimestamp(trainee.birthDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric',
                                            })
                                            : ''}
                                        </Text>
                                        <Text w='100%'>{allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}</Text>
                                        <Text w='100%'>{parsingTimestamp(training?.date_enrolled).toLocaleDateString('en-US', {  year: 'numeric', month: 'numeric',  day: '2-digit',})}</Text>
                                        <Text w='100%'>{`Reg-${registrations?.reg_no}`}</Text>
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                    <Box mt='4' py='3' borderTopWidth='1px' borderColor='gray.400'>
                        <Text display='flex'>
                            <Text mr='4' as='span'>Updated as of:</Text>
                            <Text fontWeight='normal' as='span'>{`${hasSelectedBatch ? getFormatDateWithTime(updateDate) : ''}`}</Text>
                        </Text>
                    </Box>
                </Box>
            </Box>
        </main>
        {/** Attendance & CCR */}
        <Modal size='full' isOpen={isOpenER} onClose={onCloseER} >
            <ModalOverlay />
            <ModalContent px={4} pb='28'>
                <ModalHeader color='blue.700'>{`Preview of ${form}`}</ModalHeader>
                <ModalCloseButton />
                <ModalBody display={'flex'} flexDir='column' alignItems='center' >
                    {form === 'Attendance Form' ? (
                        <PreviewAttendance onClose={onCloseER} batch={batchDetails} batch_no={batch} batchID={batchID} courseID={course?.id ?? ''} start_date={startD} end_date={endD} course={`${course?.course_name === undefined ? '' : `${course?.course_name}`}`} courseCode={`${course?.course_code === undefined ? '' : `${course?.course_code}`}`} />
                    ) : form === 'Course Completion Report' && (
                        <PreviewCCR onClose={onCloseER} batch={batchDetails} batch_no={batch} batchID={batchID} courseID={course?.id ?? ''} start_date={startD} end_date={endD} course={`${course?.course_name === undefined ? '' : `${course?.course_name}`}`} courseCode={`${course?.course_code === undefined ? '' : `${course?.course_code}`}`} />
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
    )
}
