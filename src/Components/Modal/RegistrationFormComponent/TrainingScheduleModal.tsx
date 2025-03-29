'use client'

import React, { useState } from 'react'
import { Box, Text, Input, FormControl, FormLabel, Tabs, TabList, TabPanels, Tab, TabPanel, Alert, AlertIcon, AlertTitle, AlertDescription, InputLeftAddon, InputGroup, useDisclosure, Button, Radio, RadioGroup, useToast, Modal, ModalHeader, ModalContent, ModalBody, ModalFooter, ModalOverlay } from '@chakra-ui/react'

import {DropdownSchedule, TrainingCalendar} from './Tabs'

interface ModalProps {
    setSched: (value: string) => void;
    courseID: string;
    trainingSched: string[];
    selectedCourse: string;
    onClose: () => void;
}

export default function ({setSched, courseID, trainingSched, selectedCourse, onClose}: ModalProps){
    return(
    <>
        <ModalContent p='5'>
            <ModalHeader color='blue.700' fontWeight='700' fontSize='xl'>Select Training Date</ModalHeader>
            <Alert status='info' variant='subtle'>
                <AlertIcon />
                <AlertDescription>
                    If schedule is not available, kindly click "Select Preferred Dates" to select preferred training schedule.
                </AlertDescription>
            </Alert>
            <ModalBody my='4'>
                <Tabs isLazy variant='enclosed' colorScheme='blue'>
                    <TabList>
                        <Tab>Available Schedules</Tab>
                        <Tab>Select Preferred Dates</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <DropdownSchedule courseID={selectedCourse} courseRef={courseID} trainingSched={trainingSched} setSched={setSched} />
                        </TabPanel>
                        <TabPanel>
                            <TrainingCalendar setSched={setSched} />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </ModalBody>
            <ModalFooter>
                <Button colorScheme='blue' shadow='md' bgColor='blue.700' onClick={onClose}>Done</Button>
            </ModalFooter>
        </ModalContent>
    </>
    )
}