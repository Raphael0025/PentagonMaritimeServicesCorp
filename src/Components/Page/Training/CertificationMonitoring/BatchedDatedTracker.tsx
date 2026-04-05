'use client'

import NextImage from 'next/image'
import React, { useState, useRef, useMemo } from 'react'
import { Box, Image as ChakraImage, Text, Textarea, Spinner, Center, Button, Tooltip, Checkbox, Select, Input, 
FormControl, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, Menu, MenuList, MenuItem, MenuButton, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, 
Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, FormLabel
} from '@chakra-ui/react';
import { ArrowBackIcon, ChevronDownIcon } from '@chakra-ui/icons'

import { Timestamp } from 'firebase/firestore'
import { TRAINING_BY_ID } from '@/types/trainees'
import { CERTIFICATION_BY_ID, CERTIFICATION, certVersion } from '@/types/certification'

import { CourseBatchByID, initCourseBatch } from '@/types/course-batches'

import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { handleCertStatus } from '@/handlers/trainee_handler'
import { certBackgroundColor } from '@/handlers/util_handler'
import { relativeDateBackgroundColor } from '@/handlers/cert_helper'

import { useRank } from '@/context/RankContext'
import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useInstructors } from '@/context/InstructorContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCertification } from '@/context/CertificationContext'

import { UPDATE_TRAINING, changeImg } from '@/lib/trainee_controller'
import { useReactToPrint } from 'react-to-print'
import { EditIcon } from '@/Components/Icons'

import { getDownloadURL, ref, getStorage  } from "firebase/storage";

