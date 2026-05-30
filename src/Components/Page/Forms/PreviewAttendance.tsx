'use client'

import NextImage from 'next/image'
import React from 'react';
import { useState, useRef } from 'react'
import { Box, Text, Input, Image as ChakraImage, FormControl, FormLabel, useToast, Button, Grid, GridItem } from '@chakra-ui/react'

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
import { AttendanceForm } from '@/Components/Page/Forms/TrainingForms';

import { scannedAttachment } from '@/lib/course_batches_controller'

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

export default function PreviewAF({ onClose, batch, batch_no, batchID, courseID, start_date, end_date, course, courseCode }: TFProps) {
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
    const [file, setFile] = useState<File[]>([])
    const [attachmentType, setAttachmentType] = useState<string>('attendance')

    const [loading, setLoading] = useState<boolean>(false)

    const matchedCourseAndCompanyCourse = courseCodes?.filter((courseCode) => courseCode.id_course_ref === courseID).map((courseCode) => courseCode.id)
    const trainingsArr = allTrainingData?.filter((training) => (training.course === courseID || matchedCourseAndCompanyCourse?.includes(training.course)) && training.batch.toString() === batchID)
    const formattedDate = end_date === '' ? formatDateToShort(start_date) :getFormatDate(`${start_date} - ${end_date}`)

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `ATTENDANCE_FORM B${batch?.batch_no}.pdf`,
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

    const handleAttachment = async () => {
        try{
            await scannedAttachment(batchID, attachmentType, courseCode, file, file[0].name)
            handleToast('File uploaded successfully', '', 3000, 'success')
        }catch(error){
            console.error('Error uploading file:', error);
            handleToast('Error uploading file', 'Please try again later.', 3000, 'error')
        }
    }

    return(
        <>
        <Box w='100%' display={'flex'} flexDir='column' justifyContent='center'>
            <Box mb={4} pb={3} borderBottom='1px' borderColor='gray.400' >
                <Text fontSize='15px' display='flex' justifyContent='start' mb={4}>
                    <Text as='span' color='gray.600' mr={3}>Course:</Text>
                    <Text as='span' fontWeight='normal'>{course.toUpperCase()}</Text>
                </Text>
                <Box w='100%' display='flex' justifyContent='start' alignItems='center' mb={4}>
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
                        </Box>
                        <Box w='100%' display='flex' gap='3' justifyContent='start' alignItems='end' mb={2}>
                            <FormControl w='auto' display='flex' gap='2' alignItems='center'>
                                <FormLabel m='0' fontWeight='normal' >Attachment:</FormLabel>
                                <Input w='400px' type='file' accept='image/*, .pdf' onChange={(e) => setFile(e.target.files ? Array.from(e.target.files) : [])} />
                            </FormControl>
                            <Button onClick={handleAttachment} colorScheme='blue' bgColor='blue.700' shadow='md' >Upload</Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                <Box>
                    {/** Table header */}
                    <Grid templateColumns="0.48in 2.34in 0.89in 1in 0.84in 1in 1in 1in 1in 1in 1in" gap={0} fontSize='8pt' h='0.65in' fontWeight='bold' textAlign='center' fontFamily='Calibri' >
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>NO.</GridItem>
                        <GridItem display='flex' px='10' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>{`Name of Trainees`}<br />{`(Last Name, First Name, Middle Name)`}</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>{`Date of Birth (mm/dd/yy)`}</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>{`Rank/ Rating/ Position`}</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Date of Enrollment</GridItem>
                        <GridItem border="0.5pt solid black" p='0' borderRight="none" justifyContent='center' alignItems='end'>
                            <Text h='70%' textAlign='center' display='flex' justifyContent='center' alignItems='center'>
                                MON
                            </Text>
                            <Text display='flex' p='0' textAlign='center' w='100%'>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderLeft='none' borderRight="none" justifyContent='center' w='50%'>AM</Text>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderRight="none" justifyContent='center' w='50%'>PM</Text>
                            </Text>
                        </GridItem>
                        <GridItem border="0.5pt solid black" p='0' borderRight="none" justifyContent='center' alignItems='end'>
                            <Text h='70%' textAlign='center' display='flex' justifyContent='center' alignItems='center'>
                                TUE
                            </Text>
                            <Text display='flex' p='0' textAlign='center' w='100%'>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderLeft='none' borderRight="none" justifyContent='center' w='50%'>AM</Text>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderRight="none" justifyContent='center' w='50%'>PM</Text>
                            </Text>
                        </GridItem>
                        <GridItem border="0.5pt solid black" p='0' borderRight="none" justifyContent='center' alignItems='end'>
                            <Text h='70%' textAlign='center' display='flex' justifyContent='center' alignItems='center'>
                                WED
                            </Text>
                            <Text display='flex' p='0' textAlign='center' w='100%'>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderLeft='none' borderRight="none" justifyContent='center' w='50%'>AM</Text>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderRight="none" justifyContent='center' w='50%'>PM</Text>
                            </Text>
                        </GridItem>
                        <GridItem border="0.5pt solid black" p='0' borderRight="none" justifyContent='center' alignItems='end'>
                            <Text h='70%' textAlign='center' display='flex' justifyContent='center' alignItems='center'>
                                THUR
                            </Text>
                            <Text display='flex' p='0' textAlign='center' w='100%'>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderLeft='none' borderRight="none" justifyContent='center' w='50%'>AM</Text>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderRight="none" justifyContent='center' w='50%'>PM</Text>
                            </Text>
                        </GridItem>
                        <GridItem border="0.5pt solid black" p='0' borderRight="none" justifyContent='center' alignItems='end'>
                            <Text h='70%' textAlign='center' display='flex' justifyContent='center' alignItems='center'>
                                FRI
                            </Text>
                            <Text display='flex' p='0' textAlign='center' w='100%'>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderLeft='none' borderRight="none" justifyContent='center' w='50%'>AM</Text>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderRight="none" justifyContent='center' w='50%'>PM</Text>
                            </Text>
                        </GridItem>
                        <GridItem border="0.5pt solid black" justifyContent='center' alignItems='center'>
                            <Text h='70%' textAlign='center' display='flex' justifyContent='center' alignItems='center'>
                                SAT
                            </Text>
                            <Text display='flex' p='0' textAlign='center' w='100%'>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderLeft='none' borderRight="none" justifyContent='center' w='50%'>AM</Text>
                                <Text border="0.5pt solid black" p='0' borderBottom='none' borderRight="none" justifyContent='center' w='50%'>PM</Text>
                            </Text>
                        </GridItem>
                    </Grid>
                    {/** Table Body */}
                    {trainingsArr// Create a shallow copy to avoid mutating the original array
                    ?.slice() // Create a shallow copy to avoid mutating the original array
                    .sort((a, b) => {
                        const regNoA = allRegistrations?.find((r) => r.id === a.reg_ref_id)?.reg_no || '';
                        const regNoB = allRegistrations?.find((r) => r.id === b.reg_ref_id)?.reg_no || '';
                
                        // Extract numeric parts of the registration number
                        const [yearA, monthA, numberA] = regNoA.split('-').map(Number);
                        const [yearB, monthB, numberB] = regNoB.split('-').map(Number);
                
                        // Compare by year first, then by number
                        if (yearA !== yearB) {
                            return yearA - yearB;
                        }
                        return numberA - numberB;
                    }).map((training, index) => {
                        const registrations = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                        const trainee = allTrainee?.find((t) => t.id === registrations?.trainee_ref_id)
                        return(
                            <Grid key={training.id} templateColumns="0.48in 2.34in 0.89in 1in 0.84in 1in 1in 1in 1in 1in 1in" h='0.18in' textTransform='uppercase' fontSize='8pt' gap={0} fontWeight={'normal'} fontFamily='Calibri'>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {(index + 1)}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' px='2' alignItems='center'>
                                    {`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name} ${trainee?.suffix.toLowerCase() === 'n/a' || trainee?.suffix === '' ? '' : `${trainee?.suffix}`}`}`}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {trainee?.birthDate
                                    ? parsingTimestamp(trainee.birthDate).toLocaleDateString('en-US', {
                                        year: '2-digit',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })
                                    : ''}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {parsingTimestamp(training?.date_enrolled).toLocaleDateString('en-US', {  year: 'numeric', month: 'numeric',  day: 'numeric',})}
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                            </Grid>
                        )
                    })}
                    {/** Add the *NOTHING FOLLOWS* row immediately after the last data row */}
                    {(trainingsArr ?? []).length > 0 && (
                        <Grid templateColumns="0.48in 2.34in 0.89in 1in 0.84in 1in 1in 1in 1in 1in 1in" h='0.18in' textTransform="uppercase" fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {(trainingsArr?.length || 0) + 1}
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                <Text>*NOTHING FOLLOWS*</Text>
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                            <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                <Text display='flex' p='0' textAlign='center' w='100%'>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                </Text>
                            </GridItem>
                            <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                <Text display='flex' p='0' textAlign='center' w='100%'>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                </Text>
                            </GridItem>
                            <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                <Text display='flex' p='0' textAlign='center' w='100%'>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                </Text>
                            </GridItem>
                            <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                <Text display='flex' p='0' textAlign='center' w='100%'>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                </Text>
                            </GridItem>
                            <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                <Text display='flex' p='0' textAlign='center' w='100%'>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                </Text>
                            </GridItem>
                            <GridItem border="0.5pt solid black" borderTop='none' justifyContent='center' alignItems='center'>
                                <Text display='flex' p='0' textAlign='center' w='100%'>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                    <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderRight='none' justifyContent='center' w='50%'></Text>
                                </Text>
                            </GridItem>
                        </Grid>
                    )}
                    {/** Fill remaining rows to make a total of 24 */}
                    {(trainingsArr ?? []).length < 24 &&
                        [...Array(24 - (trainingsArr ?? []).length - 1)].map((_, index) => {
                        const startingIndex = (trainingsArr?.length || 0) + 1 // Start numbering after the last data row
                        return (
                            <Grid key={index} templateColumns="0.48in 2.34in 0.89in 1in 0.84in 1in 1in 1in 1in 1in 1in" h='0.18in' textTransform="uppercase" fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                    {startingIndex + index + 1}
                                </GridItem>
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                    {/* Empty cell */}
                                </GridItem>
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                    {/* Empty cell */}
                                </GridItem>
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                    {/* Empty cell */}
                                </GridItem>
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                    {/* Empty cell */}
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' borderRight='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none'  borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                                <GridItem border="0.5pt solid black" borderTop='none' justifyContent='center' alignItems='center'>
                                    <Text display='flex' p='0' textAlign='center' w='100%'>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderLeft='none' borderRight='none' justifyContent='center' w='50%'>{'\u200B'}</Text>
                                        <Text border="0.5pt solid black" p='0' borderBottom='none' borderTop='none' borderRight='none' justifyContent='center' w='50%'></Text>
                                    </Text>
                                </GridItem>
                            </Grid>
                        );
                    })}
                </Box> 
                {/** Footer */}
                <Box w='100%' display='flex' justifyContent='space-around' alignItems={'center'} fontFamily='Arial, sans-serif' fontWeight='normal' fontSize='11pt' mt='8'>
                    <Box w='25%' display='flex' position='relative' justifyContent='center' alignItems='center'   flexDir='column'>
                        {(() => {
                            const ins = allInstructors?.find((i) => i.id === batch?.instructor)

                            const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                            const suffix = ins?.rank === 'CAPT' ? ', MM' : ''
                        
                            return(
                                <>
                                    {batch?.room?.toLowerCase() === 'online' && (
                                        <Box position='absolute' top='-20px' left='50%' transform="translateX(-50%)" zIndex={2} >
                                            <ChakraImage src={eSignSrc} h='85' alt='signature' />
                                        </Box>
                                    )}
                                    <Text mt='8' position='relative' zIndex={1} w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>
                                        {(() => {
                                            if (!ins) return batch?.instructor || 'No Instructor';

                                            // Add 'MM' if rank is 'CAPT'
                                            const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                            return `${ins.rank} ${ins.name}${suffix}`;
                                        })()}
                                    </Text>
                                    <Text textAlign='center' w='100%'>Instructor</Text>
                                </>
                            )
                        })()}
                    </Box>
                    <Box width='25%'>
                        <Text mt='8' w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>CAPT. ROGELIO MAHINAY, MM</Text>
                        <Text textAlign='center' w='100%'>Training Director</Text>
                    </Box>
                </Box>
            </Box>
        </Box>
        <Box>
            {batch?.attendance && batch?.attendance !== '' && (
                <ChakraImage src={batch?.attendance} width='100%' height='100%' alt='attachment' />
            )}
        </Box>
        <Box w='100%' 
            ref={componentRef} 
            className="printable-content"
        >
            <AttendanceForm batch={batch} trainingArray={trainingsArr} />
        </Box>
        <Box mt='4' w='100%' py='2' borderTopWidth='1px' borderColor='gray.500' display='flex' justifyContent='center'>
            <Button onClick={() => {onClose();}} mr={3} shadow='md'>Close Preview</Button>
            <Button onClick={handlePrint} bgColor='#1C437E' colorScheme='blue' loadingText='Saving...' shadow='md'>Print Attendance</Button>
        </Box>
        </>
    )
}