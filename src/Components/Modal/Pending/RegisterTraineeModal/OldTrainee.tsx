'use client'

import React from 'react'
import { Input, FormLabel, Select, FormControl } from '@chakra-ui/react';

import { OldTraineeProps } from '@/types/trainees';

export default function OldTrainee ({setTrainee, trainee, allTrainee, setTraineeID}: OldTraineeProps) {

    return(
        <FormControl >
            <FormLabel fontWeight='600' color='gray.500'>{`Search Old Trainee's Name`}</FormLabel>
            <Input mt='2' onChange={(e) => {setTrainee(e.target.value);}} placeholder={`Last Name, First Name`} shadow='md' />
            <Select mt='2' shadow='md' onChange={(e) => {setTraineeID(e.target.value)}}>
                <option hidden>Select Trainee</option>
                {allTrainee && allTrainee.filter((t) => `${t.last_name}, ${t.first_name}`.toLowerCase().includes(trainee.toLowerCase()))
                    .sort((a, b) => a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name)) // Sort alphabetically by last name, then first name
                    .map((t) => (
                        <option key={t.id} value={t.id}>{`${t.last_name.toLocaleUpperCase()}, ${t.first_name.toLocaleUpperCase()} ${t.middle_name.toLocaleUpperCase()} ${t.suffix.toLocaleUpperCase()}`}</option>
                    ))
                }
            </Select>
        </FormControl>
    )
}