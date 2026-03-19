'use client'

import React, { useState, useRef } from 'react'
import { MdOutlineVerifiedUser } from "react-icons/md"
import {
    Box, Image, Text, Input, Button, FormControl, FormHelperText, FormLabel,
    useToast,
} from '@chakra-ui/react'

import { getDocs, query, where, collection, Timestamp } from 'firebase/firestore'

import { ToastStatus } from '@/types/handling'
import { TRAINING_BY_ID, REGISTRATION_BY_ID } from '@/types/trainees'

import { firestore } from '@/lib/certification_controller'
import { STORE_PROOF_RELEASING, UPDATE_TRAINING } from '@/lib/trainee_controller'

import SignatureCanvas from 'react-signature-canvas'

export default function RELEASING_LOG() {
    const toast = useToast()
    
    const [certNum, setCertNum] = useState<string>('')
    const [regNum, setRegNum] = useState<string>('')

    const [isDated, setIsDated] = useState<boolean>(false)
    const [trainingID, setTrainingID] = useState<string>('')
    const [certNo, setCertNo] = useState<string>('')

    const [verifiedCertNum, setVerifiedCert] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [showMessage, setShowMessage] = useState<boolean>(false)

    const sigCanvas = useRef<SignatureCanvas | null>(null)
    
    const registration = collection(firestore, 'REGISTRATION')
    const training = collection(firestore, 'TRAINING')
    
    const GET_TRAINING_RECORD = async (certNo: string ): Promise<TRAINING_BY_ID | null> => {
        try {
            const q = query(training, where('cert_no', '==', certNo))
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                return null
            }

            const docSnap = snapshot.docs[0]
            const result = {
                id: docSnap.id,
                ...docSnap.data(),
            } as TRAINING_BY_ID
            return result

        } catch (error) {
            console.error('Error fetching training record:', error)
            throw error
        }
    }
    
    const GET_REGISTRATION_RECORD = async (regVar: string): Promise<REGISTRATION_BY_ID | null> => {
        try {
            const q = query(registration, where('reg_no', '==', regVar))
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                return null
            }

            const docSnap = snapshot.docs[0]
            const result = {
                id: docSnap.id,
                ...docSnap.data(),
            } as REGISTRATION_BY_ID
            return result

        } catch (error) {
            console.error('Error fetching registration record:', error)
            throw error
        }
    }

    const handleSaveSignature = async () => {
        try{
            setLoading(true)
            if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
                toast({
                    title: 'Oops!',
                    description: `Please sign first before confirming.`,
                    status: 'warning' as ToastStatus,
                    duration: 5000,
                    isClosable: true,
                })
                return
            }
            const proofBase64 = sigCanvas.current.toDataURL("image/png")
            await STORE_PROOF_RELEASING(
                trainingID,
                isDated,
                certNo,
                proofBase64
            )
            await UPDATE_TRAINING(trainingID, {
                cert_status: 2,
                cert_released: Timestamp.now()
            }, '')
        }catch(error){
            toast({
                title: 'Oops!',
                description: `There was an error saving the signature.`,
                status: 'alert' as ToastStatus,
                duration: 5000,
                isClosable: true,
            })
        }finally{
            setLoading(false)
            setShowMessage(true)
            clearSignature()
            setCertNo('')
            setTrainingID('')
            setIsDated(false)
            setVerifiedCert(false)
        }
    }

    const handleVerification = async () => {
        try {
            setLoading(true)
            // Normalize inputs
            const normalizedRegNum = regNum.trim().replace(/^REG-/i, '')
            const normalizedCertNum = certNum.trim().toUpperCase()

            const registrationDoc = await GET_REGISTRATION_RECORD(normalizedRegNum);
            const trainingDoc = await GET_TRAINING_RECORD(normalizedCertNum)
            // Validation logic
            if (!registrationDoc || !trainingDoc) {
                toast({
                    title: 'Verification Failed',
                    description: `The certificate number ${certNum} or registration number ${regNum} is invalid. Please check and try again.`,
                    status: 'error' as ToastStatus,
                    duration: 5000,
                    isClosable: true,
                })
                return
            }
            const regType = trainingDoc.regType === 0 ? true : false

            setCertNo(trainingDoc.cert_no)
            setTrainingID(trainingDoc.id)
            setIsDated(regType)
            setVerifiedCert(true)

            toast({
                title: 'Certificate Verified',
                description: `The certificate number ${certNum} is valid and matches the registration number ${regNum}.`,
                status: 'success' as ToastStatus,
                duration: 5000,
                isClosable: true,
            })
        } catch (error) {
            console.error('Error verifying certificate:', error)
        } finally {
            setLoading(false)
        }
    }

    const clearSignature = () => {
        sigCanvas.current?.clear()
    }
    
    return(
    <>
        {/** Certificate Verification Modal */}
        <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight='100vh'>
            <Image position='absolute' left={{base: '-80%', md: '-50%'}} transform={{base: "translateX(30%)", md: "translateX(50%)"}} zIndex={1} src={'pentagon_logo.png'} width={{base: '100%', md: '50%'}} h='100%' opacity={'50%'} />
            {showMessage ? (
                <Box w={{ base: '95%', md: '450px' }} h='450px' position='relative' zIndex={2} bgColor='#D4D4D4 ' shadow='md' display='flex' flexDirection='column' alignItems='center' border='1px solid gray'  borderRadius='md' textAlign='center'>
                    {/** Header */}
                    <Box bgColor='blue.900' placeItems='center' w='100%' borderBottom='3px solid #D2AC47' pt='3' pb='4' borderTopLeftRadius={'5'} borderTopRightRadius={'5'} >
                        <Image src='/landscape_logo_white_text.png' width='50%' height='100%' alt='company logo' />
                    </Box>
                    <Box display='flex' position='relative' zIndex={2} flexDir='column' justifyContent='center' px='8' h='80%' w='100%'>
                        <Text fontSize='2xl' fontWeight='bold'>Certificate Released!</Text>
                        <Text fontSize='md' fontWeight='normal'>Congratulations on completing your training. Your dedication to professional excellence is commendable, and we are proud to support your career advancement.</Text>
                        <Text fontSize='md' fontWeight='normal'>We look forward to welcoming you back for your next course!</Text>
                    </Box>
                    <Box position='absolute' bottom='0' left='0' zIndex={0}>
                        <Image src='/waves.png' width='100%' alt='company logo' />
                    </Box>
                </Box>
            ) : (
            !verifiedCertNum ? (
                <Box w={{ base: '95%', md: '450px' }} h='450px' position='relative' zIndex={2} bgColor='#D4D4D4 ' shadow='md' display='flex' flexDirection='column' alignItems='center' border='1px solid gray'  borderRadius='md' textAlign='center'>
                    {/** Header */}
                    <Box bgColor='blue.900' placeItems='center' w='100%' borderBottom='3px solid #D2AC47' pt='3' pb='4' borderTopLeftRadius={'5'} borderTopRightRadius={'5'} >
                        <Image src='/landscape_logo_white_text.png' width='50%' height='100%' alt='company logo' />
                    </Box>
                    <Box display='flex' position='relative' zIndex={2} flexDir='column' justifyContent='center' px='8' h='80%' w='100%'>
                        <Box w='auto' display='flex' flexDir='column'gap='4'>
                            <FormControl isRequired>
                                <FormLabel>Certificate Number:</FormLabel>
                                <Input onChange={(e) => setCertNum(e.target.value.toUpperCase())} textTransform='uppercase' textAlign='center' placeholder='Type here' fontWeight='normal' bgColor='white' shadow='md' />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Registration Number:</FormLabel>
                                <Input onChange={(e) => setRegNum(e.target.value.toUpperCase())} textTransform='uppercase' textAlign='center' placeholder='Type here' fontWeight='normal' bgColor='white' shadow='md' />
                                <FormHelperText fontWeight='bold' fontSize='xs' color='gray.600'>
                                    Provide the certificate and registration numbers exactly as shown on the certificate.
                                </FormHelperText>
                            </FormControl>
                            <Button onClick={handleVerification} isLoading={loading} rightIcon={<MdOutlineVerifiedUser size='30px' />} loadingText='Verifying...' colorScheme='blue' boxShadow="0 0 10px var(--chakra-colors-blue-400)" bgColor='blue.700'>
                                Verify Certificate 
                            </Button>
                        </Box>
                    </Box>
                    <Box position='absolute' bottom='0' left='0' zIndex={0}>
                        <Image src='/waves.png' width='100%' alt='company logo' />
                    </Box>
                </Box>
            ): (
                <Box w='370px' h='400px' bgColor='#D4D4D4' position='relative' top='-120px' zIndex={2}>
                    <Box bgColor='blue.900' placeItems='center' w='100%' borderBottom='3px solid #D2AC47' pt='3' pb='4' borderTopLeftRadius={'5'} borderTopRightRadius={'5'} >
                        <Image src='/landscape_logo_white_text.png' width='50%' height='100%' alt='company logo' />
                    </Box>
                    <Box display='flex' justifyContent='space-between' alignItems='center' w='100%' px='6' py='2'>
                        <Text textAlign='center' fontSize='lg'>E-Signature:</Text>
                        <Button onClick={clearSignature} colorScheme='teal' shadow='md'>Redo</Button>
                    </Box>
                    <Text textAlign='start' px='6' fontWeight='normal' fontSize='xs'>By signing this, you can hereby confirming that you have received your certificate.</Text>
                    <SignatureCanvas 
                        ref={sigCanvas}
                        penColor='black'
                        canvasProps={{
                            width: 350,
                            height: 350,
                            style: { border: '1px solid black', borderRadius: '5px', backgroundColor: 'white'}
                        }}
                    />
                    <Button isLoading={loading} onClick={handleSaveSignature} mt='2' w='100%'shadow='md' loadingText='Confirming...' bgColor='blue.700' colorScheme='blue'>
                        CONFIRM
                    </Button>
                </Box>
            )
            )}
        </Box>
    </>
    )
}