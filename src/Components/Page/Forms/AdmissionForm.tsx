'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Box, Text, Input, Textarea, Button, InputLeftAddon, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react'

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
        <Box className='flex flex-col space-y-4 page-break'>
            <Box className='flex flex-col space-y-1 px-6' ref={componentRef}>
                <div className='content-head'>
                    <Image src='/Logo.jpg' width={'180'} height={'80'} alt='logo'/>
                    <div className='hide'>
                        <p style={{fontSize: '7px', color: '#333333', display: 'flex', gap: '4px'}}><span><PinIcon size={'14'} color={'#333333'} /></span>2/F 801 Building UN Avenue Ermita Manila</p>
                        <p style={{fontSize: '7px', color: '#333333', display: 'flex', gap: '4px'}}><span><PhoneIcon size={'14'} color={'#333333'} /></span>(02) 8 281-8155</p>
                        <p style={{fontSize: '7px', color: '#333333', display: 'flex', gap: '4px'}}><span><MailIcon size={'14'} color={'#333333'} /></span>pentagonmaritimeservicescorp@gmail.com</p>
                        <p style={{fontSize: '7px', color: '#333333', display: 'flex', gap: '4px'}}><span><FacebookIcon size={'14'} color={'#333333'} /></span>/pentagonmaritimeservicescorp</p>
                    </div>
                </div>
                <div className='flex flex-col justify-between py-1'>
                    <div className='flex w-full justify-between'>
                        <h3 style={{fontSize: '22px', color: '#1C437E', fontWeight: '700', textTransform: 'uppercase'}}>Admission Form</h3>
                        <Box w='200px' className='border px-3 py-1 border-2 border-black flex flex-col'>
                            <Text fontSize='15px'>Registration No:</Text>
                            <Text fontSize='18px' className='text-red-500'>{`REG-${reg.reg_no}`}</Text>
                        </Box>
                    </div>
                    <div>
                        <Box className='content-one p-1'>
                            <Text fontSize='7px' className='text-end w-full italic'>{`FM-02-10-02 REV.02  Issued Date: 08/01/2024`}</Text>
                        </Box>
                        <Box className='content-one p-1 ps-2' style={{backgroundColor: '#002060', color: 'white'}}>
                            <Text fontSize='10px'>{`TRAINEE'S INFORMATION`}</Text>
                        </Box>
                        <Box className='content-one'>
                            <Box className='content-child'>
                                <Text className='label-text'>Last Name:</Text>
                                <Text className='value-text capitalize'>{traineeInfo.last_name}</Text>
                            </Box>
                            <Box className='content-child'>
                                <Text className='label-text'>First Name:</Text>
                                <Text className='value-text capitalize'>{traineeInfo.first_name}</Text>
                            </Box>
                            <Box className='content-child'>
                                <Text className='label-text'>Middle Name:</Text>
                                <Text className='value-text capitalize'>{traineeInfo.middle_name !== '' ? traineeInfo.middle_name : ''}</Text>
                            </Box>
                            <Box className='content-child' style={{width: '30%'}}>
                                <Text className='label-text'>Suffix:</Text>
                                <Text className='value-text capitalize'>{traineeInfo.suffix !== '' ? traineeInfo.suffix : ''}</Text>
                            </Box>
                            <Box className='content-child'>
                                <Text className='label-text'>Position/Rank:</Text>
                                <Text className='value-text capitalize'>
                                    {allRanks?.find((rank) => rank.code === traineeInfo.rank)?.rank || traineeInfo.rank}
                                </Text>
                            </Box>
                            <div className='content-child'>
                                <p  className='label-text'>SRN#:</p>
                                <p className='value-text' >{traineeInfo.srn}</p>
                            </div>
                        </Box>
                        <Box className='flex flex-col '>
                            <Box className='content-one p-1 ps-2 uppercase' style={{backgroundColor: '#002060', color: 'white'}}>
                                <Text fontSize='10px'>To the Instructor: This is to endorse admission of subject trainee to below course details;</Text>
                            </Box>
                            <Box className='flex'>
                                <Box w='100%'>
                                    <Box className='content-one-training'>
                                        <Text className='label-text text-center p-1' w='100%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Course</Text>
                                        <Text className='label-text text-center p-1' w='60%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Schedule</Text>
                                        <Text className='label-text text-center p-1' w='50%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Time</Text>
                                        <Text className='label-text text-center p-1' w='50%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Room No.</Text>
                                    </Box>
                                    {trainings && trainings.length > 0 ? (
                                        trainings.map((training, index) => (
                                            <Box key={index} className='content-one'>
                                                <Box className='training-content-child flex justify-center items-center'>
                                                    <Text className='uppercase'>
                                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                                    </Text>
                                                </Box>
                                                <Box w='60%' className='training-content-child flex justify-center items-center'>
                                                    <Text>
                                                        {reformatTrainingSched(training.start_date, training.end_date)}
                                                    </Text>
                                                </Box>
                                                <Box w='50%' className='training-content-child flex justify-center items-center'>
                                                    <Text></Text>
                                                </Box>
                                                <Box w='50%' className='training-content-child flex justify-center items-center'>
                                                    <Text></Text>
                                                </Box>
                                            </Box>
                                        ))
                                    ) : (
                                        <Box className='content-one'>
                                            <Box className='flex justify-center items-center'>
                                                <Text></Text>
                                            </Box>
                                            <Box className='training-content-child'>
                                                <Text></Text>
                                            </Box>
                                            <Box className='training-content-child'>
                                                <Text></Text>
                                            </Box>
                                            <Box className='training-content-child'>
                                                <Text></Text>
                                            </Box>
                                            <Box className='training-content-child'>
                                                <Text></Text>
                                            </Box>
                                            <Box className='training-content-child'>
                                                <Text></Text>
                                            </Box>
                                            <Box className='training-content-child'>
                                                <Text></Text>
                                            </Box>
                                            <Box className='training-content-child'>
                                                <Text></Text>
                                            </Box>
                                        </Box>
                                    )}
                                    {trainings && trainings.length < 7 && 
                                        [...Array(8 - trainings.length)].map((_, index) => (
                                            <Box key={index} className="content-one">
                                                <Box className="training-content-child flex-row text-center flex justify-center items-center">
                                                    <Text></Text>
                                                </Box>
                                                <Box w='60%' className="training-content-child flex-row text-center flex justify-center items-center">
                                                    <Text></Text>
                                                </Box>
                                                <Box w='50%' className="training-content-child text-center flex-row flex justify-center items-center">
                                                    <Text></Text>
                                                </Box>
                                                <Box w='50%' className="training-content-child text-center flex-row flex justify-center items-center">
                                                    <Text></Text>
                                                </Box>
                                            </Box>
                                        ))
                                    }
                                </Box>
                            </Box>
                        </Box>
                    </div>
                </div>
            </Box>
        </Box>
    </>
    )
}