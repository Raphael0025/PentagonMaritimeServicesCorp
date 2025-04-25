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
}

export default function StandardER({ e_report, course, schedule, year, room, trainingArray}: ERProps) {
    const { allData: allRegistrations } = useRegistrations()
    const { data: allTrainee } = useTrainees()
    const { data: allRanks } = useRank()

    // Split the course text
    const [firstLine, secondLine] = splitTextAtWordBoundary(course, 50);

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
                <Text py='4' display='flex' justifyContent='center' w='80%' fontFamily='Arial, sans-serif' fontWeight='bold' fontSize='15pt'>ENROLLMENT REPORT</Text>
                <Box w='90%' display='flex' flexDir='column' justifyContent='start' alignItems='center' fontFamily='Arial, sans-serif' fontWeight='normal' fontSize='11pt'>
                    <Box display='flex' w='100%' alignItems='end'>
                        <Text whiteSpace='9' mr='2'>Course:</Text>
                        <Box w="100%" borderBottomWidth="1px" p="0" borderColor="black">
                            <Text textAlign="center" fontSize="11pt" whiteSpace="pre-wrap" wordBreak="break-word">
                                {firstLine} {/* Display the first 50 characters */}
                            </Text>
                        </Box>
                    </Box>
                    {secondLine ? (
                        <Box w="100%" borderBottomWidth="1px" p="0" borderColor="black" mt="1">
                            <Text textAlign="center" fontSize="11pt" whiteSpace="pre-wrap" wordBreak="break-word">
                                {secondLine}
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
                    </Box>
                </Box>
                <Text py='2' as='i' display='flex' justifyContent='end' w='80%' fontFamily='Calibri, Arial, sans-serif' fontWeight='bold' fontSize='7pt'>FM-PENTAGON-013</Text>
                {/** Table */}
                <Box>
                    {/** Table header */}
                    <Grid templateColumns="0.49in 3.26in 1.63in 1.88in" gap={0} fontSize='10pt' h='0.48in' fontWeight='bold' fontFamily='Arial, sans-serif' >
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>NO.</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' alignItems='center'>NAME OF TRAINEES</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" borderRight="none" justifyContent='center' pt='2' alignItems='start'>RANK/POSITION</GridItem>
                        <GridItem display='flex' border="0.5pt solid black" justifyContent='center' pt='2' alignItems='start'>REGISTRATION NUMBER</GridItem>
                    </Grid>
                    {/** Table Body */}
                    {trainingArray?.map((training, index) => {
                        const registrations = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                        const trainee = allTrainee?.find((t) => t.id === registrations?.trainee_ref_id)
                        return(
                            <Grid key={training.id} templateColumns="0.49in 3.26in 1.63in 1.88in" h='0.30in' textTransform='uppercase' fontSize='10pt' gap={0} fontWeight={'normal'} fontFamily='Arial, sans-serif'>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='center' alignItems='center'>
                                    {(index + 1)}
                                </GridItem>
                                <GridItem display='flex' border="0.5pt solid black" borderTop='none' borderRight="none" justifyContent='start' px='2' alignItems='center'>
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
                    {(trainingArray ?? []).length < 24 && (
                        <Grid templateColumns="0.49in 3.26in 1.63in 1.88in" h="0.30in" textTransform="uppercase" fontSize="10pt" gap={0} fontWeight="normal" fontFamily="Arial, sans-serif">
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                {(trainingArray?.length || 0) + 1}
                            </GridItem>
                            <GridItem display="flex" border="0.5pt solid black" borderTop="none" borderRight="none" justifyContent="center" alignItems="center">
                                <Text>{`${((trainingArray ?? [])?.length || 0) >= 24 ? '' : '*NOTHING FOLLOWS*'}`}</Text>
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
                            <Grid key={index} templateColumns="0.49in 3.26in 1.63in 1.88in" h="0.30in" textTransform="uppercase" fontSize="10pt" gap={0} fontWeight="normal" fontFamily="Arial, sans-serif">
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
                <Box w='100%' display='flex' justifyContent='space-around' alignItems={'center'} fontFamily='Arial, sans-serif' fontWeight='normal' fontSize='11pt' mt='4'>
                    <Box w='25%'>
                        <Text>Prepared by:</Text>
                        <Text mt='4' w='100%' borderBottomWidth='1px' borderColor='black'/>
                        <Text textAlign='center' w='100%'>Registration Assistant</Text>
                    </Box>
                    <Box >
                        <Text>Reviewed and Approved by:</Text>
                        <Text mt='4' w='100%' borderBottomWidth='1px' borderColor='black'/>
                        <Text textAlign='center' w='100%'>Operations Officer</Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}