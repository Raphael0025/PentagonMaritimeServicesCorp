'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Box, Button, Heading, Image, Text, useDisclosure, List, ListItem, Tooltip, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow } from '@chakra-ui/react'
import Link from 'next/link'

export default function NavBarV2(){
    const pathname = usePathname()
    const router = useRouter();

    const shouldHideNavbar = pathname?.startsWith('/certification') || pathname?.startsWith('/certificate-releasing') || pathname?.startsWith('/Tester') || pathname?.startsWith('/forms') || pathname?.startsWith('/admissions') || pathname?.startsWith('/login') || pathname?.startsWith('/enterprise-portal') || pathname?.startsWith('/feedback') ;

    if (shouldHideNavbar) {
        return null; // Don't render anything if conditions are met
    }

    return(
    <>
        <Box display='flex' justifyContent='center' position='sticky' top='0px' zIndex='1000' alignItems='center' w='100%' py='2'>
            <Box w="100%" maxW="1150px" display='flex' alignItems="center" justifyContent="space-between" px={4} py={2}
                backdropFilter="blur(8px)" 
                borderColor="rgba(255, 255, 255, 0.3)" 
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.1),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1),
                            inset 0 -1px 0 rgba(255, 255, 255, 0.1),
                            inset 0 0 0px 0px rgba(255, 255, 255, 0)" 
                border='0px solid gray.200'
                bg='rgba(255, 255, 255, 0.4)'
                borderRadius='2xl'
                _before={{
                    content: "''",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    h: "1px",
                    bgGradient: "linear(to-r, transparent, rgba(255, 255, 255, 0.8), transparent)",
                }}
            >
                <Box id='site-branding' display='flex' py={{base: '1.5em', md: '0.5em'}} justifyContent='center' alignItems='center'>
                    <Image src={'/pentagon_logo.png'} boxSize={{base: '40px', md: '40px'}} alt='company-logo'/>
                    <Image src={'/labelBanner.png'} width={{base: '150px', md: '150px'}} height={{base: '35px', md: '35px'}}  alt='company-logo'/>
                </Box>
                <Box display='flex' fontWeight='normal' color='' justifyContent='space-between' alignItems='center' gap={{base: '1em', md: '2em'}} fontSize={{base: '0.8em', md: '1em'}}>
                    <Box as={Link} py='3' className='px-2 hover:cursor-pointer' href='/' position="relative"
                        _hover={{
                            _after: {
                                transform: 'scaleX(1)',
                                transformOrigin: 'left',
                            },
                            '> span': { // Targeting the Text component
                                color: '#2c5282 ',
                            },
                        }}
                        _after={{
                            content: '""',
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            width: '100%',
                            height: '4px',
                            backgroundColor: '#2c5282  ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='600'>Home</Text>
                    </Box>
                    <Box as={Link} py='3' className='px-2 hover:cursor-pointer' href='/enrollment' position="relative"
                        _hover={{
                            _after: {
                                transform: 'scaleX(1)',
                                transformOrigin: 'left',
                            },
                            '> span': { // Targeting the Text component
                                color: '#2c5282 ',
                            },
                        }}
                        _after={{
                            content: '""',
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            width: '100%',
                            height: '4px',
                            backgroundColor: '#2c5282  ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='600'>Admissions</Text>
                    </Box>
                    <Box as={Link} py='3' className='px-2 hover:cursor-pointer' href='/about' position="relative" _hover={{
                            _after: {
                                transform: 'scaleX(1)',
                                transformOrigin: 'left',
                            },
                            '> span': { // Targeting the Text component
                                color: '#2c5282 ',
                            },
                        }}
                        _after={{
                            content: '""',
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            width: '100%',
                            height: '4px',
                            backgroundColor: '#2c5282 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='600'>About Us</Text>
                    </Box>
                    <Box as={Link} py='3' className='px-2 hover:cursor-pointer' href='/courses-offered' position="relative" _hover={{
                            _after: {
                                transform: 'scaleX(1)',
                                transformOrigin: 'left',
                            },
                            '> span': { // Targeting the Text component
                                color: '#2c5282 ',
                            },
                        }}
                        _after={{
                            content: '""',
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            width: '100%',
                            height: '4px',
                            backgroundColor: '#2c5282 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='600'>Courses Offered</Text>
                    </Box>
                    <Box as={Link} py='3' className='px-2 hover:cursor-pointer' href='/facilities' position="relative" _hover={{
                            _after: {
                                transform: 'scaleX(1)',
                                transformOrigin: 'left',
                            },
                            '> span': { // Targeting the Text component
                                color: '#2c5282 ',
                            },
                        }}
                        _after={{
                            content: '""',
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            width: '100%',
                            height: '4px',
                            backgroundColor: '#2c5282 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='600'>Facilities</Text>
                    </Box>
                    {/* Next Time
                    
                    <Box as={Link} py='3' className='px-2 hover:cursor-pointer' href='/announcements' position="relative" _hover={{
                            _after: {
                                transform: 'scaleX(1)',
                                transformOrigin: 'left',
                            },
                            '> span': { // Targeting the Text component
                                color: '#2c5282 ',
                            },
                        }}
                        _after={{
                            content: '""',
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            width: '100%',
                            height: '4px',
                            backgroundColor: '#2c5282 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='600'fontWeight='600' fontSize='0.9rem'>Announcements</Text>
                    </Box> */}
                    <Box as={Link} py='3' className='px-2 hover:cursor-pointer' href='/contact-us' position="relative" _hover={{
                            _after: {
                                transform: 'scaleX(1)',
                                transformOrigin: 'left',
                            },
                            '> span': { // Targeting the Text component
                                color: '#2c5282 ',
                            },
                        }}
                        _after={{
                            content: '""',
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            width: '100%',
                            height: '4px',
                            backgroundColor: '#2c5282 ',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.4s ease-in-out',
                        }}
                    >
                        <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontWeight='600'>Contact Us</Text>
                    </Box>
                    <Button onClick={() => {router.push('/admissions/ol/forms')}} size='sm' borderRadius='lg' bgColor='blue.700' colorScheme='blue' >Enroll Now!</Button>
                </Box>
            </Box>
        </Box>
    </>
    )
}