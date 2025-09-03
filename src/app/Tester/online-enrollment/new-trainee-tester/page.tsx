'use client'

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
//components
import NewTrainee_v2_tester from '@/Components/Page/admissions/NewTrainee_v2_tester';
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
                <NewTrainee_v2_tester />
            {/* </Box> */}
        </Box>
        </>
    )
}