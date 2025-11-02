'use client'

import React, { useState, useEffect } from 'react'
import {
    Box, Text, Button, Input, InputGroup, Alert, AlertIcon, AlertTitle, AlertDescription, InputLeftAddon, Textarea, Select, useToast, useDisclosure,
    Modal, DrawerHeader, DrawerBody, DrawerFooter, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, ModalCloseButton, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, Checkbox, CheckboxGroup
} from '@chakra-ui/react';

import { TRAINING_BY_ID } from '@/types/trainees'
import { CourseBatchByID, initCourseBatch } from '@/types/course-batches'
import { CoursesById, initCoursesById } from '@/types/courses'
import { ToastStatus } from '@/types/handling';

import { useCourseBatch } from '@/context/BatchContext'
import { useCourses } from '@/context/CourseContext'
import { useRank } from '@/context/RankContext'
import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useClients } from '@/context/ClientCompanyContext'

import { UPDATE_BATCH } from '@/lib/course_batches_controller'

interface ComponentProps{
    batchID: string;
    courseID: string;
    onClose: () => void;
}

export default function BatchDetails({ batchID, courseID, onClose }: ComponentProps) {
    const toast = useToast()
    const {isOpen: isModOpen, onOpen: onModOpen, onClose: onModClose} = useDisclosure()
    const { data: courseBatch } = useCourseBatch();
    const { data: allRanks } = useRank()
    const { data: allTrainee } = useTrainees()
    const { allData: allTrainingData } = useTraining()
    const { allData: allRegistrations } = useRegistrations()
    const { data: allCourses } = useCourses()
    const { data: allClients, courseCodes } = useClients()
    
    const [course, setCourse] = useState<CoursesById>(initCoursesById)
    const [batch, setBatchDetails] = useState<CourseBatchByID>(initCourseBatch)
    const [trainingData, setTrainingData] = useState<TRAINING_BY_ID[]>([])
    const [openIndexes, setOpenIndexes] = useState<number[] | number>([])
    const [selectedEmails, setSelectedEmails] = useState<string[]>([])

    // instructor details
    const [notes, setNote] = useState<string>('')
    const [email, setEmail] = useState<string>('')

    const [loading ,setLoading] = useState<boolean>(false)
    const [loadTrainees ,setLoadTrainees] = useState<boolean>(false)
    const [loadInstructor ,setLoadInstructor]  = useState<boolean>(false)
    const [show, setShow] = useState<boolean>(true);
    
    // User | Training Department Staff
    // Details provided upon user login
    const staff: string | null = localStorage.getItem('customToken')
    const contact: string | null = localStorage.getItem('phone')
    const [position, setPosition] = useState<string | null>('')

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

        const foundCourse = allCourses?.find((course) => course.id === courseID)
        setCourse(foundCourse ?? initCoursesById)
        setTrainingData(allTrainingData ?? [])
        
        const batch = courseBatch?.find((b) => b.id === batchID)

        if (!batch) return;

        setBatchDetails(batch ?? initCourseBatch)
    }, []); 

    if(!allTrainingData) return null
    if(!allRegistrations) return null
    if(!allCourses) return null
    if(!allTrainee) return null
    if(!allRanks) return null

    const matchedCourseAndCompanyCourse = courseCodes?.filter((courseCode) => courseCode.id_course_ref === courseID).map((courseCode) => courseCode.id)

    const toggleAll = () => {
        if (Array.isArray(openIndexes) && openIndexes.length === trainingData.length) {
            setOpenIndexes([]) // All open → close all
        } else {
            setOpenIndexes(trainingData.map((_, index) => index)) // Open all
        }
    }

    const trainingDataArr = trainingData?.filter((training) => (training.course === course?.id || matchedCourseAndCompanyCourse?.includes(training.course)) && training.batch.toString() === batchID)
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
    })

    const traineeDataArr = trainingDataArr.map(training => {
        const registration = allRegistrations?.find(r => r.id === training.reg_ref_id);
        const trainee = allTrainee?.find(t => t.id === registration?.trainee_ref_id);
        return {training, registration, trainee};
    }).filter(Boolean);

    const allEmails = traineeDataArr
    .map(({ trainee }) => trainee?.email)
    .filter((email): email is string => !!email);

    const trainingModes = [
        {label: 'Face-to-Face BOTH THEORETICAL &  PRACTICAL', value: 'f2f'},
        {label: 'Face-to-Face MODULAR', value: 'f2fm'},
        {label: 'Face-to-Face THEORETICAL', value: 'f2ft'},
        {label: 'Face-to-Face PRACTICAL', value: 'f2fp'},
        {label: 'Online BOTH THEORETICAL &  PRACTICAL', value: 'ol'},
        {label: 'Online MODULAR', value: 'olm'},
        {label: 'Online THEORETICAL', value: 'olt'},
        {label: 'Online PRACTICAL', value: 'olp'},
    ]

    const OnChangeBatchDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target

        setBatchDetails((prev) => ({
            ...prev,
            [id]: value
        }))
    }
    const OnChangeBatchDetailsTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { id, value } = e.target

        setBatchDetails((prev) => ({
            ...prev,
            [id]: value
        }))
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

    const handleUpdateBatch = () => {
        setLoading(true)

        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    await UPDATE_BATCH(batch.id, batch, staff)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast( 'Batch Details Updated Successfully!', `You have successfully changed this Batch's data, and it will be logged.`, 5000, 'success' )
        })
        .catch((error) => {
            console.error('Error:', error);
        })
        .finally(() => {
            setLoading(false);
        })
    }

    const handleNotifyTrainees = () => {
        setLoadTrainees(true)
        new Promise<void>((res, rej) => {
            setTimeout( async () => {
                try{
                    const courseFound = allCourses?.find((c) => c.id === batch.course)
                    const startDateArr = batch.start_date.split(',')
                    const endDateArr = batch.end_date !== '' ? batch.end_date.split(',') : ''
                    const schedule: string = batch.numOfDays > 1 ? `${startDateArr[1].toUpperCase()} to${endDateArr[1].toUpperCase()}` : startDateArr[1].toUpperCase()
                    const class_code = courseFound?.class_code
                    const timeArr = batch.time_duration.includes('-') ? batch.time_duration.split('-') : [batch.time_duration]

                    const route = batch.training_mode === 'olm' ? '/api/training-advise/olm-route' : '/api/training-advise/olt-route';
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
                            time: timeArr[0], 
                            training_mode: (batch.training_mode === 'olm' ? 'Online-Modular' : 'Online'), 
                            class_code, 
                            tro_contact: contact, 
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
            handleToast( 'Notified Trainees Successfully!', `Trainees have been successfully sent the training details via email.`, 5000, 'success' )
        }).catch((error) => {
            console.error('Error: ', error)
        }).finally(() =>{
            onModClose()
            setSelectedEmails([])
            setLoadTrainees(false)
        })
    }
    
    const handleNotifyInstructor = () => {
        setLoadInstructor(true)
        new Promise<void>((res, rej) => {
            setTimeout( async () => {
                try{
                    const courseFound = allCourses?.find((c) => c.id === batch.course)
                    const timeArr = batch.time_duration.includes('-') ? batch.time_duration.split('-') : [batch.time_duration]

                    const route = '/api/training-advise/notify-instructor'
                    
                    const listOfTrainees = traineeDataArr.map(({ trainee }) => {
                        const rank = allRanks?.find(rank => rank.code === trainee?.rank)?.rank || trainee?.rank;
                        const middleInitial = trainee?.middle_name?.toLowerCase() === 'n/a' || !trainee?.middle_name ? '' : `${trainee?.middle_name.charAt(0).toUpperCase()}.`;

                        return `${rank?.toUpperCase()} ${trainee?.last_name.toUpperCase()}, ${trainee?.first_name.toUpperCase()} ${middleInitial}`;
                    })
                    
                    await fetch(route, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        }, 
                        body: JSON.stringify({
                            to: email, 
                            course_code: courseFound?.course_code, 
                            course_name: courseFound?.course_name, 
                            time_duration: timeArr[0], 
                            trainees: listOfTrainees,
                            notes,
                            instructor: batch.instructor,
                            tro_contact: contact, 
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
            handleToast( 'Notified Instructor Successfully!', `The instructor has been successfully sent the List of Trainees via email.`, 5000, 'success' )
        }).catch((error) => {
            console.error('Error: ', error)
        }).finally(() =>{
            onModClose()
            setNote('')
            setEmail('')
            setShow(true)
            setLoadInstructor(false)
        })
    }

    return(
        <>
            <DrawerHeader fontSize='md' >
                <Box display='flex' justifyContent='space-between'>
                    <Text textTransform='uppercase'>
                        {`Course: ${allCourses?.find((course) => course.id === batch.course)?.course_code || ''}`}
                    </Text>
                    <Text>
                        {`Batch# ${batch.batch_no}`}
                    </Text>
                </Box>
                <Box mt='1' alignItems='center' display='flex' justifyContent='space-between'>
                    <Text>
                        {`Training Duration: ${batch.start_date}${batch.numOfDays > 1 ? ` to ${batch.end_date}` : ''}`}
                    </Text>
                    <Button size='sm' isDisabled={batch.time_duration === '' || batch.training_mode === ''} onClick={onModOpen} colorScheme='blue' variant='outline' shadow='md' >Email Training Details</Button>
                </Box>
                <Box mt='2' display='flex' justifyContent='space-between'>
                    <InputGroup shadow='md' mr='2' w='50%' size='sm'>
                        <InputLeftAddon>Time:</InputLeftAddon>
                        <Input id='time_duration' type='text' value={batch.time_duration} placeholder={`e.g., 7:00am-5:00pm`} onChange={OnChangeBatchDetails} />
                    </InputGroup>
                    <InputGroup shadow='md' w='50%' size='sm'>
                        <InputLeftAddon>Room:</InputLeftAddon>
                        <Input id='room' value={batch.room} placeholder={`e.g., Room 1-7 only`} type='text' onChange={OnChangeBatchDetails} />
                    </InputGroup>
                </Box>
                <Box mt='2' >
                    <InputGroup mb='2' shadow='md' size='sm'>
                        <InputLeftAddon>Instructor:</InputLeftAddon>
                        <Input id='instructor' value={batch.instructor} placeholder={`Type here instructor's name`} type='text' onChange={OnChangeBatchDetails} />
                    </InputGroup>
                    <InputGroup shadow='md' size='sm'>
                        <InputLeftAddon>Training Mode:</InputLeftAddon>
                        <Select onChange={(e) => {setBatchDetails((prev) => ({...prev, training_mode: e.target.value}))}} value={batch.training_mode}>
                            <option label='Select Training Mode' hidden />
                            {trainingModes.map((arr, index) => (
                                <option key={index} label={arr.label} value={arr.value}/>
                            ))}
                        </Select>
                    </InputGroup>
                </Box>
            </DrawerHeader>
            <DrawerBody>
                <Box mt='2' >
                    <Box display='flex' justifyContent='space-between'>
                        <Text fontSize='md'>List of Trainees</Text>
                        <Button size='xs' variant='link' onClick={toggleAll} mb={4}>
                            {Array.isArray(openIndexes) && openIndexes.length === trainingData.length ? "Collapse All" : "Expand All"}
                        </Button>
                    </Box>
                    <Box mt='2' borderBottom='1px solid gray.500' fontSize='10pt' className='flex space-x-2 p-3 text-center uppercase'>
                        <Text w='10%' >No.</Text>
                        <Text w='100%' >{`Trainee's Name`}</Text>
                        <Text w='100%' >Rank</Text>
                        <Text w='10%' >{''}</Text>
                    </Box>
                    <Accordion allowMultiple index={openIndexes} onChange={setOpenIndexes} allowToggle>
                    {traineeDataArr.map(({trainee, training}, index) => {
                        return(
                            <AccordionItem key={training.id} fontWeight='normal'  w='100%'>
                                <AccordionButton _expanded={{ fontWeight: 'bold', bgColor: 'gray.100'}} fontSize='10pt' className='flex space-x-2 p-3 text-center uppercase' w='100%'>
                                    <Text w='10%'>{(index + 1)}</Text>
                                    <Text w='100%'>{`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name.charAt(0)}.`}`}</Text>
                                    <Text w='100%'>{allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}</Text>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel fontSize='10pt' >
                                    <Box display='flex' >
                                        <Text w='50%'>Charged To:</Text>
                                        <Text w='100%' fontWeight='normal'>{training?.accountType === 0 ? 'Crew' : 'Company'}</Text>
                                    </Box>
                                    <Box display='flex' mt='2' >
                                        <Text w='50%'>Contact No.:</Text>
                                        <Text w='100%' fontWeight='normal'>{trainee?.contact_no}</Text>
                                    </Box>
                                    <Box display='flex' mt='2' >
                                        <Text w='50%'>Email Address:</Text>
                                        <Text w='100%' fontWeight='normal' textTransform='lowercase'>{trainee?.email}</Text>
                                    </Box>
                                    <Box display='flex' mt='2' >
                                        <Text w='50%'>Company:</Text>
                                        <Text w='100%' fontWeight='normal'>{allClients?.find((client) => client.id === trainee?.company)?.company || trainee?.company}</Text>
                                    </Box>
                                    <Box display='flex' mt='2' >
                                        <Text w='50%'>Crewing:</Text>
                                        <Text w='100%' fontWeight='normal' textTransform='uppercase'>{trainee?.endorser}</Text>
                                    </Box>
                                </AccordionPanel>
                            </AccordionItem>
                        )
                    })}
                    </Accordion>
                </Box>
                <Box mt='3'>
                    <Text fontSize='10pt'>Remarks:</Text>
                    <Textarea id='remarks' fontWeight='normal' value={batch.remarks} onChange={OnChangeBatchDetailsTextArea} placeholder='Type here your remarks' shadow='md' size='sm' resize='vertical' minH='150px' />
                </Box>
            </DrawerBody>
            <DrawerFooter>
                <Button onClick={handleUpdateBatch} isLoading={loading} isDisabled={loadTrainees || loadInstructor} loadingText='Saving Details...' mr='3' bgColor='blue.700' colorScheme='blue' shadow='md' >Save Details</Button>
                <Button onClick={onClose} shadow='md' >Close Details</Button>
            </DrawerFooter>
            <Modal isOpen={isModOpen} onClose={onModClose} size='xl'>
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
                                This will send an email to all trainees in this batch, notifying them of the training details. Please ensure that all email addresses are valid and correct before proceeding, one incorrect detail may cause of not sending/advising the trainees.
                            </AlertDescription>
                        </Alert>
                        <Box>
                            <Box display='flex' justifyContent='space-between'>
                                <Text>{`Trainee's Email Address`}</Text>
                                <Button size='xs' variant='link' mb={2}
                                    onClick={() =>
                                        setSelectedEmails(
                                            selectedEmails.length === allEmails.length ? [] : allEmails
                                        )}
                                        >
                                    {selectedEmails.length === allEmails.length ? 'Deselect All' : 'Select All'}
                                </Button>
                            </Box>
                            <CheckboxGroup value={selectedEmails} onChange={(val) => setSelectedEmails(val as string[])}>
                                {traineeDataArr.map(({ trainee }, index) => {
                                    if (!trainee?.email) return null;
                                    return (
                                        <Checkbox key={trainee.id} value={trainee.email} fontSize="xs" fontWeight="normal" w="100%" >
                                            <Box w='100%' textTransform='uppercase' fontSize='xs' display='flex' >
                                                <Text w='15px' >{index + 1}.</Text>
                                                <Text w='50px' textTransform='uppercase' textAlign='center'>{allRanks?.find((rank) => rank.code === trainee.rank)?.rank || trainee.rank}</Text>
                                                <Text w='250px' textAlign='center' >
                                                    {`${trainee.last_name}, ${trainee.first_name} ${
                                                        trainee.middle_name.toLowerCase() === 'n/a' ||
                                                        trainee.middle_name === ''
                                                        ? ''
                                                        : `${trainee.middle_name.charAt(0)}.`
                                                        }`}
                                                </Text>
                                                <Text w='200px' textAlign='center' textTransform="lowercase">{trainee.email}</Text>
                                            </Box>
                                        </Checkbox>
                                    );
                                })}
                            </CheckboxGroup>
                            <Box mt='4'>
                                <Button size='xs' variant='link' mb={2} onClick={() => setShow(!show)}>
                                    {show ? 'Notify Instructor' : 'Hide'}
                                </Button>
                                <Box display={show ? 'none' : ''} >
                                    <Input placeholder='Instructor Email' onChange={(e) => setEmail(e.target.value)} />
                                    <Textarea placeholder='Place your notes here...' mt='4' onChange={(e) => setNote(e.target.value)} />
                                </Box>
                            </Box>

                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button isLoading={loadTrainees} loadingText='Notifying Trainees...' isDisabled={selectedEmails.length === 0 || loadInstructor} bgColor='blue.700' colorScheme='blue' shadow='md' mr={3} onClick={handleNotifyTrainees}>Notify Trainees</Button>
                        <Button isLoading={loadInstructor} loadingText='Notifying Instructor...' isDisabled={notes === '' || email === '' || loadTrainees} bgColor='blue.700' colorScheme='blue' shadow='md' onClick={handleNotifyInstructor}>Notify Instructor</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}