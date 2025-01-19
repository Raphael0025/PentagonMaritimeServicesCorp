'use client'

import { useEffect } from 'react';
import Link from 'next/link'
import { Box, Button, Image, Text, } from '@chakra-ui/react'
import { ElementView, BannerView } from '@/Components/SiteComponents'
import { BullsEyeIcon, LightBulbIcon } from '@/Components/Icons'
export default function About() {


    return (
        <Box bgColor='#fbffff'>
            <Box pos='relative'>
                <Box pos='relative'>
                    <BannerView
                        initial={{opacity: 0, y: -100}}
                        animate={{opacity: 1, y: 0}}
                        transition={{ duration: 0.3, delay: 1, ease: 'linear' }}
                    >
                        <Box pos='absolute' top='0' left='0' pointerEvents='none' w='100%' h='100%' bgGradient='linear(0deg, rgba(14,14,14,1) 10%, rgba(255,255,255,0) 100%)' />
                        <Image src={'pentagon_banner.jpg'} w='100%' height={{base: '100%', lg: '500px'}} objectFit='cover' objectPosition='center' alt='company banner' />
                    </BannerView>
                </Box>
                <Box pos='absolute' w='100%' bottom='0' display='flex' justifyContent='center' alignItems='center'>
                    <BannerView
                        initial={{opacity: 0, y: 200}}
                        animate={{opacity: 1, y: 0}}
                        transition={{ duration: 0.5, delay: 1, ease: 'linear' }}
                    >
                        <Text display={{base: 'none', md: 'block', lg: 'block'}} className='outline-text' fontSize={{base: '6xl', lg: '8xl'}} textAlign='center' fontWeight='800' textTransform='uppercase'>about the Company</Text>
                        <Text display={{base: 'block', md: 'none', lg: 'none'}} className='outline-text-2' fontSize={{base: '3xl', lg: '8xl'}} textAlign='center' fontWeight='800' textTransform='uppercase'>about the Company</Text>
                    </BannerView>
                </Box>
            </Box>
            <Box >
                <Box px={{base: '5%', lg: '20%'}} py='4' mb='4' >
                    <Box  mb='2' pb='2' >
                        <BannerView
                            initial={{opacity: 0, x: 100}}
                            animate={{opacity: 1, x: 0}}
                            transition={{ duration: 0.5, delay: 1, ease: 'linear' }}
                        >
                            <Text fontWeight='800' color='#1c437e' as='h2' fontSize='4xl'>Our Story</Text>
                        </BannerView>
                        <BannerView
                            initial={{opacity: 0, x: -100}}
                            animate={{opacity: 1, x: 0}}
                            transition={{ duration: 0.5, delay: 1, ease: 'linear' }}
                        >
                            <Box w='10%' borderBottomWidth='5px' borderColor='blue.500' />
                        </BannerView>
                    </Box>
                    <BannerView
                        initial={{opacity: 0, x: 100, y: 30}}
                        animate={{opacity: 1, x: 0, y: 0}}
                        transition={{ duration: 0.5, delay: 1, ease: 'linear' }}
                    >
                        <Box color='gray.600' fontWeight='300' lineHeight='2.5rem' fontSize='1.3rem' >
                            <Text>{`Pentagon Maritime Services Corp. is an upgrading institution that offers courses that meet the established standards for maritime training.`}</Text>
                            <Text>{`We look back with admiration at the organizations that shaped our minds and appreciation of the industry. Our team brings over 15 years of experience in this industry to fulfill our envisioned new brand of maritime training. A brand that capitalizes on course development, account management, customer relationship, business operation and quality management resembling a strong foundation and stable structure that withstands wave of adversity and challenges.`}</Text>
                            <Text>{`PENTAGON, relentlessly keeps itself updated on the recent developments in the maritime industry to keep pace with the changing customer needs and expectations brought about by the industry developments.`}</Text>
                            <Text>{`We established and implemented a Quality Management System to define it's ability to provide quality, cost effective training that meets customer and statutory requirements.`}</Text>
                        </Box>
                    </BannerView>
                </Box>
                <Box display='flex' justifyContent='space-between' mt='2' flexDir={{base: 'column', lg: 'row'}} >
                    <Box _hover={{'& .card': {transform: 'scale(1.15)'}}} >
                        <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut' >
                            <Box pos='relative' bgColor='blue.400' p='10' overflow='hidden' >
                                {/* <Image pos='absolute' bottom='0' right='-100' opacity='0.2'  height='100%' zIndex='0' filter='grayscale(100%)' src={'pentagon_logo.png'} alt='logo' /> */}
                                <Box pos='absolute' bottom='0' zIndex='0' opacity='0.2' right='-100'>
                                    <LightBulbIcon size='100%' color='#fbffff' />
                                </Box>
                                <Box display='flex' flexDir='column' alignItems='center' pos='relative' zIndex='1' transition='transform 0.4s ease-in-out' className='card'>
                                    <Box pb='2' mb='4' >
                                        <Text fontWeight='800' color='#fbffff' as='h2' fontSize='4xl'>Our Vision</Text>
                                        <Box w='30%' borderBottomWidth='5px' borderColor='blue.700' />
                                    </Box>  
                                    <Box px={{base: '', md: '', lg: '20'}}>
                                        <Text fontSize='1.3rem' textAlign='center' fontWeight='300' lineHeight='2.5rem' color='white' >{`Innovative, effective and consistent source of integrated training and related opportunities for new and upgrading skills towards professionalizing career onshore or onboard.`}</Text>
                                    </Box>
                                </Box>
                            </Box>
                        </ElementView>
                    </Box>
                    <Box _hover={{'& .card': {transform: 'scale(1.15)', }}} >
                        <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut' >
                            <Box pos='relative' bgColor='blue.700' p='10' overflow='hidden' >
                                {/* <Image pos='absolute' bottom='0' right='-100' zIndex='0' height='100%' opacity='0.2' filter='grayscale(100%)' src={'pentagon_logo.png'} alt='logo' /> */}
                                <Box pos='absolute' bottom='0' zIndex='0' opacity='0.2' right='-50'>
                                    <BullsEyeIcon size='100%' color='#fbffff' />
                                </Box>
                                <Box display='flex' flexDir='column' alignItems='center' pos='relative' zIndex='1' transition='transform 0.4s ease-in-out' className='card'>
                                    <Box pb='2' mb='4' >
                                        <Text fontWeight='800' color='#fbffff' as='h2' fontSize='4xl'>Our Mission</Text>
                                        <Box w='30%' borderBottomWidth='5px' borderColor='blue.400' />
                                    </Box>  
                                    <Box px={{base: '', md: '', lg: '20'}}>
                                        <Text fontSize='1.3rem' textAlign='center' fontWeight='300' lineHeight='2.5rem' color='white' >{`We deliver basic and specialized maritime training as well as technical skills development programs that have utmost value to our clients towards competence building and professionalism.`}</Text>
                                    </Box>
                                </Box>
                            </Box>
                        </ElementView>
                    </Box>
                </Box>
                <Box px={{ base: '5%', lg: '20%'}} py='2%'>
                    <ElementView addView='animate__fadeIn' removeView='animate__fadeOut' >
                        <Box pb='2' mb='8' >
                            <Text fontWeight='800' color='#1c437e' as='h2' fontSize='3xl'>Our Values and Goals</Text>
                            <Box w='10%' borderBottomWidth='5px' borderColor='blue.500' />
                        </Box>
                    </ElementView>
                    <Box display='flex' gap='4' justifyContent='center' flexWrap='wrap'>
                    {values_goals.map((value, index) => (
                        <Box key={index} w={{base: '100%', md:'300px', lg: '500px'}} >
                            <ElementView addView={value.animate} removeView='animate__fadeOut' >
                                <Box _hover={{'& .hover-card': {transform: 'translateY(-30px)', shadow: '2xl', bgColor: '#fbffff'}}} h={'100%'} mb='4' bgColor='#fbffff' >
                                    <Box display='flex' justifyContent='space-between' alignItems='center' flexDir={'column'} className='hover-card' transition='transform 0.4s ease-in-out' borderRadius='10px' p='7' >
                                        <Image height='100%' src={`./${value.icon}.png`} alt='logo' />
                                        <Box fontSize='lg' display='flex' flexDir='column' alignItems={'center'} color='blue.700' lineHeight='2.4rem' fontWeight='300'>
                                            <Text textAlign={'center'} fontWeight='700' mb='4' fontSize='2xl'>{value.title}</Text>
                                            <Text textAlign={'center'}>{value.content}</Text>
                                        </Box>
                                    </Box>
                                </Box>
                            </ElementView>
                        </Box>
                    ))}
                    </Box>
                </Box>
                <Box px={{ base: '5%', lg: '20%'}} py='2%'>
                    <ElementView addView='animate__fadeIn' removeView='animate__fadeOut' >
                        <Box pb='2' mb='4' >
                            <Text fontWeight='800' color='#1c437e' as='h2' fontSize='3xl'>Our Quality Policy</Text>
                            <Box w='10%' borderBottomWidth='5px' borderColor='blue.500' />
                        </Box>
                    </ElementView>
                    {quality_policy.map((value, index) => (
                        <Box key={index}>
                            <ElementView addView={value.animate} removeView='animate__fadeOut' >
                                <Box _hover={{'& .hover-card': {transform: 'scale(1.15)'}}} mb='4'>
                                    <Box display='flex' justifyContent='space-between' alignItems='center' flexDir={value.direction === 1 ? 'row' : 'row-reverse'} className='hover-card' transition='transform 0.4s ease-in-out' shadow='md' borderRadius='10px' p='7' overflow='hidden' bgGradient={`linear(${value.gradient})`}>
                                        <Box fontSize={{base: 'lg', lg: '2xl'}} display='flex' flexDir='column' alignItems={value.align} color='white' lineHeight={{base: '1.4rem', lg: '2.4rem'}} fontWeight='300'>
                                            <Text textAlign={value.align === 'start' ? 'left' : 'right'}>{value.content}</Text>
                                        </Box>
                                        <Image height='100%' src={`./${value.icon}.png`} alt='logo' />
                                    </Box>
                                </Box>
                            </ElementView>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

const quality_policy =[
    {
        content: `Pentagon Maritime Services Corp. aims at continually improving the service we provide to consistently meet our client's requirements and deliver results that we can be proud of.`,
        icon: 'Icons/QP/improving',
        align: 'start',
        direction: 1,
        animate: 'animate__fadeInRight',
        gradient: '34deg, rgba(28,67,126,1) 26%, rgba(255,255,255,0) 100%',
    },
    {
        content: `We implement a management system that complies with statutory and international standards.`,
        icon: 'Icons/QP/management',
        align: 'end',
        direction: 2,
        animate: 'animate__fadeInLeft',
        gradient: '324deg, rgba(28,67,126,1) 26%, rgba(255,255,255,0) 100%',
    },
    {
        content: `We build a mutually beneficial relationship with our clients, ensuring long-term success through understanding their requirements and learn from their feedback including legal and regulatory provisions.`,
        icon: 'Icons/QP/relationship',
        align: 'start',
        direction: 1,
        animate: 'animate__fadeInRight',
        gradient: '34deg, rgba(28,67,126,1) 26%, rgba(255,255,255,0) 100%',
    },
    {
        content: `We achieve our commitments for quality by driving continual improvement and innovation based on efficient processes, well- defined measurements, best practices, and customer feedback.`,
        icon: 'Icons/QP/achieve',
        align: 'end',
        direction: 2,
        animate: 'animate__fadeInLeft',
        gradient: '324deg, rgba(28,67,126,1) 26%, rgba(255,255,255,0) 100%',
    },
    {
        content: `We develop our competencies, creativity, empowerment, and accountability through appropriate development programs and strong Management support and involvement.`,
        icon: 'Icons/QP/develop-mgmt',
        align: 'start',
        direction: 1,
        animate: 'animate__fadeInRight',
        gradient: '34deg, rgba(28,67,126,1) 26%, rgba(255,255,255,0) 100%',
    },
    {
        content: `We aim high to become the best provider of maritime services by ensuring everyone in Pentagon is accountable for fully satisfying our customers by meeting or exceeding their expectations in a timely manner.`,
        icon: 'Icons/QP/aimHigh',
        align: 'end',
        direction: 2,
        animate: 'animate__fadeInLeft',
        gradient: '324deg, rgba(28,67,126,1) 26%, rgba(255,255,255,0) 100%',
    },
]

const values_goals = [
    {
        title: 'Quality Services',
        content: `We determine our services based on the needs of our customers and always work towards exceeding their expectations.`,
        icon: 'Icons/quality',
        animate: 'animate__fadeInRight',
    },
    {
        title: 'Communication',
        content: `We build relationships and gain knowledge on how to grow and improve our business through constant communication within our organization, between our professionals and our customers.`,
        icon: 'Icons/communicating',
        animate: 'animate__fadeInLeft',
    },
    {
        title: 'Customer Focus',
        content: `We understand that our customers propel us to continually improve for their satisfaction.`,
        icon: 'Icons/user-focus',
        animate: 'animate__fadeInRight',
    },
    {
        title: 'Innovation',
        content: `We seek creative ideas and new ways of thinking to grow, improve our business.`,
        icon: 'Icons/innovation',
        animate: 'animate__fadeInLeft',
    },
    {
        title: 'Accountability',
        content: `We do what we say we will do and expect the same from others.`,
        icon: 'Icons/accountability',
        animate: 'animate__fadeInRight',
    },
    {
        title: 'Respect',
        content: `We value people, treating them with dignity at all times.`,
        icon: 'Icons/respect',
        animate: 'animate__fadeInLeft',
    },
]