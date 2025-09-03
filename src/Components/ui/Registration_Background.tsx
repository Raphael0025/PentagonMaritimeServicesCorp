'use client'

import { Image, Box, } from '@chakra-ui/react'
import 'animate.css'
import { useState, useEffect } from 'react'

export default function Registration_Background(){
    return(
    <>
        <Box className='w-full flex justify-center items-center text-white h-20 animate__animated animate__fadeInLeft'>
            <Box className='w-full bg-pt' style={{ position: 'relative', height: '80px'}}>
                <Image src={'/blurred_crop_old_fmb3.jpg'} alt="fill image" width='100%' height='100%' />
                <Box style={{ content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#333333', opacity: 0.5, }} />
            </Box>
        </Box>
    </>
    )
}
