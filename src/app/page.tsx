'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ElementView } from '@/Components/SiteComponents'
import { Box, Button, Heading, Image, Text, VStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import { QuoteIcon } from '@/Components/Icons'
import { keyframes } from '@emotion/react'

export default function Home() {
    const router = useRouter();

    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselImages = [
        "Images/PRACTICAL-SITE/POOL-AREA.jpg", // Swap these paths out with your real carousel filenames
        "Images/FMB/img1.jpg", // Swap these paths out with your real carousel filenames
        "Images/ERS/Front.jpg",
        "Images/LCHS/img3.jpg",
        "Images/MB/img6.jpg",
        "Images/FMB/img3.jpg"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
        }, 6000); // Transitions to next image smoothly every 6 seconds
        return () => clearInterval(timer);
    }, [carouselImages.length]);

    const backgroundGlow = keyframes`
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    `;

    const slowPan = keyframes`
        0% { transform: scale(1) translate(0, 0); }
        50% { transform: scale(1.08) translate(-1%, -0.5%); }
        100% { transform: scale(1) translate(0, 0); }
    `;

    const shimmer = keyframes`
        0% { left: -150%; }
        50% { left: 150%; }
        100% { left: 150%; }
    `;

    const flashyGradientMove = keyframes`
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    `;

    const glareSweep = keyframes`
        0% { left: -150%; }
        100% { left: 150%; }
    `;

    const smoothSpotlight = keyframes`
    0% { transform: translate(-30%, -40%) scale(1); opacity: 0.2; }
    50% { transform: translate(-20%, -25%) scale(1.15); opacity: 0.35; }
    100% { transform: translate(-30%, -40%) scale(1); opacity: 0.2; }
    `;

    const shimmer2 = keyframes`
    0% { left: -150%; }
    100% { left: 150%; }
    `;

    const cardStyles = {
        w: { base: '100%', md: '260px', lg: '290px' },
        p: '6',
        borderRadius: '2xl',
        position: 'relative',
        overflow: 'hidden', // Keeps the glare clipped inside the card boundaries
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 10px 25px rgba(16, 27, 55, 0.15)',
        // Smooth moving gradient profile
        background: 'linear-gradient(-45deg, #101B37, #1B365D, #2B6CB0, #101B37)',
        backgroundSize: '300% 300%',
        animation: `${flashyGradientMove} 10s ease infinite`,
        // Stable hover: No moving/lifting, just a glowing shadow intensify
        _hover: {
            boxShadow: '0 15px 35px rgba(43, 108, 176, 0.4)',
            // Triggers the glare element on hover
            _after: {
                animation: `${glareSweep} 0.85s cubic-bezier(0.2, 0.8, 0.2, 1)`,
            }
        },
        // 💡 The Glare Layer Engine
        _after: {
            content: '""',
            position: 'absolute',
            top: 0,
            height: '100%',
            width: '60%',
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.25), transparent)',
            transform: 'skewX(-25deg)',
            left: '-150%',
            pointerEvents: 'none',
        }
    }
    
      // 2. High-contrast Image Wrapper Container
    const imageContainer = {
        borderRadius: 'xl',
        p: '4',
        mb: '6',
        bg: 'rgba(255, 255, 255, 0.92)', // Semi-transparent backing makes your PNG stand out beautifully
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'all 0.4s ease',
        _groupHover: {
            transform: 'scale(1.05)',
            bg: '#ffffff'
        }
    }
    
      // 3. Crisp Typography Overlay Styles
    const textStyle = {
        fontWeight: '900',
        fontSize: '1.35rem',
        color: '#ffffff',
        mb: '2',
        letterSpacing: 'tight',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
    }
    
    const textStyle1 = {
        fontSize: '0.9rem',
        fontWeight: '800',
        display: 'inline-block',
        color: '#63B3ED', // Bright maritime sky blue accent link
        textTransform: 'uppercase',
        letterSpacing: 'wider',
        transition: 'all 0.3s ease',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
        _hover: {
            color: '#ffffff',
            transform: 'translateX(6px)'
        }
    }

    const myYourCustomImage = "Images/FMB/img4.jpg";

    return (
        <>
        <Box as='main' display='flex' flexDir='column' justifyContent='center'>
            <Box mt='-115px' px={{base: '0', lg: '8'}} position="relative" w="100%" h={{ base: "100vh", md: "45rem" }} bg="#0B1220" overflow="hidden" display="flex" alignItems="center" justifyContent="center" >
                {/* 🎞️ CAROUSEL LAYER: Cross-fading background images */}
                {carouselImages.map((src, index) => (
                    <Box key={index} position="absolute" inset="0" bgImage={`url(${src})`} bgPosition="center" bgSize="cover" bgRepeat="no-repeat" zIndex="1" opacity={index === currentSlide ? 0.35 : 0} transition="opacity 1.5s ease-in-out, transform 6s ease-out" transform={index === currentSlide ? "scale(1.05)" : "scale(1)"} />
                ))}
                {/* 🎚️ DARK GLASS OVERLAY (Ensures maximum content contrast) */}
                <Box position="absolute" inset="0" zIndex="2" background="radial-gradient(circle at center, rgba(16, 27, 55, 0.40) 0%, #0B1220 90%)"/>
                {/* 🕸️ SUBTLE TECH GRID LAYER (Matches bg-grid-white/[0.02]) */}
                <Box position="absolute" inset="0" zIndex="3" pointerEvents="none" opacity="0.25"
                    style={{
                        backgroundSize: '44px 44px',
                        backgroundImage: `
                            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
                        `,
                    }}
                />
                {/* 🔦 AMBIENT SPOTLIGHT CONE (Pure CSS Aceternity Spotlight Equivalent) */}
                <Box position="absolute" top="0" left="50%" w={{ base: "600px", md: "1200px" }} h={{ base: "400px", md: "600px" }} zIndex="3" pointerEvents="none" background="radial-gradient(ellipse at top, rgba(99, 179, 237, 0.18) 0%, rgba(43, 108, 176, 0.03) 50%, transparent 80%)" animation={`${smoothSpotlight} 12s ease-in-out infinite`} filter="blur(60px)" />
                {/* ✍️ HERO TEXT CONTENT OVERLAY */}
                <VStack  position="relative"  zIndex="4"  spacing="6"  maxW="4xl"  mx="auto"  px="6"  textAlign="center" >
                    {/* Dynamic Maritime Premium Tag */}
                    <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut' >
                        <Text fontSize={{base: '0.5rem', md: "0.85rem"}} fontWeight="800" letterSpacing="0.25em" textTransform="uppercase" color="#63B3ED" bg="rgba(99, 179, 237, 0.08)" px="4" py="1.5" borderRadius="full" border="1px solid rgba(99, 179, 237, 0.2)" >
                            Bridging Competence and Professionalism
                        </Text>
                    </ElementView>
                    <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut' >
                        {/* Aceternity Style Multi-layered Title */}
                        <Heading as="h1" fontSize={{ base: "3rem", md: "5rem", }} fontWeight="900" lineHeight={{ base: "1.05", md: "1.08" }} letterSpacing="tight" color="transparent" bgGradient="linear(to-b, #FFFFFF 40%, rgba(255,255,255,0.55) 100%)" bgClip="text" >
                            Navigating Excellence, <br /> Empowering Seafarers
                        </Heading>
                    </ElementView>
                    <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut' >
                        {/* Supporting Copywriter Description */}
                        <Text fontSize={{ base: "0.85rem", md: "1.2rem" }} fontWeight="400" color="#fff" opacity="0.85" maxW="2xl" lineHeight="1.6" textShadow="0 2px 8px rgba(0,0,0,0.5)" >
                            {`Providing high-quality training programs that meet strict international and statutory requirements. Our mission is to build true competence and professionalism, giving you a consistent foundation to excel in your career both onshore and onboard.`}
                        </Text>
                    </ElementView>
                    <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut' >
                        {/* 🚀 GLOWING CALL TO ACTION BUTTON */}
                        <Box pt="4">
                            <Button as="a" href="/admissions/ol/forms" position="relative" overflow="hidden" size="lg" h="14" px="10" fontSize="1.1rem" fontWeight="800" color="#ffffff" bgColor="#1B365D" borderRadius="xl" border="1px solid rgba(255, 255, 255, 0.25)" boxShadow="0 4px 20px rgba(27, 54, 93, 0.5), inset 0 -2px 0px rgba(0,0,0,0.2)" transition="all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)"
                                _hover={{
                                    bgColor: "#2B6CB0",
                                    borderColor: "#63B3ED",
                                    boxShadow: "0 12px 30px rgba(99, 179, 237, 0.45)",
                                    transform: "translateY(-2px)"
                                }}
                                _active={{ transform: "scale(0.98)" }}
                            >
                                {/* Shifting Reflection Element across the button surface */}
                                <Box position="absolute" top="0" height="100%" w="50%" background="linear-gradient(to right, transparent, rgba(255,255,255,0.35), transparent)" transform="skewX(-30deg)" animation={`${shimmer} 3.5s infinite linear`} pointerEvents="none" />
                                Reserve your slots Today!
                            </Button>
                        </Box>
                    </ElementView>
                </VStack>
                {/* Cinematic Bottom Fog Shader Fade out */}
                <Box position="absolute" bottom="0" left="0" right="0" h="100px" zIndex="4" pointerEvents="none" background="linear-gradient(to top, #101B37 0%, transparent 100%)"/>
            </Box>
            <Box bgColor='#101B37' pos='relative' overflow='hidden' px={{base: '0', lg: '8'}} py='12' display='flex' flexDir='column' alignItems='center' justifyContent='center' >
                <Box pos='absolute' inset='0' zIndex='0' pointerEvents='none'
                    style={{
                        backgroundSize: '40px 40px',
                        backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    }}
                />
                <Box pos='absolute' inset='0' zIndex='0' pointerEvents='none'
                    style={{
                        background: 'radial-gradient(ellipse at center, transparent 20%, #101B37 100%)',
                    }}
                />
                <Box display={{base: 'none', lg:'block'}} pos='absolute' top='50%' right='-15%' transform='translateY(-50%)' opacity='0.25' pointerEvents='none' zIndex='0'>
                    <Image src='./pentagon_logo.png' boxSize='950px' objectFit='contain' alt='company-logo' />
                </Box>
                <Box zIndex='1' w={{base: '100%', lg: '50%'}} p='6' color='white'>
                    <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut' >
                        <Box mb='8'>
                            <Text fontSize='2.5rem' fontWeight='800' textTransform='uppercase' mb='2'>About Pentagon Maritime</Text>
                            <Text fontSize={{base: '0.8rem', md: '1rem'}} fontWeight='400' textAlign='justify' lineHeight='1.7'>
                            {`Pentagon Maritime Services Corp. is a premier maritime training institution dedicated to delivering high-quality upgrading courses that comply with national and international maritime training standards. Our commitment is to equip maritime professionals with the knowledge, skills, and competencies needed to excel in today's dynamic global shipping industry. Our organization is built on the collective expertise of professionals with over 15 years of experience in maritime education, training, quality management, business operations, account management, and customer relations. Inspired by the institutions that shaped our own careers, we have established a new standard of maritime training —one founded on excellence, innovation, integrity, and continuous improvement. Like the five strong sides of the Pentagon, our organization is anchored on five pillars: Course Development, Account Management, Customer Relations, Business Operations, and Quality Management. These pillars provide a solid foundation that enables us to navigate industry challenges while consistently delivering exceptional value to our clients. Recognizing the ever-evolving nature of the maritime industry, Pentagon Maritime Services Corp. continuously monitors regulatory updates, technological advancements, and industry best practices. This proactive approach allows us to anticipate changing customer needs and provide relevant, practical, and future-ready training solutions. To ensure the consistent delivery of quality services, we have established and maintain a comprehensive Quality Management System (QMS) that guides our operations and demonstrates our commitment to providing efficient, cost-effective, and customer-focused training. Our QMS ensures compliance with applicable statutory, regulatory, and customer requirements while fostering a culture of excellence and continual improvement. At Pentagon Maritime Services Corp., we do more than deliver training—we develop competent, confident, and globally competitive maritime professionals prepared to meet the demands of the modern maritime industry.`}
                            </Text>
                        </Box>
                    </ElementView>
                    <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut' >
                        <Box mb='8'>
                            <Text fontSize='2.5rem' display='inline-flex' alignItems='center' fontWeight='800' textTransform='uppercase' mb='2'>
                                <QuoteIcon size='1em' color='#fff' />
                                <Text as='span' ms='3'>Our Mission</Text>
                            </Text>
                            <Text fontSize={{base: '0.8rem', md: '1rem'}} fontWeight='400' lineHeight='1.6'>
                                {`We deliver basic and specialized maritime training as well as technical skills development programs that have utmost value to our clients towards competence building and professionalism.`}
                            </Text>
                        </Box>
                    </ElementView>
                    <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut' >
                        <Box mb='4'>
                            <Text fontSize='2.5rem' display='inline-flex' alignItems='center' fontWeight='800' textTransform='uppercase' mb='2'>
                                <QuoteIcon size='1em' color='#fff' />
                                <Text as='span' ms='3'>Our Vision</Text>
                            </Text>
                            <Text fontSize={{base: '0.8rem', md: '1rem'}} fontWeight='400' lineHeight='1.6'>
                                {`Innovative, effective and consistent source of integrated training and related opportunities for new and upgrading skills towards professionalizing career onshore or onboard.`}
                            </Text>
                        </Box>
                    </ElementView>
                </Box> {/* 🛠️ Perfectly aligns and cleanly closes the parent zIndex='1' column now */}
            </Box>
        </Box>
        <Box pos='relative' overflow='hidden' pt='120px' pb='0' bgColor='#ffffff'>
            <Box pos='absolute' top='-1px' left='0' right='0' pointerEvents='none' zIndex='2'>
                <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
                    <path d="M0,100 Q720,20 1440,100 L1440,0 L0,0 Z" fill="#101B37" />
                </svg>
            </Box>
            <Box pos='relative' zIndex='3' textAlign='center'>
                <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut'>  
                    <Text fontSize='2.5rem' color='#101B37' fontWeight='800' textTransform='uppercase' mb='2'>
                        What we Offer
                    </Text>
                </ElementView>
                <Box pb="16" bg="#ffffff" textAlign="center">
                    <Box w='100px' h='3px' bgGradient='linear(to-r, #1B365D, #2B6CB0, #63B3ED)' mx='auto' mb='16' borderRadius='full' />
                    <Box display='flex' justifyContent='center' flexDir={{ base: 'column', md: 'row' }} alignItems='stretch' gap='6' maxW='1440px' mx='auto' px='4'>
                        <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut' >
                            {/* CARD 1: Safety Courses */}
                            <Box sx={cardStyles} role="group">
                                <Box sx={imageContainer}>
                                    <Image src="Images/assets/safety.png" alt="Safety Courses Illustration" borderRadius='xl' boxSize="100%" objectFit="cover" />
                                </Box>
                                <Text sx={textStyle}>Safety Courses</Text>
                                <Text sx={textStyle1} as='a' href='/courses-offered'>See courses →</Text>
                            </Box>
                        </ElementView>
                        <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut' >
                            {/* CARD 2: STCW Courses */}
                            <Box sx={cardStyles} role="group">
                                <Box sx={imageContainer}>
                                    <Image src="Images/assets/stcw.png" alt="STCW Courses Illustration" borderRadius='xl' boxSize="100%" objectFit="contain" />
                                </Box>
                                <Text sx={textStyle}>STCW Courses</Text>
                                <Text sx={textStyle1} as='a' href='/courses-offered'>See courses →</Text>
                            </Box>
                        </ElementView>
                        <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut' >
                            {/* CARD 3: Domestic Courses */}
                            <Box sx={cardStyles} role="group">
                                <Box sx={imageContainer}>
                                    <Image src="Images/assets/domestic.png" alt="Domestic Courses Illustration" borderRadius='xl' boxSize="100%" objectFit="cover" />
                                </Box>
                                <Text sx={textStyle}>Domestic Courses</Text>
                                <Text sx={textStyle1} as='a' href='/courses-offered'>See courses →</Text>
                            </Box>
                        </ElementView>
                        <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut' >
                            {/* CARD 4: In-House Courses */}
                            <Box sx={cardStyles} role="group">
                                <Box sx={imageContainer}>
                                    <Image src="Images/assets/In-House.png" alt="In-House Courses Illustration" borderRadius='xl' boxSize="100%" objectFit="contain" />
                                </Box>
                                <Text sx={textStyle}>In-House Courses</Text>
                                <Text sx={textStyle1} as='a' href='/courses-offered'>See courses →</Text>
                            </Box>
                        </ElementView>
                    </Box>
                </Box>
            </Box>
        </Box>
        <Box py='5' position="relative" overflow="hidden" w="100%" minH={{ base: "320px", md: "420px" }} display="flex" alignItems="center" justifyContent="center" role="group" >
            <Box position="absolute" top="0" left="0" right="0" bottom="0" bgImage={`url(${myYourCustomImage})`} bgPosition="center" bgSize="cover" bgRepeat="no-repeat" zIndex="1" animation={`${slowPan} 25s ease-in-out infinite`} transition="transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)" _groupHover={{ transform: "scale(1.12)" }}/>
            <Box position="absolute" top="0" left="0" right="0" bottom="0" zIndex="2" background="linear-gradient(-45deg, rgba(26,43,87, 0.5), rgba(26,43,87, 0.4))" backgroundSize="400% 400%" animation={`${backgroundGlow} 15s ease infinite`}/>
            <VStack position="relative" zIndex="3" spacing="6" maxW="800px" mx="auto" px="6" textAlign="center" color="white">
                <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut'>
                    <Text fontSize={{ base: "1.8rem", md: "3.5rem" }} fontWeight="900" letterSpacing="tight" lineHeight="1.1" textShadow="0 4px 12px rgba(0,0,0,0.5)">
                        READY TO START YOUR{" "}
                        <Text as="span" display="inline-block" bgGradient="linear(to-b, #182857, #2E5FA4, #2A65AD)" bgClip="text" fontWeight="900" filter="drop-shadow(0px 2px 3px rgba(255,255,255,0.6))">
                            MARITIME JOURNEY?
                        </Text>
                    </Text>
                </ElementView>
                <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut'>
                    <Text px='2' fontSize={{ base: "0.8rem", md: "1.2rem" }} fontWeight="500" opacity="0.9" maxW="600px" textShadow="0 2px 8px rgba(0,0,0,0.4)">
                        Join thousands of successful maritime professionals who started their journey at Pentagon Maritime.
                    </Text>
                </ElementView>
                <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut'>
                    <Button as="a" href="/admissions/ol/forms" position="relative" overflow="hidden" size={{base: 'sm', md: 'lg'}} h="14" px="10" py='7' fontSize="1.1rem" fontWeight="800" color="white" bgColor="blue.700" borderRadius="full" border='1px solid white' 
                        boxShadow="0 4px 15px rgba(48, 123, 188, 0.4), inset 0 -2px 0px rgba(0,0,0,0.2)" transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                        _hover={{
                            bgColor: "blue.600",
                            boxShadow: "0 8px 25px rgba(56,155,242, 0.6)",
                            transform: "scale(1.05) translateY(-2px)"
                        }}
                        _active={{ transform: "scale(0.98)" }}
                    >
                        <Box position="absolute" top="0" height="100%" w="50%" background="linear-gradient(to right, transparent, rgba(255,255,255,0.45), transparent)" transform="skewX(-30deg)" animation={`${shimmer} 3s infinite linear`} pointerEvents="none" />
                        Apply Now - Classes Start Soon!
                    </Button>
                </ElementView>
            </VStack>
        </Box>
        </>
    )
}