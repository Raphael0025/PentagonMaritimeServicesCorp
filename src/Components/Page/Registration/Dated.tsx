'use client'

import { useState, useRef } from 'react';
import { Box, Text, Input, Textarea, Button, InputLeftAddon, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { DotsIcon, SearchIcon } from '@/Components/Icons';
import { Timestamp } from 'firebase/firestore';

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import {useRank} from '@/context/RankContext'

import { handleRegStatus } from '@/handlers/trainee_handler'
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import { TRAINING_BY_ID } from '@/types/trainees'

import RegistrationForm from '@/Components/Page/Forms/RegistrationForm'
import AdmissionForm from '@/Components/Page/Forms/AdmissionForm'

import { SAVE_REMARKS, addRegTypeField } from '@/lib/trainee_controller'
import { useReactToPrint } from 'react-to-print'

export default function Page(){
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { data: allRanks } = useRank()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining } = useTraining()
    const { data: allCourses } = useCourses()
    const { data: allRegistrations } = useRegistrations()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [idRef, setID] = useState<string>('')
    const [remarks, setRemarks] = useState<string>('')
    const [regNum, setRegNum] = useState<string>('')
    const [traineeName, setTrainee] = useState<string>('')

    const { isOpen: isOpenRm, onOpen: onOpenRm, onClose: onCloseRm } = useDisclosure()
    const { isOpen: isOpenForm, onOpen: onOpenForm, onClose: onCloseForm } = useDisclosure()
    const { isOpen: isOpenSForm, onOpen: onOpenSForm, onClose: onCloseSForm } = useDisclosure()
    
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
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = currentDate.getFullYear();
    
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
                    <Button onClick={
                        onOpenSForm
                    } bgColor='#1C437E' colorScheme='blue' size='sm'>Print Forms</Button>
                </Box>
                <Box className="w-full flex pr-4" style={{maxHeight: '700px', overflowY: 'auto'}}>
                    {/* Left Side */}
                    <Box w="50%" className="space-y-3">
                        <Box h='60px' className="flex items-center bg-sky-700 rounded rounded-r-none uppercase shadow-md p-3 pr-1 text-white">
                            <Text w="80%" className="text-center wrap">Enrolled Date</Text>
                            <Text w="80%" className="text-center wrap">Trainee Type</Text>
                            <Text w="100%" className="text-center">Registration No.</Text>
                            <Text w="100%" className="text-center">Batch</Text>
                            <Text w="100%" className="text-center">Course</Text>
                            <Text w="100%" className="text-center">status</Text>
                        </Box>
                        {allTraining && allTraining.sort((a, b) => {
                                return a.date_enrolled.toMillis() - b.date_enrolled.toMillis();
                            }).filter((t) => t.reg_status >= 3 && t.regType === 0 && new Date(t.date_enrolled.toMillis()).getMonth() === currentMonth && 
                            new Date(t.date_enrolled.toMillis()).getFullYear() === currentYear).map((training) => {
                                const registration = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                                const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                                
                            if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm) ||
                                trainee.first_name.toLowerCase().includes(searchTerm) ||
                                trainee.rank?.toLowerCase().includes(searchTerm) ||
                                trainee.srn?.toLowerCase().includes(searchTerm) ||
                                `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm) ||
                                parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm)
                            )
                            ){
                                return(
                                    <Box key={training.id} className="flex shadow items-center text-center uppercase border-b p-3 pr-1">
                                        <Text w="80%">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                        <Text w="80%">
                                            {allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.traineeType === 0 ? 'new' : 'old'}
                                        </Text>                                        
                                        <Text w="100%">
                                            {`Reg-${allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.reg_no}`}
                                        </Text>                                        
                                        <Text w="100%">
                                            {`${courseBatch?.find((batch) => batch.id === training.batch.toString())?.batch_no || ''}`}
                                        </Text>                                        
                                        <Text w="100%">
                                            {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                        </Text>                                        
                                        <Text w='100%' className={`${training.reg_status >= 3 ? 'text-green-500 font-bolder' : ''} text-xs uppercase`}>{handleRegStatus(training.reg_status)}</Text>                                     
                                    </Box>
                                )
                            }
                        })}
                    </Box>
                    {/* Right Side */}
                    <Box w='50%' >
                        <Box w="100%" className="space-y-3 ps-0" style={{ maxWidth: '1600px', overflowX: 'auto', paddingRight: '1rem', boxSizing: 'border-box', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                            <Box w="3500px" h='60px' className="flex bg-sky-700 ps-0 p-3 rounded-r justify-between space-x-4 items-center uppercase text-white" style={{ whiteSpace: 'nowrap' }} >
                                <Box display="flex" flexDir="column" justifyContent="center" alignItems="center" >
                                    <Text className='pb-3'>{`Trainee's Info.`}</Text>
                                    <Box className="space-x-3 flex w-full">
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
                                        <Text w="200px" className="text-center">Contact No.</Text>
                                        <Text w="200px" className="text-center">Email Add.</Text>
                                    </Box>
                                </Box>
                                <Text w="350px" className="text-center">Company</Text>
                                <Text w="350px" className="text-center">Endorser</Text>
                                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                    <Text className='pb-3'>{`Training Schedule`}</Text>
                                    <Box className='flex w-full space-x-3'>
                                        <Text w="150px" className="text-center">From</Text>
                                        <Text w="150px" className="text-center">To</Text>
                                    </Box>
                                </Box>
                                <Text w="200px" className="text-center">Payment Mode</Text>
                                <Text w="200px" className="text-center">Course Fee</Text>
                                <Text w="200px" className="text-center">Vessel</Text>
                                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                    <Text className='pb-3'>{`In case of Emergency`}</Text>
                                    <Box className='flex w-full space-x-3'>
                                        <Text w="300px" className="text-center">Name</Text>
                                        <Text w="100px" className="text-center">Contact No</Text>
                                        <Text w="150px" className="text-center">Relationship</Text>
                                    </Box>
                                </Box>
                                <Text w="300px" className="text-center pr-5">Remarks</Text>
                            </Box>
                            {allTraining && allTraining.sort((a, b) => {
                                    return a.date_enrolled.toMillis() - b.date_enrolled.toMillis();
                                }).filter((t) => t.reg_status >= 3 && t.regType === 0 && new Date(t.date_enrolled.toMillis()).getMonth() === currentMonth && 
                                new Date(t.date_enrolled.toMillis()).getFullYear() === currentYear).map((training) => {
                                
                                const registration = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                                const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                                
                                if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm) ||
                                    trainee.first_name.toLowerCase().includes(searchTerm) ||
                                    trainee.rank?.toLowerCase().includes(searchTerm) ||
                                    trainee.srn?.toLowerCase().includes(searchTerm) ||
                                    `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm) ||
                                    parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm)
                                )
                                ){
                                    return(
                                        <Box key={training.id} w="3500px" className="flex text-center justify-between p-3 ps-0 border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='w-full flex space-x-3'>
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
                                                    <Tooltip label={trainee.otherAddress === '' ? `${trainee.house_no} ${trainee.street} Brgy. ${trainee.brgy}, ${trainee.city} City` : trainee.otherAddress}>
                                                        <Text noOfLines={1} w='250px' >
                                                            {trainee.otherAddress === '' ? `${trainee.house_no} ${trainee.street} Brgy. ${trainee.brgy}, ${trainee.city} City` : trainee.otherAddress}
                                                        </Text>                                        
                                                    </Tooltip>                                      
                                                </Box>
                                            </Box>
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='w-full flex space-x-3'>
                                                    <Text w="200px">{trainee.contact_no}</Text>    
                                                    <Text w="200px" className='lowercase'>{trainee.email}</Text>    
                                                </Box>
                                            </Box>
                                            <Tooltip className='text-center' aria-label='tooltip' label={allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}>
                                                <Text w="350px" noOfLines={1} className='text-wrap'>
                                                    {allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}
                                                </Text>    
                                            </Tooltip>    
                                            <Tooltip className='text-center uppercase' aria-label='tooltip' label={trainee.endorser}>
                                                <Text w="350px" noOfLines={1} className='text-wrap uppercase' >{trainee.endorser}</Text>    
                                            </Tooltip>    
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='w-full flex uppercase space-x-3'>
                                                    <Text w="150px">{training.start_date}</Text>    
                                                    <Text w="150px">{training.end_date === '' ? '--' : training.end_date}</Text>    
                                                </Box>
                                            </Box>
                                            <Text w="200px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>    
                                            <Text w="200px" >{`Php ${training.course_fee}`}</Text>    
                                            <Text w="200px" >{trainee.vessel}</Text>    
                                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                                <Box className='flex w-full space-x-3'>
                                                    <Text w="300px" className="text-center">{trainee.e_contact_person}</Text>
                                                    <Text w="100px" className="text-center">{trainee.e_contact}</Text>
                                                    <Text w="150px" className="text-center">{trainee.relationship}</Text>
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
            <Modal isOpen={isOpenSForm} size='md' scrollBehavior='inside' onClose={onCloseSForm}>
                <ModalOverlay />
                <ModalContent px={4}>
                    <ModalHeader className='text-sky-700' fontWeight='800'>Select Registration Number</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' alignItems='center' flexDir='column'>
                        <Box className='space-y-3 w-full'>
                        {allRegistrations && allRegistrations?.filter((r) => r.regType === 0 && allTraining?.some((training) => training.reg_ref_id === r.id && training.reg_status >= 3))
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
                    </ModalBody>
                    <ModalFooter borderTopWidth='1px'>
                            <Button onClick={onCloseSForm} mr={3}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}