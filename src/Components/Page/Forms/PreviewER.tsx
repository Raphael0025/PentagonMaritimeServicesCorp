'use client'

import React from 'react';
import { useState, useEffect, useRef } from 'react'
import { Box, Text, Input, useToast, Select, Button, Grid, GridItem } from '@chakra-ui/react'

import { StandardER, MDS_ER, STCW_ER } from '@/Components/Page/Forms/EnrollmentReports'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useRank } from '@/context/RankContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useInstructors } from '@/context/InstructorContext'
import { CourseBatchByID, initCourseBatch } from '@/types/course-batches'
import { useRoles } from '@/context/UserRolesContext'

import { getFormatDate } from '@/handlers/util_handler';
import { formatDateToShort } from '@/handlers/trainee_handler';
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import { UPDATE_BATCH } from '@/lib/course_batches_controller'

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
    const { data: allInstructors } = useInstructors()
    const { allData: allTrainingData } = useTraining()
    const { allData: allRegistrations } = useRegistrations()
    const { data: allRanks } = useRank()
    const { data: allTrainee } = useTrainees()
    const { courseCodes } = useClients()
    const { data: courseBatch } = useCourseBatch()
    const { data: allRoles } = useRoles()
    
    const [year, setYear] = useState<string>('')
    const [room, setRoom] = useState<string>('')
    const [assessor, setAssessor] = useState<string>('')
    const [instructor, setInstructor] = useState<string>('')
    const [practicumSite, setSite] = useState<string>('')
    const [practicumDate, setDate] = useState<string>('')
    const [classNo, setClassNo] = useState<string>('')
    const [batch, setBatch] = useState<CourseBatchByID>(initCourseBatch)

    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchData = () => {
            const batchData = courseBatch?.find((b) => b.id === batchID)
            if(batchData) {
                setBatch(batchData)
            }
        }
        fetchData()
    }, [batchID])

    const [permissions, setPermissions] = useState<any[]>([])
    
    useEffect(() => {
        const fetchData = () => {
            const role = localStorage.getItem('roleToken');
            if (!role) return;

            const userRole = allRoles?.find(r => r.id === role)
            if (!userRole) return;

            // Check whether the found role belongs to the training department
            const permissions = userRole.permissions.filter(
                (p: any) => p.department === "Registration" && p.feature === "Batch Records"
            )
            setPermissions(permissions)
        }
        fetchData()
    }, [])

    const canDo = (feature: string) => {
        return permissions.some(p => p.allowed.includes(feature));
    }

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

    const handleBatchOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target

        setBatch((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleBatchOnChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target

        setBatch((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleBatchDetails = async () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const batchDetails = {
                        room: batch.room,
                        practicumSite: batch.practicumSite,
                        practicumDate: batch.practicumDate,
                        assessor: batch.assessor,
                        instructor: batch.instructor,
                    }
                    await UPDATE_BATCH(batchID, batchDetails, actor)
                    handleToast('Batch details updated successfully!', ``, 5000, 'success')
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
        })
    }

    return (
        <>
        <Box w='70%' display={'flex'} flexDir='column' justifyContent='center'>
            <Box mb={4} pb={3} borderBottom='1px' borderColor='gray.400' >
                <Text fontSize='15px' display='flex' justifyContent='start' mb={4}>
                    <Text as='span' color='gray.600' mr={3}>Course:</Text>
                    <Text as='span' fontWeight='normal'>{course.toUpperCase()}</Text>
                </Text>
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
                    {e_report === 'MDS' ? (
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
                    ) : e_report === 'STANDARD' && (
                    <Box>
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
                            <Text w='50%' fontSize='15px' display='flex' justifyContent='start'>
                                <Text as='span' color='gray.600' mr={3}>Schedule:</Text>
                                <Text as='span' fontWeight='normal'>{`${formattedDate}`}</Text>
                            </Text>
                            {/* <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                                <Text w='40%' as='span' color='gray.600'>Training Year:</Text>
                                <Input w='30%' shadow='md' onChange={(e) => setYear(e.target.value)} />
                            </Box> */}
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                                <Text w='40%' as='span' color='gray.600'>Class No:</Text>
                                <Text w='30%'>{batch_no}</Text>
                            </Box>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                                <Text w='40%' as='span' color='gray.600'>Room No:</Text>
                                <Input w='30%' isDisabled={!canDo('update')} value={batch?.room} shadow='md' id='room' onChange={handleBatchOnChange} />
                            </Box>
                        </Box>
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center' mr='2'>
                                <Text w='50%' as='span' color='gray.600'>Practicum Site/Vessel:</Text>
                                <Input w='100%' isDisabled={!canDo('update')} value={batch?.practicumSite} shadow='md' id='practicumSite' onChange={handleBatchOnChange} />
                            </Box>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center' mr='2'>
                                <Text w='50%' as='span' color='gray.600'>Practicum Date:</Text>
                                <Input w='100%' shadow='md' isDisabled={!canDo('update')} value={batch?.practicumDate} id='practicumDate' onChange={handleBatchOnChange} />
                            </Box>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center' mr='2'>
                                <Text w='50%' as='span' color='gray.600'>Assessor:</Text>
                                <Select id='assessor' isDisabled={!canDo('update')} shadow='md' onChange={handleBatchOnChangeSelect} >
                                    <option hidden>{`${batch.assessor ? (allInstructors?.find((i) => i.id === batch.assessor)?.name || batch.assessor) : 'Select Assessor'}`}</option>
                                    {allInstructors && allInstructors.map((i) => (
                                        <option key={i.id} value={i.id}>{`${i.rank} ${i.name}`}</option>
                                    ))}
                                    <option value={'N/A'}>N/A</option>
                                </Select>
                            </Box>
                            <Box w='50%' fontSize='15px' display='flex' alignItems='center'>
                                <Text w='50%' as='span' color='gray.600'>Instructor:</Text>
                                {/* <Input w='100%' shadow='md' onChange={(e) => setInstructor(e.target.value)} /> */}
                                <Select id='instructor' isDisabled={!canDo('update')} shadow='md' onChange={handleBatchOnChangeSelect} >
                                    <option hidden>{`${batch.instructor ? (allInstructors?.find((i) => i.id === batch.instructor)?.name || batch.instructor) : 'Select Instructor'}`}</option>
                                    {allInstructors && allInstructors.map((i) => (
                                        <option key={i.id} value={i.id}>{`${i.rank} ${i.name}`}</option>
                                    ))}
                                </Select>
                            </Box>
                        </Box>
                        <Box display='flex' justifyContent='space-between' alignItems='center' >
                            <Text>
                                <Text fontWeight='bold'>Note:</Text>
                                <Text color='red' fontWeight='normal'>{`Kindly save details above before printing the Enrollment Report (ER).`}</Text>
                            </Text>
                            {canDo('update') && (
                                <Button isLoading={loading} loadingText='Saving...' onClick={handleBatchDetails} size='sm' colorScheme='blue' bgColor='blue.700'>Save Details</Button>
                            )}
                        </Box>
                    </Box>
                    )}
                </Box>
            </Box>
            <Box display='flex' justifyContent='center' alignItems='center'>
                <Box>
                    {/** Table header */}
                    <Grid templateColumns="0.34in 1.93in 0.76in 1.05in 0.66in 0.83in 1.27in" gap={0} fontSize='9pt' h='0.63in' fontWeight='normal' textAlign='center' fontFamily='Calibri' >
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>NO.</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Name of Trainee</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Date of Birth</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Place of Birth</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Rank/ Position</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Date of Enrollment</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" justifyContent='center' alignItems='center'>Registration No.</GridItem>
                    </Grid>
                    {/** Table Body */}
                    {trainingsArr// Create a shallow copy to avoid mutating the original array
                    ?.slice() // Create a shallow copy to avoid mutating the original array
                    .sort((a, b) => {
                        const regNoA = allRegistrations?.find((r) => r.id === a.reg_ref_id)?.reg_no || '';
                        const regNoB = allRegistrations?.find((r) => r.id === b.reg_ref_id)?.reg_no || '';
                
                        // Extract numeric parts of the registration number
                        const [yearA, monthA, numA] = regNoA.split('-').map(Number);
                        const [yearB, monthB, numB] = regNoB.split('-').map(Number);
                
                        // Handle invalid or missing values gracefully
                        if (isNaN(yearA) || isNaN(monthA) || isNaN(numA)) return 1; // Place invalid `a` after valid `b`
                        if (isNaN(yearB) || isNaN(monthB) || isNaN(numB)) return -1; // Place invalid `b` after valid `a`

                        // Compare by year first
                        if (yearA !== yearB) return yearB - yearA;

                        // Compare by month next
                        if (monthA !== monthB) return monthB - monthA;

                        // Finally, compare by the number part
                        return numA - numB;
                    })
                    .sort((a, b) => parsingTimestamp(a.date_enrolled).getTime() - parsingTimestamp(b.date_enrolled).getTime())
                    .map((training, index) => {
                        const registrations = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                        const trainee = allTrainee?.find((t) => t.id === registrations?.trainee_ref_id)
                        return(
                            <Grid key={training.id} templateColumns="0.34in 1.93in 0.76in 1.05in 0.66in 0.83in 1.27in" h='0.25in' textTransform='uppercase' fontSize='8pt' gap={0} fontWeight={'normal'} fontFamily='Calibri'>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {(index + 1)}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' px='2' alignItems='center'>
                                    {`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name} ${trainee?.suffix.toLowerCase() === 'n/a' || trainee?.suffix === '' ? '' : `${trainee?.suffix}`}`}`}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {trainee?.birthDate ? parsingTimestamp(trainee.birthDate).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: '2-digit', }).replace(/[\s,\/]+/g, '-') : ''}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' fontSize='7pt' borderRight="none" justifyContent='center' textAlign='center' alignItems='center'>
                                    {trainee?.birthPlace}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {parsingTimestamp(training?.date_enrolled).toLocaleDateString('en-US', {  year: '2-digit', month: 'short',  day: '2-digit',}).replace(/[\s,\/]+/g, '-')}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' justifyContent='center' alignItems='center'>
                                    {`Reg-${registrations?.reg_no}`}
                                </GridItem>
                            </Grid>
                        )
                    })}
                    {/** Add the *NOTHING FOLLOWS* row immediately after the last data row */}
                    {(trainingsArr ?? []).length > 0 && (
                        <Grid templateColumns="0.34in 1.93in 0.76in 1.05in 0.66in 0.83in 1.27in" h='0.25in' textTransform="uppercase" fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
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
                            <Grid key={index} templateColumns="0.34in 1.93in 0.76in 1.05in 0.66in 0.83in 1.27in" h='0.25in' textTransform="uppercase" fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
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
        <Box w='100%' 
        ref={componentRef} 
        className="printable-content"
        >
            {e_report === 'STANDARD' ? (
                <StandardER courseCode={courseCode} batchNo={batch_no} assessor={batch.assessor} instructor={batch.instructor} practicumDate={batch.practicumDate} site={batch.practicumSite} course={course} trainingArray={trainingsArr} schedule={formattedDate} year={year} room={batch.room}/>
            ) : e_report === 'STCW' ? (
                <STCW_ER e_report={e_report} course={courseCode} schedule={formattedDate} year={year} room={room}/>
            ) : e_report === 'MDS' && (
                <MDS_ER e_report={e_report} course={courseCode} trainingArray={trainingsArr} schedule={formattedDate} year={year} room={room} assessor={assessor} instructor={instructor} practicumDate={practicumDate} practicumSite={practicumSite} class_no={classNo}/>
            )}
        </Box>
        <Box mt='4' w='100%' py='2' borderTopWidth='1px' borderColor='gray.500' display='flex' justifyContent='center'>
            <Button onClick={() => {onClose();}} mr={3} shadow='md'>Close Preview</Button>
            {canDo('print') && (
                <Button isDisabled={ batch.room === ''} onClick={handlePrint} bgColor='#1C437E' colorScheme='blue' loadingText='Saving...' shadow='md'>Print Report</Button>
            )}
        </Box>
        </>
    );
}