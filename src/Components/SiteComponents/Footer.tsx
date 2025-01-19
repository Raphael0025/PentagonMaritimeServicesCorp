'use client'

import React, { useState, useEffect } from 'react'
import { usePathname  } from 'next/navigation';
import { Box, Text, Link, Button, Image, } from '@chakra-ui/react'
import { FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import 'animate.css';
import './Site.css'
import CustomLink from './CustomLink'
import { ClockIconCustom, MailIcon, PinIcon, PhoneIcon } from '../Icons';

export default function Footer() {
    const pathname = usePathname()

    const shouldHideNavbar = pathname?.startsWith('/admissions') || pathname?.startsWith('/login') || pathname?.startsWith('/enterprise-portal') || pathname?.startsWith('/feedback') ;

    if (shouldHideNavbar) {
        return null; // Don't render anything if conditions are met
    }

    return(
    <>
        <Box bgColor={'#1c437e'} px={{base: '5', md: '0'}} py={{base: '0', md: '10', lg: '10'}} display='flex' flexDir={{base: 'column', md: 'column', lg: 'row'}} alignItems='start' justifyContent={{base: 'start', md: 'start', lg: 'center'}}>
            <Box mt={{base: '5', md: '0'}} ml={{base: '0', md: '8'}} className='space-y-3' display='flex' flexDir='column' justifyContent='center' alignContent={'center'}>
                <Box display='flex' justifyContent='center' >
                    <Image src={'CompanyLogo2.png'} width='220px' height='150px' alt='company logo' />
                </Box>
                <Box w={{base: '100%', lg: '25em'}} color='#fbffff' fontWeight='400'>
                    <Text fontSize='1rem'>{`Innovative,	effective and consistent source of integrated training and related opportunities for new and upgrading skills towards professionalizing career onshore or onboard.`}</Text>
                </Box>
                <Box color='#fbffff' display='flex' justifyContent={{base: 'center', md: 'start'}}>
                    <Link href='/terms-and-conditions' p='2' variant='ghost' size='sm' color='#fbffff' borderRadius='5px' _hover={{color: '#1a2b57', bgColor: '#ffffff90'}}>Terms & Conditions</Link>
                    <Link href='/privacy-policy' p='2' variant='ghost' size='sm' color='#fbffff' borderRadius='5px' _hover={{color: '#1a2b57', bgColor: '#ffffff90'}}>Privacy Policy</Link>
                </Box>
            </Box>
            <Box mt={{base: '5', md: '0'}} ml={{base: '0', md: '8'}} w={{base: '100%', md: '10%', lg:'10%'}} >
                <Text color='#fbffff' fontWeight='600' fontSize='1.3rem'>Navigation</Text>
                <Box display='flex' flexDir='column' color='#fbffff90'>
                    <CustomLink isExt={false} text='Home' destination='/' paddingY='py-2' />
                    <CustomLink isExt={false} text='Admissions' destination='/enrollment' paddingY='py-2' />
                    <CustomLink isExt={false} text='About Us' destination='/about' paddingY='py-2' />
                    <CustomLink isExt={false} text='Courses Offered' destination='/courses-offered' paddingY='py-2' />
                    <CustomLink isExt={false} text='Facilities' destination='/facilities' paddingY='py-2' />
                    {/* Next time <CustomLink isExt={false} text='Announcements' destination='/announcements' paddingY='py-2' /> */}
                    <CustomLink isExt={false} text='Contact Us' destination='/contact-us' paddingY='py-2' />
                </Box>
            </Box>
            <Box mt={{base: '5', md: '0'}} ml={{base: '0', md: '8'}} w={{base: '100%', md: '20%', lg:'20%'}} className='space-y-3'>
                <Text color='#fbffff' fontWeight='600' fontSize='1.3rem'>Reach Us</Text>
                <Box color='#fbffff90' className='space-y-4'>
                    <Box display='flex' className='space-x-3' alignItems='center'  >
                        <PinIcon size='40px' color='#fbffff90' />
                        <Text>{`2/F 801, Building United Nations Ave. 1000 Ermita NCR, City of Manila, First District Philippines`}</Text>
                    </Box>
                    <Box display='flex' className='space-x-3' alignItems='start'  >
                        <ClockIconCustom size='22px' color='#fbffff90' />
                        <Box display='flex' flexDir='column' >
                            <Text>{`Operating Hours:`}</Text>
                            <Text>{`Mon-Fri 8:00AM - 5:00PM`}</Text>
                            <Text>{`Sat 8:00AM - 2:00PM`}</Text>
                        </Box>
                    </Box>
                    <Box display='flex' className='space-x-3' alignItems='center'  >
                        <MailIcon size='20px' color='#fbffff90' />
                        <Text>{`pentagonmaritimeservices@gmail.com`}</Text>
                    </Box>
                    <Box display='flex' className='space-x-3' alignItems='start'  >
                        <PhoneIcon size='22px' color='#fbffff90' />
                        <Box display='flex' flexDir='column' className='space-y-3'>
                            <Box>
                                <Text>{`Landline:`}</Text>
                                <Text>{`(02) 8 281- 8155`}</Text>
                            </Box>
                            <Box>
                                <Text>{`Registration:`}</Text>
                                <Text>{`0999-190-9273`}</Text>
                            </Box>
                            <Box>
                                <Text>{`Marketing:`}</Text>
                                <Text>{`0999-513-5916`}</Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box pb={{base: '10', md: '0'}} mt={{base: '5', md: '0'}} ml={{base: '0', md: '8'}} w={{base: '100%', md: '20%', lg: '20%'}}>
                <Text color='#fbffff' fontWeight='600' fontSize='1.3rem'>Follow us on our social media</Text>
                {/** Social Link 1 */}
                {/** Outer Box */}
                <Box display='flex' py='4' alignItems='center' color='#fbffff'>
                    {/** Inner Box */}
                    <Box display='flex' justifyContent='start'>
                        {/** Main Box */}
                        <Box className='ia' display='flex' justifyContent='center'>
                            <a href='https://www.facebook.com/Pentagonmaritimeservicescorp' target='_blank' rel='noopener noreferrer' style={{'color': '#fbffff'}}>
                                <div className='icon' >
                                    <FaFacebookF size={26} />
                                </div>
                            </a>
                        </Box>
                    </Box>
                    <CustomLink text='Pentagon Maritime Services Corp.' destination='https://www.facebook.com/Pentagonmaritimeservicescorp' paddingY='py-2' isExt={true}/>
                </Box>
            </Box>
        </Box>
        <Box bgColor={'#1a2b57'} color='#fbffff' p='5' display='flex' justifyContent='center' alignItems='center'>
            <Text fontWeight='400' textAlign='center' >Copyrights © 2024 All Rights Reserved by Pentagon Maritime Serivces Corp.</Text>
        </Box>
    </>
    )
}