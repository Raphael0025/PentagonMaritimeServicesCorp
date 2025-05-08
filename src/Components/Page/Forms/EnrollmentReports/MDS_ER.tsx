'use client'

import React from 'react';
import { useState, useRef } from 'react'
import { Box, Text, Grid, Image, GridItem } from '@chakra-ui/react'
import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'

import { TRAINING_BY_ID } from '@/types/trainees'
import { useRegistrations } from '@/context/RegistrationContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRank } from '@/context/RankContext'

import { splitTextAtWordBoundary } from '@/handlers/util_handler';

interface ERProps {
    e_report: string;
    course: string;
    schedule: string;
    year: string;
    room: string;
    trainingArray?: TRAINING_BY_ID[];
    assessor: string;
    instructor: string;
    practicumSite: string;
    practicumDate: string;
    class_no: string;
}

export default function MDS_ER({ e_report, course, schedule, year, room, trainingArray, assessor, instructor, practicumDate, practicumSite, class_no}: ERProps) {
    const { allData: allRegistrations } = useRegistrations()
    const { data: allTrainee } = useTrainees()
    const { data: allRanks } = useRank()

    return (
        <Box w='100%'>
            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
            {/** Header */}
                <Box display='flex' justifyContent='end' alignItems='start' w='90%' px='1'>
                    <Text w='1.46in' h='0.41in' borderColor='rgb(238, 238, 238)' borderWidth='0.5pt' fontWeight='normal' fontSize='11pt' fontFamily='Arial, sans-serif'>Annex No. 3</Text>
                </Box>
                <Box display='flex' justifyContent='space-around' alignItems='center' w='60%'>
                    <Image src='/DOT_Logo.png' width={'0.7in'} height={'0.61in'} alt='logo'/>
                    <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                        <Text display='flex' justifyContent='center' alignItems='center' fontSize='11pt' fontFamily='Tahoma' fontWeight='normal'>
                            <Text>Republic of the Philippines</Text>
                        </Text>
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='11pt' fontFamily='Tahoma' fontWeight='normal'>
                            <Text>Department of Transportation</Text>
                        </Text>
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='11pt' fontFamily='Tahoma' fontWeight='normal'>
                            <Text>MARITIME INDUSTRY AUTHORITY</Text>
                        </Text>
                        <Text display='flex' justifyContent='end' alignItems='center' fontSize='11pt' fontFamily='Tahoma' fontWeight='normal'>
                            <Text>Manpower Development Service</Text>
                        </Text>
                    </Box>
                    <Image src='/MARINA_Logo.png' width={'0.78in'} height={'0.73in'} alt='logo'/>
                </Box>
                <Text py='4' display='flex' justifyContent='center' w='80%' fontFamily='Arial, sans-serif' fontWeight='bold' fontSize='12pt'>ENROLLMENT REPORT</Text>
                <Box w='80%' display='flex' flexDir='column' justifyContent='start' alignItems='center' fontFamily='Arial, sans-serif' fontWeight='normal' fontSize='11pt'>
                    <Box display='flex' w='100%' alignItems='end'>
                        <Text whiteSpace='9' w='17%' mr='2'>Name of MTI:</Text>
                        <Box w="100%" borderBottomWidth="1px" p="0" borderColor="black">
                            <Text textAlign="center" fontSize="11pt" whiteSpace="pre-wrap" wordBreak="break-word">
                                {`PENTAGON MARITIME SERVICES CORP.`}
                            </Text>
                        </Box>
                    </Box>
                    <Box w='100%' display='flex' justifyContent='space-between' fontFamily='Arial, sans-serif' fontWeight='normal' fontSize='11pt'>
                        <Box w='50%' display='flex' flexDir='column' justifyContent='start' mr='5'>
                            <Box display='flex' w='100%' alignItems='end' mt='1'>
                                <Text whiteSpace='9' mr='2'>Course:</Text>
                                <Text w='100%' textAlign="center" borderBottomWidth="1px" p="0" borderColor="black" >{course.toUpperCase()}</Text>
                            </Box>
                            <Box w='100%' display='flex' alignItems='end' mt='1'>
                                <Text w='60%'>{`Class Schedule:`}</Text>
                                <Text w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>{`${schedule}, ${year}`}</Text>
                            </Box>
                            <Box w='100%' display='flex' alignItems='end' mt='1'>
                                <Text w='95%'>{`Practicum Site/Vessel:`}</Text>
                                <Text w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>{`${practicumSite}`}</Text>
                            </Box>
                            <Box w='100%' display='flex' alignItems='end' mt='1'>
                                <Text w='25%'>{`Instructor:`}</Text>
                                <Text w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>{`${instructor}`}</Text>
                            </Box>
                        </Box>
                        <Box w='50%' display='flex' flexDir='column' justifyContent='start' >
                            <Box w='100%' display='flex'  alignItems='end' mt='1'>
                                <Text w='35%'>{`Class No: `}</Text>
                                <Text w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>{`${class_no}`}</Text>
                            </Box>
                            <Box w='100%' display='flex'  alignItems='end' mt='1'>
                                <Text w='35%'>{`Room No: `}</Text>
                                <Text w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>{`${room}`}</Text>
                            </Box>
                            <Box w='100%' display='flex'  alignItems='end' mt='1'>
                                <Text w='60%'>{`Practicum Date: `}</Text>
                                <Text w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>{`${practicumDate}`}</Text>
                            </Box>
                            <Box w='100%' display='flex'  alignItems='end' mt='1'>
                                <Text w='35%'>{`Assessor: `}</Text>
                                <Text w='100%' textAlign='center' borderBottomWidth='1px' borderColor='black'>{`${assessor}`}</Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                {/** Table */}
                <Box mt='4'>
                    {/** Table header */}
                    <Grid templateColumns="0.38in 2.64in 1.12in 2.44in" gap={0} fontSize='10pt' h='0.49in' fontWeight='bold' fontFamily='Arial, sans-serif' >
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>No.</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>NAME OF ENROLLEES</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" textAlign='center' justifyContent='center' pt='2' alignItems='start' whiteSpace="normal" wordBreak="break-word">RANK/ POSITION</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" justifyContent='center' pt='2' alignItems='start'>REGISTRATION NUMBER</GridItem>
                    </Grid>
                    {/** Table Body */}
                    {trainingArray // Create a shallow copy to avoid mutating the original array
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
                            <Grid key={training.id} templateColumns="0.38in 2.64in 1.12in 2.44in" h='0.19in' textTransform='uppercase' fontSize='10pt' gap={0} fontWeight={'normal'} fontFamily='Arial, sans-serif'>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {(index + 1)}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" fontSize='8pt' borderTop='none' borderRight="none" justifyContent='start' px='2' alignItems='center'>
                                    {`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name} ${trainee?.suffix.toLowerCase() === 'n/a' || trainee?.suffix === '' ? '' : `${trainee?.suffix}`}`}`}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {allRanks?.find((rank) => rank.code === trainee?.rank)?.rank || trainee?.rank}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' justifyContent='center' alignItems='center'>
                                    {`Reg-${registrations?.reg_no}`}
                                </GridItem>
                            </Grid>
                        )
                    })}
                    {/** Add the *NOTHING FOLLOWS* row immediately after the last data row */}
                    {(trainingArray ?? []).length < 30 && (
                        <Grid templateColumns="0.38in 2.64in 1.12in 2.44in" h="0.19in" textTransform="uppercase" fontSize="10pt" gap={0} fontWeight="normal" fontFamily="Arial, sans-serif">
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {(trainingArray?.length || 0) + 1}
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                <Text>*NOTHING FOLLOWS*</Text>
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
                    {(trainingArray ?? []).length < 30 &&
                        [...Array(30 - (trainingArray ?? []).length - 1)].map((_, index) => {
                        const startingIndex = (trainingArray?.length || 0) + 1 // Start numbering after the last data row
                        return (
                            <Grid key={index} templateColumns="0.38in 2.64in 1.12in 2.44in" h="0.19in" textTransform="uppercase" fontSize="10pt" gap={0} fontWeight="normal" fontFamily="Arial, sans-serif">
                                <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                    {startingIndex + index + 1}
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
                <Box w='100%' display='flex' justifyContent='space-around' alignItems={'start'} fontFamily='Arial, sans-serif' fontWeight='normal' fontSize='11pt' mt='4'>
                    <Box w='50%' display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                        <Text w='50%' textAlign='start'>Certified Correct:</Text>
                        <Text mt='8' w='50%' borderBottomWidth='1px' borderColor='black'/>
                        <Text textAlign='center' w='100%'>Training Director</Text>
                    </Box>
                    <Box w='50%' display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                        <Text w='50%' textAlign='start'>Approved by:</Text>
                        <Text mt='8' w='50%' borderBottomWidth='1px' borderColor='black'/>
                        <Text textAlign='center' w='40%'>Training Center Authorized Signatory</Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}