interface BatchedDatedProps {
    searchTerm: string;
    trainings: TRAINING_BY_ID[];
    trainingIDs: string[];
    setTrainingIDs: React.Dispatch<React.SetStateAction<string[]>>;
    setFirstSelected: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BatchedDated ({ searchTerm, trainings, trainingIDs, setTrainingIDs, setFirstSelected }: BatchedDatedProps){
    const toast = useToast()
    const storage = getStorage();
    const { data: allCertTemplates } = useCertification()
    const { data: allRanks } = useRank()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allInstructors } = useInstructors()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allRegData } = useRegistrations()

    const [loading, setLoading] = useState<boolean>(false)
    const [certLoading, setCertLoading] = useState<boolean>(false)

    const [remarks, setRemarks] = useState<string>('')
    const [t_id, setID] = useState<string>('')
    const [t_date, setTDate] = useState<Timestamp | undefined>(Timestamp.now())

    const [courseName, setCourseName] = useState<string>('')
    const [trainingBatch, setTrainingBatch ] = useState<CourseBatchByID>(initCourseBatch)
    const [openIndexes, setOpenIndexes] = useState<number[] | number>([])
    const [filename, setFileName] = useState<string>('No file chosen yet...')
    const [preview, setPreview] = useState<string | null>(null)
    const [imgFile, setImgFile] = useState<File[]>([])

    const [traineeDocID, setTraineeDocID] = useState<string>('')
    const [attachmentFile, setAttachment] = useState<string>('')
    const [last_name, setLN] = useState<string>('')
    const [first_name, setFN] = useState<string>('')
    const [cat, setCat] = useState<string>('')
    const [attachmentType, setAT] = useState<string>('')
    const [isPrinting, setIsPrinting] = useState<boolean>(true)
    const [trainingID, setSelectedTrainingID] = useState<string[]>([])
    const [training_id, setTraining_ID] = useState<string>('')
    const [view_count, setViewCount] = useState<number>(0)
    const [courseID, setCourseID] = useState<string>('')
    const [category, setCategory] = useState('')
    const [closeBlur, setCloseBlur] = useState<boolean>(false)

    // Controlled states for preview & saving
    const [certTitleHtml, setCertTitleHtml] = useState('')
    const [certContentHtml, setCertContentHtml] = useState('')
    const [versionNumber, setVersionNumber] = useState<string>('')

    const { isOpen: isOpenRemarks, onOpen: onOpenRemarks, onClose: onCloseRemarks } = useDisclosure()
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
    const { isOpen: isOpenCert, onOpen: onOpenCert, onClose: onCloseCert } = useDisclosure()
    const { isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
    const { isOpen: isOpenViewCount, onOpen: onOpenViewCount, onClose: onCloseViewCount } = useDisclosure()
    const { isOpen: isOpenView, onOpen: onOpenView, onClose: onCloseView } = useDisclosure()
    
    const componentRef = useRef<HTMLDivElement | null>(null)
    const attachment = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${courseName}.pdf`,
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
            setIsPrinting(false);
            handleToast('Preparing to print certificates...', ``, 3000, 'info');
        },
        onAfterPrint: () => {
            handleToast('Certificates Printed!', ``, 3000, 'success');
            onCloseRemarks()
        },
    })

    const certificates = useMemo(() => {
        return allCertTemplates ?? []
    }, [allCertTemplates])

    const certificateVersions = useMemo(() => {
        if (!courseID) return [];
    
        return certificates
            .filter((c: CERTIFICATION_BY_ID) =>
                c.courseID === courseID &&
                (category ? c.category === category : true)
            )
            .flatMap((c) => c.versions ?? []);
    }, [certificates, courseID, category]);

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

    const handleChangeContents = async () => {
        // trainingID.map(async (training_id) => {
        //     await UPDATE_TRAINING(training_id,
        //         {
        //             certTitle: certTitleHtml,
        //             certContent: certContentHtml,
        //             cert_version: versionNumber,
        //         },
        //         localStorage.getItem('customeToken') || ''
        //     )
        // })
        // setCertTitleHtml('')
        // setCertContentHtml('')
        // setVersionNumber('')
        // setCategory('')
        // setSelectedTrainingID([])
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    trainingID.map(async (training_id) => {
                        await UPDATE_TRAINING(training_id,
                            {
                                certTitle: certTitleHtml,
                                certContent: certContentHtml,
                                cert_version: versionNumber,
                            },
                            localStorage.getItem('customeToken') || ''
                        )
                    })
                    res()
                }catch(error){
                    rej(error)
                }
            }, 50)
        }).then(() => {
            handleToast('Content Updated Successfully!', `Crew's certificate status has been updated successfully.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setCertTitleHtml('')
            setCertContentHtml('')
            setVersionNumber('')
            setCategory('')
            setSelectedTrainingID([])
            setLoading(false)
        })
    }

    const handlePrintCertificates = async () => {
        trainingID.map(async (training_id) => {
            await UPDATE_TRAINING(training_id, 
                { 
                    printCount: (trainings.find((tr) => tr.id === training_id)?.printCount || 0) + 1,
                    cert_status: 1,
                }, 
                localStorage.getItem('customToken') || '')
        })
        setSelectedTrainingID([]) 
        setIsPrinting(true)
    }

    const handleStatus = async (trainingID: string, newStatus: number) => {
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat = {
                        cert_status: newStatus,
                        cert_released: Timestamp.now(),
                    }
                    await UPDATE_TRAINING(trainingID, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 50)
        }).then(() => {
            handleToast('Status Updated Successfully!', `Crew's certificate status has been updated successfully.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        })
    }

    const handleChangeTDate = async () => {
        setCertLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat = {
                        cert_released: t_date || Timestamp.now(),
                    }
                    await UPDATE_TRAINING(t_id, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 50)
        }).then(() => {
            handleToast('Status Updated Successfully!', `Crew's certificate status has been updated successfully.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setTDate(Timestamp.now())
            setCertLoading(false)
            onCloseEdit()
            setID('')
        })
    }

    const handleRemarks = () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat = {
                        train_remarks: remarks,
                    }
                    await UPDATE_TRAINING(t_id, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Remarks Saved Successfully!', ``, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setRemarks('')
            setID('')
            setCertLoading(false)
            setLoading(false)
        })
    }

    const getRelativeDate = (endDate?: string, startDate?: string) => {
        const dateStr = endDate || startDate
        if (!dateStr) return '-'
        const year = new Date().getFullYear()
        const target = new Date(`${dateStr} ${year}`)
        if (isNaN(target.getTime())) return '-'
        
        const today = new Date()

        // normalize times to midnight
        today.setHours(0,0,0,0)
        target.setHours(0,0,0,0)

        const diffDays = Math.round(
            (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diffDays === -2) return '2 days ago'
        if (diffDays === -1) return 'yesterday'
        if (diffDays === 0) return 'today'
        if (diffDays === 1) return 'tomorrow'

        return target.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })   
    }

    const formatTrainingDate = (endDate?: string, startDate?: string) => {
        const dateStr = endDate || startDate
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        if(isNaN(date.getTime())) return '-'

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }

    const formatDateForInput = (ts?: Timestamp | undefined) => {
        if (!ts) return ''
        return ts.toDate().toISOString().split('T')[0]
    }

    const formatTrainingSchedule = (dateStr: string, year: number) => {
        if (!dateStr) return ''
        const dateConvert = new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
        return `${dateConvert}, ${year}` // "February 11"
    }

    const getOrdinalHTML = (day: number) => {
        const suffix =
            day % 10 === 1 && day % 100 !== 11 ? 'st' :
            day % 10 === 2 && day % 100 !== 12 ? 'nd' :
            day % 10 === 3 && day % 100 !== 13 ? 'rd' : 'th'

        return `${day}<sup>${suffix}</sup>`
    }

    const normalizeCertContent = (html: string) => {
        const temp = document.createElement('div')
        temp.innerHTML = html

        // convert inner divs to spans
        temp.querySelectorAll('div').forEach(div => {
            const span = document.createElement('span')
            span.innerHTML = div.innerHTML

            // copy styles you need
            span.style.display = 'inline'
            span.style.textAlign = div.style.textAlign || 'center'
            span.style.lineHeight = '1.2'

            div.replaceWith(span)
        })

        return temp.innerHTML
    }
    
    const toggleAll = () => {
        if (Array.isArray(openIndexes) && openIndexes.length === trainings.length) {
            setOpenIndexes([]) // All open → close all
        } else {
            setOpenIndexes(trainings.map((_, index) => index)) // Open all
        }
    }

    const handleCloseMod = () => {
        onCloseModal()
        setFileName('No file chosen yet...')
        setPreview(null)
    }

    const handleViewCert = async (field: string = '', vc: number = 0) => {
        switch(field){
            case 'hasView':
                await UPDATE_TRAINING(training_id, {hasViewed: false}, '')
                return
            case 'viewCount':
                await UPDATE_TRAINING(training_id, {viewCount: vc}, '')
                return
        }
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
            await changeImg(traineeDocID, last_name, first_name, cat, attachmentType, imgFile, filename, '')
            handleCloseMod()
            handleToast(`Successfully changed Trainee's Attachment.`, `Trainee's attachment file has been updated.`, 5000, 'success')
        } catch(error){
            console.error('Error updating trainee image: ', error);
            handleToast(`Failed to change Trainee's Attachment.`, `Trainee's attachment file was not successfully updated. Please issue this to the IT department.`, 5000, 'success')
        } finally {
            setLoading(false)
        }
    }

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

    return(
        <>
        <Box h='650px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}} >
            {/** Headers */}
            <Box w='1750px' bgColor='blue.700' position='sticky' top='0' zIndex='9' mb='2' color='white' display='flex' textAlign='center' className='space-x-3' alignItems='center' borderRadius='5px' borderColor='gray' borderWidth='1px' borderStyle='solid' p='2'>
                <Text w='30px'>#</Text>
                <Text w='100px'>Completion Recency</Text>
                <Text w='100px'>Completion Date</Text>
                <Text w='100px'>Batch</Text>
                <Text w='200px'>Certificate No.</Text>
                <Text w='350px'>Trainee Name</Text>
                <Text w='150px'>Course</Text>
                <Text w='120px'>Date Released</Text>
                <Text w='100px'>Charge</Text>
                <Text w='150px'>Status</Text>
                <Text w='200px'>Company</Text>
                <Text w='150px'>Crewing</Text>
                <Text w='300px'>Notes</Text>
            </Box>
            {/** Current Month Data Table */}
            <Box>
            {!trainings ? (
                <Center py={8}>
                    <Spinner size="lg" color="blue.500" mr={3} />
                    <Text fontWeight="medium" color="gray.600">Loading current month certification records...</Text>
                </Center>
            ) : trainings.length === 0 ? (
                <Center py={8}>
                    <Text fontWeight="medium" color="gray.500">No certification records found.</Text>
                </Center>
            ) : (trainings?.map((training: TRAINING_BY_ID, index: number) => {
                    const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                    const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                    const relativeDate = getRelativeDate(training.end_date, training.start_date)

                    if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                ){
                    return(
                        <Box key={training.id} _hover={{bgColor: 'blue.100', color: 'black'}} borderRadius='5px' color={training.cert_status === 7 ? 'white' : 'black'} w='1750px' fontWeight='normal' mb='1' className="flex text-center border-b space-x-3 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                            <Text w="30px" textAlign='center'>{`${(index + 1)}.`}</Text>                                                                             
                            <Text w="100px" bg={relativeDateBackgroundColor(relativeDate)} borderRadius='5px' >
                                {relativeDate}
                            </Text>                                                                             
                            <Text w="110px">{formatTrainingDate(training.end_date, training.start_date)}</Text>                                                                             
                            <Text w="100px" onClick={() => {
                                const foundBatch = courseBatch?.find((cb) => cb.id === training.batch)
                                const foundCourse = allCourses?.find((course) => course.id === foundBatch?.course)
                                if (foundBatch && foundCourse) {
                                    setCourseName(foundCourse.course_name.toUpperCase());
                                    setCourseID(foundCourse.id)
                                    setTrainingBatch(foundBatch);
                                    onOpenCert();
                                }
                            }} _hover={{cursor: 'pointer', textStyle: 'underline', color: 'blue.600'}}>
                                {`${courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `B${courseBatch.find((batch) => batch.id === training.batch)?.batch_no}` : ''}`}
                            </Text>                                        
                            <Text w="200px" _hover={{color: 'blue.700'}} onClick={() => {
                                // setRegNum(reg_id); 
                                // onOpenReg();
                                }} className='hover:cursor-pointer'>
                                {`${training.cert_no}`}
                            </Text>                                   
                            <Text w="350px">{`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''} ${trainee.suffix || ''}`}</Text>                                        
                            <Text w="150px">
                                {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                            </Text> 
                            <Text w="120px" _hover={{ cursor: 'pointer'}} onClick={() => {(training.cert_status !== 0 && training.cert_status !== 1) && onOpenEdit(); setID(training.id); setTDate(training.cert_released);}} >{((training.cert_status !== 0 && training.cert_status !== 1) ? parsingTimestamp(training.cert_released).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric', year: 'numeric'}) : '')}</Text>  
                            <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                            <Box w='150px' display='flex' justifyContent='center' gap='2'>
                                <Checkbox shadow='md' onChange={() => {setFirstSelected(training.cert_status === 1 ? true : false); setTrainingIDs(prev => [...prev, training.id])}} isChecked={training?.id === trainingIDs.find((id) => id === training.id)} />
                                <Text w='100%' px='2' bgColor={certBackgroundColor(training.cert_status)} borderRadius='5px' size='xs'>
                                    {handleCertStatus(training.cert_status)}
                                </Text>
                            </Box>
                            <Tooltip className='text-center' aria-label='tooltip' label={allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}>
                                <Text w="200px" noOfLines={1} className='text-wrap'>
                                    {allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}
                                </Text>    
                            </Tooltip>
                            <Tooltip className='text-center uppercase' aria-label='tooltip' label={trainee.endorser}>
                                <Text w="150px" noOfLines={1} className='text-wrap uppercase' >{trainee.endorser}</Text>    
                            </Tooltip>                                    
                            <Button onClick={() => { setID(training.id); setRemarks(training.train_remarks); onOpenRemarks(); }} size='sm' p={0} variant='link' w='300px'>
                                <Text fontWeight='normal' color={training.reg_status === 7 ? 'white' : 'black'}>
                                    {training.train_remarks === '' ? 'None' : training.train_remarks}
                                </Text>
                            </Button>                                     
                        </Box>
                    )
                }
            }))}
            </Box>
        </Box>
        {/** Modal for editing released dates */}
        <Modal size='xs' isOpen={isOpenEdit} onClose={() => {onCloseEdit(); setID(''); setTDate(undefined);}}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader color='blue.700'>Edit Released Date</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <Input onChange={(e) => {
                            const value = e.target.value
                            setTDate(value ? Timestamp.fromDate(new Date(value)) : undefined) }} 
                            value={formatDateForInput(t_date)} type='date' textAlign='center' fontWeight='normal' />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handleChangeTDate} isLoading={certLoading} loadingText='Updating...' colorScheme='blue' shadow='md' size='sm' w='100%' bgColor='blue.700'>UPDATE</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenRemarks} scrollBehavior='inside' onClose={() => {setRemarks(''); setID(''); setTDate(Timestamp.now()); onCloseRemarks();}}>
            <ModalOverlay />
            <ModalContent px='2'>
                <ModalHeader>Training Remarks</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder='Type here your remarks...' fontWeight='normal' shadow='md' minH='150px'></Textarea>
                    </FormControl>
                </ModalBody>
                <ModalFooter display='flex' borderTopWidth='1px' borderColor='gray.500'>
                    <Button onClick={handleRemarks} isLoading={certLoading} loadingText='Saving...' colorScheme='blue' shadow='md' size='sm' bgColor='blue.700'>Save Remarks</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal size='6xl' closeOnOverlayClick={false} scrollBehavior='inside' isOpen={isOpenCert} onClose={() => {setTrainingBatch(initCourseBatch); setSelectedTrainingID([]); setCategory(''); setCourseID(''); onCloseCert();}}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader w='90%'>{`Batch: ${trainingBatch.batch_no} ${courseName}`}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb='5'>
                    {(() => {
                        const batchTrainings = trainings.filter((td) => td.batch === trainingBatch.id)
                        return(
                        <>
                            <Box borderBottom='1px solid black' pb='4' w='100%' display='flex' justifyContent='space-between' alignItems='center'>
                                <Box mr='3' display='flex' gap='2' w='450px'>
                                    <Checkbox w='150px'
                                        onChange={() => {
                                                if (trainingID.length === batchTrainings.length) {
                                                    setSelectedTrainingID([])
                                                } else {
                                                    setSelectedTrainingID(batchTrainings.map((t) => t.id))
                                                }
                                            }}
                                    >
                                        <Text fontSize='sm' fontWeight='normal'>
                                            {trainingID.length === batchTrainings.length
                                            ? "Deselect All"
                                            : "Select All"}
                                        </Text>
                                    </Checkbox>
                                    <Menu closeOnBlur={true} closeOnSelect={closeBlur}>
                                        <MenuButton as={Button} isDisabled={trainingID.length === 0} onClick={() => {setCloseBlur(false);}} size='sm' variant='ghost' colorScheme='blue' transition='all 0.2s'> 
                                            <Text fontSize='12px'>Select Content <ChevronDownIcon /></Text> 
                                        </MenuButton> 
                                        <MenuList w='350px' px='1'>
                                        {category === '' ? (
                                            <>
                                                <MenuItem closeOnSelect={false} onClick={() => {setCategory('generic');}}>Generic</MenuItem>
                                                <MenuItem closeOnSelect={false} onClick={() => {setCategory('client');}}>Client Specific</MenuItem>
                                            </>
                                        ) : (
                                            <>
                                            <MenuItem icon={<ArrowBackIcon />} onClick={() => {setCategory(''); }}>{'Back'}</MenuItem>
                                            {certificateVersions.map((v: certVersion) => {
                                                return(
                                                    <MenuItem key={v.version_number} display='flex' justifyContent='space-between' borderBottom='1px solid gray' 
                                                        onClick={() => {
                                                            setVersionNumber(v.version_number); 
                                                            setCertTitleHtml(v.certTitleHtml); 
                                                            setCertContentHtml(v.certContentHtml); 
                                                            //setSubTitle(v?.subTitle); 
                                                            //setAdditionalDescription(v?.additionalDescription); 
                                                            setCloseBlur(true);
                                                        }}
                                                    >
                                                        <Box >
                                                            {category === 'client' && (
                                                                <Text>{`${v.subTitle}`}</Text>
                                                            )}
                                                            <Text>{`Version ${v.version_number}`}</Text>
                                                            <Text fontWeight='bold' color={`${(v.status==='active' ? 'green.500' : 'black' )}`}>{`${v.status.toUpperCase()}`}</Text>
                                                        </Box>
                                                    </MenuItem>
                                                )
                                            })}
                                            </>
                                        )}
                                        </MenuList>
                                    </Menu>
                                    <Button onClick={handleChangeContents} loadingText='Saving...' isLoading={loading} size='sm' colorScheme='blue' w='150px' bgColor='blue.700' shadow='md' isDisabled={certTitleHtml === ''}>Save Content</Button>
                                </Box>
                                <Box>
                                    <Button size='sm' variant='solid' onClick={toggleAll} mr='3'>
                                        {Array.isArray(openIndexes) && openIndexes.length === trainings.length ? "Collapse All" : "Expand All"}
                                    </Button>
                                    {!isPrinting ? (
                                        <Button onClick={() => handlePrintCertificates()} mr='3' size='sm' colorScheme='green' shadow='md'>Printing Complete</Button>
                                    ) : (
                                        <Button isDisabled={trainingID.length === 0} onClick={handlePrint} bgColor='#1C437E' size='sm' colorScheme='blue' loadingText='Printing...' shadow='md'>Print Certificates</Button>
                                    )}
                                </Box>
                            </Box>
                            <Box display='flex' borderBottom='1px solid black' justifyContent='space-between' textAlign='center' px='4' py='2' textTransform='uppercase' >
                                <Text w='60px'>#</Text>
                                <Text w='200px'>Certificate No.</Text>
                                <Text w='300px'>Trainee Name</Text>
                                <Text w='150px'>Company</Text>
                                <Text w='100px'>Charge</Text>
                                <Text w='100px'>No. of Prints</Text>
                                <Text w='100px'>Viewed</Text>
                                <Text w='100px'>View Count</Text>
                                <Text w='20px'></Text>
                            </Box>
                            <Accordion allowMultiple index={openIndexes} allowToggle onChange={setOpenIndexes}>
                            {batchTrainings?.sort((a, b) => a.cert_no.localeCompare(b.cert_no)).map((training: TRAINING_BY_ID, index: number) => {
                                const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
                                const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                                const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                                //const reg_id = allRegData?.find((reg) => 
                                const batchYear = courseBatch?.find((batch) => batch.id === training.batch)?.createdAt
                                const getYear = batchYear?.toDate().getFullYear()
                                const splitMonth = formatTrainingSchedule((training.end_date === '' ? training.start_date : training.end_date), getYear || 0).split(' ')[0]
                                const splitDay = formatTrainingSchedule((training.end_date === '' ? training.start_date : training.end_date), getYear || 0).split(' ')[1].replace(/\D/g, '')
                                const nthDay = getOrdinalHTML(Number(splitDay))
            
                                const trainingDate = training.numOfDays === 1 
                                    ? formatTrainingSchedule(training.start_date, getYear || 0) 
                                    : `${formatTrainingSchedule(training.start_date, getYear || 0)} to ${formatTrainingSchedule(training.end_date, getYear || 0)}`
            
                                if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                                ))
                                {
                                return(
                                    <AccordionItem key={training.id} _hover={{bgColor: 'gray.50', color: 'black'}} borderRadius='5px' fontWeight='normal' >
                                        <AccordionButton fontSize='sm' display='flex' justifyContent='space-between' textTransform='uppercase'>
                                            <Checkbox onChange={() => {setSelectedTrainingID(prev => prev.includes(training.id) ? prev.filter(id => id !== training.id) : [...prev, training.id])}} isChecked={trainingID.includes(training.id)}/>
                                            <Text w="30px" textAlign='center'>{`${(index + 1)}.`}</Text>                                                                             
                                            <Text w="200px" _hover={{color: 'blue.700'}} onClick={() => {
                                                // setRegNum(reg_id); 
                                                // onOpenReg();
                                                }} className='hover:cursor-pointer'>
                                                {`${training.cert_no}`}
                                            </Text>                                   
                                            <Text w="300px">{`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''} ${trainee.suffix || ''}`}</Text>                                        
                                            {/* <Text w="120px" _hover={{ cursor: 'pointer'}} onClick={() => {training.cert_status !== 0 && onOpenEdit(); setID(training.id); setTDate(training.cert_released);}} >{(training.cert_status !== 0 ? parsingTimestamp(training.cert_released).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric', year: 'numeric'}) : '')}</Text>   */}
                                            <Text w="150px" >{allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}</Text>  
                                            <Text w="100px" >{training.accountType === 0 ? 'TRAINEE' : 'COMPANY'}</Text>  
                                            <Text w="100px" >{training?.printCount || 0}</Text>  
                                            <Text w="100px" onClick={() => {setTraining_ID(training.id); onOpenView();}} _hover={{ cursor: 'pointer'}}>{training?.hasViewed ? 'Viewed' : 'Not yet'}</Text>  
                                            <Text w="100px" onClick={() => {setTraining_ID(training.id); onOpenViewCount();}} _hover={{ cursor: 'pointer'}}>{training?.viewCount || 0}</Text>  
                                            <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel px='10' py='5'>
                                            <Box position='relative' display='flex' flexDir='column' justifyContent='center' alignItems='center' >
                                                <Box w='100%' position='relative' zIndex={2} display='flex' fontSize='12pt' fontWeight='normal' fontFamily='Arial' flexDir='column' alignItems='center' px='4' pt='8'>
                                                    <ChakraImage src={'/certificateHeader.png'} alt='header image' w='7.25in' h='1.20in'  objectFit='cover'/>
                                                    <Box pt='12' pr='5' pb='5' display='flex' justifyContent='end' w='85%'>
                                                        <Box fontWeight='bold' lineHeight='1.2' gap='0' display='block' fontSize='12pt' textAlign='start'>
                                                            <Text>
                                                                Certificate No.: 
                                                                <Text as='span' fontWeight={'normal'}>
                                                                    {`${training.cert_no}`}
                                                                </Text>
                                                            </Text>
                                                            <Text>
                                                                Registration No.: 
                                                                <Text as='span' fontWeight={'normal'}>
                                                                    {`REG-${reg_num}`}
                                                                </Text>
                                                            </Text>
                                                        </Box>
                                                    </Box>
                                                    <Box w='100%' display='flex' flexDir='column' alignItems='center' justifyContent='center' gap='0'>
                                                        <Text fontWeight='bold' fontSize='26pt'>Certificate of Completion</Text>
                                                        <Text >This Certificate is issued to</Text>
                                                        <Text fontWeight='bold' fontSize='16pt' textTransform='uppercase'>{`${trainee.first_name} ${trainee.middle_name} ${trainee.last_name}`}</Text>
                                                        <Text>for having successfully completed the training course in</Text>
                                                        <Text fontSize='14pt' w='60%' mt='2' textAlign='center' fontWeight='bold'>
                                                            <div
                                                                dangerouslySetInnerHTML={{
                                                                    __html: `${training.certTitle}`
                                                                }}
                                                            />
                                                        </Text>
                                                        <Box w='85%' mt='3' textAlign='center' sx={{
                                                            '& ul': {
                                                                listStyleType: 'disc',
                                                                listStylePosition: 'inside',
                                                                paddingLeft: '1.5rem',
                                                                margin: '0.0055rem 0',
                                                            },
                                                            '& ol': {
                                                                listStyleType: 'decimal',
                                                                listStylePosition: 'inside',
                                                                paddingLeft: '1.5rem',
                                                                margin: '0.0055rem 0',
                                                            },
                                                            '& li': {
                                                                marginBottom: '0.0055rem',
                                                            },
                                                            '& p, & div': {
                                                                display: 'inline',
                                                                lineHeight: '1.2',
                                                                margin: 0,
                                                            },
                                                            '& br': {
                                                                display: 'inline',
                                                            },
                                                        }}>
                                                            <div style={{fontSize: '12pt', display: 'block', lineHeight: '1.2'}}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: `<span>Conducted on ${trainingDate} </span>${normalizeCertContent(training.certContent)}`
                                                                }}
                                                            />
                                                        </Box>
                                                        <div style={{marginTop: '10px'}}
                                                            dangerouslySetInnerHTML={{
                                                                __html: `Issued this ${nthDay} day of ${splitMonth}, ${getYear} in Manila City, Philippines`
                                                            }}
                                                        />
                                                        <Box pt='4' display='flex' alignItems='end' w='85%'>
                                                            <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                                                {(() => {
                                                                    const ins = allInstructors?.find((i) => i.name === 'ROGELIO C. MAHINAY')
                                                                    const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                                                    return(
                                                                        <>
                                                                            <Box position='absolute' top='-50px' left='20%' transform="translateX(-10%)" zIndex={2} >
                                                                                <ChakraImage src={eSignSrc} w='100%' h='100%' alt='signature' />
                                                                            </Box>
                                                                            <Box borderTop='1px solid black' w='80%' />
                                                                            <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='10pt' fontWeight='bold'>
                                                                                {(() => {
                                                                                    if (!ins) return 'No Instructor';
                                                                                    return `${ins.rank} ${ins.name}`;
                                                                                })()}
                                                                            </Text>
                                                                            <Text fontSize='10pt'>Training Director</Text>
                                                                        </>
                                                                    )
                                                                })()}
                                                            </Box>
                                                            <Box w='50%' pb='9' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center'>
                                                                <Box w='1.5in' h='1.5in' ref={attachment} onClick={() => {onOpenModal(); setTraineeDocID(trainee.id); setLN(trainee.last_name); setFN(trainee.first_name); setCat('idPic'); setAT('photos'); setAttachment(trainee.photo)}} _hover={{cursor: 'pointer'}}>
                                                                    <ChakraImage src={trainee.photo} w='100%' h='100%' alt='trainee_picture' />
                                                                </Box>
                                                            </Box>
                                                            <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                                                {(() => {
                                                                    const ins = allInstructors?.find((i) => i.name === 'MA. JOSEFA T. ALONSAGAY')
                                                                    const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                                                    return(
                                                                        <>
                                                                            <Box position='absolute' top='-45px' left='-8%' transform="translateX(5%)" zIndex={2} >
                                                                                <ChakraImage src={eSignSrc} w='100%' h='100%' alt='signature' />
                                                                            </Box>
                                                                            <Box borderTop='1px solid black' w='90%' />
                                                                            <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='10pt' fontWeight='bold'>
                                                                                {(() => {
                                                                                    if (!ins) return 'No Instructor';
                                                                                    return `${ins.rank} ${ins.name}`;
                                                                                })()}
                                                                            </Text>
                                                                            <Text fontSize='10pt'>President</Text>
                                                                        </>
                                                                    )
                                                                })()}
                                                            </Box>
                                                        </Box>
                                                        <Box pt='7' pb='10' display='flex' gap='1' justifyContent='center' alignItems='center' w='100%'>
                                                            <ChakraImage src={'/cert_ISO_Label.png'} alt='header image' w='1.49in'  objectFit='cover'/>
                                                            <Box w='0.9in' display='flex' justifyContent='center' alignItems='center' h='1.2in'>
                                                                <Box w='0.85in' h='0.85in'>
                                                                    <ChakraImage src={'/GenericQRCode.jpg'} alt='QR Code' w='100%'  objectFit='cover'/>
                                                                </Box>
                                                            </Box>
                                                            <Box fontWeight='bold' display='block' lineHeight={1.45} fontSize='9pt' ps='7' pr='7' py='3' borderLeft='1px solid black'>
                                                                <Text>Landline: (02) 8281-8155</Text>
                                                                <Text>Email: pentagonmaritimeservices@gmail.com</Text>
                                                                <Text>FB: pentagonmaritimeservicescorp</Text>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                <Box position='absolute' bottom='0' left='0' zIndex='1' w='100%' display='flex' justifyContent='center' alignItems='center'>
                                                    <ChakraImage  src={'/certificateFooter.png'} alt='header image' w='9in' h='2.25in'  objectFit='cover'/>
                                                </Box>
                                            </Box>
                                        </AccordionPanel>
                                    </AccordionItem>
                                )}})
                            }
                            </Accordion>
                        </>
                        )
                    })()}
                    <Box ref={componentRef} w='100%' placeItems='center' p='0' fontFamily='Arial'
                        sx={{display: 'none', '@media print': {display: 'block', fontFamily: 'Arial, Helvetica, sans-serif !important', WebkitPrintColorAdjust: 'exact', '*': {fontFamily: 'Arial, Helvetica, sans-serif !important'}}}}
                    >
                    {trainings?.filter((td) => td.batch === trainingBatch.id).filter((t) => {if(trainingID.length === 0) return true; return trainingID.includes(t.id)}).map((training: TRAINING_BY_ID, index: number) => {
                        const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
                        const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                        const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                        //const reg_id = allRegData?.find((reg) => 
                        const batchYear = courseBatch?.find((batch) => batch.id === training.batch)?.createdAt
                        const getYear = batchYear?.toDate().getFullYear()
                        const splitMonth = formatTrainingSchedule((training.end_date === '' ? training.start_date : training.end_date), getYear || 0).split(' ')[0]
                        const splitDay = formatTrainingSchedule((training.end_date === '' ? training.start_date : training.end_date), getYear || 0).split(' ')[1].replace(/\D/g, '')
                        const nthDay = getOrdinalHTML(Number(splitDay))
    
                        const trainingDate = training.numOfDays === 1 
                            ? formatTrainingSchedule(training.start_date, getYear || 0) 
                            : `${formatTrainingSchedule(training.start_date, getYear || 0)} to ${formatTrainingSchedule(training.end_date, getYear || 0)}`
    
                        if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                        ))
                        {return(
                        <>
                        <Box w='216mm' h='279mm' position='relative' display='flex' flexDir='column' p='0' justifyContent='center' alignItems='center' >
                            <Box pt='6' w='216mm' h='279mm' position='relative' zIndex={2} display='flex' fontSize='12pt' fontWeight='normal'  flexDir='column' alignItems='center'>
                                <ChakraImage src={'/certificateHeader.png'} alt='header image' w='7.05in' h='1.15in'  objectFit='cover'/>
                                <Box pt='5' pr='9' pb='0' display='flex' justifyContent='end' w='85%'>
                                    <Box fontWeight='bold' lineHeight='1.2' gap='0' display='block' fontSize='12pt' textAlign='start'>
                                        <Text>
                                            Certificate No. : 
                                            <Text as='span' fontWeight={'normal'}>
                                                {` ${training.cert_no}`}
                                            </Text>
                                        </Text>
                                        <Text>
                                            Registration No. : 
                                            <Text as='span' fontWeight={'normal'}>
                                                {` REG-${reg_num}`}
                                            </Text>
                                        </Text>
                                    </Box>
                                </Box>
                                <Box w='100%' h='85%' display='flex' flexDir='column' alignItems='center' justifyContent='center' gap='0'>
                                    <Text fontWeight='bold' fontSize='26pt'>Certificate of Completion</Text>
                                    <Text pt='8'>This Certificate is issued to</Text>
                                    <Text fontWeight='bold' fontSize='16pt' textTransform='uppercase'>{`${trainee.first_name} ${trainee.middle_name} ${trainee.last_name}`}</Text>
                                    <Text>for having successfully completed the training course in</Text>
                                    <Text fontSize='14pt' w='65%' mt='4' textAlign='center' fontWeight='bold'>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: `${training.certTitle}`
                                            }}
                                        />
                                    </Text>
                                    <Box w='85%' mt='3' textAlign='center' sx={{
                                        '& ul': {
                                            listStyleType: 'disc',
                                            listStylePosition: 'inside',
                                            paddingLeft: '1.5rem',
                                            margin: '0.5rem 0',
                                        },
                                        '& ol': {
                                            listStyleType: 'decimal',
                                            listStylePosition: 'inside',
                                            paddingLeft: '1.5rem',
                                            margin: '0.5rem 0',
                                        },
                                        '& li': {
                                            marginBottom: '0.25rem',
                                        },
                                        '& p, & div': {
                                            display: 'inline',
                                            lineHeight: '1.2',
                                            margin: 0,
                                        },
                                        '& br': {
                                            display: 'inline',
                                        },
                                    }}>
                                        <div style={{fontSize: '12pt', display: 'block', lineHeight: '1.2'}}
                                            dangerouslySetInnerHTML={{
                                                __html: `<span>Conducted on ${trainingDate} </span>${normalizeCertContent(training.certContent)}`
                                            }}
                                        />
                                    </Box>
                                    <div style={{marginTop: '40px'}}
                                        dangerouslySetInnerHTML={{
                                            __html: `Issued this ${nthDay} day of ${splitMonth}, ${getYear} in Manila City, Philippines`
                                        }}
                                    />
                                    <Box pt='12' pb='16' display='flex' alignItems='end' w='85%'>
                                        <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                            {(() => {
                                                const ins = allInstructors?.find((i) => i.name === 'ROGELIO C. MAHINAY')
                                                const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                                return(
                                                    <>
                                                        <Box position='absolute' top='-55px' left='5%' w='220px' h='110px' transform="translateX(-10%)" zIndex={2} >
                                                            <NextImage src={eSignSrc} fill priority style={{ objectFit: 'contain'}} alt='signature' />
                                                        </Box>
                                                        <Box borderTop='1px solid black' w='90%' /> 
                                                        <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='10pt' fontWeight='bolder'>
                                                            {(() => {
                                                                if (!ins) return 'No Instructor';
                                                                return `${ins.rank} ${ins.name}`;
                                                            })()}
                                                        </Text>
                                                        <Text fontSize='10pt'>Training Director</Text>
                                                    </>
                                                )
                                            })()}
                                        </Box>
                                        <Box w='50%' pb='9' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center'>
                                            <Box w='1.5in' h='1.5in' _hover={{cursor: 'pointer'}}>
                                                <ChakraImage src={trainee.photo} w='100%' h='100%' alt='trainee_picture' />
                                            </Box>
                                        </Box>
                                        <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                            {(() => {
                                                const ins = allInstructors?.find((i) => i.name === 'MA. JOSEFA T. ALONSAGAY')
                                                const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                                return(
                                                    <>
                                                        <Box position='absolute' top='-40px' left='-8%' transform="translateX(5%)" zIndex={2} >
                                                            <ChakraImage src={eSignSrc} w='100%' h='100%' alt='signature' />
                                                        </Box>
                                                        <Box borderTop='1px solid black' w='90%' />
                                                        <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='10pt' fontWeight='bolder'>
                                                            {(() => {
                                                                if (!ins) return 'No Instructor';
                                                                return `${ins.rank} ${ins.name}`;
                                                            })()}
                                                        </Text>
                                                        <Text fontSize='10pt'>President</Text>
                                                    </>
                                                )
                                            })()}
                                        </Box>
                                    </Box>
                                    <Box pt='0' pb='0' display='flex' gap='1' justifyContent='center' alignItems='center' w='100%'>
                                        <ChakraImage src={'/cert_ISO_Label.png'} alt='header image' w='1.39in' h='0.68in' objectFit='cover'/>
                                        <Box w='0.8in' display='flex' justifyContent='center' alignItems='center' h='0.65in'>
                                            <Box w='0.68in' h='0.7in'>
                                                <ChakraImage src={'/GenericQRCode.jpg'} alt='QR Code' w='100%'  objectFit='cover'/>
                                            </Box>
                                        </Box>
                                        <Box fontWeight='bold' display='block' lineHeight={1.35} fontSize='9pt' ps='7' pr='7' py='2' borderLeft='1px solid black'>
                                            <Text>Landline: (02) 8281-8155</Text>
                                            <Text>Email: pentagonmaritimeservices@gmail.com</Text>
                                            <Text>FB: pentagonmaritimeservicescorp</Text>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box position='absolute' bottom='0px' left='0' zIndex='1' w='100%' display='flex' justifyContent='center' alignItems='center'>
                                <ChakraImage  src={'/certificateFooter.png'} alt='header image' w='9in' h='2.15in'  objectFit='cover'/>
                            </Box>
                        </Box>
                        </>
                        )}})
                    }
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenModal} onClose={handleCloseMod} scrollBehavior='inside' size='xl' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader pb={0} >{`Edit Trainee Image`}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pt={0}>
                    <Box className='flex-col p-2 space-y-3 items-center justify-center'>
                        <Box w='100%' className='flex items-end justify-end'>
                            <Button size='sm' variant='ghost' onClick={() => fileInputRef.current?.click()} leftIcon={<EditIcon size='20' color='#a1a1a1' />} >Change Image</Button>
                            <input ref={fileInputRef} onChange={handleImgFile}  type='file' accept='image/png, image/jpeg' style={{display: 'none'}} />
                        </Box>
                        <Box className='image-container w-full p-1 relative flex justify-center items-center rounded border outline-0 shadow-lg'>
                        {attachmentFile !== '' ? (
                            preview === null ? (
                                // <Image src={trainee.photo} w='100%' h='100%' alt='trainee_picture' />
                                <ChakraImage src={attachmentFile} w='80%' h='100%' alt={`Edit Trainee Image`}/>
                            ) : (
                                <ChakraImage src={preview} w='80%' h='100%' alt={filename}/>
                            )
                        ) : (
                            <Text className='text-gray-400 absolute text-lg'>{filename}</Text>
                        )}
                        </Box>
                        <Box className='flex space-x-4'>
                            <Button onClick={handleUploadImg} isLoading={loading} loadingText='Uploading...' isDisabled={preview === null} colorScheme='green' w='100%'>Upload Image</Button>
                            <Button onClick={handleDownload} isDisabled={preview !== null} colorScheme='blue' w='100%'>Download Image</Button>
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenViewCount} onClose={onCloseViewCount} scrollBehavior='inside' size='sm' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader pb={0} >{`Change View Count`}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pt={0} display='flex' flexDir='column' gap='3'>
                    <FormControl >
                        <FormLabel>Set View Count:</FormLabel>
                        <Input onChange={(e) => setViewCount(Number(e.target.value))} placeholder='Input view count here...' type='number'/>
                    </FormControl>
                    <Button colorScheme='blue' bgColor='blue.700' w='100%' shadow='md' onClick={() => {handleViewCert('viewCount', view_count); onCloseViewCount();}}>Update</Button>
                </ModalBody>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenView} onClose={onCloseView} scrollBehavior='inside' size='lg' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader pb={0} >{`Trainee can Re-View Certificate`}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pt={0} display='flex' flexDir='column' gap='3'>
                    <FormControl>
                        <FormLabel fontWeight='normal' py='2' textAlign='center'>Are you sure you want to give this trainee a change to view their certificate again?</FormLabel>
                    </FormControl>
                    <Button colorScheme='blue' bgColor='blue.700' w='100%' shadow='md' onClick={() => {handleViewCert('hasView', 0); onCloseView();}}>Approve</Button>
                </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )
}