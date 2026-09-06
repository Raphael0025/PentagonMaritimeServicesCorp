'use client'

import { useState, useRef, useEffect } from 'react';
import { Box, Text, Image, Input, IconButton, Textarea, Button, InputLeftAddon, Grid, GridItem, FormControl, Select, FormLabel, Switch, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';
import { ChevronDownIcon, EditIcon, DownloadIcon, CopyIcon, } from '@chakra-ui/icons'
import { Timestamp } from 'firebase/firestore'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useRoles } from '@/context/UserRolesContext'
import { useTypes } from '@/context/TypeContext'
import {useCategory} from '@/context/CategoryContext'
import { useRank } from '@/context/RankContext'
import DatePicker from 'react-datepicker'

import { handleRegStatus } from '@/handlers/trainee_handler'
import { marketBGColor, marketFontColor } from '@/handlers/util_handler'
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import RegistrationForm from '@/Components/Page/Forms/RegistrationForm'
import AdmissionForm from '@/Components/Page/Forms/AdmissionForm'
import { EditRegistration } from '@/Components/Modal/Registration'

import { SAVE_REMARKS, UPDATE_TRAINEE, UPDATE_TRAINING, UPDATE_REGISTRATION, updateTraineeAttachments, changeImg } from '@/lib/trainee_controller'
import { useReactToPrint } from 'react-to-print'

//import './Registration.css'
import { deployYDate } from '@/types/utils' 
import { fullMonth } from '@/handlers/util_handler'

import { initTRAINEE_BY_ID, TRAINEE_BY_ID, TRAINING_BY_ID } from '@/types/trainees'

