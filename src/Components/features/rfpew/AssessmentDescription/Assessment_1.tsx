'use client'

import React from 'react'
import { Box, Text, Grid, GridItem } from '@chakra-ui/react';


export default function FormDescription() {
    return(
    <>
        <Box w='md' display='flex'  justifyContent='start' flexDir='column' alignItems='center'>
            <Text>Practical Assessment Plan</Text>
            <Grid minH={'0.226in'} gap={2} >
                <Grid templateColumns='1.07in 2.08in' gap='4' borderBottom='1px solid gray' p='2'>
                    <GridItem textAlign='end'>Course Title</GridItem>
                    <GridItem fontWeight='normal'>{`Ratings Forming Part of a Watch in a Manned Engine-room or designated to perform duties in a Periodically Unmanned Engine-room`}</GridItem>
                </Grid>
                <Grid templateColumns='1.07in 2.08in' gap='4' borderBottom='1px solid gray' p='2'>
                    <GridItem textAlign='end'>Course Title</GridItem>
                    <GridItem fontWeight='normal'>{`1 (A5.1, A5.3, A5.4)`}</GridItem>
                </Grid>
                <Grid templateColumns='1.07in 2.08in' gap='4' borderBottom='1px solid gray' p='2'>
                    <GridItem textAlign='end'>Assessment Title</GridItem>
                    <GridItem fontWeight='normal'>
                        <Text mb='2'>• Relieve, maintain, and hand over a watch applying the prescribed principles and procedures</Text>
                        <Text mb='2'>• Take actions upon hearing an alarm of a specific emergency in the engine room</Text>
                        <Text mb='2'>• Monitor, maintain and record the safe operating parameters of the boiler while in operation</Text>
                    </GridItem>
                </Grid>
                <Grid templateColumns='1.07in 2.08in' gap='4' borderBottom='1px solid gray' p='2'>
                    <GridItem textAlign='end'>Function</GridItem>
                    <GridItem fontWeight='normal'>{`Marine Engineering at the Support Level`}</GridItem>
                </Grid>
                <Grid templateColumns='1.07in 2.08in' gap='4' borderBottom='1px solid gray' p='2'>
                    <GridItem textAlign='end'>Duration</GridItem>
                    <GridItem fontWeight='normal'>
                        <Text>Briefing- 5 mins.</Text>
                        <Text>Execution-  30 mins.</Text>
                        <Text>De-Briefing - 5 mins</Text>
                    </GridItem>
                </Grid>
                <Grid templateColumns='1.07in 2.08in' gap='4' borderBottom='1px solid gray' p='2'>
                    <GridItem textAlign='end'>Competence</GridItem>
                    <GridItem fontWeight='normal'>
                        <Text mb='2'>• Carry out a watch routine appropriate to the duties of a rating forming part of an engine room watch</Text>
                        <Text mb='2'>• Understand orders and be understood in matters relevant to watchkeeping duties</Text>
                    </GridItem>
                </Grid>
                <Grid templateColumns='1.07in 2.08in' gap='4' borderBottom='1px solid gray' p='2'>
                    <GridItem textAlign='end'>Knowledge, Understanding and proficiency</GridItem>
                    <GridItem fontWeight='normal'>{`1 (A5.1, A5.3, A5.4)`}</GridItem>
                </Grid>
            </Grid>
        </Box>
    </>
    )
}