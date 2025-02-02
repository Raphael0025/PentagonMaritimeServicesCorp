'use client'

import { useState, useRef } from 'react';
import { Box, Text, Input, Button, InputLeftAddon, Menu, MenuList, MenuButton, IconButton, MenuItem, MenuGroup, MenuDivider, MenuOptionGroup, MenuItemOption, InputGroup, useToast, Accordion, AccordionButton, AccordionPanel, AccordionIcon, AccordionItem, Modal, ModalOverlay, ModalHeader, ModalBody, ModalContent, ModalFooter, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { DotsIcon, ViewDocIcon, SearchIcon, StopIcon, } from '@/Components/Icons';
import { PlusIcon } from '@/Components/SideIcons';
import { Timestamp } from 'firebase/firestore';

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'

import RegistrationForm from '@/Components/Page/Pending/RegistrationForm'
import EditTrainingSched from '@/Components/Page/Pending/EditTrainingSched'
import InsertTraining from '@/Components/Modal/InsertTraining'
import CancelModal from '@/Components/Modal/CancelModal'

import { handleRegStatus } from '@/handlers/trainee_handler'
import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { generateDateBefore } from '@/handlers/course_handler'

import { ACKNOWLEDGE_REGISTRATION, ENROLL_COURSE } from '@/lib/trainee_controller'
import { GENERATE_BATCH } from '@/lib/course_batches_controller'
import { TRAINING_BY_ID } from '@/types/trainees'

import { useReactToPrint } from 'react-to-print'

export default function Page() {
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining } = useTraining()
    const { data: allCourses } = useCourses()
    const { data: allRegistrations } = useRegistrations()

    const [activeBtn, setActiveBtn] = useState<string>('')
    const [loadBtn, setLoadBtn] = useState<boolean>(true)
    const [search, setSearch] = useState<string>('')
    const [regID, setRegID] = useState<string>('')
    const [t_id, setTID] = useState<string>('')
    const [training, setTraining] = useState<string>('')
    const [cID, setCID] = useState<string>('')
    const [account_type, setAccType] = useState<number>(0)
    const [ts, setTS] = useState<string>('')
    const [td, setTD] = useState<string>('')

    const [traineeName, setTrainee] = useState<string>('')

    const { isOpen: isOpenReg, onOpen: onOpenReg, onClose: onCloseReg } = useDisclosure()
    const { isOpen: isOpenTS, onOpen: onOpenTS, onClose: onCloseTS } = useDisclosure()
    const { isOpen: isOpenCF, onOpen: onOpenCF, onClose: onCloseCF } = useDisclosure()
    const { isOpen: isOpenTraining, onOpen: onOpenTraining, onClose: onCloseTraining } = useDisclosure()
    const { isOpen: isOpenCancel, onOpen: onOpenCancel, onClose: onCloseCancel } = useDisclosure()

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${traineeName} REGISTRATION_FORM.pdf`,
    })

    // Function to filter registrations based on search
    const filteredRegistrations = allRegistrations?.filter((reg) => reg.regType !== 3).filter((registration) => {
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
                    const { id, ...rest } = reg
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

    const handleEnrollmentBD = async (training_id: string, reg_id: string, trainee_id: string, reg_account_type: number) => {
        setActiveBtn(training_id)
        setLoadBtn(false)
        const actor: string | null = localStorage.getItem('customToken')
        
        new Promise<void>((res,rej) => {
            setTimeout(async () => {
                try{
                    const training = allTraining?.find((t) => t.id === training_id)
                    if(!training){
                        return
                    }
                    const courseTraining = allCourses?.find((c) => c.id === training.course)
                    if(!courseTraining){
                        return
                    }
                    
                    const start_date = training.start_date
                    const tArr = allTraining?.filter((t) => t.regType === 0 && t.start_date === start_date && t.batch !== 1 && training.id !== t.id && t.course === training.course)
                    const realBN = tArr?.some((t) => t.batch !== 1)

                    let batch: string = '1'

                    if((tArr?.length ?? 0) > 0 && realBN){ // if there are more and if batch num is not equal to one (1)
                        const batch_num = allTraining?.find((t) => t.regType === 0 && t.start_date === start_date && t.batch !== 1 && training.id !== t.id && t.course === training.course)?.batch
                        if(batch_num){
                            batch = batch_num.toString()
                        }
                    } else {
                        // generate new batch number in this block, get the latest batch number and increment it
                        // generate first the training schedules from courses and get the date before the training start_date
                        const lastMonth = generateDateBefore(courseTraining.day, 15, courseTraining.numOfDays.toString())
                        
                        let tempArr: string[] = []
                        let trainingDates: string[] = []
                        
                        if(training.numOfDays !== 1){
                            tempArr = lastMonth
                        }else{
                            trainingDates = lastMonth
                        }
                        for(const date of tempArr){
                            const [startDate, endDate] = date.split(" to ").map((date) => date.trim())
                            trainingDates.push(startDate); // Add to the end of the array
                        }
                        const dateIndx = trainingDates.indexOf(training.start_date)
                        const dayBefore = trainingDates[dateIndx - 1]
                        const lastCurrentCourseBatch = courseBatch?.find((b) => b.start_date === dayBefore && b.course === training.course)
                        
                        if(lastCurrentCourseBatch){
                            const nextBatch = Number(lastCurrentCourseBatch?.batch_no) + 1
                            batch = await GENERATE_BATCH(nextBatch.toString(), training.course, training.start_date, training.end_date, training.numOfDays.toString(), actor)
                        } else {
                            batch = await GENERATE_BATCH('1', training.course, training.start_date, training.end_date, training.numOfDays.toString(), actor)
                        }
                    }
                    await ENROLL_COURSE(batch, training_id, reg_id, trainee_id, 0, reg_account_type, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 1500)
        }).then(() => {
            handleToast('Enrolled Successfully!', `Registration was enrolled, trainee can proceed for their training.`, 7000, 'success')
        }).catch((error) => {
            console.log('Error:, ', error)
        }).finally(() => {
            setActiveBtn('')
            setLoadBtn(true)
        })
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
                    <Button colorScheme='blue' size='md'>Register</Button>
                </Box>
            </Box>
            <Box className="w-full px-5 space-y-3">
                <Box className="flex justify-between items-center bg-sky-700 rounded uppercase shadow-md p-3 px-8 text-white">
                    <Text w="40%" className="text-center">Registration Date</Text>
                    <Text w="25%" className="text-center">Trainee Type</Text>
                    <Text w="50%" className="text-center">{`Trainee's Name`}</Text>
                    <Text w="25%" className="text-center">rank</Text>
                    <Text w="25%" className="text-center">srn</Text>
                    <Text w="40%" className="text-center">Company</Text>
                    <Text w="40%" className="text-center">email</Text>
                    {/* <Text w="50%" className="text-center">Payment Balance</Text> */}
                    <Text w="40%" className="text-center">contact no</Text>
                    <Text w="30%" className="text-center">action</Text>
                </Box>
                <Box className='px-3' style={{maxHeight: '700px', overflowY: 'auto'}}>
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
                                    <AccordionItem  key={registration.id}>
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
                                            <Text w="40%" className="text-xs text-center lowercase">{traineeFound.email}</Text>
                                            <Text w="40%" className="text-xs text-center">{traineeFound.contact_no}</Text>
                                            <Box p={0} w='30%'>
                                                <Menu isLazy  >
                                                    <MenuButton onClick={(e) => e.stopPropagation()} bg='#FFFFFF00' size='sm' _hover={{bg: '#FFFFFF00'}} as={IconButton} aria-label='Profile' icon={<DotsIcon size={'24'} color={'#a1a1a1'} />} />
                                                    <MenuList className='space-y-1 text-start'>
                                                        <MenuGroup title='Actions'>
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
                                                <Text className='text-zinc-500' w='100%'>action</Text>
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
                                                    {training.reg_status === 0 ? (
                                                        <Button w='100%' onClick={() => {handleAcknowledge(training.id, training, traineeFound?.email, traineeFound?.last_name, traineeFound?.first_name)}} colorScheme='blue' className="text-xs uppercase text-center" size='xs' py={4} variant='link' isLoading={activeBtn === training.id} loadingText='Acknowledging...'>Acknowledge</Button>
                                                    ) : training.reg_status === 2 ? (
                                                        <Button w='90%' onClick={() => {handleEnrollmentBD(training.id, registration.id, traineeFound.id, training.accountType)}} colorScheme='green' className="text-xs uppercase text-center" size='xs' py={4} variant='link' isLoading={activeBtn === training.id} isDisabled={!loadBtn} loadingText='Enrolling...'>Enroll Course</Button>
                                                    ) :(
                                                        <Text w='100%' className={`${training.reg_status === 1 ? 'text-yellow-500' : training.reg_status === 2 ? 'text-green-500 font-bolder' : ''} text-xs uppercase`}>{handleRegStatus(training.reg_status)}</Text>
                                                    )}
                                                    <Box w='100%'>
                                                        <Menu isLazy  >
                                                            <MenuButton onClick={(e) => e.stopPropagation()} bg='#FFFFFF00' size='sm' _hover={{bg: '#FFFFFF00'}} as={IconButton} aria-label='Profile' icon={<DotsIcon size={'24'} color={'#a1a1a1'} />} />
                                                            <MenuList className='space-y-1 text-start'>
                                                                <MenuGroup title='Training Details'>
                                                                    <MenuItem onClick={(e) => {e.stopPropagation(); setTD('ts'); setTS(training.id); onOpenTS();}}>
                                                                        <span className='ps-2'><ViewDocIcon size={'24'} color={'#0D70AB'} /></span>
                                                                        <span className='ps-2' style={{fontSize: '14px'}}>Edit Training Schedule</span>
                                                                    </MenuItem>
                                                                    <MenuItem onClick={(e) => {e.stopPropagation(); setTD('cf'); setTS(training.id); onOpenCF();}}>
                                                                        <span className='ps-2'><ViewDocIcon size={'24'} color={'#0D70AB'} /></span>
                                                                        <span className='ps-2' style={{fontSize: '14px'}}>Edit Course Fee</span>
                                                                    </MenuItem>
                                                                    <MenuItem onClick={(e) => {e.stopPropagation(); setTID(training.id); setTraining(allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''); setRegID(''); onOpenCancel();}}>
                                                                        <span className='ps-2'><StopIcon size={'24'} color={'#df0017'} /></span>
                                                                        <span className='ps-2' style={{fontSize: '14px'}}>Cancel Training</span>
                                                                    </MenuItem>
                                                                </MenuGroup>
                                                            </MenuList>
                                                        </Menu>
                                                    </Box>
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
        <Modal isOpen={isOpenTraining} onClose={onCloseTraining} scrollBehavior='inside' size='full'>
            <ModalOverlay />
            <ModalContent bgColor='#00000099'>
                <ModalBody px={{base: '5%', md: '10%', lg: '30%'}} py='2%'>
                    <InsertTraining c_id={cID} accountType={account_type} onClose={onCloseTraining} reg_id={regID} />
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenCancel} onClose={onCloseCancel} scrollBehavior='inside' >
            <ModalOverlay />
            <ModalContent >
                <ModalBody >
                    <CancelModal onClose={onCloseCancel} course={training} reg_id={regID} training_id={t_id} />
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenReg} onClose={onCloseReg} scrollBehavior='inside' size='full'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontSize='lg' fontWeight='700' className='text-sky-700 uppercase'>Preview</ModalHeader>
                <ModalBody>
                    <Box ref={componentRef} w='100%' display='flex' justifyContent='center'>
                        <RegistrationForm reg_id={regID} />
                    </Box>
                </ModalBody>
                <ModalFooter>
                        <Button shadow='lg' size='sm' mr={3} onClick={onCloseReg}>Close Viewer</Button>
                        <Button shadow='lg' size='sm' bgColor='#1C437E' colorScheme='blue' onClick={handlePrint}>Print Form</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenTS} onClose={onCloseTS} size='md'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontSize='lg' fontWeight='700' className='text-sky-700 uppercase'>Edit Training Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box w='100%' display='flex' justifyContent='center'>
                        <EditTrainingSched training_id={ts} td={td} onClose={onCloseTS}/>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenCF} onClose={onCloseCF} size='md'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontSize='lg' fontWeight='700' className='text-sky-700 uppercase'>Edit Course Fee</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box w='100%' display='flex' justifyContent='center'>
                        <EditTrainingSched training_id={ts} td={td} onClose={onCloseCF}/>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
        </>
    );
}
