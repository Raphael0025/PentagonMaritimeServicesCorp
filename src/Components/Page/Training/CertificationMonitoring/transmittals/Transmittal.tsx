'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Box, Image as ChakraImage, Text, Textarea, Spinner, Center, Button, Tooltip, Checkbox, Select, Input, 
FormControl, useDisclosure, useToast, FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, 
Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel
} from '@chakra-ui/react';
import { useReactToPrint } from 'react-to-print' 
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useTransmittal } from '@/context/TransmittalContext'
import { useTraining } from '@/context/TrainingContext'

import { ADD_TRANSMITTAL, DELETE_TRANSMITTAL} from '@/lib/certification_controller'

import { TRAINING_BY_ID } from '@/types/trainees'
import { TransmittalEndorsement, TRANSMITTAL } from '@/types/certification'

export default function Transmittal() {
    const toast = useToast()
    const { data: allTransmittals } = useTransmittal()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allTrainingData } = useTraining()
    const { allData: allRegData } = useRegistrations()

    const [filterCompany, setCompanyFilter] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [allTData, setAllTData] = useState<TRAINING_BY_ID[]>([])
    const [filteredTrainings, setFilteredTrainings] = useState<TRAINING_BY_ID[]>([])
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())
    const [selectedID, setSelectedID] = useState<string[]>([])

    const { isOpen: isOpenTransmittalModal, onOpen: onOpenTransmittalModal, onClose: onCloseTransmittalModal } = useDisclosure()

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

    useEffect(() => {
        if (!allTrainingData) return
        setAllTData(allTrainingData)
    }, [allTrainingData])

    const regMap = new Map(allRegData?.map(r => [r.id, r]) ?? [])
    const traineeMap = new Map(allTrainee?.map(t => [t.id, t]) ?? [])
    const courseMap = new Map(allCourses?.map(c => [c.id, c]) ?? [])
    const companyCourseMap = new Map(courseCodes?.map(c => [c.id, c]) ?? [])

    useEffect(() => {
        if (!allTData) return

        const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
        const trimmedMonth = months[monthSelected]

        const result = allTData
            .filter(t => {
                const start = t.start_date.toLowerCase()
                const end = t.end_date.toLowerCase()

                return (
                    (start.includes(trimmedMonth) && end.includes(trimmedMonth)) ||
                    (end === "" && start.includes(trimmedMonth))
                )
            })
            .filter(t =>
                t.accountType === 1 &&
                t.regType === 0 &&
                (t?.transmittalID === "" || t?.transmittalID === undefined) &&
                t.reg_status === 6 &&
                t.cert_status === 1
            )
            .filter(training => {
                const reg = regMap.get(training.reg_ref_id)
                if (!reg) return false

                const trainee = traineeMap.get(reg.trainee_ref_id)
                if (!trainee) return false

                if (filterCompany && trainee.company !== filterCompany) return false

                return true
            })
            .sort((a, b) => {
                const getTime = (d?: string) => d ? new Date(d).getTime() : 0

                const dateA = getTime(a.end_date) || getTime(a.start_date)
                const dateB = getTime(b.end_date) || getTime(b.start_date)

                if (dateA !== dateB) return dateB - dateA

                const courseA =
                    courseMap.get(a.course)?.course_code?.toLowerCase() ||
                    companyCourseMap.get(a.course)?.company_course_code?.toLowerCase() ||
                    ""

                const courseB =
                    courseMap.get(b.course)?.course_code?.toLowerCase() ||
                    companyCourseMap.get(b.course)?.company_course_code?.toLowerCase() ||
                    ""

                if (courseA < courseB) return -1
                if (courseA > courseB) return 1

                const regNoA = regMap.get(a.reg_ref_id)?.reg_no || ""
                const regNoB = regMap.get(b.reg_ref_id)?.reg_no || ""

                const [yearA = 0, monthA = 0, numA = 0] = regNoA.split("-").map(Number)
                const [yearB = 0, monthB = 0, numB = 0] = regNoB.split("-").map(Number)

                if (yearA !== yearB) return yearA - yearB
                if (monthA !== monthB) return monthA - monthB
                return numA - numB
            })
        setFilteredTrainings(result)

    }, [ allTData, monthSelected, yearSelected, filterCompany, allRegData, allTrainee, allCourses, courseCodes ])

    return(
    <>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Select size='sm' mr='4' value={filterCompany} onChange={(e) => {setCompanyFilter(e.target.value);}} shadow='md'>
                <option hidden>Filter Company</option>
                {allClients && [...allClients]
                .sort((a, b) => a.company.localeCompare(b.company))
                .map((c) => (
                    <option key={c.id} value={c.id}>{c.company.toUpperCase()}</option>
                ))}
            </Select>
            {filterCompany && (
                <Button onClick={() => setCompanyFilter('')} colorScheme='red' shadow='md' mr='4' size='sm'>Clear</Button>
            )}
            <Button onClick={onOpenTransmittalModal} size='sm' colorScheme='blue' bgColor='blue.700' shadow='md' fontWeight='normal' borderRadius='5px'>Create Transmittal</Button>
        </Box>
        <Box h='650px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
            <Box display='flex' position='sticky' top='0' zIndex='9' alignItems='center' bgColor='blue.700' px='4' mt='2' textTransform='uppercase' py='2' justifyContent='space-between' color='white' borderRadius='5px'>
                <Text>#</Text>
                <Text>Date</Text>
                <Text>Company</Text>
                <Text>Crewing</Text>
                <Text>Scanned</Text>
            </Box>
            {!allTransmittals || allTransmittals.length === 0 ? (
                <Center mt='10'>
                    <Text fontWeight="medium" color="gray.600">No Transmittals Found</Text>
                </Center>
            ) : (
                allTransmittals.map((transmittal, index) => (
                    <Box key={index} display='flex' alignItems='center' justifyContent='space-between' px='4' py='2' borderBottom='1px solid' borderColor='gray.200'>
                        <Text>{index + 1}</Text>
                        <Text>{transmittal?.createdAt ? parsingTimestamp(transmittal.createdAt).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',}) : 'N/A'}</Text>
                        <Text>{transmittal.companyID}</Text>
                        {/* <Text>{transmittal.companyEndorser}</Text> */}
                        <Text>{(transmittal?.images ?? []).length > 0 ? 'Yes' : 'No'}</Text>
                    </Box>
                ))
            )}
        </Box>
        <Modal size='6xl' closeOnOverlayClick={false} scrollBehavior='inside' isOpen={isOpenTransmittalModal} onClose={() => {onCloseTransmittalModal();}}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create/Print Transmittal</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box>
                        <FormLabel color='gray.500'>Select a Company</FormLabel>
                        <Box display='flex'>
                            <Select size='sm' w='50%' mr='4' value={filterCompany} onChange={(e) => {setCompanyFilter(e.target.value);}} shadow='md'>
                                <option hidden>Filter Company</option>
                                {allClients && [...allClients]
                                .sort((a, b) => a.company.localeCompare(b.company))
                                .map((c) => (
                                    <option key={c.id} value={c.id}>{c.company.toUpperCase()}</option>
                                ))}
                            </Select>
                            {filterCompany && (
                                <Button onClick={() => setCompanyFilter('')} colorScheme='red' shadow='md' size='sm'>Clear</Button>
                            )}
                        </Box>
                        <Checkbox mt='2' isChecked={selectedID.length > 0}
                            onChange={() => {
                                    if (selectedID.length === filteredTrainings.length) {
                                        setSelectedID([])
                                    } else {
                                        setSelectedID(filteredTrainings.map((t) => t.id))
                                    }
                                }}
                        >
                            <Text fontSize='sm' fontWeight='normal'>
                                {selectedID.length === filteredTrainings.length
                                ? "Deselect All"
                                : "Select All"}
                            </Text>
                        </Checkbox>
                    </Box>
                    <Box display='flex' mt='2' gap='2' borderTop='1px solid black'>
                        <Box w='40%' >
                            <Box display='flex' borderBottom='1px solid black' pr='4' py='2'>
                                <Text w='100%' textAlign='center'>Certificate Number</Text>
                                <Text w='100%' ml='3'>Name of Trainee</Text>
                            </Box>
                            <Box h='600px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
                                {filteredTrainings.length === 0 ? (
                                    <Text>No Certificates found.</Text>
                                ) : (
                                    filteredTrainings.map((training, index) => {
                                        const registration = allRegData?.find((r) => r.id === training.reg_ref_id);
                                        const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);
                                        if (!trainee) return false;
                                        if (filterCompany === '') return true;

                                        return(
                                            <FormLabel htmlFor={`training-${training.id}`} key={training.id} borderRadius='5px' shadow='md' mb='2' px='4' py='2' _hover={{cursor: 'pointer'}}>
                                                <Box >
                                                    <Box display='flex' fontWeight='normal' textAlign='start' alignItems='center' justifyContent='space-between'>
                                                        <Checkbox id={`training-${training.id}`} onChange={() => {setSelectedID(prev => prev.includes(training.id) ? prev.filter(id => id !== training.id) : [...prev, training.id])}} isChecked={selectedID.includes(training.id)} size='md' mr='4' shadow='md' />
                                                        <Text w='10%' fontSize='xs' >{`${(index + 1)}.`}</Text>
                                                        <Text w='100%' fontSize='xs' >{training.cert_no}</Text>
                                                        <Text w='100%' fontSize='xs' textTransform='uppercase'>{`${trainee.last_name}, ${trainee.first_name}`}</Text>
                                                    </Box>
                                                    <Box mt='1' display='flex' justifyContent='end'>
                                                        <Text fontSize='xs' textTransform='uppercase' mr='3'>{'Crewing:'}</Text>
                                                        <Text fontSize='xs' fontWeight='normal' textTransform='uppercase'>{`${trainee.endorser}`}</Text>
                                                    </Box>
                                                </Box>
                                                {/* Un-comment this to identify the accountType (Crew or Company charge) 
                                                <Text w='50%'>{training.accountType === 0 ? 'CREW' : 'COMPANY'}</Text> */}
                                                {/* <Text w='100%' fontSize='sm' textTransform='uppercase'>{`${training.start_date} ${training.end_date ? `to ${training.end_date}` : ''}`}</Text> */}
                                            </FormLabel>
                                        )}))
                                }
                            </Box>
                        </Box>
                        <Box w='60%' borderLeft='1px solid black'>
                            <Box display='flex' borderBottom='1px solid black' px='4' py='2'>
                                <Text w='100%' >Certificate Number</Text>
                                <Text w='100%' >Name of Trainee</Text>
                            </Box>
                            <Box h='600px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
                                {selectedID.length === 0 ? (
                                    <Text textAlign='center' p='2' w='100%'>No Certificates found.</Text>
                                ) : (
                                    selectedID.map((id, index) => {
                                        const training = allTData.find(t => t.id === id)
                                        const registration = allRegData?.find((r) => r.id === training?.reg_ref_id);
                                        const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);
                                        if (!trainee) return false;
                                        if (filterCompany === '') return true;

                                        return(
                                            <FormLabel htmlFor={`training-${id}`} key={id} display='flex' shadow='md' borderRadius='5px' fontWeight='normal' textAlign='start' mb='2' px='4' py='2' alignItems='center' justifyContent='space-between' _hover={{cursor: 'pointer'}}>
                                                <Text w='10%' fontSize='xs' >{`${(index + 1)}.`}</Text>
                                                <Text w='100%' fontSize='xs' >{training?.cert_no}</Text>
                                                <Text w='100%' fontSize='xs' textTransform='uppercase'>{`${trainee.last_name}, ${trainee.first_name}`}</Text>
                                                {/* Un-comment this to identify the accountType (Crew or Company charge) 
                                                <Text w='50%'>{training.accountType === 0 ? 'CREW' : 'COMPANY'}</Text> */}
                                                {/* <Text w='100%' fontSize='sm' textTransform='uppercase'>{`${training.start_date} ${training.end_date ? `to ${training.end_date}` : ''}`}</Text> */}
                                            </FormLabel>
                                        )}))
                                }
                            </Box>
                        </Box>
                    </Box>
                    {/** PREVIEW OF TRANSMITTAL */}
                    <Box>

                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
    )
}
