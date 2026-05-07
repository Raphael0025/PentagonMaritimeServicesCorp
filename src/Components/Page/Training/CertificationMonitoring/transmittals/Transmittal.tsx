'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Box, Image as ChakraImage, Text, Textarea, Spinner, Center, Button, Tooltip, Checkbox, Select, Input, 
FormControl, useDisclosure, useToast, FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, 
Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel
} from '@chakra-ui/react';
import { useReactToPrint } from 'react-to-print' 
import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { Timestamp } from 'firebase/firestore'
import { EditIcon } from '@/Components/Icons'

import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useTransmittal } from '@/context/TransmittalContext'
import { useTraining } from '@/context/TrainingContext'

import { ADD_TRANSMITTAL, scannedAttachment, DELETE_TRANSMITTAL} from '@/lib/certification_controller'
import { UPDATE_TRAINING } from '@/lib/trainee_controller'

import { TRAINING_BY_ID } from '@/types/trainees'
import { TransmittalEndorsement, TRANSMITTAL } from '@/types/certification'

import { getDownloadURL, ref, getStorage  } from "firebase/storage";

export default function Transmittal() {
    const toast = useToast()
    const storage = getStorage()
    const { data: allTransmittals } = useTransmittal()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allTrainingData } = useTraining()
    const { allData: allRegData } = useRegistrations()

    const [endorser, setEndorser] = useState<string>('')
    const [filterCompany, setCompanyFilter] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [isPrinting, setIsPrinting] = useState<boolean>(false)
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())
    const [allTData, setAllTData] = useState<TRAINING_BY_ID[]>([])
    const [selectedID, setSelectedID] = useState<string[]>([])
    const [filteredTrainings, setFilteredTrainings] = useState<TRAINING_BY_ID[]>([])
    const [innerEndorsements, setInnerEndorsements] = useState<TransmittalEndorsement[]>([])
    const [companyID, setCompanyID] = useState<string>('')
    const [companyName2, setCompanyName] = useState<string>('')
    const [filename, setFileName] = useState<string>('No file chosen yet...')
    const [preview, setPreview] = useState<string | null>(null)
    const [imgFile, setImgFile] = useState<File[]>([])
    const [attachmentFile, setAttachment] = useState<string>('')
    const [transID, setTransID] = useState<string>('')

    const currDate = new Date().toLocaleDateString('en-US', {  month: 'short',  day: 'numeric', year: 'numeric'})

    const { isOpen: isOpenTransmittalModal, onOpen: onOpenTransmittalModal, onClose: onCloseTransmittalModal } = useDisclosure()
    const { isOpen: isOpenTransmittalView, onOpen: onOpenTransmittalView, onClose: onCloseTransmittalView } = useDisclosure()
    const { isOpen: isOpenTransmittalScan, onOpen: onOpenTransmittalScan, onClose: onCloseTransmittalScan } = useDisclosure()
    const { isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()

    const attachment = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

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
            onCloseTransmittalModal();
            setIsPrinting(false);
        },
    })

    useEffect(() => {
        if (!allTrainingData) return
        setAllTData(allTrainingData)
    }, [allTrainingData])

    const regMap = new Map(allRegData?.map(r => [r.id, r]) ?? [])
    const traineeMap = new Map(allTrainee?.map(t => [t.id, t]) ?? [])
    const courseMap = new Map(allCourses?.map(c => [c.id, c]) ?? [])
    const companyCourseMap = new Map(courseCodes?.map(c => [c.id, c]) ?? [])
    const trainingMap = new Map(allTData.map(t => [t.id, t]))
    
    useEffect(() => {
        if (!allTData) return

        const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]
        const trimmedMonth = months[monthSelected]

        const result = allTData
            // .filter(t => {
            //     const start = t.start_date.toLowerCase()
            //     const end = t.end_date.toLowerCase()

            //     return (
            //         (start.includes(trimmedMonth) && end.includes(trimmedMonth)) ||
            //         (end === "" && start.includes(trimmedMonth))
            //     )
            // })
            .filter(t =>
                t.regType === 0 &&
                (t?.transmittalID === "" || t?.transmittalID === undefined) &&
                t.reg_status === 6 &&
                (t.cert_status === 1 || t.cert_status === 2)
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

    const handleInnerEndorsements = () => {
        setInnerEndorsements(prev => [...prev, {endorser, certificate_id: selectedID}])
        setSelectedID([])
        setEndorser('')
    }
    const endorsers = innerEndorsements.map(e => e.endorser)
    const isSingleEndorser = endorsers.length === 1

    const tableRows: any[] = [];
    innerEndorsements.forEach((endorsement: any) => {
        endorsement.certificate_id.forEach((certID: any) => {
            tableRows.push({
                type: "trainee",
                endorser: endorsement.endorser,
                certID
            });
        });
        // add endorser row AFTER trainees
        tableRows.push({
            type: "endorser",
            endorser: endorsement.endorser
        });
    })
    
    const courseNames = Array.from(
        new Set(
            tableRows
                .filter(row => row?.type === "trainee")
                .map(row => {
                    const training = trainingMap.get(row.certID)

                    const courseName =
                        training
                            ? (courseMap.get(training.course)?.course_code ||
                                companyCourseMap.get(training.course)?.company_course_code ||
                                "")
                            : "";

                    return courseName.trim().toUpperCase()
                })
                .filter(Boolean)
        )
    )

    const formatTrainingDates = (start: string | undefined, end: string | undefined, year: number) => {
        const parts1 = start?.split(' ') // ["Mon","Jan","12"]
        const month1 = parts1 ? parts1[1] : ''
        const day1 = parts1 ? parts1[2] : ''
        
        const parts2 = end?.split(' ') // ["Mon","Jan","12"]
        const month2 = parts2 ? parts2[1] : ''
        const day2 = parts2 ? parts2[2] : ''

        if(end === ''){
            return `${month1} ${day1}, ${year}`
            //return `${month1} ${day1}-${month1} ${day1}, ${year}`
        }
        return `${month1} ${day1}-${month2} ${day2}, ${year}`
    }

    const companyName = allClients?.find((client) => client.id === filterCompany)?.alias || filterCompany

    
    const handleImgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            const signature = files[0];
            setFileName(file);
            setImgFile(Array.from(files))

            const objectUrl = URL.createObjectURL(signature)
            setPreview(objectUrl)
        } else {
            setFileName('No file chosen yet...')
        }
    }

    const handleCloseMod = () => {
        onCloseModal()
        setFileName('No file chosen yet...')
        setPreview(null)
    }

    const handleDownload = async () => {
        if (attachmentFile) {
            try {
                // Get the download URL for the attachmentFile from Firebase Storage
                const storageRef = ref(storage, attachmentFile); // Assuming 'storage' is your Firebase Storage instance
                const downloadUrl = await getDownloadURL(storageRef);
                // Create a link element and trigger the download
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = downloadUrl;
                link.target = `_blank`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Error fetching download URL:", error);
            }
        }
    }

    const handleUploadImg = async () => {
        try{
            setLoading(true)
            await scannedAttachment(transID, companyName2, "dated", imgFile, filename)
            
            handleCloseMod()
            handleToast(`Successfully changed Trainee's Attachment.`, `Trainee's attachment file has been updated.`, 5000, 'success')
        } catch(error){
            console.error('Error updating trainee image: ', error);
            handleToast(`Failed to change Trainee's Attachment.`, `Trainee's attachment file was not successfully updated. Please issue this to the IT department.`, 5000, 'success')
        } finally {
            setLoading(false)
        }
    }

    const transmittal = allTransmittals?.find(t => t.id === transID)
    const attachments = transmittal?.images ?? []

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
        <Box h='600px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
            <Box display='flex' position='sticky' top='0' zIndex='9' alignItems='center' bgColor='blue.700' px='4' mt='2' textTransform='uppercase' py='2' justifyContent='space-between' color='white' borderRadius='5px'>
                <Text w='10%'>#</Text>
                <Text w='100%'>Date</Text>
                <Text w='100%'>Company</Text>
                <Text w='100%'>E-Transmittal</Text>
                <Text w='100%'>Attachment</Text>
            </Box>
            {!allTransmittals || allTransmittals.length === 0 ? (
                <Center mt='10'>
                    <Text fontWeight="medium" color="gray.600">No Transmittals Found</Text>
                </Center>
            ) : (
                allTransmittals.map((transmittal, index) => (
                    <Box key={index} _hover={{bgColor: 'blue.100', color: 'black'}} display='flex' alignItems='center' justifyContent='space-between' px='4' py='2' borderBottom='1px solid' borderColor='gray.200'>
                        <Text w='10%'>{index + 1}</Text>
                        <Text w='100%'>{transmittal?.createdAt ? parsingTimestamp(transmittal.createdAt).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',}) : 'N/A'}</Text>
                        <Text w='100%'>{allClients?.find((client) => client.id === transmittal.companyID)?.alias || transmittal.companyID}</Text>
                        <Text w='100%' _hover={{cursor: 'pointer'}} onClick={() => {setCompanyID(transmittal.companyID); setInnerEndorsements(transmittal.endorsements); onOpenTransmittalView();}}>{transmittal.endorsements.length > 0 && 'View'}</Text>
                        <Text w='100%' _hover={{cursor: 'pointer'}} onClick={() => {setTransID(transmittal?.id ?? ''); setCompanyName(allClients?.find((client) => client.id === transmittal.companyID)?.alias ?? transmittal.companyID ?? ''); onOpenTransmittalScan();}}>{(transmittal?.images ?? []).length > 0 ? 'View' : 'UnAvailable'}</Text>
                    </Box>
                ))
            )}
        </Box>
        <Modal isOpen={isOpenModal} onClose={handleCloseMod} scrollBehavior='inside' size='xl' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader pb={0} >{`Attachment Manager`}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pt={0}>
                    <Box className='flex-col p-2 space-y-3 items-center justify-center'>
                        <Box w='100%' className='flex items-end justify-end'>
                            <Button size='sm' variant='ghost' onClick={() => fileInputRef.current?.click()} leftIcon={<EditIcon size='20' color='#a1a1a1' />} >Select Image</Button>
                            <input ref={fileInputRef} onChange={handleImgFile}  type='file' accept='image/png, image/jpeg' style={{display: 'none'}} />
                        </Box>
                        <Box className='image-container w-full p-1 relative flex justify-center items-center rounded border outline-0 shadow-lg'>
                        {
                            preview === null ? (
                                attachmentFile !== '' ? (
                                    <ChakraImage src={attachmentFile} w='80%' h='100%' alt={`Edit Trainee Image`}/>
                                ) : (
                                    <Text className='text-gray-400 absolute text-lg'>{filename}</Text>
                                )
                            ) : (
                                <ChakraImage src={preview} w='80%' h='100%' alt={filename}/>
                            )
                        }
                        </Box>
                        <Box className='flex'>
                            <Button onClick={handleUploadImg} isLoading={loading} loadingText='Uploading...' isDisabled={preview === null} colorScheme='green' w='100%'>Upload</Button>
                            {/* <Button onClick={handleDownload} isDisabled={preview !== null} colorScheme='blue' w='100%'>Download</Button> */}
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal size='4xl' closeOnOverlayClick={false} isOpen={isOpenTransmittalScan} onClose={() => {setInnerEndorsements([]); onCloseTransmittalScan();}}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Scanned Attachments</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {(() => {
                        const allImages = allTransmittals ?.flatMap(t => t.images || []) || []
                        const hasImages = allImages.length > 0
                        return (
                            <Box display='flex' flexDirection='column' gap='4'>
                                {/** Upload Button */}
                                <Box display='flex' justifyContent={hasImages ? 'end' : 'center'}>
                                    <Button onClick={onOpenModal} size='sm' colorScheme='blue' bgColor='blue.700' shadow='md' w={hasImages ? 'auto' : '100%'}  >
                                        Upload Attachment
                                    </Button>
                                </Box>
                                {/** IMAGE DISPLAY AREA */}
                                {hasImages ? (
                                    <Box display="flex" gap="4">
                                        {attachments.map((url, index) => (
                                            <Box key={index} onClick={() => {setAttachment(url); onOpenModal();}} border="1px solid" borderColor="gray.300" p="2" borderRadius="5px" >
                                                <ChakraImage src={url} alt={`Attachment ${index + 1}`} w="9in" h="auto" objectFit="contain" borderRadius="5px" />
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Text textAlign="center" fontSize="sm" color="gray.500">
                                        No attachments found.
                                    </Text>
                                )}
                            </Box>
                        )
                    })()}
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal closeOnOverlayClick={false} size='6xl' scrollBehavior='inside' isOpen={isOpenTransmittalView} onClose={() => {setInnerEndorsements([]); onCloseTransmittalView();}}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Transmittal Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {/** PREVIEW OF TRANSMITTAL */}
                    <Box>
                        <Box ref={componentRef} w='203mm' h='276mm' border='1px solid black' mt='4' mx='auto' display='flex' flexDir='column'
                            //sx={{display: 'none', '@media print': {display: 'block', fontFamily: 'Arial, Helvetica, sans-serif !important', WebkitPrintColorAdjust: 'exact', '*': {fontFamily: 'Arial, Helvetica, sans-serif !important'}}}}
                        >
                            {/**  Header */}
                            <Box display='flex' px='5' alignItems='end' borderBottom='1px solid black'>
                                <Box>
                                    <ChakraImage src={'/CompanyLogo2-dark.png'} w='1.1in' alt='company-logo' objectFit='cover' />
                                </Box>
                                <Box w='100%' display='flex' flexDir='column' textAlign='center' alignItems='end' justifyContent='center'>
                                    <Box w='100%' h='90%'>
                                        <Text fontSize='16pt' fontWeight='bold'>TRANSMITTAL FOR RELEASE OF CERTIFICATES</Text>
                                    </Box>
                                    <Box w='100%' h='10%' textAlign='end'>
                                        <Text textAlign='end' fontWeight='normal' fontSize='5pt' as='i'>{`FM-Pentagon-02-10-02`}</Text>
                                    </Box>
                                </Box>
                            </Box>
                            {/** course details */}
                            <Box display='flex' justifyContent='center' borderBottom='1px solid black' >
                                <Box w='13cm' textAlign='center' >
                                    <Text h='50pt' display='flex' ps='2' alignItems='center' justifyContent='start' borderBottom='1px solid black' borderRight='1px solid black'>COURSE</Text>
                                    <Text h='25pt' display='flex' ps='2' alignItems='center' justifyContent='start' borderRight='1px solid black'>INSTRUCTOR</Text>
                                </Box>
                                <Box w='40cm' textAlign='center' >
                                    <Text h='50pt' display='flex' alignItems='center' justifyContent='center' borderBottom='1px solid black' borderRight='1px solid black'>{courseNames.join('/')}</Text>
                                    <Text h='25pt' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>{'\u200B'}</Text>
                                </Box>
                                <Box w='11.43cm' textAlign='center'>
                                    <Text h='25pt' ps='2' display='flex' alignItems='center' justifyContent='start' borderBottom='1px solid black' borderRight='1px solid black'>DATE</Text>
                                    <Text h='25pt' ps='2' display='flex' alignItems='center' justifyContent='start' borderBottom='1px solid black' borderRight='1px solid black'>ROOM:</Text>
                                    <Text h='25pt' ps='2' display='flex' alignItems='center' justifyContent='start' borderRight='1px solid black'>ASSESSOR:</Text>
                                </Box>
                                <Box w='28cm' textAlign='center'>
                                    <Text h='25pt' display='flex' alignItems='center' justifyContent='center' borderBottom='1px solid black' >{currDate}</Text>
                                    <Text h='25pt' display='flex' alignItems='center' justifyContent='center' borderBottom='1px solid black' >{'\u200B'}</Text>
                                    <Text h='25pt' display='flex' alignItems='center' justifyContent='center'>{'\u200B'}</Text>
                                </Box>
                            </Box>
                            {/** List */}
                            <Box>
                                {/** header */}
                                <Box display='flex' h='23pt' borderBottom='1px solid black'>
                                    <Text w='2.8cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>NO.</Text>
                                    <Text w='20cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>LAST NAME</Text>
                                    <Text w='22cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>FIRST NAME</Text>
                                    <Text w='3.45cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>MI</Text>
                                    <Text w='22.43cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>CERTIFICATE NO.</Text>
                                    <Text w='13.6cm' display='flex' alignItems='center' justifyContent='center' >TRAINING DATE/S</Text>
                                </Box>
                                {/** body */}
                                {Array.from({ length: 30 }).map((_, index) => {
                                    const row = tableRows[index];
                                    let trainee;
                                    let training: TRAINING_BY_ID | undefined;
                                    if (row?.type === "trainee") {
                                        training = allTData.find(t => t.id === row.certID);
                                        if (!training) return null;
                                        const registration = allRegData?.find(r => r.id === training?.reg_ref_id);
                                        trainee = registration ? allTrainee?.find(tr => tr.id === registration.trainee_ref_id) : undefined;
                                    }
                                    return (
                                        <Box key={index} display='flex' h='18pt' borderBottom='1px solid black' fontWeight='normal'>
                                            {/* NUMBER */}
                                            <Text w='2.8cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>
                                                {(index + 1)}
                                            </Text>
                                            {/* LAST NAME */}
                                            <Text w='20cm' display='flex' fontSize='9pt' alignItems='center' justifyContent='start' textTransform='uppercase' borderRight='1px solid black'>
                                                {row?.type === "trainee" ? ('\u200B' + ` ${trainee?.last_name}`) : ''}
                                            </Text>
                                            {/* FIRST NAME */}
                                            <Text w='22cm' display='flex' fontSize='9pt' color={row?.type === 'endorser' ? 'red.500' : 'black'} alignItems='center' justifyContent={row?.type === 'endorser' ? 'center' : 'start'} textTransform='uppercase' borderRight='1px solid black'>
                                                {row?.type === "endorser" && !isSingleEndorser
                                                    ? `(${row.endorser})`
                                                    : ('\u200B' + ` ${trainee?.first_name || ''}`)
                                                }
                                            </Text>
                                            {/* MI */}
                                            <Text w='3.45cm' display='flex' fontSize='9pt' alignItems='center' justifyContent='center' textTransform='uppercase' borderRight='1px solid black'>
                                                {row?.type === "trainee" ? `${trainee?.middle_name?.charAt(0) ?? ''}.` : ''}
                                            </Text>
                                            {/* CERTIFICATE */}
                                            <Text w='22.43cm' display='flex' fontSize='9pt' alignItems='center' justifyContent='center' textTransform='uppercase' borderRight='1px solid black'>
                                                {row?.type === "trainee" ? training?.cert_no ?? '' : ''}
                                            </Text>
                                            {/* TRAINING DATE */}
                                            <Text w='13.6cm' display='flex' fontSize='8pt' alignItems='center' textTransform='uppercase' justifyContent='center'>
                                                {row?.type === "trainee"
                                                    ? `${formatTrainingDates(training?.start_date, training?.end_date, yearSelected)}`
                                                    : ''
                                                }
                                            </Text>
                                        </Box>
                                    );
                                })}
                            </Box>
                            {/** Footer */}
                            <Box display='flex' alignItems='end' fontWeight='normal' justifyContent='center'>
                                <Box h='90pt' w='25.1cm' borderRight='1px solid black' display='flex' flexDir='column' alignItems='center' justifyContent='end'>
                                    <Text w='100%' ps='1' h='60pt' textAlign='start' fontFamily='Calibri' fontSize='9pt'>Prepared by:</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontWeight='bold' fontSize='10pt' borderTop='1px solid black'>RAFFY P. LOPEZ</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontSize='10pt' borderTop='1px solid black'>Certification</Text>
                                </Box>
                                <Box h='90pt' w='24cm' borderRight='1px solid black' display='flex' flexDir='column' alignItems='center' justifyContent='end'>
                                    <Text w='100%' ps='1' h='60pt' textAlign='start' fontFamily='Calibri' fontSize='9pt'>Noted and Checked by:</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontWeight='bold' fontSize='10pt' borderTop='1px solid black'>MARIAN M. MEDALLON</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontSize='10pt' borderTop='1px solid black'>Operations</Text>
                                </Box>
                                <Box h='90pt' w='28.5cm' textAlign='center' borderRight='1px solid black' display='flex' flexDir='column' alignItems='center' justifyContent='end'>
                                    <Text w='100%' ps='1' h='60pt' textAlign='start' fontFamily='Calibri' fontSize='9pt'>Received by:</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontWeight='bold' fontSize='12pt' >{isSingleEndorser ? endorsers[0] : '\u200B'}</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontWeight='bold' fontSize='10pt' borderTop='1px solid black'>{companyName}</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontSize='10pt' borderTop='1px solid black'>Company</Text>
                                </Box>
                                <Box h='90pt' w='14.8cm' display='flex' flexDir='column' alignItems='center' justifyContent='end'>
                                    <Text fontFamily='Calibri' fontWeight='bold' fontSize='10pt'>{currDate}</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontSize='10pt' borderTop='1px solid black'>Date</Text>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal size='6xl' closeOnOverlayClick={false} scrollBehavior='inside' isOpen={isOpenTransmittalModal} onClose={() => {setEndorser(''); setInnerEndorsements([]);setCompanyFilter('');  setSelectedID([]); onCloseTransmittalModal();}}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create/Print Transmittal</ModalHeader>
                <ModalCloseButton />
                <ModalBody sx={{'&::-webkit-scrollbar': {width: '15px'}, '&::-webkit-scrollbar-thumb': {backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px'}}}>
                    <Box display='flex' justifyContent='space-between'>
                        <Box w='60%'>
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
                        <Box w='40%' display='flex' flexDir='column' gap='2' justifyContent='end' alignItems='end'>
                            <FormControl>
                                <FormLabel htmlFor='crewing' color='gray.600'>Name of Crewing:</FormLabel>
                                <Input id='crewing' value={endorser} textTransform='uppercase' onChange={(e) => setEndorser(e.target.value.toUpperCase())} />
                            </FormControl>
                            <Button onClick={handleInnerEndorsements} isDisabled={selectedID.length === 0 || endorser === ''} size='sm' colorScheme='blue' bgColor='blue.700' shadow='md'>Add Endorsement</Button>
                        </Box>
                    </Box>
                    <Box display='flex' mt='2' gap='2' borderTop='1px solid black'>
                        <Box w='40%' >
                            <Box display='flex' borderBottom='1px solid black' pr='4' py='2'>
                                <Text w='100%' textAlign='center'>Certificate Number</Text>
                                <Text w='100%' ml='3'>Name of Trainee</Text>
                            </Box>
                            <Box h='500px' style={{maxHeight: '500px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
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
                            <Box h='500px' style={{maxHeight: '500px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
                                {innerEndorsements.length === 0 ? (
                                    <Text textAlign='center' p='2' w='100%'>No Certificates found.</Text>
                                ) : (
                                    innerEndorsements.map((endorsement, index) => (
                                        <Box key={index}>
                                            {endorsement.certificate_id.map((id, index) => {
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
                                                )
                                            })}
                                            <Text textAlign='center'>{`CREWING: ${endorsement.endorser || "No Endorser"}`}</Text>
                                        </Box>
                                    )))
                                }
                            </Box>
                        </Box>
                    </Box>
                    {/** PREVIEW OF TRANSMITTAL */}
                    <Box>
                        <Box ref={componentRef} w='203mm' h='276mm' border='1px solid black' mt='4' mx='auto' display='flex' flexDir='column'
                            //sx={{display: 'none', '@media print': {display: 'block', fontFamily: 'Arial, Helvetica, sans-serif !important', WebkitPrintColorAdjust: 'exact', '*': {fontFamily: 'Arial, Helvetica, sans-serif !important'}}}}
                        >
                            {/**  Header */}
                            <Box display='flex' px='5' alignItems='end' borderBottom='1px solid black'>
                                <Box>
                                    <ChakraImage src={'/CompanyLogo2-dark.png'} w='1.1in' alt='company-logo' objectFit='cover' />
                                </Box>
                                <Box w='100%' display='flex' flexDir='column' textAlign='center' alignItems='end' justifyContent='center'>
                                    <Box w='100%' h='90%'>
                                        <Text fontSize='16pt' fontWeight='bold'>TRANSMITTAL FOR RELEASE OF CERTIFICATES</Text>
                                    </Box>
                                    <Box w='100%' h='10%' textAlign='end'>
                                        <Text textAlign='end' fontWeight='normal' fontSize='5pt' as='i'>{`FM-Pentagon-02-10-02`}</Text>
                                    </Box>
                                </Box>
                            </Box>
                            {/** course details */}
                            <Box display='flex' justifyContent='center' borderBottom='1px solid black' >
                                <Box w='13cm' textAlign='center' >
                                    <Text h='50pt' display='flex' ps='2' alignItems='center' justifyContent='start' borderBottom='1px solid black' borderRight='1px solid black'>COURSE</Text>
                                    <Text h='25pt' display='flex' ps='2' alignItems='center' justifyContent='start' borderRight='1px solid black'>INSTRUCTOR</Text>
                                </Box>
                                <Box w='40cm' textAlign='center' >
                                    <Text h='50pt' display='flex' alignItems='center' justifyContent='center' borderBottom='1px solid black' borderRight='1px solid black'>{courseNames.join('/')}</Text>
                                    <Text h='25pt' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>{'\u200B'}</Text>
                                </Box>
                                <Box w='11.43cm' textAlign='center'>
                                    <Text h='25pt' ps='2' display='flex' alignItems='center' justifyContent='start' borderBottom='1px solid black' borderRight='1px solid black'>DATE</Text>
                                    <Text h='25pt' ps='2' display='flex' alignItems='center' justifyContent='start' borderBottom='1px solid black' borderRight='1px solid black'>ROOM:</Text>
                                    <Text h='25pt' ps='2' display='flex' alignItems='center' justifyContent='start' borderRight='1px solid black'>ASSESSOR:</Text>
                                </Box>
                                <Box w='28cm' textAlign='center'>
                                    <Text h='25pt' display='flex' alignItems='center' justifyContent='center' borderBottom='1px solid black' >{currDate}</Text>
                                    <Text h='25pt' display='flex' alignItems='center' justifyContent='center' borderBottom='1px solid black' >{'\u200B'}</Text>
                                    <Text h='25pt' display='flex' alignItems='center' justifyContent='center'>{'\u200B'}</Text>
                                </Box>
                            </Box>
                            {/** List */}
                            <Box>
                                {/** header */}
                                <Box display='flex' h='23pt' borderBottom='1px solid black'>
                                    <Text w='2.8cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>NO.</Text>
                                    <Text w='20cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>LAST NAME</Text>
                                    <Text w='22cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>FIRST NAME</Text>
                                    <Text w='3.45cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>MI</Text>
                                    <Text w='22.43cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>CERTIFICATE NO.</Text>
                                    <Text w='13.6cm' display='flex' alignItems='center' justifyContent='center' >TRAINING DATE/S</Text>
                                </Box>
                                {/** body */}
                                {Array.from({ length: 30 }).map((_, index) => {
                                    const row = tableRows[index];
                                    let trainee;
                                    let training: TRAINING_BY_ID | undefined;
                                    if (row?.type === "trainee") {
                                        training = allTData.find(t => t.id === row.certID);
                                        if (!training) return null;
                                        const registration = allRegData?.find(r => r.id === training?.reg_ref_id);
                                        trainee = registration ? allTrainee?.find(tr => tr.id === registration.trainee_ref_id) : undefined;
                                    }
                                    return (
                                        <Box key={index} display='flex' h='18pt' borderBottom='1px solid black' fontWeight='normal'>
                                            {/* NUMBER */}
                                            <Text w='2.8cm' display='flex' alignItems='center' justifyContent='center' borderRight='1px solid black'>
                                                {(index + 1)}
                                            </Text>
                                            {/* LAST NAME */}
                                            <Text w='20cm' display='flex' fontSize='9pt' alignItems='center' justifyContent='start' textTransform='uppercase' borderRight='1px solid black'>
                                                {row?.type === "trainee" ? ('\u200B' + ` ${trainee?.last_name}`) : ''}
                                            </Text>
                                            {/* FIRST NAME */}
                                            <Text w='22cm' display='flex' fontSize='9pt' color={row?.type === 'endorser' ? 'red.500' : 'black'} alignItems='center' justifyContent={row?.type === 'endorser' ? 'center' : 'start'} textTransform='uppercase' borderRight='1px solid black'>
                                                {row?.type === "endorser" && !isSingleEndorser
                                                    ? `(${row.endorser})`
                                                    : ('\u200B' + ` ${trainee?.first_name || ''}`)
                                                }
                                            </Text>
                                            {/* MI */}
                                            <Text w='3.45cm' display='flex' fontSize='9pt' alignItems='center' justifyContent='center' textTransform='uppercase' borderRight='1px solid black'>
                                                {row?.type === "trainee" ? `${trainee?.middle_name?.charAt(0) ?? ''}.` : ''}
                                            </Text>
                                            {/* CERTIFICATE */}
                                            <Text w='22.43cm' display='flex' fontSize='9pt' alignItems='center' justifyContent='center' textTransform='uppercase' borderRight='1px solid black'>
                                                {row?.type === "trainee" ? training?.cert_no ?? '' : ''}
                                            </Text>
                                            {/* TRAINING DATE */}
                                            <Text w='13.6cm' display='flex' fontSize='8pt' alignItems='center' textTransform='uppercase' justifyContent='center'>
                                                {row?.type === "trainee"
                                                    ? `${formatTrainingDates(training?.start_date, training?.end_date, yearSelected)}`
                                                    : ''
                                                }
                                            </Text>
                                        </Box>
                                    );
                                })}
                            </Box>
                            {/** Footer */}
                            <Box display='flex' alignItems='end' fontWeight='normal' justifyContent='center'>
                                <Box h='90pt' w='25.1cm' borderRight='1px solid black' display='flex' flexDir='column' alignItems='center' justifyContent='end'>
                                    <Text w='100%' ps='1' h='60pt' textAlign='start' fontFamily='Calibri' fontSize='9pt'>Prepared by:</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontWeight='bold' fontSize='10pt' borderTop='1px solid black'>RAFFY P. LOPEZ</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontSize='10pt' borderTop='1px solid black'>Certification</Text>
                                </Box>
                                <Box h='90pt' w='24cm' borderRight='1px solid black' display='flex' flexDir='column' alignItems='center' justifyContent='end'>
                                    <Text w='100%' ps='1' h='60pt' textAlign='start' fontFamily='Calibri' fontSize='9pt'>Noted and Checked by:</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontWeight='bold' fontSize='10pt' borderTop='1px solid black'>MARIAN M. MEDALLON</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontSize='10pt' borderTop='1px solid black'>Operations</Text>
                                </Box>
                                <Box h='90pt' w='28.5cm' textAlign='center' borderRight='1px solid black' display='flex' flexDir='column' alignItems='center' justifyContent='end'>
                                    <Text w='100%' ps='1' h='60pt' textAlign='start' fontFamily='Calibri' fontSize='9pt'>Received by:</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontWeight='bold' fontSize='12pt' >{isSingleEndorser ? endorsers[0] : '\u200B'}</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontWeight='bold' fontSize='10pt' borderTop='1px solid black'>{companyName}</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontSize='10pt' borderTop='1px solid black'>Company</Text>
                                </Box>
                                <Box h='90pt' w='14.8cm' display='flex' flexDir='column' alignItems='center' justifyContent='end'>
                                    <Text fontFamily='Calibri' fontWeight='bold' fontSize='10pt'>{currDate}</Text>
                                    <Text w='100%' textAlign='center' fontFamily='Calibri' fontSize='10pt' borderTop='1px solid black'>Date</Text>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handlePrint} isDisabled={innerEndorsements.length === 0} bgColor='blue.700' colorScheme='blue' shadow='md' >Print Transmittal</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}
