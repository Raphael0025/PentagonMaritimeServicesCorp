'use client'

import React, { useState, useEffect } from 'react'
import { Box, Text, Input, Textarea, Spinner, Center, Button, Checkbox, InputLeftAddon, FormControl, Select, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';
import { ChevronDownIcon } from '@chakra-ui/icons'

import { TRAINING_BY_ID } from '@/types/trainees'

import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { handleRegStatus } from '@/handlers/trainee_handler'
import { deployYDate } from '@/types/utils' 
import { fullMonth, backgroundColor, trainingModeFontColor, trainingModeColor } from '@/handlers/util_handler'

import { useRank } from '@/context/RankContext'
import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useInstructors } from '@/context/InstructorContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'

import { UPDATE_TRAINING, UPDATE_TRAINING_FORMS } from '@/lib/trainee_controller'

interface BatchedDatedProps {
    //setSched: (value: string) => void;
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
    const { courseCodes } = useClients()
    const { allData: allRegData, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

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

    return(
        <>
        <Box h='650px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}} >
            {/** Headers */}
            <Box w='2650px' bgColor='blue.700' mb='2' color='white' display='flex' textAlign='center' className='space-x-3' alignItems='center' borderRadius='5px' borderColor='gray' borderWidth='1px' borderStyle='solid' p='2'>
                <Text w='15px'>#</Text>
                <Text w='100px'>Date Endorsed</Text>
                <Text w='150px'>Registration No.</Text>
                <Text w='80px'>Type</Text>
                <Text w='80px'>Course</Text>
                <Text w='80px'>Batch</Text>
                <Text w='280px'>Trainee Name</Text>
                <Text w='50px'>Rank</Text>
                <Box display={'flex'} flexDirection='column'>
                    <Text>Training Schedule</Text>
                    <Box display='flex' className='space-x-3' justifyContent='space-between'>
                        <Text w='100px'>From</Text>
                        <Text w='100px'>To</Text>
                    </Box>
                </Box>
                <Text w='100px'>Payment Mode</Text>
                <Text w='105px'>Mode of Training</Text>
                <Text w='105px'>Status</Text>
                <Text w='185px'>Instructor</Text>
                <Text w='105px'>Attendance</Text>
                <Text w='105px'>Assessment</Text>
                <Text w='105px'>CCR</Text>
                <Text w='105px'>Feedback</Text>
                <Text w='300px'>Remarks</Text>
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
            ) : (trainings?.map((training, index) => {
                    const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                    const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                    //const reg_id = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.id ?? ''
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
                        <Box key={training.id} _hover={{bgColor: 'blue.100', color: 'black'}} borderRadius='5px' color={training.reg_status === 7 ? 'white' : 'black'} bgColor={backgroundColor(training.reg_status)} w='2650px' fontWeight='normal' mb='1' className="flex text-center border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                <Box px='1' className='w-full flex space-x-3'>
                                    <Text w="15px" textAlign='center'>{`${(index + 1)}.`}</Text>                                                                             
                                    <Text w="100px">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                    <Text w="150px" _hover={{color: 'blue.700'}} onClick={() => {
                                        // setRegNum(reg_id); 
                                        // onOpenReg();
                                        }} className='hover:cursor-pointer'>
                                        {`Reg-${reg_num}`}
                                    </Text>        
                                    <Text w="80px">
                                        {allCourses?.find((course) => course.id === training.course)?.trainingMode === 0 ? 'Non' : 'Simu' }
                                    </Text>                                
                                    <Text w="80px">
                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                    </Text>                                        
                                    <Text w="80px">
                                        {`${courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `B${courseBatch.find((batch) => batch.id === training.batch)?.batch_no}` : ''}`}
                                    </Text>                                        
                                    <Text w="280px">{`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''}`}</Text>                                        
                                    <Text w="50px">
                                        {allRanks?.find((rank) => rank.code === trainee.rank)?.rank || trainee.rank}
                                    </Text>   
                                </Box>
                            </Box>
                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                <Box className='w-full flex uppercase space-x-3'>
                                    <Text w="100px">{training.start_date}</Text>    
                                    <Text w="100px">{training.end_date === '' ? '--' : training.end_date}</Text>    
                                </Box>
                            </Box>
                            <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                            <Text w="100px" p='1' borderRadius='5px' color={trainingModeFontColor(trainingMode)} bgColor={trainingModeColor(trainingMode)}>
                                {`${trainingMode}`}
                            </Text>  
                            <Select isDisabled={loading} onChange={(e) => handleStatus(training.id, Number(e.target.value))} borderRadius='5px' size='xs' w='100px' shadow='md' >
                                <option value={3} hidden>{handleRegStatus(training.reg_status)}</option>
                                <option value={6}>Graduated</option>
                                <option value={5}>Pending</option>
                                <option value={7}>Cancelled</option>
                                <option value={8}>Absent</option>
                            </Select>
                            <Text w="180px" >
                            {(() => {
                                const trainingBatch = courseBatch?.find((batch) => batch.id === training.batch)
                                const ins = allInstructors?.find((i) => i.id === trainingBatch?.act_ins);
                                if (!ins) return trainingBatch?.act_ins || 'No Instructor';

                                // Add 'MM' if rank is 'CAPT'
                                const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                return `${ins.rank} ${ins.name}${suffix}`;
                            })()}
                            </Text>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'attendance')}} isChecked={training?.attendance} shadow='md' />
                            </Box>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'assessment')}} isChecked={training?.assessment} shadow='md' />
                            </Box>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'ccr')}} isChecked={training?.ccr} shadow='md' />
                            </Box>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'evaluation')}} isChecked={training?.evaluation} shadow='md' />
                            </Box>  
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