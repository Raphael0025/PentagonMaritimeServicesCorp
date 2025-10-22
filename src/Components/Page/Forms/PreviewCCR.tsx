'use client'

import NextImage from 'next/image'
import React from 'react';
import { useState, useRef } from 'react'
import { Box, Text, Input, useToast, Button, Grid, GridItem } from '@chakra-ui/react'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useRank } from '@/context/RankContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { CourseBatchByID } from '@/types/course-batches'
import { useInstructors } from '@/context/InstructorContext'

import { getFormatDate } from '@/handlers/util_handler';
import { formatDateToShort } from '@/handlers/trainee_handler';
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import { useReactToPrint } from 'react-to-print'
import { CCR } from '@/Components/Page/Forms/TrainingForms'

interface TFProps {
    onClose: () => void;
    start_date: string;
    end_date: string;
    course: string;
    courseCode: string;
    batch_no: string;
    batchID: string;
    courseID: string;
    batch: CourseBatchByID | null;
}

export default function PreviewCCR({ onClose, batch, batch_no, batchID, courseID, start_date, end_date, course, courseCode }: TFProps) {
    const toast = useToast()
    const { allData: allTrainingData } = useTraining()
    const { data: courseBatch } = useCourseBatch()
    const { allData: allRegistrations } = useRegistrations()
    const { data: allRanks } = useRank()
    const { data: allTrainee } = useTrainees()
    const { courseCodes } = useClients()
    const { data: allInstructors } = useInstructors()

    const [year, setYear] = useState<string>('')
    const [room, setRoom] = useState<string>('')
    const [assessor, setAssessor] = useState<string>('')
    const [instructor, setInstructor] = useState<string>('')
    const [practicumSite, setSite] = useState<string>('')
    const [practicumDate, setDate] = useState<string>('')
    const [classNo, setClassNo] = useState<string>('')

    const [loading, setLoading] = useState<boolean>(false)

    const matchedCourseAndCompanyCourse = courseCodes?.filter((courseCode) => courseCode.id_course_ref === courseID).map((courseCode) => courseCode.id)
    const trainingsArr = allTrainingData?.filter((training) => (training.course === courseID || matchedCourseAndCompanyCourse?.includes(training.course)) && training.batch.toString() === batchID)
    const formattedDate = end_date === '' ? formatDateToShort(start_date) :getFormatDate(`${start_date} - ${end_date}`)

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `CCR_FORM B${batch?.batch_no}.pdf`,
        onBeforePrint: () => handleToast('Preparing to print...', ``, 3000, 'info'),
        onAfterPrint: () => {handleToast('Print Completed!', ``, 3000, 'success'); onClose()},
    })

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
        <Box w='100%' display={'flex'} flexDir='column' justifyContent='center'>
            <Box mb={4} pb={3} borderBottom='1px' borderColor='gray.400' >
                <Text fontSize='15px' display='flex' justifyContent='start' mb={4}>
                    <Text as='span' color='gray.600' mr={3}>Course:</Text>
                    <Text as='span' fontWeight='normal'>{course.toUpperCase()}</Text>
                </Text>
                <Box w='100%' display='flex' justifyContent='center' alignItems='center' mb={4}>
                    <Box w='100%' >
                        <Box display='flex' w='100%' justifyContent='space-between' alignItems='center' mb={4}>
                            <Text w='100%' fontSize='15px' display='flex' justifyContent='start'>
                                <Text textAlign='end' w='100%' as='span' color='gray.600' mr={3}>Schedule:</Text>
                                <Text textAlign='center' w='100%' borderBottom='0.5pt solid black' as='span' fontWeight='normal'>{`${formattedDate}`}</Text>
                            </Text>
                            {/* <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                                <Text w='40%' as='span' color='gray.600'>Training Year:</Text>
                                <Input w='30%' shadow='md' onChange={(e) => setYear(e.target.value)} />
                                <Text w='30%'>{batch_no}</Text>
                            </Box> */}
                            <Box w='100%' fontSize='15px' display='flex' alignItems='center'>
                                <Text textAlign='end' w='50%' as='span' color='gray.600'>Class No:</Text>
                                <Text textAlign='center' borderBottom='0.5pt solid black' w='50%'>{batch?.batch_no}</Text>
                            </Box>
                            <Box w='100%' fontSize='15px' display='flex' alignItems='center'>
                                <Text textAlign='end' w='50%' as='span' color='gray.600'>Room No:</Text>
                                <Text textAlign='center' borderBottom='0.5pt solid black' w='100%'>{batch?.room}</Text>
                            </Box>
                        </Box>
                        <Box display='flex' w='100%' justifyContent='space-between' alignItems='center' mb={4}>
                            <Box w='100%' fontSize='15px' display='flex' alignItems='center' mr='2'>
                                <Text textAlign='end' w='100%' as='span' color='gray.600'>Practicum Site/Vessel:</Text>
                                <Text textAlign='center' borderBottom='0.5pt solid black' w='100%'>{batch?.practicumSite}</Text>
                            </Box>
                            <Box w='100%' fontSize='15px' display='flex' alignItems='center' mr='2'>
                                <Text textAlign='end' w='50%' as='span' color='gray.600'>Practicum Date:</Text>
                                <Text textAlign='center' borderBottom='0.5pt solid black' w='100%'>{batch?.practicumDate}</Text>
                            </Box>
                            <Box w='100%' fontSize='15px' display='flex' alignItems='center' mr='2'>
                                <Text textAlign='end' w='50%' as='span' color='gray.600'>Assessor:</Text>
                                <Text textAlign='center' borderBottom='0.5pt solid black' w='100%'>
                                {(() => {
                                    const ins = allInstructors?.find((i) => i.id === batch?.assessor);
                                    if (!ins) return batch?.assessor || 'No Instructor';

                                    // Add 'MM' if rank is 'CAPT'
                                    const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                    return `${ins.rank} ${ins.name}${suffix}`;
                                })()}
                                </Text>
                            </Box>
                            <Box w='100%' fontSize='15px' display='flex' alignItems='center'>
                                <Text textAlign='end' w='50%' as='span' color='gray.600'>Instructor:</Text>
                                <Text textAlign='center' borderBottom='0.5pt solid black' w='100%'>
                                    {(() => {
                                        const ins = allInstructors?.find((i) => i.id === batch?.instructor);
                                        if (!ins) return batch?.instructor || 'No Instructor';

                                        // Add 'MM' if rank is 'CAPT'
                                        const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                        return `${ins.rank} ${ins.name}${suffix}`;
                                    })()}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box display='flex' mb='5' justifyContent='space-between'>
                <Box color='red'>
                    <Text>Note:</Text>
                    <Text>For Practical, If course is not a simulator type, Input 101 for Performed.</Text>
                    <Text>If status of a trainee is Incomplete, Input 102 on both written and practical fields.</Text>
                </Box>
                <Button size='sm' shadow='md' colorScheme='blue' bgColor='blue.700'>Save Grades</Button>
            </Box>
            <Box w='100%' display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                <Box display='flex' w='100%' mb='2' borderBottom='1px solid black' justifyContent='center' alignItems='center'>
                    {/** Table Header */}
                        <Box w='20px'>
                            <Text>No.</Text>
                        </Box>
                        <Box w='300px' fontWeight='normal' display='flex' alignItems='center' flexDir='column' justifyContent='center'>
                            <Text>{`Name of Trainee`}</Text>
                            <Text>{`(LastName, First Name, Middle name)`}</Text>
                        </Box>
                        <Box w='50px'  >
                            <Text>Rank</Text>
                        </Box>
                        <Box w='100px'  >
                            <Text>Registration No.</Text>
                        </Box>
                        <Text w='100px'>{`Written (%)`}</Text>
                        <Text w='100px'>{`Practical (%)`}</Text>
                        <Text w='100px'>
                            Passed
                        </Text>
                        <Box w='100px' >
                            <Text >Failed</Text>
                        </Box>
                        <Box w='100px'>
                            <Text >Incomplete</Text>
                        </Box>
                        <Box w='200px' >
                            Training Certificate Number
                        </Box>
                </Box>
                {/** Table Body */}
                {trainingsArr// Create a shallow copy to avoid mutating the original array
                ?.slice() // Create a shallow copy to avoid mutating the original array
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
                        <Box w='100%' key={training.id} display='flex' justifyContent='center' alignItems='center' textTransform='uppercase' mb='3' fontWeight={'normal'} fontFamily='Calibri'>
                            <Text w='20px' >
                                {(index + 1)}
                            </Text>
                            <Text w='300px' textAlign='center'>
                                {`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name} ${trainee?.suffix.toLowerCase() === 'n/a' || trainee?.suffix === '' ? '' : `${trainee?.suffix}`}`}`}
                            </Text>
                            <Text w='50px' >
                                {allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}
                            </Text>
                            <Text w='100px' >
                                {`Reg-${registrations?.reg_no}`}
                            </Text>
                            <Text w='100px' >
                                <Input size='sm' shadow='md' />
                            </Text>
                            <Text w='100px' >
                                <Input size='sm' shadow='md' />
                            </Text>
                            <Text w='100px'  >
                                {training?.practical === 101 ? (training?.written) >= 75 && '✓' : ((training?.written + training?.practical) / 2) >= 75 && '✓'}
                            </Text>
                            <Text w='100px'  >
                                {training?.written !== 0 && training?.practical !== 0 && (
                                    training?.practical === 101
                                    ? (training?.written < 75 || training?.written >= 1) && '✓'
                                    : ((training?.written + training?.practical) / 2 < 75 ||
                                        (training?.written + training?.practical) / 2 >= 1) && '✓'
                                )}
                            </Text>
                            <Text w='100px'  >
                                {training?.written !== 0 && training?.practical !== 0 && (
                                    training?.written === 102 && training?.practical === 102 ? '✓' : '🗙'
                                )}
                            </Text>
                            <Text w='200px' >
                                {training?.written !== 0 && training?.practical !== 0 && (
                                    training?.written === 102 && training?.practical === 102 ? '✓' : '🗙'
                                )}
                            </Text>
                        </Box>
                    )
                })}
                
            </Box>
        </Box>
        <Box w='100%' 
            ref={componentRef} 
            className="printable-content"
        >
            <CCR batch={batch} trainingsArr={trainingsArr} />
        </Box>
        <Box mt='24' w='100%' py='2' borderTopWidth='1px' borderColor='gray.500' display='flex' justifyContent='center'>
            <Button onClick={() => {onClose();}} mr={3} shadow='md'>Close Preview</Button>
            <Button 
            // isDisabled={ batch.room === ''} 
            onClick={handlePrint} bgColor='#1C437E' colorScheme='blue' loadingText='Printing...' shadow='md'>Print Course Completion</Button>
        </Box>
        
        </>
    )
}