'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Box, Button, Image, Text, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react'
import Link from 'next/link'
import { HamburgerIcon } from '@chakra-ui/icons'

export default function NavBarV2(){
    const pathname = usePathname()
    const router = useRouter()

    const shouldHideNavbar = pathname?.startsWith('/certification') || 
                                pathname?.startsWith('/certificate-releasing') || 
                                pathname?.startsWith('/Tester') || 
                                pathname?.startsWith('/forms') || 
                                pathname?.startsWith('/admissions') || 
                                pathname?.startsWith('/login') || 
                                pathname?.startsWith('/enterprise-portal') || 
                                pathname?.startsWith('/feedback');

    if (shouldHideNavbar) {
        return null; 
    }

    // Extracted Links Array to avoid code duplication between Desktop and Mobile layout variations
    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'Admissions', href: '/enrollment' },
        { label: 'About Us', href: '/about' },
        { label: 'Courses Offered', href: '/courses-offered' },
        { label: 'Facilities', href: '/facilities' },
        { label: 'Contact Us', href: '/contact-us' },
    ];

    return (
    <>
        <Box display='flex' justifyContent='center' position='sticky' top='0px' zIndex='1000' alignItems='center' w='100%' py='2' px={{ base: 2, md: 0 }}>
            <Box w="100%" maxW={{base: '100%', md: "1150px"}} display='flex' alignItems="center" justifyContent="space-between" px={4} py={2}
                backdropFilter="blur(8px)" 
                borderColor="rgba(255, 255, 255, 0.3)" 
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.1),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1),
                            inset 0 -1px 0 rgba(255, 255, 255, 0.1)" 
                bg='rgba(255, 255, 255, 0.6)'
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
                {/* BRANDING SECTION */}
                <Box id='site-branding' display='flex' py={{base: '0.2em', md: '0.5em'}} justifyContent='center' alignItems='center' gap="2">
                    <Image src={'/pentagon_logo.png'} boxSize={{base: '35px', md: '55px'}} alt='company-logo'/>
                    <Image src={'/labelBanner.png'} width='130px' height='30px' display={{base: 'block', md: 'block'}} alt='company-logo-text'/>
                </Box>

                {/* DESKTOP MENU DISPLAY */}
                <Box display={{base: 'none', lg: 'flex'}} fontWeight='normal' justifyContent='space-between' alignItems='center' gap='1.5em' fontSize='1rem'>
                    {navLinks.map((link) => (
                        <Box key={link.href} as={Link} py='3' className='px-2 hover:cursor-pointer' href={link.href} position="relative"
                            _hover={{
                                _after: { transform: 'scaleX(1)', transformOrigin: 'left' },
                                '> span': { color: '#2c5282' },
                            }}
                            _after={{
                                content: '""',
                                position: 'absolute',
                                bottom: '0',
                                left: '0',
                                width: '100%',
                                height: '4px',
                                backgroundColor: '#2c5282',
                                transform: 'scaleX(0)',
                                transformOrigin: 'right',
                                transition: 'transform 0.4s ease-in-out',
                            }}
                        >
                            <Text as='span' transition='color 0.4s ease-in-out' textTransform='uppercase' fontSize='0.85rem' fontWeight='500'>{link.label}</Text>
                        </Box>
                    ))}
                    <Button onClick={() => {router.push('/admissions/ol/forms')}} size='md' borderRadius='lg' p='4' bgColor='blue.700' colorScheme='blue'>Enroll Now!</Button>
                </Box>
                {/* MOBILE / TABLET MENU TOGGLE */}
                <Box display={{ base: 'flex', lg: 'none' }} alignItems='center' gap='2'>
                    <Button onClick={() => {router.push('/admissions/ol/forms')}} size='xs' fontSize='0.75rem' p='4' borderRadius='md' bgColor='blue.700' colorScheme='blue'>Enroll Now!</Button>
                    <Menu autoSelect={false}>
                        <MenuButton 
                            as={IconButton} 
                            aria-label='Options' 
                            icon={<HamburgerIcon />} 
                            variant='outline' 
                            borderColor='rgba(0, 0, 0, 0.15)'
                            _hover={{ bg: 'rgba(255,255,255,0.8)' }}
                            _active={{ bg: 'rgba(255,255,255,0.9)' }}
                            size='sm'
                        />
                        <MenuList 
                            bg='rgba(255, 255, 255, 0.95)' 
                            backdropFilter="blur(10px)"
                            borderColor='gray.200' 
                            borderRadius='xl'
                            boxShadow='xl'
                        >
                            {navLinks.map((link) => (
                                <MenuItem 
                                    key={link.href} 
                                    as={Link} 
                                    href={link.href}
                                    fontWeight='600'
                                    textTransform='uppercase'
                                    fontSize='0.85rem'
                                    color='gray.700'
                                    _hover={{ bg: 'blue.50', color: '#2c5282' }}
                                >
                                    {link.label}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                </Box>
            </Box>
        </Box>
    </>
    )
}