'use client'

import React from 'react'
import { useState, } from 'react';
import { Box, Text, } from '@chakra-ui/react';
import { FormDescriptionRFPEW, AssessmentSelectorRFPEW } from '@/Components/features';

export default function Page(){
    const [selectedAssessment, setSelection] = useState<string>('menu')

    return(
    <>
        <main >
            <Box h='100%' p='5' display='flex' justifyContent={'center'} >
                {selectedAssessment === 'menu' ? (
                    <AssessmentSelectorRFPEW setSelectedAssessment={setSelection}/>
                ) : (
                    <FormDescriptionRFPEW selectedAssessment={selectedAssessment} />
                )}
            </Box>
        </main>
    </>
    )
}