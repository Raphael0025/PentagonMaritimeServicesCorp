'use client'


import React, { useState, useEffect } from 'react'
import { MdOutlineVerifiedUser } from "react-icons/md"
import { BsGlobe2 } from "react-icons/bs"
import { FaFacebook } from "react-icons/fa"
import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, Image, Text, Input, Button, Spinner, FormControl, FormHelperText, FormLabel, useToast, Progress, } from '@chakra-ui/react'

import { getDocs, query, where, collection, doc, getDoc, Timestamp } from 'firebase/firestore'

import { ToastStatus } from '@/types/handling'
import { TRAINING_BY_ID, REGISTRATION_BY_ID, TRAINEE_BY_ID } from '@/types/trainees'
import { CourseBatchByID } from '@/types/course-batches'
import { UPDATE_VIEW_CERT_ACCESS } from '@/lib/trainee_controller'

import { firestore } from '@/lib/certification_controller'

export default function Certification() {
    const toast = useToast()
    const [certNum, setCertNum] = useState<string>('')
    const [regNum, setRegNum] = useState<string>('')

    const [firstName, setFN] = useState<string>('')
    const [middleName, setMN] = useState<string>('')
    const [lastName, setLN] = useState<string>('')

    const [showVerification, setShowVerification] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [isPreparingCert, setIsPreparingCert] = useState<boolean>(false)
    const [verifiedCertNum, setVerifiedCert] = useState<boolean>(false)
    
    const [certTitleHtml, setCertTitleHtml] = useState('')
    const [certContentHtml, setCertContentHtml] = useState('')
    const [trainingDate, setTrainingDate] = useState<string>('')

    const [splitMonth, setSplitMonth] = useState<string>('')
    const [nthDay, setNthDay] = useState<string>('')

    const [getYear, setYear] = useState<number>(0)
    
    const registration = collection(firestore, 'REGISTRATION')
    const training = collection(firestore, 'TRAINING')
    
    const TOTAL_TIME: number = 30
    const [countdown, setCountdown] = useState<number>(TOTAL_TIME)
    const [progress, setProgress] = useState<number>(100)

    useEffect(() => {
        if (!verifiedCertNum || isPreparingCert) return;

        setCountdown(TOTAL_TIME);
        setProgress(100);

        // 1️⃣ Smooth progress animation using requestAnimationFrame
        const startTime = performance.now();

        const animateProgress = (now: number) => {
            const elapsed = (now - startTime) / 1000; // seconds
            const remaining = Math.max(TOTAL_TIME - elapsed, 0);
            setProgress((remaining / TOTAL_TIME) * 100);

            if (remaining > 0) {
                requestAnimationFrame(animateProgress);
            }
        };

        requestAnimationFrame(animateProgress);

        // 2️⃣ Countdown every 1 second (whole seconds)
        const interval = setInterval(() => {
            setCountdown(prev => Math.max(prev - 1, 0));
        }, 1000);

        // 3️⃣ Timeout when countdown ends
        const timeout = setTimeout(() => {
            setVerifiedCert(false);
            setCertNum('');
            setRegNum('');
            setFN('');
            setMN('');
            setLN('');
            setTrainingDate('');
            setSplitMonth('');
            setNthDay('');
            setCertContentHtml('');
            setCertTitleHtml('');
        }, TOTAL_TIME * 1000);

        // 4️⃣ Cleanup
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [verifiedCertNum, isPreparingCert]);

    const GET_TRAINING_RECORD = async (certNo: string): Promise<TRAINING_BY_ID | null> => {
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
    
    const GET_TRAINEE_RECORD = async ( traineeID: string ): Promise<TRAINEE_BY_ID | null> => {
        try {
            const ref = doc(firestore, "TRAINEES", traineeID)
            const snap = await getDoc(ref)
            if (!snap.exists()) return null

            return {
                id: snap.id,
                ...snap.data(),
            } as TRAINEE_BY_ID

        } catch (error) {
            console.error('Error fetching trainee record:', error)
            throw error
        }
    }
    
    const GET_REGISTRATION_RECORD = async ( regVar: string ): Promise<REGISTRATION_BY_ID | null> => {
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
    
    const GET_BATCH_RECORD = async (batchID: string): Promise<CourseBatchByID | null> => {
        try {
            const ref = doc(firestore, "BATCH_RECORDS", batchID)
            const snap = await getDoc(ref)
            if (!snap.exists()) return null

            return {
                id: snap.id,
                ...snap.data(),
            } as CourseBatchByID

        } catch (error) {
            console.error("Error fetching batch record:", error)
            throw error
        }
    }

    const formatTrainingSchedule = (dateStr: string, year: number) => {
        if (!dateStr) return ''
        const dateConvert = new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
        return `${dateConvert}, ${year}` // "February 11"
    }

    const getOrdinalHTML = (day: number) => {
        const suffix =
            day % 10 === 1 && day % 100 !== 11 ? 'st' :
            day % 10 === 2 && day % 100 !== 12 ? 'nd' :
            day % 10 === 3 && day % 100 !== 13 ? 'rd' : 'th'

        return `${day}<sup>${suffix}</sup>`
    }

    const getColor = () => {
        if(countdown <= 10) return 'red'
        if(countdown <= 30) return 'yellow'
        return 'green'
    }

    const handleVerification = async () => {
        if (loading) return

        try {
            setLoading(true)

            const normalizedRegNum = regNum.trim().replace(/^REG-/i, '')
            const normalizedCertNum = certNum.trim().toUpperCase()

            const regExists = await GET_REGISTRATION_RECORD(normalizedRegNum)
            const trainingDoc = await GET_TRAINING_RECORD(normalizedCertNum)
            
            if (!regExists || !trainingDoc) {
                toast({
                    title: 'Verification Failed',
                    description: `Invalid certificate or registration number.`,
                    status: 'error',
                    duration: 5000,
                })
                return
            }
            
            if (trainingDoc?.hasViewed) {
                toast({
                    title: 'View Limit Reached',
                    description: `You have already used your allocated view access for this certificate. Please contact the training center for further assistance.`,
                    status: 'error',
                    duration: 5000,
                })
                return
            }

            const trainee = await GET_TRAINEE_RECORD(regExists.trainee_ref_id)
            if (!trainee) {
                toast({
                    title: 'Verification Failed',
                    description: `No trainee Record.`,
                    status: 'error',
                    duration: 5000,
                })
                return
            }

            // ✅ SWITCH VIEW IMMEDIATELY
            setVerifiedCert(true)
            setIsPreparingCert(true)

            // 🔄 prepare data AFTER UI switch
            setTimeout(async () => {
                try {
                    const batchRec = await GET_BATCH_RECORD(trainingDoc.batch)

                    let year = 0
                    if (batchRec?.createdAt?.toDate) {
                        year = batchRec.createdAt.toDate().getFullYear()
                    }
                    setYear(year)

                    const training_date =
                        trainingDoc.numOfDays === 1
                            ? formatTrainingSchedule(trainingDoc.start_date, year)
                            : `${formatTrainingSchedule(trainingDoc.start_date, year)} to ${formatTrainingSchedule(trainingDoc.end_date, year)}`

                    const split_Month = formatTrainingSchedule(
                        trainingDoc.end_date || trainingDoc.start_date,
                        year
                    ).split(' ')[0]

                    const split_Day = formatTrainingSchedule(
                        trainingDoc.end_date || trainingDoc.start_date,
                        year
                    ).split(' ')[1].replace(/\D/g, '')

                    const nth_Day = getOrdinalHTML(Number(split_Day))
                    const view_count: number = (Number(trainingDoc?.viewCount || 0) + 1)

                    // ✅ set all UI data
                    setFN(trainee.first_name)
                    setMN(trainee.middle_name)
                    setLN(trainee.last_name)
                    setTrainingDate(training_date)
                    setSplitMonth(split_Month)
                    setNthDay(nth_Day)
                    setCertContentHtml(trainingDoc.certContent)
                    setCertTitleHtml(trainingDoc.certTitle)
                    await UPDATE_VIEW_CERT_ACCESS(trainingDoc.id, view_count, '')
                    toast({
                        title: 'Certificate Verified',
                        status: 'success',
                        duration: 3000,
                    })
                } catch (err) {
                    console.error(err)
                } finally {
                    setIsPreparingCert(false)
                }
            }, 0)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    
    const normalizeCertContent = (html: string) => {
        const temp = document.createElement('div')
        temp.innerHTML = html

        // convert inner divs to spans
        temp.querySelectorAll('div').forEach(div => {
            const span = document.createElement('span')
            span.innerHTML = div.innerHTML

            // copy styles you need
            span.style.display = 'inline'
            span.style.textAlign = div.style.textAlign || 'center'
            span.style.lineHeight = '1.2'

            div.replaceWith(span)
        })
        return temp.innerHTML
    }
    
    return(
    <>
        {/** Certificate Verification Modal */}
        <Box display='flex' flexDirection='column' alignItems='center' justifyContent={verifiedCertNum ? 'start' : 'center'} minHeight='100vh'>
            <Image position='absolute' left={{base: '-80%', md: '-50%'}} transform={{base: "translateX(30%)", md: "translateX(50%)"}} zIndex={1} src={'pentagon_logo.png'} width={{base: '100%', md: '50%'}} h='100%' opacity={'30%'} />
            {!verifiedCertNum ? (
                // 🔵 FORM VIEW
                <Box w={{ base: '95%', md: '450px' }} h='450px' position='relative' zIndex={2} bgColor='#D4D4D4 ' shadow='md' display='flex' flexDirection='column' alignItems='center' border='1px solid gray'  borderRadius='md' textAlign='center'>
                    {/** Header */}
                    <Box bgColor='blue.900' placeItems='center' w='100%' borderBottom='3px solid #D2AC47' pt='3' pb='4' borderTopLeftRadius={'5'} borderTopRightRadius={'5'} >
                        <Image src='/landscape_logo_white_text.png' width='50%' height='100%' alt='company logo' />
                    </Box>
                    {showVerification ? (
                        <Box display='flex' position='relative' zIndex={2} flexDir='column' justifyContent='center' px='8' h='80%' w='100%'>
                            <Box w='auto' display='flex' flexDir='column'gap='4'>
                                <Box pt='2'>
                                    <Text>
                                        <Text as='span'>Note:</Text>
                                        <Text fontWeight='normal' as='span'>You only have this one time to view your certificate.</Text>
                                    </Text>
                                </Box>
                                <FormControl isRequired>
                                    <FormLabel>Certificate Number:</FormLabel>
                                    <Input onChange={(e) => setCertNum(e.target.value.toUpperCase())} textTransform='uppercase' textAlign='center' placeholder='Type here' fontWeight='thin' variant='flushed'/>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Registration Number:</FormLabel>
                                    <Input onChange={(e) => setRegNum(e.target.value.toUpperCase())} textTransform='uppercase' textAlign='center' placeholder='Type here' fontWeight='thin' variant='flushed'/>
                                    <FormHelperText fontWeight='bold' fontSize='xs' color='gray.600'>
                                        Provide the certificate and registration numbers exactly as shown on the certificate.
                                    </FormHelperText>
                                </FormControl>
                                <Button
                                    onClick={handleVerification}
                                    isLoading={loading}
                                    isDisabled={loading}
                                    rightIcon={<MdOutlineVerifiedUser size='30px' />}
                                    loadingText='Verifying...'
                                    colorScheme='blue'
                                    bgColor='blue.700'
                                    boxShadow='0 0 10px 2px var(--chakra-colors-blue-300)'
                                >
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
            ) : isPreparingCert ? (
                // 🟡 LOADING CERT VIEW
                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                    <Spinner size='xl' color='blue.500' />
                    <Box textAlign='center' p='10'>
                        <Text fontSize='lg' fontWeight='bold'>Preparing Certificate...</Text>
                        <Text fontSize='sm' color='gray.500'>Please wait...</Text>
                    </Box>
                </Box>
            ) : (
                // 🟢 FINAL CERTIFICATE VIEW
                <>
                    <Box w="100%" mt="4">
                        <Progress
                            value={progress}
                            size="sm"
                            colorScheme={getColor()}
                            borderRadius="md"
                            transition="all 1s linear"
                        />
                        
                        <Text fontSize="xs" color="gray.500" textAlign="center" mt="1">
                            Returning in {countdown}s...
                        </Text>
                    </Box>
                    <Box position='relative' display='flex' flexDir='column' justifyContent='center' alignItems='center' pt='5'>
                        <Box w='95%' h='100%' position='relative' zIndex={2} display='flex' fontSize='12pt' fontWeight='normal' fontFamily='Arial' flexDir='column' alignItems='center' pt='2'>
                            <Image src={'/CompanyLogo2-dark.png'} alt='header image' w='2in' h='1.5in'  />
                            <Box pt='6' pr='12' pb='5' display='flex' justifyContent='end' w='100%'>
                                <Box fontWeight='bold' fontSize='10pt' textAlign='start'>
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
                                <Text fontWeight='bold' fontSize='16pt'>Certificate of Completion</Text>
                                <Text fontSize='10pt'>This Certificate is issued to</Text>
                                <Text fontWeight='bold' fontSize='14pt' textTransform='uppercase'>{`${firstName} ${middleName} ${lastName}`}</Text>
                                <Text textAlign='center' fontSize='10pt'>for having successfully completed the training course in</Text>
                                <Text fontSize='14pt' textAlign='center' fontWeight='bold'>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: `${certTitleHtml}`
                                        }}
                                    />
                                </Text>
                                <Box w='115%' mt='3' textAlign='center' sx={{
                                    '& ul': {
                                        listStyleType: 'disc',
                                        listStylePosition: 'inside',
                                        paddingLeft: '1.5rem',
                                        margin: '0.5rem 0',
                                    },
                                    '& ol': {
                                        listStyleType: 'decimal',
                                        listStylePosition: 'inside',
                                        paddingLeft: '1.5rem',
                                        margin: '0.5rem 0',
                                    },
                                    '& li': {
                                        marginBottom: '0.25rem',
                                    },
                                    '& p, & div': {
                                        display: 'inline',
                                        lineHeight: '1.2',
                                        margin: 0,
                                    },
                                    '& br': {
                                        display: 'inline',
                                    },
                                }}>
                                    <div style={{fontSize: '8pt', display: 'block', lineHeight: '1.2'}}
                                        dangerouslySetInnerHTML={{
                                            __html: `<span>Conducted on ${trainingDate} </span>${normalizeCertContent(certContentHtml)}`
                                        }}
                                    />
                                </Box>
                                <div style={{marginTop: '15px', textAlign:'center', fontSize: '10pt'}}
                                    dangerouslySetInnerHTML={{
                                        __html: `Issued this ${nthDay} day of ${splitMonth}, ${getYear} in Manila City, Philippines`
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    </>
    )
}