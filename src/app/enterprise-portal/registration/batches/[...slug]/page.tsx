'use client'

import { useState, useEffect, useRef} from 'react'

import { Box, Text, Heading, Tooltip, Input, useToast, Menu, MenuButton, MenuList, MenuItem, FormControl, Radio, Select, RadioGroup, Switch, VStack, HStack, useDisclosure, Button, Modal, ModalOverlay, ModalHeader, ModalContent, ModalBody, ModalFooter, } from '@chakra-ui/react'
import 'animate.css'

import {DotsIcon, EditIcon, TrashIcon} from '@/Components/Icons'

import { ToastStatus } from '@/types/handling'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useRank } from '@/context/RankContext'

import { getFormatDateWithTime } from '@/handlers/util_handler'

import { CreateBatch, EditBatch } from '@/Components/Modal/Batches'
import { PreviewER } from '@/Components/Page/Forms'

import { useReactToPrint } from 'react-to-print'

import { DELETE_BATCH } from '@/lib/course_batches_controller'
import { UPDATE_TRAINING } from '@/lib/trainee_controller'

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

    const { isOpen: isOpenMod, onOpen: onOpenMod, onClose: onCloseMod } = useDisclosure()
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
    const { isOpen: isOpenRemove, onOpen: onOpenRemove, onClose: onCloseRemove } = useDisclosure()
    const { isOpen: isOpenER, onOpen: onOpenER, onClose: onCloseER } = useDisclosure()

    const [updateDate, setUpdateDate] = useState<Date | null>(new Date())
    const [hasSelectedBatch, setSelectBatch] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [batch, setBatch] = useState<string>('')
    const [batchID, setBatchID] = useState<string>('')
    const [e_report, setER] = useState<string>('')
    const [startD, setStartD] = useState<string>('')
    const [endD, setEndD] = useState<string>('')

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `B-${batch}ENROLLMENT_REPORT.pdf`,
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
    
    const handleBatchRemoval = async (batch_id: string) => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')

        handleToast('Processing...', `This may take some time to finish, Kindly wait for it to complete.`, 3000, 'info')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    await DELETE_BATCH(batch_id, actor) // Delete the batch document
                    // getting the training id then updating its batch value back to 1
                    await Promise.all(
                        (allTrainingData ?? [])?.filter((training) => training.course === course?.id && training.batch.toString() === batch_id)
                        .map((trainingData) => {
                            return Promise.resolve(UPDATE_TRAINING(trainingData.id, {batch: '1'}, actor))
                        })
                    )
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Batch Successfully DELETED!', `Batch# ${batch} for this course ${course?.course_code} has been deleted from the records.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error:, ', error)
        }).finally(() => {
            setLoading(false)
            onCloseRemove()
        })
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
        <main>
            <Box className='space-x-4 flex'>
                <Text className='text-lg' color='gray.600'>Course Code:</Text>
                <Text className='text-lg'>{course?.course_code}</Text>
                <Text className='text-lg' color='gray.600'>Course:</Text>
                <Text className='text-lg'>{course?.course_name}</Text>
            </Box>
            <Box className='p-3 flex space-x-3'>
                <Box w='30%'>
                    <Box display='flex' alignItems='end' justifyContent='space-between'>
                        <Text className='text-lg'>Batch List</Text>
                        <Button onClick={onOpenMod} size='xs' py='4' colorScheme='blue' fontWeight='normal' bgColor='blue.700' shadow='md'>Create Batch</Button>
                    </Box>
                    <Box className='p-4 space-y-3 w-full'>
                        <Box fontSize='14px' color='gray.600' className='w-full flex border-b p-3 space-x-4 items-center'>
                            <Text w='30%'>Batch #</Text>
                            <Text w='100%'>Schedule</Text>
                            <Text w='40%'>No. of Days</Text>
                            <Text w='30%'>Action</Text>
                        </Box>
                        {courseBatch && courseBatch.filter((batch) => batch.course === course?.id).length > 0 ? 
                            courseBatch && courseBatch.filter((batch) => batch.course === course?.id)
                            .sort((a,b) => {
                                return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
                            })
                            .map((batch) => (
                                <Box onClick={() => {setBatch(batch.batch_no.toString()); setEndD(batch.end_date); setStartD(batch.start_date); setSelectBatch(true); setUpdateDate(batch.updateAt.toDate()); setBatchID(batch.id)}} key={batch.id} className='w-full hover:bg-sky-200 hover:cursor-pointer transition duration-75 delay-75 ease-in-out p-3 border-b'>
                                    <Box className='w-full flex space-x-4 items-center '>
                                        <Text w='30%'>{batch.batch_no}</Text>
                                        <Text w='100%'>{`${batch.start_date} ${batch.end_date !== '' ? ` to ${batch.end_date}` : ''}`}</Text>
                                        <Text w='40%'>{batch.numOfDays === 1 ? `${batch.numOfDays} Day` : `${batch.numOfDays} Days`}</Text>
                                        <Box w='30%' >
                                            <Button onClick={() => {onOpenEdit(); setBatch(batch.batch_no.toString()); setBatchID(batch.id)}} size='xs' borderRadius='5px' w='100%' colorScheme='blue' className='hover:cursor-pointer'>Edit</Button>
                                            <Button onClick={() => {onOpenRemove(); setBatch(batch.batch_no.toString()); setBatchID(batch.id)}} size='xs' borderRadius='5px' w='100%' mt='2' colorScheme='red' className='hover:cursor-pointer'>Remove</Button>
                                        </Box>
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
                        <Text color='gray.600' textTransform='uppercase' className='text-lg'>Enrollment Report</Text>
                        <Box>
                            <Menu isLazy >
                                <MenuButton onClick={(e) => {e.stopPropagation();}} fontWeight='normal' isDisabled={batch===''} as={Button} bgColor='#1C437E' colorScheme='blue' size='sm' shadow='md'>Print Reports</MenuButton>
                                <MenuList>
                                    <MenuItem onClick={(e) => {e.stopPropagation(); onOpenER(); setER('STANDARD');}} fontSize='16px' display='flex' justifyContent={'center'}>
                                        <Text fontWeight={'normal'}>Standard Report</Text>
                                    </MenuItem>
                                    <MenuItem onClick={(e) => {e.stopPropagation(); onOpenER(); setER('STCW');}} fontSize='16px' display='flex' justifyContent={'center'}>
                                        <Text fontWeight={'normal'}>STCW Report</Text>
                                    </MenuItem>
                                    <MenuItem onClick={(e) => {e.stopPropagation(); onOpenER(); setER('MDS');}} fontSize='16px' display='flex' justifyContent={'center'}>
                                        <Text fontWeight={'normal'}>MDS Report</Text>
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </Box>
                    </Box>
                    <Box w='100%' className='space-y-3'>
                        <Box borderBottomWidth='1px' borderColor='gray.400' color='gray.600' className='flex space-x-4 p-3 text-center uppercase' w='100%'>
                            <Text w='20%'>No.</Text>
                            <Text w='100%'>Name of Trainees</Text>
                            <Text w='100%'>Rank</Text>
                            <Text w='100%'>Registration No.</Text>
                        </Box>
                        {allTrainingData?.filter((training) => training.course === course?.id && training.batch.toString() === batchID).map((training, index) => {
                            const registrations = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                            const trainee = allTrainee?.find((t) => t.id === registrations?.trainee_ref_id)
                            return(
                                <Box key={training.id} w='100%'>
                                    <Box className='flex space-x-4 p-3 text-center uppercase' w='100%'>
                                        <Text w='20%'>{(index + 1)}</Text>
                                        <Text w='100%'>{`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name.charAt(0)}.`}`}</Text>
                                        <Text w='100%'>{allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}</Text>
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
        {/** Generate Batch */}
        <Modal isOpen={isOpenMod} size='full' scrollBehavior='inside' onClose={onCloseMod} >
            <ModalOverlay />
            <CreateBatch onClose={onCloseMod} course_id={course?.id ?? ''} reg_Type={classification ?? 0} />
        </Modal>
        {/** Edit Batch */}
        <Modal isOpen={isOpenEdit} size='full' scrollBehavior='inside' onClose={onCloseEdit} >
            <ModalOverlay />
            <EditBatch onClose={onCloseEdit} batch_id={batchID} batchNum={Number(batch)} course_id={course?.id ?? ''} reg_Type={classification ?? 0} />
        </Modal>
        {/** Delete Batch */}
        <Modal isOpen={isOpenRemove} size='lg' onClose={onCloseRemove} >
            <ModalOverlay />
            <ModalContent px='4'>
                <ModalHeader borderBottomWidth='1px' borderColor='gray.500'>Action to Remove Batch from the Records</ModalHeader>
                <ModalBody >
                    <Text fontSize='14px' textAlign='center' fontWeight='normal'>{`Are you sure you want to remove Batch# ${batch} from the records. This action is permanent and the data cannot be restored, it might cause a gap in the records, However if it's the last batch record, then no gap will occur.`}</Text>
                    <Text fontSize='14px' mt='4' textAlign='center' fontWeight='normal'>{`If yes, kindly proceed, otherwise cancel.`}</Text>
                </ModalBody>
                <ModalFooter display='flex' justifyContent='center' borderTopWidth='1px' borderColor='gray.500'>
                    <Button variant='ghost' onClick={onCloseRemove}>No, Cancel it</Button>
                    <Button ml='3' onClick={() => handleBatchRemoval(batchID)} isLoading={loading} loadingText='Deleting Record...' colorScheme='red'>Yes, Proceed to remove</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Enrollment Reports */}
        <Modal size='full' isOpen={isOpenER} onClose={onCloseER} >
            <ModalOverlay />
            <ModalContent px={4}>
                <ModalHeader color='blue.700'>{`Preview of ${e_report} Enrollment Report`}</ModalHeader>
                <ModalBody display={'flex'} flexDir='column' alignItems='center' >
                    <PreviewER onClose={onCloseER} batch_no={batch} batchID={batchID} courseID={course?.id ?? ''} start_date={startD} end_date={endD} course={`${course?.course_name === undefined ? '' : `${course?.course_name}`}`} courseCode={`${course?.course_code === undefined ? '' : `${course?.course_code}`}`} e_report={e_report} />
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
    )
}
