'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
    Box, Image, Text, Input, Button, Center, Spinner, 
    Checkbox, Select, Tooltip, FormControl, FormLabel,
    Menu, MenuButton, MenuList, MenuItem,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalBody, ModalFooter, ModalCloseButton,
    InputGroup, InputLeftAddon, Accordion, AccordionItem, AccordionButton,
    AccordionPanel, AccordionIcon, useDisclosure, useToast,
} from '@chakra-ui/react'

import { ArrowBackIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { FiBold, FiItalic, FiList, FiAlignLeft, FiAlignCenter } from 'react-icons/fi'
import { MdOutlineFormatListNumbered } from 'react-icons/md'
import { SearchIcon } from '@/Components/Icons'

import { useCertification } from '@/context/CertificationContext'
import { useRank } from '@/context/RankContext'
import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useInstructors } from '@/context/InstructorContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'

import { TRAINING_BY_ID } from '@/types/trainees'
import { CourseBatchByID, initCourseBatch } from '@/types/course-batches'
import { CoursesById } from '@/types/courses'
import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { CERTIFICATION_BY_ID, CERTIFICATION, certVersion } from '@/types/certification'

import { handleCertStatus } from '@/handlers/trainee_handler'
import { certBackgroundColor } from '@/handlers/util_handler'

import { SAVED_CERT_TEMPLATE } from '@/lib/certification_controller'
import { UPDATE_TRAINING } from '@/lib/trainee_controller'
import { Timestamp } from 'firebase/firestore';

import { useReactToPrint } from 'react-to-print'

