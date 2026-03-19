'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Box, Image as ChakraImage, Text, Center, Button, Tooltip, Checkbox, Select, InputLeftAddon, InputGroup, Input, 
FormControl, useDisclosure, useToast, FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, 
} from '@chakra-ui/react';
import { useReactToPrint } from 'react-to-print' 
import { ToastStatus } from '@/types/handling'
import { Timestamp } from 'firebase/firestore'
import { SearchIcon } from '@/Components/Icons'

import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useTraining } from '@/context/TrainingContext'

import { ADD_TRANSMITTAL} from '@/lib/certification_controller'
import { UPDATE_TRAINING } from '@/lib/trainee_controller'

import { TRAINING_BY_ID } from '@/types/trainees'
import { TransmittalEndorsement } from '@/types/certification'

import { getStorage  } from "firebase/storage";

export default function ReleaseLog() {
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allTrainingData } = useTraining()
    const { allData: allRegData } = useRegistrations()

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const [innerEndorsements, setInnerEndorsements] = useState<TransmittalEndorsement[]>([])
    const [allTData, setAllTData] = useState<TRAINING_BY_ID[]>([])

    const [filterCompany, setCompanyFilter] = useState<string>('')

    const [filterCourse, setCFilter] = useState<string>('')
    const [searchTerm, setSearch] = useState<string>('')

    const [trainingID_onModal, setTrainingID_onModal] = useState<string>('')
    const [staffName_onModal, setStaff_onModal] = useState<string>('')

    const [isPrinting, setIsPrinting] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    
    const [filename, setFileName] = useState<string>('No file chosen yet...')
    const [preview, setPreview] = useState<string | null>(null)
    const [attachmentFile, setAttachment] = useState<string>('')
    const [attachmentFile2, setAttachment2] = useState<string>('')

    const { isOpen: isOpenRelease, onOpen: onOpenRelease, onClose: onCloseRelease } = useDisclosure()
    const { isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()

    useEffect(() => {
        const fetchData = () => {
            setLoading(true)
            const allTrainData = allTrainingData && allTrainingData
                .filter((t) => {
                    const batch = courseBatch?.find((b) => b.id === t.batch);
                    if (!batch?.createdAt) return false;
                    
                    // Firestore Timestamp → JS Date
                    const createdDate = batch.createdAt.toDate();
                    
                    return (
                        createdDate.getMonth() === monthSelected &&
                        createdDate.getFullYear() === yearSelected
                    )
                })
                .filter(t => {
                    const start = t.start_date.toLowerCase();
                    const end = t.end_date.toLowerCase();
                
                    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
                    const trimmedMonth = months[monthSelected]; // convert number → "jan"
                
                    return (
                        (start.includes(trimmedMonth) && end.includes(trimmedMonth)) ||
                        (end === '' && start.includes(trimmedMonth))
                    );
                })
                .sort((a, b) => {
                    // ---------- 1️⃣ DATE SORT (PRIMARY) ----------
                    const getTime = (d?: string) => d ? new Date(d).getTime() : 0

                    const dateA = getTime(a.end_date) || getTime(a.start_date)
                    const dateB = getTime(b.end_date) || getTime(b.start_date)

                    if (dateA !== dateB) {
                        return dateB - dateA // newest → oldest
                    }

                    // ---------- 2️⃣ COURSE SORT (SECONDARY) ----------
                    const courseA =
                        allCourses?.find((c) => c.id === a.course)?.course_code?.toLowerCase() ||
                        courseCodes?.find((c) => c.id === a.course)?.company_course_code?.toLowerCase() ||
                        ''

                    const courseB =
                        allCourses?.find((c) => c.id === b.course)?.course_code?.toLowerCase() ||
                        courseCodes?.find((c) => c.id === b.course)?.company_course_code?.toLowerCase() ||
                        ''

                    if (courseA < courseB) return -1
                    if (courseA > courseB) return 1

                    // ---------- 3️⃣ REG_NO SORT (TERTIARY) ----------
                    const regNoA =
                        allRegData?.find((r) => r.id === a.reg_ref_id)?.reg_no || ''
                    const regNoB =
                        allRegData?.find((r) => r.id === b.reg_ref_id)?.reg_no || ''

                    // Expected format: YYYY-MM-XXX
                    const [yearA = 0, monthA = 0, numberA = 0] = regNoA.split('-').map(Number)
                    const [yearB = 0, monthB = 0, numberB = 0] = regNoB.split('-').map(Number)

                    if (yearA !== yearB) return yearA - yearB
                    if (monthA !== monthB) return monthA - monthB
                    return numberA - numberB
                })
                .filter((t) => t.reg_status === 6 && [1, 2].includes(t.cert_status))
                .filter((t) => {                    
                    const registration = allRegData?.find((r) => r.id === t.reg_ref_id);
                    const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);

                    if (!trainee) return false;
                    if (searchTerm === '') return true;
                    const fullName = `${trainee.last_name} ${trainee.first_name} ${t.cert_no}`.toLowerCase()

                    return fullName.includes(searchTerm.toLowerCase())
                }).filter((t) => {
                    return t.accountType.toString() === '0'
                })
                .filter((t) => {
                    const registration = allRegData?.find((r) => r.id === t.reg_ref_id);
                    const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);
                    if (!trainee) return false;
                    if (filterCompany === '') return true;

                    return trainee.company === filterCompany
                })
                .filter((t) => {
                    if (!filterCourse || filterCourse === '') return true;

                    return (
                        allCourses?.find((course) => course.id === t.course)?.course_code.toUpperCase() === filterCourse.toUpperCase() || 
                        courseCodes?.find((course) => course.id === t.course)?.company_course_code.toUpperCase() === filterCourse.toUpperCase()
                    )
                })

            if(!allTrainData) return
            // 3️⃣ Set the states
            setAllTData(allTrainData ?? []);
            setLoading(false)
        }
        fetchData()
    },[monthSelected, yearSelected, allTrainingData, searchTerm, filterCourse, filterCompany])
    
    const releaseRecords = useMemo(
        () => allTData?.filter(t => t.regType === 0).filter(t => t.batch !== '1'),
        [allTData]
    );

    const regMap = new Map(allRegData?.map(r => [r.id, r]) ?? [])
    const traineeMap = new Map(allTrainee?.map(t => [t.id, t]) ?? [])
    const courseMap = new Map(allCourses?.map(c => [c.id, c]) ?? [])

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

    const componentRef = useRef<HTMLDivElement | null>(null)
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `TRANSMITTAL.pdf`,
        pageStyle: `
            @media print {
                body {
                    font-family: Arial, Helvetica, sans-serif !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                * {
                    font-family: Arial, Helvetica, sans-serif !important;
                }
            }
        `,
        onBeforePrint: () => {
            setIsPrinting(true);
            handleToast('Preparing to print certificates...', ``, 3000, 'info');
        },
        onAfterPrint: () => {
            if(isPrinting) {
                console.log('printing...')
                handleToast('Certificates Printed!', ``, 3000, 'success');
            }
            handleCertificates();
            setInnerEndorsements([]) 
            setCompanyFilter('')
            setIsPrinting(false);
        },
    })

    const handleCertificates = async () => {
        const trans_id = await ADD_TRANSMITTAL({
            companyID: filterCompany,
            isDated: true,
            endorsements: innerEndorsements
        })
        if (trans_id) {
            innerEndorsements.forEach((endorsement: any) => {
                endorsement.certificate_id.forEach(async (certID: any) => {
                    await UPDATE_TRAINING(certID, {transmittalID: trans_id.id, cert_status: 2, cert_released: Timestamp.now()}, '')
                });
            })
            handleToast('Transmittal Created!', `Transmittal ID: ${trans_id.id}`, 3000, 'success')
        } else {
            handleToast('Error creating transmittal', `Please try again`, 3000, 'error')
        }
    }

    const formatTrainingDate = (endDate?: string, startDate?: string) => {
        const dateStr = endDate || startDate
        const year = new Date().getFullYear()

        if (!dateStr) return '-'
        const date = new Date(`${dateStr}, ${year}`)
        if(isNaN(date.getTime())) return '-'

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }
    
    const handleCloseMod = () => {
        onCloseModal()
        setFileName('No file chosen yet...')
        setPreview(null)
    }

    const handleReleasedBy = async (training_id: string = '', staffName: string = '') => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const trainingID = training_id || trainingID_onModal
                    const staff_name = staffName || staffName_onModal
                    
                    const updateStat = {
                        releasedBy: staff_name,
                    }
                    await UPDATE_TRAINING(trainingID, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Certificate Released!', ``, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
            setTrainingID_onModal('')
            setStaff_onModal('')
            onCloseRelease();
        })
    }

    return(
    <>
        <Box display='flex' alignItems='center' mb='2' justifyContent='space-between'>
            <Box className="flex" w='100%' mr='3'>
                <InputGroup w="100%" size='sm' className="shadow-md rounded-lg">
                    <InputLeftAddon>
                        <SearchIcon color="#a1a1a1" size="18" />
                    </InputLeftAddon>
                    <Input fontWeight='normal'
                        placeholder="Trainee Name or Certificate Number..."
                        value={searchTerm}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
            </Box>
            <Select size='sm' mr='3' value={filterCompany} onChange={(e) => {setCompanyFilter(e.target.value);}} shadow='md'>
                <option hidden>Filter Company</option>
                {allClients && [...allClients]
                .sort((a, b) => a.company.localeCompare(b.company))
                .map((c) => (
                    <option key={c.id} value={c.id}>{c.company.toUpperCase()}</option>
                ))}
            </Select>
            <Select size='sm' mr='3' value={filterCourse} onChange={(e) => {setCFilter(e.target.value);}} shadow='md'>
                <option hidden>Filter Course</option>
                {allCourses && [...allCourses]
                .sort((a, b) => a.course_code.localeCompare(b.course_code))
                .map((c) => (
                    <option key={c.id} value={c.course_code}>{c.course_code.toUpperCase()}</option>
                ))}
            </Select>
            {(filterCompany || filterCourse || searchTerm) && (
                <Button onClick={() => {setCompanyFilter(''); setCFilter(''); setSearch('');}} colorScheme='red' shadow='md' w='150px' size='sm'>Clear</Button>
            )}
            {/* <Button onClick={onOpenTransmittalModal} size='sm' colorScheme='blue' bgColor='blue.700' shadow='md' fontWeight='normal' borderRadius='5px'>Create Transmittal</Button> */}
        </Box>
        <Box h='700px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
            <Box display='flex' position='sticky' top='0' zIndex='9' alignItems='center' bgColor='blue.700' px='4' mt='2' textTransform='uppercase' py='2' justifyContent='space-between' color='white' borderRadius='5px'>
                <Text w='15%'>#</Text>
                <Text w='100%' mr='2'>
                    <Text w='100%' textAlign='center' borderBottom='1px solid white'>TRAINEE NAME</Text>
                    <Text display='flex' gap='2' >
                        <Text w='250px' as='span'>LAST NAME</Text>
                        <Text w='250px' as='span'>FIRST NAME</Text>
                        <Text w='50px' as='span'>MI</Text>
                    </Text>
                </Text>
                <Text w='100%' textAlign='center'>COURSE</Text>
                <Text w='100%'>CERTIFICATE NO.</Text>
                <Text w='100%'>COMPANY</Text>
                <Text w='100%'>TRAINING DATE/S</Text>
                <Text w='100%'>RELEASED DATE</Text>
                <Text w='100%'>RECEIVED BY</Text>
                <Text w='100%'>RELEASED BY</Text>
            </Box>
            {!releaseRecords || releaseRecords.length === 0 ? (
                <Center mt='10'>
                    <Text fontWeight="medium" color="gray.600">No Release Lods Found</Text>
                </Center>
            ) : (
                releaseRecords.map((training, index) => {
                    const reg = regMap.get(training.reg_ref_id)
                    if (!reg) return false
                    
                    const trainee = traineeMap.get(reg.trainee_ref_id)
                    if (!trainee) return false
                    
                    const course = courseMap.get(training.course)?.course_code?.toUpperCase() || ''
                    const middleInitial = trainee.middle_name ? (trainee.middle_name.charAt(0) === '' ? '\u200B' : `${trainee.middle_name.charAt(0)}.`) : ''
                    const releaseDate = (training.cert_status === 2 ? training.cert_released?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')
                    const companyName = allClients?.find(c => c.id === trainee.company)?.alias || ''
                    const received = training.cert_status === 2 ? 'View Proof' : ''
                    const releasedBy = training.cert_status !== 2
                
                    return(
                        <Box key={index} _hover={{bgColor: 'blue.100', color: 'black'}} fontWeight='normal' display='flex' alignItems='center' justifyContent='space-between' px='4' py='2' borderBottom='1px solid' borderColor='gray.200'>
                            <Text w='15%'>{`${(index + 1)}.`}</Text>
                            <Text w='100%' display='flex' gap='2' mr='2'>
                                <Text w='250px' as='span'>{trainee?.last_name || ''}</Text>
                                <Text w='250px' as='span'>{trainee?.first_name || ''}</Text>
                                <Text w='50px' as='span'>{middleInitial}</Text>
                            </Text>
                            <Text w='100%' textAlign='center'>{course}</Text>
                            <Text w='100%'>{training?.cert_no || ''}</Text>
                            <Text w='100%'>{companyName}</Text>
                            <Text w='100%'>{formatTrainingDate(training.end_date, training.start_date)}</Text>
                            <Text w='100%'>{releaseDate}</Text>
                            <Text  onClick={() => {setAttachment(training?.releasingProof); setAttachment2(trainee.e_sig); onOpenModal();}} _hover={{cursor: 'pointer', fontWeight: 'bold'}} w='100%'>{received}</Text>
                            <Select onChange={(e) => {
                                if(e.target.value === 'others') {
                                    setTrainingID_onModal(training.id)
                                    onOpenRelease()
                                    return
                                }
                                handleReleasedBy(training.id, e.target.value)    
                            }} isDisabled={releasedBy} p='0' size='xs' _hover={{cursor: 'pointer'}}>
                                <option hidden>{training?.releasedBy || 'Select Staff'}</option>
                                <option value="Raffy Lopez">Sir Raffy Lopez</option>
                                <option value="Raphael Isla">Raphael Isla</option>
                                <option value='others'>Others</option>
                            </Select>
                        </Box>
                    )
                })
            )}
        </Box>
        <Modal isOpen={isOpenModal} onClose={handleCloseMod} size='5xl' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton />
                <ModalBody py={8}>
                    <Box className='flex items-center justify-center' gap='2'>
                        <Box className='image-container w-full p-1 relative flex-col justify-center items-start rounded border outline-0 shadow-lg'>
                            <Text w='100%' textAlign='start'>Proof of Release</Text>
                            <ChakraImage src={attachmentFile} w='80%' h='100%' alt={`Proof of Release`}/>
                        </Box>
                        <Box className='image-container w-full p-1 relative flex-col justify-center items-start rounded border outline-0 shadow-lg'>
                            <Text w='100%' textAlign='start'>{`Trainee's E-Sign`}</Text>
                            <ChakraImage src={attachmentFile2} w='80%' h='100%' alt={`Recorded E-Sign of Trainee`}/>
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal size='xl' closeOnOverlayClick={false} isOpen={isOpenRelease} onClose={() => {setStaff_onModal(''); setTrainingID_onModal(''); onCloseRelease();}}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Released By</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormLabel>Staff Name</FormLabel>
                        <Input fontWeight='normal' shadow='md' onChange={(e) => setStaff_onModal(e.target.value)} placeholder='Type your name here...' />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button isLoading={loading} loadingText='Saving...' bgColor='blue.700' colorScheme='blue' mr={3} onClick={() => {handleReleasedBy('', '')}}>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}
