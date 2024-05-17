'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import React, { ChangeEvent } from 'react';
import 'animate.css';
import { useEffect, useState } from 'react';
import { Collapse, FormControl, useDisclosure, Table, TableContainer, FormErrorMessage, Thead, Tbody, Td, Tr, Th, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Box, Button, Heading, Text, Container, Radio, RadioGroup, HStack, VStack } from '@chakra-ui/react'
import CourseTable from '@/Components/CourseTable';
import SignatureCanvas from 'react-signature-canvas'
import { TraineeInfo, initTraineeInfo, SelectedCourses, GetCourses, initGetCourses, prioTraineeInfoFields, initTraineeFields} from '@/types/document'
import { generateDateRanges, calculateDates, calculateDiscountedTotalPrice, formatTime, formatDateToWords } from '@/types/handling'
import { getAllRegistrationCourses, firestore, addNewTrainee } from '@/lib/controller'
import { collection, onSnapshot } from 'firebase/firestore'
import TrashIcon from '@/Components/Icons/TrashIcon'
import Loading from '@/Components/Icons/Loading'
import Swal from 'sweetalert2'

export default function NewTrainee() {

    const [file, setFilename] = useState<string>('No file chosen yet...')
    const [validID, setValidID] = useState<File[]>([])

    const [validPfp, setPfp] = useState<File[]>([])
    const [pfpFile, setPfpFile] = useState<string>('No file chosen yet...')

    const [validSignature, setSignature] = useState<File[]>([])
    const [sig_file, setSigFile] = useState<string>('No file chosen yet...')

    const [validPayment, setPayment] = useState<File[]>([])
    const [payment_file, setPaymentFile] = useState<string>('No file chosen yet...')

    const [isLoading, setLoading] = useState<boolean>(false)
    const [coursesAvail, setCoursesAvail] = useState<GetCourses>(initGetCourses)
    const [trainingSched, setTrainingSched] = useState<string[]>([])
    const [trainingDate, setTrainingDate] = useState<string>(''); // State to track training schedule
    const [touchedFields, setTouched] = useState<prioTraineeInfoFields>(initTraineeFields)

    const [modeOfPayment, setModeOfPayment] = useState<string>('')

    const [selectedCourse, setSelectedCourse] = useState<string>('')
    const [traineeType, setTraineeType] = useState<string>('')
    const [vesselType, setVesselType] = useState<string>('')
    const [marketingType, setMarketing] = useState<string>('')
    const [traineeInfo, setTraineeInfo] = useState<TraineeInfo>(initTraineeInfo)
    const [selectedCourses, setSelection] = useState<SelectedCourses[]>([])

    const [preview, setPreview] = useState<string | null>(null)
    const [validProfile, setValidPfp] = useState<string >('')
    const [proof, setProof] = useState<string >('')
    const [valid, setValid] = useState<string >('')
    const [isSignatureValid, setIsSignatureValid] = useState(false);

    const [grant1, setGrant1] = useState<boolean>(false)
    const [grant2, setGrant2] = useState<boolean>(false)
    
    {/** For e-sign */}
    const [sign, setSign] = useState<string | null>('')
    const { isOpen, onOpen, onClose } = useDisclosure()
    let padRef = React.useRef<SignatureCanvas>(null)
    let padRef2 = React.useRef<SignatureCanvas>(null)

    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        const disabled = !touchedFields.srn || !touchedFields.birth_place 
        setIsDisabled(disabled);
    }, [])

    const buttonBg = !touchedFields.srn || !touchedFields.birth_place  ? '#a1a1a1' : '#1C437E';
    const hoverBg = !touchedFields.srn || !touchedFields.birth_place  ? '' : 'blue.600';

    const handleValidID = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            const valid = files[0];
            setFilename(file);
            setValidID(Array.from(files))

            const objectUrl = URL.createObjectURL(valid)
            setValid(objectUrl)
        } else {
            setFilename('No file chosen yet...')
        }
    }

    const handleValid2x2 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            const valid_profile = files[0];
            setPfpFile(file);
            setPfp(Array.from(files))

            const objectUrl = URL.createObjectURL(valid_profile)
            setValidPfp(objectUrl)
        } else {
            setPfpFile('No file chosen yet...')
        }
    }

    const handleProofPayment = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            const proof = files[0];
            setPaymentFile(file);
            setPayment(Array.from(files))

            const objectUrl = URL.createObjectURL(proof)
            setProof(objectUrl)
        } else {
            setPaymentFile('No file chosen yet...')
        }
    }

    const handleValidSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            const signature = files[0];
            setSigFile(file);
            setSignature(Array.from(files));
            setIsSignatureValid(true)

            const objectUrl = URL.createObjectURL(signature)
            setPreview(objectUrl)
        } else {
            setSigFile('No file chosen yet...')
        }
    }

    const handleMoveStep = () => {
        if((traineeInfo.srn === '' || traineeInfo.birth_place === '' ) || (traineeInfo.given_name === '' || traineeInfo.last_name === '' ) || (traineeInfo.birth_date === '' || traineeInfo.company === '' ) || (traineeInfo.address === '' || traineeInfo.phone === '' ) ){
            Swal.fire({
                title: `Please fill out the required fields`,
                showConfirmButton: false,
                timer: 3000,
                icon: 'error',
            })
        } else {
            router.push('new-trainee?registration+step2=')
        }
    }

    {/** For e-sign */}
    const handleGenerate= () =>{
        const url = padRef.current?.getTrimmedCanvas().toDataURL("image/png");
        if (url) setSign(url);
    }
    const handleGenerate2= () =>{
        const url = padRef2.current?.getTrimmedCanvas().toDataURL("image/png");
        if (url) setSign(url);
    }
    const handleClear = () =>{
        padRef.current?.clear();
        setSign('')
    }
    const handleClear2 = () =>{
        padRef2.current?.clear();
        setSign('')
    }

    const router = useRouter();
    const searchParams = useSearchParams()
    const url = `${searchParams}`
    const db = firestore

    const deleteSelectedCourse = (index: number) => {
        setSelection(prevSelectedCourses => prevSelectedCourses.filter((_, i) => i !== index));
    }

    const onBlur = ({target}: React.ChangeEvent<HTMLInputElement>) => 
        setTouched((prev) => ({...prev, [target.id]: true }))  

    const onBlurSelect = ({target}: React.ChangeEvent<HTMLSelectElement>) => 
        setTouched((prev) => ({...prev, [target.id]: true }))  

    const handleSubmit = () => {
        if(grant1 || grant2 || sign !== null)
            router.push('new-trainee?registration+review=')
    } 
    
    const handleSubmitForm = async () => {
        try{
            setLoading(true)
            const newTraineeInfo = {...traineeInfo, traineeType: traineeType, vesselType: vesselType, marketing: marketingType, selectedCourses: selectedCourses}
            await addNewTrainee(newTraineeInfo, validID, file, validPfp, pfpFile, validSignature, sig_file, sign, traineeInfo.given_name, validPayment, payment_file)
        } catch(error){
            throw error
        } finally {
            setLoading(false)
            router.push('new-trainee?registration+completed=')
        }
    } 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setTraineeInfo (prevState => ({
            ...prevState,
            [id]: value
        }))
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;
        setSelectedCourse(value)
        // Check if coursesAvail is an array
        if (Array.isArray(coursesAvail)) {
            // Iterate over each course in coursesAvail
            coursesAvail.forEach(course => {
                if (value === course.id) {
                    if (course.hasPromo) {
                        const dateRange = calculateDates(course.promo.start_date, course.promo.end_date, parseInt(course.promo.numOfPromoDays));
                        setTrainingSched(dateRange);
                    } else {
                        const dateRange = generateDateRanges(course.day, 5, course.numOfDays.toString());
                        setTrainingSched(dateRange);
                    }
                }
            });
        }
    }

    const handleSelectInfo = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;
        setTraineeInfo (prevState => ({
            ...prevState,
            [id]: value
        }))
    }

    const handleCourseSelection = () => {
        let courseSelected: string = '';
        let timeSched: string = '';
        const training_sched = (document.getElementById('trainingDate') as HTMLInputElement).value;
        const payment_mode = modeOfPayment;
    
        let ttl_fee: number = 0;
    
        Object.entries(coursesAvail).forEach(([courseId, course]) => {
            if (selectedCourse === course.id) {
                if (course.hasPromo) {
                    ttl_fee = calculateDiscountedTotalPrice(parseInt(course.course_fee), parseInt(course.promo.rate));
                } else {
                    ttl_fee = parseInt(course.course_fee);
                }
                courseSelected = course.course_name;
                timeSched = course.timeSched;
            }
        });
        
        const isCourseAlreadySelected = selectedCourses.some(course => course.courseSelected === courseSelected);

        if (isCourseAlreadySelected) {
            Swal.fire({
                title: `Oops, you already selected this course`,
                showConfirmButton: false,
                timer: 3000,
                icon: 'error',
            })

            setSelectedCourse('')
            setModeOfPayment('')
            setTrainingDate('')
            return;
        }
        console.log(marketingType)
        const newCourseSelection: SelectedCourses = { courseSelected, training_sched, timeSched, payment_mode, ttl_fee }
        setSelection(prevSelectedCourses => [...prevSelectedCourses, newCourseSelection])
        setSelectedCourse('')
        setModeOfPayment('')
        setTrainingDate('')
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data: GetCourses[] = await getAllRegistrationCourses();
                setCoursesAvail(data as unknown as GetCourses); // Use type assertion to avoid type errors
                setLoading(false); // Data fetching completed, set loading to false
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false); // Set loading to false even if there's an error
            }
        }
        // Fetch initial data
        fetchData();
        // Set up real-time listener for database changes
        const courseCollection = collection(db, 'course_mgmt');
        const unsubscribe = onSnapshot(courseCollection, (snapshot) => {
            fetchData(); // Fetch data again when database changes
        });
        // Clean up subscription
        return () => {
            unsubscribe(); // Unsubscribe from the real-time listener when component unmounts
        };
    }, []);

    return (
        <Container border='0px' maxW='container.lg' mt={5} >
            <section className={`w-full animate__animated animate__fadeInRight ${url === 'registration+review=' || url === 'registration+completed=' ? 'hidden' : ''}`}>
                <Heading as='h3' size='lg' className='text-db mb-2'>Online Registration</Heading>
                <p className='text-slate-950 font-medium mb-2'>We warmly welcome seafarers to our training center.</p>
                <p className='text-slate-950 font-medium mb-2'>We kindly request that you complete the online registration form to facilitate a swift and efficient admissions process.</p>
                {/** Registration type */}
                <section className={`rounded outline outline-2 outline-gray-200 space-y-5 p-7 ${url === 'registration+step2=' || url === 'registration+completed=' || url === 'registration+review=' || url === 'registration=' ? 'hidden' : ''}`}>
                    <Heading as='h4' size='sm' className='text-og text-base font-bold'>What type of trainee are you</Heading>
                    <RadioGroup onChange={setTraineeType}>
                        <VStack spacing={5}>
                            <Box className='w-full px-5 bg-zinc-100 transition ease-in-out delay-150 hover:cursor-pointer hover:-translate-y-3 duration-300' border="1px" borderColor='gray.200'  borderRadius='md' >
                                <Radio w='100%' value='new'>
                                    <Text className='w-full py-5 px-2' fontSize='sm'>New</Text>
                                </Radio>
                            </Box>
                            <Box className='w-full px-5 bg-zinc-100 transition ease-in-out delay-150 hover:cursor-pointer hover:-translate-y-3 duration-300' border='1px' borderColor='gray.200' borderRadius='md' >
                                <Radio w='100%' value='reEnrolled'>
                                    <Text className='w-full py-5 px-2' fontSize='sm'>Re-Enrolled</Text>
                                </Radio>
                            </Box>
                        </VStack>
                    </RadioGroup>
                    <Collapse in={traineeType !== ''} animateOpacity>
                        <Button onClick={() => {router.push('new-trainee?registration')}} borderRadius='base' bg='#1C437E' _hover={{ bg: 'blue.600' }} className=' animate__animated animate__fadeInDown' fontSize='xs' color='white' >Proceed Registration
                        <Image src='/icons/next.png' className='ms-2' alt='next-arrow' width={24} height={24}/>
                        </Button>
                    </Collapse>
                </section>
                {/** First Registration Step */}
                <section className={`pb-5 space-y-5 ${url === 'registration=' ? ' ' : (url === 'registration+review=' || url === 'registration+completed=' || url === 'registration+step2=') ? 'hidden' : 'hidden'}`}>
                    <section className='rounded outline outline-2 outline-gray-200 space-y-8 p-7 animate__animated animate__fadeInRight'>
                        <Box className='flex space-y-8 md:space-x-2 flex-col md:flex-row items-center justify-between'>
                            <Box className='flex items-center w-full md:w-auto'>
                                <Image src="/icons/list.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Trainee's Information`}</Heading>
                            </Box>
                            {/** SRN */}
                            <Box className='input-grp w-full md:w-auto'>
                                <FormControl isRequired isInvalid={touchedFields.srn && !traineeInfo.srn }>
                                    <Input id='srn' onChange={handleChange} onBlur={onBlur} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                    <label htmlFor='srn' className='form-label'>SRN# </label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>SRN is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                        </Box>
                        {/** Name */}
                        <Box className='flex space-y-8 md:space-y-0 md:space-x-4 flex-col md:flex-row items-center justify-between '>
                            <Box className='input-grp' w='100%' >
                                <FormControl isRequired isInvalid={touchedFields.last_name && !traineeInfo.last_name }>
                                    <Input id='last_name' onChange={handleChange} onBlur={onBlur} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off-auto'  _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                    <label htmlFor='last_name' className='form-label'>Last Name</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Last name is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={touchedFields.given_name && !traineeInfo.given_name }>
                                    <Input id='given_name' onChange={handleChange} onBlur={onBlur} placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='given_name' className='form-label'>Given Name</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Given name is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl>
                                    <Input id='middle_name' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='middle_name' className='form-label'>Middle Name</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full md:w-1/3'>
                                <FormControl>
                                    <Input id='suffix' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='suffix' className='form-label'>Suffix</label>
                                </FormControl>
                            </Box> 
                        </Box>
                        {/** Seafarer details */}
                        <Box className='flex items-center justify-between space-y-8 md:space-y-0 md:space-x-4 flex-col md:flex-row'>
                            <Box className='input-grp' w='100%' >
                                <FormControl isRequired isInvalid={touchedFields.rank && !traineeInfo.rank }>
                                    <Input id='rank' onChange={handleChange} onBlur={onBlur} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off-auto'  _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                    <label htmlFor='rank' className='form-label'>Rank</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Your Rank is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl  isRequired isInvalid={touchedFields.company && !traineeInfo.company }>
                                    <Input id='company' onChange={handleChange} onBlur={onBlur} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs'    size='lg' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='company' className='form-label'>Company</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Company is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <FormControl isRequired w='100%' className='hidden md:flex'>
                                <HStack spacing={'0'}>
                                    <Text as='legend' w='90px' style={{fontSize: '10px', fontWeight: '700', margin: '0px'}}>Type of Vessel:</Text>
                                    <RadioGroup onChange={setVesselType}>
                                        <HStack spacing={'4'}>
                                            <Radio w='100%' value='Container' size='sm'>
                                                <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Container</Text>
                                            </Radio>
                                            <Radio w='100%' value='Bulk' size='sm'>
                                                <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Bulk</Text>
                                            </Radio>
                                            <Radio w='100%' value='Tanker' size='sm'>
                                                <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Tanker</Text>
                                            </Radio>
                                            <Radio w='100%' value='Passenger' size='sm'>
                                                <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Passenger</Text>
                                            </Radio>
                                        </HStack>
                                    </RadioGroup>
                                </HStack>
                            </FormControl>
                            <FormControl isRequired w='100%' className='md:hidden '>
                                <VStack spacing={'0'} align='stretch'>
                                    <Text as='legend' w='90px' style={{fontSize: '10px', fontWeight: '700', margin: '0px'}}>Type of Vessel:</Text>
                                    <RadioGroup onChange={setVesselType}>
                                        <VStack spacing={'4'}>
                                            <Radio w='100%' value='Container' size='sm'>
                                                <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Container</Text>
                                            </Radio>
                                            <Radio w='100%' value='Bulk' size='sm'>
                                                <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Bulk</Text>
                                            </Radio>
                                            <Radio w='100%' value='Tanker' size='sm'>
                                                <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Tanker</Text>
                                            </Radio>
                                            <Radio w='100%' value='Passenger' size='sm'>
                                                <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Passenger</Text>
                                            </Radio>
                                        </VStack>
                                    </RadioGroup>
                                </VStack>
                            </FormControl>
                            <Box className='input-grp w-full md:w-1/2'>
                                <FormControl>
                                    <Input id='others' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='others' className='form-label'>Others</label>
                                </FormControl>
                            </Box> 
                        </Box>
                        {/** Address Row */}
                        <Box className='flex items-center justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={touchedFields.address && !traineeInfo.address }>
                                    <Input id='address' onChange={handleChange} onBlur={onBlur} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='address' className='form-label'>Address</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Address is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                        </Box>
                        {/** Other Supporting Details */}
                        <Box className='flex items-center justify-between flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={touchedFields.phone && !traineeInfo.phone }>
                                    <Input id='phone' onChange={handleChange} onBlur={onBlur} placeholder='' type='tel' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='phone' className='form-label'>Contact Number</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Contact Number is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={touchedFields.email && !traineeInfo.email }>
                                    <Input id='email' onChange={handleChange} onBlur={onBlur} placeholder='' type='email' className='p-3 form-input' autoComplete='off' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='email' className='form-label'>Email</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Email is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={touchedFields.nationality && !traineeInfo.nationality }>
                                    <Input id='nationality' onChange={handleChange} onBlur={onBlur} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='nationality' className='form-label'>Nationality</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Nationality is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                        </Box>
                        {/** Other details p3 */}
                        <Box className='flex items-center justify-between flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-4'>    
                            <Box className='input-grp w-full '>
                                <select id='gender' onChange={handleSelectInfo} onBlur={onBlurSelect} className={`${(touchedFields.gender && !traineeInfo.gender) ? 'border-2 border-red-500' : ''} drop form-input w-full`} defaultValue='' required>
                                    <option value='' hidden disabled>Select Gender</option>
                                    <option value='male'>Male</option>
                                    <option value='female'>Female</option>
                                </select>
                                {touchedFields.gender && !traineeInfo.gender ? <span className='w-full text-xs flex justify-end font-normal text-red-500 py-1'>Please select your gender</span> : ''}
                            </Box>
                            <Box className='flex w-full items-center justify-around space-x-4 position-relative '>
                                <Text className='position-absolute text-gray text-xs w-2/5 text-end'>Date of Birth:</Text>
                                <Box className='input-grp w-full'>
                                    <input id='birth_date' onChange={handleChange} onBlur={onBlur} type='date' className={`${touchedFields.birth_date && !traineeInfo.birth_date ? 'border-2 border-red-500' : 'border-slate-500 border-2'} p-3  w-full rounded `} required/>
                                    {touchedFields.birth_date && !traineeInfo.birth_date ? <span className='w-full text-xs flex justify-end font-normal text-red-500 py-1'>Birth date is required</span> : ''}
                                </Box>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={touchedFields.birth_place && !traineeInfo.birth_place }>
                                    <Input id='birth_place' onChange={handleChange} onBlur={onBlur} placeholder='' type='text' className='p-3 form-input' autoComplete='off' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='birth_place' className='form-label'>Birth Place</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Birth Place is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                        </Box>
                    </section>
                    {/** Emergency Contact */}
                    <section className='rounded outline outline-2 outline-gray-200 space-y-8 p-7 animate__animated animate__fadeInLeftBig'>
                        <Box className='flex space-x-2 items-center '>
                            <Image src="/icons/emergency.png" alt="School Logo" width={24} height={24} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`In Case of Emergency, Please Contact`}</Heading>
                        </Box>
                        <Box className='flex items-center justify-between flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-4'>
                            {/** Contact Person */}
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='contact_person' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='contact_person' className='form-label'>Contact Person</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='contact' onChange={handleChange} placeholder='' type='tel' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='contact' className='form-label'>Contact Number</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='relationship' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='relationship' className='form-label'>Relationship</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='contact_address' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='contact_address' className='form-label'>Address</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box> 
                        </Box>
                    </section>    
                    {/** Endorser */}
                    <section className='rounded outline outline-2 outline-gray-200 space-y-8 p-7 animate__animated animate__fadeInRight'>
                        <Box className='flex space-x-2 items-center '>
                            <Image src="/icons/list.png" alt="School Logo" width={24} height={24} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Endorserd By`}</Heading>
                        </Box>
                        <Box className='flex items-center justify-between flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-4'>
                            {/** Endorser Person */}
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='endorsed_company' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='endorsed_company' className='form-label'>Compant/Department of Endorser</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='endorser' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='endorser' className='form-label'>Name of Endorser</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='endorser_phone' onChange={handleChange} placeholder='' type='tel' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='endorser_phone' className='form-label'>{`Endorser's Contact No.`}</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box>
                        </Box>
                    </section>
                    <Box className='w-full flex justify-end'>
                        <Collapse in={traineeType !== ''} animateOpacity>
                            <Button type='submit' onClick={handleMoveStep}  borderRadius='base' bg={buttonBg} _hover={hoverBg} className=' animate__animated animate__fadeInDown' fontSize='xs' color='white' >Proceed <Image src='/icons/next.png' className='ms-2' alt='next-arrow' width={24} height={24}/></Button>
                        </Collapse>
                    </Box>
                </section>  
                {/** Second Registration Step */}
                <section className={`pb-5 space-y-5 ${url === 'registration+step2=' ? '' : (url === 'registration=' || url === 'registration+review=' || url === 'registration+completed=') ? 'hidden' : 'hidden'}`}>
                    <section className='rounded outline outline-2 outline-gray-200 space-y-8 p-7 animate__animated animate__fadeInRight'>
                        <Box className='flex space-x-2 items-center '>
                            <Image src="/icons/course.png" alt="School Logo" width={24} height={24} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Select Course(s):`}</Heading>
                        </Box>
                        <Box className='w-full flex items-center flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-3'>
                            <Box className='input-grp w-full'>
                                <label>Course</label>
                                <select id='course' onChange={handleSelect} value={selectedCourse} className='drop form-input w-full' required>
                                    <option value='' disabled hidden>Select Course</option>
                                    {Array.isArray(coursesAvail) ? (
                                        coursesAvail.map((courseKey) => (
                                            <option key={courseKey.id} value={courseKey.id}>
                                                {courseKey.course_name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No courses available</option>
                                    )}
                                </select>
                            </Box>
                            <Box className='input-grp w-full md:w-4/6'>
                                <label>Training Date</label>
                                <select id='trainingDate' value={trainingDate} className='drop form-input w-full' onChange={(e) => setTrainingDate(e.target.value)}>
                                    <option value='' disabled hidden>Select Training Date</option>
                                    {trainingSched.map((date, index) => (
                                        <option key={index} style={{ paddingTop: '2px', fontSize: '0.9rem',}}>
                                            {date}
                                        </option>
                                    ))}
                                </select>
                            </Box>
                            <Box className='flex flex-col w-full justify-start'>
                                <VStack spacing={'0'}>
                                    <label className='w-full '>Mode of Payment</label>
                                    <RadioGroup w='100%' className='items-center' id='mode_of_payment' value={modeOfPayment} onChange={setModeOfPayment}>
                                        <HStack spacing={'4'} className='justify-center py-1'>
                                            <Radio value='Crew Charge' size='sm'>
                                                <Text className='py-3 px-1' fontWeight='medium' fontSize='xs'>Crew Charge</Text>
                                            </Radio>
                                            <Radio value='Company Charge' size='sm'>
                                                <Text className=' py-3 px-1' fontWeight='medium' fontSize='xs'>Company Charge</Text>
                                            </Radio>
                                        </HStack>
                                    </RadioGroup>
                                </VStack>
                            </Box>
                            <Box className='flex w-full md:w-1/2 items-center'> 
                                <button onClick={() => {handleCourseSelection()}} disabled={!modeOfPayment || !trainingDate } className='addCourse flex justify-center items-center animate__animated animate__fadeInDown' >
                                    <Image src='/icons/add-course.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                                    <span className='md:w-full'>Add Course</span>
                                </button>
                            </Box>
                        </Box>
                        <Box className='hidden md:flex flex-col' >
                            <Text as='b' color='#a1a1a1' >Your Courses</Text>
                            {selectedCourses.map((course, index) => (
                                <Box key={index} className='flex justify-evenly rounded border-2 mb-4 border-slate-300 p-4'>
                                    <Box className='flex flex-col w-full'>
                                        <Text color='#a1a1a1'>Course:</Text>
                                        <Text >{course.courseSelected}</Text>
                                    </Box>
                                    <Box className='flex flex-col w-full'>
                                        <Text color='#a1a1a1'>Training Schedule:</Text>
                                        <Text >{course.training_sched} </Text>
                                        <Text>{formatTime(course.timeSched)}</Text>
                                    </Box>
                                    <Box className='flex flex-col w-full'>
                                        <Text color='#a1a1a1'>Payment Mode:</Text>
                                        <Text >{course.payment_mode}</Text>
                                    </Box>
                                    <Box className='flex flex-col w-full'>
                                        <Text color='#a1a1a1'>Course Fee:</Text>
                                        <Text >{course.payment_mode === 'Company Charge' ? '--' : `Php ${course.ttl_fee}.00`}</Text>
                                    </Box>
                                    <Box className='px-4'><button className='w-fit h-fit' onClick={() => deleteSelectedCourse(index)}><TrashIcon /></button></Box>
                                </Box>
                            ))}
                        </Box>
                        <Box className='md:hidden space-y-4' >
                            <Text as='b' color='#a1a1a1' >Your Courses</Text>
                            {selectedCourses.map((course, index) => (
                                <Box key={index} className='flex justify-between rounded border-2 border-slate-300 p-2'>
                                    <Box  className='space-y-3'>
                                        <Box className='flex flex-col '>
                                            <Text color='#a1a1a1'>Course:</Text>
                                            <Text >{course.courseSelected}</Text>
                                        </Box>
                                        <Box className='flex flex-col w-full'>
                                            <Text color='#a1a1a1'>Training Schedule:</Text>
                                            <Text >{course.training_sched} </Text>
                                            <Text>{formatTime(course.timeSched)}</Text>
                                        </Box>
                                        <Box className='flex flex-col '>
                                            <Text color='#a1a1a1'>Payment Mode:</Text>
                                            <Text >{course.payment_mode}</Text>
                                        </Box>
                                        <Box className='flex flex-col '>
                                            <Text color='#a1a1a1'>Course Fee:</Text>
                                            <Text >Php {course.payment_mode === 'Company Charge' ? '--' : course.ttl_fee}.00</Text>
                                        </Box>
                                    </Box>
                                    <Text ><button className='w-fit h-fit' onClick={() => deleteSelectedCourse(index)}><TrashIcon /></button></Text>
                                </Box>
                            ))}
                        </Box>
                    </section>
                    <section className='rounded outline outline-2 outline-gray-200 space-y-8 p-7 animate__animated animate__fadeInLeft'>
                        <Box className='flex flex-col space-y-4'>
                            <Box className='flex'>
                                <Image src="/icons/attachment.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Attachments:`}</Heading>
                            </Box>
                            <Box className='space-y-4'>
                                <FormControl className='flex flex-col space-y-1'>
                                    <label>Please upload Valid ID <span className='italic' style={{fontSize: '9px'}}>(Preferably: Passport ID)</span></label>
                                    <input type='file' onChange={handleValidID} className='w-full md:w-1/2' accept='.png, .jpg' />
                                </FormControl>
                                <FormControl className='flex flex-col space-y-1'>
                                    <label>Please upload a 2x2 ID photo. <span className='italic' style={{fontSize: '9px'}}>(Note: Ensure photo is clear, and wear your uniform.)</span></label>
                                    <input type='file' onChange={handleValid2x2} className='w-full md:w-1/2' accept='.png, .jpg' />
                                </FormControl>
                                <FormControl className='flex flex-col space-y-1'>
                                    <label>Please upload your proof of payment. <span className='italic' style={{fontSize: '9px'}}>(Note: screenshot or photo.)</span></label>
                                    <input type='file' onChange={handleProofPayment} className='w-full md:w-1/2' accept='.png, .jpg' />
                                </FormControl>
                                <FormControl className='flex w-full flex-col space-y-1'>
                                    <label>{`Click "Create E-Signature" to upload digital signature or just send a photo of your written signature.`}</label>
                                    <Box className='flex w-full items-center flex-col md:flex-row md:space-x-8 '>
                                        <Box className='flex flex-col space-y-1'>
                                            <label>Please attach your written signature here. <span className='italic' style={{fontSize: '9px'}}>(Note: photo must be clear.)</span></label>
                                            <input disabled={sign !== ''} type='file' onChange={handleValidSignature} accept='.png, .jpg' />
                                        </Box>
                                        <Text fontSize='lg'>or</Text>
                                        <Button isDisabled={isSignatureValid} borderRadius='base' bg='#1C437E' _hover={{ bg: 'blue.600' }} fontSize='xs' color='white' className='w-full md:w-1/4' onClick={onOpen}>
                                            <Image src='/icons/sign.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                                            <span>Create E-Signature</span>
                                        </Button>
                                    </Box>
                                    <Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
                                        <ModalOverlay />
                                        <ModalContent>
                                            <ModalHeader>Kindly provide your e-signature here</ModalHeader>
                                            <ModalCloseButton />
                                            <ModalBody>
                                                <Box className='hidden md:flex'>
                                                    <div className='border rounded border-black' style={{width: '100%'}}>
                                                        <SignatureCanvas canvasProps={{width: 460, 
                                                            height: 200, className: 'sigCanvas'}} ref={padRef} />
                                                    </div>
                                                </Box>
                                                <Box className='md:hidden'>
                                                    <div className='border rounded border-black' style={{width: '100%'}}>
                                                        <SignatureCanvas canvasProps={{width: 340, 
                                                            height: 200, className: 'sigCanvas'}} ref={padRef2} />
                                                    </div>
                                                </Box>
                                            </ModalBody>
                                            <ModalFooter className='space-x-3'>
                                                <button className='rounded p-2 flex items-center justify-center outline outline-2 outline-gray-700 text-black' style={{height:"30px",width:"60px"}} onClick={onClose}>Close</button>
                                                <button className='rounded p-2 items-center justify-center outline outline-2 outline-gray-700 text-black hidden md:flex' style={{height:"30px",width:"60px"}} onClick={handleClear}>Clear</button>
                                                <button className='rounded p-2 flex items-center justify-center outline outline-2 outline-gray-700 text-black md:hidden' style={{height:"30px",width:"60px"}} onClick={handleClear2}>Clear</button>
                                                <button className='rounded p-2 items-center justify-center bg-gray-700 text-white outline outline-2 outline-gray-700 hidden md:flex' style={{height:"30px",width:"120px"}} onClick={() => {handleGenerate(); onClose();}}>Save signature</button>
                                                <button className='rounded p-2 flex items-center justify-center bg-gray-700 text-white outline outline-2 outline-gray-700 md:hidden' style={{height:"30px",width:"120px"}} onClick={() => {handleGenerate2(); onClose();}}>Save signature</button>
                                            </ModalFooter>
                                        </ModalContent>
                                    </Modal>
                                </FormControl>
                            </Box>
                        </Box>
                    </section>
                    <section className='rounded outline outline-2 outline-gray-200 space-y-8 p-7 animate__animated animate__fadeInRight'>
                        <Box className='flex items-start flex-col space-y-4'>
                            <Box className='flex'>
                                <Image src="/icons/list.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`How did you find out about Pentagon?`}</Heading>
                            </Box>
                            <FormControl isRequired w='100%' className='flex md:flex-row flex-col md:space-x-3 space-y-8 md:space-y-0'>
                                <Box className='hidden md:flex md:w-full space-x-6'>
                                    <HStack spacing={'0'} w='100%' >
                                        <RadioGroup onChange={setMarketing}  w='100%' className='flex justify-evenly'>
                                            <HStack spacing={'4'} w='100%' className='flex justify-evenly'>
                                                <Box className='p-3 rounded w-full bg-slate-50 border border-slate-200'>
                                                    <Radio w='100%' value='agent' size='sm'>
                                                        <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>By Agent</Text>
                                                    </Radio>
                                                </Box>
                                                <Box className='p-3 rounded w-full bg-slate-50 border border-slate-200'>
                                                    <Radio w='100%' value='company' size='sm'>
                                                        <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Company</Text>
                                                    </Radio>
                                                </Box>
                                                <Box className='p-3 rounded w-full bg-slate-50 border border-slate-200'>
                                                    <Radio w='100%' value='walk-in' size='sm'>
                                                        <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Walk-in</Text>
                                                    </Radio>
                                                </Box>
                                                <Box className='p-3 rounded w-full bg-slate-50 border border-slate-200'>
                                                    <Radio w='100%' value='soc-med' size='sm'>
                                                        <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Social Media</Text>
                                                    </Radio>
                                                </Box>
                                            </HStack>
                                        </RadioGroup>
                                    </HStack>
                                </Box>
                                <FormControl isRequired w='100%' className='md:hidden '>
                                    <VStack spacing={'0'} align='stretch'>
                                        <RadioGroup onChange={setMarketing} value={marketingType}>
                                            <VStack spacing={'4'}>
                                                <Box className='p-3 rounded w-full bg-slate-50 border border-slate-200'>
                                                    <Radio w='100%' value='agent' size='sm'>
                                                        <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>By Agent</Text>
                                                    </Radio>
                                                </Box>
                                                <Box className='p-3 rounded w-full bg-slate-50 border border-slate-200'>
                                                    <Radio w='100%' value='company' size='sm'>
                                                        <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Company</Text>
                                                    </Radio>
                                                </Box>
                                                <Box className='p-3 rounded w-full bg-slate-50 border border-slate-200'>
                                                    <Radio w='100%' value='walk-in' size='sm'>
                                                        <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Walk-in</Text>
                                                    </Radio>
                                                </Box>
                                                <Box className='p-3 rounded w-full bg-slate-50 border border-slate-200'>
                                                    <Radio w='100%' value='soc-med' size='sm'>
                                                        <Text className='w-full py-3 px-1' fontWeight='medium' fontSize='xs'>Social Media</Text>
                                                    </Radio>
                                                </Box>
                                            </VStack>
                                        </RadioGroup>
                                    </VStack>
                                </FormControl>
                                <Box className='input-grp w-full md:w-1/2'>
                                    <FormControl>
                                        <Input id='others' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='others' className='form-label'>Others</label>
                                    </FormControl>
                                </Box> 
                            </FormControl>
                        </Box>
                    </section>
                    <section className='rounded outline outline-2 outline-gray-200 space-y-8 p-7 animate__animated animate__fadeInRight'>
                        <Box className='flex items-start flex-col space-y-4'>
                            <Box className='flex'>
                                <Image src="/icons/policy.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Privacy Policy`}</Heading>
                            </Box>
                            <Box className='flex flex-col space-y-3' color='#a1a1a1'>
                                <Text>Pentagon Maritime Services Corp. are committed to ensuring the confidentiality of your information under Republic Act No. 10173 of the “Data Privacy Act of 2012” and will exert reasonable efforts to protect against its unauthorized use or disclosure.</Text>
                                <Text>{`In compliance with the requirements of the Data Privacy Act and it's implementing rules and regulations, we would like to inform you how we handle and protect the data you provide in the course of your transaction/s with PENTAGON.`}</Text>
                                <Text>{`These data, which include your personal or sensitive personal information may be collected, processed, stored, updated to the information and data base of Pentagon in strict confidence:`}</Text>
                                <Text>{`i.) for legitimate purposes,`}</Text>
                                <Text>{`ii.) to implement transaction/s which you request, allow or authorize,`}</Text>
                                <Text>{`iii.) to offer and provide new or related products and services of PENTAGON,`}</Text>
                                <Text>{`iv.) to comply with PENTAGON policies and it’s reporting obligations under applicable laws.`}</Text>
                                <label className='text-xs flex items-center'>
                                    <input type='checkbox' className='mr-2' onClick={(e) => setGrant1(!grant1)}/>
                                    <Box>
                                        <Text>
                                        I understand, that Pentagon Maritime Services Corp. shall keep my personal data and information in strict confidence and that the collection and processing of my personal data/information shall be used only for my enrollment, training and certification.
                                        </Text>
                                    </Box>
                                </label>
                                <label className='text-xs flex items-center'>
                                    <input type='checkbox' className='mr-2' onClick={(e) => setGrant2(!grant2)} />
                                    <Box>
                                        <Text>
                                        I hereby certify that I have read and understood the above and hereby consent to, agree on, accept and acknowledge these terms.
                                        </Text>
                                    </Box>
                                </label>
                            </Box>
                        </Box>
                    </section>
                    <Box className='w-full flex justify-end'>
                        {isSignatureValid ? <button onClick={(e) => handleSubmit()} className={` ${(!grant1 || !grant2 || !isSignatureValid) ? 'hover:cursor-no-drop btn-primary-disable' : 'btn-primary'} rounded flex justify-center items-center animate__animated animate__fadeInDown `} disabled={!grant1 || !grant2 || !isSignatureValid } >
                            <Image src='/icons/review.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                            <span className='w-full'>Review Registration Form</span>
                        </button>
                        :
                        <button onClick={(e) => handleSubmit()} className={` ${(!grant1 || !grant2 || sign === null ) ? 'hover:cursor-no-drop btn-primary-disable' : 'btn-primary'} rounded flex justify-center items-center animate__animated animate__fadeInDown `} disabled={!grant1 || !grant2 || sign === null } >
                            <Image src='/icons/review.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                            <span className='w-full'>Review Registration Form</span>
                        </button>}
                    </Box>
                </section>  
            </section>
            {/** Review Form */} 
            <section className={`pb-5 flex flex-col place-items-center space-y-5 ${url === 'registration+review=' ? ' ' : (url === 'registration+completed=' || url === 'registration=' || url === 'registration+step2=') ? 'hidden' : 'hidden'}`}>
                <section className='rounded w-full outline outline-2 outline-gray-200 space-y-8 p-7 animate__animated animate__fadeInRight'>
                    <Box className='flex items-center '>
                        <Image src="/icons/sign-blue.png" alt="School Logo" width={24} height={24} />
                        <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Review your Form`}</Heading>
                    </Box>
                    <Box>
                        <Box className='flex flex-col space-y-5'>
                            <Box className='flex flex-col md:flex-row space-y-3 md:space-y-0 justify-between md:space-x-4'>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Trainee Type:</Text>
                                    <Text>{traineeType === 'new' ? 'New Trainee' : 'Re-Enrolled Trainee'}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>SRN:</Text>
                                    <Text>{traineeInfo.srn}</Text>
                                </Box>
                            </Box>
                            <Box className='flex flex-col md:flex-row space-y-3 md:space-y-0 justify-between md:space-x-4'>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Last Name:</Text>
                                    <Text>{traineeInfo.last_name}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Given Name:</Text>
                                    <Text>{traineeInfo.given_name}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Middle Name:</Text>
                                    <Text>{traineeInfo.middle_name !== '' ? traineeInfo.middle_name : 'NA'}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Suffix:</Text>
                                    <Text>{traineeInfo.suffix !== '' ? traineeInfo.suffix : 'NA'}</Text>
                                </Box>
                            </Box>
                            <Box className='flex flex-col md:flex-row space-y-3 md:space-y-0 justify-between md:space-x-4'>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Rank:</Text>
                                    <Text >{traineeInfo.rank}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text  color='#a1a1a1'>Company:</Text>
                                    <Text >{traineeInfo.company}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Vessel Type:</Text>
                                    <Text >{vesselType !== '' ? vesselType : traineeInfo.others}</Text>
                                </Box>
                            </Box>
                            <Box className='flex justify-between space-x-4'>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Address:</Text>
                                    <Text>{traineeInfo.address}</Text>
                                </Box>
                            </Box>
                            <Box className='flex flex-col md:flex-row space-y-3 md:space-y-0 justify-between md:space-x-4'>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Contact No.:</Text>
                                    <Text>{traineeInfo.phone}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Email:</Text>
                                    <Text>{traineeInfo.email}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Nationality:</Text>
                                    <Text>{ traineeInfo.nationality }</Text>
                                </Box>
                            </Box>
                            <Box className='flex flex-col md:flex-row space-y-3 md:space-y-0 justify-between md:space-x-4'>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Gender:</Text>
                                    <Text>{traineeInfo.gender.toUpperCase()}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Date of Birth:</Text>
                                    <Text>{formatDateToWords(traineeInfo.birth_date)}</Text>
                                </Box>
                                <Box className='flex w-full space-x-4'>
                                    <Text color='#a1a1a1'>Place of Birth:</Text>
                                    <Text>{ traineeInfo.birth_place }</Text>
                                </Box>
                            </Box>
                            <Box className='flex justify-between flex-col space-y-2'>
                                <Box className='flex space-x-4'>
                                    <Text color='#a1a1a1'>Emergency Contact</Text>
                                </Box>
                                <Box className='flex flex-col md:flex-row space-y-3 md:space-y-0 justify-between md:space-x-4'>
                                    <Box className='flex w-full space-x-4'>
                                        <Text color='#a1a1a1'>Contact Person:</Text>
                                        <Text>{traineeInfo.contact_person}</Text>
                                    </Box>
                                    <Box className='flex w-full space-x-4'>
                                        <Text color='#a1a1a1'>Contact Number:</Text>
                                        <Text>{traineeInfo.contact}</Text>
                                    </Box>
                                    <Box className='flex w-full space-x-4'>
                                        <Text color='#a1a1a1'>Relationship:</Text>
                                        <Text>{ traineeInfo.relationship }</Text>
                                    </Box>
                                    <Box className='flex w-full space-x-4'>
                                        <Text color='#a1a1a1'>Address:</Text>
                                        <Text>{ traineeInfo.contact_address }</Text>
                                    </Box>
                                </Box>
                            </Box>
                            <Box className='flex justify-between flex-col space-y-2'>
                                <Box className='flex space-x-4'>
                                    <Text color='#a1a1a1'>Endorsed By</Text>
                                </Box>
                                <Box className='flex flex-col md:flex-row space-y-3 md:space-y-0 justify-between md:space-x-4'>
                                    <Box className='flex w-full space-x-4'>
                                        <Text color='#a1a1a1'>Endorser:</Text>
                                        <Text>{traineeInfo.endorser}</Text>
                                    </Box>
                                    <Box className='flex w-full space-x-4'>
                                        <Text color='#a1a1a1'>Company:</Text>
                                        <Text>{traineeInfo.endorsed_company}</Text>
                                    </Box>
                                    <Box className='flex w-full space-x-4'>
                                        <Text color='#a1a1a1'>Contact No.:</Text>
                                        <Text>{ traineeInfo.endorser_phone }</Text>
                                    </Box>
                                </Box>
                            </Box>
                            <Box className='hidden md:flex flex-col' >
                                <Text as='b' color='#a1a1a1' >Your Courses</Text>
                                {selectedCourses.map((course, index) => (
                                    <Box key={index} className='flex justify-evenly rounded border-2 mb-4 border-slate-300 p-4'>
                                        <Box className='flex flex-col w-full'>
                                            <Text color='#a1a1a1'>Course:</Text>
                                            <Text >{course.courseSelected}</Text>
                                        </Box>
                                        <Box className='flex flex-col w-full'>
                                            <Text color='#a1a1a1'>Training Schedule:</Text>
                                            <Text >{course.training_sched} </Text>
                                            <Text>{formatTime(course.timeSched)}</Text>
                                        </Box>
                                        <Box className='flex flex-col w-full'>
                                            <Text color='#a1a1a1'>Payment Mode:</Text>
                                            <Text >{course.payment_mode}</Text>
                                        </Box>
                                        <Box className='flex flex-col w-full'>
                                            <Text color='#a1a1a1'>Course Fee:</Text>
                                            <Text >{course.payment_mode === 'Company Charge' ? '--' : `Php ${course.ttl_fee}.00`}</Text>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            <Box className='md:hidden space-y-4' >
                                <Text as='b' color='#a1a1a1' >Your Courses</Text>
                                {selectedCourses.map((course, index) => (
                                    <Box key={index} className='flex justify-between rounded border-2 border-slate-300 p-2'>
                                        <Box  className='space-y-3'>
                                            <Box className='flex flex-col '>
                                                <Text color='#a1a1a1'>Course:</Text>
                                                <Text >{course.courseSelected}</Text>
                                            </Box>
                                            <Box className='flex flex-col w-full'>
                                                <Text color='#a1a1a1'>Training Schedule:</Text>
                                                <Text >{course.training_sched} </Text>
                                                <Text>{formatTime(course.timeSched)}</Text>
                                            </Box>
                                            <Box className='flex flex-col '>
                                                <Text color='#a1a1a1'>Payment Mode:</Text>
                                                <Text >{course.payment_mode}</Text>
                                            </Box>
                                            <Box className='flex flex-col '>
                                                <Text color='#a1a1a1'>Course Fee:</Text>
                                                <Text >Php {course.payment_mode === 'Company Charge' ? '--' : course.ttl_fee}.00</Text>
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            <Box className='flex justify-between flex-col space-y-2'>
                                <Box className='flex justify-between flex-col space-y-4'>
                                    <Box className='flex w-full space-x-4'>
                                        <Text color='#a1a1a1'>How did you find out about Pentagon?:</Text>
                                        <Text >{marketingType === 'company' ? 'Company': marketingType === 'agent' ? 'By Agent' : marketingType === 'walk-in' ? 'Walk-In' : marketingType === 'soc-med' ? 'Social Media' : ''}</Text>
                                    </Box>
                                    <Box className='flex flex-col md:flex-row justify-between w-full'>
                                        <Box className='flex flex-col w-full'>
                                            <Text color='#a1a1a1'>Valid ID:</Text>
                                            <Image src={valid as string} width={150} height={150} alt='image' />
                                        </Box>
                                        <Box className='flex flex-col w-full'>
                                            <Text color='#a1a1a1'>2x2 ID Picture:</Text>
                                            <Image src={validProfile as string} width={150} height={150} alt='image' />
                                        </Box> 
                                    </Box>
                                    <Box className='flex flex-col md:flex-row justify-between w-full'>
                                        <Box className='flex flex-col w-full'>
                                            <Text color='#a1a1a1'>Signature:</Text>
                                            {validSignature.length > 0 ? <Image src={preview as string} width={150} height={150} alt='image' /> : <Image src={sign as string} width={150} height={150} alt='image' />}
                                        </Box>
                                        <Box className='flex flex-col w-full'>
                                            <Text color='#a1a1a1'>Proof of Payment:</Text>
                                            <Image src={proof as string} width={150} height={150} alt='image' />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </section>
                <Box className='w-full flex flex-col md:flex-row space-y-4 md:space-y-0 justify-between'>
                    <button onClick={() => {router.push('new-trainee?registration+step2=')}} className={`btn-primary-outline rounded w-full md:w-auto flex justify-center items-center animate__animated animate__fadeInDown `} >
                        <span className='text-blue-600'>{`<< Go back`}</span>
                    </button>
                    <button onClick={() => {handleSubmitForm()}} className={`btn-primary rounded w-full md:w-auto flex justify-center items-center animate__animated animate__fadeInDown `} >
                        { isLoading ? (
                            <>
                                <Loading /> 
                                <span>Submitting Form</span>
                            </>
                        ):( 
                            <> 
                                <Image src='/icons/submit.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                                <span className=''>Submit Registration Form</span>
                            </>
                        )}
                    </button>
                </Box>
            </section> 
            {/** Completed UI */} 
            <section className={`pb-5 flex flex-col place-items-center space-y-5 ${url === 'registration+completed=' ? ' ' : (url === 'registration=' || url === 'registration+step2=' || url === 'registration+review=') ? 'hidden' : 'hidden'}`}>
                <Box className='w-3/5'>
                    <Heading as='h1' size='xl' className='text-db w-full text-center mb-2'>Thank You!</Heading>
                    <Text fontSize='md' className='text-db w-full uppercase text-center'>{`Thank you for your registration! We'll reach out to you soon via phone or email.`}</Text>
                </Box>
                <Image src='/icons/check.png' className='me-2' alt='next-arrow' width={180} height={180}/>
                <Box className='w-3/5 place-items-center space-y-3'>
                    <Text fontSize='md' className='text-db w-full uppercase text-center'>{` For any urgent concerns, feel free to contact us.`}</Text>
                    <Box className=' space-y-3 flex flex-col place-items-center'>
                        <Box className='flex space-x-1 justify-center items-center'>
                            <Image src='/icons/phone.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                            <Text fontSize='md' className='text-db w-full uppercase text-center'>{` 0999 513 5916`}</Text>
                        </Box>
                        <Box className='flex space-x-1 justify-center items-center'>
                            <Image src='/icons/email.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                            <Text fontSize='md' className='text-db w-full text-center'>{` pentagonmaritimeservicescorp@gmail.com`}</Text>
                        </Box>
                        <Box className='flex space-x-1 justify-center items-center'>
                            <Image src='/icons/facebook.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                            <Text className='text-db w-full text-xs md:text-lg text-center'>{` https://www.facebook.com/Pentagonmaritimeservicescorp`}</Text>
                        </Box>
                    </Box>
                </Box>
                {/* <Box className='w-full flex justify-center'>
                    <button onClick={() => {router.push('/')}} className={`btn-primary rounded flex justify-center items-center animate__animated animate__fadeInDown `} >
                        <Image src='/icons/return.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                        <span className='w-full'>Return to Homepage</span>
                    </button>
                </Box> */}
            </section> 
        </Container>
    )
}