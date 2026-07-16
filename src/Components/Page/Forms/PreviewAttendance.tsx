'use client'

import NextImage from 'next/image'
import React from 'react';
import { useState, useRef } from 'react'
import { Box, Text, Input, Image as ChakraImage, FormControl, FormLabel, useToast, Button, Grid, Badge, CloseButton, VStack, HStack, GridItem } from '@chakra-ui/react'

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
    const [batchData, setBatchData] = useState<CourseBatchByID | null>(null)

    const [file, setFile] = useState<File[]>([]);
    const [attachmentType, setAttachmentType] = useState<string>('attendance');
    const [remarks, setRemarks] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [loading, setLoading] = useState<boolean>(false)

    const matchedCourseAndCompanyCourse = courseCodes?.filter((courseCode) => courseCode.id_course_ref === courseID).map((courseCode) => courseCode.id)
    const trainingsArr = allTrainingData?.filter((training) => (training.course === courseID || matchedCourseAndCompanyCourse?.includes(training.course)) && training.batch === batchID)
    const formattedDate = end_date === '' ? formatDateToShort(start_date) :getFormatDate(`${start_date} - ${end_date}`)

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `ATTENDANCE_FORM B${batch?.batch_no}.pdf`,
        onBeforePrint: () => handleToast('Preparing to print...', ``, 3000, 'info'),
        onAfterPrint: () => {
            handlePrintAttachment();
            handleToast('Print Completed!', ``, 3000, 'success'); 
        },
    })
    
    const attachRef = useRef<HTMLDivElement | null>(null);
    const handlePrintAttachment = useReactToPrint({
        content: () => attachRef.current,
        documentTitle: `ATT_Attachment B${batch?.batch_no}.pdf`,
        onBeforePrint: () => handleToast('Preparing to print...', ``, 3000, 'info'),
        onAfterPrint: () => {handleToast('Print Completed!', ``, 3000, 'success'); 
            //onClose()
        },
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

    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleRemoveFile = (indexToRemove: number) => {
        setFile(prevFiles => prevFiles.filter((_, idx) => idx !== indexToRemove));
        
        // If the user clears out all items manually, wipe the native DOM input value
        if (file.length <= 1 && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleAttachment = async () => {
        try {
            if (!file || file.length === 0) {
                handleToast('No files selected', 'Please select files to upload.', 3000, 'warning');
                return;
            }
            setIsUploading(true);
            const newUploads = await scannedAttachment(batchID, attachmentType, courseCode, remarks, file);
            
            setFile([]); 
            if (fileInputRef.current) fileInputRef.current.value = ''; 
            
            if (newUploads && newUploads.length > 0) {
                setBatchData((prevBatch: any) => {
                    const currentList = prevBatch?.attendance || [];
                    
                    return {
                        ...prevBatch,
                        attendance: [...currentList, ...newUploads],
                        attendance_remarks: remarks 
                    };
                });
            }
            
            handleToast('Files uploaded successfully', 'Ready for viewing/printing.', 3000, 'success');
            setRemarks(''); // Clear remarks input field only after state merging is complete
        } catch (error) {
            console.error('Error uploading file cluster:', error);
            handleToast('Error uploading file', 'Please try again later.', 3000, 'error');
        } finally {
            setIsUploading(false);
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
                        <VStack align="stretch" spacing={3} w="100%">
                            <Box display='flex' justifyContent='start' alignItems='end' mb='2' gap='3' flexWrap="wrap">
                                <FormControl w='auto' display='flex' alignItems='end'>    
                                    <FormLabel w='200px' fontWeight='normal'>Choose Files:</FormLabel>
                                    <Input ref={fileInputRef} type='file' multiple 
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setFile(Array.from(e.target.files));
                                            }
                                        }} 
                                        shadow='md' p="1" accept='.jpeg, .jpg, .png'
                                    />
                                </FormControl>
                                <FormControl w='auto' display='flex' alignItems='end'>    
                                    <FormLabel fontWeight='normal'>Remarks:</FormLabel>
                                    <Input type='text' value={remarks}onChange={(e) => setRemarks(e.target.value)} shadow='md' />
                                </FormControl>
                                <Button onClick={handleAttachment} colorScheme='blue' bgColor='blue.700' shadow='md'isLoading={isUploading} >
                                    Upload
                                </Button>
                            </Box>
                            {/* 🟢 Interactive File Selection Preview Panel */}
                            {file && file.length > 0 && (
                                <Box p="3" bg="gray.50" borderRadius="md" border="1px solid #E2E8F0" maxW="500px">
                                    <Text fontSize="11px" fontWeight="bold" color="gray.500" mb="2">STAGED ATTACHMENTS ({file.length}):</Text>
                                    <VStack align="stretch" spacing={1.5}>
                                        {file.map((f: File, idx: number) => (
                                            <HStack key={idx} justifyContent="space-between" bg="white" p="1.5" px="2" borderRadius="sm" shadow="sm" border="1px solid" borderColor="gray.100">
                                                <Text fontSize="12px" color="gray.700" isTruncated maxW="85%">
                                                    📄 {f.name} <Text as="span" color="gray.400" fontSize="10px">({(f.size / 1024).toFixed(1)} KB)</Text>
                                                </Text>
                                                <CloseButton size="sm" color="red.500" onClick={() => handleRemoveFile(idx)} />
                                            </HStack>
                                        ))}
                                    </VStack>
                                </Box>
                            )}
                        </VStack>
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
                    })
                    // .sort((a, b) => {
                    //     // Use .toMillis() for Firestore Timestamps, default to 0 if missing
                    //     const timeA = a.date_enrolled ? a.date_enrolled.toMillis() : 0;
                    //     const timeB = b.date_enrolled ? b.date_enrolled.toMillis() : 0;

                    //     // Ascending order (Oldest -> Newest)
                    //     return timeA - timeB;
                    // })
                    .map((training, index) => {
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
        <Box display="flex" flexDir="column" alignItems="center" gap="6" w="100%" mt="4">
            <Text fontSize="sm" fontWeight="bold" color="gray.800" alignSelf="start" px="8">
                📜 UPLOADED ATTACHMENTS:
            </Text>
            { // break point
            Array.isArray((batch as any)?.attendance) && (batch as any)?.attendance && (batch as any).attendance.length > 0 ? (
                (batch as any).attendance.map((item: any, idx: number) => (
                    <Box key={idx} w="100%" display="flex" flexDir="column" alignItems="center" gap="2">
                        <ChakraImage src={item.url} width='70%' height='50%' alt={item.name} borderRadius="md" shadow="md" />
                        <Text fontSize="xs" color="gray.800">📄 {item.name}</Text>
                    </Box>
                ))
            ) : (
                batch?.attendance && batch?.attendance !== '' ? (
                    <ChakraImage src={batch.attendance} width='80%' height='auto' alt='legacy attachment' />
                ) : (
                    <Box py="6" color="gray.400" fontSize="sm">No existing files saved for this batch.</Box>
                )
            )
            }
            {/* Single Global Remarks Display */}
            <Box w='100%' display='flex' flexDir='column' px='8' justifyContent='start' pt='4' gap='2'>
                <Text fontWeight="bold">REMARKS:</Text>
                <Text fontWeight='normal' bg="gray.50" p="3" borderRadius="md" border="1px solid" borderColor="gray.200">
                    {batch?.attendance_remarks || 'No remarks recorded.'}
                </Text>
            </Box>
        </Box>
        <Box w='100%' ref={componentRef} className="printable-content" >
            <AttendanceForm batch={batch} trainingArray={trainingsArr} />
        </Box>
        <Box ref={attachRef} display="flex" flexDirection="column" position='relative' 
            w='210mm' h='297mm'  // Ensures it stretches to full screen/container height
            sx={{display: 'none', '@media print': {display: 'block', fontFamily: 'Arial, Helvetica, sans-serif !important', WebkitPrintColorAdjust: 'exact', '*': {fontFamily: 'Arial, Helvetica, sans-serif !important'}}}}
        >
            {/* FIXED LOGO HEADER */}
            <Box display='flex' 
                w='100%' 
                justifyContent='center' 
                alignItems='center'
                flexShrink={0} // Prevents the logo container from squishing
            >
                <ChakraImage src='/Logo.jpg' width='350px' h='100%' alt='attachment placeholder' />
            </Box>
            {/* MIDDLE CONTENT - SCROLLS / STRETCHES */}
            <Box display='flex' mt='4' justifyContent='center' alignItems='center' flexDir='column'>
                <Text fontSize='2xl'>ATTENDANCE ATTACHMENT</Text>
                <Box mt='4' fontSize='lg' w='100%' px='8'>
                    <Text>{`Course: ${course.toUpperCase()}`}</Text>
                    <Text>{`Training Schedule: ${batch?.start_date} ${batch?.end_date !== '' ? `to ${batch?.end_date}` : ''}`}</Text>
                </Box>
            </Box>
            <Box flex="1" overflowY="auto" display="flex"justifyContent="start"alignItems="center"mt='8'flexDir='column'gap='6'w="100%" >
                {/* 🟢 Split the attendance string by commas to get an array of image URLs */}
                {Array.isArray((batch as any)?.attendance) && (batch as any)?.attendance && (batch as any).attendance.length > 0 ? (
                    (batch as any).attendance.map((item: any, idx: number) => (
                        <Box key={`db-${idx}`} w="100%" display="flex" flexDir="column" alignItems="center" gap="2">
                            <ChakraImage src={item.url} width='70%' height='auto' alt={item.name} borderRadius="md" shadow="sm" />
                            <Text fontSize="xs" color="gray.400">📄 {item.name}</Text>
                        </Box>
                    ))
                ) : file && file.length > 0 ? (
                    /* 🟢 CONDITION 2: If DB is empty but user just selected local files, render them for printing! */
                    file.map((f: File, idx: number) => (
                        <Box key={`local-${idx}`} w="100%" display="flex" flexDir="column" alignItems="center" gap="2">
                            <ChakraImage src={URL.createObjectURL(f)} width='70%' height='auto' alt={f.name} borderRadius="md" shadow="sm"  />
                            <Text fontSize="xs" color="gray.400">📄 {f.name} (Staged Local File)</Text>
                        </Box>
                    ))
                ) : (
                    batchData?.attendance && batchData?.attendance !== '' && (
                        <ChakraImage src={batchData.attendance} width='50%' height='auto' alt='legacy attachment' />
                    )
                )}
                <Box w='100%' display='flex' flexDir='column' px='8' justifyContent='start' pt='4' gap='3'>
                    <Text fontWeight="bold">REMARKS:</Text>
                    <Text fontWeight='normal'>
                        {batch?.attendance_remarks || remarks || 'No remarks provided.'}
                    </Text>
                </Box>
            </Box>
            {/* FIXED FOOTER */}
            <Box position='absolute'w='100%' display='flex' justifyContent='center' alignItems='center'bottom='0'left='0'pb='4' >
                <ChakraImage src='/Footer.png' width='500px' h='100%' alt='Footer placeholder' />
            </Box>
        </Box>
        <Box mt='4' w='100%' py='2' borderTopWidth='1px' borderColor='gray.500' display='flex' justifyContent='center'>
            <Button onClick={() => {onClose();}} mr={3} shadow='md'>Close Preview</Button>
            <Button onClick={handlePrint} bgColor='#1C437E' colorScheme='blue' loadingText='Saving...' shadow='md'>Print Attendance</Button>
        </Box>
        </>
    )
}