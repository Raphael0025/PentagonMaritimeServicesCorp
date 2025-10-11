'use client'

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
//components
import OSNewTrainee_v2 from '@/Components/Page/admissions/OSNewTrainee_v2';
import Stepper from '@/Components/NavStepper'
//types
import { TRAINEE, initTRAINEE } from '@/types/trainees'
//Contexts
import { useCourses } from '@/context/CourseContext'
//css library
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
        {/* <Stepper step={path} onStepChange={handleStepChange} /> */}
        <Box h='auto' bgColor='white' className='pb-5 justify-center '>
            {/* <Box className='w-full'> */}
                {/* <NewRegistrationForm onStepChange={setPath} /> */}
                <OSNewTrainee_v2 />
            {/* </Box> */}
        </Box>
        </>
    )
}