'use client'

// Next.js, Firebase and React imports
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { updateDoc, doc, Timestamp } from 'firebase/firestore'

// Chakra UI components
import { Box, Text, Link, Tooltip, FormLabel, Checkbox, Switch, FormControl, Input, FormErrorMessage, FormHelperText, Alert, AlertTitle, AlertDescription, AlertIcon, UnorderedList, OrderedList, ListItem, InputLeftAddon, InputGroup, Heading, Button, useToast, useDisclosure, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Accordion, AccordionIcon, AccordionPanel, AccordionItem, AccordionButton } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

// Aceternity UI components
import Registration_Background from "@/Components/ui/Registration_Background"

//types
import { TRAINEE, TRAINEE_BY_ID, initTRAINEE, TEMP_COURSES_V2, TEMP_COURSES, TRAINING } from '@/types/trainees'
import { ToastStatus } from '@/types/handling';

// Controllers
import { firestore, updateTraineeAttachments, addRegistrationDetails, addTrainingDetails, RE_ENROLLED_TRAINEE, changeImg } from '@/lib/trainee_controller'
import {TrashIcon, PlusIcon, VerifyIcon, PinIcon, MailIcon, PhoneIcon, SearchIcon, FacebookIcon } from '@/Components/Icons'
import { ReviewIcon, PolicyIcon, ClipIcon, SignIcon, ListIcon, CourseIcon, } from '@/Components/SideIcons'
import { generateDateRanges } from '@/handlers/course_handler'

// Custom Contexts
import { useRank } from '@/context/RankContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourses } from '@/context/CourseContext'

import { AdmissionPolicy, TrainingPolicy, DataPrivacy } from '@/Components/ui/templates'
import TrainingScheduleModal from '@/Components/Modal/RegistrationFormComponent/TrainingScheduleModal';
import CoursesModal from '@/Components/Modal/RegistrationFormComponent/CoursesModal';

interface Props {
    oldTrainee: TRAINEE_BY_ID;
}

