'use client'

import NextImage from 'next/image'
import React from 'react'
import { Box, Image as ChakraImage, Text} from '@chakra-ui/react';

import { useInstructors } from '@/context/InstructorContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'

import { TRAINING_BY_ID } from '@/types/trainees'
import { parsingTimestamp } from '@/types/handling'

interface ComponentProps{
    selectedTrainings: TRAINING_BY_ID[],
    trainingID: string[],
    searchTerm: string
}

export default function RFPEW_CERT({selectedTrainings, trainingID, searchTerm}: ComponentProps){
    const { data: allInstructors } = useInstructors()
    const { data: allTrainee } = useTrainees()
    const { allData: allRegData } = useRegistrations()
    const { data: courseBatch } = useCourseBatch()

    const normalizeCertContent = (html: string) => {
        const temp = document.createElement('div')
        temp.innerHTML = html

        // convert inner divs to spans
        temp.querySelectorAll('div').forEach(div => {
            const span = document.createElement('span')
            span.innerHTML = div.innerHTML

            // copy styles you need
            span.style.display = 'inline'
            span.style.textAlign = div.style.textAlign || 'center'
            span.style.lineHeight = '1.2'

            div.replaceWith(span)
        })

        return temp.innerHTML
    }
    
    const formatTrainingSchedule = (dateStr: string, year: number) => {
        if (!dateStr) return '';

        // Create a map for the month abbreviations
        const monthMap: { [key: string]: string } = {
            // Standard Keys
            Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
            May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
            Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
            
            // All-Caps Keys
            JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April',
            MAY: 'May', JUN: 'June', JUL: 'July', AUG: 'August',
            SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December'
        }

        // 1. Remove commas and split by space
        // "Tue, Apr 07" becomes ["Tue", "Apr", "07"]
        const parts = dateStr.replace(',', '').split(' ');

        const monthAbbr = parts[1]; // "Apr"
        const day = parseInt(parts[2], 10); // "07" -> 7 (removes leading zero)

        const fullMonth = monthMap[monthAbbr] || monthAbbr;

        return `${fullMonth} ${day}, ${year}`; 
    }

    const formatNextDay = (dateStr: string, year: number) => {
        if (!dateStr) return '';
    
        // 1. Create a map for month names
        const months = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    
        // 2. Parse the input string (Expected: "Tue, Apr 07")
        // Remove comma and split: ["Tue", "Apr", "07"]
        const parts = dateStr.replace(',', '').split(' ');
        const monthAbbr = parts[1]; // "Apr"
        const dayNum = parseInt(parts[2], 10); // 7
    
        // Convert abbreviation to month index (0-11)
        const monthIndex = new Date(`${monthAbbr} 1, 2000`).getMonth();
    
        // 3. Create a Date object for the current input
        let date = new Date(year, monthIndex, dayNum);
    
        // 4. Move to the next day
        date.setDate(date.getDate());
    
        // 5. Check if the NEW date is a Sunday (0 = Sunday)
        // If it is, add one more day to get Monday
        if (date.getDay() === 0) {
            date.setDate(date.getDate());
        }
    
        // 6. Format the output
        const finalMonth = months[date.getMonth()];
        const finalDay = date.getDate();
        const finalYear = date.getFullYear(); // Uses fullYear in case it rolled over to Jan 1 next year
    
        return `${finalMonth} ${finalDay}, ${finalYear}`;
    }

    const getOrdinalHTML = (day: number) => {
        const suffix =
            day % 10 === 1 && day % 100 !== 11 ? 'st' :
            day % 10 === 2 && day % 100 !== 12 ? 'nd' :
            day % 10 === 3 && day % 100 !== 13 ? 'rd' : 'th'

        return `${day}<sup>${suffix}</sup>`
    }

    return(
        <Box w='100%' placeItems='center' p='0' fontFamily='Arial'
            sx={{display: 'none', '@media print': {display: 'block', fontFamily: 'Arial, Helvetica, sans-serif !important', WebkitPrintColorAdjust: 'exact', '*': {fontFamily: 'Arial, Helvetica, sans-serif !important'}}}}
        >
        {selectedTrainings?.filter((t) => {
            if(trainingID.length === 0) return true; 
        return trainingID.includes(t.id)}).map((training: any, index: number) => {
            const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
            const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
            const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
            //const reg_id = allRegData?.find((reg) => 
            const batchYear = courseBatch?.find((batch) => batch.id === training.batch)?.createdAt
            const getYear = new Date().getFullYear()
            const splitMonth = formatTrainingSchedule((training.end_date === '' ? training.start_date : training.end_date), getYear || 0).split(' ')[0]
            const splitDay = formatNextDay((training.end_date === '' ? training.start_date : training.end_date), getYear || 0).split(' ')[1].replace(/\D/g, '')
            const nthDay = getOrdinalHTML(Number(splitDay))

            const trainingDate = training.numOfDays === 1 
                ? formatTrainingSchedule(training.start_date, getYear || 0) 
                : `${formatTrainingSchedule(training.start_date, getYear || 0)} to ${formatTrainingSchedule(training.end_date, getYear || 0)}`
            const issuedDate = formatNextDay(training.start_date, getYear || 0)
            
            if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
            ))
            {return(
            <>
            <Box w='216mm' h='279mm' position='relative' display='flex' flexDir='column' p='0' justifyContent='center' alignItems='center' >
                <Box pt='14' w='216mm' h='279mm' position='relative' zIndex={2} display='flex' fontSize='12pt' fontWeight='normal'  flexDir='column' alignItems='center'>
                    <ChakraImage src={'/certificateHeader_UBT.png'} alt='header image' w='7.05in' h='0.85in'  objectFit='cover'/>
                    <Box pt='8' pr='4' pb='32' display='flex' justifyContent='end' w='95%'>
                        <Box fontWeight='bold' lineHeight='1.2' gap='0' display='block' fontSize='12pt' textAlign='start'>
                            <Text>
                                Certificate No. :
                                <Text as='span' fontWeight={'normal'}>
                                    {` ${training.cert_no}`}
                                </Text>
                            </Text>
                            <Text>
                                Registration No. : 
                                <Text as='span' fontWeight={'normal'}>
                                    {` REG-${reg_num}`}
                                </Text>
                            </Text>
                        </Box>
                    </Box>
                    <Box w='100%' h='60%' display='flex' flexDir='column' alignItems='center' justifyContent='center' gap='0'>
                        <Text fontWeight='bold' fontSize='26pt'>Certificate of Training Completion</Text>
                        <Text pt='3'>This Certificate is issued to</Text>
                        <Text fontWeight='bold' fontSize='20pt' textTransform='uppercase'>{`${trainee.first_name} ${trainee.middle_name} ${trainee.last_name}`}</Text>
                        <Text>for having successfully completed the training course in</Text>
                        <Text fontSize='14pt' w='100%' mt='4' textAlign='center' fontWeight='bold'>
                            <div style={{display: 'block', lineHeight: '1.1'}}
                                dangerouslySetInnerHTML={{
                                    __html: `${training.certTitle}`
                                }}
                            />
                        </Text>
                        <Box display='flex' flexDir='column' justifyContent='center'
                        //w='60%' mt='3' textAlign='center' 
                        // sx={{
                        //     '& ul': {
                        //         listStyleType: 'disc',
                        //         listStylePosition: 'inside',
                        //         paddingLeft: '1.5rem',
                        //         margin: '0.5rem 0',
                        //     },
                        //     '& ol': {
                        //         listStyleType: 'decimal',
                        //         listStylePosition: 'inside',
                        //         paddingLeft: '1.5rem',
                        //         margin: '0.5rem 0',
                        //     },
                        //     '& li': {
                        //         marginBottom: '0.25rem',
                        //     },
                        //     '& p, & div': {
                        //         display: 'inline',
                        //         lineHeight: '0.8',
                        //         margin: 0,
                        //     },
                        //     '& br': {
                        //         display: 'inline',
                        //     },
                        // }}
                        >
                            {/* {training?.conductedOnline ? (
                                <div style={{fontSize: '12pt', display: 'block', lineHeight: '1.2'}}
                                    dangerouslySetInnerHTML={{
                                        __html: `<span>Conducted online on ${trainingDate} </span>${normalizeCertContent(training.certContent)}`
                                    }}
                                />
                            ) : (
                                <div style={{fontSize: '12pt', display: 'block', lineHeight: '1.2'}}
                                    dangerouslySetInnerHTML={{
                                        __html: `${normalizeCertContent(training.certContent)}`
                                    }}
                                />
                            )} */}
                            <Box w='615px'
                                mt='5'
                                mx='auto'
                                fontSize='12pt' 
                                textAlign='center' // This aligns both left and right edges
                                lineHeight='1.2'    // Increased slightly; '1' often causes letters to touch
                                fontFamily='Arial, Helvetica, sans-serif'
                            >
                                {`serving on seagoing ship powered by main propulsion machinery of 750 kW propulsion power or more.`}
                            </Box>
                            <Box w='615px'
                                mt='5'
                                mx='auto'
                                fontSize='12pt' 
                                textAlign='center' // This aligns both left and right edges
                                lineHeight='1.2'    // Increased slightly; '1' often causes letters to touch
                                fontFamily='Arial, Helvetica, sans-serif'
                            >
                                {`In compliance with Regulation III/4, paragraph 2.2.2 of the 1978 STCW Convention, as amended.`}
                            </Box>
                            <Box w='615px'
                                mt='5'
                                mx='auto'
                                fontSize='12pt' 
                                textAlign='center' // This aligns both left and right edges
                                lineHeight='1.2'    // Increased slightly; '1' often causes letters to touch
                                fontFamily='Arial, Helvetica, sans-serif'
                            >
                                {`Conducted from ${trainingDate}, as approved by the Maritime Industry Authority pursuant to the provisions of Republic Act No. 10635, MARINA Circular No. SC-2021-09  and MARINA Circular No. SC-2022-05  and after having been assessed by the accredited Assessor in accordance with the approved methods and criteria. `}
                            </Box>
                        </Box>
                        <div style={{marginTop: '40px'}}
                            dangerouslySetInnerHTML={{
                                __html: `Issued this ${nthDay} day of ${splitMonth}, ${getYear} in Manila City, Philippines`
                            }}
                        />
                        <Box pt='8' pb='16' display='flex' alignItems='end' w='85%'>
                            <Box w='50%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                {(() => {
                                    const isMentalHelth = training.certTitle?.toUpperCase().trim() === 'MENTAL HEALTH AWARENESS'
                                    const targetIns = isMentalHelth ? 'NEPTHALI A. SAGUIL' : 'ROGELIO C. MAHINAY'
                                    const ins = allInstructors?.find((i) => i.name === targetIns)

                                    const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                    return(
                                        <>
                                            <Box position='absolute' top='-55px' left='5%' w='200px' h='100px' transform="translateX(-10%)" zIndex={2} >
                                                <NextImage src={eSignSrc} fill priority style={{ objectFit: 'contain'}} alt='signature' />
                                            </Box>
                                            <Box borderTop='1px solid black' w='100%' /> 
                                            <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='12pt' fontWeight='bold'>
                                                {(() => {
                                                    if (!ins) return 'No Instructor';
                                                    return `${ins.rank !== 'DR.' ? ins.rank : ''} ${ins.name}${ins.rank === 'DR.' ? ', MD' : ''}`;
                                                })()}
                                            </Text>
                                            <Text fontSize='12pt'>{`${ins?.rank === 'DR.' ? 'Facilitator' : 'Training Director'}`}</Text>
                                        </>
                                    )
                                })()}
                            </Box>
                            <Box w='50%' pb='14' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center'>
                                <Box w='1.5in' h='1.5in' _hover={{cursor: 'pointer'}}>
                                    <ChakraImage src={trainee.photo} w='100%' h='100%' alt='trainee_picture' />
                                </Box>
                            </Box>
                            <Box w='50%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                {(() => {
                                    const ins = allInstructors?.find((i) => i.name === 'MA. JOSEFA T. ALONSAGAY')
                                    const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                    return(
                                        <>
                                            <Box position='absolute' top='-42px' left='-25%' transform="translateX(20%)" zIndex={2} >
                                                <ChakraImage src={eSignSrc} w='80%' h='80%' alt='signature' />
                                            </Box>
                                            <Box borderTop='1px solid black' w='100%'/>
                                            <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='12pt' fontWeight='bolder'>
                                                {(() => {
                                                    if (!ins) return 'No Instructor';
                                                    return `${ins.rank} ${ins.name}`;
                                                })()}
                                            </Text>
                                            <Text fontSize='12pt'>President</Text>
                                        </>
                                    )
                                })()}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            </>
            )}})
        }
        </Box>
    )
}