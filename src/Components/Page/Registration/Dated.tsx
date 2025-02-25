'use client'

import { useState, useRef } from 'react';
import { Box, Text, Input, Textarea, Button, InputLeftAddon, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';
import { ChevronDownIcon } from '@chakra-ui/icons'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import {useRank} from '@/context/RankContext'

import { handleRegStatus } from '@/handlers/trainee_handler'
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import RegistrationForm from '@/Components/Page/Forms/RegistrationForm'
import AdmissionForm from '@/Components/Page/Forms/AdmissionForm'

import { SAVE_REMARKS } from '@/lib/trainee_controller'
import { useReactToPrint } from 'react-to-print'

import './Registration.css'
import { deployYDate } from '@/types/utils' 
import { fullMonth } from '@/handlers/util_handler'

export default function Page(){
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { data: allRanks } = useRank()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { data: allCourses } = useCourses()
    const { lastMonthReg: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [idRef, setID] = useState<string>('')
    const [remarks, setRemarks] = useState<string>('')
    const [regNum, setRegNum] = useState<string>('')
    const [traineeName, setTrainee] = useState<string>('')
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const { isOpen: isOpenRm, onOpen: onOpenRm, onClose: onCloseRm } = useDisclosure()
    const { isOpen: isOpenForm, onOpen: onOpenForm, onClose: onCloseForm } = useDisclosure()
    const { isOpen: isOpenSForm, onOpen: onOpenSForm, onClose: onCloseSForm } = useDisclosure()
    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()
    
    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${traineeName}_REGISTRATION_FORM.pdf`,
    })

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
            handleToast('Remarks Saved Successfully!', `Your Remarks on this registration has been saved successfully.`, 5000, 'success')
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
    
    return(
        <>
            <main className="w-full space-y-3">
            <Box className="w-full flex justify-between">
                    <Box className="w-full flex">
                        <InputGroup w="30%" className="shadow-md rounded-lg">
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
                    <Box display='flex' >
                        <Button mr={4} onClick={onOpenDate} rightIcon={<ChevronDownIcon />} size='sm'>Filter Date</Button>
                        <Button bgColor='#1C437E' onClick={onOpenSForm} colorScheme='blue' size='sm'>Print Forms</Button>
                    </Box>
                </Box>
                <Box className="w-full flex" style={{maxHeight: '700px', overflowY: 'auto'}}>
                    <Box w='100%' h='700px' className='custom-scrollbar' style={{ scrollbarWidth: 'thin',}}>
                        <Box w="100%" h='100%' className="custom-scrollbar rounded space-y-3" style={{  overflowX: 'auto', boxSizing: 'border-box',  msOverflowStyle: 'none'}}>
                            <Box w="6000px" h='60px' className="flex bg-sky-700 rounded justify-between space-x-4 items-center uppercase text-white" style={{ whiteSpace: 'nowrap' }} >
                                <Box display="flex" flexDir="column" justifyContent="center" alignItems="center" >
                                    <Text className='pb-3'>{`Trainee's Info.`}</Text>
                                    <Box className="space-x-3 flex w-full">
                                        <Text w="150px" className="text-center">Enrolled Date</Text>
                                        <Text w="150px" className="text-center">Trainee Type</Text>
                                        <Text w="150px" className="text-center">Registration No.</Text>
                                        <Text w="150px" className="text-center">Batch</Text>
                                        <Text w="150px" className="text-center">Course</Text>
                                        <Text w="150px" className="text-center">status</Text>
                                        <Text w="150px" className="text-center">Last Name</Text>
                                        <Text w="150px" className="text-center">First Name</Text>
                                        <Text w="150px" className="text-center">Middle Name</Text>
                                        <Text w="100px" className="text-center">Suffix</Text>
                                        <Text w="100px" className="text-center">Rank</Text>
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
                                    return a.date_enrolled.toMillis() - b.date_enrolled.toMillis();
                                }).filter((t) => t.reg_status >= 3 && t.regType === 0 ).map((training) => {
                                
                                const registration = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                                const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                                
                                if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                ){
                                    return(
                                        <Box key={training.id} w='6000px' className="flex text-center justify-between p-1 border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='w-full flex space-x-3'>
                                                    <Text w="150px">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                                    <Text w="150px">
                                                        {allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.traineeType === 0 ? 'new' : 'old'}
                                                    </Text>                                        
                                                    <Text w="150px">
                                                        {`Reg-${allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.reg_no}`}
                                                    </Text>                                        
                                                    <Text w="150px">
                                                        {`${courseBatch?.find((batch) => batch.id === training.batch.toString())?.batch_no || ''}`}
                                                    </Text>                                        
                                                    <Text w="150px">
                                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                                    </Text>                                        
                                                    <Text w='150px' className={`${training.reg_status >= 3 ? 'text-green-500 font-bolder' : ''} text-xs uppercase`}>{handleRegStatus(training.reg_status)}</Text>
                                                    <Text w="150px">{`${trainee.last_name}`}</Text>                                        
                                                    <Text w="150px">{`${trainee.first_name}`}</Text>                                        
                                                    <Text w="150px">{trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''}</Text>                                        
                                                    <Text w="100px">{trainee.suffix === '' ? '--' : trainee.suffix}</Text>                                        
                                                    <Text w="100px">
                                                        {allRanks?.find((rank) => rank.code === trainee.rank)?.rank || trainee.rank}
                                                    </Text>                                        
                                                    <Text w="100px">{trainee.srn}</Text>                                        
                                                    <Text w='150px' >{parsingTimestamp(trainee.birthDate).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</Text>
                                                    <Text w="200px">{trainee.birthPlace}</Text>
                                                    <Tooltip w='250px' label={trainee.otherAddress === '' ? `${trainee.house_no} ${trainee.street} Brgy. ${trainee.brgy}, ${trainee.city} City` : trainee.otherAddress}>
                                                        <Text noOfLines={1} w='250px'>
                                                            {trainee.otherAddress === '' ? `${trainee.house_no} ${trainee.street} Brgy. ${trainee.brgy}, ${trainee.city} City` : trainee.otherAddress}
                                                        </Text>                                        
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='w-full flex space-x-3'>
                                                    <Text w="100px">{trainee.contact_no}</Text>    
                                                    <Text w="180px" className='lowercase'>{trainee.email}</Text>    
                                                </Box>
                                            </Box>
                                            <Tooltip className='text-center' aria-label='tooltip' label={allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}>
                                                <Text w="250px" noOfLines={1} className='text-wrap'>
                                                    {allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}
                                                </Text>    
                                            </Tooltip>    
                                            <Tooltip className='text-center uppercase' aria-label='tooltip' label={trainee.endorser}>
                                                <Text w="150px" noOfLines={1} className='text-wrap uppercase' >{trainee.endorser}</Text>    
                                            </Tooltip>     
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='w-full flex uppercase space-x-3'>
                                                    <Text w="100px">{training.start_date}</Text>    
                                                    <Text w="100px">{training.end_date === '' ? '--' : training.end_date}</Text>    
                                                </Box>
                                            </Box>
                                            <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>    
                                            <Text w="100px" >{`Php ${training.course_fee}`}</Text>    
                                            <Text w="100px" >{trainee.vessel}</Text>    
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='flex w-full space-x-3'>
                                                    <Text w="150px" className="text-center">{trainee.e_contact_person}</Text>
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
                    <ModalHeader className='text-sky-700' fontWeight='800'>Registration & Admission Forms</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' alignItems='center' flexDir='column'>
                        <Box w='80%' >
                            <Box w='100%' ref={componentRef}>
                                <RegistrationForm regNum={regNum} traineeName={traineeName} />
                                <AdmissionForm regNum={regNum} traineeName={traineeName} />
                            </Box>
                        </Box>
                    </ModalBody>
                    <ModalFooter borderTopWidth='1px'>
                            <Button onClick={() => {onCloseForm(); onOpenSForm();}} mr={3}>Close</Button>
                            <Button onClick={handlePrint} bgColor='#1C437E' colorScheme='blue' isLoading={loading} loadingText='Saving...'>Print</Button>
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
                            <Box>
                                <InputGroup className="shadow-md rounded-lg">
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
                            <Box className='space-y-3 w-full' overflowY='auto' h='550px'>
                            {allRegistrations && allRegistrations?.filter((r) => r.regType === 0 && allTraining?.some((training) => training.reg_ref_id === r.id && training.reg_status >= 3))
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
                                .map((reg) => (
                                    <Box key={reg.id} onClick={() => {setRegNum(reg.id); onOpenForm(); onCloseSForm();}} className='hover:bg-sky-300 transition ease-in-out duration-75 delay-75 p-4 border rounded shadow-md text-center'>
                                        <Text className='text-lg'>{`REG-${reg.reg_no}`}</Text>
                                    </Box>
                                ))
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