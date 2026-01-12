'use client'

import React from 'react';
import { Box, Text, Grid, Image, GridItem } from '@chakra-ui/react'
import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'

import { TRAINING_BY_ID } from '@/types/trainees'
import { useRegistrations } from '@/context/RegistrationContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRank } from '@/context/RankContext'
import { useInstructors } from '@/context/InstructorContext'

//import { splitTextAtWordBoundary } from '@/handlers/util_handler';

import { parsingTimestamp } from '@/types/handling'

interface ERProps {
    course: string;
    courseCode: string;
    site: string;
    practicumDate: string;
    instructor: string;
    assessor: string;
    schedule: string;
    year: string;
    room: string;
    batchNo: string;
    trainingArray?: TRAINING_BY_ID[];
}

export default function StandardER({ courseCode, site, practicumDate, course, schedule, year, room, batchNo, instructor, assessor, trainingArray}: ERProps) {
    const { allData: allRegistrations } = useRegistrations()
    const { data: allTrainee } = useTrainees()
    const { data: allRanks } = useRank()
    const { data: allInstructors } = useInstructors()

    // * Split the course text
    // * const [firstLine, secondLine] = splitTextAtWordBoundary(course, 50);

    return (
        <Box w='100%'>
            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
            {/** Header */}
                <Box display='flex' justifyContent='space-between' alignItems='center' w='90%'>
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
                <Text py='4' display='flex' justifyContent='center' w='80%' fontFamily='Arial, sans-serif' fontWeight='bold' fontSize='15pt'>ENROLMENT REPORT</Text>
                <Box w='90%' display='flex' flexDir='row' justifyContent='center' alignItems='center' fontFamily='Arial, sans-serif' fontWeight='normal' fontSize='11pt'>
                    <Box w='50%'>
                        <Box w='100%' display='flex' alignItems='end'>
                            <Text w='40%'>{`Course`}</Text>
                            <Text textAlign='center' borderBottomWidth='1px' fontSize='6pt' borderColor='black' w='100%'>{`${course.toUpperCase()}`}</Text>
                        </Box>
                        <Box w='100%' display='flex' alignItems='end'>
                            <Text w='40%'>{`Schedule`}</Text>
                            <Text textAlign='center' borderBottomWidth='1px' fontSize='7pt' borderColor='black' w='100%'>{`${schedule} ${year}`}</Text>
                        </Box>
                        <Box w='100%' display='flex' alignItems='end'>
                            <Text w='40%'>{`Practicum Site`}</Text>
                            <Text textAlign='center' borderBottomWidth='1px' fontSize='7pt' borderColor='black' w='100%'>{`${site}`}</Text>
                        </Box>
                        <Box w='100%' display='flex' alignItems='end'>
                            <Text w='40%'>{`Instructor`}</Text>
                            <Text textAlign='center' fontSize='7pt' borderBottomWidth='1px' borderColor='black' w='100%'>
                                {(() => {
                                    const ins = allInstructors?.find((i) => i.id === instructor);
                                    if (!ins) return instructor || 'No Instructor';

                                    // Add 'MM' if rank is 'CAPT'
                                    const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                    return `${ins.rank} ${ins.name}${suffix}`;
                                })()}
                            </Text>
                        </Box>
                    </Box>
                    <Box w='50%'>
                        <Box w='100%' display='flex'  alignItems='end' ms='1'>
                            <Text w='40%'>{`Class No `}</Text>
                            <Text textAlign='center' fontSize='7pt' borderBottomWidth='1px' borderColor='black' w='100%'>{`${batchNo}`}</Text>
                        </Box>
                        <Box w='100%' display='flex'  alignItems='end' ms='1'>
                            <Text w='40%'>{`Room No `}</Text>
                            <Text textAlign='center' fontSize='7pt' borderBottomWidth='1px' borderColor='black' w='100%'>{`${room}`}</Text>
                        </Box>
                        <Box w='100%' display='flex'  alignItems='end' ms='1'>
                            <Text w='40%'>{`Practicum Date `}</Text>
                            <Text textAlign='center' fontSize='7pt' borderBottomWidth='1px' borderColor='black' w='100%'>{`${practicumDate}`}</Text>
                        </Box>
                        <Box w='100%' display='flex'  alignItems='end' ms='1'>
                            <Text w='40%'>{`Assessor `}</Text>
                            <Text textAlign='center' fontSize='7pt' borderBottomWidth='1px' borderColor='black' w='100%'>
                                {(() => {
                                    const assessor_name = allInstructors?.find((i) => i.id === assessor);
                                    if (!assessor_name) return assessor || 'No Assessor';

                                    // Add 'MM' if rank is 'CAPT'
                                    const suffix = assessor_name.rank === 'CAPT' ? ', MM' : '';
                                    return `${assessor_name.rank} ${assessor_name.name}${suffix}`;
                                })()}
                            </Text>
                        </Box>
                    </Box>
                    {/* <Box display='flex' w='100%' alignItems='end'>
                        <Text whiteSpace='9' mr='2'>Course:</Text>
                        <Box w="100%" borderBottomWidth="1px" p="0" borderColor="black">
                            <Text textAlign="center" fontSize="11pt" whiteSpace="pre-wrap" wordBreak="break-word">
                                {firstLine.toUpperCase()} 
                            </Text>
                        </Box>
                    </Box>
                    {secondLine ? (
                        <Box w="100%" borderBottomWidth="1px" p="0" borderColor="black" mt="1">
                            <Text textAlign="center" fontSize="11pt" whiteSpace="pre-wrap" wordBreak="break-word">
                                {secondLine.toUpperCase()}
                            </Text>
                        </Box>
                    ) : (
                        <Box w="100%" borderBottomWidth="1px" borderColor="black" pt="6" />
                    )}
                    <Box display='flex' w='100%' mt='2' alignItems='end'>
                        <Box w='100%' display='flex' alignItems='end'>
                            <Text w='25%'>{`Schedule:`}</Text>
                            <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='100%'>{`${schedule}, ${year}`}</Text>
                        </Box>
                        <Box w='50%' display='flex'  alignItems='end' ms='1'>
                            <Text w='30%'>{`Room No: `}</Text>
                            <Text textAlign='center' borderBottomWidth='1px' borderColor='black' w='50%'>{`${room}`}</Text>
                        </Box>
                    </Box> */}
                </Box>
                <Text py='2' as='i' display='flex' justifyContent='end' w='91%' fontFamily='Calibri' fontWeight='bold' fontSize='7pt'>FM-03-10-03 REV.01</Text>
                {/** Table */}
                <Box w='90%' display='flex' justifyContent='center' flexDir='column' >
                    {/** Table header */}
                    <Grid templateColumns="0.34in 2.73in 0.66in 1.55in 0.66in 0.83in 1.27in" gap={0} fontSize='10pt' h='0.63in' textAlign='center' fontWeight='normal' fontFamily='Calibri' >
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>NO.</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Name of Trainee</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' wordBreak="break-word" whiteSpace="normal" alignItems='center'>Date of Birth</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Place of Birth</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Rank/ Position</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>Date of Enrollment</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" justifyContent='center' alignItems='center'>Registration No.</GridItem>
                    </Grid>
                    {/** Table Body */}
                    {trainingArray // Create a shallow copy to avoid mutating the original array
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
                            <Grid key={training.id} templateColumns="0.34in 2.73in 0.66in 1.55in 0.66in 0.83in 1.27in" h='0.25in' textTransform='uppercase' fontSize='9pt' gap={0} fontWeight={'normal'} fontFamily='Calibri'>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {(index + 1)}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' px='2' alignItems='center'>
                                    {`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name} ${trainee?.suffix.toLowerCase() === 'n/a' || trainee?.suffix === '' ? '' : `${trainee?.suffix}`}`}`}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {trainee?.birthDate ? parsingTimestamp(trainee.birthDate).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: '2-digit', }).replace(/[\s,\/]+/g, '-') : ''}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" fontSize='7pt' borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
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
                    {(trainingArray ?? []).length < 24 && (
                        <Grid templateColumns="0.34in 2.73in 0.66in 1.55in 0.66in 0.83in 1.27in" h="0.25in" textTransform="uppercase" fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {(trainingArray?.length || 0) + 1}
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                <Text>{`${((trainingArray ?? [])?.length || 0) >= 24 ? '' : '*NOTHING FOLLOWS*'}`}</Text>
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
                    {(trainingArray ?? []).length < 24 &&
                        [...Array(24 - (trainingArray ?? []).length - 1)].map((_, index) => {
                        const startingIndex = (trainingArray?.length || 0) + 1 // Start numbering after the last data row
                        return (
                            <Grid key={index} templateColumns="0.34in 2.73in 0.66in 1.55in 0.66in 0.83in 1.27in" h="0.25in" textTransform="uppercase" fontSize="8pt" gap={0} fontWeight="normal" fontFamily="Calibri">
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
                {/** Footer */}
                <Box w='100%' display='flex' justifyContent='space-around' alignItems={'center'} fontFamily='Arial, sans-serif' fontWeight='normal' fontSize='11pt' mt='8'>
                    <Box w='25%'>
                        <Text>Prepared by:</Text>
                        <Text mt='8' w='100%' borderBottomWidth='1px' borderColor='black'/>
                        <Text textAlign='center' w='100%'>Registration Assistant</Text>
                    </Box>
                    <Box width='2.31in'>
                        <Text>Certified Correct:</Text>
                        <Text mt='8' w='100%' borderBottomWidth='1px' borderColor='black'/>
                        <Text textAlign='center' w='100%'>Operations Officer</Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}