'use client'

import React from 'react'
import { Select } from '@chakra-ui/react'

interface TabProps{
    setSched: (value: string) => void;
    courseRef: string;
    trainingSched: string[];
    courseID: string;
} 

export default function TrainingCalendar({setSched, courseRef, trainingSched, courseID}: TabProps){

    return(
    <>
        <Select mt='2' isDisabled={courseRef !== courseID} onChange={(e) => setSched(e.target.value)} size="lg">
            <option hidden>Select a schedule</option>
            {trainingSched.map((date, index) => (
                <option key={index}>{date}</option>
            ))}
        </Select>
    </>
    )
}