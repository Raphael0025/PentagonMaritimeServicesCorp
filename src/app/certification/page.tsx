'use client'


import React, { useState, useMemo, useRef, useEffect } from 'react'
import { MdOutlineVerifiedUser } from "react-icons/md"
import { BsGlobe2 } from "react-icons/bs"
import { FaFacebook } from "react-icons/fa"
import { ArrowBackIcon } from '@chakra-ui/icons'
import {
    Box, Image, Text, Input, Button, FormControl, FormHelperText, FormLabel,
    Menu, MenuButton, MenuList, MenuItem,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    InputGroup, InputLeftAddon,
    useDisclosure, useToast, Link,
} from '@chakra-ui/react'

import { getDocs, query, where, collection, Timestamp } from 'firebase/firestore'

import { useCourses } from '@/context/CourseContext'
import { useCertification } from '@/context/CertificationContext'
import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useInstructors } from '@/context/InstructorContext'

import { CoursesById } from '@/types/courses'
import { ToastStatus } from '@/types/handling'
import { TRAINING_BY_ID, REGISTRATION_BY_ID, TRAINEE_BY_ID } from '@/types/trainees'

import { CERTIFICATION_BY_ID, CERTIFICATION, certVersion } from '@/types/certification'
import { firestore } from '@/lib/certification_controller'
import Registration_Background from '../../Components/ui/Registration_Background';

