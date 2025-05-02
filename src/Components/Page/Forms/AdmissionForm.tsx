'use client'

import { useState, useRef } from 'react'
import { Box, Text, Grid, Image, GridItem } from '@chakra-ui/react'

import {TrashIcon, Loading, DownloadIcon, PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'
import {NextIcon, ListIcon, EmergencyIcon, CourseIcon, PlusIcon, ClipIcon, SignIcon, PolicyIcon, ReviewIcon, SubmitIcon, CheckIcon} from '@/Components/SideIcons'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import {useRank} from '@/context/RankContext'

import { useReactToPrint } from 'react-to-print'
import { parsingTimestamp, ToastStatus } from '@/types/handling'
import './reg_admission.css'

import { reformatTrainingSched } from '@/handlers/trainee_handler'

interface UIProps {
    regNum: string,
    traineeName: string
}

export default function Page({regNum, traineeName}: UIProps){

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${traineeName}_ADMISSION_FORM.pdf`,
    })

    const { data: courseBatch } = useCourseBatch()
    const { data: allRanks } = useRank()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining } = useTraining()
    const { data: allCourses } = useCourses()
    const { lastMonthReg: allRegistrations } = useRegistrations()

    const reg = allRegistrations?.find((r) => r.id === regNum);
    if (!reg) {
        return <Text>No registration found.</Text>;
    }

    const traineeInfo = allTrainee?.find((trainee) => trainee.id === reg.trainee_ref_id);
    if (!traineeInfo) {
        return <Text>No trainee information found.</Text>;
    }

    const trainings = allTraining?.filter((t) => t.reg_ref_id === regNum && t.reg_status >= 3);
    if (!trainings || trainings.length === 0) {
        return <Text>No trainings found.</Text>;
    }

    return(
    <>
        <Box 
        w='100%'
        className='page-break'
        >
            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center' >
                {/** Header */}
                <Box display='flex' justifyContent='space-between' alignItems='center' w='100%'>
                    <Image src='/Logo.jpg' width={'2.81in'} height={'0.66in'} alt='logo'/>
                    <Box >
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='9pt' fontFamily='Calibri, Arial, sans-serif' fontWeight='normal'>
                            <Text as='span' mr={1}>
                                <PinIcon size={'12'} color={'#000'} />
                            </Text>
                            <Text>2/F 801 Building UN Avenue Ermita Manila</Text>
                        </Text>
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='9pt' fontFamily='Calibri, Arial, sans-serif' fontWeight='normal'>
                            <Text as='span' mr={1}>
                                <PhoneIcon size={'12'} color={'#000'} />
                            </Text>
                            <Text>(02) 8 281-8155</Text>
                        </Text>
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='9pt' fontFamily='Calibri, Arial, sans-serif' fontWeight='normal'>
                            <Text as='span' mr={1}>
                                <MailIcon size={'12'} color={'#000'} />
                            </Text>
                            <Text>pentagonmaritimeservicescorp@gmail.com</Text>
                        </Text>
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='9pt' fontFamily='Calibri, Arial, sans-serif' fontWeight='normal'>
                            <Text as='span' mr={1}>
                                <FacebookIcon size={'12'} color={'#000'} />
                            </Text>
                            <Text>/pentagonmaritimeservicescorp</Text>
                        </Text>
                    </Box>
                </Box>
                <Box display='flex' flexDir='column' w='100%' >
                    <Box className='flex w-full justify-between'>
                        <Text fontSize='22pt' fontWeight='bold' color='#002060' textTransform='uppercase' fontFamily='Arial, sans-serif'>Admission Form</Text>
                        <Box w='2.26in' fontFamily='Arial, sans-serif' lineHeight={'none'} px='4' py='2' h='0.48in' borderColor='black' borderWidth='0.75pt'>
                            <Text mb='0' fontSize='10pt' sx={{fontVariant: 'small-caps'}} textTransform='uppercase' fontWeight='bold' >Registration No:</Text>
                            <Text mt='0' fontSize='12pt' px='5' textTransform='uppercase' fontWeight='bold' color='#ff0000'>{`REG-${reg.reg_no}`}</Text>
                        </Box>
                    </Box> 
                    <Box>
                        <Box display='flex' flexDir='column'  className='content-one p-1'>
                            <Text fontWeight='bold' as='i' fontFamily='Calibri' fontSize='7pt' w='100%' textAlign='end'>{`FM-02-10-01 REV.03  Issued Date: 05/01/2025`}</Text>
                        </Box>
                        <Grid h='0.22in' pt='0.1px' pb='4' sx={{ textIndent: '0.08in' }} fontSize='9pt' bgColor='#002060' color='white' fontWeight='bold' fontFamily='Arial'>
                            <GridItem display='flex' border="0.5pt solid black" borderBottom='none' justifyContent='start' alignItems='start'>
                                <Text as='span'>{`TRAINEE'S INFORMATION`}</Text>
                            </GridItem>
                        </Grid>
                        <Grid templateColumns="1.6in 1.7in 1.65in 0.6in 1.56in 1.7in" gap={0} textTransform='uppercase' h='0.43in' fontWeight='normal' fontFamily='Arial MT, sans-serif' >
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt' >Last Name:</Text>
                                <Text fontSize='9pt' >{traineeInfo.last_name}</Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt' >First Name:</Text>
                                <Text fontSize='9pt' >{traineeInfo.first_name}</Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt' >Middle Name:</Text>
                                <Text fontSize='9pt' >{traineeInfo.middle_name !== '' ? traineeInfo.middle_name : ''}</Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderRight="none" justifyContent='start' alignItems='start' >
                                <Text fontSize='7pt' >Suffix:</Text>
                                <Text fontSize='9pt' >{traineeInfo.suffix !== '' ? traineeInfo.suffix : ''}</Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt' >Position/Rank:</Text>
                                <Text fontSize='9pt' >
                                    {allRanks?.find((rank) => rank.code === traineeInfo.rank)?.rank || traineeInfo.rank}
                                </Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt' >SRN#:</Text>
                                <Text fontSize='9pt' >{traineeInfo.srn}</Text>
                            </GridItem>
                        </Grid>
                        <Box display='flex' flexDir='column'>
                            <Grid h='0.30in' pt='0.1px' pb='4' sx={{ textIndent: '0.08in' }} fontSize='9pt' bgColor='#002060' color='white' fontWeight='bold' fontFamily='Arial'>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderBottom='none' justifyContent='start' alignItems='start'>
                                    <Text as='span'>To the Instructor: This is to Endorse Admission of Subject Trainee to Below Course Details;</Text>
                                </GridItem>
                            </Grid>
                            <Box className='flex'>
                                <Box w='100%'>
                                    <Grid templateColumns="3.24in 2.25in 0.98in 2.35in" gap={0} textAlign='center' textTransform='uppercase' fontSize='7.4pt' h='0.29in' fontWeight='normal' fontFamily='Arial, sans-serif' >
                                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Course</GridItem>
                                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Schedule</GridItem>
                                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>{`Time`}</GridItem>
                                        <GridItem display='flex' border="0.5pt solid black" justifyContent='center' alignItems='center'>{`Room No.`}</GridItem>
                                    </Grid>
                                    {trainings && trainings.length > 0 ? (
                                        trainings.filter((training) => training.reg_status === 3).map((training, index) => (
                                            <Grid key={index} templateColumns="3.24in 2.25in 0.98in 2.35in" gap={0} h='0.31in' fontFamily="Arial, sans-serif" textTransform='uppercase' fontWeight='normal' fontSize='8pt'>
                                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent="center" alignItems="center">
                                                    <Text >
                                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                                    </Text>
                                                </GridItem>
                                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent="center" alignItems="center">
                                                    <Text>
                                                        {reformatTrainingSched(training.start_date, training.end_date)}
                                                    </Text>
                                                </GridItem>
                                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent="center" alignItems="center">
                                                    <Text>{``}</Text>
                                                </GridItem>
                                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' justifyContent="center" alignItems="center">
                                                    <Text>{``}</Text>
                                                </GridItem>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid templateColumns="3.24in 2.25in 0.98in 2.35in" gap={0} h='0.31in' >
                                            <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                <Text></Text>
                                            </GridItem>
                                            <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                <Text></Text>
                                            </GridItem>
                                            <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                <Text></Text>
                                            </GridItem>
                                            <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                <Text></Text>
                                            </GridItem>
                                            <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                <Text></Text>
                                            </GridItem>
                                            <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                <Text></Text>
                                            </GridItem>
                                            <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                <Text></Text>
                                            </GridItem>
                                            <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                <Text></Text>
                                            </GridItem>
                                        </Grid>
                                    )}
                                    {trainings && trainings.length < 8 && 
                                        [...Array(8 - trainings.length)].map((_, index) => (
                                            <Grid key={index} templateColumns="3.24in 2.25in 0.98in 2.35in" gap={0} h='0.31in' >
                                                <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                    <Text></Text>
                                                </GridItem>
                                                <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                    <Text></Text>
                                                </GridItem>
                                                <GridItem border="0.5pt solid black" borderTop='none' borderRight="none">
                                                    <Text></Text>
                                                </GridItem>
                                                <GridItem border="0.5pt solid black" borderTop='none' >
                                                    <Text></Text>
                                                </GridItem>
                                            </Grid>
                                        ))
                                    }
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </>
    )
}