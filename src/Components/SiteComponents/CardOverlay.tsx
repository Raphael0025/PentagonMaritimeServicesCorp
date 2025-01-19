'use client'

import React from 'react'
import { Box, Image, Link, Text } from '@chakra-ui/react'

interface CardProps{
    image: string;
    title: string;
    content: string;
    redirect: string;
}

export default function CardOverlay({image, title, redirect, content}: CardProps) {
    return(
        <Box w={{ base: '100%', md: '550px', lg: '100%' }} 
            h={{ base: '350px', md: '100%', lg: '100%' }}
            bgColor="#adadad90"
            pos="relative"
            overflow="hidden"
            borderRadius="10px"
            boxShadow="md"
            _hover={{
                '& .overlay': { 
                    background: 'linear-gradient(to top, rgba(27, 28, 37) 30%, rgba(27, 28, 37, 0) 100%)', // Changes gradient
                    transform: 'translateY(0)', // Moves the overlay into view
                },
                '& .test': {
                    opacity: 0,
                    transform: 'translateY(-20px)',
                },
                '& .content': {
                    opacity: 1,
                    transform: 'translateY(0)', // Moves content into view smoothly
                },
                '& .card-image':{
                    transform: 'scale(1.5)',
                }
            }}
        >
        {/* Background Image */}
        <Image h="100%" w="100%" src={image} transition='transform 0.4s ease-in-out' className='card-image' alt="ERS-widescreen" objectFit="cover" />
        {/* Title (Always Visible) */}
        <Box pos='absolute' bottom='0%' background="linear-gradient(to top, rgba(27, 28, 37) 0%, rgba(27, 28, 37, 0) 50%)" p='4' w='100%' h='100%'>
            <Box className="test"
                pos="absolute"
                bottom="5%"
                w={{ base: '100%', lg: '50%' }}
                left="5%"
                zIndex="2"
                color="white"
                fontSize="2xl"
                fontWeight="bold"
                opacity={1}
                transform="translateY(0)"
                transition="opacity 0.4s ease-in-out, transform 0.3s ease-in-out"
            >
                {title}
            </Box>
        </Box>
        {/* Content Overlay */}
        <Box className="overlay"
            pos="absolute"
            bottom="0"
            left="0"
            w="100%"
            h="600px"
            background="linear-gradient(to top, rgba(27, 28, 37) 0%, rgba(27, 28, 37, 0) 50%)"
            transform="translateY(100%)"
            transition="transform 0.4s ease-in-out, background 1s ease-in-out" // Smooth gradient transition
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            alignItems="center"
            color="white"
            p={4}
        >
            {/* Additional Content (Hidden Initially) */}
            <Box
                className="content"
                opacity={0}
                transform="translateY(50px)"
                transition="opacity 0.4s ease-in-out, transform 0.4s ease-in-out"
            >
                <Text fontSize="3xl" mb={2}>
                    {title}
                </Text>
                <Text fontSize="md" fontWeight="300" mb={2}>
                    {content}
                </Text>
                <Link href={redirect} size="sm" variant="ghost" colorScheme="black">
                    Read More...
                </Link>
            </Box>
        </Box>
    </Box>
    )
}