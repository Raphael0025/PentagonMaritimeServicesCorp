'use client'

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
//components
import NewRegistrationForm from '@/Components/Page/admissions/NewRegistrationForm';
import Stepper from '@/Components/NavStepper'
//types
import { TRAINEE, initTRAINEE } from '@/types/trainees'
//Contexts
import { useCourses } from '@/context/CourseContext'
//css library
import 'animate.css';
import { Box } from '@chakra-ui/react'

export default function NewTrainee() {
    
    const [path, setPath] = useState<number>(0)
    
    // New Process
    const [trainee, setTrainee] = useState<TRAINEE>(initTRAINEE)

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleStepChange = (step: number) => {
        setPath(step)
    }
    
    return (
        <>
        <Stepper step={path} onStepChange={handleStepChange} />
        <Box className='h-full flex py-5 justify-center '>
            <Box className='w-full md:w-3/4'>
                <NewRegistrationForm onStepChange={setPath} />
            </Box>
        </Box>
        </>
    )
}