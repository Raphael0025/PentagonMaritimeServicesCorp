'use client'

import { Timestamp } from 'firebase/firestore';
import React, { useState, useEffect } from 'react'
import { Box, Text, Button, Input, useDisclosure, InputGroup, InputLeftAddon, Checkbox, MenuList, Menu, MenuItem, MenuButton, IconButton, Modal, useToast, ModalOverlay, HStack, VStack, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRoles } from '@/context/UserRolesContext'

import { CloseIcon } from '@/Components/Icons';
import { Course, CourseFee, TrainingDate, AccountType } from './EditTraining'
import { TRAINING_BY_ID, initTraining } from '@/types/trainees'
import { InsertTraining } from '@/Components/Modal/Pending'

import { parsingTimestamp, ToastStatus } from '@/types/handling'

import { UPDATE_TRAINING, UPDATE_REGISTRATION, duplicateRegRecord, duplicateTrainRec } from '@/lib/trainee_controller'

interface PageProps {
    onClose: () => void;
    reg_id: string;
    reg_Type: number;
    permissions: any;
}

export default function EditRegistration({onClose, reg_id, reg_Type, permissions}: PageProps){
    const toast = useToast()
    const { lastMonthReg: allRegistrations } = useRegistrations()
    const { data: allTraining } = useTraining()
    const { data: allTrainee } = useTrainees()
    const { data: allCourses } = useCourses()
    const { data: allRoles } = useRoles()
    const { courseCodes } = useClients()
    
    const { isOpen: isOpenCourse, onOpen: onOpenCourse, onClose: onCloseCourse } = useDisclosure()
    const { isOpen: isOpenCF, onOpen: onOpenCF, onClose: onCloseCF } = useDisclosure()
    const { isOpen: isOpenTD, onOpen: onOpenTD, onClose: onCloseTD } = useDisclosure()
    const { isOpen: isOpenAT, onOpen: onOpenAT, onClose: onCloseAT } = useDisclosure()
    const { isOpen: isOpenRB, onOpen: onOpenRB, onClose: onCloseRB } = useDisclosure()
    const { isOpen: isOpenTraining, onOpen: onOpenTraining, onClose: onCloseTraining } = useDisclosure()
    const { isOpen: isOpenCancelT, onOpen: onOpenCancelT, onClose: onCloseCancelT } = useDisclosure()
    const { isOpen: isOpenNA, onOpen: onOpenNA, onClose: onCloseNA } = useDisclosure()
    const { isOpen: isOpenMBD, onOpen: onOpenMBD, onClose: onCloseMBD } = useDisclosure()
    const { isOpen: isOpenATD, onOpen: onOpenATD, onClose: onCloseATD } = useDisclosure()

    // Timestamped enrolled date
    const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);
    const [selectedTrainItem, setSelectedTrainItem] = useState<any>(null);
    const [newDateTime, setNewDateTime] = useState<string>('');
    const [isSavingDate, setIsSavingDate] = useState<boolean>(false);

    // Reg
    const [isRegModalOpen, setIsRegModalOpen] = useState<boolean>(false);
    const [newRegNo, setNewRegNo] = useState<string>('');
    const [isSavingReg, setIsSavingReg] = useState<boolean>(false);

    const [cID, setCID] = useState<string>('')
    const [account_type, setAccType] = useState<number>(0)
    const [trainingID, setTID] = useState<string>('')
    const [regID, setRegID] = useState<string>('')
    const [courseFee, setCF] = useState<number>(0)
    const [at, setAT] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [trainingDoc, setTraining] = useState<TRAINING_BY_ID>(initTraining)
    const [selectedTrainIDs, setSelectedTrainIDs] = useState<string[]>([]);
    const [permittedTo, setPermittedTo] = useState<string>('')
    const [actualSchedule, setActSched] = useState<string>('')

    const fetchedReg = allRegistrations?.find((reg) => reg.id === reg_id)
    const companyID = allTrainee?.find((t) => t.id === fetchedReg?.trainee_ref_id)?.company || ''

    const handleRollback = async () => {
        setLoading(true)
        try {
            const actor = localStorage.getItem('customToken')
            const rollbackTraining = { reg_status: 2, regType: 2 }
            const rollbackReg = { reg_no: '', regType: 2 }

            const totalTrainings = allTraining?.filter(
                (train) => train.reg_status === 3 && train.regType === reg_Type && train.reg_ref_id === reg_id
            ).length || 0

            // Update all selected training records
            await Promise.all(
                selectedTrainIDs.map((tID) => UPDATE_TRAINING(tID, rollbackTraining, actor))
            )

            // If not multiple trainings, update registration record as well
            if (totalTrainings <= 1 && regID) {
                await UPDATE_REGISTRATION(regID, rollbackReg, actor)
                onClose()
            }
        } catch (error) {
            console.error("ERROR DETECTED: ", error)
        } finally {
            setLoading(false)
            onCloseRB()
        }
    }

    const handleToggleSelect = (trainID: string) => {
        setSelectedTrainIDs((prev) =>
            prev.includes(trainID)
                ? prev.filter((id) => id !== trainID)
                : [...prev, trainID]
        )
    }

    const handleBatchCancelAndDuplicate = async () => {
        if (selectedTrainIDs.length === 0) return;
        setLoading(true);
    
        try {
            const actor = localStorage.getItem('customToken');
    
            // 1. Create ONE single duplicate registration record for this batch
            if (!fetchedReg) {
                throw new Error("Registration record not found.");
            }
            const { id: regID, reg_no: regNo, regType, ...cleanRegData } = fetchedReg;
            const newRegData = { ...cleanRegData, reg_no: '', regType: 2 };
    
            const newRegID = await duplicateRegRecord(newRegData);
    
            // 2. Loop through each selected training ID
            for (const trainID of selectedTrainIDs) {
                const fetchedTrainRec = allTraining?.find((t) => t.id === trainID);
                
                if (fetchedTrainRec) {
                    const { 
                        id, 
                        batch, 
                        enrolledBy, 
                        reg_ref_id, 
                        regType: trainRegType, 
                        reg_status, 
                        ...cleanTrainData 
                    } = fetchedTrainRec;
    
                    // Payload for new Pending record
                    const newTrainRec = {
                        ...cleanTrainData,
                        batch: '1',
                        enrolledBy: 0,
                        reg_ref_id: newRegID, // Points to the new shared registration ID
                        regType: 2,
                        reg_status: 2,        // Sets status to Pending
                    };
    
                    // Create duplicate training record
                    await duplicateTrainRec(newTrainRec);
    
                    // Cancel the original training record
                    await UPDATE_TRAINING(trainID, { reg_status: 7 }, actor);
                }
            }
    
            // Clear selection state on completion
            setSelectedTrainIDs([]);
            setLoading(false)
            onClose()
            onCloseNA()
            onCloseCancelT()
            setRegID('')
            setTID('')
    
        } catch (error) {
            console.error("ERROR IN BATCH CANCEL & DUPLICATE: ", error);
        } finally {
            setLoading(false);
        }
    }

    const handlTrainingStatus = async (newStatus: number) => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat = {
                        reg_status: newStatus,
                    }
                    await UPDATE_TRAINING(trainingID, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                    console.error(error)
                }
            }, 500)
        }).catch((error) => {
            console.error(error)
        }).finally(() => {
            setLoading(false)
            onClose()
            onCloseNA()
            onCloseCancelT()
            setRegID('')
            setTID('')
        })
    }

    useEffect(() => {
        const fetchData = () => {
            const role = localStorage.getItem('roleToken')
            const UserRole = allRoles?.find((item) => item.id === role)

            if(!UserRole) return

            const roleScope = UserRole?.permissions.find((r) => r.feature === 'Pending')?.scope || ''
            setPermittedTo(roleScope)
        }
        fetchData()
    },[])

    const canDo = (feature: string) => {
        return permissions.some((p: { allowed: string | string[]; }) => p.allowed.includes(feature));
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

    const handleActualtrainingDate = () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const splitActualTD = actualSchedule.split(' to ')
                    const actor = localStorage.getItem('customToken')

                    await UPDATE_TRAINING(trainingID, {act_start_date: splitActualTD[0] || '', act_end_date: splitActualTD[1] || ''}, actor)
                }catch(error){
                    rej(error)
                }
                res()
            }, 500)
        }).then(() =>{
            handleToast( 'Actual training Date Updated!', ``, 5000, 'success' )
        }).catch((error) => {
            console.error('Error: ', error)
        }).finally(() =>{
            onCloseATD()
            setActSched('')
            setLoading(false)
        })
    }

    const handleSaveEnrolledDate = async () => {
        if (!selectedTrainItem || !newDateTime) return;

        setIsSavingDate(true);

        try {
            // Convert input string into a Firebase Timestamp object
            const dateObj = new Date(newDateTime);
            const firestoreTimestamp = Timestamp.fromDate(dateObj);

            const company_staff = localStorage.getItem('customToken');

            // Pass the Timestamp object to match Partial<TRAINING> type
            await UPDATE_TRAINING(
                selectedTrainItem.id, 
                { date_enrolled: firestoreTimestamp }, 
                company_staff
            );

            handleToast('Success', 'Enrolled date and time updated successfully.', 3000, 'success');
            setIsDateModalOpen(false);
        } catch (error) {
            console.error('Failed to update enrolled date:', error);
            handleToast('Failed to Update', 'An error occurred while saving the new timestamp.', 5000, 'error');
        } finally {
            setIsSavingDate(false);
        }
    }

    const handleSaveRegNo = async () => {
        if (!fetchedReg?.id || !newRegNo.trim()) return;

        setIsSavingReg(true);

        try {
            const company_staff = localStorage.getItem('customToken');

            // Replace UPDATE_REGISTRATION with your database update function
            await UPDATE_REGISTRATION(
                fetchedReg.id, 
                { reg_no: newRegNo.trim() }, 
                company_staff
            );

            handleToast('Success', 'Registration number updated successfully.', 3000, 'success');
            setIsRegModalOpen(false);
        } catch (error) {
            console.error('Failed to update registration number:', error);
            handleToast('Error', 'Failed to update registration number.', 4000, 'error');
        } finally {
            setIsSavingReg(false);
        }
    }

    return(
    <>
    <Box>
        <Box display='flex' justifyContent='space-between'>
            <Text fontSize='lg' fontWeight='800' color='blue.700' textTransform='uppercase'>Trainings</Text>
            <Button onClick={onClose} variant='ghost' ><CloseIcon /></Button>
        </Box>
        <Box mt='4' >
            <Box display='flex' justifyContent='space-between'>
                <Box display='flex' flexDir='column' justifyContent='space-between'>
                    <Box display='flex'>
                        <Text color='gray.600' mr='2'>Account Type:</Text>
                        {canDo("update") ? (
                            <Text onClick={() => {onOpenAT(); setRegID(fetchedReg?.id ?? ''); setAT(fetchedReg?.reg_accountType ?? 0);}} _hover={{color: 'blue.700'}} className='hover:cursor-pointer'>
                                {`${fetchedReg?.reg_accountType === 0 ? 'Crew' : 'Company'} Charge`}
                            </Text>
                        ) : (
                            <Text>{`${fetchedReg?.reg_accountType === 0 ? 'Crew' : 'Company'} Charge`}</Text>
                        )}
                    </Box>

                    <Box display='flex' alignItems='center'>
                        <Text color='gray.600' mr='3'>Registration Number:</Text>
                        {canDo("update") ? (
                            <Text 
                                color='blue.700' 
                                _hover={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue.900' }}
                                title="Click to edit Registration Number"
                                onClick={() => {
                                    setNewRegNo(fetchedReg?.reg_no ?? '');
                                    setIsRegModalOpen(true);
                                }}
                            >
                                {`REG-${fetchedReg?.reg_no}`}
                            </Text>
                        ) : (
                            <Text color='blue.700'>{`REG-${fetchedReg?.reg_no}`}</Text>
                        )}
                    </Box>
                </Box>
                <Box display='flex' justifyContent='end' py='1'>
                    {canDo("create") && (
                        <Menu>
                            <MenuButton
                                as={IconButton}
                                aria-label='Options'
                                icon={<SettingsIcon />}
                                size='sm'
                                colorScheme='gray'
                                shadow='md'
                            />
                            <MenuList minW='120px'>
                                <MenuItem 
                                    fontSize='xs'
                                    onClick={() => {
                                        onOpenTraining(); 
                                        setAccType(fetchedReg?.reg_accountType ?? 0); 
                                        setCID(companyID); 
                                        setRegID(fetchedReg?.id ?? '');
                                    }}
                                >
                                    Add Training
                                </MenuItem>
                                <MenuItem  onClick={() => {onOpenRB(); setRegID(reg_id); }}fontSize='xs'>Manage Record Status</MenuItem>
                            </MenuList>
                        </Menu>
                    )}
                </Box>
            </Box>
            <Box mt='2'>
                <Box p='2' borderBottom='1px' bgColor='blue.700' borderBottomColor='gray.500' mb='2' display='flex' alignItems='center' justifyContent='space-between'>
                    <Text color='#fff' w='20%' textTransform={'uppercase'} fontSize='12px'>Enrolled Date</Text>
                    <Text color='#fff' w={`${reg_Type === 0 ? '50%' : '20%'}`} textTransform={'uppercase'} fontSize='12px'>Course</Text>
                    <Text color='#fff' w='30%' textTransform={'uppercase'} fontSize='12px'>Course Fee</Text>
                    {reg_Type === 0 ? (
                        <Text color='#fff' w='80%' textTransform={'uppercase'} textAlign='center' fontSize='12px'>Training Dates</Text>
                    ) : (
                        <Text color='#fff' w='80%' textTransform={'uppercase'} textAlign='center' fontSize='12px'>
                            <Text>Training Dates</Text>
                            <Text display='flex' textAlign='center' justifyContent='space-between' fontSize='10px'>
                                <Text w='100%' as='span'>Certificate Date/s</Text>
                                <Text w='100%' as='span'>Actual Date/s</Text>
                            </Text>
                        </Text>
                    )}
                    {canDo("update") && (
                        <Text color='#fff' w='30%' display='flex' justifyContent='center' textTransform={'uppercase'} fontSize='12px'>Action</Text>
                    )}
                </Box>
                {allTraining && allTraining.filter((train) => (train.reg_status >= 3) && train.regType === reg_Type && train.reg_ref_id === reg_id)
                .map((train) => {
                    const course = allCourses?.find((course) => course.id === train.course)?.course_code || courseCodes?.find((course) => course.id === train.course)?.company_course_code || ''

                    return(
                        <Box key={train.id} p='2' borderBottom='1px' borderBottomColor='gray.500' mb='2' display='flex' alignItems='center' justifyContent='space-between'>
                            <Checkbox 
                                isChecked={selectedTrainIDs.includes(train.id)} 
                                onChange={() => handleToggleSelect(train.id)} 
                                mr='3' 
                                colorScheme='blue'
                            />
                            <Text
                                w='50%'
                                textAlign='center'
                                _hover={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue.600' }}
                                title="Click to edit enrolled date and time"
                                onClick={() => {
                                    setSelectedTrainItem(train);
                                    if (train.date_enrolled) {
                                        const dateObj = new Date(parsingTimestamp(train.date_enrolled));
                                        // Formats to YYYY-MM-THH:mm required by HTML5 datetime-local input
                                        const localIso = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
                                            .toISOString()
                                            .slice(0, 16);
                                        setNewDateTime(localIso);
                                    } else {
                                        setNewDateTime('');
                                    }
                                    setIsDateModalOpen(true);
                                }}
                            >
                                {train.date_enrolled
                                    ? parsingTimestamp(train.date_enrolled).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })
                                    : '--'}
                            </Text>
                            {canDo("update") ? (
                                <>
                                    <Text w='30%' className='hover:cursor-pointer' textAlign='center' _hover={{color: 'blue.700'}} onClick={() => {onOpenCourse(); setTID(train.id);}} textTransform={'uppercase'} fontSize='12px'>{course}</Text>
                                    <Text w='30%' className='hover:cursor-pointer' _hover={{color: 'blue.700'}} onClick={() => {onOpenCF(); setCF(train.course_fee); setTID(train.id);}} textTransform={'uppercase'} fontSize='12px'>{`₱ ${train.course_fee}`}.00</Text>
                                    <Text w='45%' className='hover:cursor-pointer' _hover={{color: 'blue.700'}} onClick={() => {onOpenTD(); setTraining(train);}} >
                                        <Text as='span' mr='3'>{train.start_date}</Text>
                                        {train.end_date !== '' && (
                                        <>
                                            <Text as='span' mr='3'>to</Text>
                                            <Text as='span'>{train.end_date}</Text>
                                        </>
                                        )}
                                    </Text>
                                    {reg_Type === 1 && (
                                        <Text w='45%' className='hover:cursor-pointer' textAlign='center' _hover={{color: 'blue.700'}} onClick={() => {onOpenATD(); setTID(train.id);}} >
                                            <Text as='span' mr='3'>{train.act_start_date}</Text>
                                            {train.act_end_date !== '' && (
                                            <>
                                                <Text as='span' mr='3'>to</Text>
                                                <Text as='span'>{train.act_end_date}</Text>
                                            </>
                                            )}
                                            {train.act_end_date === '' && train.act_start_date === '' && 
                                            (
                                                <Text onClick={() => {onOpenATD(); setTID(train.id);}}>Insert Date</Text>
                                            
                                            )}
                                        </Text>
                                    )}
                                    <Box w='30%' display='flex' flexDir='column' gap='1' alignItems='center' justifyContent='center'>
                                        {/* {['bd', 'both'].some(p => permittedTo.includes(p)) && (
                                            <Button fontWeight='normal' colorScheme='yellow' onClick={() => {onOpenNA(); setRegID(reg_id); setTID(train.id);}} size='xs' shadow='md'>Non-Appearance</Button>
                                        )} */}
                                        {/* {(['dated', 'both'].some(p => permittedTo.includes(p)) && canDo('delete')) && (
                                            <Button fontWeight='normal' colorScheme='teal' onClick={() => {onOpenMBD(); setRegID(reg_id); setTID(train.id);}} size='xs' shadow='md'>Move to BD</Button>
                                        )} */}
                                        {/* <Button fontWeight='normal' colorScheme='blue' onClick={() => {onOpenRB(); setRegID(reg_id); setTID(train.id);}} size='xs' shadow='md'>Other Options</Button> */}
                                        <Button w='100px' fontWeight='normal' colorScheme='red' onClick={() => {onOpenCancelT(); setRegID(reg_id); setTID(train.id);}} size='xs' shadow='md'>Cancel Training</Button>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Text w='50%' className='hover:cursor-pointer' textTransform={'uppercase'} fontSize='12px'>{course}</Text>
                                    <Text w='50%' className='hover:cursor-pointer' textTransform={'uppercase'} fontSize='12px'>{`₱ ${train.course_fee}`}.00</Text>
                                    <Text w='100%' className='hover:cursor-pointer' >
                                        <Text as='span' mr='3'>{train.start_date}</Text>
                                        {train.end_date !== '' && (
                                        <>
                                            <Text as='span' mr='3'>to</Text>
                                            <Text as='span'>{train.end_date}</Text>
                                        </>
                                        )}
                                    </Text>
                                    <Text w='100%' className='hover:cursor-pointer' >
                                        <Text as='span' mr='3'>{train.act_start_date}</Text>
                                        {train.end_date !== '' && (
                                        <>
                                            <Text as='span' mr='3'>to</Text>
                                            <Text as='span'>{train.act_end_date}</Text>
                                        </>
                                        )}
                                    </Text>
                                </>
                            )}
                        </Box>
                    )
                })}
            </Box>
        </Box>
    </Box>
    {/* Edit Registration Number Modal */}
    <Modal isOpen={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} size="sm">
        <ModalOverlay />
        <ModalContent borderRadius="md">
            <ModalHeader fontSize="md" fontWeight="bold">
                Edit Registration Number
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody py={4}>
                <Box display="flex" flexDirection="column" gap={2}>
                    <Text fontSize="xs" color="gray.600">
                        Enter the new registration number (prefix `REG-` is automatically attached):
                    </Text>
                    <InputGroup size="sm">
                        <InputLeftAddon children="REG-" />
                        <Input
                            value={newRegNo}
                            onChange={(e) => setNewRegNo(e.target.value)}
                            placeholder="2026-09-01840"
                        />
                    </InputGroup>
                </Box>
            </ModalBody>

            <ModalFooter gap={2} bg="gray.50" borderBottomRadius="md">
                <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsRegModalOpen(false)}
                    isDisabled={isSavingReg}
                >
                    Cancel
                </Button>
                <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={handleSaveRegNo}
                    isLoading={isSavingReg}
                >
                    Save
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    {/* Edit Date & Time Modal */}
    <Modal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} size="sm">
        <ModalOverlay />
        <ModalContent borderRadius="md">
            <ModalHeader fontSize="md" fontWeight="bold">
                Edit Enrolled Date & Time
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={4}>
                <Box display="flex" flexDirection="column" gap={2}>
                    <Text fontSize="xs" color="gray.600">
                        Select new date and time for this enrollment:
                    </Text>
                    <Input
                        type="datetime-local"
                        size="sm"
                        value={newDateTime}
                        onChange={(e) => setNewDateTime(e.target.value)}
                    />
                </Box>
            </ModalBody>
            <ModalFooter gap={2} bg="gray.50" borderBottomRadius="md">
                <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsDateModalOpen(false)}
                    isDisabled={isSavingDate}
                >
                    Cancel
                </Button>
                <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={handleSaveEnrolledDate}
                    isLoading={isSavingDate}
                >
                    Save
                </Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    <Modal isOpen={isOpenATD} onClose={() => {setActSched(''); onCloseATD();}} >
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Actual Training Date</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Box display='flex' flexDir='column' gap='4'>
                    <Input id='actual_sched' type='text' value={actualSchedule} placeholder={`MMM dd, YYYY to MMM dd, YYYY`} onChange={(e) => setActSched(e.target.value)} />
                </Box>
            </ModalBody>
            <ModalFooter>
                <Button onClick={handleActualtrainingDate} w='full' isLoading={loading} loadingText='Saving...' colorScheme='blue' shadow='md' borderRadius='5px' bgColor='blue.700'>Save Training Date</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    <Modal isOpen={isOpenCourse} onClose={onCloseCourse}>
        <ModalOverlay />
        <Course onClose={onCloseCourse} company_id={companyID} trainingID={trainingID} />
    </Modal>
    <Modal isOpen={isOpenCF} onClose={onCloseCF}>
        <ModalOverlay />
        <CourseFee onClose={onCloseCF} course_fee={courseFee} training_id={trainingID}/>
    </Modal>
    <Modal isOpen={isOpenTD} onClose={onCloseTD}>
        <ModalOverlay />
        <TrainingDate onClose={onCloseTD} training={trainingDoc} />
    </Modal>
    <Modal isOpen={isOpenAT} size='lg' onClose={onCloseAT}>
        <ModalOverlay />
        <AccountType onClose={onCloseAT} regID={regID} curr_accountType={at} />
    </Modal>
    <Modal isOpen={isOpenTraining} onClose={onCloseTraining} scrollBehavior='inside' size='full'>
        <ModalOverlay />
        <ModalContent bgColor='#00000099'>
            <ModalBody px={{base: '5%', md: '10%', lg: '30%'}} py='2%'>
                <InsertTraining c_id={cID} accountType={account_type} onClose={onCloseTraining} reg_id={regID} tab={1} />
            </ModalBody>
        </ModalContent>
    </Modal>
    <Modal isOpen={isOpenRB} onClose={onCloseRB}>
        <ModalOverlay />
        <ModalContent>
            {loading ? (
                <ModalBody py={10} display="flex" justifyContent="center">
                    <Button color="blue.700" variant="link" isLoading={loading} loadingText="Processing..." />
                </ModalBody>
            ) : (
                <>
                    <ModalHeader textAlign="center">Manage Training Status</ModalHeader>
                    <ModalBody display="flex" flexDir="column" alignItems="center" py={4} gap={3}>
                        <Text fontSize="sm" textAlign="center" color="gray.700">
                            Select an action for the following <strong>{selectedTrainIDs?.length || 1}</strong> selected course(s):
                        </Text>
                        {/* Display List of Selected Courses mapped from Document IDs to Course Codes */}
                        <VStack align="stretch" spacing={2} w="full" maxH="150px" overflowY="auto" bg="gray.100" p={3} borderRadius="md" border="1px solid" borderColor="gray.300">
                            {selectedTrainIDs && selectedTrainIDs.length > 0 ? (
                                selectedTrainIDs.map((tID) => {
                                    const trainRec = allTraining?.find((t) => t.id === tID);
                                    const courseCode = allCourses?.find((c) => c.id === trainRec?.course)?.course_code || 
                                                    courseCodes?.find((c) => c.id === trainRec?.course)?.company_course_code || 
                                                    'Unknown Course';
                                    return (
                                        <HStack key={tID} justify="space-between" fontSize="xs" py={1} borderBottom="1px dashed" borderColor="gray.300">
                                            <Text fontWeight="bold" color="blue.900" textTransform="uppercase">
                                                {courseCode}
                                            </Text>
                                            <Text color="gray.600">
                                                {trainRec?.start_date} {trainRec?.end_date ? `to ${trainRec.end_date}` : ''}
                                            </Text>
                                        </HStack>
                                    );
                                })
                            ) : (
                                // Fallback for single record selection via active training ID
                                (() => {
                                    const trainRec = allTraining?.find((t) => t.id === trainingID);
                                    const courseCode = allCourses?.find((c) => c.id === trainRec?.course)?.course_code || 
                                                    courseCodes?.find((c) => c.id === trainRec?.course)?.company_course_code || 
                                                    'Unknown Course';
                                    return (
                                        <HStack justify="space-between" fontSize="xs" py={1}>
                                            <Text fontWeight="bold" color="blue.900" textTransform="uppercase">
                                                {courseCode}
                                            </Text>
                                            <Text color="gray.600">
                                                {trainRec?.start_date} {trainRec?.end_date ? `to ${trainRec.end_date}` : ''}
                                            </Text>
                                        </HStack>
                                    );
                                })()
                            )}
                        </VStack>
                        {/* Updated Descriptions & Options */}
                        <Box w="full" bg="blue.50" p={3} borderRadius="md" border="1px solid" borderColor="blue.200">
                            <Text fontSize="sm" fontWeight="bold" color="blue.800">
                                Option 1: Cancel & Duplicate to Pending
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                Cancels the active training record(s) and creates duplicate record(s) set to Pending Status under a fresh registration.
                            </Text>
                        </Box>
                        <Box w="full" bg="orange.50" p={3} borderRadius="md" border="1px solid" borderColor="orange.200">
                            <Text fontSize="sm" fontWeight="bold" color="orange.800">
                                Option 2: Direct Rollback to Pending
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                Modifies the existing active record(s) directly back to Pending status without cancelling or creating a new copy.
                            </Text>
                        </Box>
                    </ModalBody>
                    <ModalFooter display="flex" flexDir="column" gap={2} w="full">
                        {/* Action 1: Duplicate & Reopen */}
                        <Button onClick={handleBatchCancelAndDuplicate} colorScheme="blue" bgColor="blue.700" w="full"shadow="sm">
                            Cancel Existing & Create Duplicate
                        </Button>
                        {/* Action 2: Direct Rollback */}
                        <Button onClick={handleRollback} colorScheme="orange" variant="outline"w="full">
                            Direct Rollback (Modify Existing to Pending)
                        </Button>
                        {/* Dismiss: Close Modal */}
                        <Button onClick={onCloseRB} variant="ghost" colorScheme="gray" w="full"isDisabled={loading}mt={1}>
                            Close / Go Back
                        </Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>
    <Modal isOpen={isOpenNA} onClose={onCloseNA}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader >Set to Non-Appearance</ModalHeader>
            <ModalBody display={'flex'} flexDir='column' justifyContent={'center'} alignItems='center'>
                <Text fontSize={'base'} textAlign='center'>
                    {`Are you sure to make this training Non-Appearance.`}
                </Text>
            </ModalBody>
            <ModalFooter display='flex' justifyContent={'center'}>
                <Button onClick={onCloseNA} mr='3' variant='outline' colorScheme='red' shadow='md'>Cancel</Button>
                <Button onClick={() => handlTrainingStatus(9)} isLoading={loading} loadingText='Updating Status...' colorScheme='blue' bgColor='blue.700' shadow='md'>Proceed</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    <Modal isOpen={isOpenCancelT} onClose={onCloseCancelT}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader >Cancel Training</ModalHeader>
            <ModalCloseButton />
            <ModalBody display={'flex'} flexDir='column' justifyContent={'center'} alignItems='center'>
                <Text fontSize={'base'} textAlign='center'>
                    {`Are you sure to Cancel this training, this action is permanent and cannot be undone.`}
                </Text>
            </ModalBody>
            <ModalFooter display='flex' justifyContent={'center'}>
                <Button onClick={() => handlTrainingStatus(7)} isLoading={loading} loadingText='Cancelling Training...' colorScheme='blue' bgColor='blue.700' shadow='md'>Proceed</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    <Modal isOpen={isOpenMBD} onClose={onCloseMBD}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader >Move to Backdated</ModalHeader>
            <ModalCloseButton />
            <ModalBody display={'flex'} flexDir='column' justifyContent={'center'} alignItems='center'>
                <Text fontSize={'base'} textAlign='center'>
                    {`This process isn't fully functionable at the moment... You will be informed once the button can be utilize.`}
                </Text>
            </ModalBody>
            <ModalFooter display='flex' justifyContent={'center'}>
                <Button onClick={() => onClose()} isLoading={loading} loadingText='Moving to Backdated...' colorScheme='blue' bgColor='blue.700' shadow='md'>Close</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    </>
    )
}