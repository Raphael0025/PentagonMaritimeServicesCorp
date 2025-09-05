'use client'

import React, { useState } from 'react';
//components
import NewTrainee_v2_stcw_tester from '@/Components/Page/admissions/NewTrainee_v2_stcw_tester';
//css library
import 'animate.css';
import { Box } from '@chakra-ui/react'

export default function NewTrainee() {
    
    return (
        <>
        {/* <Stepper step={path} onStepChange={handleStepChange} /> */}
        <Box h='auto' bgColor='white' className='pb-5 justify-center '>
            {/* <Box className='w-full'> */}
                {/* <NewRegistrationForm onStepChange={setPath} /> */}
                <NewTrainee_v2_stcw_tester />
            {/* </Box> */}
        </Box>
        </>
    )
}