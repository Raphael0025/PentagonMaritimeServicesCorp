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
    trainingArray?: TRAINING_BY_ID[];
}

export default function AttendanceForm({ batch, trainingArray}: TFProps) {
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
            <Box display='flex' justifyContent='space-between' alignItems='center' w='90%'>
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
            <Text py='4' display='flex' justifyContent='center' w='80%' fontFamily='Arial, sans-serif' fontWeight='bold' fontSize='15pt'>ATTENDANCE SHEET</Text>
            <Box w='90%' display='flex' gap='28' flexDir='row' justifyContent='center' alignItems='center' fontFamily='Arial, sans-serif' fontWeight='normal' fontSize='11pt'>
                <Box w='47%'>
                    <Box w='100%' display='flex' alignItems='end'>
                        <Text w='40%'>{`Course:`}</Text>
                        <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='100%'>{`${course?.course_code}`}</Text>
                    </Box>
                    <Box w='100%' display='flex' alignItems='end'>
                        <Text w='40%'>{`Schedule:`}</Text>
                        <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='100%'>{`${formattedDate}`}</Text>
                    </Box>
                    <Box w='100%' display='flex' alignItems='end'>
                        <Text w='40%'>{`Practicum Site:`}</Text>
                        <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='100%'>{`${batch?.practicumSite}`}</Text>
                    </Box>
                    <Box w='100%' display='flex' alignItems='end'>
                        <Text w='40%'>{`Instructor:`}</Text>
                        <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='100%'>
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
                <Box w='45%'>
                    <Box w='100%' display='flex'  alignItems='end' ms='1'>
                        <Text w='40%'>{`Class No: `}</Text>
                        <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='100%'>{`${batch?.batch_no}`}</Text>
                    </Box>
                    <Box w='100%' display='flex'  alignItems='end' ms='1'>
                        <Text w='40%'>{`Room No: `}</Text>
                        <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='100%'>{`${batch?.room}`}</Text>
                    </Box>
                    <Box w='100%' display='flex'  alignItems='end' ms='1'>
                        <Text w='40%'>{`Practicum Date: `}</Text>
                        <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='100%'>{`${batch?.practicumDate}`}</Text>
                    </Box>
                    <Box w='100%' display='flex'  alignItems='end' ms='1'>
                        <Text w='40%'>{`Assessor: `}</Text>
                        <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='100%'>
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
            </Box>
            <Text py='2' as='i' display='flex' justifyContent='end' w='91%' fontFamily='Calibri' fontWeight='bold' fontSize='7pt'>FM-03-11-01 REV.02</Text>
            <Box display='flex' justifyContent='center' alignItems='center'>
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
                    {trainingArray// Create a shallow copy to avoid mutating the original array
                    ?.slice() // Create a shallow copy to avoid mutating the original array
                    .sort((a, b) => {
                        const regNoA = allRegistrations?.find((r) => r.id === a.reg_ref_id)?.reg_no || '';
                        const regNoB = allRegistrations?.find((r) => r.id === b.reg_ref_id)?.reg_no || '';
                
                        // Extract numeric parts of the registration number
                        const [yearA, numberA] = regNoA.split('-').map(Number);
                        const [yearB, numberB] = regNoB.split('-').map(Number);
                
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
                    {(trainingArray ?? []).length > 0 && (
                        <Grid templateColumns="0.48in 2.34in 0.89in 1in 0.84in 1in 1in 1in 1in 1in 1in" h='0.18in' textTransform="uppercase" fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {(trainingArray?.length || 0) + 1}
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
                    {(trainingArray ?? []).length < 24 &&
                        [...Array(24 - (trainingArray ?? []).length - 1)].map((_, index) => {
                        const startingIndex = (trainingArray?.length || 0) + 1 // Start numbering after the last data row
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
                                        <NextImage src={eSignSrc} width='100' height='20' alt='signature' />
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
    </>
    )
}