export default function OldTrainee_v2({ oldTrainee }: Props){
    const toast = useToast()
    const router = useRouter()

    const { data: allRanks } = useRank()
    const { data: allCourses } = useCourses()
    const { data: allClients } = useClients()

    const {isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal} = useDisclosure()
    const {isOpen: isOpenCompany, onOpen: onOpenCompany, onClose: onCloseCompany} = useDisclosure()
    const {isOpen: isOpenRank, onOpen: onOpenRank, onClose: onCloseRank} = useDisclosure()
    const {isOpen: isOpenVessel, onOpen: onOpenVessel, onClose: onCloseVessel} = useDisclosure()
    const {isOpen: isOpenSched, onOpen: onOpenSched, onClose: onCloseSched} = useDisclosure()
    const {isOpen: isOpenReview, onOpen: onOpenReview, onClose: onCloseReview} = useDisclosure()
    const {isOpen: isOpenThankYou, onOpen: onOpenThankYou, onClose: onCloseThankYou} = useDisclosure()

    const [companyRef, setCompanyRef] = useState<string>('')
    const [selectCompany, setSelectCompany] = useState<string>('')

    const [rankRef, setRankRef] = useState<string>('')
    const [selectedRank, setSelectedRank] = useState<string>('')
    
    const [trainee, setTrainee] = useState<TRAINEE>(initTRAINEE)
    const [courses, setCourses] = useState<TEMP_COURSES[]>([])
    const [tempCourses, setTempCourses] = useState<TEMP_COURSES_V2[]>([{} as TEMP_COURSES_V2])

    const [vesselRef, setVesselRef] = useState<string>('')
    const [selectedVessel, setSelectVessel] = useState<string>('')

    const [validID, setValidID] = useState<File[]>([])
    const [valid, setValid] = useState<string >('')
    const [file, setFilename] = useState<string>('No file chosen yet...')

    const [validPfp, setPfp] = useState<File[]>([])
    const [validProfile, setValidPfp] = useState<string>('')
    const [pfpFile, setPfpFile] = useState<string>('No file chosen yet...')

    const [preview, setPreview] = useState<string | null>(null)
    const [validSignature, setSignature] = useState<File[]>([])
    const [validSig, setValidSig] = useState<string>('')
    const [sig_file, setSigFile] = useState<string>('No file chosen yet...')
    //Screenshot ng mismo
    const [screenshotFile, setSCFile] = useState<File[]>([])
    const [previewSC, setPreviewSC] = useState<string | null>(null)
    const [sc_fileName, setScFileName] = useState<string>('No file chosen yet...')
    //Med Cert
    const [medCertFile, setMCFile] = useState<File[]>([])
    const [previewMC, setPreviewMC] = useState<string | null>(null)
    const [mc_fileName, setMcFileName] = useState<string>('No file chosen yet...')
    //COP
    const [copFile, setCOPFile] = useState<File[]>([])
    const [previewCOP, setPreviewCOP] = useState<string | null>(null)
    const [cop_fileName, setCOPFileName] = useState<string>('No file chosen yet...')
    //Sea Service Record
    const [ssrFile, setSSRFile] = useState<File[]>([])
    const [previewSSR, setPreviewSSR] = useState<string | null>(null)
    const [ssr_fileName, setSSRFileName] = useState<string>('No file chosen yet...')
    
    const [month, setMonth] = useState<number>(0)
    const [day, setDay] = useState<number>(0)
    const [year, setYear] = useState<number>(0)
    
    const [sched, setSched] = useState<string>('')
    const [trainingSched, setTrainingSched] = useState<string[]>([])
    
    const [birth_date, setBirthDate] = useState<Date | null>(new Date())
    const [idRef, setIDRef] = useState<string>('')
    const [search, setSearch] = useState<string>('')
    const [courseRef, setCourseRef] = useState<string>('')
    const [courseSelect, selectCourse] = useState<string>('')
    const [courseIndex, setCourseIndex] = useState<number>(-1)
    const [userAgree, setUA] = useState<boolean>(false)
    const [showAlert, setAlert] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const e_form = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = () => {
            const {id, ...rest} = oldTrainee
            setTrainee(rest)
            setIDRef(id)

            setValid(oldTrainee.valid_id)
            setValidPfp(oldTrainee.photo)
            setValidSig(oldTrainee.e_sig)

            setBirthDate(oldTrainee.birthDate.toDate())
            
            const birthDate = oldTrainee.birthDate.toDate()
            setMonth(birthDate.getUTCMonth() + 1)
            setDay(birthDate.getUTCDate())
            setYear(birthDate.getUTCFullYear())
        } 
        fetchData()
    }, [])

    const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
        toast({
            title: title,
            description: desc,
            position: 'top-right',
            variant: 'left-accent',
            status: status,
            duration: timer,
            isClosable: true,
        })
    }

    const handleSelectedVessel = () => {
        let tempVessel: string
        if(selectedVessel === ''){
            tempVessel = vesselRef
        } else {
            tempVessel = selectedVessel
        }
        setTrainee((prev) => ({
            ...prev,
            vessel: tempVessel
        }))
        onCloseVessel()
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target

        if(id==='email'){
            setTrainee((prev) => ({
                ...prev,
                [id]: value.trim()
            }))
        } else if (id === 'marketing'){
            setTrainee((prev) => ({
                ...prev,
                [id]: `OTHERS-${value.trim().toUpperCase()}`
            }))
        } else {
            setTrainee((prev) => ({
                ...prev,
                [id]: value.trim().toUpperCase()
            }))
        }
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target
        setTrainee((prev) => ({
            ...prev,
            [id]: value.toUpperCase()
        }))
        console.log(value)
    }

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
    
    const handleValidSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            const signature = files[0];
            setSigFile(file);
            setSignature(Array.from(files));

            const objectUrl = URL.createObjectURL(signature)
            setPreview(objectUrl)
        } else {
            setSigFile('No file chosen yet...')
        }
    }

    const handleValidSC = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            const mismo_profile = files[0];
            setScFileName(file);
            setSCFile(Array.from(files))

            const objectUrl = URL.createObjectURL(mismo_profile)
            setPreviewSC(objectUrl)
        } else {
            setScFileName('No file chosen yet...')
        }
    }
    
    const handleCompany = (id: string) => {
        setSelectCompany(id)
    }

    const handleSelectedCompany = () => {
        let tempCompany: string
        if(selectCompany === ''){
            tempCompany = companyRef
        } else {
            tempCompany = selectCompany
        }
        setTrainee((prev) => ({
            ...prev,
            company: tempCompany
        }))
        onCloseCompany()
    }

    const handleSelectedRank = () => {
        let tempRank: string
        if(selectedRank === ''){
            tempRank = rankRef
        } else {
            tempRank = selectedRank
        }
        setTrainee((prev) => ({
            ...prev,
            rank: tempRank
        }))
        onCloseRank()
    }

    const handleRank = (rank: string) => {
        setSelectedRank(rank)
    }
    
    const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value , id } = e.target
        if(id === 'month'){
            setMonth(Number(value))
        }
        if(id === 'day'){
            setDay(Number(value))
        }
        if(id === 'year'){
            setYear(Number(value))
        }
    }

    const handleCombineBirthDate = () => {
        const birth_date = new Date(year, month - 1, day);
        setTrainee((prev) => ({
            ...prev,
            birthDate: birth_date ? Timestamp.fromDate(birth_date) : Timestamp.now()
        }))
    }

    const handleVessel = (ves: string) => {
        setSelectVessel(ves)
    }

    const handleRemoveCourse = (index: number) => {
        setTempCourses((prev) => prev.filter((_, i) => i !== index))
    }

    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isOpenModal && modalRef.current) {
            modalRef.current.focus(); // Focus the modal when it opens
        }
    }, [isOpenModal])

    const handleSchedule = (course_id: string) => {
        setSched('')

        const courseFound = allCourses && allCourses.find((course) => course.id === course_id)
        let dateRange: string[] = []
        if(courseFound){
            dateRange = generateDateRanges(courseFound.day, 10, courseFound.numOfDays.toString())
        }
        setTrainingSched(dateRange)
        setCourseRef(course_id)
        
    }

    const handleAccountType = (val: string, indx: number, type: string) => {
        setTempCourses((prev) =>
            prev.map((course, index) =>
                index === indx
                    ? {
                        ...course,
                        ...(type === "accountType" ? { accountType: Number(val) } : {}),
                    }
                    : course
            )
        )
    }

    const handleTrainingSched = () => {
        setTempCourses((prev) =>
            prev.map((course, index) =>
                index === courseIndex
                    ? {
                        ...course,
                        t_sched: sched, 
                    }
                    : course
            )
        )
    }

    const handleMoveCourses = () => {
        const newCourses = tempCourses.map((course) => {
            if (course.t_sched.includes(" to ")) {
                const [startDate, endDate] = course.t_sched.split(" to ").map((date) => date.trim());

                return {
                    course: course.course,
                    course_fee: course.course_fee,
                    start_date: startDate.toUpperCase(),
                    end_date: endDate.toUpperCase(),
                    numOfDays: course.numOfDays,
                    accountType: course.accountType, // 0 - crew | 1 - company
                    payment_mode: 0, // 0 - cash | 1 - gcash | 2 - bank
                }
            } else {
                return {
                    course: course.course,
                    course_fee: course.course_fee,
                    start_date: course.t_sched.toUpperCase(),
                    end_date: "",
                    numOfDays: course.numOfDays,
                    accountType: course.accountType,
                    payment_mode: 0,
                }
            }
        })

        setCourses((prev) => {
            // filter out duplicates
            const combined = [...prev, ...newCourses];
        
            // define what makes a course "unique"
            const unique = combined.filter(
                (course, index, self) => index === self.findIndex(
                    (c) =>
                        c.course === course.course &&
                        c.start_date === course.start_date &&
                        c.end_date === course.end_date
                )
            )
        
            return unique
        })
    }

    const handlePreSubmitForm = () => {
        if(
            // trainee.last_name === '' 
            // || trainee.first_name === ''
            // || trainee.rank === ''
            // || trainee.srn === ''
            // || trainee.contact_no === ''
            // || trainee.email === ''
            // || trainee.gender === ''
            // || trainee.contact_no === ''
            // || trainee.vessel === ''
            // || trainee.company === ''
            // || trainee.endorser === ''
            // || trainee.e_contact_person === ''
            // || trainee.e_contact === ''
            // || trainee.relationship === ''
            // || trainee.marketing === ''
            // || 
            (!tempCourses[0]?.course || tempCourses.length === 0)
        ){
            setAlert(true)
            e_form?.current?.scrollIntoView({ behavior: 'smooth' })
        } else {
            setAlert(false)
            handleCombineBirthDate()
            handleMoveCourses()
            onOpenReview()
        }
    }
    
    const checkTraineeChanges = (): boolean => {
        const changes: Partial<TRAINEE> = {}
        const {...rest} = oldTrainee

        for (const key in rest) {
            
            const typedKey = key as keyof TRAINEE // Cast `key` to keyof TRAINEE
            const oldValue = rest[typedKey]
            const newValue = trainee[typedKey]
            // Compare values
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes[typedKey] = { old: oldValue, new: newValue } as any;
            }
        }
        return Object.keys(changes).length > 0 ? true : false
    }

    const handleSubmit = async () => {
        try{
            setLoading(true)
            
            if(checkTraineeChanges()){
                const traineeRef = doc(firestore, 'TRAINEES', idRef)
                await updateDoc(traineeRef, {...trainee})
            }

            const attachmentFiles = { validID, validPfp, validSignature, screenshotFile, medCertFile, copFile, ssrFile, sc_fileName, mc_fileName, cop_fileName, ssr_fileName, file, pfpFile, sig_file }
            await updateTraineeAttachments(idRef, trainee, attachmentFiles, 'Re-Enrolled Trainee')
            if(!idRef){
                router.push('/admissions/os/forms')
                return
            }

            const accountTypes = [
                { type: 1, list: courses.filter(c => c.accountType !== 0)},
                { type: 0, list: courses.filter(c => c.accountType === 0)},
            ]

            for(const chargeType of accountTypes){
                if(chargeType.list.length === 0) continue

                const totalFee = chargeType.list.reduce((sum, c) => sum + (c.course_fee || 0), 0)

                const registrationID = await addRegistrationDetails(idRef, totalFee, 1,1,chargeType.type, trainee.marketing)
                
                if(registrationID){
                    await Promise.all(
                        chargeType.list.map(course =>
                            addTrainingDetails(course, registrationID, trainee.marketing)
                            .catch(err => console.error(`Failed course ${course.course}:`, err))
                        )
                    )
                }
            }

            await fetch('/api/send-mail', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                }, 
                body: JSON.stringify({
                    to: trainee.email,
                    subject: 'ENROLLMENT TO PENTAGON MARITIME SERVICES CORP.',
                    text: 'Thank you for submitting your online registration form, someone will assist you once your registration is verified. Thank you have a nice day!',
                    last_name: trainee.last_name,
                    first_name: trainee.first_name,
                })
            })
            
            onCloseReview()
            onOpenThankYou()
        } catch(error){
            throw error
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        onCloseThankYou()
        router.push('/admissions/ol/forms')
    }
    
    return(
    <>
        <Registration_Background />
        <Box ref={e_form} w={{base: '100%', md: '100%'}} display='flex' justifyContent={'center'}>
            <Box py='4' px='2' w={{base: '100%', md: '65%'}}>
                <Text fontSize='1.5625rem' fontWeight='500' py='4' textTransform='uppercase'>Online Enrollment</Text>
                <Box className='animate__animated animate__fadeInRight'>
                    <Text color='white' fontWeight='400' display='flex' gap='3' alignItems='center' fontSize='0.75rem' borderRadius='5px' bgColor={'blue.700'} mb='2' py='4' px='4' textTransform='uppercase'>
                        <Text as='span'>
                            <CourseIcon size='24' color='#fff' />
                        </Text>
                        <Text as='span'>
                            Course Details
                        </Text>
                    </Text>
                    {showAlert && (!tempCourses[0]?.course || tempCourses.length === 0) && (
                        <Alert display='flex' flexDir='column' pt='2' status='warning' variant='left-accent'>
                            <Box display='flex'>
                                <AlertIcon />
                                <AlertTitle>Please select a course/s.</AlertTitle>
                            </Box>
                        </Alert>
                    )}
                    <Box p='2'>
                        <Box display={{base: 'none', md: 'flex'}} mb='3' justifyContent='end'>
                            <Button leftIcon={<PlusIcon />} colorScheme='teal' onClick={() => setTempCourses((prev) => [...prev, {} as TEMP_COURSES_V2])} fontWeight='400' fontSize='0.75rem' shadow='md' textTransform='uppercase'>Add Course</Button>
                        </Box>
                        {tempCourses.map((course, index) => {
                            const courseFound = allCourses?.find((c) => c.id === course.course);
                            
                            return(
                                <Box key={index} mb={6} border="1px solid #ccc" p={4} shadow='md' borderRadius="md">
                                    <Box display='flex' justifyContent='end'>
                                        <Tooltip label='Remove Course'>
                                            <Button size='xs' py='4' px='3' colorScheme='red' onClick={() => {handleRemoveCourse(index);}}>
                                                <TrashIcon size='24' color='#fff' />
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                    <Box display="flex" flexDir={{ base: "column", md: "row" }} gap="4" pt="3" pb={{base: '4', md: '8'}}>
                                        <FormControl isRequired>
                                            <FormLabel py="2" fontWeight="600" fontSize="0.5625rem" textTransform="uppercase" color="blue.700" >
                                                Course
                                            </FormLabel>
                                            <Input readOnly value={courseFound ? `${courseFound.course_code} - ${courseFound.course_name}` : ''} onClick={() => {onOpenModal(); setCourseIndex(index); }} fontWeight="400" textTransform="uppercase" placeholder="Select Course" shadow="md" />
                                        </FormControl>
                                        <FormControl display={tempCourses[index]?.accountType === 0 ? 'block' : 'none'} w={{ base: "100%", md: "30%" }} isRequired>
                                            <FormLabel htmlFor={`fee-${index}`} py="2" fontWeight="600" fontSize="0.5625rem" textTransform="uppercase" color="blue.700" >
                                                Course Fee
                                            </FormLabel>
                                            <Input id={`fee-${index}`} value={tempCourses[index]?.course_fee} readOnly />
                                        </FormControl>
                                    </Box>
                                    <Box display="flex" flexDir={{ base: "column", md: "row" }} gap="4" pt="3" pb="8">
                                        <FormControl isRequired>
                                            <FormLabel htmlFor={`schedule-${index}`} py="2" fontWeight="600" fontSize="0.5625rem" textTransform="uppercase" color="blue.700" >
                                                Training Schedule
                                            </FormLabel>
                                            <Input readOnly id={`schedule-${index}`} 
                                                isDisabled={!tempCourses[index]?.course}
                                                onClick={() => {handleSchedule(tempCourses[index].course); selectCourse(tempCourses[index].course); setCourseIndex(index); onOpenSched();}}  
                                                value={tempCourses[index].t_sched} 
                                                shadow="md" placeholder="Select Training Schedule" />
                                        </FormControl>
                                        <FormControl w={{ base: "100%", md: "30%" }} isRequired>
                                            <FormLabel htmlFor={`payment-${index}`} py="2" fontWeight="600" fontSize="0.5625rem" textTransform="uppercase" color="blue.700" >
                                                Payment Method
                                            </FormLabel>
                                            <Select isDisabled={!tempCourses[index]?.course} id={`payment-${index}`} value={tempCourses[index].accountType} 
                                                onChange={(e) => { handleAccountType(e.target.value, index, 'accountType');}} shadow="md">
                                                <option hidden />
                                                <option value={0}>Crew Charge</option>
                                                <option value={1}>Company Charge</option>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>
                        )})}
                        <Box display={{base: 'flex', md: 'none'}} mb='3' justifyContent='center'>
                            <Button w='100%'colorScheme='teal' onClick={() => setTempCourses((prev) => [...prev, {} as TEMP_COURSES_V2])} fontWeight='400' fontSize='0.75rem' shadow='md' textTransform='uppercase'>Add Course</Button>
                        </Box>
                    </Box>
                </Box>
                {/** Trainee Info */}
                <Box className='animate__animated animate__fadeInLeft'>
                    <Text display='flex' gap='3' alignItems='center' color='white' fontWeight='400' fontSize='0.75rem' borderRadius='5px' bgColor={'blue.700'} mb='2' py='4' px='4' textTransform='uppercase'>
                        <Text as='span'>
                            <ListIcon size='24' color='#fff' />
                        </Text>
                        <Text as='span'>
                            Trainee Information
                        </Text>
                    </Text>
                    {/* {showAlert && (
                        <Alert display='flex' flexDir='column' pt='2' status='warning' variant='left-accent'>
                            <Box display='flex'>
                                <AlertIcon />
                                <AlertTitle>Please provide the required fields.</AlertTitle>
                            </Box>
                            <AlertDescription >
                                <Box >
                                    <Box display='flex' flexDir='column'>
                                        <p>{trainee.last_name === ''  ? `* Last Name` : ''}</p>
                                        <p>{trainee.first_name === '' ? `* First Name` : ''}</p>
                                        <p>{trainee.rank === '' ? `* Rank.` : ''}</p>
                                        <p>{trainee.srn === '' ? `* SRN.` : ''}</p>
                                        <p>{trainee.contact_no === '' ? `* Contact no.` : ''}</p>
                                        <p>{trainee.email === '' ? `* Email.` : ''}</p>
                                        <p>{trainee.gender === '' ? `* Gender.` : ''}</p>
                                        <p>{trainee.contact_no === '' ? `* Contact No.#.` : ''}</p>
                                        <p>{trainee.vessel === '' ? `* Vessel Type` : ''}</p>
                                        <p>{trainee.company === '' ? `* Company` : ''}</p>
                                        <p>{trainee.endorser === '' ? `* Endorser/Crewing` : ''}</p>
                                        <p>{trainee.e_contact_person === '' ? `* Emergency Contact Person` : ''}</p>
                                        <p>{trainee.e_contact === '' ? `* Emergency Contact No.#` : ''}</p>
                                        <p>{trainee.relationship === '' ? `* Relationship to Contact person` : ''}</p>
                                        <p>{trainee.marketing === '' ? `* Marketing` : ''}</p>
                                        {trainee.marketing !== '' && (
                                            <p>{trainee.otherMarketing === '' ? `* Marketing` : ''}</p>
                                        )}
                                    </Box>
                                </Box>
                            </AlertDescription>
                        </Alert>
                    )} */}
                    <Box p='2'>
                        <Text fontWeight='600' fontSize='12px' textTransform='uppercase' color='blue.700'>Fields marked with <span style={{ color: "red" }}>*</span> are required. Type N/A if not applicable</Text>
                        <Box display='flex' flexDir={{base:'column', md: 'row'}} gap={{base: '2', md: '4'}} pt='3'>
                            <FormControl isRequired isInvalid={showAlert && trainee.last_name === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='last_name' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Last Name</FormLabel>
                                <Input id='last_name' value={trainee?.last_name} onChange={handleOnChange} textTransform='uppercase' placeholder='e.g. Doe' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                            <FormControl isRequired isInvalid={showAlert && trainee.first_name === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='first_name' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>First Name</FormLabel>
                                <Input id='first_name' value={trainee?.first_name} onChange={handleOnChange} textTransform='uppercase' placeholder='e.g. John' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                            <FormControl textTransform='uppercase'>
                                <FormLabel htmlFor='middle_name' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Middle Name</FormLabel>
                                <Input id='middle_name' value={trainee?.middle_name} onChange={handleOnChange} textTransform='uppercase' placeholder='e.g. Michael' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                            <FormControl textTransform='uppercase' w={{base: '100%', md: '40%'}}>
                                <FormLabel htmlFor='suffix' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Suffix</FormLabel>
                                <Select id='suffix' value={trainee?.suffix} onChange={handleSelect} textTransform='uppercase' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' >
                                    <option hidden />
                                    <option value='jr.'>Jr.</option>
                                    <option value='sr.'>Sr.</option>
                                    <option value='i.'>I</option>
                                    <option value='ii.'>II</option>
                                    <option value='iii.'>III</option>
                                    <option value='iv.'>IV</option>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box display='flex' flexDir={{base:'column', md: 'row'}} gap={{base: '2', md: '4'}} pt='3'>
                            <FormControl textTransform='uppercase'>
                                <FormLabel htmlFor='' py='0' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Date of Birth</FormLabel>
                                <FormControl display='flex' flexDir={{ base: 'column', md: 'row' }} gap='2' textTransform='uppercase'>
                                    <FormControl isRequired display='flex' flexDir='column' gap='0' justifyContent='center' alignItems='start' textTransform='uppercase'>
                                        <FormLabel htmlFor='month' py='2' fontWeight='600' m='0' p='0' ps='2' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>MONTH</FormLabel>
                                        <Input id='month' type='number' value={month} shadow='md' textTransform='uppercase' onChange={(e) => {handleDate(e)}} placeholder='e.g. 01' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                    </FormControl>
                                    <FormControl isRequired display='flex' flexDir='column' gap='0' justifyContent='center' alignItems='start' textTransform='uppercase'>
                                        <FormLabel htmlFor='day' py='2' fontWeight='600' m='0' p='0' ps='2' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>DAY</FormLabel>
                                        <Input id='day' type='number' value={day} shadow='md' textTransform='uppercase' onChange={(e) => {handleDate(e)}} placeholder='e.g. 01' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                    </FormControl>
                                    <FormControl isRequired display='flex' flexDir='column' gap='0' justifyContent='center' alignItems='start' textTransform='uppercase'>
                                        <FormLabel htmlFor='year' py='2' fontWeight='600' m='0' p='0' ps='2' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>YEAR</FormLabel>
                                        <Input id='year' type='number' value={year} shadow='md' textTransform='uppercase' onChange={(e) => {handleDate(e)}} placeholder='e.g. 2002' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                    </FormControl>
                                </FormControl>
                                <FormHelperText fontWeight='600' fontSize='10px'>Note: Please enter your birth date using digits (01/01/2001)</FormHelperText>
                            </FormControl>
                            <FormControl textTransform='uppercase'>
                                <FormLabel htmlFor='birthPlace' pt='2' mb='2' pb='1.5' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Birth Place</FormLabel>
                                <Input id='birthPlace' value={trainee.birthPlace} onChange={handleOnChange} textTransform='uppercase' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                            <FormControl isRequired isInvalid={showAlert && trainee.gender === ''} textTransform='uppercase' w={{base: '100%', md: '40%'}}>
                                <FormLabel htmlFor='gender' pt='2' mb='2' pb='1.5' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Gender</FormLabel>
                                <Select id='gender' value={trainee?.gender} onChange={handleSelect} textTransform='uppercase' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400'>
                                    <option hidden/>
                                    <option value='male'>Male</option>
                                    <option value='female'>Female</option>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box display='flex' flexDir={{base:'column', md: 'row'}} gap={{base: '2', md: '4'}} pt='3'>
                            <FormControl isRequired isInvalid={showAlert && trainee.otherAddress === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='otherAddress' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Address</FormLabel>
                                <Input id='otherAddress' value={trainee?.otherAddress} onChange={handleOnChange} textTransform='uppercase' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                        </Box>
                        <Box display='flex' flexDir={{base:'column', md: 'row'}} gap={{base: '2', md: '4'}} pt='3'>
                            <FormControl isRequired isInvalid={showAlert && trainee.email === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='email' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Email</FormLabel>
                                <Input id='email' value={trainee?.email} onChange={handleOnChange} textTransform='uppercase' type='email' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                            <FormControl isRequired isInvalid={showAlert && trainee.contact_no === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='contact_no' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Contact No.</FormLabel>
                                <Input id='contact_no' value={trainee?.contact_no} onChange={handleOnChange} textTransform='uppercase' placeholder='e.g. 09xxxxxxxxx' type='tel' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                            <FormControl isRequired isInvalid={showAlert && trainee.rank === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='rank' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Rank/Position</FormLabel>
                                <Input type='text' textTransform='uppercase' id='rank' 
                                    value={allRanks?.find((rank) => rank.code === trainee.rank)?.rank || (trainee.rank === '' ? 'SELECT RANK' : trainee.rank)}
                                    onClick={() => {onOpenRank(); setRankRef(''); setSelectedRank('');}}
                                    shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400'/>
                            </FormControl>
                            <FormControl textTransform='uppercase'>
                                <FormLabel htmlFor='nationality' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Nationality</FormLabel>
                                <Input id='nationality' value={trainee?.nationality} onChange={handleOnChange} textTransform='uppercase' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                        </Box>
                        <Box display='flex' flexDir={{base:'column', md: 'row'}} gap={{base: '2', md: '4'}} pt='3'>
                            <FormControl isRequired isInvalid={showAlert && trainee.srn === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='srn' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>SRN No.</FormLabel>
                                <Input id='srn' value={trainee?.srn} onChange={handleOnChange} type='text' textTransform='uppercase' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                            <FormControl isRequired isInvalid={showAlert && trainee.vessel === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='vessel' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Vessel Type</FormLabel>
                                <Input id='vessel' textTransform='uppercase' isReadOnly shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' 
                                        onClick={() => {onOpenVessel(); setVesselRef(''); setSelectVessel('');}}
                                        value={trainee.vessel === '' ? 'ADD VESSEL' : trainee.vessel}
                                    />
                            </FormControl>
                            <FormControl isRequired isInvalid={showAlert && trainee.company === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='company' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Company</FormLabel>
                                <Input id='company' onClick={() => {onOpenCompany(); setCompanyRef(''); setSelectCompany('');}} 
                                    value={allClients?.find((client) => client.id === trainee.company)?.company || (trainee.company === '' ? 'ADD COMPANY' : trainee.company)}
                                    type='text' shadow='md' textTransform='uppercase' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' isReadOnly/>
                            </FormControl>
                            <FormControl isRequired isInvalid={showAlert && trainee.endorser === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='endorser' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Endorser/Crewing</FormLabel>
                                <Input id='endorser' value={trainee?.endorser} onChange={handleOnChange} textTransform='uppercase' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                        </Box>
                        <Box display='flex' flexDir={{base:'column', md: 'row'}} gap={{base: '2', md: '4'}} pt='3'>
                            <FormControl isRequired isInvalid={showAlert && trainee.e_contact_person === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='e_contact_person' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>{`In Case Of Emergency: (Contact Person)`}</FormLabel>
                                <Input id='e_contact_person' value={trainee?.e_contact_person} onChange={handleOnChange} textTransform='uppercase' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                            <FormControl isRequired isInvalid={trainee.contact_no === trainee.e_contact && trainee.e_contact !== ''} textTransform='uppercase'>
                                <FormLabel htmlFor='e_contact' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Emergency Contact No.:</FormLabel>
                                <Input id='e_contact' value={trainee?.e_contact} onChange={handleOnChange} textTransform='uppercase' type='number' placeholder='e.g. 09xxxxxxxxx' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                <FormErrorMessage fontWeight='500' fontSize='12px'>
                                    Emergency Contact# must not be the same as personal contact#.
                                </FormErrorMessage>
                            </FormControl>
                            <FormControl isRequired isInvalid={showAlert && trainee.relationship === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='relationship' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Relationship to Contact Person</FormLabel>
                                <Select id='relationship' value={trainee?.relationship} onChange={handleSelect} textTransform='uppercase' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400'>
                                    <option hidden/>
                                    <option value='parent'>Parent</option>
                                    <option value='spouse'>Spouse</option>
                                    <option value='sibling'>Sibling</option>
                                    <option value='child'>Child</option>
                                    <option value='relative'>Relative</option>
                                    <option value='friend'>Friend</option>
                                    <option value='guardian'>Guradian</option>
                                    <option value='partner'>Partner</option>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box display='flex' flexDir={{base:'column', md: 'row'}} gap={{base: '2', md: '4'}} pt='3' pb='8'>
                            <FormControl isRequired isInvalid={showAlert && trainee.marketing === ''} textTransform='uppercase'>
                                <FormLabel htmlFor='marketing' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Please select from the following below, How did you found out about us?</FormLabel>
                                <Select id='marketing' value={trainee?.marketing} onChange={handleSelect} textTransform='uppercase' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400'>
                                    <option hidden/>
                                    <option value='agent'>Agent</option>
                                    <option value='company'>Company</option>
                                    <option value='walk-in'>Walk-In</option>
                                    <option value='fb'>Facebook</option>
                                    <option value='consultancy'>Consultancy</option>
                                    <option value='others'>Others</option>
                                </Select>
                            </FormControl>
                            {(trainee?.marketing === 'OTHERS') && (
                                <FormControl isRequired isInvalid={showAlert && trainee.otherMarketing === ''} textTransform='uppercase'>
                                    <FormLabel htmlFor='otherMarketing' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>{`If Others, please specify`}</FormLabel>
                                    <Input id='otherMarketing' value={trainee?.otherMarketing} onChange={handleOnChange} textTransform='uppercase' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                </FormControl>
                            )}
                        </Box>
                    </Box>
                </Box>
                {/** Enrollment Attachments */}
                <Box className='animate__animated animate__fadeInRight'>
                    <Text display='flex' alignItems='center' gap='3' color='white' fontWeight='400' fontSize='0.75rem' borderRadius='5px' bgColor={'blue.700'} py='4' px='4' textTransform='uppercase'>
                        <Text as='span'>
                            <ClipIcon size='24' color='#fff' />
                        </Text>
                        <Text as='span'>
                            Enrollment Attachments
                        </Text>
                    </Text>
                    <Box p='2'>
                        <Box display='flex' flexDir={{base:'column', md: 'row'}} gap={{base: '2', md: '4'}} pt='3' pb='8'>
                            <FormControl isRequired >
                                <FormLabel htmlFor='valid_id' m='0' pt='2' fontWeight='700' fontSize='0.75rem' textTransform='uppercase' color='blue.700'>Valid ID</FormLabel>
                                <FormHelperText mt='0' fontWeight='600' pb='2' fontSize='10px'>(Preferably: Passport ID)</FormHelperText>
                                <Input id='valid_id' onChange={handleValidID} p='4px' placeholder='e.g. Doe' accept='.jpg' type='file' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                <FormHelperText fontWeight='600' fontSize='10px'>File type shall be *.jpeg, .jpg and maximum upload file size shall be less than 2MB</FormHelperText>
                            </FormControl>
                            <FormControl isRequired >
                                <FormLabel htmlFor='photo' m='0' pt='2' fontWeight='700' fontSize='0.75rem' textTransform='uppercase' color='blue.700'>2x2 ID Photo</FormLabel>
                                <FormHelperText mt='0' fontWeight='600' pb='2' fontSize='10px'>(Note: Ensure photo is clear, and wear your uniform.)</FormHelperText>
                                <Input id='photo' onChange={handleValid2x2} p='4px' placeholder='e.g. John' accept='.jpg' type='file' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                <FormHelperText fontWeight='600' fontSize='10px'>File type shall be *.jpeg, .jpg and maximum upload file size shall be less than 2MB</FormHelperText>
                            </FormControl>
                            {tempCourses.some(fc => allCourses?.filter(c => c.courseType === 0)?.some(c => c.id === fc.course)) && (
                                <>
                                <FormControl isRequired >
                                    <FormLabel htmlFor='mismoSC' m='0' pt='2' fontWeight='700' fontSize='0.75rem' textTransform='uppercase' color='blue.700'>MISMO Profile Account</FormLabel>
                                    <FormHelperText mt='0' fontWeight='600' pb='2' fontSize='10px'>(Note: Please provide a screenshot of your MISMO Profile Account.)</FormHelperText>
                                    <Input id='mismoSC' onChange={handleValidSC} p='4px' placeholder='e.g. John' accept='.jpg' type='file' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                    <FormHelperText fontWeight='600' fontSize='10px'>File type shall be *.jpeg, .jpg and maximum upload file size shall be less than 2MB</FormHelperText>
                                </FormControl>
                                </>
                            )}
                        </Box>
                        {tempCourses.some(fc => allCourses?.filter(c => c.courseType === 0)?.some(c => c.id === fc.course)) && (
                            <Box display='flex' flexDir={{base:'column', md: 'row'}} gap={{base: '2', md: '4'}} pt='3' pb='8'>
                                <FormControl isRequired >
                                    <FormLabel htmlFor='med_cert' m='0' pt='2' fontWeight='700' fontSize='0.75rem' textTransform='uppercase' color='blue.700'>Medical Certificate</FormLabel>
                                    <FormHelperText mt='0' fontWeight='600' pb='2' fontSize='10px'>(Note: Please provide a SCANNED COPY of your Medical Certificate)</FormHelperText>
                                    <Input id='med_cert' onChange={handleValidID} p='4px' placeholder='e.g. Doe' accept='.jpg' type='file' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                    <FormHelperText fontWeight='600' fontSize='10px'>File type shall be *.jpeg, .jpg and maximum upload file size shall be less than 2MB</FormHelperText>
                                </FormControl>
                                <FormControl isRequired >
                                    <FormLabel htmlFor='cop' m='0' pt='2' fontWeight='700' fontSize='0.75rem' textTransform='uppercase' color='blue.700'>{`Certificate of Proficiency (COP)`}</FormLabel>
                                    <FormHelperText mt='0' fontWeight='600' pb='2' fontSize='10px'>(Note: Please provide a SCANNED COPY of your COP)</FormHelperText>
                                    <Input id='cop' onChange={handleValid2x2} p='4px' placeholder='e.g. John' accept='.jpg' type='file' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                    <FormHelperText fontWeight='600' fontSize='10px'>File type shall be *.jpeg, .jpg and maximum upload file size shall be less than 2MB</FormHelperText>
                                </FormControl>
                                <FormControl isRequired >
                                    <FormLabel htmlFor='ssr' m='0' pt='2' fontWeight='700' fontSize='0.75rem' textTransform='uppercase' color='blue.700'>Sea Service Records</FormLabel>
                                    <FormHelperText mt='0' fontWeight='600' pb='2' fontSize='10px'>(Note: Please provide a SCANNED COPY of your Sea Service Records)</FormHelperText>
                                    <Input id='ssr' onChange={handleValidSC} p='4px' placeholder='e.g. John' accept='.jpg' type='file' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                                    <FormHelperText fontWeight='600' fontSize='10px'>File type shall be *.jpeg, .jpg and maximum upload file size shall be less than 2MB</FormHelperText>
                                </FormControl>
                            </Box>
                        )}
                    </Box>
                </Box>
                {/** Company Policies & Guidelines*/}
                <Box className='animate__animated animate__fadeInLeft'>
                    <Text display='flex' gap='3' alignItems='center' color='white' fontWeight='400' fontSize='0.75rem' borderRadius='5px' bgColor={'blue.700'} py='4' px='4' textTransform='uppercase'>
                        <Text as='span'>
                            <PolicyIcon size='24' color='#fff' />
                        </Text>
                        <Text as='span'>
                            Company Policies and Guidelines
                        </Text>
                    </Text>
                    <Box p='2'>
                        <AdmissionPolicy />
                        <TrainingPolicy />
                        <DataPrivacy />
                        <FormControl py='3' gap='2' display='flex'>
                            <Checkbox id='check' size='lg' colorScheme='blue' 
                                onChange={() => setUA(!userAgree)}
                                sx={{
                                    "& .chakra-checkbox__control": {
                                        border: "2px solid #2B6CB0", // thicker border
                                        borderRadius: "6px",         // more square edges
                                        boxShadow: "0 0 6px rgba(43, 108, 176, 0.6)", // glowing effect
                                        _checked: {
                                            bg: "blue.600",
                                            borderColor: "blue.700",
                                            boxShadow: "0 0 8px rgba(43, 108, 176, 0.8)", // glow when checked
                                        },
                                    },
                                }} 
                            />
                            <Box>
                                <FormLabel htmlFor='check' fontWeight='400' fontSize='13px'>
                                    {`I understand, that Pentagon Maritime Services Corp. shall keep my personal data and information in strict confidence and that the collection and processing of my personal data/information shall be used only for my enrollment, training and certification.`}
                                </FormLabel>
                                <FormLabel htmlFor='check' fontWeight='400' fontSize='13px'>
                                {`I hereby certify that I have read and understood the above and hereby consent to, agree on, accept and acknowledge these terms.`}
                                </FormLabel>
                            </Box>
                        </FormControl>
                    </Box>
                </Box>
                {/** E-Signature */}
                <Box className='animate__animated animate__fadeInRight'>
                    <Text display='flex' alignItems='center' gap='3' color='white' fontWeight='400' fontSize='0.75rem' borderRadius='5px' bgColor={'blue.700'} py='4' px='4' textTransform='uppercase'>
                        <Text as='span'>
                            <SignIcon size='24' />
                        </Text>
                        <Text as='span'>
                            E-Signature
                        </Text>
                    </Text>
                    <Box p='2'>
                        <FormControl isRequired >
                            <FormLabel htmlFor='photo' m='0' pt='2' fontWeight='700' fontSize='0.75rem' textTransform='uppercase' color='blue.700'>Upload your Signature</FormLabel>
                            <Input id='photo' onChange={handleValidSignature} p='4px' placeholder='e.g. John' accept='.jpg' type='file' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            <FormHelperText fontWeight='600' fontSize='10px'>File type shall be *.jpeg, .jpg and maximum upload file size shall be less than 2MB</FormHelperText>
                            <FormHelperText fontWeight='600' fontSize='10px'>Note: Write your signature on a clean piece of paper then take a picture of it and then upload. The image must be clear and not blurred. </FormHelperText>
                        </FormControl>
                    </Box>
                    <Box p='3'>
                        <Text fontWeight='400' fontSize='13px'>
                            {`BY SIGNING THIS I GRANT MY VOLUNTARY AND UNCONDITIONAL CONSENT TO THE COLLECTION AND PROCESSING MY PERSONAL DATA AS STATED ABOVE TO THE INFORMATION AND DATA BASE OF PENTAGON MARITIME SERVICES CORP. IN ACCORDANCE WITH REPUBLIC ACT (R.A) 10173, OTHERWISE KNOWN AS THE “DATA PRIVACY ACT OF 2012” OF THE REPUBLIC OF THE PHILIPPINES, INCLUDING ITS IMPLEMENTING RULES AND REGULATIONS (IRR) AS WELL AS ALL OTHER GUIDELINES AND ISSUANCES BY THE NATIONAL PRIVACY COMMISSION (NPC).`}
                        </Text>
                    </Box>
                </Box>
                {/** Action Button */}
                <Box display='flex' pt='4' justifyContent={'end'} className='animate__animated animate__fadeInLeft'>
                    <Button 
                        isDisabled={!userAgree || sig_file==='No file chosen yet...'} 
                        onClick={() => {handlePreSubmitForm();}} 
                        w={{base: '100%', md: '20%'}} 
                        colorScheme="blue" 
                        fontWeight='400' 
                        fontSize='0.75rem' 
                        bgColor='blue.700' 
                        shadow='md' 
                        textTransform={'uppercase'}
                        leftIcon={<VerifyIcon size='24' color='#fff' />} 
                    >
                            Submit Form
                    </Button>
                </Box>
            </Box>
        </Box>
        {/** Vessel */}
        <Modal isOpen={isOpenVessel} onClose={onCloseVessel} size='xl' scrollBehavior='inside' motionPreset='scale'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontWeight='700' className='text-sky-700'>Vessels</ModalHeader>
                <ModalBody>
                    <Box className='flex flex-col space-y-2'>
                        <Box>
                            <Input onChange={(e) => setVesselRef(e.target.value)} className='shadow-md uppercase' placeholder='type your vessel here...'/>
                        </Box>
                        <Box className='py-2 space-y-2'>
                            <Text className='text-gray-400 text-base'>Select your company below</Text>
                            <Text onClick={() => handleVessel('container')} className={`${'container' === selectedVessel ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{'Container'}</Text>
                            <Text onClick={() => handleVessel('bulk')} className={`${'bulk' === selectedVessel ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{'Bulk'}</Text>
                            <Text onClick={() => handleVessel('tanker')} className={`${'tanker' === selectedVessel ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{'Tanker'}</Text>
                            <Text onClick={() => handleVessel('passenger')} className={`${'passenger' === selectedVessel ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{'Passenger'}</Text>
                        </Box>
                        <Text className='text-gray-400 text-center text-base'>{`Tip: If your vessel is not provided here, you can type it on the text box at the top and click done.`}</Text>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onCloseVessel} mr={3}>Close</Button>
                    <Button isDisabled={vesselRef.trim() === '' && selectedVessel.trim() === ''} onClick={handleSelectedVessel} colorScheme='blue'>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Company Modal */}
        <Modal isOpen={isOpenCompany} onClose={onCloseCompany} size='xl' scrollBehavior='inside' motionPreset='slideInTop'>
            <ModalOverlay/>
            <ModalContent className='px-3'>
                <ModalHeader fontWeight='700px' className='uppercase text-sky-700'>Specify your Company</ModalHeader>
                <ModalBody>
                    <Box className='flex flex-col space-y-2'>
                        <Box>
                            <Input onChange={(e) => setCompanyRef(e.target.value)} className='shadow-md uppercase' placeholder='type your company here...'/>
                        </Box>
                        <Box className='py-2 space-y-2'>
                            <Text fontWeight='500' fontSize='13px' className='text-gray-500 text-base'>Select your company below</Text>
                            {allClients && allClients.filter((company) => !companyRef || company.company.toLowerCase().includes(companyRef.toLowerCase())).sort((a, b) => a.company.localeCompare(b.company)).map((company) => (
                                <Text key={company.id} fontWeight='500' fontSize='13px' onClick={() => handleCompany(company.id)}  className={`${company.id === selectCompany ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded uppercase text-center shadow-md`}>{company.company}</Text>
                            ))}
                        </Box>
                        <Text fontWeight='500' fontSize='14px' className='text-gray-500 text-center text-base'>{`Tip: If your company is not provided here, you can type it on the text box at the top and click done.`}</Text>
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='1px'>
                    <Button onClick={onCloseCompany} mr={3} >Close</Button>
                    <Button isDisabled={companyRef.trim() === '' && selectCompany.trim() === ''} onClick={handleSelectedCompany} colorScheme='blue'>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Rank Modal */}
        <Modal isOpen={isOpenRank} onClose={onCloseRank} size='xl' scrollBehavior='inside' motionPreset='scale'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontWeight='700' className='text-sky-700'>Rank Type</ModalHeader>
                <ModalBody>
                    <Box className='flex flex-col space-y-2'>
                        <Box>
                            <Input onChange={(e) => setRankRef(e.target.value)} className='shadow-md uppercase' placeholder='type your rank here...'/>
                        </Box>
                        <Box className='py-2 space-y-2'>
                            <Text fontWeight='500' fontSize='14px' className='text-gray-500 text-base'>Select your Rank below</Text>
                            {allRanks && allRanks.filter((rank) => !rankRef || rank.code.toLowerCase().includes(rankRef.toLowerCase())).sort((a, b) => a.code.localeCompare(b.code)).map((rank) =>(
                                <Text key={rank.id} fontWeight='500' fontSize='13px' onClick={() => handleRank(rank.code)}  className={`${rank.code === selectedRank ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded uppercase text-center shadow-md`}>{rank.code}</Text>
                            ))}
                        </Box>
                        <Text fontWeight='500' fontSize='13px' className='text-gray-500 text-center text-base'>{`Tip: If your rank is not provided here, you can type it on the text box at the top and click done.`}</Text>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onCloseRank} mr={3}>Close</Button>
                    <Button isDisabled={rankRef.trim() === '' && selectedRank.trim() === ''}  onClick={handleSelectedRank}  colorScheme='blue'>Done</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Course Selection */}
        <Modal blockScrollOnMount={false} isOpen={isOpenModal} onClose={onCloseModal} scrollBehavior="inside" motionPreset="slideInTop" size="xl">
            <ModalOverlay />
            <ModalContent ref={modalRef} tabIndex={-1}  className="px-3">
                <ModalHeader className="text-sky-700 font-bold">COURSES OFFERED</ModalHeader>
                <ModalBody>
                    <Box className='pb-3 text-center text-sm flex space-x-3'>
                        <Alert status='info' variant='left-accent'>
                            <AlertIcon />
                            <AlertDescription fontWeight='400' fontSize='13px'>{`Select your preferred course.`}</AlertDescription>
                        </Alert>
                    </Box>
                    <CoursesModal 
                        setTempCourses={setTempCourses} 
                        onClose={onCloseModal}    
                        courseIndex={courseIndex}
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
        {/** Training Schedule Modal */}
        <Modal blockScrollOnMount={false}  isOpen={isOpenSched} size='xl' onClose={onCloseSched} scrollBehavior='outside' motionPreset='scale'>
            <ModalOverlay />
            <ModalContent ref={modalRef} tabIndex={-1} >
                <ModalHeader color='blue.700' fontWeight='700' fontSize='xl'>Select Training Date</ModalHeader>
                <Alert status='info' variant='subtle'>
                    <AlertIcon />
                    <AlertDescription>
                        {`If schedule is not available, kindly click "Select Preferred Dates" to select preferred training schedule.`}
                    </AlertDescription>
                </Alert>
                <ModalBody my='4' flex="1">
                    <TrainingScheduleModal 
                        onClose={onCloseSched} 
                        selectedCourse={courseSelect} 
                        courseID={courseRef} 
                        trainingSched={trainingSched} 
                        setSched={setSched} 
                    />
                </ModalBody>
                <ModalFooter>
                    <Button isDisabled={sched === ''} colorScheme='blue' shadow='md' bgColor='blue.700' onClick={() =>{handleTrainingSched(); onCloseSched();}}>Done</Button>
                </ModalFooter>
            </ModalContent>               
        </Modal>
        {/** Review Modal */}
        <Modal isOpen={isOpenReview} onClose={onCloseReview} motionPreset='scale' size='lg' scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader display='flex' textTransform='uppercase' color='blue.700'>
                    <ReviewIcon size='26' color='#2c5282' />
                    <Text>
                        Review Your Form
                    </Text>
                </ModalHeader>
                <ModalBody fontWeight='400' fontSize='15px' textAlign='center' lineHeight='1.5'>
                    <Text mb={3}>
                        Please take a moment to carefully review your form information.
                        Make sure all the details are correct and complete before proceeding.
                    </Text>
                    <Text mt={2} color="red.500">
                        Once you confirm, you may not be able to make changes.
                    </Text>
                </ModalBody>
                <ModalFooter display='flex' justifyContent='space-between'>
                    <Button 
                        fontWeight='400' fontSize='13px' 
                        variant='link' colorScheme='black' onClick={onCloseReview}>
                        Continue Editing
                    </Button>
                    <Button onClick={() => {handleSubmit()}}
                        leftIcon={<VerifyIcon size='24' color='#fff' />}
                        fontWeight='400' 
                        fontSize='13px' 
                        textTransform='uppercase' 
                        colorScheme="blue" 
                        bgColor='blue.700' 
                        shadow='md' 
                        isLoading={loading}
                        loadingText='Submitting Form...'
                    >
                        Confirm & Submit
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Appreciation Note-Modal */}
        <Modal isOpen={isOpenThankYou} closeOnOverlayClick={false} onClose={onCloseThankYou} size='xl' isCentered motionPreset='slideInBottom'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color='blue.700' fontWeight='800' w='full' textTransform='uppercase' textAlign='center'>{`Enrollment Submitted!`}</ModalHeader>
                <ModalBody>
                    <Box className='flex flex-col space-y-3 text-center'>
                        <Text fontWeight='500' fontSize='14px'>{`We appreciate your interest in Pentagon Maritime Services Corp. and for taking the time to complete our enrollment form.`}</Text>
                        <Text fontWeight='500' fontSize='14px'>{`Our team will review your submission and get back to you.`}</Text>
                        <Text fontWeight='500' fontSize='14px'>{`For your reference, you can take a screenshot of this page and send it as proof of your submission to our official email`}</Text>
                        <Text fontWeight='500' fontSize='14px'>{`If you have any questions or need further assistance, please don't hesitate to contact us.`}</Text>
                        <Text fontWeight='500' fontSize='14px'>{`You can contact us using the contact details below.`}</Text>
                        <Box w='full' placeItems='center'>
                            <UnorderedList w={{base: '85%', md: '55%'}} textAlign='start' lineHeight='1.7rem' fontSize='13px' fontWeight='400'>
                                <ListItem>{`Email: pentagonmaritimecorp@gmail.com`}</ListItem>
                                <ListItem>{`Contact no.: 0999-513-5916`}</ListItem>
                                <ListItem>Facebook: 
                                    <Link color='blue.400' isExternal href='https://www.facebook.com/Pentagonmaritimeservicescorp'> Pentagonmaritimeservicescorp <ExternalLinkIcon mx='2px' /></Link>
                                </ListItem>
                            </UnorderedList>
                        </Box>
                        <Text fontWeight='500' fontSize='14px'>{`Thank you once again for choosing Pentagon Maritime Services Corp. We look forward to assisting you on your maritime journey!`}</Text>
                    </Box>
                </ModalBody>
                <ModalFooter display='flex' justifyContent='center'>
                    <Button onClick={handleClose} colorScheme='blue' shadow='md' bgColor='blue.700'>{`Got it!`}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}