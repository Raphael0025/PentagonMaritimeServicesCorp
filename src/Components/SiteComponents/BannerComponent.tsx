'use client'

import React from 'react'
import { Box, Image, Text } from '@chakra-ui/react'

interface BannerProps{
    title: string;
    content: string;
    image: string;
}

export default function BannerComponent({title, content, image}: BannerProps) {
    return(
    <>
        <Box position='relative'>
            <Box pos='relative'>
                <Box pos='absolute' top='0' left='0' pointerEvents='none' w='100%' h='100%' bgGradient='linear(126deg, rgba(5,5,5,0.8547794117647058) 40%, rgba(0,40,129,0) 100%)' />
                <Image src={`${image}`} w='100%' h='400px' objectFit='cover' objectPosition='center' alt='banner'/>
            </Box>
            <Box position='absolute' display='flex' flexDir='column' alignItems='start' justifyContent='end' top='0' left='0' px={{base: '5%', lg: '15%'}} py='5' bgColor='#0e0c0a9f' w='100%' h='100%'>
                <Box display={{base:'none', md: 'block', lg: 'block'}} bgColor='#21447d9f' pos='absolute' top='0' right='0%' height='100%' width='30%' clipPath={'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)'} >
                    <Image pos='absolute' top='0' right='-150' height='100%' width='70%' src='./pentagon_logo.png' alt='logo' />
                </Box>
                <Box display={{base:'none', md: 'block', lg: 'block'}} bgColor='#fbffff' pos='absolute' top='0' right='18%' height='100%' width='15%' clipPath={'polygon(56% 0%, 74% 0%, 20% 100%, 0% 100%)'} />
                <Text fontSize='5xl' fontWeight='800' color='#fbffff'>{title}</Text>
                <Text fontSize='xl' fontWeight='400' w={{base: '100%', lg: '50%'}} color='#fdfdfdaa'>{content}</Text>
            </Box>
        </Box>
    </>
    )
}