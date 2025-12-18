'use client'

import { useState, useRef, useEffect } from 'react';
import { Box, Text, Input, Textarea, Button, InputLeftAddon, FormControl, Select, FormLabel, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';
import { ChevronDownIcon } from '@chakra-ui/icons'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useRank } from '@/context/RankContext' 
import { useRoles } from '@/context/UserRolesContext'

import { handleRegStatus } from '@/handlers/trainee_handler'
import { marketBGColor, marketFontColor } from '@/handlers/util_handler'
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import RegistrationForm from '@/Components/Page/Forms/RegistrationForm'
import AdmissionForm from '@/Components/Page/Forms/AdmissionForm'
import { EditRegistration } from '@/Components/Modal/Registration'

import { SAVE_REMARKS, UPDATE_TRAINEE, UPDATE_TRAINING, UPDATE_REGISTRATION } from '@/lib/trainee_controller'
import { useReactToPrint } from 'react-to-print'

//import './Registration.css'
import { deployYDate } from '@/types/utils' 
import { fullMonth } from '@/handlers/util_handler'

import { initTRAINEE_BY_ID, TRAINEE_BY_ID } from '@/types/trainees'

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

    const { isOpen: isOpenRm, onOpen: onOpenRm, onClose: onCloseRm } = useDisclosure()
    const { isOpen: isOpenForm, onOpen: onOpenForm, onClose: onCloseForm } = useDisclosure()
    const { isOpen: isOpenSForm, onOpen: onOpenSForm, onClose: onCloseSForm } = useDisclosure()
    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()
    const { isOpen: isOpenReg, onOpen: onOpenReg, onClose: onCloseReg } = useDisclosure()
    const { isOpen: isOpenMarketing, onOpen: onOpenMarketing, onClose: onCloseMarketing  } = useDisclosure()

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
                            <Box w="4150px" h='60px' className="flex bg-sky-700 rounded justify-between space-x-4 items-center uppercase text-white" style={{ whiteSpace: 'nowrap',  }} >
                                <Box display="flex" flexDir="column" justifyContent="center" alignItems="center" >
                                    <Box className="space-x-3 flex w-full" justifyContent='center' alignItems='center'>
                                        <Text w="150px" className="text-center">Enrolled Date</Text>
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
                                                    <Text w="150px">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                                    {/* <Text w="150px">
                                                        {allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.traineeType === 0 ? 'new' : 'old'}
                                                    </Text>                                         */}
                                                    <Text w="150px" _hover={{color: 'blue.700'}} onClick={() => {setRegNum(reg_id); onOpenReg();}} className='hover:cursor-pointer'>
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
                                    const [yearA, numA] = a.reg_no.split('-').map(Number);
                                    const [yearB, numB] = b.reg_no.split('-').map(Number);
                        
                                    // Compare by year first, then by the number part
                                    if (yearA !== yearB) return yearB - yearA;
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