interface BatchedDatedProps {
    searchTerm: string;
    trainings: TRAINING_BY_ID[];
    trainingIDs: string[];
    setTrainingIDs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function BatchCertificates({ searchTerm, trainings, trainingIDs, setTrainingIDs }: BatchedDatedProps){
    const toast = useToast()
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

    const [t_date, setTDate] = useState<Timestamp | undefined>(Timestamp.now())
    const [remarks, setRemarks] = useState<string>('')
    const [courseName, setCourseName] = useState<string>('')
    const [t_id, setID] = useState<string>('')
    const [ trainingBatch, setTrainingBatch ] = useState<CourseBatchByID>(initCourseBatch)

    const { isOpen: isOpenRemarks, onOpen: onOpenRemarks, onClose: onCloseRemarks } = useDisclosure()
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
    const { isOpen: isOpenCert, onOpen: onOpenCert, onClose: onCloseCert } = useDisclosure()
    
    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${courseName}.pdf`,
        onBeforePrint: () => handleToast('Preparing to print certificates...', ``, 3000, 'info'),
        onAfterPrint: () => {handleToast('Printing Certificates!', ``, 3000, 'success'); onCloseRemarks()},
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

    const formatTrainingDate = (endDate?: string, startDate?: string) => {
        const dateStr = endDate || startDate
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return '-'
        // Add 1 day
        date.setDate(date.getDate())
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
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
        span.style.display = 'inline-block'
        span.style.textAlign = div.style.textAlign || 'center'
        span.style.lineHeight = '0.1'

        div.replaceWith(span)
    })

    return temp.innerHTML
}

    return(
    <>
    <Box h='750px' style={{maxHeight: '800px', overflowY: 'auto', scrollbarWidth: 'thin'}} >
        {/** Headers */}
        <Box w='1750px' bgColor='blue.700' position='sticky' top='0' zIndex='9' mb='2' color='white' display='flex' textAlign='center' className='space-x-3' alignItems='center' borderRadius='5px' borderColor='gray' borderWidth='1px' borderStyle='solid' p='2'>
            <Text w='30px'>#</Text>
            <Text w='90px'>Date Graduated</Text>
            <Text w='50px'>Batch</Text>
            <Text w='200px'>Certificate No.</Text>
            <Text w='350px'>Trainee Name</Text>
            <Text w='80px'>Course</Text>
            <Text w='120px'>Date Released</Text>
            <Text w='100px'>Charge</Text>
            <Text w='160px'>Status</Text>
            <Text w='200px'>Company</Text>
            <Text w='150px'>Crewing</Text>
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
                //const reg_id = allRegData?.find((reg) => 
                const trainingMode = courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `${courseBatch.find((batch) => batch.id === training.batch)?.training_mode}` : ''

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
                        <Text w="100px" >{formatTrainingDate(training.end_date, training.start_date)}</Text>                                                                             
                        <Text w="50px" onClick={() => {
                            const foundBatch = courseBatch?.find((cb) => cb.id === training.batch)
                            const foundCourse = allCourses?.find((course) => course.id === foundBatch?.course)?.course_name
                            if (foundBatch && foundCourse) {
                                setCourseName(foundCourse.toUpperCase());
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
                        <Text w="80px">
                            {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                        </Text> 
                        <Text w="120px" _hover={{ cursor: 'pointer'}} onClick={() => {training.cert_status !== 0 && onOpenEdit(); setID(training.id); setTDate(training.cert_released);}} >{(training.cert_status !== 0 ? parsingTimestamp(training.cert_released).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric', year: 'numeric'}) : '')}</Text>  
                        <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                        <Box w='160px' display='flex' gap='2'>
                            <Select 
                                bgColor={certBackgroundColor(training.cert_status)} 
                                onChange={(e) => handleStatus(training.id, Number(e.target.value))} 
                                borderRadius='5px' size='xs' shadow='md' >
                                <option value={0} hidden>{handleCertStatus(training.cert_status)}</option>
                                <option value={0}>PENDING</option>
                                <option value={1}>RELEASED</option>
                            </Select>
                        </Box>
                        <Tooltip className='text-center' aria-label='tooltip' label={allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}>
                            <Text w="200px" noOfLines={1} className='text-wrap'>
                                {allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}
                            </Text>    
                        </Tooltip>
                        <Tooltip className='text-center uppercase' aria-label='tooltip' label={trainee.endorser}>
                            <Text w="150px" noOfLines={1} className='text-wrap uppercase' >{trainee.endorser}</Text>    
                        </Tooltip>                                      
                    </Box>
                )
            }
        }))}
        </Box>
    </Box>
    <Modal size='5xl' closeOnOverlayClick={false} scrollBehavior='inside' isOpen={isOpenCert} onClose={() => {setTrainingBatch(initCourseBatch); onCloseCert();}}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{`Batch: ${trainingBatch.batch_no} ${courseName}`}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Box mt='6' borderTop='1px solid black' py='4' w='100%' display='flex' justifyContent='space-between' alignItems='center'>
                    <Button onClick={handlePrint} bgColor='#1C437E' colorScheme='blue' loadingText='Printing...' shadow='md'>Print Certificates</Button>
                </Box>
                <Accordion allowMultiple>
                {trainings?.filter((td) => td.batch === trainingBatch.id).map((training: TRAINING_BY_ID, index: number) => {
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
                            <AccordionButton fontSize='sm'>
                                <Text w="30px" textAlign='center'>{`${(index + 1)}.`}</Text>                                                                             
                                <Text w="200px" _hover={{color: 'blue.700'}} onClick={() => {
                                    // setRegNum(reg_id); 
                                    // onOpenReg();
                                    }} className='hover:cursor-pointer'>
                                    {`${training.cert_no}`}
                                </Text>                                   
                                <Text w="350px">{`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''} ${trainee.suffix || ''}`}</Text>                                        
                                <Text w="120px" _hover={{ cursor: 'pointer'}} onClick={() => {training.cert_status !== 0 && onOpenEdit(); setID(training.id); setTDate(training.cert_released);}} >{(training.cert_status !== 0 ? parsingTimestamp(training.cert_released).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric', year: 'numeric'}) : '')}</Text>  
                                <Text w="100px" >{training.accountType === 0 ? 'TRAINEE' : 'COMPANY'}</Text>  
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel px='10' py='5'>
                                <Box position='relative' display='flex' flexDir='column' justifyContent='center' alignItems='center' >
                                    <Box w='90%' position='relative' zIndex={2} display='flex' fontSize='12pt' fontWeight='normal' fontFamily='Arial' flexDir='column' alignItems='center' px='4' pt='8'>
                                        <Image src={'/certificateHeader.png'} alt='header image' w='7.25in' h='1.20in'  objectFit='cover'/>
                                        <Box pt='12' pr='5' pb='5' display='flex' justifyContent='end' w='85%'>
                                            <Box fontWeight='bold' fontSize='12pt' textAlign='start'>
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
                                        <Box w='100%' display='flex' flexDir='column' alignItems='center' justifyContent='center' gap='3'>
                                            <Text fontWeight='bold' fontSize='26pt'>Certificate of Completion</Text>
                                            <Text >This Certificate is issued to</Text>
                                            <Text fontWeight='bold' fontSize='16pt'>{`${trainee.first_name} ${trainee.middle_name} ${trainee.last_name}`}</Text>
                                            <Text>for having successfully completed the training course in</Text>
                                            <Text fontSize='14pt' fontWeight='bold'>{training.certTitle.toUpperCase()}</Text>
                                            {/* <Box w='85%' textAlign='center' sx={{
                                                '& p, & div': {
                                                    display: 'inline',
                                                    margin: 0,
                                                },
                                                '& br': {
                                                    display: 'inline',
                                                },
                                            }}> */}
                                                <div style={{width: '85%', fontSize: '12pt', display: 'block', lineHeight: 0.5}}
                                                    dangerouslySetInnerHTML={{
                                                        __html: `<span>Conducted on ${trainingDate}</span>${normalizeCertContent(training.certContent)}`
                                                    }}
                                                />
                                            {/* </Box> */}
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: `Issued this ${nthDay} day of ${splitMonth}, ${getYear} in Manila City, Philippines`
                                                }}
                                            />
                                            <Box pt='8' display='flex' gap='4' alignItems='end' justifyContent='space-between' w='100%'>
                                                <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                                    {(() => {
                                                        const ins = allInstructors?.find((i) => i.name === 'ROGELIO C. MAHINAY')
                                                        const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                                        return(
                                                            <>
                                                                <Box position='absolute' top='-50px' left='20%' transform="translateX(-10%)" zIndex={2} >
                                                                    <Image src={eSignSrc} w='100%' h='100%' alt='signature' />
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
                                                    <Box w='1.5in' h='1.5in' _hover={{cursor: 'pointer'}}>
                                                        <Image src={trainee.photo} w='100%' h='100%' alt='trainee_picture' />
                                                    </Box>
                                                </Box>
                                                <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                                    {(() => {
                                                        const ins = allInstructors?.find((i) => i.name === 'MA. JOSEFA T. ALONSAGAY')
                                                        const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                                        return(
                                                            <>
                                                                <Box position='absolute' top='-45px' left='-8%' transform="translateX(5%)" zIndex={2} >
                                                                    <Image src={eSignSrc} w='100%' h='100%' alt='signature' />
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
                                                <Image src={'/cert_ISO_Label.png'} alt='header image' w='1.49in'  objectFit='cover'/>
                                                <Box w='0.9in' display='flex' justifyContent='center' alignItems='center' h='1.2in'>
                                                    <Box w='0.85in' h='0.85in'>
                                                        <Image src={'/GenericQRCode.jpg'} alt='QR Code' w='100%'  objectFit='cover'/>
                                                    </Box>
                                                </Box>
                                                <Box fontWeight='bold' fontSize='9pt' ps='7' pr='7' py='3' borderLeft='1px solid black'>
                                                    <Text>Landline: (02) 8281-8155</Text>
                                                    <Text>Email: pentagonmaritimeservices@gmail.com</Text>
                                                    <Text>FB: pentagonmaritimeservicescorp</Text>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box position='absolute' bottom='0' left='0' zIndex='1' w='100%' display='flex' justifyContent='center' alignItems='center'>
                                        <Image  src={'/certificateFooter.png'} alt='header image' w='9in' h='2.25in'  objectFit='cover'/>
                                    </Box>
                                </Box>
                            </AccordionPanel>
                        </AccordionItem>
                    )}})
                }
                </Accordion>
                <Box ref={componentRef} w='100%' sx={{display: 'none', '@media print': {display: 'block'}}}>
                {trainings?.filter((td) => td.batch === trainingBatch.id).map((training: TRAINING_BY_ID, index: number) => {
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
                    <Box position='relative' display='flex' flexDir='column' justifyContent='center' alignItems='center' >
                        <Box w='100%' position='relative' zIndex={2} display='flex' fontSize='12pt' fontWeight='normal'  flexDir='column' alignItems='center' px='4' pt='8'>
                            <Image src={'/certificateHeader.png'} alt='header image' w='7.25in' h='1.20in'  objectFit='cover'/>
                            <Box pt='12' pr='0' pb='5' display='flex' justifyContent='end' w='85%'>
                                <Box fontWeight='bold' fontSize='12pt' textAlign='start'>
                                    <Text>
                                        Certificate No.:  
                                        <Text as='span'  fontWeight={'normal'}>
                                            {` ${training.cert_no}`}
                                        </Text>
                                    </Text>
                                    <Text>
                                        Registration No.: 
                                        <Text as='span' fontWeight={'normal'}>
                                            {` REG-${reg_num}`}
                                        </Text>
                                    </Text>
                                </Box>
                            </Box>
                            <Box w='100%' display='flex' flexDir='column' alignItems='center' justifyContent='center' gap='3'>
                                <Text fontWeight='bold' fontSize='26pt'>Certificate of Completion</Text>
                                <Text >This Certificate is issued to</Text>
                                <Text fontWeight='bold' fontSize='16pt'>{`${trainee.first_name} ${trainee.middle_name} ${trainee.last_name}`}</Text>
                                <Text>for having successfully completed the training course in</Text>
                                <Text fontSize='14pt' fontWeight='bold'>{training.certTitle.toUpperCase()}</Text>
                                <Box w='85%' textAlign='center' sx={{
                                    '& p, & div': {
                                        display: 'inline',
                                        margin: 0,
                                    },
                                    '& br': {
                                        display: 'inline',
                                    },
                                }}>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: `Conducted on ${trainingDate} ${training.certContent}`
                                        }}
                                    />
                                </Box>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: `Issued this ${nthDay} day of ${splitMonth}, ${getYear} in Manila City, Philippines`
                                    }}
                                />
                                <Box pt='8' display='flex' gap='4' alignItems='end' justifyContent='space-between' w='100%'>
                                    <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                        {(() => {
                                            const ins = allInstructors?.find((i) => i.name === 'ROGELIO C. MAHINAY')
                                            const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                            return(
                                                <>
                                                    <Box position='absolute' top='-50px' left='20%' transform="translateX(-10%)" zIndex={2} >
                                                        <Image src={eSignSrc} w='100%' h='100%' alt='signature' />
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
                                        <Box w='1.5in' h='1.5in' _hover={{cursor: 'pointer'}}>
                                            <Image src={trainee.photo} w='100%' h='100%' alt='trainee_picture' />
                                        </Box>
                                    </Box>
                                    <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                        {(() => {
                                            const ins = allInstructors?.find((i) => i.name === 'MA. JOSEFA T. ALONSAGAY')
                                            const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                            return(
                                                <>
                                                    <Box position='absolute' top='-45px' left='-8%' transform="translateX(5%)" zIndex={2} >
                                                        <Image src={eSignSrc} w='100%' h='100%' alt='signature' />
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
                                    <Image src={'/cert_ISO_Label.png'} alt='header image' w='1.49in'  objectFit='cover'/>
                                    <Box w='0.9in' display='flex' justifyContent='center' alignItems='center' h='1.2in'>
                                        <Box w='0.85in' h='0.85in'>
                                            <Image src={'/GenericQRCode.jpg'} alt='QR Code' w='100%'  objectFit='cover'/>
                                        </Box>
                                    </Box>
                                    <Box fontWeight='bold' fontSize='9pt' ps='7' pr='7' py='3' borderLeft='1px solid black'>
                                        <Text>Landline: (02) 8281-8155</Text>
                                        <Text>Email: pentagonmaritimeservices@gmail.com</Text>
                                        <Text>FB: pentagonmaritimeservicescorp</Text>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box position='absolute' bottom='0' left='0' zIndex='1' w='100%' display='flex' justifyContent='center' alignItems='center'>
                            <Image  src={'/certificateFooter.png'} alt='header image' w='9in' h='2.25in'  objectFit='cover'/>
                        </Box>
                    </Box>
                    </>
                    )}})
                }
                </Box>
            </ModalBody>
        </ModalContent>
    </Modal>
    </>
    )
}