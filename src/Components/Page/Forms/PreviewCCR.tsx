'use client'

import NextImage from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import { Box, Text, Input, useToast, Image as ChakraImage, FormControl, FormLabel, Button, Grid, GridItem } from '@chakra-ui/react'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useRank } from '@/context/RankContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { CourseBatchByID } from '@/types/course-batches'
import { useInstructors } from '@/context/InstructorContext'

import { TRAINING_BY_ID } from '@/types/trainees'

import { getFormatDate } from '@/handlers/util_handler';
import { formatDateToShort } from '@/handlers/trainee_handler';
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import { UPDATE_TRAINING } from '@/lib/trainee_controller'

import { useReactToPrint } from 'react-to-print'
import { CCR } from '@/Components/Page/Forms/TrainingForms'

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

export default function PreviewCCR({ onClose, batch, batch_no, batchID, courseID, start_date, end_date, course, courseCode }: TFProps) {
    const toast = useToast()
    const { allData: allTrainingData } = useTraining()
    const { data: courseBatch } = useCourseBatch()
    const { allData: allRegistrations } = useRegistrations()
    const { data: allRanks } = useRank()
    const { data: allTrainee } = useTrainees()
    const { courseCodes } = useClients()
    const { data: allInstructors } = useInstructors()

    const [loading, setLoading] = useState<boolean>(false)
    const [trainingsArr, setTrainingsArr] = useState<TRAINING_BY_ID[]>([])

    const [file, setFile] = useState<File[]>([])
    const [attachmentType, setAttachmentType] = useState<string>('ccr')
    const [batchRemarks, setRemarks] = useState<string>('')

    const matchedCourseAndCompanyCourse = courseCodes?.filter((courseCode) => courseCode.id_course_ref === courseID).map((courseCode) => courseCode.id)
    useEffect(() => {
        const fetchData = () => {
            const tempTrainingsArr = allTrainingData?.filter((training) => 
                (training.course === courseID || matchedCourseAndCompanyCourse?.includes(training.course)) 
                    && training.batch.toString() === batchID
                )
            setTrainingsArr(tempTrainingsArr || [])
            console.log("TRAININGS ARR: ", tempTrainingsArr)
        }
        fetchData()
    }, [])
    const formattedDate = end_date === '' ? formatDateToShort(start_date) :getFormatDate(`${start_date} - ${end_date}`)

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `CCR_FORM B${batch?.batch_no}.pdf`,
        onBeforePrint: () => handleToast('Preparing to print...', ``, 3000, 'info'),
        onAfterPrint: () => {
            handlePrintAttachment();
            handleToast('Print Completed!', ``, 3000, 'success'); 
        },
    })

    const attachRef = useRef<HTMLDivElement | null>(null);
    const handlePrintAttachment = useReactToPrint({
        content: () => attachRef.current,
        documentTitle: `CCR_Attachment B${batch?.batch_no}.pdf`,
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

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>, trainingId: string) => {
        const { id, value } = e.target;

        setTrainingsArr((prev) =>
            prev.map((training) =>
            training.id === trainingId
                ? { ...training, [id]: value } // update only the changed field
                : training
            )
        )
    }

    const handleUpdateData = async () => {
        if (trainingsArr.length === 0) return;

        setLoading(true);

        try {
            const actor = localStorage.getItem('customToken');

            // Create an array of promises — one for each training document to update
            const updatePromises = trainingsArr.map((training) => {
            const updatedData = {
                written: training.written,
                practical: training.practical,
                cert_no: training.cert_no,
                // include other fields you want to update
            };
            // Assuming you have your update function like:
            return UPDATE_TRAINING(training.id, updatedData, actor);
            });
            // Wait for all updates to complete
            await Promise.all(updatePromises);

            handleToast('All marks have been recorded successfully!', '', 5000, 'success');
        } catch (error) {
            console.error('ERROR DETECTED: ', error);
            handleToast('An error occurred while updating data.', '', 5000, 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleAttachment = async () => {
        try{
            await scannedAttachment(batchID, attachmentType, courseCode, batchRemarks, file, file[0].name)
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
                <Box display='flex' gap='3' justifyContent='start'>
                    <Box display='flex' gap='3' justifyContent='start' alignItems='end' mb={2}>
                        <FormControl w='auto' display='flex' gap='2' alignItems='center'>
                            <FormLabel m='0' fontWeight='normal' >Attachment:</FormLabel>
                            <Input w='400px' type='file' accept='image/*, .pdf' onChange={(e) => setFile(e.target.files ? Array.from(e.target.files) : [])} />
                        </FormControl>
                    </Box>
                    <Box display='flex' jusitfyContent='start' alignItems='end' mb='2' gap='3'>
                        <FormControl w='auto' display='flex' alignItems='end'>
                            <FormLabel fontWeight='normal'>Remarks:</FormLabel>
                            <Input type='text' onChange={(e) => setRemarks(e.target.value)} shadow='md'/>
                        </FormControl>
                        <Button onClick={handleAttachment} colorScheme='blue' bgColor='blue.700' shadow='md' >Upload</Button>
                    </Box>
                </Box>
            </Box>
            <Box display='flex' mb='5' justifyContent='space-between'>
                <Box p='2' borderRadius='5px' border='1px dotted black'>
                    <Text color='red' fontWeight='bold'>Legend:</Text>
                    <Text fontWeight='normal' fontSize='8pt'>{`Performed (P): Input 101 on the Practical Field`}</Text>
                    <Text fontWeight='normal' fontSize='8pt'>{`Not applicable (N/A): Input 102 on the Practical Field`}</Text>
                    <Text fontWeight='normal' fontSize='8pt'>{`For Incomplete, both written and practical fields must be set to zero (0).`}</Text>
                </Box>
                <Button onClick={handleUpdateData} isLoading={loading} loadingText='Saving...' size='sm' shadow='md' colorScheme='blue' bgColor='blue.700'>Save Grades</Button>
            </Box>
            <Box display='flex' justifyContent='center' alignItems='center' w='100%'>
                <Box w='70%' display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                    <Box display='flex' w='100%' mb='2' borderBottom='1px solid black' justifyContent='center' alignItems='center'>
                        {/** Table Header */}
                            <Box w='20px'>
                                <Text>No</Text>
                            </Box>
                            <Box w='300px' fontWeight='normal' display='flex' alignItems='center' flexDir='column' justifyContent='center'>
                                <Text fontWeight='bold'>{`Name of Trainee`}</Text>
                                <Text>{`(LastName, First Name, Middle name)`}</Text>
                            </Box>
                            <Box w='50px'  textAlign='center'>
                                <Text>Rank</Text>
                            </Box>
                            <Box w='100px'  textAlign='center'>
                                <Text>Registration No.</Text>
                            </Box>
                            <Text w='100px' textAlign='center'>{`Written (%)`}</Text>
                            <Text w='100px' textAlign='center'>{`Practical (%)`}</Text>
                            <Text w='100px' textAlign='center'>
                                Passed
                            </Text>
                            <Box w='100px' textAlign='center'>
                                <Text >Failed</Text>
                            </Box>
                            <Box w='100px' textAlign='center'>
                                <Text >Incomplete</Text>
                            </Box>
                            <Box w='200px' textAlign='center'>
                                Training Certificate Number
                            </Box>
                    </Box>
                    {/** Table Body */}
                    {Array.isArray(trainingsArr) && trainingsArr.length > 0 && (trainingsArr.sort((a, b) => {
                            const regNoA = allRegistrations?.find((r) => r.id === a.reg_ref_id)?.reg_no || '0-0';
                            const regNoB = allRegistrations?.find((r) => r.id === b.reg_ref_id)?.reg_no || '0-0';

                            const [yearA, monthA, numberA] = regNoA.split('-').map(Number);
                            const [yearB, monthB, numberB] = regNoB.split('-').map(Number);

                            return yearA === yearB ? numberA - numberB : yearA - yearB;
                        }).map((training, index) => {
                            const registrations = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                            const trainee = allTrainee?.find((t) => t.id === registrations?.trainee_ref_id)
                            return(
                                <Box w='100%' key={training.id} borderColor='black' borderBottomStyle='dotted' borderBottomWidth='0.5pt' display='flex' justifyContent='center' alignItems='center' textTransform='uppercase' mb='3' fontWeight={'normal'} fontFamily='Calibri'>
                                    <Text w='20px' >
                                        {(index + 1)}
                                    </Text>
                                    <Text w='300px' textAlign='center'>
                                        {`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name} ${trainee?.suffix.toLowerCase() === 'n/a' || trainee?.suffix === '' ? '' : `${trainee?.suffix}`}`}`}
                                    </Text>
                                    <Text w='50px' textAlign='center'>
                                        {allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}
                                    </Text>
                                    <Text w='100px' textAlign='center'>
                                        {`Reg-${registrations?.reg_no}`}
                                    </Text>
                                    <Text w='100px' display='flex' justifyContent='center' alignItems='center'>
                                        <Input id='written' w='50%' onChange={(e) => handleOnChange(e, training.id)} value={training.written} size='sm' shadow='md' />
                                    </Text>
                                    <Text w='100px' display='flex' justifyContent='center' alignItems='center'>
                                        <Input id='practical' w='50%' onChange={(e) => handleOnChange(e, training.id)} value={Number(training.practical) === 102 ? 'N/A' : Number(training.practical) === 101 ? 'P' : training.practical} size='sm' shadow='md' />
                                    </Text>
                                    <Text w='100px'  textAlign='center' >
                                        {Number(training?.practical) === 101 || Number(training?.practical) === 102 ? Number(training?.written) >= 75 && '✓' : ((Number(training?.written) + Number(training?.practical)) / 2) >= 75 && '✓'}
                                    </Text>
                                    <Text w='100px'  textAlign='center' >
                                        {Number(training?.written) !== 0 && Number(training?.practical) !== 0 && (
                                            Number(training?.practical) === 101 || Number(training?.practical) === 102
                                            ? (Number(training?.written) < 75) && '✓'
                                            : ((Number(training?.written) + Number(training?.practical)) / 2 < 75) && '✓'
                                        )}
                                    </Text>
                                    <Text w='100px'  textAlign='center' >
                                        {Number(training?.written) !== 0 && Number(training?.practical) !== 0 || (
                                            Number(training?.written) === 0 && Number(training?.practical) === 0 ? '✓' : '🗙'
                                        )}
                                    </Text>
                                    <Text w='200px' display='flex' justifyContent='center'>
                                        <Input id='cert_no' value={training.cert_no} onChange={(e) => handleOnChange(e, training.id)} shadow='md' size='sm' />
                                    </Text>
                                </Box>
                            )})
                        )}
                </Box>
            </Box>
        </Box>
        <Box mt='6' borderTop='1px solid black' py='4' w='100%' display='flex' justifyContent='space-between' alignItems='center'>
            <Text>PRINTABLE COURSE COMPLETION</Text>
            <Button onClick={handlePrint} bgColor='#1C437E' colorScheme='blue' loadingText='Printing...' shadow='md'>Print Course Completion</Button>
        </Box>
        <Box w='100%' 
            ref={componentRef} 
            // className="printable-content"
        >
            <CCR batch={batch} trainingsArr={trainingsArr} />
        </Box>
        <Box 
            ref={attachRef} 
            display="flex" 
            flexDirection="column"
            position='relative' 
            w='210mm' h='297mm' // Ensures it stretches to full screen/container height
            sx={{display: 'none', '@media print': {display: 'block', position: 'relative', fontFamily: 'Arial, Helvetica, sans-serif !important', WebkitPrintColorAdjust: 'exact', '*': {fontFamily: 'Arial, Helvetica, sans-serif !important'}}}}
        >
            {/* FIXED LOGO HEADER */}
            <Box 
                display='flex' 
                w='100%' 
                justifyContent='center' 
                alignItems='center'
                flexShrink={0} // Prevents the logo container from squishing
            >
                <ChakraImage src='/Logo.jpg' width='350px' h='100%' alt='attachment placeholder' />
            </Box>
            {/* MIDDLE CONTENT - SCROLLS / STRETCHES */}
            <Box display='flex' mt='4' justifyContent='center' alignItems='center' flexDir='column'>
                <Text fontSize='2xl'>ASSESSMENT ATTACHMENT</Text>
                <Box mt='4' fontSize='lg' w='100%' px='8'>
                    <Text>{`Course: ${course.toUpperCase()}`}</Text>
                    <Text>{`Training Schedule: ${batch?.start_date} ${batch?.end_date !== '' ? `to ${batch?.end_date}` : ''}`}</Text>
                </Box>
            </Box>
            <Box 
                flex="1" // Takes up all remaining vertical space pushing header up and footer down
                overflowY="auto" // Allows content to scroll inside if it overflows
                display="flex"
                justifyContent="center"
                alignItems="center"
                mt='8'
                flexDir='column'
                gap='6'
            >
                {batch?.ccr && batch?.ccr !== '' && (
                    <ChakraImage src={batch?.ccr} width='70%' height='auto' alt='attachment' />
                )}
                <Box w='100%' display='flex' flexDir='column' px='8' justifyContent='start' pt='10' gap='3'>
                    <Text>REMARKS:</Text>
                    <Text fontWeight='normal'>{batch.remarks}</Text>
                </Box>
            </Box>
            {/* FIXED FOOTER */}
            <Box 
                position='absolute'
                w='100%' 
                display='flex' 
                justifyContent='center' 
                alignItems='center'
                bottom='0'
                left='0'
                pb='4'
            >
                <ChakraImage src='/Footer.png' width='500px' h='100%' alt='Footer placeholder' />
            </Box>
        </Box>
        </>
    )
}