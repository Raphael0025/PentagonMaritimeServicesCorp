'use client'

import NextImage from 'next/image'
import React from 'react';
import { Box, Text, Grid, Image as ChakraImage, GridItem } from '@chakra-ui/react'
import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'

import { TRAINING_BY_ID } from '@/types/trainees'
import { useRegistrations } from '@/context/RegistrationContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRank } from '@/context/RankContext'
import { CourseBatchByID } from '@/types/course-batches'
import { useCourses } from '@/context/CourseContext'
import { useInstructors } from '@/context/InstructorContext'

import { getFormatDate } from '@/handlers/util_handler';
import { formatDateToShort } from '@/handlers/trainee_handler';
import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { splitTextAtWordBoundary } from '@/handlers/util_handler';

interface TFProps {
    batch: CourseBatchByID | null;
    trainingsArr?: TRAINING_BY_ID[];
}

export default function AttendanceForm({ batch, trainingsArr}: TFProps) {
    const { data: allCourses } = useCourses()
    const { allData: allRegistrations } = useRegistrations()
    const { data: allTrainee } = useTrainees()
    const { data: allRanks } = useRank()
    const { data: allInstructors } = useInstructors()

    if(!batch) return null;
    const course = allCourses?.find((course) => course.id === batch.course)
    const formattedDate = batch.end_date === '' ? formatDateToShort(batch.start_date) : getFormatDate(`${batch.start_date} - ${batch.end_date}`)

    return(
    <>
        <Box w='100%'>
            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                {/** Header */}
                <Box display='flex' justifyContent='space-between' alignItems='center' w='80%'>
                    <ChakraImage src='/Logo.jpg' width={'2.81in'} height={'0.66in'} alt='logo'/>
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
                <Text py='' display='flex' justifyContent='center' w='80%' fontFamily='Arial, sans-serif' fontWeight='bold' fontSize='15pt'>COURSE COMPLETION REPORT</Text>
                <Text py='2' as='i' display='flex' justifyContent='end' w='80%' fontFamily='Calibri' fontWeight='bold' fontSize='7pt'>FM-03-11-02 REV.02</Text>
                <Box display='flex' justifyContent='center' alignItems='center'>
                    <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                        {/** Table Header */}
                        <Grid mb='7' templateColumns="2.28in 3.47in 0.56in 0.56in 1.68in 1.91in" gap={0} fontSize='8pt' h='1.82in' fontWeight='bold' textAlign='center' fontFamily='Calibri' >
                            <GridItem display='flex' flexDir='column' border="0.5pt solid black" borderRight="none" justifyContent='start' alignItems='center'>
                                <Box fontSize='8pt' w='2.28in' h={'0.36in'} ps='2' textAlign='start' lineHeight='1.0'  borderBottom='1px solid black'>
                                    <Text>{`Training Course: `} <Text as='span' fontWeight='bold' fontSize='6pt'>{course?.course_name.toUpperCase()}</Text></Text>
                                </Box>
                                <Box fontSize='7pt' w='2.28in' ps='2' textAlign='start' borderBottom='1px solid black'>
                                    <Box display='flex'>
                                        <Box display='flex'>
                                            <Text mr='2'>
                                                {`Class No:`}
                                            </Text>
                                            <Text textDecor={'underline'}>
                                                {batch.batch_no}
                                            </Text>
                                        </Box>
                                        <Box display='flex' ml='2'>
                                            <Text mr='2'>
                                                {`Training Duration:`}
                                            </Text>
                                            <Text textDecoration={'underline'}>
                                                {formattedDate}
                                            </Text>
                                        </Box>
                                    </Box>
                                    <Text>{`(Regular)`}</Text>
                                </Box>
                                <Box fontSize='7pt' w='2.28in' ps='2' textAlign='start' borderBottom='1px solid black'>
                                    <Text>
                                        {`Class No: (N/A)   Training Duration:(N/A)`}
                                    </Text>
                                    <Text>{`(For re-sit)`}</Text>
                                </Box>
                                <Box border='1px solid black' fontSize='8pt' w='2.28in' borderRight='none' textAlign='start' ps='2' borderTop='none' borderLeft='none' >
                                    Date and Place of Assessment:
                                </Box>
                                <Box display='flex' fontSize='7pt'>
                                    <Box w='1.12in' display='flex' alignItems='start' ps='2' justifyContent='start' flexDir='column' border='1px solid black' borderTop='none' borderLeft='none' >
                                        <Text fontWeight='bold'>Written:</Text>
                                        <Text>{batch?.practicumDate}</Text>
                                        <Text>{batch?.room?.toUpperCase() === 'ONLINE' ? batch?.room?.toUpperCase() : 'PENTAGON OFFICE'}</Text>
                                    </Box>
                                    <Box w='1.16in' display='flex' alignItems='start' ps='2' justifyContent='start' flexDir='column' border='1px solid black' borderTop='none' borderLeft='none' borderRight='none'>
                                        <Text fontWeight='bold'>Practical:</Text>
                                        <Text>{batch?.room?.toUpperCase() === 'ONLINE' ? 'N/A' : batch?.practicumDate}</Text>
                                        <Text>{batch?.practicumSite?.toUpperCase() === 'ONLINE' ? 'N/A' : batch?.practicumSite}</Text>
                                    </Box>
                                </Box>
                                <Box fontWeight='normal' fontSize='8pt' h='0.5in' display='flex' alignItems='center' flexDir='column' justifyContent='center'>
                                    <Text>{`Name of Trainee`}</Text>
                                    <Text>{`(LastName, First Name, Middle name)`}</Text>
                                </Box>
                            </GridItem>
                            <GridItem display='flex' flexDir='column'  border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>
                                <Box h='0.35in' display='flex' justifyContent='center' alignItems='center'>
                                    <Text h='100%' display='flex' justifyContent='center' alignItems='center' > 
                                        Personal Data
                                    </Text>
                                </Box>
                                <Box display='flex' alignItems='center'  h='1.75in'>
                                    <Box display='flex' justifyContent='center' alignItems='center' border='1px solid black' borderLeft='none' borderBottom='none' w='0.88in' h='100%'>
                                        <Text transform='rotate(-90deg)' >{`Date of Birth (mm/dd/yyyy)`}</Text>
                                    </Box>
                                    <Box display='flex' justifyContent='center' alignItems='center' border='1px solid black' borderLeft='none' borderBottom='none' w='0.86in' h='100%'>
                                        <Text transform='rotate(-90deg)' >Place of Birth</Text>
                                    </Box>
                                    <Box display='flex' justifyContent='center' alignItems='center' border='1px solid black' borderLeft='none' borderBottom='none' w='0.6in' h='100%'>
                                        <Text transform='rotate(-90deg)' >Rank</Text>
                                    </Box>
                                    <Box display='flex' justifyContent='center' alignItems='center' border='1px solid black' borderLeft='none' borderBottom='none' borderRight='none' w='1.15in' h='100%'>
                                        <Text transform='rotate(-90deg)' >Registration No.</Text>
                                    </Box>
                                </Box>
                            </GridItem>
                            <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>
                                <Text w='100%' whiteSpace='nowrap' transform='rotate(-90deg)'>{`Written (%)`}</Text>
                            </GridItem>
                            <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>
                                <Text w='100%' whiteSpace='nowrap' transform='rotate(-90deg)'>{`Practical (%)`}</Text>
                            </GridItem>
                            <GridItem display='flex' flexDir='column' alignItems='center' border="0.5pt solid black" borderRight="none" >
                                <Box h='0.95in' display='flex' justifyContent='center' alignItems='center'>
                                    <Text h='100%' display='flex' justifyContent='center' alignItems='center' > 
                                        Result of the Assessment
                                    </Text>
                                </Box>
                                <Box display='flex' alignItems='center' textTransform='uppercase' h='1.15in'>
                                    <Box display='flex' justifyContent='center' alignItems='center' border='1px solid black' borderLeft='none' borderBottom='none' w='0.56in' h='100%'>
                                        <Text transform='rotate(-90deg)' >Passed</Text>
                                    </Box>
                                    <Box display='flex' justifyContent='center' alignItems='center' border='1px solid black' borderLeft='none' borderBottom='none' w='0.56in' h='100%'>
                                        <Text transform='rotate(-90deg)' >Failed</Text>
                                    </Box>
                                    <Box display='flex' justifyContent='center' alignItems='center' border='1px solid black' borderLeft='none' borderBottom='none' borderRight='none' w='0.56in' h='100%'>
                                        <Text transform='rotate(-90deg)' >Incomplete</Text>
                                    </Box>
                                </Box>
                            </GridItem>
                            <GridItem display='flex' border="0.5pt solid black" justifyContent='center' alignItems='center'>
                                Training Certificate Number
                            </GridItem>
                        </Grid>
                        {/** Table Body */}
                        {Array.isArray(trainingsArr) && trainingsArr.length > 0 && (trainingsArr.sort((a, b) => {
                            const regNoA = allRegistrations?.find((r) => r.id === a.reg_ref_id)?.reg_no || '0-0';
                            const regNoB = allRegistrations?.find((r) => r.id === b.reg_ref_id)?.reg_no || '0-0';

                            const [yearA, numberA] = regNoA.split('-').map(Number);
                            const [yearB, numberB] = regNoB.split('-').map(Number);

                            return yearA === yearB ? numberA - numberB : yearA - yearB;
                        }).map((training, index) => {
                            const registrations = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                            const trainee = allTrainee?.find((t) => t.id === registrations?.trainee_ref_id)
                            return(
                                <Grid key={training.id} templateColumns="0.2in 2.08in 0.88in 0.84in 0.6in 1.15in 0.56in 0.56in 0.56in 0.56in 0.56in 1.91in" h='0.17in'  textTransform='uppercase' fontSize='9pt' gap={0} fontWeight={'normal'} fontFamily='Calibri'>
                                    <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                        {(index + 1)}
                                    </GridItem>
                                    <GridItem display='flex' fontSize='8pt'  border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' px='2' alignItems='center'>
                                        {`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name} ${trainee?.suffix.toLowerCase() === 'n/a' || trainee?.suffix === '' ? '' : `${trainee?.suffix}`}`}`}
                                    </GridItem>
                                    <GridItem display='flex' fontSize='8pt' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                        {trainee?.birthDate
                                        ? parsingTimestamp(trainee.birthDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })
                                        : ''}
                                    </GridItem>
                                    <GridItem display='flex' border="0.5pt solid black" borderTop='none' noOfLines={1} fontSize='6pt' borderRight="none" justifyContent='center' textAlign='center' alignItems='center'>
                                        {trainee?.birthPlace}
                                    </GridItem>
                                    <GridItem display='flex' fontSize='8pt' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                        {allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}
                                    </GridItem>
                                    <GridItem display='flex' fontSize='8pt' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                        {`Reg-${registrations?.reg_no}`}
                                    </GridItem>
                                    <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                        {`${training.written}%`}
                                    </GridItem>
                                    <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                        {Number(training.practical) === 101 ? 'P' : Number(training.practical) === 102 ? 'N/A' : `${training.practical}%`}
                                    </GridItem>
                                    <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                        {Number(training?.practical) === 101 || Number(training?.practical) === 102 ? Number(training?.written) >= 75 && '✓' : ((Number(training?.written) + Number(training?.practical)) / 2) >= 75 && '✓'}
                                    </GridItem>
                                    <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                        {Number(training?.written) !== 0 && Number(training?.practical) !== 0 && (
                                            Number(training?.practical) === 101 || Number(training?.practical) === 102
                                            ? (Number(training?.written) < 75 ) && '✓'
                                            : ((Number(training?.written) + Number(training?.practical)) / 2 < 75) && '✓'
                                        )}
                                    </GridItem>
                                    <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                        {Number(training?.written) !== 0 && Number(training?.practical) !== 0 || (
                                            Number(training?.written) === 0 && Number(training?.practical) === 0 && '✓'
                                        )}
                                    </GridItem>
                                    <GridItem display='flex' border="0.5pt solid black" borderTop='none' justifyContent='center' alignItems='center'>
                                        {training?.cert_no}
                                    </GridItem>
                                </Grid>
                            )})
                        )}
                        {/** Add the *NOTHING FOLLOWS* row immediately after the last data row */}
                        {(trainingsArr ?? []).length > 0 && (
                            <Grid templateColumns="0.2in 2.08in 0.88in 0.84in 0.6in 1.15in 0.56in 0.56in 0.56in 0.56in 0.56in 1.91in" h='0.17in' textTransform="uppercase" fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
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
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none"  justifyContent="center" alignItems="center">
                                    {/* Empty cell */}
                                </GridItem>
                            </Grid>
                        )}
                        {/** Fill remaining rows to make a total of 24 */}
                        {(trainingsArr ?? []).length < 24 &&
                            [...Array(24 - (trainingsArr ?? []).length - 1)].map((_, index) => {
                            const startingIndex = (trainingsArr?.length || 0) + 1 // Start numbering after the last data row
                            return (
                                <Grid key={index} templateColumns="0.2in 2.08in 0.88in 0.84in 0.6in 1.15in 0.56in 0.56in 0.56in 0.56in 0.56in 1.91in" h='0.17in' textTransform="uppercase" fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
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
                                    <GridItem display="flex" border="0.5pt solid black" borderTop="none"  justifyContent="center" alignItems="center">
                                        {/* Empty cell */}
                                    </GridItem>
                                </Grid>
                            );
                        })}
                        {/** Footer */}
                        <Grid templateColumns="0.2in 2.08in 0.88in 0.84in 0.6in 2.27in 0.56in 0.56in 0.56in 1.91in" h='0.17in' fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
                            <GridItem display="flex" border='1px solid black' borderTop='none' borderRight='none' justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                            <GridItem display="flex" borderBottom='1px solid black' justifyContent="center" alignItems="center">
                                <Box textAlign='center' position='relative' fontWeight='bolder' w='100%'>
                                    {(() => {
                                        const ins = allInstructors?.find((i) => i.id === batch?.assessor)
                
                                        const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                        //const suffix = ins?.rank === 'CAPT' ? ', MM' : ''
                                    
                                        return(
                                            <>
                                                <Text mt='3' mb='2'>Certified Correct</Text>
                                                {batch?.room?.toLowerCase() === 'online' && (
                                                    <Box 
                                                    position='absolute' 
                                                    top='15px' 
                                                    left='50%' 
                                                    transform="translateX(-50%)" 
                                                    zIndex={2} 
                                                    >
                                                        <NextImage src={eSignSrc} width='100' height='20' alt='signature' />
                                                    </Box>
                                                )}
                                                <Text position='relative' zIndex={1} w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>
                                                    {(() => {
                                                        if (!ins) return batch?.assessor || 'No Assessor';
                
                                                        // Add 'MM' if rank is 'CAPT'
                                                        const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                                        return `${ins.rank} ${ins.name}${suffix}`;
                                                    })()}
                                                </Text>
                                                <Text textAlign='center' w='100%'>ASSESSOR</Text>
                                            </>
                                        )
                                    })()}
                                </Box>
                            </GridItem>
                            <GridItem display="flex" borderBottom='1px solid black' justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                            <GridItem display="flex" borderBottom='1px solid black' justifyContent="center" alignItems="center">
                                <Box textAlign='center' fontWeight='bolder' w='100%'>
                                    <Text mt='8' mb='2'>{``}</Text>
                                    <Text fontSize='9pt'>{batch?.practicumDate}</Text>
                                    <Text borderTop='1px solid black'>DATE</Text>
                                </Box>
                            </GridItem>
                            <GridItem display="flex" borderBottom='1px solid black' justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                            <GridItem display="flex" borderBottom='1px solid black' justifyContent="center" alignItems="center">
                                <Box textAlign='center' fontWeight='bolder' w='100%'>
                                    <Text mt='8' mb='2'>{``}</Text>
                                    <Text>CAPT. ROGELIO MAHINAY, MM</Text>
                                    <Text borderTop='1px solid black'>TRAINING DIRECTOR</Text>
                                </Box>
                            </GridItem>
                            <GridItem display="flex" borderBottom='1px solid black' justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                            <GridItem display="flex" borderBottom='1px solid black' justifyContent="center" alignItems="center">
                                <Box textAlign='center' fontWeight='bolder' w='100%'>
                                    <Text mt='8' mb='2'>{``}</Text>
                                    <Text fontSize='7pt'>{batch?.practicumDate}</Text>
                                    <Text borderTop='1px solid black'>DATE</Text>
                                </Box>
                            </GridItem>
                            <GridItem display="flex" borderBottom='1px solid black' justifyContent="center" alignItems="center">
                                {/* Empty cell */}
                            </GridItem>
                            <GridItem display="flex" flexDir='column' border="0.5pt solid black" borderTop="none" justifyContent="center" alignItems="center">
                                <Box>
                                    <Text fontSize='6pt' px='1' py='4' textAlign='center'>{`Grading Scheme for Written Assesment: Obtained at least 75% of correct answers out of the total test items (as reflected in the ASEESSMENT PLAN)`}</Text>
                                </Box>
                                <Box w='100%'>
                                    <Box display='flex' borderTop='1px solid black' justifyContent='center' alignItems='center' w='100%'>
                                        <Text borderRight='1px solid black' w='30%' ps='2'>PASSED</Text>
                                        <Text w='70%' textAlign='center'>75% and above</Text>
                                    </Box>
                                    <Box display='flex' borderTop='1px solid black' justifyContent='center' alignItems='center' w='100%'>
                                        <Text borderRight='1px solid black' w='30%' ps='2'>FAILED</Text>
                                        <Text w='70%' textAlign='center'>Below 75%</Text>
                                    </Box>
                                </Box>
                            </GridItem>
                        </Grid>
                    </Box>
                </Box>
            </Box>
        </Box>
    </>
    )
}