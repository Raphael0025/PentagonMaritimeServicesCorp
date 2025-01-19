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
        documentTitle: `${traineeName}_REGISTRATION_FORM.pdf`,
    })

    const { data: courseBatch } = useCourseBatch()
    const { data: allRanks } = useRank()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining } = useTraining()
    const { data: allCourses } = useCourses()
    const { data: allRegistrations } = useRegistrations()

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
        <Box className='flex flex-col space-y-4'>
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
                        <h3 style={{fontSize: '22px', color: '#1C437E', fontWeight: '700', textTransform: 'uppercase'}}>Registration Form</h3>
                        <Box w='200px' className='border px-3 py-1 border-2 border-black flex flex-col'>
                            <Text fontSize='15px'>Registration No:</Text>
                            <Text fontSize='18px' className='text-red-500'>{`REG-${reg.reg_no}`}</Text>
                        </Box>
                    </div>
                    <div>
                        <Box className='content-one p-1'>
                            <Text fontSize='7px' className='text-end w-full italic'>{`FRM-PENTAGON-012 REV.01  Issued Date: 11/20/2023`}</Text>
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
                                    {allRanks?.find((rank) => rank.code === traineeInfo.rank)?.rank || '--'}
                                </Text>
                            </Box>
                            <div className='content-child'>
                                <p  className='label-text'>SRN#:</p>
                                <p className='value-text' >{traineeInfo.srn}</p>
                            </div>
                        </Box>
                        <Box className='content-one'>
                            <Box className='content-child'>
                                <Text className='label-text' color='#1A2B56'>Address:</Text>
                                <Text className='value-text capitalize'>
                                    {traineeInfo.otherAddress === '' ? `${traineeInfo.house_no} ${traineeInfo.street} Brgy. ${traineeInfo.brgy}, ${traineeInfo.city} City` : traineeInfo.otherAddress}
                                </Text>
                            </Box>
                            <Box className='content-child-excep' >
                                <Text className='label-text' color='#1A2B56'>Company:</Text>
                                <Text className='value-text capitalize' style={{overflow: 'hidden'}}>
                                    {allClients?.find((client) => client.id === traineeInfo.company)?.company || traineeInfo.company}
                                </Text>
                            </Box>
                            <Box className='content-child-excep' >
                                <Text className='label-text capitalize' color='#1A2B56'>Reffered By:</Text>
                                <Text className='value-text capitalize'>{traineeInfo.endorser}</Text>
                            </Box>
                        </Box>
                        <Box className='content-one'>
                            <Box className='content-child' >
                                <Text className='label-text' color='#1A2B56'>Contact Number:</Text>
                                <Text className='value-text'>{traineeInfo.contact_no}</Text>
                            </Box>
                            <Box className='content-child' >
                                <Text className='label-text' color='#1A2B56'>Email:</Text>
                                <Text className='value-text'>{traineeInfo.email}</Text>
                            </Box>
                            <Box className='content-child' >
                                <Text className='label-text' color='#1A2B56'>Nationality:</Text>
                                <Text className='value-text capitalize'>{ traineeInfo.nationality }</Text>
                            </Box>
                            <Box className='content-child' style={{width: '29%'}}>
                                <Text className='label-text' color='#1A2B56'>Gender:</Text>
                                <Text className='value-text capitalize'>{traineeInfo.gender}</Text>
                            </Box>
                            <Box className='content-child' >
                                <Text className='label-text' color='#1A2B56'>Date of Birth:</Text>
                                <Text className='value-text capitalize'>{parsingTimestamp(traineeInfo.birthDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</Text>
                            </Box>
                            <Box className='content-child' >
                                <Text className='label-text' color='#1A2B56'>Place of Birth:</Text>
                                <Text className='value-text capitalize' style={{fontSize: '10px'}}>{ traineeInfo.birthPlace }</Text>
                            </Box>
                        </Box>
                        <Box className='flex md:flex-row flex-col'>
                            <Box className='content-one'>
                                <Box className='content-child'>
                                    <Text className='label-text' color='#1A2B56'>{`IN CASE OF EMERGENCY, PLEASE CONTACT: ( NAME / CONTACT NUMBER / RELATIONSHIP)`}</Text>
                                    <Text className='value-text capitalize'>{traineeInfo.e_contact === '' || traineeInfo.e_contact_person === '' || traineeInfo.relationship === '' ? '' : `${traineeInfo.e_contact_person} / ${traineeInfo.e_contact} / ${traineeInfo.relationship}`}</Text>
                                </Box>
                                <Box className='content-child-excep'>
                                    <Text className='label-text capitalize' color='#1A2B56'>Type of Vessel:</Text>
                                    <Text className='value-text'>{traineeInfo.vessel}</Text>
                                </Box>
                                <div className='content-child-excep'>
                                    <p  className='label-text' style={{color: '#1A2B56'}}>Trainee Type:</p>
                                    <p className='value-text' >{reg?.traineeType === 0 ? 'New' : 'Old'}</p>
                                </div>
                            </Box>
                        </Box>
                        <Box className='flex flex-col '>
                            <Box className='content-one p-1 ps-2' style={{backgroundColor: '#002060', color: 'white'}}>
                                <Text fontSize='10px'>TRAINING DETAILS</Text>
                            </Box>
                            <Box className='flex'>
                                <Box w='100%'>
                                    <Box className='content-one-training'>
                                        <Text className='label-text text-center p-1' w='100%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Course</Text>
                                        <Text className='label-text text-center p-1' w='60%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Schedule</Text>
                                        <Text className='label-text text-center p-1' w='50%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Course Fee</Text>
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
                                                    <Text>{training.course_fee}</Text>
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
                                    {trainings && trainings.length < 8 && 
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
                                            </Box>
                                        ))
                                    }
                                </Box>
                                <Box w='50%' className='' bg='#DBE5F1'>
                                    <Box className='content-one-training'>
                                        <Text className='label-text text-center p-1' w='100%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>For Pentagon Use Only</Text>
                                    </Box>
                                    <Box className='training-content-child flex flex-col '>
                                        <Text>
                                            {reg.reg_accountType === 0 ? `● TRAINEE'S ACCOUNT` : `Ο TRAINEE'S ACCOUNT`}
                                        </Text> 
                                        <Text>
                                            {reg.reg_accountType === 1 ? `● COMPANY'S ACCOUNT` : `Ο COMPANY'S ACCOUNT`}
                                        </Text>
                                    </Box>
                                    <Box h='80px' className='training-content-child flex justify-center flex-col '>
                                        <Text>Mode of Payment:</Text>
                                        <Box className=' flex items-center justify-between '>
                                            <Text>
                                                {reg.payment_mode === 0 ? `● CASH` : `Ο CASH`}
                                            </Text> 
                                            <Text>
                                                {reg.payment_mode === 1 ? `● G-CASH` : `Ο G-CASH`}
                                            </Text>
                                            <Text>
                                                {reg.payment_mode === 2 ? `● BANK` : `Ο BANK`}
                                            </Text>
                                        </Box>
                                    </Box>
                                    <Box h='80px' className='training-content-child flex flex-col '>
                                        <Text>PAYMENT:</Text>
                                        <Box className=' flex flex-col '>
                                            <Text>
                                                {reg.payment_status === 1 ? `● PARTIAL` : `Ο PARTIAL`}
                                            </Text> 
                                            <Text>
                                                {reg.payment_status === 0 ? `● FULL` : `Ο FULL`}
                                            </Text>
                                            <Text>
                                                {`Ο RECEIPT NO`}
                                            </Text>
                                        </Box>
                                    </Box>
                                    <Box h='120px' className='training-content-child flex flex-col '>
                                        <Text>PROCESSED BY:</Text>
                                        <Box className=' flex justify-evenly items-center space-x-4 w-full'>
                                            <Text className='w-1/2 py-8'>
                                                <Text className='text-center py-2 border-gray-500 border-t'>REGISTRAR</Text>
                                            </Text>
                                            <Text className='w-1/2 py-8'>
                                                <Text className='text-center py-2 border-gray-500 border-t'>CASHIER</Text>
                                            </Text>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            
                        </Box>
                    </div>
                </div>
                <Box className='flex items-start flex-col space-y-2'>
                    <Box className='flex flex-col' color='#333333'>
                        <Box>
                            <Text fontSize='9px' className='py-2'>{`BY SIGNING THIS I GRANT MY VOLUNTARY AND UNCONDITIONAL CONSENT TO THE COLLECTION AND PROCESSING MY PERSONAL DATA AS STATED ABOVE TO THE INFORMATION AND DATA BASE OF PENTAGON MARITIME SERVICES CORP. IN ACCORDANCE WITH REPUBLIC ACT (R.A) 10173, OTHERWISE KNOWN AS THE “DATA PRIVACY ACT OF 2012” OF THE REPUBLIC OF THE PHILIPPINES, INCLUDING ITS IMPLEMENTING RULES AND REGULATIONS (IRR) AS WELL AS ALL OTHER GUIDELINES AND ISSUANCES BY THE NATIONAL PRIVACY COMMISSION (NPC).`}</Text>
                        </Box>
                        <label className='text-xs flex items-center'>
                            <Box>
                                <Text fontSize='9px' className='uppercase'>
                                I understand, that Pentagon Maritime Services Corp. shall keep my personal data and information in strict confidence and that the collection and processing of my personal data/information shall be used only for my enrollment, training and certification.
                                </Text>
                            </Box>
                        </label>
                        <label className='text-xs flex items-center'>
                            <Box>
                                <Text fontSize='9px' className='uppercase'>
                                I hereby certify that I have read and understood the above and hereby consent to, agree on, accept and acknowledge these terms.
                                </Text>
                            </Box>
                        </label>
                    </Box>
                </Box>
                <Box className=' w-1/3 md:w-1/3 '>
                    <Box className='flex flex-col w-full justify-center items-center'>
                        <Image src={traineeInfo.e_sig} width={100} height={100} alt='Signature' />
                        <Text color='#333333' className='text-center w-full border-b-2 border-gray-500'>{`${traineeInfo.last_name}, ${traineeInfo.first_name} ${traineeInfo.middle_name}`}</Text>
                        <Text color='#333333' className='text-center font-light'>{`Trainee's Signature Over Printed Name`}</Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    </>
    )
}