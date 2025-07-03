'use client'

import React from 'react'
import {RFPEWAssessment_1, RFPEWAssessment_2, RFPEWAssessment_3} from '@/Components/features'
interface FDProps {
    selectedAssessment: string;
}

export default function FormDescription({selectedAssessment}: FDProps) {
    return(
    <>
    {(() => {
        switch(selectedAssessment){
            case 'a1':
                return <RFPEWAssessment_1 />
            case 'a2':
                return <RFPEWAssessment_2 />
            case 'a3':
                return <RFPEWAssessment_3 />
            default:
                return ''
        }
    })()}
    </>
    )
}