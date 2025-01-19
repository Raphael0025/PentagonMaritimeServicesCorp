'use client'

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
//components
import OldRegistrationForm from '@/Components/Page/admissions/OldRegistrationForm';
import VerifyOldTrainee from '@/Components/Page/admissions/VerifyOldTrainee';
import Stepper from '@/Components/NavStepper'
//types
import { TRAINEE, TRAINEE_BY_ID, initTRAINEE, initTRAINEE_BY_ID } from '@/types/trainees'
//Contexts
import { useCourses } from '@/context/CourseContext'
//css library
import 'animate.css';
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
        <Stepper step={path} onStepChange={handleStepChange} />
        <Box className='h-full flex py-5 justify-center '>
            <Box className='w-full md:w-3/4'>
                {show ? (
                    <OldRegistrationForm oldTrainee={trainee} onStepChange={setPath} /> 
                ) : (
                    <VerifyOldTrainee setTrainee={setTrainee} setShow={setShow}/>
                )}
            </Box>
        </Box>
        </>
    )
}