export default function Page(){
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { data: allRanks } = useRank()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { lastMonthReg: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()
    const { data: allCourses } = useCourses()
    const { data: allRoles } = useRoles()
    const { data: allCategories } = useCategory()
    const { area: allAreas, subArea: allSubArea } = useTypes()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [idRef, setID] = useState<string>('')
    const [remarks, setRemarks] = useState<string>('')
    const [regNum, setRegNum] = useState<string>('')
    const [traineeName, setTrainee] = useState<string>('')
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())
    const [traineeRef, setTraineeRef] = useState<TRAINEE_BY_ID>(initTRAINEE_BY_ID)
    const [trainingRef, setTrainingRef] = useState<string>('')
    const [regRef, setRegRef] = useState<string>('')
    const [filterMarket, setFilter] = useState<string>('')
    const [filterCourse, setCFilter] = useState<string>('')
    const [filterCompany, setCompanyFilter] = useState<string>('')
    const [traineeInfo, setTraineeInfo] = useState<TRAINEE_BY_ID>(initTRAINEE_BY_ID)

    const { isOpen: isOpenAddress, onOpen: onOpenAddress, onClose: onCloseAddress } = useDisclosure()
    const { isOpen: isOpenCompany, onOpen: onOpenCompany, onClose: onCloseCompany } = useDisclosure()
    const {isOpen: isOpenRank, onOpen: onOpenRank, onClose: onCloseRank} = useDisclosure()

    const [rankRef, setRankRef] = useState<string>('')
    const [selectedRank, setSelectedRank] = useState<string>('')

    const [otherAddress, setAddress] = useState<boolean>(false)

    const [companyRef, setCompanyRef] = useState<string>('')
    const [selectCompany, setSelectCompany] = useState<string>('')

    const [birth_date, setBirth_Date] = useState<Date | null>(new Date())

    const { isOpen: isOpenRm, onOpen: onOpenRm, onClose: onCloseRm } = useDisclosure()
    const { isOpen: isOpenForm, onOpen: onOpenForm, onClose: onCloseForm } = useDisclosure()
    const { isOpen: isOpenSForm, onOpen: onOpenSForm, onClose: onCloseSForm } = useDisclosure()
    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()
    const { isOpen: isOpenReg, onOpen: onOpenReg, onClose: onCloseReg } = useDisclosure()
    const { isOpen: isOpenMarketing, onOpen: onOpenMarketing, onClose: onCloseMarketing  } = useDisclosure()
    const { isOpen: isOpenAttach, onOpen: onOpenAttach, onClose: onCloseAttach } = useDisclosure()
    const { isOpen: isOpenEditTrainee, onOpen: onOpenEditTrainee, onClose: onCloseEditTrainee } = useDisclosure()

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${traineeName}_REGISTRATION_FORM.pdf`,
    })

    const [permissions, setPermissions] = useState<any[]>([])
    
    useEffect(() => {
        const fetchData = () => {
            const role = localStorage.getItem('roleToken');
            if (!role) return;

            const userRole = allRoles?.find(r => r.id === role)
            if (!userRole) return;

            // Check whether the found role belongs to the training department
            const permissions = userRole.permissions.filter(
                (p: any) => p.department === "Registration" && p.feature === "Registrations"
            )
            setPermissions(permissions)
        }
        fetchData()
    }, [])

    const canDo = (feature: string) => {
        return permissions.some(p => p.allowed.includes(feature));
    }

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
    
    const handleSaveRemark = async () => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')
        
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    await SAVE_REMARKS(idRef, remarks, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 1500)
        }).then(() => {
            handleToast('Remarks Saved Successfully!', `Your Remarks on this registration has been saved.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error:, ', error)
        }).finally(() => {
            setLoading(false)
            onCloseRm()
            setID('')
            setRemarks('')
        })
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear()
    const startYear = parseInt(deployYDate, 10)

    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

    const handleData = () => {
        setTMonth(monthSelected + 1) 
        setTYear(yearSelected)
        setRMonth(monthSelected + 1) 
        setRYear(yearSelected)
        setMonthSelected(new Date().getMonth())
        setYearSelected(new Date().getFullYear())
        onCloseDate()
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target
        setTraineeRef((prev) => ({
            ...prev,
            [id]: value.toUpperCase(),
        }))
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setTraineeRef((prev) => ({
            ...prev,
            [id]: value.toUpperCase(),
        }))
    }

    const handleSaveDetails = async () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const train = {
                        marketing: traineeRef.marketing,
                        otherMarketing: traineeRef.otherMarketing,
                    }
                    const reg = {
                        marketing: traineeRef.marketing,
                        otherMarketing: traineeRef.otherMarketing,
                    }
                    await UPDATE_TRAINEE(traineeRef, actor)
                    await UPDATE_TRAINING(trainingRef, train, actor)
                    await UPDATE_REGISTRATION(regRef, reg, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
            onCloseMarketing()
        })
    }

    const attachmentsConfig: { 
        label: string; 
        key: keyof TRAINEE_BY_ID; // This is the most important line
        type: string; 
        cat: string 
    }[] = [
        { label: 'Valid ID', key: 'valid_id', type: 'valid_id', cat: 'validID' },
        { label: 'Profile Picture', key: 'photo', type: 'photos', cat: 'idPic' },
        { label: 'Signature', key: 'e_sig', type: 'e-signs', cat: 'esign' },
        { label: 'MISMO Profile Account', key: 'mismoSC', type: 'MISMO', cat: 'mismo' },
        { label: 'Medical Certificate', key: 'medCert', type: 'MEDICAL_CERTS', cat: 'medCert' },
        { label: 'Certificate of Proficiency', key: 'cop', type: 'CERTIFICATE_OF_PROFICIENCY', cat: 'cop' },
        { label: 'Sea Service Record', key: 'ssr', type: 'SEA_SERVICE_RECORDS', cat: 'ssr' },
    ];

    const handleSaveTraineeDetails = async () => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    if(allTrainee){
                        const newTraineeInfo = { 
                            ...traineeInfo,
                            birthDate: birth_date ? Timestamp.fromDate(birth_date) : Timestamp.now()
                        }
                        await UPDATE_TRAINEE(newTraineeInfo, actor)
                    }
                    res()
                }catch(error){
                    rej(error)
                }
            }, 1500)
        }).then(() => {
            handleToast('Trainee Updated Successfully!', `Trainee details has been successfully updated to the database.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
        })
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
        setTraineeInfo((prev) => ({
            ...prev,
            company: tempCompany
        }))
        onCloseCompany()
    }

    const handleRank = (rank: string) => {
        setSelectedRank(rank)
    }

    const handleSelectedRank = () => {
        let tempRank: string
        if(selectedRank === ''){
            tempRank = rankRef
        } else {
            tempRank = selectedRank
        }
        setTraineeInfo((prev) => ({
            ...prev,
            rank: tempRank
        }))
        onCloseRank()
    }
    
    const handleCopy = async (trainee: TRAINEE_BY_ID, training: TRAINING_BY_ID) => {
        // company, rank, Name, phone, email
        //training.accountType === 0 ? 'crew' : 'company'

        const accountType = training.accountType === 0 ? 'CREW' : 'COMPANY'
        const rank = allRanks?.find((rank) => rank.code === trainee.rank)?.rank || trainee.rank
        const company = allClients?.find((client) => client.id === trainee.company)?.company || trainee.company
        const rankAndName = `${rank.toUpperCase()} ${trainee.last_name.toUpperCase()}, ${trainee.first_name.toUpperCase()} ${trainee.middle_name.toUpperCase()}`

        const selectedFields = [
            company,
            rankAndName,
            trainee.contact_no,
            trainee.email,
            accountType
        ]

        const tsvData = selectedFields.join('\t');

        navigator.clipboard.writeText(tsvData)
        .then(() => {
            toast({
                title: 'Row Copied!',
                description: 'You can now paste (Ctrl+V) directly into Google Sheets.',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        })
        .catch(() => {
            toast({
                title: 'Failed to copy',
                status: 'error',
                duration: 2000,
            });
        })
    }

    return(
        <>
            <main className="w-full space-y-3">
                <Box className="w-full flex justify-between">
                    <Box className="w-full flex">
                        <InputGroup w="40%" className="shadow-md rounded-lg">
                        <InputLeftAddon>
                            <SearchIcon color="#a1a1a1" size="18" />
                        </InputLeftAddon>
                        <Input
                            placeholder="Name, Enrolled Date, Registration No..."
                            value={searchTerm}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        </InputGroup>
                    </Box>
                    <Box w='80%' display='flex' >
                        <Select size='sm' mr='4' value={filterCourse} onChange={(e) => {setCFilter(e.target.value);}} shadow='md'>
                            <option hidden>Filter Course</option>
                            {allCourses && [...allCourses]
                            .sort((a, b) => a.course_code.localeCompare(b.course_code))
                            .map((c) => (
                                <option key={c.id} value={c.course_code}>{c.course_code.toUpperCase()}</option>
                            ))}
                        </Select>
                        <Select size='sm' mr='4' value={filterCompany} onChange={(e) => {setCompanyFilter(e.target.value);}} shadow='md'>
                            <option hidden>Filter Company</option>
                            {allClients && [...allClients]
                            .sort((a, b) => a.company.localeCompare(b.company))
                            .map((c) => (
                                <option key={c.id} value={c.id}>{c.company.toUpperCase()}</option>
                            ))}
                        </Select>
                        <Select size='sm' mr='4' value={filterMarket.toLowerCase()} onChange={(e) => {setFilter(e.target.value.toUpperCase());}} shadow='md'>
                            <option hidden>Filter Marketing </option>
                            <option value='company'>Company</option>
                            <option value='walk-in'>Walk-in</option>
                            <option value='agent'>Agent</option>
                            <option value='consultancy'>Consultancy</option>
                            <option value='fb'>Facebook</option>
                            <option value='others'>Others</option>
                        </Select>
                        {(filterMarket !== '' || filterCourse !== '')&& (
                            <Button w='50%' mr={4} onClick={() => {setFilter(''); setCompanyFilter(''); setCFilter('');}} colorScheme='red' size='sm' shadow='md'>Clear Filter</Button>
                        )}
                        <Button w='60%' mr={4} onClick={onOpenDate} rightIcon={<ChevronDownIcon />} size='sm' shadow='md'>Filter Date</Button>
                        {canDo("print") && (
                            <Button w='60%' bgColor='#1C437E' onClick={onOpenSForm} colorScheme='blue' size='sm' shadow='md'>Print Forms</Button>
                        )}
                    </Box>
                </Box>
                <Box className="w-full flex" style={{maxHeight: '700px', overflowY: 'auto',}}>
                    <Box w='100%' h='700px' >
                        <Box w="100%" h='100%' className=" rounded space-y-3" style={{  overflowX: 'auto', boxSizing: 'border-box', scrollbarWidth: 'thin', msOverflowStyle: 'none'}}>
                            <Box position='sticky' top='0' zIndex='1' w="4150px" h='60px' className="flex bg-sky-700 rounded justify-between space-x-4 items-center uppercase text-white" style={{ whiteSpace: 'nowrap',  }} >
                                <Box display="flex" flexDir="column" justifyContent="center" alignItems="center" >
                                    <Box className="space-x-3 flex w-full" justifyContent='center' alignItems='center'>
                                        <Text w="130px" className="text-center">Enrolled Date</Text>
                                        <Text w="100px" className="text-center">Enrolled By</Text>
                                        {/* <Text w="150px" className="text-center">Trainee Type</Text> */}
                                        <Text w="150px" className="text-center">Registration No.</Text>
                                        {/* <Text w="130px" className="text-center">Batch</Text> */}
                                        <Text w="130px" className="text-center">Course</Text>
                                        <Text w="100px" className="text-center">status</Text>
                                        <Box width='580px' display='flex' alignItems='center' flexDir='column'>
                                            <Text className='pb-2'>{`Trainee's Info.`}</Text>
                                            <Box w='100%' display='flex' alignItems='center' justifyContent="space-between">
                                                <Text textAlign='center' w='100%'>Last Name</Text>
                                                <Text textAlign='center' w='100%'>First Name</Text>
                                                <Text textAlign='center' w='100%'>Middle Name</Text>
                                                <Text textAlign='center' w='60%'>Suffix</Text>
                                            </Box>
                                        </Box>
                                        <Text w="80px" className="text-center">Rank</Text>
                                        <Text w="100px" className="text-center">SRN</Text>
                                        <Text w="100px" className="text-center">Attachments</Text>
                                        <Text w="150px" className="text-center">Date of Birth</Text>
                                        <Text w="200px" className="text-center">Place of Birth</Text>
                                        <Text w="250px" className="text-center">Address</Text>
                                    </Box>
                                </Box>
                                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                    <Text className='pb-3'>{`Contact Details`}</Text>
                                    <Box className='flex w-full space-x-3'>
                                        <Text w="100px" className="text-center">Contact No.</Text>
                                        <Text w="180px" className="text-center">Email Add.</Text>
                                    </Box>
                                </Box>
                                <Text w="200px" className="text-center">Company</Text>
                                <Text w="150px" className="text-center">Endorser</Text>
                                <Text w="150px" className="text-center">Marketing</Text>
                                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                    <Text className='pb-3'>{`Training Schedule`}</Text>
                                    <Box className='flex w-full space-x-3'>
                                        <Text w="100px" className="text-center">From</Text>
                                        <Text w="100px" className="text-center">To</Text>
                                    </Box>
                                </Box>
                                <Text w="100px" className="text-center">Payment Mode</Text>
                                <Text w="100px" className="text-center">Course Fee</Text>
                                <Text w="100px" className="text-center">Vessel</Text>
                                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                    <Text className='pb-3'>{`In case of Emergency`}</Text>
                                    <Box className='flex w-full space-x-3'>
                                        <Text w="150px" className="text-center">Name</Text>
                                        <Text w="80px" className="text-center">Contact No</Text>
                                        <Text w="100px" className="text-center">Relationship</Text>
                                    </Box>
                                </Box>
                                <Text w="300px" className="text-center pr-5">Remarks</Text>
                            </Box>
                            {allTraining && allTraining.sort((a, b) => {
                                    return b.date_enrolled.toMillis() - a.date_enrolled.toMillis();
                                }).filter((t) => t.reg_status >= 3 && t.regType === 1 )
                                .filter((t) => {
                                    const registration = allRegistrations?.find((r) => r.id === t.reg_ref_id);
                                    const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);
                                    if (!trainee) return false;
                                    if (filterCompany === '') return true;

                                    return trainee.company === filterCompany
                                    //allClients?.find((client) => client.id === trainee.company)?.company || trainee.company
                                })
                                .filter((t) => {
                                    if (!filterCourse || filterCourse === '') return true;

                                    return (
                                        allCourses?.find((course) => course.id === t.course)?.course_code.toUpperCase() === filterCourse.toUpperCase() || 
                                        courseCodes?.find((course) => course.id === t.course)?.company_course_code.toUpperCase() === filterCourse.toUpperCase()
                                    )
                                })
                                .filter((t) => {
                                    const registration = allRegistrations?.find((r) => r.id === t.reg_ref_id);
                                    const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);
                                    if (!trainee) return false;
                            
                                    // if filter is 'ALL', show all trainees
                                    if (filterMarket === "") return true;
                                    
                                    // otherwise match marketing field
                                    return trainee.marketing?.toUpperCase() === filterMarket;
                                })
                                .map((training) => {
                                    const registration = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                                    const reg_num = allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                                    const reg_id = allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.id ?? ''
                                    
                                    if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                ){
                                    return(
                                        <Box key={training.id} _hover={{bgColor: 'blue.100', borderBottomWidth: '1px', borderColor: 'blue.700'}} w='4150px' className="flex text-center justify-between p-1 border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='w-full flex space-x-3'>
                                                    <IconButton
                                                        aria-label="Copy row data"
                                                        icon={<CopyIcon />}
                                                        colorScheme={'blue'}
                                                        size="xs"
                                                        onClick={() => handleCopy(trainee, training)}
                                                    />
                                                    <Text w="80px">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                                    <Text w="100px">{training.enrolledBy}</Text>                                                                             
                                                    {/* <Text w="150px">
                                                        {allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.traineeType === 0 ? 'new' : 'old'}
                                                    </Text>                                         */}
                                                    <Text w="150px" _hover={{color: 'blue.700'}} onClick={() => {setRegNum(reg_id); setTraineeInfo(trainee); onOpenReg();}} className='hover:cursor-pointer'>
                                                        {`Reg-${reg_num}`}
                                                    </Text>                                        
                                                    {/* <Text w="130px">
                                                        {`${courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `B${courseBatch.find((batch) => batch.id === training.batch)?.batch_no}` : ''}`}
                                                    </Text>                                         */}
                                                    <Text w="130px">
                                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                                    </Text>                                        
                                                    <Text w='100px' borderRadius='5px' bgColor={`${training.reg_status === 6 ? 'green.500' : ''}`} className={`${training.reg_status === 3 ? 'text-green-500 font-bolder' : training.reg_status === 9 ? 'text-yellow-500' : training.reg_status === 7 ? 'text-red-700' : training.reg_status === 6 ? 'text-white' : ''} text-xs uppercase`}>{handleRegStatus(training.reg_status)}</Text>
                                                    <Text w="150px">{`${trainee.last_name}`}</Text>                                        
                                                    <Text w="150px">{`${trainee.first_name}`}</Text>                                        
                                                    <Text w="150px">{trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''}</Text>                                        
                                                    <Text w="80px">{trainee.suffix === '' ? '--' : trainee.suffix}</Text>                                        
                                                    <Text w="100px">
                                                        {allRanks?.find((rank) => rank.code === trainee.rank)?.rank || trainee.rank}
                                                    </Text>                                        
                                                    <Text w="100px">{trainee.srn}</Text>                              
                                                    <Text w="100px" onClick={() => {setTraineeInfo(trainee); onOpenAttach();}} _hover={{cursor:'pointer', textDecoration: 'underline', color: 'blue.600'}}>{`View`}</Text>                            
                                                    <Text w='150px' >{parsingTimestamp(trainee.birthDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</Text>
                                                    <Tooltip w='200px' textTransform='uppercase' textAlign='center' label={trainee.birthPlace}>
                                                        <Text noOfLines={1} w="180px">{trainee.birthPlace}</Text>
                                                    </Tooltip>
                                                    <Tooltip w='250px' textTransform='uppercase' textAlign='center' label={trainee.otherAddress === '' ? `${trainee.house_no} ${trainee.street} Brgy. ${trainee.brgy}, ${trainee.city} City` : trainee.otherAddress}>
                                                        <Text noOfLines={1} w='260px'>
                                                            {trainee.otherAddress === '' ? `${trainee.house_no} ${trainee.street} Brgy. ${trainee.brgy}, ${trainee.city} City` : trainee.otherAddress}
                                                        </Text>                                        
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='w-full flex space-x-3'>
                                                    <Text w="100px">{trainee.contact_no}</Text>    
                                                    <Tooltip textAlign='center' w='300px' label={trainee.email} >
                                                        <Text noOfLines={1} w="180px" className='lowercase'>{trainee.email}</Text>    
                                                    </Tooltip>    
                                                </Box>
                                            </Box>
                                            <Tooltip className='text-center' aria-label='tooltip' label={allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}>
                                                <Text w="200px" noOfLines={1} className='text-wrap'>
                                                    {allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}
                                                </Text>    
                                            </Tooltip>    
                                            <Tooltip className='text-center uppercase' aria-label='tooltip' label={trainee.endorser}>
                                                <Text w="150px" noOfLines={1} className='text-wrap uppercase' >{trainee.endorser}</Text>    
                                            </Tooltip>     
                                            <Text w="150px" color={marketFontColor(trainee.marketing)} bgColor={marketBGColor(trainee.marketing)} borderRadius='5px' _hover={{fontWeight: '700'}} onClick={() => {
                                                    if(canDo("update")){
                                                        setTraineeRef(trainee); setTrainingRef(training.id); setRegRef(registration.id); onOpenMarketing();
                                                    }
                                                }} className='hover:cursor-pointer'>
                                                {trainee?.marketing === 'OTHERS' ?  trainee?.otherMarketing : trainee?.marketing === '' ? 'N/A' : trainee?.marketing}
                                            </Text>      
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='w-full flex uppercase space-x-3'>
                                                    <Text w="100px">{training.start_date}</Text>    
                                                    <Text w="100px">{training.end_date === '' ? '--' : training.end_date}</Text>    
                                                </Box>
                                            </Box>
                                            <Text w="100px" bgColor={training.accountType === 0 ? 'blue.300' : 'green.400'} borderRadius='5px' _hover={{fontWeight: '700'}} >{training.accountType === 0 ? 'crew' : 'company'}</Text>     
                                            <Text w="100px" >{`₱ ${training.course_fee}`}</Text>    
                                            <Tooltip w='250px' label={trainee.vessel.toUpperCase() }>
                                                <Text noOfLines={1} w='100px'>
                                                    {trainee.vessel.toUpperCase()}
                                                </Text>                                        
                                            </Tooltip>  
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='flex w-full space-x-3'>
                                                    {/* <Text w="150px" className="text-center">{trainee.e_contact_person}</Text> */}
                                                    <Tooltip w='250px' label={trainee.e_contact_person}>
                                                        <Text noOfLines={1} w='150px'>
                                                            {trainee.e_contact_person}
                                                        </Text>                                        
                                                    </Tooltip>
                                                    <Text w="80px" className="text-center">{trainee.e_contact}</Text>
                                                    <Text w="100px" className="text-center">{trainee.relationship}</Text>
                                                </Box>
                                            </Box>
                                            <Button onClick={() => {setID(training.id); setRemarks(training.train_remarks); onOpenRm();}} size='sm' p={0} variant='link' w='300px'>
                                                <Text className={`${training.train_remarks === '' ? 'text-gray-400' : 'text-cyan-600'}`}>
                                                    {training.train_remarks === '' ? 'None' : 'View'}
                                                </Text>
                                            </Button>                                     
                                        </Box>
                                    )
                                }
                            })}
                        </Box>
                    </Box>
                </Box>
            </main>
            <Modal isOpen={isOpenEditTrainee} onClose={onCloseEditTrainee} size='6xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color='blue.700'>Edit Trainee Details</ModalHeader>
                    <ModalBody>
                        <Box gridGap={6} display='flex' flexDir='column' >
                            <Box display='flex' gridGap={4} alignItems='center'>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>Last Name</label>
                                    <Input id='last_name' onChange={handleOnChange} value={traineeInfo.last_name} className='w-full shadow-md uppercase' placeholder='' />
                                </FormControl>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>First Name</label>
                                    <Input id='first_name' onChange={handleOnChange} value={traineeInfo.first_name} className='w-full shadow-md uppercase' placeholder='' />
                                </FormControl>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>Middle Name</label>
                                    <Input id='middle_name' onChange={handleOnChange} value={traineeInfo.middle_name} className='w-full shadow-md uppercase' placeholder='' />
                                </FormControl>
                                <FormControl w='30%' className='uppercase '>
                                    <label className='text-gray-400'>Suffix</label>
                                    <Input id='suffix' onChange={handleOnChange} value={traineeInfo.suffix} className='shadow-md uppercase' placeholder='' />
                                </FormControl>
                            </Box>    
                            <Box display='flex' gridGap={4} alignItems='center'>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>srn</label>
                                    <Input id='srn' onChange={handleOnChange} value={traineeInfo.srn} className='w-full shadow-md' placeholder='' />
                                </FormControl>
                                <FormControl className='flex flex-col items-start border-2 rounded shadow-md p-2' >
                                    <label className='text-gray-400'>RANK</label>
                                    <Button w='100%' className='uppercase' onClick={() => {onOpenRank(); setRankRef(''); setSelectedRank('');}} variant='ghost' colorScheme='blue'>
                                    {allRanks?.find((rank) => rank.code === traineeInfo.rank)?.rank || (traineeInfo.rank === '' ? 'SELECT RANK' : traineeInfo.rank)}
                                    </Button>
                                </FormControl>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>email</label>
                                    <Input id='email' onChange={handleOnChange} value={traineeInfo.email} type='email' className='w-full shadow-md' placeholder='' />
                                </FormControl>
                                <FormControl className='uppercase '>
                                    <label className='text-gray-400'>contact no.</label>
                                    <Input id='contact_no' onChange={handleOnChange} value={traineeInfo.contact_no} type='tel' className='shadow-md' placeholder='' />
                                </FormControl>
                            </Box>    
                            <Box display='flex' gridGap={4} alignItems='center'>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>gender</label>
                                    <Select id='gender' onChange={handleSelect} value={traineeInfo.gender} className='shadow-md uppercase'>
                                        <option  hidden>Select Gender</option>
                                        <option value={'male'}>Male</option>
                                        <option value={'female'}>Female</option>
                                    </Select>
                                </FormControl>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>nationality</label>
                                    <Input id='nationality' onChange={handleOnChange} value={traineeInfo.nationality} type='text' className='w-full shadow-md' placeholder='' />
                                </FormControl>
                                <FormControl display='flex' flexDir='column' className='uppercase w-full'>
                                    <label className='text-gray-400'>birth date</label>
                                    <DatePicker showPopperArrow={false} selected={birth_date} onChange={(date) => setBirth_Date(date)} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd, yyyy'
                                        customInput={<Input id='birth_date' textAlign='center' className='shadow-md' /> } />
                                </FormControl>
                                <FormControl className='uppercase '>
                                    <label className='text-gray-400'>birth place</label>
                                    <Input id='birthPlace' onChange={handleOnChange} value={traineeInfo.birthPlace} type='text' className='shadow-md' placeholder='' />
                                </FormControl>
                            </Box>    
                            <Box display='flex' gridGap={4} flexDir={{md:'row', base:'column'}} >
                                <FormControl className='flex flex-col space-y-2 items-start md:space-y-0 md:flex-row md:space-x-3 md:items-center'>
                                    <label className='text-gray-400'>Address:</label>
                                    <Button onClick={onOpenAddress} className='uppercase' variant='ghost' colorScheme='blue' >
                                    {otherAddress ? traineeInfo.otherAddress !== '' ? traineeInfo.otherAddress : 'Add Address' : traineeInfo.house_no !== '' || traineeInfo.street !== '' || traineeInfo.brgy !== '' || traineeInfo.city !== '' ? `${traineeInfo.house_no} ${traineeInfo.street} ${`Brgy. ${traineeInfo.brgy}`} ${`${traineeInfo.city} City`}` : 'Add Address'}
                                    </Button>
                                </FormControl>
                            </Box>
                            <Box display='flex' alignItems='center' gridGap={4}>
                                <FormControl className='uppercase'>
                                    <label>Vessel Type</label>
                                    <Select id='vessel' value={traineeInfo.vessel} onChange={handleSelect} className='uppercase'>
                                        <option hidden>Select Vessel</option>
                                        <option value={'container'}>Container</option>
                                        <option value={'bulk'}>Bulk</option>
                                        <option value={'tanker'}>Tanker</option>
                                        <option value={'passenger'}>Passenger</option>
                                    </Select>
                                </FormControl>
                                <FormControl className='uppercase'>
                                    <label className='text-gray-400'>Company:</label>
                                    <Button className='uppercase' onClick={() => {onOpenCompany(); setCompanyRef(''); setSelectCompany('');}} variant='ghost' colorScheme='blue'>
                                    {allClients?.find((client) => client.id === traineeInfo.company)?.company || (traineeInfo.company === '' ? 'ADD COMPANY' : traineeInfo.company)}
                                    </Button>
                                </FormControl>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>endorser</label>
                                    <Input id='endorser' onChange={handleOnChange} value={traineeInfo.endorser} type='text' className='w-full uppercase shadow-md' placeholder='' />
                                </FormControl>
                            </Box>
                            <Box display='flex' alignItems='center' gridGap={4}>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>emergency contact</label>
                                    <Input id='e_contact_person' onChange={handleOnChange} value={traineeInfo.e_contact_person} type='text' className='w-full uppercase shadow-md' placeholder='' />
                                </FormControl>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>contact</label>
                                    <Input id='e_contact' onChange={handleOnChange} value={traineeInfo.e_contact} type='text' className='w-full shadow-md' placeholder='' />
                                </FormControl>
                                <FormControl className='uppercase w-full'>
                                    <label className='text-gray-400'>relationship</label>
                                    <Input id='relationship' onChange={handleOnChange} value={traineeInfo.relationship} type='text' className='w-full uppercase shadow-md' placeholder='' />
                                </FormControl>
                            </Box>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr='3' onClick={() => { setTraineeInfo(initTRAINEE_BY_ID); onCloseEditTrainee(); }} shadow='md' >Cancel</Button>
                        <Button colorScheme='blue' bgColor='blue.700' isLoading={loading} loadingText='...Updating' onClick={handleSaveTraineeDetails} size='md' shadow='md' leftIcon={<EditIcon color='#fff' />} >Update Details</Button>
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
                                <Input id='house_no' onChange={handleOnChange} value={traineeInfo.house_no} isDisabled={otherAddress !== false} className='uppercase shadow-md'/>
                            </FormControl>
                            <FormControl className='uppercase'>
                                <label className='text-gray-400'>Street</label>
                                <Input id='street' onChange={handleOnChange} value={traineeInfo.street} isDisabled={otherAddress !== false} className='uppercase shadow-md'/>
                            </FormControl>
                            <FormControl className='uppercase'>
                                <label className='text-gray-400'>City</label>
                                <Select id='city' isDisabled={otherAddress !== false} value={traineeInfo.city} onChange={handleSelect} className='shadow-md uppercase'>
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
                                    {allCategories && allCategories.filter(cityData => cityData.type === traineeInfo.city)
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
                                <Select id='brgy' value={traineeInfo.brgy} isDisabled={otherAddress !== false} onChange={handleSelect} className='shadow-md uppercase'>
                                    <option hidden>Select Brgy</option>
                                    {allSubArea && allSubArea
                                        .filter(subarea => subarea.location_ref === traineeInfo.area)
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
                                <Switch id='otherAddress' isChecked={otherAddress} onChange={() => setAddress(!otherAddress)} />
                            </FormControl>
                            <FormControl>
                                <label className='text-gray-400'>Address</label>
                                <Input id='otherAddress' value={traineeInfo.otherAddress} isDisabled={otherAddress === false} onChange={handleOnChange} className='uppercase shadow-md'/>
                            </FormControl>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onCloseAddress} colorScheme='blue'>Done</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenCompany} onClose={onCloseCompany} size='xl' blockScrollOnMount={true} scrollBehavior='inside' motionPreset='slideInTop'>
                <ModalOverlay/>
                <ModalContent className='px-3'>
                    <ModalHeader fontWeight='700px' className='uppercase text-sky-700'>Specify your Company</ModalHeader>
                    <ModalBody maxH="60vh" overflowY="auto">
                        <Box className='flex flex-col space-y-2'>
                            <Box>
                                <Input onChange={(e) => setCompanyRef(e.target.value)} className='shadow-md uppercase' placeholder='type your company here...'/>
                            </Box>
                            <Box className='py-2 space-y-2' >
                                <Text className='text-gray-400 text-base'>Select your company below</Text>
                                {allClients && allClients.filter((company) => !companyRef || company.company.toLowerCase().includes(companyRef.toLowerCase())).sort((a, b) => a.company.localeCompare(b.company)).map((company) => (
                                    <Text key={company.id} onClick={() => handleCompany(company.id)} className={`${company.id === selectCompany ? 'bg-sky-700 text-white' : ''} hover:bg-sky-200 transition-all ease-in-out delay-75 duration-75 border p-2 rounded text-sm uppercase text-center shadow-md`}>{company.company}</Text>
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
            <Modal isOpen={isOpenAttach} onClose={onCloseAttach} scrollBehavior='inside' size='6xl' >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color='blue.700'>TRAINEE ATTACHMENTS</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6} p={4}>
                        {attachmentsConfig.map((item) => (
                            <AttachmentCard 
                                key={item.key} 
                                label={item.label} 
                                currentUrl={traineeInfo[item.key] as string} 
                                isLoading={loading} 
                                onUpload={async (file) => { 
                                    // 1. Build the files structure to match what updateTraineeAttachments checks for
                                    const filesPayload = {
                                        // Data elements (The raw file array)
                                        validID: item.key === 'valid_id' ? [file] : null,
                                        validPfp: item.key === 'photo' ? [file] : null,
                                        validSignature: item.key === 'e_sig' ? [file] : null,
                                        screenshotFile: item.key === 'mismoSC' ? [file] : null,
                                        medCertFile: item.key === 'medCert' ? [file] : null,
                                        copFile: item.key === 'cop' ? [file] : null,
                                        ssrFile: item.key === 'ssr' ? [file] : null,

                                        // Check elements (Bypasses the 'No file chosen yet...' conditional rule)
                                        file: item.key === 'valid_id' ? 'Uploaded' : null,
                                        pfpFile: item.key === 'photo' ? 'Uploaded' : null,
                                        sig_file: item.key === 'e_sig' ? 'Uploaded' : null,
                                        sc_fileName: item.key === 'mismoSC' ? 'Uploaded' : null,
                                        mc_fileName: item.key === 'medCert' ? 'Uploaded' : null,
                                        cop_fileName: item.key === 'cop' ? 'Uploaded' : null,
                                        ssr_fileName: item.key === 'ssr' ? 'Uploaded' : null,
                                    };

                                    // 2. Execute your new function package cleanly
                                    const updatedUrls = await updateTraineeAttachments(
                                        traineeInfo.id,       // Trainee ID string
                                        traineeInfo,          // Trainee details object (reads first_name, last_name)
                                        filesPayload,         // Calculated conditional payload bundle
                                        'Staff Update'        // Staff operator identifier
                                    );

                                    // 💡 Recommended: If you maintain local component view state trackers, 
                                    // you can update it right here using the return token values:
                                    // setTraineeInfo(prev => ({ ...prev, ...updatedUrls }));
                                }}
                                onDownload={() => { 
                                    const fileUrl = traineeInfo[item.key];
                                    if (typeof fileUrl === 'string') {
                                        const link = document.createElement('a'); 
                                        link.href = fileUrl; 
                                        link.download = `${traineeInfo.last_name}_${item.label}.jpg`; 
                                        link.target = "_blank"; 
                                        link.click();
                                    }
                                }}
                            />
                        ))}
                    </Grid>
                    </ModalBody>
                </ModalContent>
            </Modal>
            {/** MARKETING */}
            <Modal isOpen={isOpenMarketing} size='xl' onClose={onCloseMarketing}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color='blue.700' fontWeight='700'>Marketing Type</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody >
                        <FormControl textTransform='uppercase'>
                            <FormLabel htmlFor='marketing' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>Please select from the following below</FormLabel>
                            <Select id='marketing' defaultValue={traineeRef?.marketing || "na"} onChange={handleSelect} textTransform='uppercase' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400'>
                                <option hidden >{traineeRef?.marketing}</option>
                                <option value='agent'>Agent</option>
                                <option value='company'>Company</option>
                                <option value='walk-in'>Walk-In</option>
                                <option value='fb'>Facebook</option>
                                <option value='consultancy'>Consultancy</option>
                                <option value='others'>Others</option>
                            </Select>
                        </FormControl>
                        {(traineeRef?.marketing === 'OTHERS') && (
                            <FormControl textTransform='uppercase'>
                                <FormLabel htmlFor='otherMarketing' py='2' fontWeight='600' fontSize='0.5625rem' textTransform='uppercase' color='blue.700'>{`If Others, please specify`}</FormLabel>
                                <Input id='otherMarketing' value={traineeRef?.otherMarketing} onChange={handleOnChange} textTransform='uppercase' type='text' shadow='md' fontWeight='400' borderWidth='1px' borderStyle='solid' borderColor='gray.400' />
                            </FormControl>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onCloseMarketing} shadow='md' size='sm'  variant='outline' colorScheme='gray' mr='4' >Cancel</Button>
                        <Button onClick={handleSaveDetails} isLoading={loading} loadingText='Updating...' shadow='md' size='sm' colorScheme='blue' bgColor='blue.700'>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenReg} size='xl' onClose={onCloseReg}>
                <ModalOverlay />
                <ModalContent>
                    <ModalBody >
                        <EditRegistration onClose={onCloseReg} reg_id={regNum} reg_Type={1} permissions={permissions} />
                        <Box display='flex' justifyContent='end'>
                            <Button onClick={() => {onCloseReg(); onOpenEditTrainee();}}  shadow='md' size='sm' colorScheme='blue' bgColor='blue.700'>Edit Trainee Details</Button>
                        </Box>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenDate} scrollBehavior='inside' onClose={onCloseDate}>
                <ModalOverlay />
                <ModalContent px={4}>
                    <ModalHeader className='text-sky-700' fontWeight='800'>Select Month & Year</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex'>
                        <Box w='50%' mr={4}>
                            <Text fontSize='xl' color='blue.700'>Months</Text>
                            <Box>
                            {fullMonth.map((month, index) => (
                                <Text borderRadius={'10px'} color='gray.500' fontSize='xl' p={2} _hover={{bg: 'gray.100'}} onClick={() => {setMonthSelected(index)}} key={index}>
                                    {month}
                                </Text>
                            ))}
                            </Box>
                        </Box>
                        <Box w='50%'>
                            <Text fontSize='xl' color='blue.700'>Years</Text>
                            <Box h='550px' overflowY='auto'>
                            {years.map((year) => (
                                <Text  borderRadius="10px"  color="gray.500"  fontSize="xl"  p={2}  _hover={{ bg: "gray.100" }}  onClick={() => setYearSelected(year)}  key={year}>
                                    {year}
                                </Text>
                            ))}
                            </Box>
                        </Box>
                    </ModalBody>
                    <ModalFooter display='flex' justifyContent='space-between' borderTopWidth='1px'>
                        <Text fontSize='lg'>{`Date: ${fullMonth[monthSelected]} ${yearSelected}`}</Text>
                        <Box> 
                            <Button onClick={handleData} colorScheme='blue'>Select</Button>
                        </Box>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenRm} size='xl' scrollBehavior='inside' onClose={onCloseRm}>
                <ModalOverlay />
                <ModalContent px={4}>
                    <ModalHeader className='text-sky-700' fontWeight='800'>Remarks</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' flexDir='column'>
                        <Textarea h='200px' value={remarks} onChange={(e) => setRemarks(e.target.value)} resize='vertical' size='sm' placeholder='Type your remarks here...' />
                    </ModalBody>
                    <ModalFooter borderTopWidth='1px'>
                        <Button onClick={onCloseRm} mr={3}>Close</Button>
                        <Button onClick={handleSaveRemark} colorScheme='blue' isLoading={loading} loadingText='Saving...'>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenForm} size='full' scrollBehavior='inside' onClose={onCloseForm}>
                <ModalOverlay />
                <ModalContent px={4}>
                    <ModalHeader color='blue.700' fontWeight='800'>Registration & Admission Forms</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' alignItems='center' flexDir='column'>
                        <Box w='7.9in' >
                            <Box w='100%' ref={componentRef}>
                                <RegistrationForm regNum={regNum} tab={'enrolled'} />
                                <AdmissionForm regNum={regNum} tab={'enrolled'} traineeName={traineeName} />
                            </Box>
                        </Box>
                    </ModalBody>
                    <ModalFooter borderTopWidth='1px'>
                        <Button onClick={() => {onCloseForm(); onOpenSForm();}} mr={3}>Close</Button>
                        <Button colorScheme='blue' bgColor='#1C437E' onClick={handlePrint}>Print Forms</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenSForm} size='md' scrollBehavior='inside' onClose={() => {onCloseSForm(); setSearch('')}}>
                <ModalOverlay />
                <ModalContent px={4}> 
                    <ModalHeader className='text-sky-700' fontWeight='800'>Select Registration Number</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' alignItems='center' flexDir='column'>
                        <Box className='space-y-3 w-full'>
                            <InputGroup className="shadow-md rounded-lg">
                                <InputLeftAddon>
                                    <SearchIcon color="#a1a1a1" size="18" />
                                </InputLeftAddon>
                                <Input
                                    placeholder="Registration No..."
                                    value={searchTerm}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>
                            <Box className='space-y-3 w-full' overflowY='auto' h='550px'>
                            {allRegistrations && allRegistrations?.filter((r) => r.regType === 1 && allTraining?.some((training) => training.reg_ref_id === r.id && training.reg_status >= 3))
                                .filter((reg) => {
                                    const searchLower = searchTerm.toLowerCase();
                                    return (
                                        `REG-${reg.reg_no}`?.toLowerCase().includes(searchLower)
                                    )
                                })
                                .sort((a, b) => {
                                    const [yearA, monthA, numA] = a.reg_no.split('-').map(Number);
                                    const [yearB, monthB, numB] = b.reg_no.split('-').map(Number);
                        
                                    // Handle invalid or missing values gracefully
                                    if (isNaN(yearA) || isNaN(monthA) || isNaN(numA)) return 1; // Place invalid `a` after valid `b`
                                    if (isNaN(yearB) || isNaN(monthB) || isNaN(numB)) return -1; // Place invalid `b` after valid `a`

                                    // Compare by year first
                                    if (yearA !== yearB) return yearB - yearA;

                                    // Compare by month next
                                    if (monthA !== monthB) return monthB - monthA;

                                    // Finally, compare by the number part
                                    return numB - numA;
                                })
                                .map((reg) => {
                                    const traineeFound = allTrainee?.find((t) => t.id === reg.trainee_ref_id)
                                    if(traineeFound){
                                        return(
                                            <Box key={reg.id} onClick={() => {setTrainee(`${traineeFound.last_name}, ${traineeFound.first_name} ${traineeFound.middle_name}`); setRegNum(reg.id); onOpenForm(); onCloseSForm();}} className='hover:bg-sky-300 transition ease-in-out duration-75 delay-75 p-4 border rounded shadow-md text-center'>
                                                <Text className='text-lg'>{`REG-${reg.reg_no}`}</Text>
                                            </Box>
                                        )
                                    }
                                })
                            }
                            </Box>
                        </Box>
                    </ModalBody>
                    <ModalFooter borderTopWidth='1px'>
                            <Button onClick={() => {onCloseSForm(); setSearch('');}} mr={3}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