export default function Certification() {
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { allData: allTrainingData } = useTraining()
    const { allData: allRegData } = useRegistrations()
    const { data: allInstructors } = useInstructors()
    const { data: allCertTemplates } = useCertification()
    
    // const [certs, setCerts] = useState<CERTIFICATION_BY_ID[]>([])
    // const [trainees, setTrainees] = useState<TRAINEE_BY_ID[]>([])
    const [cert, setCert] = useState<CERTIFICATION_BY_ID | null>(null)
    const [train, setTrain] = useState<TRAINING_BY_ID | null>(null)
    const [reg, setReg] = useState<REGISTRATION_BY_ID | null>(null)
    
    const [certNum, setCertNum] = useState<string>('')
    const [regNum, setRegNum] = useState<string>('')

    const [showVerification, setShowVerification] = useState<boolean>(false)
    const [verifiedCertNum, setVerifiedCert] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    
    const [courseID, setCourseID] = useState<string>('')
    const [certTitleHtml, setCertTitleHtml] = useState('')
    const [certContentHtml, setCertContentHtml] = useState('')


    const certificates = useMemo(() => {
            return allCertTemplates ?? []
        }, [allCertTemplates])
    
    const certificateVersions = useMemo(() => {
        if (!courseID) return []

        const cert = certificates.find(
            cert => cert.courseID === courseID
        )

        return cert?.versions ?? []
    }, [certificates, courseID])
    
    const certificateController = collection(firestore, 'CERTIFICATE_CONTROL')
    const trainees = collection(firestore, 'TRAINEES')
    const registration = collection(firestore, 'REGISTRATION')
    const training = collection(firestore, 'TRAINING')

    const GET_CERT_TEMPLATE = async (): Promise<CERTIFICATION_BY_ID[]> => {
        try {
            const certQuery = query(certificateController, where('category', '==', 'generic'))
            const certSnapshot = await getDocs(certQuery)
            const certs = certSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CERTIFICATION_BY_ID[]
            setCert(certs[0] || null)
            return certs
        } catch (error) {
            console.error('Error fetching certificate templates:', error)
            throw error
        }
    }
    
    const GET_TRAINING_RECORD = async (
        certNo: string
    ): Promise<TRAINING_BY_ID | null> => {
        try {
            const q = query(training, where('cert_no', '==', certNo))
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                setTrain(null)
                return null
            }

            const docSnap = snapshot.docs[0]

            const result = {
                id: docSnap.id,
                ...docSnap.data(),
            } as TRAINING_BY_ID

            setTrain(result)
            return result

        } catch (error) {
            console.error('Error fetching training record:', error)
            throw error
        }
    }
    
    const GET_REGISTRATION_RECORD = async (
        regVar: string
    ): Promise<REGISTRATION_BY_ID | null> => {
        try {
            const q = query(registration, where('reg_no', '==', regVar))
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                setReg(null)
                return null
            }

            const docSnap = snapshot.docs[0]

            const result = {
                id: docSnap.id,
                ...docSnap.data(),
            } as REGISTRATION_BY_ID

            setReg(result)
            return result

        } catch (error) {
            console.error('Error fetching registration record:', error)
            throw error
        }
    }

    const handleVerification = async () => {
        try {
            setLoading(true)
            // Normalize inputs
            const normalizedRegNum = regNum.trim().replace(/^REG-/i, '')
            const normalizedCertNum = certNum.trim().toUpperCase()

            const regExists = await GET_REGISTRATION_RECORD(normalizedRegNum);
            const certExists = await GET_TRAINING_RECORD(normalizedCertNum)
            // Validation logic
            if (!regExists || !certExists) {
                toast({
                    title: 'Verification Failed',
                    description: `The certificate number ${certNum} or registration number ${regNum} is invalid. Please check and try again.`,
                    status: 'error' as ToastStatus,
                    duration: 8000,
                    isClosable: true,
                })
                return
            }
            console.log('Certificate and registration found:', certExists.course)
            toast({
                title: 'Certificate Verified',
                description: `The certificate number ${certNum} is valid and matches the registration number ${regNum}.`,
                status: 'success' as ToastStatus,
                duration: 8000,
                isClosable: true,
            })
        } catch (error) {
            console.error('Error verifying certificate:', error)
        } finally {
            setLoading(false)
            GET_CERT_TEMPLATE()
            setVerifiedCert(true)
        }
    }

    return(
    <>
        {/** Certificate Verification Modal */}
        <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='100vh'>
            <Image position='absolute' left={{base: '-80%', md: '-50%'}} transform={{base: "translateX(30%)", md: "translateX(50%)"}} zIndex={1} src={'pentagon_logo.png'} width={{base: '100%', md: '50%'}} h='100%' opacity={'50%'} />
            {!verifiedCertNum && (
                <Box w={{ base: '95%', md: '450px' }} h='450px' position='relative' zIndex={2} bgColor='#D4D4D4 ' shadow='md' display='flex' flexDirection='column' alignItems='center' border='1px solid gray'  borderRadius='md' textAlign='center'>
                    {/** Header */}
                    <Box bgColor='blue.900' placeItems='center' w='100%' borderBottom='3px solid #D2AC47' pt='3' pb='4' borderTopLeftRadius={'5'} borderTopRightRadius={'5'} >
                        <Image src='/landscape_logo_white_text.png' width='50%' height='100%' alt='company logo' />
                    </Box>
                    {showVerification ? (
                        <Box display='flex' position='relative' zIndex={2} flexDir='column' justifyContent='center' px='8' h='80%' w='100%'>
                            <Box w='auto' display='flex' flexDir='column'gap='4'>
                                <FormControl isRequired>
                                    <FormLabel>Certificate Number:</FormLabel>
                                    <Input onChange={(e) => setCertNum(e.target.value)} textAlign='center' placeholder='Type here' fontWeight='thin' variant='flushed'/>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Registration Number:</FormLabel>
                                    <Input onChange={(e) => setRegNum(e.target.value)} textAlign='center' placeholder='Type here' fontWeight='thin' variant='flushed'/>
                                    <FormHelperText fontWeight='bold' fontSize='xs' color='gray.600'>
                                        Provide the certificate and registration numbers exactly as shown on the certificate.
                                    </FormHelperText>
                                </FormControl>
                                <Button onClick={handleVerification} isLoading={loading} rightIcon={<MdOutlineVerifiedUser size='30px' />} loadingText='Verifying...' colorScheme='blue' shadow='md' bgColor='blue.700'>
                                    Verify Certificate 
                                </Button>
                                <Button size='md' color='white' mb='4' variant='link' onClick={() => setShowVerification(false)} leftIcon={<ArrowBackIcon />} >Back</Button>
                            </Box>
                        </Box>
                    ): (
                        <Box display='flex' position='relative' zIndex={2} flexDir='column' gap='3' p='5' h='100%' w='100%'>
                            <Text fontWeight='bold' fontSize='12pt' borderBottom='1px solid gray' w='100%' pb='4'>{`What do you like to do?`}</Text>
                            <Box display='flex' flexDir='column' py='3' gap='3'>
                                <Button role='group' onClick={() => setShowVerification(true)} position='relative' overflow={'hidden'} px='12' py='6' fontWeight='normal' size='md' _hover={{ bgColor: 'blue.700', color: 'white', borderBottom: '3px solid #d2ac47'}} borderBottom='3px solid white' >
                                    <Box position='absolute' left='40px' top='50%' transform='translateY(-50%)' transition='all 0.25s ease' _groupHover={{ transform: 'translateY(160%) scale(0.8)'}} >
                                        <MdOutlineVerifiedUser size='35px' />
                                    </Box>
                                    <Text textAlign='center'>
                                        Verify Virtual Certificate
                                    </Text>
                                    <Box position='absolute' right='-5px' top='65%' transform='translateY(50%) translateX(10px)' opacity={0} transition='all 0.25s ease' _groupHover={{opacity: 0.5, transform: 'translateY(-50%) translateX(0)'}} >
                                        <MdOutlineVerifiedUser size='80px' />
                                    </Box>
                                </Button>
                                <Button as='a' href='https://www.pentagonmaritime.com' role='group' position='relative' overflow={'hidden'} px='12' py='6' fontWeight='normal' size='md' _hover={{ bgColor: 'blue.700', color: 'white', borderBottom: '3px solid #d2ac47'}} borderBottom='3px solid white' >
                                    <Box position='absolute' left='40px' top='50%' transform='translateY(-50%)' transition='all 0.25s ease' _groupHover={{transform: 'translateY(160%)  scale(0.8)'}} >
                                        <BsGlobe2 size='35px' />
                                    </Box>
                                    <Text textAlign='center'>Visit Our Website</Text>
                                    <Box position='absolute' right='-5px' top='65%' transform='translateY(50%) translateX(10px)' opacity={0} transition='all 0.25s ease' _groupHover={{opacity: 0.5, transform: 'translateY(-50%) translateX(0)'}} >
                                        <BsGlobe2 size='80px' />
                                    </Box>
                                </Button>
                                <Button as='a' href='https://www.facebook.com/Pentagonmaritimeservicescorp' role='group' position='relative' overflow={'hidden'} px='12' py='6' fontWeight='normal' size='md' _hover={{ bgColor: 'blue.700', color: 'white', borderBottom: '3px solid #d2ac47'}} borderBottom='3px solid white' >
                                    <Box position='absolute' left='40px' top='50%' transform='translateY(-50%)' transition='all 0.25s ease' _groupHover={{transform: 'translateY(160%)  scale(0.8)'}} >
                                        <FaFacebook size='35px' />
                                    </Box>
                                    <Text textAlign='center'>View Our Social Media</Text>
                                    <Box position='absolute' right='-5px' top='65%' transform='translateY(50%) translateX(10px)' opacity={0} transition='all 0.25s ease' _groupHover={{opacity: 0.5, transform: 'translateY(-50%) translateX(0)'}} >
                                        <FaFacebook size='80px' />
                                    </Box>
                                </Button>
                            </Box>
                            <Box h='100%' display='flex' alignItems='end' justifyContent='center'>
                                <Text fontWeight='normal' h='100%'  fontSize='2xs' color='white' borderTop='1px solid gray' w='100%' pt='8'>{`For authenticity, you can verify the certificate digitally.`}</Text>
                            </Box>
                        </Box>
                    )}
                    <Box position='absolute' bottom='0' left='0' zIndex={0}>
                        <Image src='/waves.png' width='100%' alt='company logo' />
                    </Box>
                </Box>
            )}
            {verifiedCertNum && (
            <>
                <Box position='relative' display='flex' flexDir='column' justifyContent='center' alignItems='center' >
                    <Box w='90%' border='1px solid gray' position='relative' zIndex={2} display='flex' fontSize='12pt' fontWeight='normal' fontFamily='Arial' flexDir='column' alignItems='center' px='4' pt='8'>
                        <Image src={'/certificateHeader.png'} alt='header image' w='7.25in' h='1.20in'  objectFit='cover'/>
                        <Box pt='12' pr='5' pb='5' display='flex' justifyContent='end' w='85%'>
                            <Box fontWeight='bold' fontSize='12pt' textAlign='start'>
                                <Text>
                                    Certificate No.: 
                                    <Text as='span' fontWeight={'normal'}>
                                        {`${certNum}`}
                                    </Text>
                                </Text>
                                <Text>
                                    Registration No.: 
                                    <Text as='span' fontWeight={'normal'}>
                                        {regNum}
                                    </Text>
                                </Text>
                            </Box>
                        </Box>
                        <Box w='100%' display='flex' flexDir='column' alignItems='center' justifyContent='center' gap='3'>
                            <Text fontWeight='bold' fontSize='26pt'>Certificate of Completion</Text>
                            <Text >This Certificate is issued to</Text>
                            <Text fontWeight='bold' fontSize='16pt'>NAME</Text>
                            <Text>for having successfully completed the training course in</Text>
                            <Text fontSize='14pt' fontWeight='bold'>{certTitleHtml.toUpperCase()}</Text>
                            <Box w='75%' textAlign='center' sx={{
                                '& p, & div': {
                                    display: 'inline',
                                    margin: 0,
                                },
                                '& br': {
                                    display: 'inline',
                                },
                            }}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: `Conducted on _____________ ${certContentHtml}`
                                    }}
                                />
                            </Box>
                            <Text>{`Issued this ____ day of __________, 2026 in Manila City, Philippines`}</Text>
                            <Box pt='8' display='flex' gap='4' alignItems='end' justifyContent='space-between' w='100%'>
                                <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                    {(() => {
                                        const ins = allInstructors?.find((i) => i.name === 'ROGELIO C. MAHINAY')
                                        const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                    
                                        return(
                                            <>
                                                <Box position='absolute' top='-50px' left='20%' transform="translateX(-10%)" zIndex={2} >
                                                    <Image src={eSignSrc} w='100%' h='100%' alt='signature' />
                                                </Box>
                                                <Box borderTop='1px solid black' w='80%' />
                                                <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='10pt' fontWeight='bold'>
                                                    {(() => {
                                                        if (!ins) return 'No Instructor';
                
                                                        return `${ins.rank} ${ins.name}`;
                                                    })()}
                                                </Text>
                                                <Text fontSize='10pt'>Training Director</Text>
                                            </>
                                        )
                                    })()}
                                </Box>
                                <Box w='50%' pb='9' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center'>
                                    <Box w='1.5in' h='1.5in' border='1px solid black' />
                                </Box>
                                <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                    {(() => {
                                        const ins = allInstructors?.find((i) => i.name === 'MA. JOSEFA T. ALONSAGAY')
                                        const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                    
                                        return(
                                            <>
                                                <Box position='absolute' top='-45px' left='-8%' transform="translateX(5%)" zIndex={2} >
                                                    <Image src={eSignSrc} w='100%' h='100%' alt='signature' />
                                                </Box>
                                                <Box borderTop='1px solid black' w='90%' />
                                                <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='10pt' fontWeight='bold'>
                                                    {(() => {
                                                        if (!ins) return 'No Instructor';
                
                                                        return `${ins.rank} ${ins.name}`;
                                                    })()}
                                                </Text>
                                                <Text fontSize='10pt'>President</Text>
                                            </>
                                        )
                                    })()}
                                </Box>
                            </Box>
                            <Box pt='7' pb='10' display='flex' gap='1' justifyContent='center' alignItems='center' w='100%'>
                                <Image src={'/cert_ISO_Label.png'} alt='header image' w='1.49in'   objectFit='cover'/>
                                <Box w='0.9in' display='flex' justifyContent='center' alignItems='center' h='1.2in'>
                                    <Box w='0.8in' border='1px solid black' h='0.8in'>
                                        <Text textAlign='center' >QR Code here</Text>
                                    </Box>
                                </Box>
                                <Box fontWeight='bold' fontSize='9pt' ps='7' pr='7' py='3' borderLeft='1px solid black'>
                                    <Text>Landline: (02) 8281-8155</Text>
                                    <Text>Email: pentagonmaritimeservices@gmail.com</Text>
                                    <Text>FB: pentagonmaritimeservicescorp</Text>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box position='absolute' bottom='0' left='0' zIndex='1' w='100%' display='flex' justifyContent='center' alignItems='center'>
                        <Image  src={'/certificateFooter.png'} alt='header image' w='9in' h='2.25in'  objectFit='cover'/>
                    </Box>
                </Box>
            </>
            )}
        </Box>
    </>
    )
}