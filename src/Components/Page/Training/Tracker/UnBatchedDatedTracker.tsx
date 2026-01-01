'use client'

import React, { useState, useEffect } from 'react'
import { Box, Text, Input, Textarea, Spinner, Center, Button, Alert, AlertIcon, AlertTitle, AlertDescription, FormControl, InputLeftAddon, Select, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';

import { TRAINING_BY_ID } from '@/types/trainees'

import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { handleRegStatus } from '@/handlers/trainee_handler'
import { backgroundColor } from '@/handlers/util_handler'

import { useRank } from '@/context/RankContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'

import { UPDATE_TRAINING } from '@/lib/trainee_controller'

interface UnBatchedDatedProps {
    searchTerm: string;
    trainings: TRAINING_BY_ID[];
}

export default function UnBatchedDated ({ searchTerm, trainings }: UnBatchedDatedProps){
    const toast = useToast()
    const { data: allRanks } = useRank()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { allData: allRegData, } = useRegistrations()
    const { courseCodes } = useClients()

    const [loading, setLoading] = useState<boolean>(false)
    const staff: string | null = localStorage.getItem('customToken')
    const [position, setPosition] = useState<string | null>('')
    const [schedule, setSchedule] = useState<string>('')
    const [traineeName, setTraineeName] = useState<string>('')
    const [displayEmail, setEmailDisplay] = useState<string>('')
    const [time, setTime] = useState<string>('')
    const [trainingMode, setTrainingMode] = useState<string>('')
    const [courseID, setCourse] = useState<string>('')
    const [selectedEmails, setSelectedEmails] = useState<string[]>([])

    const [remarks, setRemarks] = useState<string>('')
    const [t_id, setID] = useState<string>('')

    const { isOpen: isOpenRemarks, onOpen: onOpenRemarks, onClose: onCloseRemarks } = useDisclosure()
    const {isOpen: isModOpen, onOpen: onModOpen, onClose: onModClose} = useDisclosure()

    useEffect(() => {
        const getDept = localStorage.getItem('departmentToken');
        const getPosition = localStorage.getItem('jobPositionToken')

        const posArr = getPosition ? getPosition.split('/') : []
    
        if (getDept) {
            const deptArr = getDept.split('/');
            const targetDept = 'Training';
            const index = deptArr.indexOf(targetDept);
    
            if (index !== -1) {
                const correspondPosition = posArr[index]
                setPosition(correspondPosition)
            }
        }
    }, [])
    
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

    const handleNotifyTrainees = () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout( async () => {
                try{
                    const courseFound = allCourses?.find((course) => {
                        if (course.id === courseID) {
                            return true;
                        }
                        const courseCode = courseCodes?.find((code) => code.id === courseID);
                        return course.id === courseCode?.id_course_ref;
                    });
                    const class_code = courseFound?.class_code

                    const route = trainingMode === 'olm' ? '/api/training-advise/olm-route' : '/api/training-advise/olt-route';
                    await fetch(route, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        }, 
                        body: JSON.stringify({
                            bcc: selectedEmails, 
                            course_code: courseFound?.course_code, 
                            course_name: courseFound?.course_name, 
                            schedule, 
                            time, 
                            class_code, 
                            staff, 
                            position 
                        })
                    })
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() =>{
            handleToast( 'Notified Trainee Successfully!', `Trainees have been successfully sent the training details via email.`, 5000, 'success' )
        }).catch((error) => {
            console.error('Error: ', error)
        }).finally(() =>{
            onModClose()
            setSelectedEmails([])
            setSchedule('')
            setCourse('')
            setTime('')
            setTrainingMode('')
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
                <Text w='105px'>Status</Text>
                <Text w='105px'>Action</Text>
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
                                        {(() => {
                                            const courseCode = courseCodes?.find((code) => code.id === training.course);
                                            const courseFound = allCourses?.find((course) => course.id === training.course || course.id === courseCode?.id_course_ref)
                                            return courseFound?.trainingMode === 0 ? 'Non' : 'Simu'
                                        })()}
                                    </Text>                                
                                    <Text w="80px">
                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
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
                            <Text w='100px'>
                                {handleRegStatus(training.reg_status)}
                            </Text>
                            <Button colorScheme='blue' size='xs' shadow='md' w='100px' onClick={() => {
                                    setSchedule(training.end_date !== '' ? `${training.start_date.toUpperCase()} to ${training.end_date.toUpperCase()}` : `${training.start_date.toUpperCase()}`); 
                                    setSelectedEmails(prev => [...prev, trainee.email]); 
                                    setCourse(training.course);
                                    setTraineeName(`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name}`);
                                    setEmailDisplay(trainee.email);
                                    onModOpen(); 
                                }} _hover={{cursor: 'pointer'}}>
                                Notify Trainee
                            </Button>
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
        <Modal isOpen={isModOpen} onClose={() => {setSelectedEmails([]); setSchedule(''); setCourse(''); setTime(''); setTrainingMode(''); onModClose();}} size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color='blue.700' textTransform='uppercase' fontWeight='bold'>TRAINING ADVISORY</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Alert status='info' display='flex' alignItems='start' flexDirection='column' gap={2} mb={4}>
                        <Box display='inline-flex'>
                            <AlertIcon />
                            <AlertTitle>Note:</AlertTitle>
                        </Box>
                        <AlertDescription lineHeight='0.9rem' fontWeight='normal'>
                            This will send an email notifying the trainee of the training details. Please ensure that the email address is valid and correct before proceeding, one incorrect detail may cause of not sending/advising the trainees.
                        </AlertDescription>
                    </Alert>
                    <Box>
                        <Box display='flex' flexDir='column' justifyContent='space-between'>
                            <Box mb='2'>
                                <Text color='gray.600'>{`This will send the training details to the trainee below:`}</Text>
                                <Box display='flex'>
                                    <Text fontWeight='bold' mr='2'>{`Trainee:`}</Text>
                                    <Text fontWeight='normal'>{`${traineeName.toUpperCase()}`}</Text>
                                </Box>
                                <Box display='flex'>
                                    <Text fontWeight='bold' mr='2'>{`Email:`}</Text>
                                    <Text fontWeight='normal'>{`${displayEmail}`}</Text>
                                </Box>
                            </Box>
                            <InputGroup shadow='md' mb='2' w='100%' size='sm'>
                                <InputLeftAddon>Time:</InputLeftAddon>
                                <Input id='time_duration' type='text' value={time} placeholder={`e.g., 7:00am-5:00pm`} onChange={(e) => setTime(e.target.value)} />
                            </InputGroup>
                            <InputGroup shadow='md' w='100%' size='sm'>
                                <InputLeftAddon>Trainng Mode:</InputLeftAddon>
                                <Select shadow='md' borderRadius='5px' onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTrainingMode(e.target.value)}>
                                    <option hidden>Select Training Mode</option>
                                    <option value={'ol/ins'}>With Instructor</option>
                                    <option value={'olm'}>Modular</option>
                                </Select>
                            </InputGroup>
                            
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button isLoading={loading} isDisabled={time === '' && trainingMode === ''} loadingText='Notifying Trainee...' bgColor='blue.700' colorScheme='blue' w='100%' shadow='md' onClick={handleNotifyTrainees}>Notify Trainee</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}