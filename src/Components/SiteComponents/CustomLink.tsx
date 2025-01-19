'use client'

import React from 'react'
import { Text, Link, } from '@chakra-ui/react'

interface ComponentProps {
    text: string;
    destination: string;
    paddingY: string;
    isExt: boolean;
}

export default function CustomLink({text, destination, paddingY, isExt}: ComponentProps){
    return(
    <>
        <Link isExternal={isExt} className={`${paddingY} px-2 hover:cursor-pointer`} href={`${destination}`} position="relative"
            _hover={{
                _after: {
                    transform: 'scaleX(1)',
                    transformOrigin: 'left',
                },
                '> span': { // Targeting the Text component
                    color: '#3c7dd5 ',
                },
            }}
            _after={{
                content: '""',
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                height: '4px',
                backgroundColor: '#3c7dd5  ',
                transform: 'scaleX(0)',
                transformOrigin: 'right',
                transition: 'transform 0.4s ease-in-out',
            }}
        >
            <Text as='span' transition='color 0.4s ease-in-out' fontWeight='500' fontSize='0.9rem'>{text}</Text>
        </Link>
    </>
    )
}