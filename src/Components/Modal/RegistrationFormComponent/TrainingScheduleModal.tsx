'use client'

import React from 'react'
import { Tabs, TabList, TabPanels, Tab, TabPanel, Alert, AlertIcon, AlertDescription, Button, ModalHeader, ModalContent, ModalBody, ModalFooter } from '@chakra-ui/react'

import {DropdownSchedule, TrainingCalendar} from './Tabs'

interface ModalProps {
    setSched: (value: string) => void;
    courseID: string;
    trainingSched: string[];
    selectedCourse: string;
    onClose: () => void;
}

export default function TrainingScheduleModal({setSched, courseID, trainingSched, selectedCourse}: ModalProps){
    
    return(
    <>
        <Tabs isLazy variant='enclosed' colorScheme='blue'>
            <TabList>
                <Tab onClick={() => setSched('')} >Available Schedules</Tab>
                <Tab onClick={() => setSched('')} >Select Preferred Dates</Tab>
            </TabList>
            <TabPanels>
                <TabPanel  >
                    <DropdownSchedule courseID={selectedCourse} courseRef={courseID} trainingSched={trainingSched} setSched={setSched} />
                </TabPanel>
                <TabPanel  >
                    <TrainingCalendar setSched={setSched} />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </>
    )
}