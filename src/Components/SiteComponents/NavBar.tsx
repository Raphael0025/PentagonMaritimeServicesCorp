'use client' 

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { usePathname  } from 'next/navigation';
import { Box, Button, Heading, Link, Image, Text, useDisclosure, List, ListItem, Tooltip, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';

export default function NavBar() {
    const pathname = usePathname()
    const router = useRouter();

    const shouldHideNavbar = pathname?.startsWith('/admissions') || pathname?.startsWith('/login') || pathname?.startsWith('/enterprise-portal') || pathname?.startsWith('/feedback') ;

    if (shouldHideNavbar) {
        return null; // Don't render anything if conditions are met
    }

    return (
        <>
            {/** Nav Bar Component */}
            <Box bgColor='#fbffff' display='flex' alignItems='center' pos='fixed' zIndex='1' w='100%' justifyContent={{base: 'space-around', md: 'space-between', lg: 'space-evenly'}} className='space-x-4 ' px={{base: '', md: '5%', lg: '0%'}}>
                <Box id='site-branding' display='flex' py={{base: '1.5em', md: '0.5em'}} justifyContent='center' alignItems='center'>
                    <Image src={'/pentagon_logo.png'} boxSize={{base: '40px', md: '60px'}} alt='company-logo'/>
                    <Image src={'/labelBanner2.jpg'} width={{base: '150px', md: '200px'}} height={{base: '35px', md: '50px'}}  alt='company-logo'/>
                </Box>
                <Box display={{base: 'none', md: 'none', lg:'flex'}} alignItems='center' className='space-x-8' color='gray.600' >
                    <Link py='7' className='px-2 hover:cursor-pointer' href='/' position="relative"
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
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='500' fontSize='0.9rem'>Home</Text>
                    </Link>
                    <Link py='7' className='px-2 hover:cursor-pointer' href='/enrollment' position="relative"
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
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='500' fontSize='0.9rem'>Admissions</Text>
                    </Link>
                    <Link py='7' className='px-2 hover:cursor-pointer' href='/about' position="relative" _hover={{
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
                            backgroundColor: '#3c7dd5 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='500' fontSize='0.9rem'>About Us</Text>
                    </Link>
                    <Link py='7' className='px-2 hover:cursor-pointer' href='/courses-offered' position="relative" _hover={{
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
                            backgroundColor: '#3c7dd5 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='500' fontSize='0.9rem'>Courses Offered</Text>
                    </Link>
                    <Link py='7' className='px-2 hover:cursor-pointer' href='/facilities' position="relative" _hover={{
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
                            backgroundColor: '#3c7dd5 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='500' fontSize='0.9rem'>Facilities</Text>
                    </Link>
                    {/* Next Time
                    
                    <Link py='7' className='px-2 hover:cursor-pointer' href='/announcements' position="relative" _hover={{
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
                            backgroundColor: '#3c7dd5 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='500' fontSize='0.9rem'>Announcements</Text>
                    </Link> */}
                    <Link py='7' className='px-2 hover:cursor-pointer' href='/contact-us' position="relative" _hover={{
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
                            backgroundColor: '#3c7dd5 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='500' fontSize='0.9rem'>Contact Us</Text>
                    </Link>
                    <Box>
                        <Button onClick={() => {router.push('/admissions/ol/forms')}} colorScheme='blue' bgColor='#1c437e' borderRadius='5px'>Enroll Now!</Button>
                    </Box>
                </Box>
                <Box display={{base: 'block', md: 'block', lg:'none'}}>
                    Burger
                </Box>
            </Box>
        </>
    )
}