interface AttachmentCardProps{
    label: string;
    currentUrl: string;
    onUpload: (file: File) => Promise<void>;
    onDownload: () => void;
    isLoading: boolean;
}

const AttachmentCard = ({label, currentUrl, onUpload, onDownload, isLoading}: AttachmentCardProps) => {
    const [preview, setPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    
    const handleUploadClick = async () => {
        if (selectedFile) {
            await onUpload(selectedFile);
            setPreview(null); // Clear preview after successful upload
            setSelectedFile(null);
        }
    };

    return(
        <GridItem border='1px solid' borderColor='gray.200' h='350px' borderRadius='lg' p='3' bg='white' shadow='md'>
            <Box display="flex" flexDirection="column" h="100%" justifyContent="space-between">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Text fontWeight="bold" fontSize="xs" color="gray.600" textTransform='uppercase'>{label}</Text>
                    <Button size="xs" variant="ghost" onClick={() => fileInputRef.current?.click()} leftIcon={<EditIcon />}>
                        Edit
                    </Button>
                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Box>
                <Box h='250px' bg='gray.50' borderRadius='md' display='flex' alignItems='center' justifyContent='center' position='relative' overflow='hidden' border='1px dashed' borderColor={preview ? 'blue.300' : 'gray.200'}>
                {preview || currentUrl ? (
                    <Image  src={preview || currentUrl}  alt={label}  objectFit="cover"  boxSize="100%" />
                ) : (
                    <Text color="gray.400" fontSize="xs">No file uploaded</Text>
                )}
                </Box>
                <Box display="flex" mt={3} gap={2}>
                    <Button  size="sm"  colorScheme="green"  flex={1}  isDisabled={!preview}  isLoading={isLoading} onClick={handleUploadClick} >
                        Upload
                    </Button>
                    <Button  size="sm"  colorScheme="blue"  variant="outline" flex={1}  isDisabled={!!preview || !currentUrl}  onClick={onDownload} leftIcon={<DownloadIcon />}>
                        View/Save
                    </Button>
                </Box>
            </Box>
        </GridItem>
    )
}