'use client'

import { useState, useRef, useEffect } from 'react'
import { Image, Box, Text, Input, Button, InputLeftAddon, Menu, MenuList, FormControl, Select, Switch, MenuButton, IconButton, MenuItem, MenuGroup, Grid, GridItem, InputGroup, useToast, Accordion, AccordionButton, AccordionPanel, AccordionItem, Modal, ModalOverlay, ModalHeader, ModalBody, ModalContent, ModalFooter, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { DotsIcon, ViewDocIcon, SearchIcon, StopIcon, } from '@/Components/Icons'
import { ChevronDownIcon, EditIcon, DownloadIcon, CheckCircleIcon } from '@chakra-ui/icons'
import { PlusIcon } from '@/Components/SideIcons'
import { Timestamp } from 'firebase/firestore'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useRoles } from '@/context/UserRolesContext'
import { useTypes } from '@/context/TypeContext'
import {useCategory} from '@/context/CategoryContext'
import { useRank } from '@/context/RankContext'
import DatePicker from 'react-datepicker'

import RegistrationForm from '@/Components/Page/Forms/RegistrationForm'
import AdmissionForm from '@/Components/Page/Forms/AdmissionForm'
import { InsertTraining, EditTrainingDetails, CancelModal, RegisterTrainee, ChangeAccountType } from '@/Components/Modal/Pending'

import { handleRegStatus } from '@/handlers/trainee_handler'
import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { generateDateBefore } from '@/handlers/course_handler'

import { ACKNOWLEDGE_REGISTRATION, ENROLL_COURSE, changeImg, updateTraineeAttachments, UPDATE_TRAINEE } from '@/lib/trainee_controller'
import { GENERATE_BATCH } from '@/lib/course_batches_controller'
import { TRAINING_BY_ID, initTRAINEE_BY_ID, TRAINEE_BY_ID } from '@/types/trainees'

import { useReactToPrint } from 'react-to-print'
import { deployYDate } from '@/types/utils' 
import { fullMonth } from '@/handlers/util_handler'

