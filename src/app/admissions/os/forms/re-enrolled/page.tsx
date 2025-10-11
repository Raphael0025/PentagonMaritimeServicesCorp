'use client'

import React, { useState } from 'react';
//components
import OSOldTrainee_v2 from '@/Components/Page/admissions/OSOldTrainee_v2';
import VerifyOldTrainee from '@/Components/Page/admissions/VerifyOldTrainee';
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
                <OSOldTrainee_v2 oldTrainee={trainee} /> 
            ) : (
                <VerifyOldTrainee setTrainee={setTrainee} setShow={setShow}/>
            )}
        </Box>
        </>
    )
}