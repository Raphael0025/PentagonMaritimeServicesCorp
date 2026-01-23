'use client'

import React, { useState } from 'react'
import { Box, Text, Textarea, Spinner, Center, Button, Tooltip, Checkbox, Select, FormControl, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';

import { TRAINING_BY_ID } from '@/types/trainees'

import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { handleRegStatus } from '@/handlers/trainee_handler'
import { backgroundColor, trainingModeFontColor, trainingModeColor } from '@/handlers/util_handler'

import { useRank } from '@/context/RankContext'
import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useInstructors } from '@/context/InstructorContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'

import { UPDATE_TRAINING, UPDATE_TRAINING_FORMS } from '@/lib/trainee_controller'

interface BatchedDatedProps {
    searchTerm: string;
    trainings: TRAINING_BY_ID[];
}

export default function BatchedDated ({ searchTerm, trainings }: BatchedDatedProps){
    const toast = useToast()
    const { data: allRanks } = useRank()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allInstructors } = useInstructors()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allRegData } = useRegistrations()

    const [loading, setLoading] = useState<boolean>(false)

    const [remarks, setRemarks] = useState<string>('')
    const [t_id, setID] = useState<string>('')

    const { isOpen: isOpenRemarks, onOpen: onOpenRemarks, onClose: onCloseRemarks } = useDisclosure()
    
    const handleComplianceStatus = (trainingID: string, complianceForm: string) => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat: Partial<TRAINING_BY_ID> = {}
                    switch(complianceForm){
                        case 'attendance':
                            const currentAttendance = trainings?.find(t => t.id === trainingID)?.attendance || false
                            updateStat.attendance = !currentAttendance
                            break;
                        case 'assessment':
                            const currentAssessment = trainings?.find(t => t.id === trainingID)?.assessment || false
                            updateStat.assessment = !currentAssessment
                            break;
                        case 'ccr':
                            const currentCcr = trainings?.find(t => t.id === trainingID)?.ccr || false
                            updateStat.ccr = !currentCcr
                            break;
                        case 'evaluation':
                            const currentEvaluation = trainings?.find(t => t.id === trainingID)?.evaluation || false
                            updateStat.evaluation = !currentEvaluation
                            break;
                        default:
                            break;
                    }
                    await UPDATE_TRAINING_FORMS(trainingID, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast(`${complianceForm.charAt(0).toUpperCase()+complianceForm.slice(1)} Successfully Complied!`, `Trainee has complied their ${complianceForm}.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
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

    const handleStatus = async (trainingID: string, newStatus: number) => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat = {
                        reg_status: newStatus,
                    }
                    await UPDATE_TRAINING(trainingID, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Status Updated Successfully!', `Crew's training status has been updated successfully.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
        })
    }

    const handleRemarks = () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat = {
                        train_remarks: remarks,
                    }
                    await UPDATE_TRAINING(t_id, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Remarks Saved Successfully!', ``, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setRemarks('')
            setID('')
            setLoading(false)
        })
    }

    const formatTrainingDate = (endDate?: string, startDate?: string) => {
        const dateStr = endDate || startDate
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return '-'
        // Add 1 day
        date.setDate(date.getDate() + 1)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }

    return(
        <>
        <Box h='650px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}} >
            {/** Headers */}
            <Box w='1850px' bgColor='blue.700' position='sticky' top='0' zIndex='10' mb='2' color='white' display='flex' textAlign='center' className='space-x-3' alignItems='center' borderRadius='5px' borderColor='gray' borderWidth='1px' borderStyle='solid' p='2'>
                    <Text w='15px'>#</Text>
                    <Text w='100px'>Date Created</Text>
                    <Text w='50px'>Batch No.</Text>
                    <Text w='145px'>Certificate No.</Text>
                    <Text w='280px'>Trainee Name</Text>
                    <Text w='80px'>Course</Text>
                    <Text w='150px'>Date Released</Text>
                    <Text w='100px'>Charge</Text>
                    <Text w='105px'>Status</Text>
                    <Text w='200px'>Company</Text>
                    <Text w='150px'>Crewing</Text>
                    <Text w='300px'>Notes</Text>
            </Box>
            {/** Current Month Data Table */}
            <Box>
            {!trainings ? (
                <Center py={8}>
                    <Spinner size="lg" color="blue.500" mr={3} />
                    <Text fontWeight="medium" color="gray.600">Loading current month training records...</Text>
                </Center>
            ) : trainings.length === 0 ? (
                <Center py={8}>
                    <Text fontWeight="medium" color="gray.500">No training records found.</Text>
                </Center>
            ) : (trainings?.map((training: TRAINING_BY_ID, index: number) => {
                    const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                    const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                    //const reg_id = allRegData?.find((reg) => 
                    const trainingMode = courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `${courseBatch.find((batch) => batch.id === training.batch)?.training_mode}` : ''

                    if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                ){
                    return(
                        <Box key={training.id} _hover={{bgColor: 'blue.100', color: 'black'}} borderRadius='5px' color={training.reg_status === 7 ? 'white' : 'black'} w='1850px' fontWeight='normal' mb='1' className="flex text-center border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                <Box px='1' className='w-full flex space-x-3'>
                                    <Text w="15px" textAlign='center'>{`${(index + 1)}.`}</Text>                                                                             
                                    <Text w="100px">{formatTrainingDate(training.end_date, training.start_date)}</Text>                                                                             
                                    <Text w="50px">
                                        {`${courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `B${courseBatch.find((batch) => batch.id === training.batch)?.batch_no}` : ''}`}
                                    </Text>                                        
                                    <Text w="150px" _hover={{color: 'blue.700'}} onClick={() => {
                                        // setRegNum(reg_id); 
                                        // onOpenReg();
                                        }} className='hover:cursor-pointer'>
                                        {`${training.cert_no}`}
                                    </Text>                                   
                                    <Text w="280px">{`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''} ${trainee.suffix || ''}`}</Text>                                        
                                    <Text w="80px">
                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                    </Text> 
                                </Box>
                            </Box>
                            <Text w="150px" >{(training.cert_status !== 0 ? parsingTimestamp(training.cert_released).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric', year: 'numeric'}) : '')}</Text>  
                            <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                            <Text w="105px" >{training.cert_status === 0 ? 'PENDING' : 'RELEASED'}</Text>  
                            <Tooltip className='text-center' aria-label='tooltip' label={allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}>
                                <Text w="200px" noOfLines={1} className='text-wrap'>
                                    {allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}
                                </Text>    
                            </Tooltip>
                            <Tooltip className='text-center uppercase' aria-label='tooltip' label={trainee.endorser}>
                                <Text w="150px" noOfLines={1} className='text-wrap uppercase' >{trainee.endorser}</Text>    
                            </Tooltip>  
                            <Button onClick={() => { setID(training.id); setRemarks(training.train_remarks); onOpenRemarks(); }} size='sm' p={0} variant='link' w='300px'>
                                <Text fontWeight='normal' color={training.reg_status === 7 ? 'white' : 'black'}>
                                    {training.train_remarks === '' ? 'None' : training.train_remarks}
                                </Text>
                            </Button>                                     
                        </Box>
                    )
                }
            }))}
            </Box>
        </Box>
        <Modal isOpen={isOpenRemarks} scrollBehavior='inside' onClose={() => {setRemarks(''); setID(''); onCloseRemarks();}}>
            <ModalOverlay />
            <ModalContent px='2'>
                <ModalHeader>Training Remarks</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder='Type here your remarks...' fontWeight='normal' shadow='md' minH='150px'></Textarea>
                    </FormControl>
                </ModalBody>
                <ModalFooter display='flex' borderTopWidth='1px' borderColor='gray.500'>
                    <Button onClick={handleRemarks} isLoading={loading} loadingText='Saving...' colorScheme='blue' shadow='md' size='sm' bgColor='blue.700'>Save Remarks</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}