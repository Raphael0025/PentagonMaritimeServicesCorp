'use client'

import { useRouter } from 'next/navigation'
import { Timestamp } from 'firebase/firestore'
import Image from 'next/image'
import React, { useEffect, useState, } from 'react'
import DatePicker from 'react-datepicker'

import {TrashIcon, Loading, DownloadIcon, PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'
import {NextIcon, ListIcon, EmergencyIcon, CourseIcon, PlusIcon, ClipIcon, SignIcon, PolicyIcon, ReviewIcon, SubmitIcon, CheckIcon} from '@/Components/SideIcons'

import { Box, Text, Link, Tooltip, Switch, FormControl, Input, Alert, AlertTitle, AlertDescription, AlertIcon, InputLeftAddon, InputGroup, Heading, Button, useToast, useDisclosure, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Accordion, AccordionIcon, AccordionPanel, AccordionItem, AccordionButton } from '@chakra-ui/react'

//types
import { TRAINEE, initTRAINEE, TEMP_COURSES, TRAINEE_BY_ID, TRAINING } from '@/types/trainees'

import { addNewTrainee, addRegistrationDetails, addTrainingDetails, RE_ENROLLED_TRAINEE, changeImg } from '@/lib/trainee_controller'

import { generateDateRanges } from '@/handlers/course_handler'

import { useRank } from '@/context/RankContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourses } from '@/context/CourseContext'
import { useTypes } from '@/context/TypeContext'
import {useCategory} from '@/context/CategoryContext'

interface Props {
    oldTrainee: TRAINEE_BY_ID;
    onStepChange?: (step: number) => void;
}

export default function OldRegistrationForm({ oldTrainee, onStepChange = () => {} }: Props){
    const { data: allRanks } = useRank()
    const { data: allCourses } = useCourses()
    const { data: allCategories } = useCategory()
    const { area: allAreas, subArea: allSubArea } = useTypes()
    const {data: allClients, companyCharge: companyCharges, courseCodes: companyCourseCodes} = useClients()
    
    const {isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal} = useDisclosure()
    const {isOpen: isOpenAddress, onOpen: onOpenAddress, onClose: onCloseAddress} = useDisclosure()
    const {isOpen: isOpenCompany, onOpen: onOpenCompany, onClose: onCloseCompany} = useDisclosure()
    const {isOpen: isOpenVessel, onOpen: onOpenVessel, onClose: onCloseVessel} = useDisclosure()
        const {isOpen: isOpenRank, onOpen: onOpenRank, onClose: onCloseRank} = useDisclosure()

    const [birth_date, setBirthDate] = useState<Date | null>(new Date())

    const [show, setShow] = useState<string>('info')
    const [showAlert1, setShowAlert1] = useState<boolean>(false)
    const [showAlert2, setShowAlert2] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const [trainee, setTrainee] = useState<TRAINEE>(initTRAINEE)
    const [courses, setCourses] = useState<TEMP_COURSES[]>([])
    const [tempCourses, setTempCourses] = useState<TEMP_COURSES[]>([])

    const [idRef, setIDRef] = useState<string>('')
    const [sched, setSched] = useState<string>('')
    const [payment, setPayment] = useState<number>(0)
    const [courseRef, setCourseRef] = useState<string>('')
    const [companyRef, setCompanyRef] = useState<string>('')
    const [selectCompany, setSelectCompany] = useState<string>('')
    const [vesselRef, setVesselRef] = useState<string>('')
    const [selectedVessel, setSelectVessel] = useState<string>('')

    const [rankRef, setRankRef] = useState<string>('')
    const [selectedRank, setSelectedRank] = useState<string>('')

    const [otherAddress, setAddress] = useState<boolean>(false)

    // Str Array States
    const [trainingSched, setTrainingSched] = useState<string[]>([])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // File States
    const [validID, setValidID] = useState<File[]>([])
    const [valid, setValid] = useState<string >('')
    const [file, setFilename] = useState<string>('No file chosen yet...')

    const [validPfp, setPfp] = useState<File[]>([])
    const [ validProfile, setValidPfp] = useState<string>('')
    const [pfpFile, setPfpFile] = useState<string>('No file chosen yet...')

    const [validSignature, setSignature] = useState<File[]>([])
    const [validSig, setValidSig] = useState<string>('')
    const [sig_file, setSigFile] = useState<string>('No file chosen yet...')

    useEffect(() => {
        const fetchData = () => {
            const {id, ...rest} = oldTrainee
            setTrainee(rest)
            setIDRef(id)

            setValid(oldTrainee.valid_id)
            setValidPfp(oldTrainee.photo)
            setValidSig(oldTrainee.e_sig)

            setBirthDate(oldTrainee.birthDate.toDate())
        } 
        fetchData()
    }, [])

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
            setValidSig(objectUrl)
        } else {
            setSigFile('No file chosen yet...')
        }
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target
        setTrainee((prev) => ({
            ...prev,
            [id]: value
        }))
    }
    
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        
        setTrainee((prev) => ({
            ...prev,
            [id]: value.trim()
        }))
    }

    const handleSchedule = (id: string, type: string) => {
        if(type==='crew'){
            const courseFound = allCourses && allCourses.find((course) => course.id === id)
            let dateRange: string[] = []
            if(courseFound){
                dateRange = generateDateRanges(courseFound.day, 10, courseFound.numOfDays.toString())
            }
            setTrainingSched(dateRange)
            setCourseRef(id)
        }else if(type==='cc'){
            const companyFound = companyCharges && companyCharges.find((company) => company.id === id)
            let dateRange: string[] = []
            if(companyFound){
                dateRange = generateDateRanges(companyFound.day, 10, companyFound.numOfDays.toString())
            }
            setTrainingSched(dateRange)
            setCourseRef(id)
        }
    }

    const handleTempCourses = (courseData: string, courseFee: number, numOfDays: number) => {
        let templateData;
        if (numOfDays > 1) {
            const [startDate, endDate] = sched.split(" to ").map((date) => date.trim()); // Split into start_date and end_date
    
            templateData = {
                course: courseData,
                course_fee: courseFee,
                start_date: startDate,
                end_date: endDate,
                numOfDays,
                accountType: payment, // 0 - crew | 1 - company
                payment_mode: 0, // 0 - cash | 1 - gcash | 2 - bank
            };
        } else {
            templateData = {
                course: courseData,
                course_fee: courseFee,
                start_date: sched,
                end_date: '',
                numOfDays,
                accountType: payment, // 0 - crew | 1 - company
                payment_mode: 0, // 0 - cash | 1 - gcash | 2 - bank
            };
        }
        
        setTempCourses((prev) => [...prev, templateData])
    }

    const handleCourses = () => {
        setCourses((prev) => [
            ...prev,
            ...tempCourses
        ])
        setTempCourses([])
    }

    const handleRemoveCourse = (index: number) => {
        setCourses((prev) => prev.filter((_, i) => i !== index))
    }

    const handleNextStep = (step: number) => {
        if(step === 1){
            setTrainee((prev) => ({
                ...prev,
                birthDate: birth_date ? Timestamp.fromDate(birth_date) : Timestamp.now()
            }))
            setShow('train');
            onStepChange(1); 
        } else if (step === 2){
            if(courses.length === 0 || trainee.marketing === ''){
                setShowAlert2(true)
            }else {
                setShowAlert2(false)
                setShow('review');
                onStepChange(2); 
            }
        }
        scrollToTop()
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
            const traineeType: number = 1
            
            if(checkTraineeChanges()){
                await RE_ENROLLED_TRAINEE(idRef, trainee)
            }
            if(file !== 'No file chosen yet...'){
                await changeImg(idRef, trainee.last_name, trainee.first_name, 'validID', 'valid_id', validID, file, 'Re-Enrolled Trainee')                
            }
            if(pfpFile !== 'No file chosen yet...') {
                await changeImg(idRef, trainee.last_name, trainee.first_name, 'idPic', 'photos', validPfp, pfpFile, 'Re-Enrolled Trainee')
            }
            if (sig_file !== 'No file chosen yet...') {
                await changeImg(idRef, trainee.last_name, trainee.first_name, 'esign', 'e-signs', validSignature, sig_file, 'Re-Enrolled Trainee')
            }
            await fetch('/api/send-mail', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                }, 
                body: JSON.stringify({
                    to: trainee.email,
                    subject: 'Pentagon Maritime Services Corp.',
                    text: 'Thank you again for submitting your online registration form, someone will assist you once your registration is verified. Thank you have a nice day!',
                    last_name: trainee.last_name,
                    first_name: trainee.first_name,
                })
            })
            
            const regApproach: number = 0
            onStepChange(4)
            setShow('completed')
            
            const ccArr = []
            const crewArr = []
            for(const course of courses){
                if(course.accountType === 0){
                    crewArr.push(course)
                }else{
                    ccArr.push(course)
                }
            }
            let regCCID, regCrewID
            if(ccArr.length !== 0){
                let fee: number = 0
                for(const course of ccArr){
                    fee = course.course_fee + fee
                }
                regCCID = await addRegistrationDetails(idRef, fee, regApproach, traineeType, 1)
                for(const course of ccArr){
                    try{
                        if(regCCID){
                            await addTrainingDetails(course, regCCID)
                        }
                    }catch(error){
                        console.error('Failed to process this: ', error)
                    }
                }
            }

            if(crewArr.length !== 0){
                let fee: number = 0
                for(const course of crewArr){
                    fee = course.course_fee + fee
                }
                regCrewID = await addRegistrationDetails(idRef, fee, regApproach, traineeType, 0)
                for(const course of crewArr){
                    try{
                        if(regCrewID){
                            await addTrainingDetails(course, regCrewID)
                        }
                    }catch(error){
                        console.error('Failed to process this: ', error)
                    }
                }
            }
        } catch(error){
            throw error
        } finally {
            setLoading(false)
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

    const handleVessel = (ves: string) => {
        setSelectVessel(ves)
    }

    const handleRank = (rank: string) => {
        setSelectedRank(rank)
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

    return(
    <>
    <Box className='space-y-3'>
        <Box className={`${show === 'info' ? '' : 'hidden'} rounded border outline-0 uppercase shadow-md flex p-3 space-x-3 animate__animated animate__fadeInLeftBig`}>
            <ListIcon size={'24'} color={'#a1a1a1'} />
            <Text className='text-sky-700 text-lg'>Please make sure your details are Up-to-date, otherwise change it.</Text>
        </Box>
        <Box className={`${show === 'info' ? '' : 'hidden'} rounded border outline-0 uppercase shadow-md space-y-8 p-7 animate__animated animate__fadeInRight`}>
            <Box className='flex flex-col items-center w-full md:w-auto'>
                <Box className='flex items-center w-full space-x-2 '>
                    <ListIcon size={'24'} color={'#a1a1a1'} />
                    <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Trainee's Information`}</Heading>
                </Box>
            </Box>
            <Box className='space-y-6'>
                <Box display='flex' gridGap={4} flexDir={{md:'row', base:'column'}} >
                    <FormControl isInvalid={trainee.last_name === '' && showAlert1}>
                        <label className='text-gray-400'>Last Name:</label>
                        <Input id='last_name' value={trainee.last_name} onChange={handleOnChange} type='text' className='shadow-md uppercase' />
                    </FormControl>
                    <FormControl isInvalid={trainee.first_name === '' && showAlert1}>
                        <label className='text-gray-400'>First Name:</label>
                        <Input id='first_name' value={trainee.first_name} onChange={handleOnChange} type='text' className='shadow-md uppercase' />
                    </FormControl>
                    <FormControl >
                        <label className='text-gray-400'>Middle Name:</label>
                        <Input id='middle_name' value={trainee.middle_name} onChange={handleOnChange} type='text' className='shadow-md uppercase' />
                    </FormControl>
                    <FormControl w={{md: '30%', base: '100%'}} className='w-full'>
                        <label className='text-gray-400'>Suffix:</label>
                        <Input id='suffix' value={trainee.suffix} onChange={handleOnChange} type='text' className='shadow-md uppercase' />
                    </FormControl>
                </Box>
                <Box display='flex' gridGap={4} flexDir={{md:'row', base:'column'}} >
                    <FormControl isInvalid={trainee.srn === '' && showAlert1}>
                        <label className='text-gray-400'>srn:</label>
                        <Input id='srn' value={trainee.srn} onChange={handleOnChange} className='shadow-md uppercase' />
                    </FormControl>
                    <FormControl className='flex flex-col space-y-2 items-start border-2 rounded shadow-md px-8 py-2 md: space-y-0 md:flex-row md:space-x-3 md:items-center' isInvalid={trainee.rank === '' && showAlert1}>
                        <label className='text-gray-400'>rank:<span className='text-red-700'>*</span></label>
                        <Button className='uppercase' onClick={() => {onOpenRank(); setRankRef(''); setSelectedRank('');}} variant='ghost' colorScheme='blue'>
                        {allRanks?.find((rank) => rank.code === trainee.rank)?.rank || (trainee.rank === '' ? 'SELECT RANK' : trainee.rank)}
                        </Button>
                    </FormControl>
                    <FormControl isInvalid={trainee.email === '' && showAlert1}>
                        <label className='text-gray-400'>email:</label>
                        <Input id='email' value={trainee.email} onChange={handleOnChange} className='shadow-md' />
                    </FormControl>
                    <FormControl isInvalid={trainee.contact_no === '' && showAlert1}>
                        <label className='text-gray-400'>contact no.:</label>
                        <Input id='contact_no' value={trainee.contact_no} type='tel' onChange={handleOnChange} className='shadow-md' />
                    </FormControl>
                </Box>
                <Box display='flex' gridGap={4} flexDir={{md:'row', base:'column'}} >
                    <FormControl isInvalid={trainee.gender === '' && showAlert1}>
                        <label className='text-gray-400'>Gender:</label>
                        <Select id='gender' value={trainee.gender} onChange={handleSelect} className='uppercase'>
                            <option hidden>Select Gender</option>
                            <option value={'male'}>Male</option>
                            <option value={'female'}>Female</option>
                        </Select>
                    </FormControl>
                    <FormControl isInvalid={trainee.nationality === '' && showAlert1}>
                        <label className='text-gray-400'>nationality:</label>
                        <Input id='nationality' value={trainee.nationality} onChange={handleOnChange} className='shadow-md uppercase' />
                    </FormControl>
                    <FormControl className='flex flex-col' isInvalid={trainee.birthDate === Timestamp.now() && showAlert1}>
                        <label className='text-gray-400'>Birth Date:</label>
                        <DatePicker showPopperArrow={false} selected={birth_date} onChange={(date) => setBirthDate(date)} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd, yyyy'
                            customInput={<Input id='birth_date' textAlign='center' className='shadow-md' /> } />
                        <Text className='mt-2 text-black' style={{fontSize: '9px'}}>You can select a date from the calendar or type it directly in the field above</Text>
                    </FormControl>
                    <FormControl isInvalid={trainee.birthPlace === '' && showAlert1}>
                        <label className='text-gray-400'>birth place:</label>
                        <Input id='birthPlace' value={trainee.birthPlace} onChange={handleOnChange} className='shadow-md uppercase' />
                    </FormControl>
                </Box>
                <Box display='flex' gridGap={4} flexDir={{md:'row', base:'column'}} >
                    <FormControl className='flex flex-col space-y-2 items-start md:space-y-0 md:flex-row md:space-x-3 md:items-center'>
                        <label className='text-gray-400'>Address:</label>
                        <Button onClick={onOpenAddress} className='uppercase' variant='ghost' colorScheme='blue' >
                        {otherAddress ? trainee.otherAddress !== '' ? trainee.otherAddress : 'Add Address' : trainee.house_no !== '' || trainee.street !== '' || trainee.brgy !== '' || trainee.city !== '' ? `${trainee.house_no} ${trainee.street} ${`Brgy. ${trainee.brgy}`} ${`${trainee.city} City`}` : 'Add Address'}
                        </Button>
                    </FormControl>
                </Box>
                <Box display='flex' gridGap={4} flexDir={{md:'row', base:'column'}} >
                    <FormControl className='flex flex-col space-y-2 border-2 rounded shadow-md px-6 items-start md:space-y-0 md:flex-row md:space-x-3 md:items-center' isInvalid={trainee.vessel === '' && showAlert1}>
                        <label className='text-gray-400'>Verssel Type:<span className='text-red-700'>*</span></label>
                        <Button className='uppercase' onClick={() => {onOpenVessel(); setVesselRef(''); setSelectVessel('');}} variant='ghost' colorScheme='blue'>
                            {trainee.vessel === '' ? 'ADD VESSEL' : trainee.vessel}
                        </Button>
                    </FormControl>
                    {/** Company-modal */}
                    <FormControl className='flex flex-col space-y-2 items-start md:space-y-0 md:flex-row md:space-x-3 md:items-center' isInvalid={trainee.company === '' && showAlert1}>
                        <label className='text-gray-400'>Company:</label>
                        <Button className='uppercase' onClick={() => {onOpenCompany(); setCompanyRef(''); setSelectCompany('');}} variant='ghost' colorScheme='blue'>
                        {allClients?.find((client) => client.id === trainee.company)?.company || (trainee.company === '' ? 'ADD COMPANY' : trainee.company)}
                        </Button>
                    </FormControl>
                    <FormControl isInvalid={trainee.endorser === '' && showAlert1}>
                        <label className='text-gray-400'>Endorser:</label>
                        <Input id='endorser' value={trainee.endorser} onChange={handleOnChange} className='shadow-md uppercase' />
                    </FormControl>
                </Box>
                <Box display='flex' gridGap={4} flexDir={{md:'row', base:'column'}} >
                    <FormControl isInvalid={trainee.e_contact_person === '' && showAlert1}>
                        <label className='text-gray-400'>Emergency Contact:</label>
                        <Input id='e_contact_person' value={trainee.e_contact_person} onChange={handleOnChange} className='shadow-md uppercase' />
                    </FormControl>
                    <FormControl isInvalid={trainee.e_contact === '' && showAlert1}>
                        <label className='text-gray-400'>Contact No.:</label>
                        <Input id='e_contact' value={trainee.e_contact} onChange={handleOnChange} className='shadow-md uppercase' />
                    </FormControl>
                    <FormControl isInvalid={trainee.relationship === '' && showAlert1}>
                        <label className='text-gray-400'>Relationship:</label>
                        <Input id='relationship' value={trainee.relationship} onChange={handleOnChange} className='shadow-md uppercase' />
                    </FormControl>
                </Box>
                <Box className='flex space-y-3 flex-col'>
                    <Box>
                        <Text className='uppercase text-gray-400'>Attachments:</Text>
                    </Box>
                    <Box display='flex' gridGap={4} flexDir={{md:'row', base:'column'}} >
                        <FormControl className='flex-col'>
                            <Box className='flex-col w-full'>
                                <Text className='w- w-fullfull'>Please upload Valid ID</Text>
                                <Text className='w-full'><span className='text-red-500'>*</span><span className='italic' style={{fontSize: '9px'}}>(Preferably: Passport ID)</span></Text>
                            </Box>
                            <Input id='valid_id' onChange={handleValidID} className='p-2 flex items-center border-white' accept='.png, .jpg' type='file' />
                            <Box className='p-4 mt-3 rounded border shadow-md flex items-center justify-center'>
                                {valid !== '' && <Image src={valid} width={200} height={200} alt={'picture'}/>}
                            </Box>
                        </FormControl>
                        <FormControl className='flex-col'>
                            <Box className='flex-col w-full'>
                                <Text className='w- w-fullfull'>Please upload a 2x2 ID photo. </Text>
                                <Text className='w-full'><span className='text-red-500'>*</span><span className='italic' style={{fontSize: '9px'}}>(Note: Ensure photo is clear, and wear your uniform.)</span></Text>
                            </Box>
                            <Input id='photo' onChange={handleValid2x2} className='p-2 flex items-center border-white' accept='.png, .jpg' type='file' />
                            <Box className='p-4 mt-3 rounded border shadow-md flex items-center justify-center'>
                                {validProfile !== '' && <Image src={validProfile} width={200} height={200} alt={'picture'}/>}
                            </Box>
                        </FormControl>
                        <FormControl className='flex-col'>
                            <Box className='flex-col w-full'>
                                <Text className='w- w-fullfull'>Please attach your written signature here.</Text>
                                <Text className='w-full'><span className='italic' style={{fontSize: '9px'}}>(Note: photo must be clear.)</span></Text>
                            </Box>
                            <Input id='e_sig' onChange={handleValidSignature} className='p-2 flex items-center border-white' accept='.png, .jpg' type='file' />
                            <Box className='p-4 mt-3 rounded border shadow-md flex items-center justify-center'>
                                {validSig !== '' && <Image src={validSig} width={200} height={200} alt={'picture'}/>}
                            </Box>
                        </FormControl>
                    </Box>
                </Box>
                <Box className='flex justify-end'>
                    <Button className='w-full md:w-1/4' onClick={() => {handleNextStep(1)}} colorScheme='blue'>Proceed to Next Step</Button>
                </Box>
            </Box>
        </Box>
        <Box className={`${show === 'train' ? '' : 'hidden'} rounded border outline-0 uppercase shadow-md space-y-6 p-7 animate__animated animate__fadeInRight`}>
            {showAlert2 && (
                <Alert status='info' variant='left-accent' className='flex-col mb-4 items-center justify-center'>
                    <Box className='flex w-full items-center justify-center'>
                        <AlertIcon />
                        <AlertTitle fontSize='18px' fontWeight='700'>
                            <p>Please select some of our courses offered.</p>
                        </AlertTitle>
                    </Box>
                    <AlertDescription className='flex w-full'>
                        <Box className='w-full flex'>
                            <Box className='flex flex-col w-full'>
                                <p>{courses.length === 0  ? `You haven't selected any courses.` : ''}</p>
                                <p>{trainee.marketing === '' ? `* Marketing.` : ''}</p>
                            </Box>
                        </Box>
                    </AlertDescription>
                </Alert>
            )}
            <Box className='flex flex-col items-center w-full md:w-auto'>
                <Box className='flex items-center w-full space-x-2 '>
                    <CourseIcon size={'24'} color={'#a1a1a1'} />
                    <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Course Selection:`}</Heading>
                </Box>
            </Box>
            <Box className='space-y-3'>
                <Box className='space-y-3'>
                {courses.length === 0 ? (
                <>
                    <Box className='flex-col flex items-center justify-center'>
                        <Text className='text-gray-400 text-lg'>Click the button to select a course</Text>
                        <Button onClick={onOpenModal} colorScheme='blue' className='uppercase' >Select Course</Button>
                    </Box> 
                </>
                ) : (
                <>
                    <Box className='flex justify-between'>
                        <Text className='font-bold text-base text-sky-600'>Courses Selected:</Text>
                        <Button size='sm' onClick={onOpenModal} colorScheme='blue' className='uppercase' >Select Course</Button>
                    </Box>
                    <Box display={{md: 'none'}} className='space-y-6'>
                    {courses && courses.map((course, index) => (
                        <Box key={index} className='flex justify-between border uppercase items-center shadow-md py-3 rounded px-3'>
                            <Box w='60%' className='flex flex-col space-y-2'>
                                <Text w='70%'>
                                    {allCourses && allCourses.find((courseFound) => courseFound.id === course.course)?.course_name || ''}
                                </Text>
                                <Box className=''>
                                {course.end_date === '' ? (
                                    <Box className='flex flex-col space-y-1'>
                                        <Text className='text-gray-400' >Date:</Text>
                                        <Text>{course.start_date}</Text>
                                    </Box>
                                ) : (
                                    <Box className='flex flex-col space-y-1'>
                                        <Text className='text-gray-400' >Date:</Text>
                                        <Box className='flex space-x-2'>
                                            <Text>{`${course.start_date} to`}</Text>
                                            <Text>{`${course.end_date}`}</Text>
                                        </Box>
                                    </Box>
                                )}
                                </Box>
                            </Box>
                            <Box className='flex flex-col space-y-2' w='30%'>
                                <Button onClick={() => handleRemoveCourse(index)} colorScheme='red' variant='ghost'><TrashIcon color='red' size='24'/></Button>
                                <Text>{`${course.accountType === 0 ? `Php ${course.course_fee}` : '--'}`}</Text>
                                <Text>{`${course.accountType === 0 ? 'CREW' : 'company'} charge`}</Text>
                            </Box>
                        </Box>
                    ))}
                    </Box>
                    <Box display={{base: 'none', md: 'flex'}} className='space-y-6 flex-col'>
                        <Box className='flex justify-between uppercase items-center p-3 bg-sky-600 text-white rounded px-8 shadow-md'>
                            <Text w='60%' >Course</Text>
                            <Text w='60%' className='text-center'>Training Schedule</Text>
                            <Text w='40%' >Course Fee</Text>
                            <Text w='40%' >Payment Mode</Text>
                            <Text w='20%'>Action</Text>
                        </Box>
                        {courses && courses.map((course, index) => (
                            <Box key={index} className='flex justify-between uppercase items-center shadow-md p-3 rounded px-8'>
                                <Text w='60%' >
                                    {allCourses && allCourses.find((courseFound) => courseFound.id === course.course)?.course_name || ''}
                                </Text>
                                <Box w='60%'  className='flex items-center justify-center'>
                                {course.end_date === '' ? (
                                    <>
                                        <Text>{course.start_date}</Text>
                                    </>
                                ) : (
                                    <Box className='flex space-x-1'>
                                        <Text>{`${course.start_date} to`}</Text>
                                        <Text>{`${course.end_date}`}</Text> 
                                    </Box>
                                )}
                                </Box>
                                <Text w='40%' >{`${course.accountType === 0 ? `Php ${course.course_fee}` : '--'}`}</Text>
                                <Text w='40%' >{`${course.accountType === 0 ? 'CREW' : 'company'} charge`}</Text>
                                <Box w='20%'>
                                    <Button onClick={() => handleRemoveCourse(index)} size='sm' colorScheme='red'>Remove</Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </>
                )}
                <FormControl isInvalid={trainee.marketing === '' && showAlert2}>
                    <label className='text-gray-400'>How did you find out about us?:</label>
                    <Select id='marketing' onChange={handleSelect} className='uppercase'>
                        <option hidden>Select one of the ff.</option>
                        <option value={'agent'}>Agent</option>
                        <option value={'company'}>Company</option>
                        <option value={'walk-in'}>Walk-in</option>
                        <option value={'soc-med'}>Social Media</option>
                    </Select>
                </FormControl>
                </Box>
            </Box>
            <Box className='flex justify-between'>
                <Button onClick={() => { onStepChange(1); setShow('info'); }} colorScheme='gray'>Back</Button>
                <Button onClick={() => { handleNextStep(2) }} colorScheme='blue'>Review your Form</Button>
            </Box>
        </Box>
        <Box className={`${show === 'review' ? '' : 'hidden'} rounded border outline-0 uppercase shadow-md space-y-6 p-7 animate__animated animate__fadeInRight`}>
            <Text className='text-sky-600 text-lg'>Review your Form</Text>
            <Box className='space-y-3'>
                <Box className='flex flex-col md:space-y-0 md:flex-row space-y-3 md:space-x-4'>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>Last Name:</Text>
                        <Text>{trainee.last_name}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>First Name:</Text>
                        <Text>{trainee.first_name}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>Middle Name:</Text>
                        <Text>{trainee.middle_name}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>Suffix:</Text>
                        <Text>{trainee.suffix}</Text>
                    </Box>
                </Box>
                <Box className='flex flex-col md:space-y-0 md:flex-row space-y-3 md:space-x-4'>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>Rank:</Text>
                        <Text>{trainee.rank}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>srn:</Text>
                        <Text>{trainee.srn}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>email:</Text>
                        <Text>{trainee.email}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>contact no:</Text>
                        <Text>{trainee.contact_no}</Text>
                    </Box>
                </Box>
                <Box className='flex flex-col md:space-y-0 md:flex-row space-y-3 md:space-x-4'>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>gender:</Text>
                        <Text>{trainee.gender}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>nationality:</Text>
                        <Text>{trainee.nationality}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>birthDate:</Text>
                        <Text>{trainee.birthDate
                        ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(trainee.birthDate.toDate())
                        : 'N/A'}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>birthPlace:</Text>
                        <Text>{trainee.birthPlace}</Text>
                    </Box>
                </Box>
                <Box className='flex flex-col md:space-y-0 md:flex-row space-y-3 md:space-x-4'>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>address:</Text>
                        <Text>{trainee.otherAddress  ? trainee.otherAddress  : `${trainee.house_no} ${trainee.street} ${trainee.brgy} ${trainee.city} City`.trim()}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>vessel:</Text>
                        <Text>{trainee.vessel}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>company:</Text>
                        <Text>
                        {allClients?.find((client) => client.id === trainee.company)?.company || ''}
                        </Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>endorser:</Text>
                        <Text>{trainee.endorser}</Text>
                    </Box>
                </Box>
                <Box className='flex flex-col md:space-y-0 md:flex-row space-y-3 md:space-x-4'>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>Emergency contact:</Text>
                        <Text>{trainee.e_contact_person}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>contact No.:</Text>
                        <Text>{trainee.e_contact}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>relationship:</Text>
                        <Text>{trainee.relationship}</Text>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Text className='text-gray-400'>marketing:</Text>
                        <Text>{trainee.marketing}</Text>
                    </Box>
                </Box>
                <Box className='flex flex-col md:space-y-0 md:flex-row space-y-3 md:space-x-4'>
                    <Box className='flex w-full space-x-3'>
                        <Box className='flex flex-col md:flex-row justify-between w-full'>
                            <Box className='flex flex-col w-full'>
                                <Text color='#a1a1a1'>2x2 ID Picture:</Text>
                                {validProfile ? (
                                    <Image src={validProfile as string} width={150} height={150} alt='2x2 ID Picture' />
                                ) : (
                                    <Text color='#a1a1a1'>No 2x2 ID Picture Provided</Text>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Box className='flex flex-col w-full'>
                            <Text color='#a1a1a1'>Valid ID:</Text>
                            {valid ? (
                                <Image src={valid as string} width={150} height={150} alt='Valid ID' />
                            ) : (
                                <Text color='#a1a1a1'>No Valid ID Provided</Text>
                            )}
                        </Box>
                    </Box>
                    <Box className='flex w-full space-x-3'>
                        <Box className='flex flex-col w-full'>
                            <Text color='#a1a1a1'>Signature:</Text>
                            {validSig ? (
                                <Image src={validSig as string} width={150} height={150} alt='Valid ID' />
                            ) : (
                                <Text color='#a1a1a1'>No Signature Provided</Text>
                            )}
                        </Box>
                    </Box>
                </Box>
                <Box className='flex flex-col  space-y-3'>
                    <Box className='flex justify-between'>
                        <Text className='font-bold text-base text-sky-600'>Courses Selected:</Text>
                    </Box>
                    <Box className='space-y-6 md:hidden'>
                    {courses && courses.map((course, index) => (
                        <Box key={index} className='flex justify-between border uppercase items-center shadow-md py-3 rounded px-3'>
                            <Box w='60%' className='flex flex-col space-y-2'>
                                <Box w='70%' className='flex flex-col space-y-1'>
                                    <Text className='text-gray-400'>Course:</Text>
                                    <Text>
                                        {allCourses && allCourses.find((courseFound) => courseFound.id === course.course)?.course_name || ''}
                                    </Text>
                                </Box>
                                <Box className=''>
                                {course.end_date === '' ? (
                                    <Box className='flex flex-col space-y-1'>
                                        <Text className='text-gray-400' >Date:</Text>
                                        <Text>{course.start_date}</Text>
                                    </Box>
                                ) : (
                                    <Box className='flex flex-col space-y-1'>
                                        <Text className='text-gray-400' >Date:</Text>
                                        <Box className='flex space-x-2'>
                                            <Text>{`${course.start_date} to`}</Text>
                                            <Text>{`${course.end_date}`}</Text>
                                        </Box>
                                    </Box>
                                )}
                                </Box>
                            </Box>
                            <Box className='flex flex-col space-y-2' w='30%'>
                                <Text>{`${course.accountType === 0 ? `Php ${course.course_fee}` : '--'}`}</Text>
                                <Text>{`${course.accountType === 0 ? 'CREW' : 'company'} charge`}</Text>
                            </Box>
                        </Box>
                    ))}
                    </Box>
                    <Box className='space-y-6 hidden md:flex flex-col'>
                        <Box className='flex justify-between uppercase items-center p-3 bg-sky-600 text-white rounded px-8 shadow-md'>
                            <Text w='60%' >Course</Text>
                            <Text w='60%' className='text-center'>Training Schedule</Text>
                            <Text w='40%' >Course Fee</Text>
                            <Text w='40%' >Payment Mode</Text>
                        </Box>
                        {courses && courses.map((course, index) => (
                            <Box key={index} className='flex justify-between uppercase items-center shadow-md p-3 rounded px-8'>
                                <Text w='60%' >
                                    {allCourses && allCourses.find((courseFound) => courseFound.id === course.course)?.course_name || ''}
                                </Text>
                                <Box w='60%'  className='flex items-center justify-center'>
                                {course.end_date === '' ? (
                                    <>
                                        <Text>{course.start_date}</Text>
                                    </>
                                ) : (
                                    <Box className='flex space-x-1'>
                                        <Text>{`${course.start_date} to`}</Text>
                                        <Text>{`${course.end_date}`}</Text> 
                                    </Box>
                                )}
                                </Box>
                                <Text w='40%' >{`${course.accountType === 0 ? `Php ${course.course_fee}` : '--'}`}</Text>
                                <Text w='40%' >{`${course.accountType === 0 ? 'CREW' : 'company'} charge`}</Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
            <Box className='flex md:flex-row flex-col space-y-4 md:space-y-0  md:justify-between'>
                <Button onClick={() => { onStepChange(2); setShow('train'); }} className='shadow-md uppercase' colorScheme='gray'>Back</Button>
                <Button onClick={handleSubmit} isLoading={loading} className='shadow-md uppercase' loadingText='Submitting...' colorScheme='blue'>Submit Form</Button>
            </Box>
        </Box>
        <Box className={`${show === 'completed' ? '' : 'hidden'} flex items-center justify-centerrounded border outline-0 uppercase shadow-md space-y-6 p-7 animate__animated animate__fadeInRight`}>
            <Box className='w-full flex flex-col items-center justify-center'>
                <Box className='w-full'>
                    <Heading as='h1' size='xl' className='text-db w-full text-center mb-2'>Thank You!</Heading>
                    <Text fontSize='md' className='text-db w-full uppercase text-center'>{`Thank you for your registration! We'll reach out to you soon via phone or email.`}</Text>
                </Box>
                <CheckIcon size={'180'} color={'#1c4f92'} />
                <Box className='w-5/6 md:w-full place-items-center space-y-3'>
                    <Text fontSize='md' className='text-db w-full uppercase text-center'>{` For any urgent concerns, feel free to contact us.`}</Text>
                    <Box className=' space-y-3 flex flex-col place-items-center'>
                        <Box className='flex space-x-1 justify-center items-center'>
                            <PhoneIcon size={'28'} color={'#1C437E'} />
                            <Text fontSize='md' className='text-db w-full uppercase text-center'>{` 0999-513-5916`}</Text>
                        </Box>
                        <Box className='flex space-x-1 justify-center items-center'>
                            <MailIcon size={'24'} color={'#1C437E'} />
                            <Text fontSize='md' className='text-db w-full text-center'>{` pentagonmaritimeservicescorp@gmail.com`}</Text>
                        </Box>
                        <Box className='flex space-x-1 justify-center items-center'>
                            <FacebookIcon size={'24'} color={'#1C437E'} />
                            <Link href='https://www.facebook.com/Pentagonmaritimeservicescorp' isExternal>
                                <Text className='text-db w-full text-xs md:text-base text-center'>{` https://www.facebook.com/Pentagonmaritimeservicescorp`}</Text>
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
    {/** Company-modal */}
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
                        <Text className='text-gray-400 text-base'>Select your company below</Text>
                        {allClients && allClients.filter((company) => !companyRef || company.company.toLowerCase().includes(companyRef.toLowerCase())).sort((a, b) => a.company.localeCompare(b.company)).map((company) => (
                            <Text key={company.id} onClick={() => handleCompany(company.id)} className={`${company.id === selectCompany ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{company.company}</Text>
                        ))}
                    </Box>
                    <Text className='text-gray-400 text-center text-base'>{`Tip: If your company is not provided here, you can type it on the text box at the top and click done.`}</Text>
                </Box>
            </ModalBody>
            <ModalFooter borderTopWidth='1px'>
                <Button onClick={onCloseCompany} mr={3} >Close</Button>
                <Button isDisabled={companyRef.trim() === '' && selectCompany.trim() === ''} onClick={handleSelectedCompany} colorScheme='blue'>Done</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    <Modal isOpen={isOpenAddress} onClose={onCloseAddress} size='xl' scrollBehavior='inside' motionPreset='slideInTop' >
        <ModalOverlay/>
        <ModalContent className='px-3'>
            <ModalHeader className='font-bolder text-sky-700 uppercase'>Provide your Address</ModalHeader>
            <ModalBody>
                <Box className='space-y-3'>
                    <FormControl className='uppercase'>
                        <label className='text-gray-400'>House No./Bldg.</label>
                        <Input id='house_no' onChange={handleOnChange} isDisabled={otherAddress !== false} className='uppercase shadow-md'/>
                    </FormControl>
                    <FormControl className='uppercase'>
                        <label className='text-gray-400'>Street</label>
                        <Input id='street' onChange={handleOnChange} isDisabled={otherAddress !== false} className='uppercase shadow-md'/>
                    </FormControl>
                    <FormControl className='uppercase'>
                        <label className='text-gray-400'>City</label>
                        <Select id='city' isDisabled={otherAddress !== false} onChange={handleSelect} className='shadow-md uppercase'>
                            <option hidden>Select City</option>
                            {allCategories && allCategories.filter(category => category.category === 'geographic' && category.selectedType === 'City')
                            .map((natData) => (
                                <option key={natData.id} value={natData.type}>{natData.type}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl className='uppercase'>
                        <label className='text-gray-400'>Area</label>
                        <Select id='area' isDisabled={otherAddress !== false} onChange={handleSelect} className='shadow-md uppercase'>
                            <option hidden>Select Location</option>
                            {allCategories && allCategories.filter(cityData => cityData.type === trainee.city)
                            .map((cityData) => {
                                const matchingAreas = allAreas?.filter(area => area.ref_city === cityData.id) || []
                                return matchingAreas.map((area) => (
                                    <option key={area.id} value={area.id}>{`${area.zipCode} - ${area.location}`}</option>
                                ))
                            })}
                        </Select>
                    </FormControl>
                    <FormControl className='uppercase'>
                        <label className='text-gray-400'>Barangay</label>
                        <Select id='brgy' isDisabled={otherAddress !== false} onChange={handleSelect} className='shadow-md uppercase'>
                            <option hidden>Select Brgy</option>
                            {allSubArea && allSubArea
                                .filter(subarea => subarea.location_ref === trainee.area)
                                .map((subarea) => (
                                    <option key={subarea.id} value={subarea.brgy}>{`Brgy. ${subarea.brgy}`}</option> 
                                ))
                            }
                        </Select>
                    </FormControl>
                    <Text className='text-gray-400'>
                        {`Note: if you can't select any data from the fields provided, just click the switch to provide your address below.`}
                    </Text>
                    <FormControl className='flex items-center space-x-3'>
                        <label htmlFor='otherAddress'>Provide Address:</label>
                        <Switch id='otherAddress' onChange={() => setAddress(!otherAddress)} />
                    </FormControl>
                    <FormControl>
                        <label className='text-gray-400'>Address</label>
                        <Input id='otherAddress' isDisabled={otherAddress === false} onChange={handleOnChange} className='uppercase shadow-md'/>
                    </FormControl>
                </Box>
            </ModalBody>
            <ModalFooter>
                <Button onClick={onCloseAddress} colorScheme='blue'>Done</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    <Modal isOpen={isOpenModal} onClose={onCloseModal} scrollBehavior="inside" motionPreset="slideInTop" size="xl">
        <ModalOverlay />
        <ModalContent className="px-3">
            <ModalHeader className="text-sky-700 font-bold">Courses Selection</ModalHeader>
            <ModalBody>
                <Box className='pb-3 text-center text-sm flex space-x-3'>
                    <Alert status='info' variant='left-accent'>
                        <AlertIcon />
                        <AlertDescription>{`Select the desired course, click "Select" to save, then click "Close."`}</AlertDescription>
                    </Alert>
                </Box>
                <Box>
                    {trainee.company && companyCharges?.some((charge) => charge.company_ref === trainee.company) ? (
                    <Box className="p-3 pt-0">
                        <Text className="text-gray-400 text-lg">Course For you:</Text>
                        <Accordion allowToggle className="space-y-3">
                        {allCourses?.slice().sort((a, b) => a.course_code.localeCompare(b.course_code)).map((course, index) => {
                            // Find matching company charges
                            const matchingCharges = companyCharges?.filter(
                                (charge) => charge.course_ref === course.id && charge.company_ref === trainee.company
                            )

                            if (!matchingCharges || matchingCharges.length === 0) return null;

                            const matchingCourseCodes = companyCourseCodes?.filter(
                                (courseCode) =>
                                    courseCode.id_company_ref === trainee.company &&
                                    courseCode.id_course_ref === course.id
                            )

                            if (!matchingCourseCodes || matchingCourseCodes.length === 0) return null;

                            return (
                                <AccordionItem key={index} border='2px' borderColor={`${ tempCourses.some((temp) => temp.course === course.id) ? "green.500" : "gray.50" }`} className={`uppercase rounded shadow-md`}>
                                    {matchingCourseCodes.map((courseCode) => (
                                        <div key={courseCode.id}>
                                            <AccordionButton className="flex uppercase justify-between" onClick={() => { handleSchedule(matchingCharges[0].id, "cc"); }} >
                                                <Text> {courseCode.company_course_code} - {course.course_name} </Text>
                                                <AccordionIcon />
                                            </AccordionButton>
                                            <AccordionPanel className="space-y-3">
                                                <Box className="flex flex-col justify-between space-y-4">
                                                    <Box>
                                                        <Text className="text-gray-400 w-full">Training Schedule</Text>
                                                        <Select isDisabled={courseRef !== matchingCharges[0].id} onChange={(e) => setSched(e.target.value)} className="uppercase" size="sm" >
                                                            <option hidden>Select Schedule</option>
                                                            {trainingSched.map((date, index) => (
                                                                <option key={index}>{date}</option>
                                                            ))}
                                                        </Select>
                                                    </Box>
                                                    <Box>
                                                        <Text className="text-gray-400 w-full">Payment Mode</Text>
                                                        <Select isDisabled={courseRef !== matchingCharges[0].id} onChange={(e) => setPayment(Number(e.target.value))} className="uppercase" size="sm" >
                                                            <option hidden>Select Payment</option>
                                                            <option value={0}>Crew Charge</option>
                                                            <option value={1}>Company Charge</option>
                                                        </Select>
                                                    </Box>
                                                </Box>
                                                <Box className="flex w-full">
                                                    {tempCourses.some((temp) => temp.course === course.id) ? (
                                                        <Text bg='teal.500' className="text-sm rounded p-2 text-white" textAlign='center'  w='100%' fontWeight="700" > SELECTED </Text>
                                                    ) : (
                                                        <Button isDisabled={tempCourses.some( (temp) => temp.course === course.id )} colorScheme="blue" onClick={() => { handleTempCourses( course.id, course.course_fee, course.numOfDays ); }} size="lg" w='100%' > INSERT COURSE </Button>
                                                    )}
                                                </Box>
                                            </AccordionPanel>
                                        </div>
                                    ))}
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </Box>
                ) : null}
                    <Box className="p-3">
                        <Text className="text-lg text-gray-400">Courses Offered:</Text>
                        <Box>
                            <Accordion allowToggle className="space-y-3">
                            {allCourses && allCourses .sort((a, b) => a.course_code.localeCompare(b.course_code)) .map((course) => (
                                <AccordionItem key={course?.id} border='2px' borderColor={`${ tempCourses.some((temp) => temp.course === course.id) ? "green.500" : "gray.50" }`} className={`uppercase rounded shadow-md`}>
                                    <AccordionButton className="flex justify-between" onClick={() => { handleSchedule(course.id, "crew"); }} >
                                        <Text className="text-lg text-start uppercase">
                                            {course?.course_code || "Unknown Code"} -{" "}
                                            {course?.course_name || "Unknown Name"}
                                        </Text>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel className="space-y-3">
                                        <Box className="flex flex-col justify-between space-y-4">
                                            <Box>
                                                <Text className="text-gray-400 w-full">Training Schedule</Text>
                                                <Select isDisabled={courseRef !== course?.id} onChange={(e) => setSched(e.target.value)} className="uppercase" size="sm">
                                                    <option hidden>Select Schedule</option>
                                                    {trainingSched.map((date, index) => (
                                                        <option key={index}>{date}</option>
                                                    ))}
                                                </Select>
                                            </Box>
                                            <Box>
                                                <Text className="text-gray-400 w-full">Payment Mode</Text>
                                                <Select isDisabled={courseRef !== course?.id} onChange={(e) => setPayment(Number(e.target.value)) } className="uppercase" size="sm" >
                                                    <option hidden>Select Payment</option>
                                                    <option value={0}>Crew Charge</option>
                                                    <option value={1}>Company Charge</option>
                                                </Select>
                                            </Box>
                                        </Box>
                                        <Box className="flex w-full">
                                            {tempCourses.some((temp) => temp.course === course.id) ? (
                                                <Text bg='teal.500' className="text-sm rounded p-2 text-white" textAlign='center'  w='100%' fontWeight="700" > SELECTED </Text>
                                            ) : (
                                                <Button isDisabled={tempCourses.some( (temp) => temp.course === course.id )} colorScheme="blue" onClick={() => { handleTempCourses( course.id, course.course_fee, course.numOfDays ); }} size="lg" w='100%' > INSERT COURSE </Button>
                                            )}
                                        </Box>
                                    </AccordionPanel>
                                </AccordionItem>
                                ))}
                            </Accordion>
                        </Box>
                    </Box>
                </Box>
            </ModalBody>
            <ModalFooter borderTopWidth="1px">
                <Button mr={3} onClick={onCloseModal}> Close </Button>
                <Button onClick={handleCourses} colorScheme="blue" isLoading={loading} loadingText="Selecting..."> Select </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
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
                        <Text className='text-gray-400 text-base'>Select your Rank below</Text>
                        {allRanks && allRanks.sort((a, b) => a.code.localeCompare(b.code)).map((rank) =>(
                            <Text key={rank.id} onClick={() => handleRank(rank.code)} className={`${rank.id === selectedRank ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-3 rounded text-lg uppercase text-center shadow-md`}>{rank.code}</Text>
                        ))}
                    </Box>
                    <Text className='text-gray-400 text-center text-base'>{`Tip: If your rank is not provided here, you can type it on the text box at the top and click done.`}</Text>
                </Box>
            </ModalBody>
            <ModalFooter>
                <Button onClick={onCloseRank} mr={3}>Close</Button>
                <Button isDisabled={rankRef.trim() === '' && selectedRank.trim() === ''} onClick={handleSelectedRank} colorScheme='blue'>Done</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    </>
    )
}
