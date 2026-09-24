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
import { useInstructors } from '@/context/InstructorContext'

import { UPDATE_BATCH } from '@/lib/course_batches_controller'
import { UPDATE_TRAINING } from '@/lib/trainee_controller'

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
    const { data: allInstructors } = useInstructors()
    
    const [course, setCourse] = useState<CoursesById>(initCoursesById)
    const [batch, setBatchDetails] = useState<CourseBatchByID>(initCourseBatch)
    const [trainingData, setTrainingData] = useState<TRAINING_BY_ID[]>([])
    const [openIndexes, setOpenIndexes] = useState<number[] | number>([])
    const [selectedEmails, setSelectedEmails] = useState<string[]>([])

    const [failedEmailsModal, setFailedEmailsModal] = useState<Array<{ email: string; reason?: string }>>([]);
    const [isFailedModalOpen, setIsFailedModalOpen] = useState<boolean>(false);

    // instructor details
    const [note1, setNote1] = useState<string>('')
    const [note2, setNote2] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [c_presentation_link, setPresentationLink] = useState<string>('')

    const [loading ,setLoading] = useState<boolean>(false)
    const [loadTrainees ,setLoadTrainees] = useState<boolean>(false)
    const [loadInstructor ,setLoadInstructor]  = useState<boolean>(false)
    const [show, setShow] = useState<boolean>(true);
    
    // User | Training Department Staff
    // Details provided upon user login
    const staff: string | null = localStorage.getItem('customToken')
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

    const trainingDataArr = trainingData?.filter((training) => (training.course === course?.id || matchedCourseAndCompanyCourse?.includes(training.course)) && training.batch === batchID)
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
        {label: 'Blended', value: 'blended'},
    ]

    const OnChangeBatchDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target

        setBatchDetails((prev) => ({
            ...prev,
            [id]: value
        }))
    }
    
    const OnChangeBatchDetailsSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    setLoadTrainees(true);

    const company_staff: string | null = localStorage.getItem('customToken');
    const jobPosition: string | null = localStorage.getItem('jobPositionToken');

    new Promise<void>((res, rej) => {
        setTimeout(async () => {
            try {
                const courseFound = allCourses?.find((c) => c.id === batch.course);
                const startDateArr = batch.start_date.split(',');
                const endDateArr = batch.end_date !== '' ? batch.end_date.split(',') : '';
                const schedule: string = batch.numOfDays > 1 ? `${startDateArr[1].toUpperCase()} ${batch.end_date === '' ? '' : `to ${endDateArr[1].toUpperCase()}`}` : startDateArr[1].toUpperCase();
                const gClassLink = courseFound?.class_code;
                const gmeetLink = courseFound?.gmeet_link;
                const timeArr = batch.time_duration.includes('-') ? batch.time_duration.split('-') : [batch.time_duration];
                const firstName = company_staff?.split(' ')[0] || '';
                const lastName = company_staff?.split(' ').at(-1) || '';
                const staffName = `${firstName} ${lastName}`;

                const route = batch.training_mode === 'olm' ? '/api/training-advise/olm-route' : '/api/training-advise/olt-route';

                // 1. Dispatch Email API call
                const response = await fetch(route, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bcc: selectedEmails,
                        course_code: courseFound?.course_code,
                        course_name: courseFound?.course_name,
                        schedule,
                        time: timeArr[0],
                        class_code: gClassLink,
                        gmeetLink,
                        staff: staffName,
                        position: jobPosition
                    })
                });

                if (!response.ok) {
                    throw new Error(`API returned status ${response.status}`);
                }

                const result = await response.json();
                // 1. Properly detect success from your API response structure
                const isSuccess = response.ok || !!result.messageId || result.success;

                // Extract successful email list
                const successfulEmails: string[] = Array.isArray(result.successfulEmails)
                    ? result.successfulEmails
                    : (isSuccess ? selectedEmails : []);

                // 2. Filter trainee items matching successfully dispatched emails
                const successfulTrainingIds = traineeDataArr
                    .filter((item) => item.trainee?.email && successfulEmails.includes(item.trainee.email))
                    .map((item) => item.training.id);

                // 3. Update database for successful dispatches
                if (successfulTrainingIds.length > 0) {
                    const updatePromises = successfulTrainingIds.map((t_id) => 
                        UPDATE_TRAINING(t_id, { isEmailed: true }, company_staff)
                    );
                    await Promise.all(updatePromises);
                }
                handleToast('Notified Trainees Successfully!', `All trainees received training details via email.`, 5000, 'success');
                
                res();
            } catch (error) {
                rej(error);
            }
        }, 500);
    })
    .catch((error) => {
        console.error('Error: ', error);
        handleToast('Failed to Notify', 'An error occurred while dispatching emails or updating records.', 5000, 'error');
    })
    .finally(() => {
        onModClose();
        setSelectedEmails([]);
        setLoadTrainees(false);
    });
}
    
    const handleNotifyInstructor = () => {
        setLoadInstructor(true)
        
        const company_staff: string | null = localStorage.getItem('customToken')
        const jobPosition: string | null = localStorage.getItem('jobPositionToken')

        new Promise<void>((res, rej) => {
            setTimeout( async () => {
                try{
                    const courseFound = allCourses?.find((c) => c.id === batch.course)
                    const startDateArr = batch.start_date.split(',')
                    const endDateArr = batch.end_date !== '' ? batch.end_date.split(',') : ''
                    const schedule: string = batch.numOfDays > 1 ? `${startDateArr[1].toUpperCase()} to${endDateArr[1].toUpperCase()}` : startDateArr[1].toUpperCase()
                    const gClassLink = courseFound?.class_code
                    const gmeetLink = courseFound?.gmeet_link
                    const firstName = company_staff?.split(' ')[0] || '';
                    const lastName = company_staff?.split(' ').at(-1) || '';
                    const staffName = `${firstName} ${lastName}`

                    const trainingBatch = courseBatch?.find((batch) => batch.id === batchID)
                    const ins = allInstructors?.find((i) => i.id === trainingBatch?.act_ins);
                    if (!ins) return trainingBatch?.instructor || 'No Instructor';

                    // Add 'MM' if rank is 'CAPT'
                    const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                    const intructor_name = `${ins.rank} ${ins.name}${suffix}`;

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
                            time_duration: batch.time_duration, 
                            trainees: listOfTrainees,
                            note1,
                            schedule,
                            gClassLink,
                            gmeetLink,
                            presentation_link: c_presentation_link,
                            instructor: intructor_name,
                            staff: staffName, 
                            position: jobPosition 
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
            setNote1('')
            setNote2('')
            setEmail('')
            setShow(true)
            setLoadInstructor(false)
        })
    }

    const handleNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNote2(value);
        setNote1(value.replace(/\n/g, "<br>"));
    };

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
                <Box mt='2' fontSize='10pt'>
                    <Box fontWeight='normal' mb='2' >
                        <Text fontWeight='bold' >Declared Instructor & Assessor:</Text>
                        <Box display='flex' justifyContent='space-between'>
                            <Box >
                                <Text fontWeight='bold'>Instructor:</Text>
                                <Text>
                                {(() => {
                                    const trainingBatch = courseBatch?.find((batch) => batch.id === batchID)
                                    const ins = allInstructors?.find((i) => i.id === trainingBatch?.instructor);
                                    if (!ins) return trainingBatch?.instructor || 'No Instructor';

                                    // Add 'MM' if rank is 'CAPT'
                                    const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                    return `${ins.rank} ${ins.name}${suffix}`;
                                })()} 
                                </Text>
                            </Box>
                            <Box >
                                <Text fontWeight='bold'>Assessor:</Text>
                                <Text>
                                {(() => {
                                    const trainingBatch = courseBatch?.find((batch) => batch.id === batchID)
                                    const ins = allInstructors?.find((i) => i.id === trainingBatch?.assessor);
                                    if (!ins) return trainingBatch?.assessor || 'No Instructor';

                                    // Add 'MM' if rank is 'CAPT'
                                    const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                    return `${ins.rank} ${ins.name}${suffix}`;
                                })()} 
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box mt='2' >
                    <Text fontSize='10pt'>Actual Instructor & Assessor:</Text>
                    <Box display='flex' justifyContent='space-between'>
                        <InputGroup shadow='md' mr='2' w='50%' size='sm'>
                            <InputLeftAddon>Instructor:</InputLeftAddon>
                            <Select id='act_ins' shadow='md' onChange={OnChangeBatchDetailsSelect}>
                                <option hidden>{`${batch.act_ins ? (allInstructors?.find((i) => i.id === batch.act_ins)?.name || batch.act_ins) : 'Select Instructor'}`}</option>
                                {allInstructors && allInstructors.map((i) => (
                                    <option key={i.id} value={i.id}>{`${i.rank} ${i.name}`}</option>
                                ))}
                            </Select>
                        </InputGroup>
                        <InputGroup shadow='md' w='50%' size='sm'>
                            <InputLeftAddon>Assessor:</InputLeftAddon>
                            <Select id='act_ass' shadow='md' onChange={OnChangeBatchDetailsSelect}>
                                <option hidden>{`${batch.act_ass ? (allInstructors?.find((i) => i.id === batch.act_ass)?.name || batch.act_ass) : 'Select Assessor'}`}</option>
                                {allInstructors && allInstructors.map((i) => (
                                    <option key={i.id} value={i.id}>{`${i.rank} ${i.name}`}</option>
                                ))}
                            </Select>
                        </InputGroup>
                    </Box>
                </Box>
                <InputGroup mt='2' shadow='md' size='sm'>
                    <InputLeftAddon>Training Mode:</InputLeftAddon>
                    <Select onChange={(e) => {setBatchDetails((prev) => ({...prev, training_mode: e.target.value}))}} value={batch.training_mode}>
                        <option label='Select Training Mode' hidden />
                        {trainingModes.map((arr, index) => (
                            <option key={index} label={arr.label} value={arr.value}/>
                        ))}
                    </Select>
                </InputGroup>
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
                    <Textarea id='remarks' fontWeight='normal' value={batch.attendance_remarks} onChange={OnChangeBatchDetailsTextArea} placeholder='Type here your remarks' shadow='md' size='sm' resize='vertical' minH='150px' />
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
                                    <Input size='sm' fontWeight='normal' placeholder='Instructor Email' onChange={(e) => setEmail(e.target.value)} mb='2' />
                                    <Input size='sm' fontWeight='normal' placeholder='Course Presentation Link' onChange={(e) => setPresentationLink(e.target.value)} mb='2' />
                                    <Textarea fontWeight='normal' placeholder='Place your notes here...' value={note2} mt='4' onChange={handleNotes} />
                                </Box>
                            </Box>
                        </Box>
                        {isFailedModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    ⚠️ Undelivered Emails ({failedEmailsModal.length})
                </h3>
                <button
                    onClick={() => setIsFailedModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    ✕
                </button>
            </div>

            <p className="my-3 text-sm text-slate-600 dark:text-slate-300">
                The following email addresses failed or were rejected by the mail server. Their records were <strong>not</strong> updated as emailed in the system:
            </p>

            <div className="max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                <ul className="space-y-2 text-sm">
                    {failedEmailsModal.map((item, index) => (
                        <li key={index} className="flex flex-col border-b border-slate-200 pb-2 text-slate-800 last:border-none last:pb-0 dark:border-slate-800 dark:text-slate-200">
                            <span className="font-mono font-medium text-rose-700 dark:text-rose-300">
                                • {item.email}
                            </span>
                            {item.reason && (
                                <span className="text-xs text-slate-500 pl-3">
                                    Reason: {item.reason}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-5 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => {
                        navigator.clipboard.writeText(failedEmailsModal.map(f => f.email).join(', '));
                        handleToast('Copied!', 'Failed email addresses copied to clipboard.', 3000, 'info');
                    }}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Copy Failed Emails
                </button>
                <button
                    type="button"
                    onClick={() => setIsFailedModalOpen(false)}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}
                    </ModalBody>
                    <ModalFooter>
                        <Button isLoading={loadTrainees} loadingText='Notifying Trainees...' isDisabled={selectedEmails.length === 0 || loadInstructor} bgColor='blue.700' colorScheme='blue' shadow='md' mr={3} onClick={handleNotifyTrainees}>Notify Trainees</Button>
                        <Button isLoading={loadInstructor} loadingText='Notifying Instructor...' isDisabled={email === '' || loadTrainees} bgColor='blue.700' colorScheme='blue' shadow='md' onClick={handleNotifyInstructor}>Notify Instructor</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}