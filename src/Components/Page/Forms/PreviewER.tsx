'use client'

import React from 'react';
import { useState, useRef } from 'react'
import { Box, Text, Input, useToast, Button, Grid, GridItem } from '@chakra-ui/react'

import { StandardER, MDS_ER, STCW_ER } from '@/Components/Page/Forms/EnrollmentReports'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useRank } from '@/context/RankContext'
import { useClients } from '@/context/ClientCompanyContext'

import { getFormatDate } from '@/handlers/util_handler';
import { formatDateToShort } from '@/handlers/trainee_handler';
import { ToastStatus } from '@/types/handling'

import { useReactToPrint } from 'react-to-print'
import './er.css'

interface ERProps {
    onClose: () => void;
    e_report: string;
    start_date: string;
    end_date: string;
    course: string;
    courseCode: string;
    batch_no: string;
    batchID: string;
    courseID: string;
}

export default function PreviewER({ onClose, batch_no, e_report, batchID, courseID, start_date, end_date, course, courseCode }: ERProps) {
    const toast = useToast()
    const { allData: allTrainingData } = useTraining()
    const { allData: allRegistrations } = useRegistrations()
    const { data: allRanks } = useRank()
    const { data: allTrainee } = useTrainees()
    const { courseCodes } = useClients()
    
    const [year, setYear] = useState<string>('')
    const [room, setRoom] = useState<string>('')
    const [assessor, setAssessor] = useState<string>('')
    const [instructor, setInstructor] = useState<string>('')
    const [practicumSite, setSite] = useState<string>('')
    const [practicumDate, setDate] = useState<string>('')
    const [classNo, setClassNo] = useState<string>('')

    const matchedCourseAndCompanyCourse = courseCodes?.filter((courseCode) => courseCode.id_course_ref === courseID).map((courseCode) => courseCode.id)
    const trainingsArr = allTrainingData?.filter((training) => (training.course === courseID || matchedCourseAndCompanyCourse?.includes(training.course)) && training.batch.toString() === batchID)
    const formattedDate = end_date === '' ? formatDateToShort(start_date) :getFormatDate(`${start_date} - ${end_date}`)

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `ENROLLMENT_REPORT B${batch_no}.pdf`,
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

    return (
        <>
        <Box w='70%' display={'flex'} flexDir='column' justifyContent='center'>
            <Box mb={4} pb={3} borderBottom='1px' borderColor='gray.400' >
                <Text fontSize='15px' display='flex' justifyContent='start' mb={4}>
                    <Text as='span' color='gray.600' mr={3}>Course:</Text>
                    <Text as='span' fontWeight='normal'>{course}</Text>
                </Text>
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
                    {e_report === 'STANDARD' ? (
                    <>
                        <Text w='50%' fontSize='15px' display='flex' justifyContent='start'>
                            <Text as='span' color='gray.600' mr={3}>Schedule:</Text>
                            <Text as='span' fontWeight='normal'>{`${formattedDate}`}</Text>
                        </Text>
                        <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                            <Text w='25%' as='span' color='gray.600'>Training Year:</Text>
                            <Input w='25%' shadow='md' onChange={(e) => setYear(e.target.value)} />
                        </Box>
                        <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                            <Text w='20%' as='span' color='gray.600'>Room No:</Text>
                            <Input w='25%' shadow='md' onChange={(e) => setRoom(e.target.value)} />
                        </Box>
                    </>
                    ) : e_report === 'STCW' ? (
                    <>
                    </>
                    ) : e_report === 'MDS' && (
                    <Box>
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
                            <Text w='50%' fontSize='15px' display='flex' justifyContent='start'>
                                <Text as='span' color='gray.600' mr={3}>Schedule:</Text>
                                <Text as='span' fontWeight='normal'>{`${formattedDate}`}</Text>
                            </Text>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                                <Text w='40%' as='span' color='gray.600'>Training Year:</Text>
                                <Input w='30%' shadow='md' onChange={(e) => setYear(e.target.value)} />
                            </Box>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                                <Text w='40%' as='span' color='gray.600'>Class No:</Text>
                                <Input w='30%' shadow='md' onChange={(e) => setClassNo(e.target.value)} />
                            </Box>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                                <Text w='40%' as='span' color='gray.600'>Room No:</Text>
                                <Input w='30%' shadow='md' onChange={(e) => setRoom(e.target.value)} />
                            </Box>
                        </Box>
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center' mr='2'>
                                <Text w='50%' as='span' color='gray.600'>Practicum Site/Vessel:</Text>
                                <Input w='100%' shadow='md' onChange={(e) => setSite(e.target.value)} />
                            </Box>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center' mr='2'>
                                <Text w='50%' as='span' color='gray.600'>Practicum Date:</Text>
                                <Input w='100%' shadow='md' onChange={(e) => setDate(e.target.value)} />
                            </Box>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center' mr='2'>
                                <Text w='50%' as='span' color='gray.600'>Assessor:</Text>
                                <Input w='100%' shadow='md' onChange={(e) => setAssessor(e.target.value)} />
                            </Box>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                                <Text w='50%' as='span' color='gray.600'>Instructor:</Text>
                                <Input w='100%' shadow='md' onChange={(e) => setInstructor(e.target.value)} />
                            </Box>
                        </Box>
                    </Box>
                    )}
                </Box>
            </Box>
            <Box display='flex' justifyContent='center' alignItems='center'>
                <Box>
                    {/** Table header */}
                    <Grid templateColumns="0.49in 3.26in 1.63in 1.88in" gap={0} fontSize='10pt' h='0.48in' fontWeight='bold' fontFamily='Arial, sans-serif' >
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>NO.</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>NAME OF TRAINEES</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' pt='2' alignItems='start'>RANK/POSITION</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" justifyContent='center' pt='2' alignItems='start'>REGISTRATION NUMBER</GridItem>
                    </Grid>
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
                            <Grid key={training.id} templateColumns="0.49in 3.26in 1.63in 1.88in" h='0.30in' textTransform='uppercase' fontSize='10pt' gap={0} fontWeight={'normal'} fontFamily='Arial, sans-serif'>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {(index + 1)}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' px='2' alignItems='center'>
                                    {`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name} ${trainee?.suffix.toLowerCase() === 'n/a' || trainee?.suffix === '' ? '' : `${trainee?.suffix}`}`}`}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' justifyContent='center' alignItems='center'>
                                    {`Reg-${registrations?.reg_no}`}
                                </GridItem>
                            </Grid>
                        )
                    })}
                    {/** Add the *NOTHING FOLLOWS* row immediately after the last data row */}
                    {(trainingsArr ?? []).length > 0 && (
                        <Grid templateColumns="0.49in 3.26in 1.63in 1.88in" h="0.30in" textTransform="uppercase" fontSize="10pt" gap={0} fontWeight="normal" fontFamily="Arial, sans-serif">
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {(trainingsArr?.length || 0) + 1}
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                <Text>*NOTHING FOLLOWS*</Text>
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                        </Grid>
                    )}
                    {/** Fill remaining rows to make a total of 24 */}
                    {(trainingsArr ?? []).length < 24 &&
                        [...Array(24 - (trainingsArr ?? []).length - 1)].map((_, index) => {
                        const startingIndex = (trainingsArr?.length || 0) + 1 // Start numbering after the last data row
                        return (
                            <Grid key={index} templateColumns="0.49in 3.26in 1.63in 1.88in" h="0.30in" textTransform="uppercase" fontSize="10pt" gap={0} fontWeight="normal" fontFamily="Arial, sans-serif">
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                    {startingIndex + index + 1}
                                </GridItem>
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                    {/* Empty cell */}
                                </GridItem>
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                    {/* Empty cell */}
                                </GridItem>
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" justifyContent="center" alignItems="center">
                                    {/* Empty cell */}
                                </GridItem>
                            </Grid>
                        );
                    })}
                </Box>
            </Box>
        </Box>
        <Box w='100%' ref={componentRef} className="printable-content">
            {e_report === 'STANDARD' ? (
                <StandardER course={course} trainingArray={trainingsArr} schedule={formattedDate} year={year} room={room}/>
            ) : e_report === 'STCW' ? (
                <STCW_ER e_report={e_report} course={courseCode} schedule={formattedDate} year={year} room={room}/>
            ) : e_report === 'MDS' && (
                <MDS_ER e_report={e_report} course={courseCode} trainingArray={trainingsArr} schedule={formattedDate} year={year} room={room} assessor={assessor} instructor={instructor} practicumDate={practicumDate} practicumSite={practicumSite} class_no={classNo}/>
            )}
        </Box>
        <Box mt='4' w='100%' py='2' borderTopWidth='1px' borderColor='gray.500' display='flex' justifyContent='center'>
            <Button onClick={() => {onClose();}} mr={3} shadow='md'>Close Preview</Button>
            <Button isDisabled={year === '' || room === ''} onClick={handlePrint} bgColor='#1C437E' colorScheme='blue' loadingText='Saving...' shadow='md'>Print Report</Button>
        </Box>
        </>
    );
}