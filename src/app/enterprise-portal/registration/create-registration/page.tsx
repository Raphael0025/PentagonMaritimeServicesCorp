'use client'

import React, { useState, useEffect, } from 'react'
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore'
import Image from 'next/image'
import DatePicker from 'react-datepicker'

import { ListIcon, CourseIcon, CheckIcon} from '@/Components/SideIcons'

import { Box, Text, Link, Switch, FormControl, Input, Alert, AlertTitle, AlertDescription, AlertIcon, InputLeftAddon, InputGroup, Heading, Button, useToast, useDisclosure, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Accordion, AccordionIcon, AccordionPanel, AccordionItem, AccordionButton } from '@chakra-ui/react'

//types
import { TRAINEE, initTRAINEE, TEMP_COURSES, TRAINING } from '@/types/trainees'

import { addNewTrainee, addRegistrationDetails, addTrainingDetails } from '@/lib/trainee_controller'

import { generateDateRanges } from '@/handlers/course_handler'

import { useRank } from '@/context/RankContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourses } from '@/context/CourseContext'
import { useTypes } from '@/context/TypeContext'
import {useCategory} from '@/context/CategoryContext'

export default function Page(){
    const router = useRouter()
    
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
    const [loading, setLoading] = useState<boolean>(false)

    const [trainee, setTrainee] = useState<TRAINEE>(initTRAINEE)
    const [courses, setCourses] = useState<TEMP_COURSES[]>([])
    const [tempCourses, setTempCourses] = useState<TEMP_COURSES[]>([])

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

    const [preview, setPreview] = useState<string | null>(null)
    const [validSignature, setSignature] = useState<File[]>([])
    const [sig_file, setSigFile] = useState<string>('No file chosen yet...')

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
        <Box className='space-y-2'>
            <Text fontWeight='700' textTransform='uppercase' fontSize='2xl' color='blue.800'>Register Trainee</Text>
            <Box >
                <Text color='blue.600' fontSize='md'>{`Trainee Information`}</Text>
                <Box shadow='md' p='4' display='flex'  borderRadius='10px'>
                    <InputGroup size='sm' shadow='md'>
                        <InputLeftAddon color='gray.600'>
                            Last Name
                        </InputLeftAddon>
                        <Input textTransform={'uppercase'} />
                    </InputGroup>
                    <InputGroup size='sm' shadow='md'>
                        <InputLeftAddon color='gray.600'>
                            First Name
                        </InputLeftAddon>
                        <Input textTransform={'uppercase'} />
                    </InputGroup>
                </Box>
            </Box>
        </Box>
    </>
    )
}