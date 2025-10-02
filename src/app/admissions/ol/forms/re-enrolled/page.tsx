'use client'

import React, { useState } from 'react';
//components
import OldRegistrationForm from '@/Components/Page/admissions/OldRegistrationForm';
import VerifyOldTrainee from '@/Components/Page/admissions/VerifyOldTrainee';
import Stepper from '@/Components/NavStepper'
import OldTrainee_v2 from '@/Components/Page/admissions/OldTrainee_v2';
//types
import { TRAINEE_BY_ID, initTRAINEE_BY_ID } from '@/types/trainees'
//css library
import { Box } from '@chakra-ui/react'

export default function OldTrainee() {
    const [path, setPath] = useState<number>(0)
    const [trainee, setTrainee] = useState<TRAINEE_BY_ID>(initTRAINEE_BY_ID)
    const [show, setShow] = useState<boolean>(false)

    const handleStepChange = (step: number) => {
        setPath(step)
    }
    
    return (
        <>
        <Box h='auto' bgColor='white' className='pb-5 justify-center '>
            {show ? (
                <OldTrainee_v2 oldTrainee={trainee} /> 
            ) : (
                <VerifyOldTrainee setTrainee={setTrainee} setShow={setShow}/>
            )}
        </Box>
        </>
    )
}