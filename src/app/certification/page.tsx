'use client'


import React, { useState, useMemo, useRef, useEffect } from 'react'
import { MdOutlineVerifiedUser } from "react-icons/md"
import { BsGlobe2 } from "react-icons/bs"
import { FaFacebook } from "react-icons/fa"
import {
    Box, Image, Text, Input, Button, FormControl, FormLabel,
    Menu, MenuButton, MenuList, MenuItem,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    InputGroup, InputLeftAddon,
    useDisclosure, useToast, Link,
} from '@chakra-ui/react'

import { useCourses } from '@/context/CourseContext'
import { useCertification } from '@/context/CertificationContext'
import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'

import { CoursesById } from '@/types/courses'
import { ToastStatus } from '@/types/handling'
import { TRAINING_BY_ID, TRAINEE_BY_ID } from '@/types/trainees'

import { CERTIFICATION_BY_ID, CERTIFICATION, certVersion } from '@/types/certification'
import { Timestamp } from 'firebase/firestore';

export default function Certification() {
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { allData: allTrainingData } = useTraining()
    const { allData: allRegData } = useRegistrations()
    const { data: allCertTemplates } = useCertification()
    
    const [certs, setCerts] = useState<CERTIFICATION_BY_ID[]>([])
    const [trainees, setTrainees] = useState<TRAINEE_BY_ID[]>([])
    
    const [showVerification, setShowVerification] = useState<boolean>(false)
    
    return(
    <>
        {/** Certificate Verification Modal */}
        {!showVerification && (
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='100vh'>
                <Image position='absolute' left={{base: '-80%', md: '-50%'}} transform={{base: "translateX(30%)", md: "translateX(50%)"}} zIndex={1} src={'pentagon_logo.png'} width={{base: '100%', md: '50%'}} h='100%' opacity={'50%'} />
                <Box w={{ base: '95%', md: '450px' }} h='450px' position='relative' zIndex={2} bgColor='#D4D4D4 ' shadow='md' display='flex' flexDirection='column' alignItems='center' border='1px solid gray'  borderRadius='md' textAlign='center'>
                    {/** Header */}
                    <Box bgColor='blue.900' placeItems='center' w='100%' borderBottom='3px solid #D2AC47' pt='3' pb='4' borderTopLeftRadius={'5'} borderTopRightRadius={'5'} >
                        <Image src='/landscape_logo_white_text.png' width='50%' height='100%' alt='company logo' />
                    </Box>
                    <Box display='flex' position='relative' zIndex={2} flexDir='column' gap='3' p='5' h='100%' w='100%'>
                        <Text fontWeight='bold' fontSize='12pt' borderBottom='1px solid gray' w='100%' pb='4'>{`What do you like to do?`}</Text>
                        <Box display='flex' flexDir='column' py='3' gap='3'>
                            <Button onClick={() => setShowVerification(true)} leftIcon={<MdOutlineVerifiedUser size='30px' />} py='6' fontWeight='normal' size='md' _hover={{ bgColor: 'blue.700', color: 'white', borderBottom: '3px solid #d2ac47'}} borderBottom='3px solid white' >Verify Virtual Certificate</Button>
                            <Button as='a' href='https://www.pentagonmaritime.com' leftIcon={<BsGlobe2 size='30px' />} py='6' fontWeight='normal' size='md' _hover={{ bgColor: 'blue.700', color: 'white', borderBottom: '3px solid #d2ac47'}} borderBottom='3px solid white' >Visit Our Website</Button>
                            <Button as='a' href='https://www.facebook.com/Pentagonmaritimeservicescorp' leftIcon={<FaFacebook size='30px' />} py='6' fontWeight='normal' size='md' _hover={{ bgColor: 'blue.700', color: 'white', borderBottom: '3px solid #d2ac47'}} borderBottom='3px solid white' >View Our Social Media</Button>
                        </Box>
                        <Box h='100%' display='flex' alignItems='end' justifyContent='center'>
                            <Text fontWeight='normal' h='100%'  fontSize='2xs' color='white' borderTop='1px solid gray' w='100%' pt='8'>{`For authenticity, you can verify the certificate digitally.`}</Text>
                        </Box>
                    </Box>
                    <Box position='absolute' bottom='0' left='0' zIndex={0}>
                        <Image src='/waves.png' width='100%' alt='company logo' />
                    </Box>
                </Box>
            </Box>
        )}
        {/** Certificate Verification Modal/Component */}
        {showVerification && (
            <Box>
                Verify
            </Box>
        )}
    </>
    )
}