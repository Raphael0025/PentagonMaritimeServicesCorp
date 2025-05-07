'use client'

import { Box, Text, Grid, Image, GridItem } from '@chakra-ui/react'

import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import {useRank} from '@/context/RankContext'

import { parsingTimestamp, } from '@/types/handling'
import './reg_admission.css'

import { reformatTrainingSched, validateEnrolledDates } from '@/handlers/trainee_handler'

interface UIProps {
    regNum: string,
    tab: string
}

export default function Page({regNum, tab}: UIProps){

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

    const trainings = allTraining?.filter((t) => t.reg_ref_id === regNum && (tab === 'enrolled' ? t.reg_status === 3 : t.reg_status === 2));
    if (!trainings || trainings.length === 0) {
        return <Text>No trainings found.</Text>;
    }

    const trainingDate_EnrolledDate = validateEnrolledDates(trainings)

    return(
    <>
        <Box 
        w='100%'
        // className='flex flex-col space-y-4'
        >
            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center' >
                {/** Header */}
                <Box display='flex' justifyContent='space-between' alignItems='center' w='95%'>
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
                <Box display='flex' flexDir='column' w='95%' >
                    <Box className='flex w-full justify-between'>
                        <Text fontSize='16pt' fontWeight='bold' color='#002060' textTransform='uppercase' fontFamily='Arial, sans-serif'>Registration Form</Text>
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
                        <Grid templateColumns="1.58in 1.65in 1.6in 0.5in 1.45in 1.55in" gap={0} textTransform='uppercase' h='0.43in' fontWeight='normal' fontFamily='Arial MT, sans-serif' >
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
                        <Grid templateColumns="5.33in 1.45in 1.55in" gap={0} textTransform='uppercase' h='0.43in' fontWeight='normal' fontFamily='Arial MT, sans-serif' >
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt'>Address:</Text>
                                <Text fontSize='9pt'>
                                    {traineeInfo.otherAddress === '' ? `${traineeInfo.house_no} ${traineeInfo.street} Brgy. ${traineeInfo.brgy}, ${traineeInfo.city} City` : traineeInfo.otherAddress}
                                </Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt'>Company:</Text>
                                <Text fontSize='9pt' overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" maxWidth="100%">
                                    {allClients?.find((client) => client.id === traineeInfo.company)?.company || traineeInfo.company}
                                </Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt'>Reffered By:</Text>
                                <Text fontSize='9pt'>{traineeInfo.endorser}</Text>
                            </GridItem>
                        </Grid>
                        <Grid templateColumns="1.57in 2.1in 1.15in 0.5in 1.46in 1.55in" gap={0} textTransform='uppercase' h='0.43in' fontWeight='normal' fontFamily='Arial MT, sans-serif' >
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt'>Contact Number:</Text>
                                <Text fontSize='9pt'>{traineeInfo.contact_no}</Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt'>Email:</Text>
                                <Text fontSize='8pt' textTransform='lowercase'>{traineeInfo.email}</Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt'>Nationality:</Text>
                                <Text fontSize='9pt'>{ traineeInfo.nationality }</Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt'>Gender:</Text>
                                <Text fontSize='9pt'>{traineeInfo.gender}</Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt'>Date of Birth:</Text>
                                <Text fontSize='9pt'>{parsingTimestamp(traineeInfo.birthDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</Text>
                            </GridItem>
                            <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' justifyContent='start' alignItems='start'>
                                <Text fontSize='7pt'>Place of Birth:</Text>
                                <Text fontSize='9pt'>{ traineeInfo.birthPlace }</Text>
                            </GridItem>
                        </Grid>
                        {/* <Grid className='flex md:flex-row flex-col'> */}
                            <Grid templateColumns="4.82in 2.48in 1.03in" gap={0} textTransform='uppercase' h='0.43in' fontWeight='normal' fontFamily='Arial MT, sans-serif' >
                                <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' alignItems='start'>
                                    <Text fontSize='7pt'>{`IN CASE OF EMERGENCY, PLEASE CONTACT: ( NAME / CONTACT NUMBER / RELATIONSHIP)`}</Text>
                                    <Text fontSize='9pt'>{traineeInfo.e_contact === '' || traineeInfo.e_contact_person === '' || traineeInfo.relationship === '' ? '' : `${traineeInfo.e_contact_person} / ${traineeInfo.e_contact} / ${traineeInfo.relationship}`}</Text>
                                </GridItem>
                                <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' alignItems='start'>
                                    <Text fontSize='7pt'>Type of Vessel:</Text>
                                    <Text fontSize='9pt'>{traineeInfo.vessel}</Text>
                                </GridItem>
                                <GridItem display='flex' lineHeight='none' ps='1' pt='1' pb='1' flexDir='column' border="0.5pt solid black" borderTop='none' justifyContent='start' alignItems='start'>
                                    <Text fontSize='7pt'>Trainee Type:</Text>
                                    <Text fontSize='7pt'>{reg?.traineeType === 0 ? '● NEW' : '○ NEW'}</Text>
                                    <Text fontSize='7pt'>{reg?.traineeType !== 0 ? '● RE-ENROLLED' : '○ RE-ENROLLED'}</Text>
                                </GridItem>
                            </Grid>
                        {/* </Grid> */}
                        <Box display='flex' flexDir='column'>
                            <Grid h='0.30in' pt='0.1px' pb='4' sx={{ textIndent: '0.08in' }} fontSize='9pt' bgColor='#002060' color='white' fontWeight='bold' fontFamily='Arial'>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderBottom='none' justifyContent='start' alignItems='start'>
                                    <Text as='span'>TRAINING DETAILS</Text>
                                </GridItem>
                            </Grid>
                            <Box className='flex'>
                                <Box w='100%'>
                                    {/* <Box className='content-one-training'>
                                        <Text className='label-text text-center p-1' w='100%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Course</Text>
                                        <Text className='label-text text-center p-1' w='60%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Schedule</Text>
                                        <Text className='label-text text-center p-1' w='50%' color='#1A2B56' style={{borderWidth: '1px', borderColor: '#00000060'}}>Course Fee</Text>
                                    </Box> */}
                                    <Grid templateColumns="2.95in 1.85in 1.72in" gap={0} textAlign='center' textTransform='uppercase' fontSize='7.4pt' h='0.29in' fontWeight='normal' fontFamily='Arial, sans-serif' >
                                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Course</GridItem>
                                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Schedule</GridItem>
                                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>{`Course Fee (PHP)`}</GridItem>
                                    </Grid>
                                    {trainings && trainings.length > 0 ? (
                                        trainings.filter((training) => (tab === 'enrolled' ? training.reg_status === 3 : training.reg_status === 2)).map((training, index) => (
                                            <Grid key={index} templateColumns="2.95in 1.85in 1.72in" gap={0} h='0.31in' fontFamily="Arial, sans-serif" textTransform='uppercase' fontWeight='normal' fontSize='8pt'>
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
                                                    <Text>{training.course_fee}</Text>
                                                </GridItem>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid templateColumns="2.95in 1.85in 1.72in" gap={0} h='0.31in' >
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
                                            <Grid key={index} templateColumns="2.95in 1.85in 1.72in" gap={0} h='0.31in' >
                                                <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                    <Text></Text>
                                                </GridItem>
                                                <GridItem border="0.5pt solid black" borderTop='none' borderRight="none" >
                                                    <Text></Text>
                                                </GridItem>
                                                <GridItem border="0.5pt solid black" borderTop='none' borderRight="none">
                                                    <Text></Text>
                                                </GridItem>
                                            </Grid>
                                        ))
                                    }
                                </Box>
                                <Grid templateColumns='1.8in' fontFamily='Arial' templateRows='0.288in 0.32in 0.31in 0.31in 0.31in 0.31in 0.31in 0.31in 0.30in' bg='#dbe5f1' textTransform='uppercase' gap={0}>
                                    <GridItem fontSize='9pt' display='flex' fontWeight='bold' border='0.5pt solid black' justifyContent='center' alignItems='center'>For Pentagon Use Only:</GridItem>
                                    <GridItem fontSize='6.5pt' ps='3' fontWeight='normal' border='0.5pt solid black' borderTop='none' justifyContent='center' alignItems='center'>
                                        <Text py='0' >{reg.reg_accountType === 0 ? `● TRAINEE'S ACCOUNT` : `○ TRAINEE'S ACCOUNT`}</Text> 
                                        <Text py='0' >{reg.reg_accountType === 1 ? `● COMPANY'S ACCOUNT` : `○ COMPANY'S ACCOUNT`}</Text>
                                    </GridItem>
                                    <GridItem fontSize='6.5pt' ps='3' fontWeight='normal' border='0.5pt solid black' borderTop='none' borderBottom='none' display='flex' justifyContent='start' alignItems='end'>
                                        Mode of payment:
                                    </GridItem>
                                    <GridItem fontSize='7pt' display='flex' fontWeight='normal' border='0.5pt solid black' borderTop='none' justifyContent='space-around' alignItems='center'>
                                        <Text>
                                            {reg.payment_mode === 0 ? `● CASH` : `○ CASH`}
                                        </Text> 
                                        <Text>
                                            {reg.payment_mode === 1 ? `● G-CASH` : `○ G-CASH`}
                                        </Text>
                                        <Text>
                                            {reg.payment_mode === 2 ? `● BANK` : `○ BANK`}
                                        </Text>
                                    </GridItem>
                                    <GridItem fontSize='6.5pt' ps='3' pb='0' fontWeight='normal' border='0.5pt solid black' borderTop='none' borderBottom='none' display='flex' flexDir='column' justifyContent='end' alignItems='start'>
                                        <Text>PAYMENT:</Text>
                                        <Text>{reg.payment_status === 1 ? `● PARTIAL` : `○ PARTIAL`}</Text> 
                                    </GridItem>
                                    <GridItem fontSize='6.5pt' ps='3' pt='0' fontWeight='normal' border='0.5pt solid black' borderTop='none' >
                                        <Text>{reg.payment_status === 0 ? `● FULL` : `○ FULL`}</Text>
                                        <Text>{`○ RECEIPT NO`}</Text>
                                    </GridItem>
                                    <GridItem fontSize='6.5pt' ps='3' fontWeight='normal' border='0.5pt solid black' borderTop='none' borderBottom='none' display='flex' justifyContent='start' alignItems='start'>
                                        Processed By:
                                    </GridItem>
                                    <GridItem fontSize='6.5pt' ps='3' fontWeight='normal' border='0.5pt solid black' borderTop='none' borderBottom='none'  justifyContent='center' alignItems='center'>
                                    {/** Empty Component */}
                                    </GridItem>
                                    <GridItem fontSize='6.5pt' fontWeight='normal' border='0.5pt solid black' borderTop='none' display='flex' justifyContent='space-around' alignItems='start'>
                                        <Text w='30%' textAlign='center' border="0" borderTop="0.5pt solid black">REGISTRAR</Text>
                                        <Text w='30%' textAlign='center' border="0" borderTop="0.5pt solid black" >CASHIER</Text>
                                    </GridItem>
                                </Grid>
                            </Box>
                            
                        </Box>
                    </Box>
                </Box>
                <Box w='95%' className='flex items-start flex-col space-y-2'>
                    <Box display='flex' flexDir='column' textTransform='uppercase' fontSize='5.5pt' fontFamily='Arial' fontWeight='normal'>
                        <Text py='1'>{`BY SIGNING THIS I GRANT MY VOLUNTARY AND UNCONDITIONAL CONSENT TO THE COLLECTION AND PROCESSING MY PERSONAL DATA AS STATED ABOVE TO THE INFORMATION AND DATA BASE OF PENTAGON MARITIME SERVICES CORP. IN ACCORDANCE WITH REPUBLIC ACT (R.A) 10173, OTHERWISE KNOWN AS THE “DATA PRIVACY ACT OF 2012” OF THE REPUBLIC OF THE PHILIPPINES, INCLUDING ITS IMPLEMENTING RULES AND REGULATIONS (IRR) AS WELL AS ALL OTHER GUIDELINES AND ISSUANCES BY THE NATIONAL PRIVACY COMMISSION (NPC).`}</Text>
                        <Text py='1'>
                            I understand, that Pentagon Maritime Services Corp. shall keep my personal data and information in strict confidence and that the collection and processing of my personal data/information shall be used only for my enrollment, training and certification.
                        </Text>
                        <Text py='1'>
                            I hereby certify that I have read and understood the above and hereby consent to, agree on, accept and acknowledge these terms.
                        </Text>
                    </Box>
                </Box>
                <Box w='95%' display='flex' justifyContent='space-between' alignItems='end'>
                    <Box className=' w-1/3 md:w-1/3 '>
                        <Box className='flex flex-col w-full justify-center items-center'>
                            <Image src={traineeInfo.e_sig} width={100} height={100} alt='Signature' />
                            <Text border='0' borderBottom='0.5pt solid black' color='#333333' w='100%' textAlign='center'>{`${traineeInfo.last_name}, ${traineeInfo.first_name} ${traineeInfo.middle_name}`}</Text>
                            <Text color='#333333' className='text-center' fontWeight='normal' textTransform='uppercase' sx={{ fontVariant: 'small-caps'}}>{`Trainee's Signature Over Printed Name`}</Text>
                        </Box>
                    </Box>
                    <Box className=' w-1/3 md:w-1/3 '>
                        <Box className='flex flex-col w-full justify-center items-center'>
                            <Text border='0' borderBottom='0.5pt solid black' color='#333333' w='100%' textTransform='uppercase' textAlign='center'>{
                                `${trainingDate_EnrolledDate}`
                            }</Text>
                            <Text color='#333333' className='text-center' fontWeight='normal' textTransform='uppercase' sx={{ fontVariant: 'small-caps'}}>{`Date`}</Text>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </>
    )
}