export default function Page() {
    const toast = useToast()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { data: allRegData, setMonth: setRMonth, setYear: setRYear } = useRegistrations()
    const { data: allCourses } = useCourses()
    const { data: allRoles } = useRoles()
    const { data: allCategories } = useCategory()
    const { area: allAreas, subArea: allSubArea } = useTypes()
    const { data: allRanks } = useRank()

    const [activeBtn, setActiveBtn] = useState<string>('')
    const [traineeName, setTrainee] = useState<string>('')
    const [training, setTraining] = useState<string>('')
    const [search, setSearch] = useState<string>('')
    const [regID, setRegID] = useState<string>('')
    const [t_id, setTID] = useState<string>('')
    const [cID, setCID] = useState<string>('')
    const [td, setTD] = useState<string>('')
    const [ts, setTS] = useState<string>('')
    const [account_type, setAccType] = useState<number>(0)
    const [loadBtn, setLoadBtn] = useState<boolean>(true)
    const [loading, setLoading] = useState<boolean>(false)
    const [traineeInfo, setTraineeInfo] = useState<TRAINEE_BY_ID>(initTRAINEE_BY_ID)

    const [training_id, setTrainingID] = useState<string>('')
    const [registration_id, setRegistrationID] = useState<string>('')
    const [trainee_id, setTraineeID] = useState<string>('')
    const [t_accountType, setTAccountType] = useState<number>(0)

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const { isOpen: isOpenAddress, onOpen: onOpenAddress, onClose: onCloseAddress } = useDisclosure()
    const { isOpen: isOpenCompany, onOpen: onOpenCompany, onClose: onCloseCompany } = useDisclosure()
    const {isOpen: isOpenRank, onOpen: onOpenRank, onClose: onCloseRank} = useDisclosure()

    const [rankRef, setRankRef] = useState<string>('')
    const [selectedRank, setSelectedRank] = useState<string>('')

    const [otherAddress, setAddress] = useState<boolean>(false)

    const [companyRef, setCompanyRef] = useState<string>('')
    const [selectCompany, setSelectCompany] = useState<string>('')

    const [birth_date, setBirth_Date] = useState<Date | null>(new Date())

    const { isOpen: isOpenReg, onOpen: onOpenReg, onClose: onCloseReg } = useDisclosure()
    const { isOpen: isOpenTS, onOpen: onOpenTS, onClose: onCloseTS } = useDisclosure()
    const { isOpen: isOpenRegister, onOpen: onOpenRegister, onClose: onCloseRegister } = useDisclosure()
    const { isOpen: isOpenTraining, onOpen: onOpenTraining, onClose: onCloseTraining } = useDisclosure()
    const { isOpen: isOpenCancel, onOpen: onOpenCancel, onClose: onCloseCancel } = useDisclosure()
    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()
    const { isOpen: isOpenAT, onOpen: onOpenAT, onClose: onCloseAT } = useDisclosure()
    const { isOpen: isOpenSForm, onOpen: onOpenSForm, onClose: onCloseSForm } = useDisclosure()
    const { isOpen: isOpenForm, onOpen: onOpenForm, onClose: onCloseForm } = useDisclosure()
    const { isOpen: isOpenAttach, onOpen: onOpenAttach, onClose: onCloseAttach } = useDisclosure()
    const { isOpen: isOpenScope, onOpen: onOpenScope, onClose: onCloseScope } = useDisclosure()
    const { isOpen: isOpenEditTrainee, onOpen: onOpenEditTrainee, onClose: onCloseEditTrainee } = useDisclosure()
    
    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${traineeName} REGISTRATION_FORM.pdf`,
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
                (p: any) => p.department === "Registration" && p.feature === "Pending"
            )
            setPermissions(permissions)
        }
        fetchData()
    }, [])

    const canDo = (feature: string) => {
        return permissions.some(p => p.allowed.includes(feature));
    }

    const isBoth = (user_scope: string) => {
        return permissions.some(p => p.scope === user_scope)
    }

    // Function to filter registrations based on search
    const filteredRegistrations = allRegData?.filter((reg) => reg.regType !== 3).filter((registration) => {
        const traineeFound = allTrainee?.find((trainee) => trainee.id === registration.trainee_ref_id);

        // Check if any field matches the search query
        return (
            traineeFound?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
            traineeFound?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
            traineeFound?.rank?.toLowerCase().includes(search.toLowerCase()) ||
            traineeFound?.srn?.toLowerCase().includes(search.toLowerCase()) ||
            parsingTimestamp(registration.date_registered)
                .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                .toLowerCase()
                .includes(search.toLowerCase())
        )
    })

    const handleAcknowledge = async (reg_id: string, reg: TRAINING_BY_ID, email: string, last_name: string, first_name: string) => {
        setActiveBtn(reg_id)
        const actor: string | null = localStorage.getItem('customToken')
        
        new Promise<void>((res,rej) => {
            setTimeout(async () => {
                try{
                    const { ...rest } = reg
                    await ACKNOWLEDGE_REGISTRATION(reg_id, rest, actor)
                    await fetch('/api/mail-verification', {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        }, 
                        body: JSON.stringify({
                            to: email,
                            subject: 'Pentagon Maritime Services Corp.',
                            text: 'Good news, your course training has been verified. Please await for someone to assist you on the next step. Thank you have a nice day!',
                            last_name: last_name,
                            first_name: first_name,
                        })
                    })
                    res()
                }catch(error){
                    rej(error)
                }
            }, 1500)
        }).then(() => {
            handleToast('Acknowledge Successfully!', `Registration was acknowledge, await for the cashier to acknowledge this to proceed for the enrollment.`, 7000, 'success')
        }).catch((error) => {
            console.log('Error:, ', error)
        }).finally(() => {
            setActiveBtn('')
        })
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

    const handleEnrollment = async (training_id: string, reg_id: string, trainee_id: string, reg_type: number, reg_account_type: number) => {
        setActiveBtn(training_id)
        setLoadBtn(false)
        const actor: string | null = localStorage.getItem('customToken')
        const actor_user_code: string | null = localStorage.getItem('userCode')
        
        new Promise<void>((res,rej) => {
            setTimeout(async () => {
                try{
                    let batch: string = '1'
                    const actorType: number = 1
                    await ENROLL_COURSE(Number(actor_user_code), batch, training_id, reg_id, trainee_id, reg_type, reg_account_type, actor)
                    
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Enrolled Successfully!', `Registration was enrolled, trainee can proceed for their training.`, 7000, 'success')
        }).catch((error) => {
            console.log('Error:, ', error)
        }).finally(() => {
            setActiveBtn('')
            setLoadBtn(true)
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

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target
        
        setTraineeInfo((prev) => ({
            ...prev,
            [id]: value
        }))
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {id, value} = e.target

        setTraineeInfo((prev) => ({
            ...prev,
            [id]: value
        }))
    }

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
    
    return (
    <>
        <main className="w-full space-y-3">
            <Box className="w-full flex" justifyContent='space-between'>
                <InputGroup w="30%" className="shadow-md rounded-lg">
                    <InputLeftAddon>
                        <SearchIcon color="#a1a1a1" size="18" />
                    </InputLeftAddon>
                    <Input
                        placeholder="e.g. Juan dela Cruz..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
                <Box>
                    <Button mr={4} onClick={onOpenDate} rightIcon={<ChevronDownIcon />} size='md' shadow='md'>Filter Date</Button>
                    {canDo("create") && (
                        <Button colorScheme='blue' onClick={onOpenRegister} bgColor='#1c437e' size='md' shadow='md'>Register</Button>
                    )}
                </Box>
            </Box>
            <Text>Backdated Portal</Text>
            <Box className="w-full px-5 space-y-3">
                <Box className="flex justify-between items-center bg-sky-700 rounded uppercase shadow-md p-3 px-8 text-white">
                    <Text w="40%" className="text-center">Registration Date</Text>
                    <Text w="25%" className="text-center">Trainee Type</Text>
                    <Text w="50%" className="text-center">{`Trainee's Name`}</Text>
                    <Text w="25%" className="text-center">rank</Text>
                    <Text w="25%" className="text-center">srn</Text>
                    <Text w="40%" className="text-center">Company</Text>
                    <Text w="50%" className="text-center">email</Text>
                    <Text w="40%" className="text-center">Attachments</Text>
                    {/* <Text w="50%" className="text-center">Payment Balance</Text> */}
                    <Text w="40%" className="text-center">contact no</Text>
                    {canDo('update') && (
                        <Text w="30%" className="text-center">action</Text>
                    )}
                </Box>
                <Box w=''className='px-3' style={{maxHeight: '700px', overflowY: 'auto'}}>
                    <Accordion allowToggle className="space-y-3">
                        {filteredRegistrations?.filter((registration) => allTraining?.some((training) => training.reg_ref_id === registration.id && training.reg_status < 3))
                        ?.sort((a, b) => {
                                const dateA =
                                    a.date_registered instanceof Timestamp
                                        ? a.date_registered.toDate()
                                        : new Date(0);
                                const dateB =
                                    b.date_registered instanceof Timestamp
                                        ? b.date_registered.toDate()
                                        : new Date(0);

                                return dateB.getTime() - dateA.getTime();
                            }).map((registration) => {
                            const traineeFound = allTrainee?.find((trainee) => trainee.id === registration.trainee_ref_id)
                            if(traineeFound){
                                return(
                                    <AccordionItem key={registration.id}>
                                        <AccordionButton _expanded={{bg: '#a8d1e8'}} py={4} borderRadius='md' borderLeftWidth='6px' borderColor={`${registration.reg_accountType === 0 ? 'blue.600' : 'green.600'}`} className={`${registration.reg_accountType === 0 ? '' : ''} flex items-center justify-between rounded shadow-md px-8 uppercase`}>
                                            <Text w="40%" className="text-xs text-center">{parsingTimestamp(registration.date_registered).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>
                                            <Text w="25%" className="text-xs text-center">{registration.traineeType === 0 ? 'new' : 'OLD'}</Text>
                                            <Text w="50%" className="text-xs text-center">
                                                {`${traineeFound.last_name}, ${traineeFound.first_name} ${traineeFound.middle_name === '' || traineeFound.middle_name.toLowerCase() === 'n/a' ? '' : `${traineeFound.middle_name.charAt(0)}.`} ${traineeFound.suffix === '' || traineeFound.suffix.toLowerCase() === 'n/a'  ? '' : traineeFound.suffix}`}
                                            </Text>
                                            <Text w="25%" className="text-xs text-center">{traineeFound.rank}</Text>
                                            <Text w="25%" className="text-xs text-center">{traineeFound.srn}</Text>
                                            <Text w="40%" className="text-xs text-center">
                                                {allClients?.find((client) => client.id === traineeFound.company)?.company || traineeFound.company}
                                            </Text>
                                            <Text w="50%" className="text-xs text-center lowercase">{traineeFound.email}</Text>
                                            <Text w="40%" onClick={() => {setTraineeInfo(traineeFound); onOpenAttach();}} className="text-xs text-center">{`View`}</Text>
                                            <Text w="40%" className="text-xs text-center">{traineeFound.contact_no}</Text>
                                            {canDo('update') && (
                                                <Box p={0} w='30%'>
                                                    <Menu isLazy  >
                                                        <MenuButton onClick={(e) => e.stopPropagation()} bg='#FFFFFF00' size='sm' _hover={{bg: '#FFFFFF00'}} as={IconButton} aria-label='Profile' icon={<DotsIcon size={'24'} color={'#a1a1a1'} />} />
                                                        <MenuList className='space-y-1 text-start'>
                                                            <MenuGroup title='Actions'>
                                                                <MenuItem onClick={(e) => {e.stopPropagation(); setBirth_Date(traineeFound.birthDate.toDate()); setTraineeInfo(traineeFound); onOpenEditTrainee(); setRegID(registration.id);}}>
                                                                    <span className='ps-2'><EditIcon color={'#0D70AB'} /></span>
                                                                    <span className='ps-2' style={{fontSize: '14px'}}>Edit Trainee Details</span>
                                                                </MenuItem>
                                                                <MenuItem onClick={(e) => {e.stopPropagation(); setTrainee(`${traineeFound.last_name.toUpperCase()}, ${traineeFound.first_name.toUpperCase()} ${traineeFound.middle_name === '' || traineeFound.middle_name.toLowerCase() === 'n/a' ? '' : `${traineeFound.middle_name.charAt(0).toUpperCase()}.`} ${traineeFound.suffix === '' || traineeFound.suffix.toLowerCase() === 'n/a'  ? '' : traineeFound.suffix.toUpperCase()}`); onOpenReg(); setRegID(registration.id);}}>
                                                                    <span className='ps-2'><ViewDocIcon size={'24'} color={'#0D70AB'} /></span>
                                                                    <span className='ps-2' style={{fontSize: '14px'}}>View Registration</span>
                                                                </MenuItem>
                                                                <MenuItem onClick={(e) => {e.stopPropagation(); onOpenTraining(); setAccType(registration.reg_accountType); setCID(traineeFound.company); setRegID(registration.id);}}>
                                                                    <span className='ps-2'><PlusIcon size={'24'} color={'#0D70AB'} /></span>
                                                                    <span className='ps-2' style={{fontSize: '14px'}}>Add Training</span>
                                                                </MenuItem>
                                                                <MenuItem onClick={(e) => {e.stopPropagation(); onOpenCancel(); setTID(''); setRegID(registration.id);}}>
                                                                    <span className='ps-2'><StopIcon size={'24'} color={'#df0017'} /></span>
                                                                    <span className='ps-2' style={{fontSize: '14px'}}>Cancel Registration</span>
                                                                </MenuItem>
                                                            </MenuGroup>
                                                        </MenuList>
                                                    </Menu>
                                                </Box>
                                            )}
                                        </AccordionButton>
                                        <AccordionPanel display='flex' flexDir='column'  gridGap={3}>
                                            <Box className='uppercase w-full p-3 border rounded text-center shadow-md' bg='#dcdee1' display='flex' justifyContent='between' >
                                                <Text className='text-zinc-500' w='100%'>course</Text>
                                                <Text className='text-zinc-500' w='100%'>course fee</Text>
                                                <Text className='text-zinc-500' w='100%'>charge</Text>
                                                <Text className='text-zinc-500' w='100%'>start date</Text>
                                                <Text className='text-zinc-500' w='100%'>end date</Text>
                                                <Text className='text-zinc-500' w='100%'>duration</Text>
                                                <Text className='text-zinc-500' w='100%'>status</Text>
                                                {canDo('update') &&  (
                                                    <Text className='text-zinc-500' w='100%'>action</Text>
                                                )}
                                            </Box>
                                            {allTraining && allTraining?.filter((training) => training.reg_ref_id === registration.id && training.reg_status < 3).map((training) => (
                                                <Box key={training.id} className='py-3 px-5 items-center text-center border-b rounded' display='flex' justifyContent='between'>
                                                    <Text w='100%' className='text-xs uppercase'>
                                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                                    </Text>
                                                    <Text w='100%' className='text-xs uppercase'>{`Php  ${training.course_fee}`}</Text>
                                                    <Text w='100%' className='text-xs uppercase'>{training.accountType === 0 ? 'Crew' : 'Company'}</Text>
                                                    <Text w='100%' className='text-xs uppercase'>{training.start_date}</Text>
                                                    <Text w='100%' className='text-xs uppercase'>{training.end_date !== '' ? training.end_date : '--'}</Text>
                                                    <Text w='100%' className='text-xs uppercase'>{training.numOfDays > 1 ? `${training.numOfDays} days` : `${training.numOfDays} day`}</Text>
                                                    {training.reg_status === 0 && canDo('update') ? (
                                                        <Button w='100%' onClick={() => {handleAcknowledge(training.id, training, traineeFound?.email, traineeFound?.last_name, traineeFound?.first_name)}} colorScheme='blue' className="text-xs uppercase text-center" size='xs' py={4} variant='link' isLoading={activeBtn === training.id} loadingText='Acknowledging...'>Acknowledge</Button>
                                                    ) : training.reg_status === 2 && canDo('update') ? (
                                                        isBoth('both') ? (
                                                            // If scope is set to both
                                                            <Button w='90%' onClick={() => {setTrainingID(training.id); setRegistrationID(registration.id); setTraineeID(traineeFound.id); setTAccountType(training.accountType); onOpenScope();}} colorScheme='green' className="text-xs uppercase text-center" size='xs' py={4} variant='link'>Enroll As</Button>
                                                        ) : (
                                                            // If scope is set to bd only
                                                            <Button w='90%' onClick={() => {handleEnrollment(training.id, registration.id, traineeFound.id, 1, training.accountType)}} colorScheme='green' className="text-xs uppercase text-center" size='xs' py={4} variant='link' isLoading={activeBtn === training.id} isDisabled={!loadBtn} loadingText='Enrolling...'>Enroll Course</Button>
                                                        )
                                                    ) :(
                                                        <Text w='100%' className={`${training.reg_status === 1 ? 'text-yellow-500' : training.reg_status === 2 ? 'text-green-500 font-bolder' : ''} text-xs uppercase`}>{handleRegStatus(training.reg_status)}</Text>
                                                    )}
                                                    {canDo('update') && (
                                                        <Box w='100%'>
                                                            <Menu isLazy  >
                                                                <MenuButton onClick={(e) => e.stopPropagation()} bg='#FFFFFF00' size='sm' _hover={{bg: '#FFFFFF00'}} as={IconButton} aria-label='Profile' icon={<DotsIcon size={'24'} color={'#a1a1a1'} />} />
                                                                <MenuList className='space-y-1 text-start'>
                                                                    <MenuGroup title='Training Details'>
                                                                        <MenuItem onClick={(e) => {e.stopPropagation(); setTD('ts'); setCID(traineeFound.company); setTS(training.id); onOpenTS();}}>
                                                                            <span className='ps-2'><ViewDocIcon size={'24'} color={'#0D70AB'} /></span>
                                                                            <span className='ps-2' style={{fontSize: '14px'}}>Edit Training Details</span>
                                                                        </MenuItem>
                                                                        <MenuItem onClick={(e) => {e.stopPropagation();  setRegID(registration.id); setTS(training.id); onOpenAT();}}>
                                                                            <span className='ps-2'><ViewDocIcon size={'24'} color={'#0D70AB'} /></span>
                                                                            <span className='ps-2' style={{fontSize: '14px'}}>Change Account Type</span>
                                                                        </MenuItem>
                                                                        <MenuItem onClick={(e) => {e.stopPropagation(); setTID(training.id); setTraining(allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''); setRegID(''); onOpenCancel();}}>
                                                                            <span className='ps-2'><StopIcon size={'24'} color={'#df0017'} /></span>
                                                                            <span className='ps-2' style={{fontSize: '14px'}}>Cancel Training</span>
                                                                        </MenuItem>
                                                                    </MenuGroup>
                                                                </MenuList>
                                                            </Menu>
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </AccordionPanel>
                                    </AccordionItem> 
                                )
                            }
                        })}
                    </Accordion>
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
        <Modal isOpen={isOpenScope} onClose={onCloseScope}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Enroll this Training As</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text fontWeight='normal' textAlign='center' >{`Please make sure that all details are correct before enrolling the crew to this course. Also make sure that you are enrolling the crew on the correct category.`}</Text>
                </ModalBody>
                <ModalFooter gap='2'>
                    <Button onClick={() => {handleEnrollment(training_id, registration_id, trainee_id, 0, t_accountType)}} colorScheme='blue' isLoading={activeBtn === training_id} loadingText='Loading...' bgColor='blue.700' shadow='md' w='100%'>Dated</Button>
                    <Button onClick={() => {handleEnrollment(training_id, registration_id, trainee_id, 1, t_accountType)}} colorScheme='blue' isLoading={activeBtn === training_id} loadingText='Loading...' bgColor='blue.900' shadow='md' w='100%'>BackDated</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenAttach} onClose={onCloseAttach} size='6xl' >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color='blue.700'>TRAINEE ATTACHMENTS</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6} p={4}>
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
        <Modal size='full' scrollBehavior='inside' isOpen={isOpenRegister} onClose={onCloseRegister}>
            <ModalOverlay />
            <ModalContent bgColor='#00000099'>
                <ModalBody px={{base: '5%', md: '10%', lg: '20%'}} py='2%'>
                    <RegisterTrainee onClose={onCloseRegister} />
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenTraining} onClose={onCloseTraining} scrollBehavior='inside' size='full'>
            <ModalOverlay />
            <ModalContent bgColor='#00000099'>
                <ModalBody px={{base: '5%', md: '10%', lg: '30%'}} py='2%'>
                    <InsertTraining c_id={cID} accountType={account_type} onClose={onCloseTraining} reg_id={regID} tab={0} />
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenAT} onClose={onCloseAT} >
            <ModalOverlay />
            <ModalContent >
                <ModalBody >
                    <ChangeAccountType training_id={ts} reg_id={regID} onClose={onCloseAT} />
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenCancel} onClose={onCloseCancel} scrollBehavior='inside' >
            <ModalOverlay />
            <ModalContent >
                <ModalBody >
                    <CancelModal onClose={onCloseCancel} course={training} reg_id={regID} training_id={t_id}/>
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenReg} onClose={onCloseReg} scrollBehavior='inside' size='full'>
            <ModalOverlay />
            <ModalContent px={4}>
                <ModalHeader color='blue.700' fontWeight='800'>Registration & Admission Forms</ModalHeader>
                <ModalCloseButton />
                <ModalBody display='flex' alignItems='center' flexDir='column'>
                    <Box w='7.9in' > 
                        <Box w='100%' ref={componentRef}>
                            <RegistrationForm regNum={regID} tab={'pending'} />
                            <AdmissionForm regNum={regID} tab={'pending'} traineeName={traineeName} />
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='1px'>
                    <Button onClick={() => {onCloseForm(); onOpenSForm();}} mr={3}>Close</Button>
                    <Button colorScheme='blue' bgColor='#1C437E' onClick={handlePrint}>Print Forms</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenTS} onClose={onCloseTS} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontSize='lg' fontWeight='700' className='text-sky-700 uppercase'>Edit Training Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box w='100%' display='flex' justifyContent='center'>
                        <EditTrainingDetails training_id={ts} company_id={cID} onClose={onCloseTS}/>
                    </Box>
                </ModalBody>
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
    }

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
                        Save
                    </Button>
                </Box>
            </Box>
        </GridItem>
    )
}
