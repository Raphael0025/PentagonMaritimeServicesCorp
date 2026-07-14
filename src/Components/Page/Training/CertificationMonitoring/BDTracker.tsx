'use client'

import NextImage from 'next/image'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Box, Image as ChakraImage, Text, Textarea, InputGroup, Switch, InputLeftAddon, Spinner, Center, Button, Tooltip, Checkbox, Select, Input, 
FormControl, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, Menu, MenuList, MenuItem, MenuButton, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, 
Accordion, AccordionButton, AccordionIcon, IconButton, AccordionItem, AccordionPanel, FormLabel, ButtonGroup,
Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, 
} from '@chakra-ui/react';
import { ArrowBackIcon, RepeatIcon, AddIcon, MinusIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { SearchIcon, PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons';

import { writeBatch, doc, setDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { TRAINING_BY_ID } from '@/types/trainees'
import { CERTIFICATION_BY_ID, CERTIFICATION, certVersion } from '@/types/certification'

import { InHouseCert } from '@/Components/Page/Training/CertificationMonitoring'

import { CourseBatchByID, initCourseBatch } from '@/types/course-batches'

import { deployYDate } from '@/types/utils' 
import { fullMonth, } from '@/handlers/util_handler'
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
import { useTraining } from '@/context/TrainingContext'
import { useCertification } from '@/context/CertificationContext'

import { CERTIFICATION_REPORT_BY_ID } from '@/types/certification'

import { GET_CERT_REPORT_BY_YEAR, UPDATE_CERT_MONTHLY_METRIC, certificateReportController } from '@/lib/certification_controller'
import { GENERATE_BD_BATCH, UPDATE_BD_BATCH } from '@/lib/course_batches_controller'
import { UPDATE_TRAINING, UPDATE_TRAINEE_PARTIAL, changeImg } from '@/lib/trainee_controller'
import { useReactToPrint } from 'react-to-print'
import { EditIcon } from '@/Components/Icons'

import { getDownloadURL, ref, getStorage  } from "firebase/storage";

export default function BDTrackerCertification (){
    const toast = useToast()
    const storage = getStorage();
    const { data: allCertTemplates } = useCertification()
    const { data: allRanks } = useRank()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch, bdData: bdBatches } = useCourseBatch()
    const { data: allInstructors } = useInstructors()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allRegData, setMonth: setRMonth, setYear: setRYear } = useRegistrations()
    const { data: allTrainingData, setMonth: setTMonth, setYear: setTYear } = useTraining()

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

    const [cat, setCat] = useState<string>('')
    const [category, setCategory] = useState('')
    const [last_name, setLN] = useState<string>('')
    const [first_name, setFN] = useState<string>('')
    const [courseID, setCourseID] = useState<string>('')
    const [attachmentType, setAT] = useState<string>('')
    const [training_id, setTraining_ID] = useState<string>('')
    const [traineeDocID, setTraineeDocID] = useState<string>('')
    const [attachmentFile, setAttachment] = useState<string>('')
    const [closeBlur, setCloseBlur] = useState<boolean>(false)
    const [isPrinting, setIsPrinting] = useState<boolean>(true)
    const [view_count, setViewCount] = useState<number>(0)
    const [trainingID, setSelectedTrainingID] = useState<string[]>([])
    const [selectedTrainings, setSelectedTrainings] = useState<TRAINING_BY_ID[]>([])

    const [filterStatus, setStatus] = useState<string>('')
    const [filterCourse, setCFilter] = useState<string>('')
    const [filterCharge, setChargeType] = useState<string>('')
    const [filterCompany, setCompanyFilter] = useState<string>('')
    const [filterRecency, setRecencyFilter] = useState<string>('')

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())
    const [editingId, setEditingId] = useState<string | null>(null);

    // Controlled states for preview & saving
    const [certTitleHtml, setCertTitleHtml] = useState('')
    const [certContentHtml, setCertContentHtml] = useState('')
    const [versionNumber, setVersionNumber] = useState<string>('')

    const [searchTerm, setSearch] = useState<string>('')
    const [allTData, setAllTData] = useState<any[]>([])
    const [t_ids, setIDS] = useState<string[]>([])
    const [firstSelected, setFirstSelected] = useState<boolean>(false)
    const [traineeName, setTraineeName] = useState<{id: string, last_name: string, first_name: string, middle_name: string}>({id: '', last_name: '', first_name: '', middle_name: ''})

    const [totalTraineeC, setTraineeCharge] = useState<number>(0)
    const [totalCompanyC, setCompanyCharge] = useState<number>(0)
    const [releasedCerts, setReleasedCerts] = useState<number>(0)
    const [pendingCerts, setPendingCerts] = useState<number>(0)
    const [unClaimed, setUnclaimed] = useState<number>(0)
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1); // 1 = 100%

    const [selectedReport, setSelectedReport] = useState<CERTIFICATION_REPORT_BY_ID | null>(null)
    const [selectedDatedReport, setSelectedDatedReport] = useState<CERTIFICATION_REPORT_BY_ID | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    
    const { isOpen: isOpenReport, onOpen: onOpenReport, onClose: onCloseReport } = useDisclosure()
    const { isOpen: isOpenRemarks, onOpen: onOpenRemarks, onClose: onCloseRemarks } = useDisclosure()
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
    const { isOpen: isOpenCert, onOpen: onOpenCert, onClose: onCloseCert } = useDisclosure()
    const { isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
    const { isOpen: isOpenViewCount, onOpen: onOpenViewCount, onClose: onCloseViewCount } = useDisclosure()
    const { isOpen: isOpenView, onOpen: onOpenView, onClose: onCloseView } = useDisclosure()
    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()
    const { isOpen: isOpenBDCert, onOpen: onOpenBDCert, onClose: onCloseBDCert } = useDisclosure()

    const reportRef = useRef<HTMLDivElement | null>(null)
    const componentRef = useRef<HTMLDivElement | null>(null)
    const attachment = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handlePrintReport = useReactToPrint({
        content: () => reportRef.current,
        documentTitle: `CertificationReport.pdf`,
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
            handleToast('Preparing to print certificates...', ``, 3000, 'info');
        },
        onAfterPrint: () => {
            handleToast('Certificates Printed!', ``, 3000, 'success');
        },
    })

    useEffect(() => {
        const fetchData = () => {
            setLoading(true)

            const allTrainData = allTrainingData && allTrainingData.filter((t) => t.regType === 1)
            .filter(t => {
                const enrolledDate = t.date_enrolled.toDate();
                return enrolledDate.getFullYear() === yearSelected && enrolledDate.getMonth() === monthSelected;
            })
            .sort((a, b) => {
                // ---------- 1️⃣ SORT DATE ENDORSED ----------
                const dateA = a.date_enrolled.toMillis()
                const dateB = b.date_enrolled.toMillis()

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
            .filter((t) => [3, 4, 5, 6, 9].includes(t.reg_status))
            .filter((t) => {
                if(!filterCharge) return true
                return t.accountType.toString() === filterCharge
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
            .filter((t) => { 
                if(filterStatus === '') return true
                return t.cert_status === Number(filterStatus) 
            })
            .filter((f) => {
                if(!filterRecency) return true
                const recency = getRelativeDate(f.end_date, f.start_date)
                return recency.toLowerCase() === filterRecency.toLowerCase()
            })

            if(!allTrainData) return
            
            const filteredTrainingData: TRAINING_BY_ID[] = allTrainData || []
            const traineeChargeCount = filteredTrainingData?.filter(t => t.accountType === 0).length
            const companyChargeCount = filteredTrainingData?.filter(t => t.accountType === 1).length
            const ttlReleased = filteredTrainingData?.filter(t => t.cert_status === 2).length
            const ttlUnClaimed = filteredTrainingData?.filter(t => t.cert_status === 1).length
            const ttlPending = filteredTrainingData?.filter(t => t.cert_status === 0).length

            // 3️⃣ Set the states
            setAllTData(allTrainData ?? []);

            setTraineeCharge(traineeChargeCount)
            setCompanyCharge(companyChargeCount)
            setReleasedCerts(ttlReleased)
            setPendingCerts(ttlPending)
            setUnclaimed(ttlUnClaimed)
            setLoading(false)
        }
        fetchData()
    },[monthSelected, yearSelected, allTrainingData, filterCharge, filterCourse, filterStatus, filterRecency, filterCompany])

    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear()
    const startYear = parseInt(deployYDate, 10)

    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i)

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
            .filter((c: CERTIFICATION_BY_ID) =>{
                const course_id = allCourses?.find((course) => course.id === courseID)?.id || courseCodes?.find((course) => course.id === courseID)?.id_course_ref || ''
                return c.courseID === course_id && (category ? c.category === category : true)
            })
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
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const token = localStorage.getItem('customeToken') || '';
                    // 1. Run all database updates in parallel and wait for them to finish
                    await Promise.all(
                        trainingID.map((id) =>
                            UPDATE_TRAINING(
                                id,
                                {
                                    certTitle: certTitleHtml,
                                    certContent: certContentHtml,
                                    cert_version: versionNumber,
                                },
                                token
                            )
                        )
                    )
                    // 2. Update the local state ONCE for all affected IDs
                    setSelectedTrainings((prev) =>
                        prev.map((t) => {
                            if (trainingID.includes(t.id)) {
                                return {
                                    ...t,
                                    certTitle: certTitleHtml,
                                    certContent: certContentHtml,
                                    cert_version: versionNumber,
                                };
                            }
                            return t;
                        })
                    )
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
        const token = localStorage.getItem('customToken') || '';
        // 1. Wait for all database updates to finish
        await Promise.all(
            trainingID.map(async (training_id) => {
                // Find current count from the source data
                const currentCount = allTData.find((tr) => tr.id === training_id)?.printCount || 0;
                
                return UPDATE_TRAINING(
                    training_id,
                    {
                        printCount: currentCount + 1,
                        cert_status: 1,
                        isUrgent: false,
                    },
                    token
                );
            })
        )
        // 2. Update selectedTrainings state once
        setSelectedTrainings((prev) =>
            prev.map((t) => {
                if (trainingID.includes(t.id)) {
                    return {
                        ...t,
                        printCount: (t.printCount || 0) + 1,
                        cert_status: 1,
                        isUrgent: false,
                    };
                }
                return t;
            })
        );
        // 3. Reset selection and trigger print UI
        setSelectedTrainingID([]);
        setIsPrinting(true);
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
        if (!dateStr) return '';

        // Create a map for the month abbreviations
        const monthMap: { [key: string]: string } = {
            // Standard Keys
            Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
            May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
            Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
            
            // All-Caps Keys
            JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April',
            MAY: 'May', JUN: 'June', JUL: 'July', AUG: 'August',
            SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December'
        }

        // 1. Remove commas and split by space
        // "Tue, Apr 07" becomes ["Tue", "Apr", "07"]
        const parts = dateStr.replace(',', '').split(' ');

        const monthAbbr = parts[1]; // "Apr"
        const day = parseInt(parts[2], 10); // "07" -> 7 (removes leading zero)

        const fullMonth = monthMap[monthAbbr] || monthAbbr;

        return `${fullMonth} ${day}, ${year}`; 
    };

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
        if (Array.isArray(openIndexes) && openIndexes.length === allTData.length) {
            setOpenIndexes([]) // All open → close all
        } else {
            setOpenIndexes(allTData.map((_, index) => index)) // Open all
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

    const handleData = () => {
        setTMonth(monthSelected + 1) 
        setTYear(yearSelected)
        setRMonth(monthSelected + 1) 
        setRYear(yearSelected)
        onCloseDate()
    }

    const handleConductedOnline = async () => {
        // 1. Ensure all database updates finish
        await Promise.all(
            trainingID.map(async (training_id) => {
                const currentTraining = allTData?.find(t => t.id === training_id);
                const newValue = !currentTraining?.conductedOnline;
                
                return UPDATE_TRAINING(training_id, { conductedOnline: newValue }, '');
            })
        );

        // 2. Update the local state for all selected items
        setSelectedTrainings((prev) =>
            prev.map((t) => {
                if (trainingID.includes(t.id)) {
                    return {
                        ...t,
                        // Toggle the value locally
                        conductedOnline: !t.conductedOnline 
                    };
                }
                return t;
            })
        );
        
        // Optional: Clear selection after toggling if that's your workflow
        // setSelectedTrainingID([]);
    }

    const lockedCourseID = useMemo(() => {
        if (!trainingID || trainingID.length === 0) return null
        const firstCourseID = allTData.find((t) => t.id === trainingID[0])
        return firstCourseID?.course || null
    }, [trainingID, allTData])
    
    const generateCertForSelected = () => {
        return new Promise(async (resolve, reject) => {
            try {
                setLoading(true)

                if (!selectedTrainings.length) {
                    console.warn("No trainings selected.")
                    setLoading(false)
                    return resolve(null)
                }

                const course = allCourses?.find((course) => course.id === courseID)?.id || courseCodes?.find((course) => course.id === courseID)?.id_course_ref || null
                if (!course) {
                    console.warn("Course not found.")
                    setLoading(false)
                    return resolve(null)
                }

                const currentYear = new Date().getFullYear()
                const regMap = new Map(allRegData?.map(reg => [reg.id, reg]) ?? [])

                const foundCert = certificates.find((c: CERTIFICATION_BY_ID) => c.courseID === course && c.category === 'generic')
                const activeVersion = foundCert?.versions.find(v => v.status === 'active')
                
                if (!activeVersion) {
                    console.warn("No active certificate version found for this course.")
                    handleToast('Warning!', `No active certificate version found for this course.`, 5000, 'warning')
                    setLoading(false)
                    return resolve(null)
                }

                const sortedSelected = [...selectedTrainings].sort((a, b) => {
                    const regA = regMap.get(a.reg_ref_id)?.reg_no ?? ''
                    const regB = regMap.get(b.reg_ref_id)?.reg_no ?? ''
                    return regA.localeCompare(regB, undefined, { numeric: true, sensitivity: 'base' })
                })

                const actor = localStorage.getItem('customToken')

                // 🔹 Wrap in setTimeout to simulate completion
                setTimeout(async () => {
                    try {
                        const generated = await Promise.all(sortedSelected.map(async training => {
                            const regNo = regMap.get(training.reg_ref_id)?.reg_no ?? 'UNKNOWN';
                        
                            const updateData = {
                                reg_status: 6,
                                certTitle: activeVersion.certTitleHtml,
                                certContent: activeVersion.certContentHtml,
                                cert_version: activeVersion.version_number
                            };
                        
                            await UPDATE_TRAINING(training.id, updateData, actor);
                        
                            // FIX 1: Return the ID and the new updateData so 'generated' has the values
                            return {
                                id: training.id, // Ensure this is called 'id' to match your .find() logic
                                ...updateData
                            };
                        }));
                        
                        setSelectedTrainings(prev => 
                            prev.map(t => {
                                // Find the matching update by ID
                                const updated = generated.find(g => g.id === t.id);
                                
                                // FIX 2: If found, SPREAD 't' first to keep all 41+ properties, 
                                // then overwrite with 'updated' values.
                                if (updated) {
                                    return { 
                                        ...t, 
                                        ...updated,
                                        year: currentYear.toString() // Add the year property here
                                    };
                                }
                                
                                return t;
                            })
                        )
                        setLoading(false)
                        onOpenCert()
                        resolve({
                            generatedCerts: generated
                        })
                    } catch (err) {
                        console.error("Error updating trainings:", err)
                        setLoading(false)
                        reject(err)
                    }
                }, 200) // Delay to simulate async processing
            } catch (error) {
                console.error("Error in generation:", error)
                setLoading(false)
                reject(error)
            }
        })
    }

    const handlePreviewCert = () => {
        setSelectedTrainings(prev => 
            prev.map(t => {
                return { 
                    ...t, 
                    year: currentYear.toString() // Add the year property here
                };
                
            })
        )
        onOpenCert()
    }

    const handleSaveCertNo = () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    selectedTrainings.map(async (training) => {
                        await UPDATE_TRAINING(training.id, { cert_no: training.cert_no }, actor)
                    })
                    res()
                }
                catch(error){
                    rej(error)
                }
            }, 50)
        }).then(() => {
            handleToast('Certificate Number Saved Successfully!', `The certificate number has been saved successfully.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
        })
    }

    const handleTraineeName = async () => {
        try{
            await UPDATE_TRAINEE_PARTIAL(traineeName)
            setTraineeName({id: '', last_name: '', first_name: '', middle_name: ''})
        }catch(error){
            console.error(error)
        }
    }

    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
    
    // Limits zoom between 1x and 3x
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 1));

    const handleViewReport = async () => {
        try {
            setIsLoading(true);
            
            const getYear = new Date().getFullYear();
            // 1. Attempt to fetch the report for the current year
            let report = await GET_CERT_REPORT_BY_YEAR(getYear, 'bd');
            let datedReport = await GET_CERT_REPORT_BY_YEAR(getYear, 'dated');
            
            // 🟢 2. If no record returns, create the initial empty document structure
            if (!report) {
                console.log(`No report found for ${getYear}. Creating initial record...`);
                
                // Generate a fresh new document reference inside your collection
                const newDocRef = doc(certificateReportController);
                const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                const emptyMonthStructure = { ttl_certs: 0, issued: 0, unClaimed: 0, pending: 0, note: "" };
                
                // Build out the baseline object structure
                const initialPayload: any = {
                    year: getYear,
                    type: 'bd', // Default fallback type
                };
                
                // Automatically initialize all 12 months with zeros so the table matrix doesn't crash
                monthKeys.forEach((month) => {
                    initialPayload[month] = emptyMonthStructure;
                });
                
                // Save the document to Firestore
                await setDoc(newDocRef, initialPayload);
                
                // Shape the object matching your CERTIFICATION_REPORT_BY_ID structure to feed the state
                report = {
                    id: newDocRef.id,
                    ...initialPayload
                } as CERTIFICATION_REPORT_BY_ID;
            }
            
            // 3. Save to state and pop the modal open
            setSelectedReport(report); 
            setSelectedDatedReport(datedReport); 
            onOpenReport();   
        } catch (error) {
            console.error("Error managing report viewing session:", error);
            alert("Something went wrong trying to initialize the report records.");
        } finally {
            setIsLoading(false);
        }
    }

    const MONTH_MAP: Array<{ key: keyof Omit<CERTIFICATION_REPORT_BY_ID, 'id' | 'year' | 'type'>; label: string }> = [
        { key: 'jan', label: 'January' },
        { key: 'feb', label: 'February' },
        { key: 'mar', label: 'March' },
        { key: 'apr', label: 'April' },
        { key: 'may', label: 'May' },
        { key: 'jun', label: 'June' },
        { key: 'jul', label: 'July' },
        { key: 'aug', label: 'August' },
        { key: 'sep', label: 'September' },
        { key: 'oct', label: 'October' },
        { key: 'nov', label: 'November' },
        { key: 'dec', label: 'December' },
    ]

    const getRowTotal = (fieldKey: 'ttl_certs' | 'issued' | 'pending' | 'unClaimed' | 'trainee' | 'company') => {
        return MONTH_MAP.reduce((sum, m) => {
            // Cast to 'any' to stop TypeScript from worrying about the 'string | MonthlyData' union type
            const monthData = selectedReport?.[m.key] as any; 
            return sum + (monthData?.[fieldKey] || 0);
        }, 0);
    }

    const getDatedRowTotal = (fieldKey: 'ttl_certs' | 'issued' | 'pending' | 'unClaimed' | 'trainee' | 'company') => {
        return MONTH_MAP.reduce((sum, m) => {
            // Cast to 'any' to stop TypeScript from worrying about the 'string | MonthlyData' union type
            const monthData = selectedDatedReport?.[m.key] as any; 
            return sum + (monthData?.[fieldKey] || 0);
        }, 0);
    }

    const handleMetricUpdate = async (
        monthKey: 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec',
        fieldKey: 'ttl_certs' | 'issued' | 'unClaimed' | 'pending' | 'note' | 'trainee' | 'company',
        newValue: number | string
    ) => {
        if (!selectedReport?.id) return;

        try {
            // 1. Update Firestore Database
            await UPDATE_CERT_MONTHLY_METRIC(selectedReport.id, monthKey, fieldKey, newValue);

            // 2. Update React State locally so the grid updates instantly
            setSelectedReport((prevReport) => {
                if (!prevReport) return null;
                return {
                    ...prevReport,
                    [monthKey]: {
                        ...prevReport[monthKey],
                        [fieldKey]: newValue
                    }
                };
            });
        } catch (error) {
            console.error("Failed to update report data:", error);
        }
    }

    return(
        <>
        <Text>BackDated Monitoring</Text>
        <Box display='flex' >
            <Box w='70%' mb='2' display='flex' justifyContent='end' flexDir='column' >
                <Box className="flex" w='100%' mb='2'>
                    <InputGroup w="100%" className="shadow-md rounded-lg">
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
                <Box w='100%' display='flex' >
                    <Select size='sm' mr='4' value={filterCourse} onChange={(e) => {setCFilter(e.target.value);}} shadow='md'>
                        <option hidden>Filter Course</option>
                        {allCourses && [...allCourses]
                        .sort((a, b) => a.course_code.localeCompare(b.course_code))
                        .map((c) => (
                            <option key={c.id} value={c.course_code}>{c.course_code.toUpperCase()}</option>
                        ))}
                    </Select>
                    <Select size='sm' mr='4' value={filterCharge} onChange={(e) => {setChargeType(e.target.value);}} shadow='md'>
                        <option hidden>Filter Charge</option>
                        <option value={"0"}>Crew</option>
                        <option value={"1"}>Company</option>
                    </Select>
                    <Select size='sm' mr='4' value={filterCompany} onChange={(e) => {setCompanyFilter(e.target.value);}} shadow='md'>
                        <option hidden>Filter Company</option>
                        {allClients && [...allClients]
                        .sort((a, b) => a.company.localeCompare(b.company))
                        .map((c) => (
                            <option key={c.id} value={c.id}>{c.company.toUpperCase()}</option>
                        ))}
                    </Select>
                    <Select size='sm' mr='4' value={filterStatus} onChange={(e) => {setStatus(e.target.value);}} shadow='md'>
                        <option hidden>Filter Status</option>
                        <option value={"0"}>PENDING</option>
                        <option value={"1"}>UNCLAIMED</option>
                        <option value={"2"}>RELEASED</option>
                    </Select>
                    <Select size='sm' mr='4' value={filterRecency} onChange={(e) => {setRecencyFilter(e.target.value);}} shadow='md'>
                        <option hidden>Filter Recency</option>
                        <option value='today'>Today</option>
                        <option value='yesterday'>Yesterday</option>
                        <option value='2 days ago'>2 days ago</option>
                        <option value='tomorrow'>Tomorrow</option>
                    </Select>
                    {(filterCourse || filterCompany || filterCharge || filterStatus || filterRecency) && (
                        <Button w='50%' mr={4} onClick={() => { setChargeType(''); setRecencyFilter(''); setCompanyFilter(''); setStatus(''); setCFilter('');}} colorScheme='red' size='sm' shadow='md'>Clear Filter</Button>
                    )}
                    <Button w='60%' mr={4} onClick={onOpenDate} rightIcon={<ChevronDownIcon />} size='sm' shadow='md'>Filter Date</Button>
                </Box>
                <Box display='flex' justifyContent='end' mt='4'>
                    {t_ids.length !== 0 && (
                        <>
                            <Button onClick={() => handleCertStatus(firstSelected ? 2 : 1)} isLoading={certLoading} loadingText='Updating Status...' colorScheme={firstSelected ? 'blue' : 'green'} size='sm' shadow='md' fontWeight='normal' mr='4'>{`${!firstSelected ? 'Un-Claimed' : 'Release'} Certificate`}</Button>
                            <Button onClick={() => {setIDS([]);}} colorScheme='red' variant='outline' size='sm' shadow='md' fontWeight='normal' >Clear</Button>
                        </>
                    )}
                </Box>
            </Box>
            <Box w='30%' display='flex' fontWeight='normal' justifyContent='space-between' gap='8' ml='2' mb='2'>
                <Box w='100%'>
                    <Box w='100%' display='flex'>
                        <Box p='1' px='3' border='1px solid black' borderTopLeftRadius={'5px'} borderRight='none' w='100%'>
                            <Text>Issued</Text>
                            <Text fontWeight='bold' textAlign='center' >{releasedCerts}</Text>
                        </Box>
                        <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                            <Text>Unclaimed</Text>
                            <Text fontWeight='bold' textAlign='center' >{unClaimed}</Text>
                        </Box>
                        <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                            <Text>Pending</Text>
                            <Text fontWeight='bold' textAlign='center' >{pendingCerts}</Text>
                        </Box>
                        <Box p='1' px='3' borderTopRightRadius={'5px'} border='1px solid black' w='100%'>
                            <Text>Total</Text>
                            <Text fontWeight='bold' textAlign='center' >{releasedCerts + unClaimed + pendingCerts}</Text>
                        </Box>
                    </Box>
                    <Box w='100%' display='flex'>
                        <Box p='1' px='3' border='1px solid black' borderBottomLeftRadius={'5px'} borderTop='none' borderRight='none' w='100%'>
                            <Text>Company</Text>
                            <Text fontWeight='bold' textAlign='center' >{totalCompanyC}</Text>
                        </Box>
                        <Box p='1' px='3' border='1px solid black' borderTop='none' borderRight='none' w='100%'>
                            <Text>Trainee</Text>
                            <Text fontWeight='bold' textAlign='center' >{totalTraineeC}</Text>
                        </Box>
                        <Box p='1' px='3' border='1px solid black' borderTop='none' borderRight='none' w='100%'>
                            <Text>Total of Enrollees</Text>
                            <Text fontWeight='bold' textAlign='center' >{(totalTraineeC + totalCompanyC)}</Text>
                        </Box>
                        <Box p='1' px='3' border='1px solid black' display='flex' alignItems='center' justifyContent='center' borderBottomRightRadius={'5px'} borderTop='none' w='100%'>
                            <Text onClick={handleViewReport} _hover={{textDecoration: 'underline', color: 'sky.400', cursor: 'pointer', fontWeight: 'bold' }} >Generate Report</Text>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
        {trainingID.length !== 0 && (
        <>
            <Button onClick={
                    !!allTData?.find(t => t.id === trainingID[0])?.cert_no ? () => handlePreviewCert() : () => generateCertForSelected()
                } 
                isDisabled={trainingID.length === 0} 
                mb='2' 
                mr='3' 
                size='sm' 
                bgColor='blue.700' 
                colorScheme='blue' 
                shadow='md' >
                    {!!allTData?.find(t => t.id === trainingID[0])?.cert_no 
                    ? "Open Preview" 
                    : "Create Batch Certificates"}
            </Button>
            <Button onClick={() => {setSelectedTrainingID([]);}} mb='2' size='sm' colorScheme='red' shadow='md' >Clear</Button>
        </>
        )}
        <Box h='650px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}} >
            {/** Headers */}
            <Box w='2050px' bgColor='blue.700' position='sticky' top='0' zIndex='9' mb='2' color='white' display='flex' textAlign='center' className='space-x-3' alignItems='center' borderRadius='5px' borderColor='gray' borderWidth='1px' borderStyle='solid' p='2'>
                <Text w='50px'>{'\u200B'}</Text>
                <Text w='30px'>#</Text>
                <Text w='150px'>Date Endorsed</Text>
                <Text w='150px'>Completion Recency</Text>
                <Text w='280px'>Registration No.</Text>
                <Text w='300px'>Certificate No.</Text>
                <Text w='400px'>Trainee Name</Text>
                <Text w='300px'>Course</Text>
                <Text w='100px'>Completion Date</Text>
                <Text w='120px'>Date Released</Text>
                <Text w='100px'>Charge</Text>
                <Text w='200px'>Status</Text>
                <Text w='200px'>Company</Text>
                <Text w='150px'>Crewing</Text>
                <Text w='300px'>Notes</Text>
            </Box>
            {/** Current Month Data Table */}
            <Box>
            {!allTData ? (
                <Center py={8}>
                    <Spinner size="lg" color="blue.500" mr={3} />
                    <Text fontWeight="medium" color="gray.600">Loading current month certification records...</Text>
                </Center>
            ) : allTData.length === 0 ? (
                <Center py={8}>
                    <Text fontWeight="medium" color="gray.500">No certification records found.</Text>
                </Center>
            ) : (allTData?.map((training: TRAINING_BY_ID, index: number) => {
                    const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                    const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                    const relativeDate = getRelativeDate(training.end_date, training.start_date)

                    const calculateIsDifferent = () => {
                        // If nothing is selected, nothing is disabled
                        if (!trainingID?.length) return false;
                        
                        // If THIS specific row is already selected, don't disable it (so user can uncheck it)
                        if (trainingID.includes(training.id)) return false;

                        // 1. Get the "Locked" Record (the first one you clicked)
                        const lockedRecord = allTData?.find(t => t.id === trainingID[0]);
                        const isLockedModePreview = !!lockedRecord?.cert_no;
                        const currentRowHasCert = !!training.cert_no;

                        // 2. CHECK 1: Mode Mismatch
                        // If we locked a record WITH a cert, disable all records WITHOUT one (and vice versa)
                        if (isLockedModePreview !== currentRowHasCert) return true;

                        // 3. CHECK 2: Course Mismatch (Only if we are in "Create" mode)
                        if (!isLockedModePreview) {
                            const currentValID = training.course;
                            const lockedCourseData = 
                                allCourses?.find(c => c.id === lockedCourseID) || 
                                courseCodes?.find(c => c.id === lockedCourseID);
                            const lockedCode = (lockedCourseData as any)?.course_code || (lockedCourseData as any)?.company_course_code;
                            
                            const currentRowData = 
                                allCourses?.find(c => c.id === currentValID) || 
                                courseCodes?.find(c => c.id === currentValID);
                            const currentRowCode = (currentRowData as any)?.course_code || (currentRowData as any)?.company_course_code;

                            const isSameCourse = 
                                currentValID === lockedCourseID || 
                                (lockedCode && currentRowCode && lockedCode.toUpperCase() === currentRowCode.toUpperCase());
                            
                            if (!isSameCourse) return true;
                        }
                        return false;
                    }
                    const isDifferentCourse = calculateIsDifferent();

                    if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                ){
                    return(
                        <Box key={training.id} _hover={{bgColor: 'blue.100', color: 'black'}} borderRadius='5px' color={training.cert_status === 7 ? 'white' : 'black'} w='2050px' fontWeight='normal' mb='1' className="flex text-center border-b space-x-3 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                            <Box w='50px'>
                                <Checkbox borderColor='gray.500' borderWidth='1px' 
                                    onChange={() => {
                                        setSelectedTrainings((prev) => prev.some(t => t.id === training.id) ? prev.filter(t => t.id !== training.id) : [...prev, training]);
                                        setSelectedTrainingID(prev => prev.includes(training.id) ? prev.filter(id => id !== training.id) : [...prev, training.id]); 
                                        setCourseID(training.course);
                                    }} 
                                    isDisabled={isDifferentCourse}
                                    shadow='md' isChecked={trainingID.includes(training.id)} 
                                />                                                                             
                            </Box>
                            <Text w="30px" textAlign='center'>{`${(index + 1)}.`}</Text>                                                                             
                            {
                                (() => {
                                    const now = new Date()
                                    const enrolledDate = parsingTimestamp(training.date_enrolled)

                                    // Check if Day, Month, and Year all match
                                    const isToday = 
                                        enrolledDate.getDate() === now.getDate() &&
                                        enrolledDate.getMonth() === now.getMonth() &&
                                        enrolledDate.getFullYear() === now.getFullYear();

                                    if (isToday) {
                                        return (
                                            <Text w='150px' bgColor={'blue.200'} borderRadius='5px'>Today</Text>
                                        )
                                    }
                                    return (
                                        <Text w='150px' >
                                            {enrolledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </Text>
                                    )
                                })()
                            }
                            {training?.isUrgent ? (
                                <Text w='150px' borderRadius='5px' bgColor='red.400'>URGENT</Text>
                            ) : (
                                <Text w="150px" bg={relativeDateBackgroundColor(relativeDate)} borderRadius='5px' >
                                    {relativeDate} 
                                </Text>                                                                             
                            )}
                            <Text w="280px">{`Reg-${reg_num}`}</Text>   
                            <Text w="300px" _hover={{color: 'blue.700'}} onClick={() => {
                                // setRegNum(reg_id); 
                                // onOpenReg();
                            }} className='hover:cursor-pointer'>
                                {`${training.cert_no}`}
                            </Text>                    
                            <Text w="400px">{`${trainee.first_name} ${trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''} ${trainee.last_name} ${trainee.suffix || ''}`}</Text>                                        
                            <Text w="300px">
                                {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                            </Text> 
                            <Text w="110px">{formatTrainingDate(training.end_date, training.start_date)}</Text>                                                                             
                            <Text w="120px" _hover={{ cursor: 'pointer'}} onClick={() => {(training.cert_status !== 0 && training.cert_status !== 1) && onOpenEdit(); setID(training.id); setTDate(training.cert_released);}} >{((training.cert_status !== 0 && training.cert_status !== 1) ? parsingTimestamp(training.cert_released).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric', year: 'numeric'}) : '')}</Text>  
                            <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                            <Box w='200px' display='flex' justifyContent='center' gap='2'>
                                <Checkbox shadow='md' onChange={() => {setFirstSelected(training.cert_status === 1 ? true : false); 
                                        setSelectedTrainingID(prev => [...prev, training.id])}} isChecked={training?.id === trainingID.find((id) => id === training.id)
                                    }/>
                                <Text w='100%' px='2' bgColor={certBackgroundColor(training.cert_status)} borderRadius='5px' size='xs'>
                                    {handleCertStatus(training.cert_status)}
                                </Text>
                            </Box>
                            <Tooltip className='text-center' aria-label='tooltip' label={allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}>
                                <Text w="200px" noOfLines={1} className='text-wrap'>
                                    {allClients?.find((client) => client.id === trainee.company)?.alias || trainee.company}
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
        <Modal isOpen={isOpenReport} size='6xl' scrollBehavior='inside' onClose={onCloseReport}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Certification Report</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box w='100%'>
                        <Box w='100%' display='flex'>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>Total</Text>
                                <Text fontWeight='bold' textAlign='center' >{releasedCerts + unClaimed + pendingCerts}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>Issued</Text>
                                <Text fontWeight='bold' textAlign='center' >{releasedCerts}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>Unclaimed</Text>
                                <Text fontWeight='bold' textAlign='center' >{unClaimed}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>Pending</Text>
                                <Text fontWeight='bold' textAlign='center' >{pendingCerts}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>Company</Text>
                                <Text fontWeight='bold' textAlign='center' >{totalCompanyC}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black'  w='100%'>
                                <Text>Trainee</Text>
                                <Text fontWeight='bold' textAlign='center' >{totalTraineeC}</Text>
                            </Box>
                        </Box>
                        <Box display='flex' justifyContent='end' mt='3' gap='2'>
                            <Button
                                size="sm"
                                colorScheme="blue"
                                borderRadius="md"
                                // Disables button if there's no active document loaded to avoid errors
                                onClick={async () => {
                                    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
                                    const currentMonth = monthKeys[monthSelected]; // Safely resolves to 'jan', 'feb', etc.
                                    
                                    try {
                                        // Batch/fire updates for this month sequentially or all together
                                        await handleMetricUpdate(currentMonth, 'ttl_certs', (releasedCerts + unClaimed + pendingCerts));
                                        await handleMetricUpdate(currentMonth, 'issued', releasedCerts);
                                        await handleMetricUpdate(currentMonth, 'unClaimed', unClaimed);
                                        await handleMetricUpdate(currentMonth, 'pending', pendingCerts);
                                        await handleMetricUpdate(currentMonth, 'trainee', totalTraineeC);
                                        await handleMetricUpdate(currentMonth, 'company', totalCompanyC);
                                        
                                        handleToast(
                                            'Report Updated', 
                                            `Successfully updated metrics for ${currentMonth.toUpperCase()}!`, 
                                            3000, 
                                            'success'
                                        )
                                    } catch (err) {
                                        alert("Failed to sync metrics to database.");
                                    }
                                }}
                            >
                                Save Current Metrics to Report
                            </Button>
                            <Button colorScheme="teal" size="sm" onClick={handlePrint}>
                                Print / Save PDF Report
                            </Button>
                        </Box>
                    </Box>
                    <Box mt='2' ref={componentRef}>
                        <TableContainer border="1px solid" borderColor="black" bg="white">
                            <Table 
                                variant="unstyled" 
                                size="sm" 
                                sx={{
                                    'th, td': { border: '1px solid black', textAlign: 'center', fontSize: 'xs', px: 2, py: 1.5 }
                                }}
                            >
                                <Thead>
                                {/* Top Year Header spanning the entire width */}
                                    <Tr border='none'>
                                        <Td colSpan={15} border='none'>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" pb="4" mb="3" >
                                                <ChakraImage src="/Logo.jpg" width="2.81in" height="0.66in" alt="logo" />
                                                <Box>
                                                <Text display="flex" justifyContent="end" alignItems="center" fontSize="9pt" fontFamily="Calibri, Arial, sans-serif">
                                                    <Text as="span" mr={1}><PinIcon size="12" color="#000" /></Text>
                                                    2/F 801 Building UN Avenue Ermita Manila
                                                </Text>
                                                <Text display="flex" justifyContent="end" alignItems="center" fontSize="9pt" fontFamily="Calibri, Arial, sans-serif">
                                                    <Text as="span" mr={1}><PhoneIcon size="12" color="#000" /></Text>
                                                    (02) 8 281-8155
                                                </Text>
                                                <Text display="flex" justifyContent="end" alignItems="center" fontSize="9pt" fontFamily="Calibri, Arial, sans-serif">
                                                    <Text as="span" mr={1}><MailIcon size="12" color="#000" /></Text>
                                                    pentagonmaritimeservicescorp@gmail.com
                                                </Text>
                                                <Text display="flex" justifyContent="end" alignItems="center" fontSize="9pt" fontFamily="Calibri, Arial, sans-serif">
                                                    <Text as="span" mr={1}><FacebookIcon size="12" color="#000" /></Text>
                                                    /pentagonmaritimeservicescorp
                                                </Text>
                                                </Box>
                                            </Box>
                                            <Box display='flex' justifyContent='space-between' >
                                                <Box textAlign='start'>
                                                    <Text>{`MONTHLY BACKDATED REPORT FOR THE MONTH OF: ${MONTH_MAP[monthSelected]?.label.toUpperCase() || ''} ${yearSelected}`}</Text>
                                                    <Text>{`PREPARED BY: RAFFY P. LOPEZ`}</Text>
                                                </Box>
                                                <Box>
                                                    <Text>{`DEPARTMENT: ADMIN-CERTIFICATION`}</Text>
                                                </Box>
                                            </Box>
                                            <Box textAlign='start' mt='2'>
                                                <Text>OVERVIEW</Text>
                                                <Text fontWeight='normal'>{`For the month of ${MONTH_MAP[monthSelected]?.label || ''} a total number of ${(releasedCerts + unClaimed + pendingCerts)} certificates has been processed.`}</Text>
                                            </Box>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Th rowSpan={2} fontWeight="bold" minW="150px">Particulars</Th>
                                        <Th colSpan={13} fontWeight="bold">{selectedReport?.year || '2026'}</Th>
                                        <Th rowSpan={2} fontWeight="bold" minW="100px">Remarks</Th>
                                    </Tr>
                                    {/* Sub-header MONTH_MAP list columns */}
                                    <Tr>
                                        {MONTH_MAP.map((m) => (
                                            <Th key={m.key} fontWeight="semibold" textTransform="capitalize">{m.key}</Th>
                                        ))}
                                        <Th fontWeight="bold">Total</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {/* Row 1: Total Certificates */}
                                    <Tr>
                                        <Td fontWeight="medium" textAlign="left">Total # of Certificates</Td>
                                        {MONTH_MAP.map((m) => {
                                        // 🟢 Cast the retrieved month object to any so TS doesn't complain
                                        const monthData = selectedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.ttl_certs || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('ttl_certs')}</Td>
                                        <Td rowSpan={6}></Td> 
                                    </Tr>

                                    {/* Row 2: Issued */}
                                    <Tr>
                                        <Td textAlign="left">Issued</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.issued || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('issued')}</Td>
                                    </Tr>

                                    {/* Row 3: Pending / On-Hold */}
                                    <Tr>
                                        <Td textAlign="left">Pending/On-Hold</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.pending || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('pending')}</Td>
                                    </Tr>

                                    {/* Row 4: Empty Gap row */}
                                    <Tr>
                                        <Td minH="24px"></Td>
                                        {MONTH_MAP.map((m) => <Td key={m.key}></Td>)}
                                        <Td></Td>
                                    </Tr>

                                    {/* Row 5: Trainee */}
                                    <Tr>
                                        <Td textAlign="left">Trainee</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.trainee || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('trainee')}</Td>
                                    </Tr>

                                    {/* Row 6: Company */}
                                    <Tr>
                                        <Td textAlign="left">company</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.company || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('company')}</Td>
                                    </Tr>

                                    {/* Row 7: Notes */}
                                    <Tr>
                                        <Td fontWeight="semibold" textAlign="left">Note:CANCEL</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedReport?.[m.key] as any;
                                        return (
                                            <Td key={m.key} fontSize="xs" fontWeight="medium">
                                            {monthData?.note || ''}
                                            </Td>
                                        );
                                        })}
                                        <Td></Td>
                                        <Td></Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </TableContainer>
                        <TableContainer mt='2' border="1px solid" borderColor="black" bg="white">
                            <Table 
                                variant="unstyled" 
                                size="sm" 
                                sx={{
                                    'th, td': { border: '1px solid black', textAlign: 'center', fontSize: 'xs', px: 2, py: 1.5 }
                                }}
                            >
                                <Thead>
                                {/* Top Year Header spanning the entire width */}
                                    <Tr border='none'>
                                        <Td colSpan={15} border='none'>
                                            <Box textAlign='start' mt='2'>
                                                <Text>OVERVIEW</Text>
                                                <Text>{`MONTHLY DATED REPORT FOR THE MONTH OF: ${MONTH_MAP[monthSelected]?.label.toUpperCase() || ''} ${yearSelected}`}</Text>
                                                {(() => {
                                                    // 1. Get the target month key string (e.g., 'jan', 'feb', 'nov') using the selected index
                                                    const currentMonthKey = MONTH_MAP[monthSelected]?.key;
                                                    
                                                    // 2. Safely look up that month's total certificates from your state, defaulting to 0
                                                    const currentMonthTtlCerts = selectedDatedReport?.[currentMonthKey]?.ttl_certs || 0;

                                                    return (
                                                        <Text fontWeight='normal'>
                                                            {`For the month of ${MONTH_MAP[monthSelected]?.label || ''} a total number of ${currentMonthTtlCerts} certificates has been processed.`}
                                                        </Text>
                                                    );
                                                })()}
                                            </Box>
                                        </Td>
                                    </Tr>
                                    <Tr>
                                        <Th rowSpan={2} fontWeight="bold" minW="150px">Particulars</Th>
                                        <Th colSpan={13} fontWeight="bold">{selectedDatedReport?.year || '2026'}</Th>
                                        <Th rowSpan={2} fontWeight="bold" minW="100px">Remarks</Th>
                                    </Tr>
                                    {/* Sub-header MONTH_MAP list columns */}
                                    <Tr>
                                        {MONTH_MAP.map((m) => (
                                            <Th key={m.key} fontWeight="semibold" textTransform="capitalize">{m.key}</Th>
                                        ))}
                                        <Th fontWeight="bold">Total</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {/* Row 1: Total Certificates */}
                                    <Tr>
                                        <Td fontWeight="medium" textAlign="left">Total # of Certificates</Td>
                                        {MONTH_MAP.map((m) => {
                                        // 🟢 Cast the retrieved month object to any so TS doesn't complain
                                        const monthData = selectedDatedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.ttl_certs || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('ttl_certs')}</Td>
                                        <Td rowSpan={6}></Td> 
                                    </Tr>

                                    {/* Row 2: Issued */}
                                    <Tr>
                                        <Td textAlign="left">Issued</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedDatedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.issued || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('issued')}</Td>
                                    </Tr>

                                    {/* Row 3: Pending / On-Hold */}
                                    <Tr>
                                        <Td textAlign="left">Pending/On-Hold</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedDatedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.pending || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('pending')}</Td>
                                    </Tr>

                                    {/* Row 4: Empty Gap row */}
                                    <Tr>
                                        <Td minH="24px"></Td>
                                        {MONTH_MAP.map((m) => <Td key={m.key}></Td>)}
                                        <Td></Td>
                                    </Tr>

                                    {/* Row 5: Trainee */}
                                    <Tr>
                                        <Td textAlign="left">Trainee</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedDatedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.trainee || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('trainee')}</Td>
                                    </Tr>

                                    {/* Row 6: Company */}
                                    <Tr>
                                        <Td textAlign="left">company</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedDatedReport?.[m.key] as any;
                                        return <Td key={m.key}>{monthData?.company || 0}</Td>;
                                        })}
                                        <Td fontWeight="bold">{getRowTotal('company')}</Td>
                                    </Tr>

                                    {/* Row 7: Notes */}
                                    <Tr>
                                        <Td fontWeight="semibold" textAlign="left">Note:CANCEL</Td>
                                        {MONTH_MAP.map((m) => {
                                        const monthData = selectedDatedReport?.[m.key] as any;
                                        return (
                                            <Td key={m.key} fontSize="xs" fontWeight="medium">
                                            {monthData?.note || ''}
                                            </Td>
                                        );
                                        })}
                                        <Td></Td>
                                        <Td></Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
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
        <Modal size='7xl' closeOnOverlayClick={false} scrollBehavior='inside' isOpen={isOpenCert} onClose={() => {setTrainingBatch(initCourseBatch); setSelectedTrainingID([]); setCategory(''); setCourseID(''); setSelectedTrainings([] as (TRAINING_BY_ID & { year?: string })[]); onCloseCert();}}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Preview Certificate</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb='5'>
                    {(() => {
                        //const batchTrainings = allTData.filter((td) => td.batch === trainingBatch.id)
                        //const batchTrainings = selectedTrainings
                        const batchTrainings = [...selectedTrainings].sort((a, b) => {
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
                            //return a.last_name.localeCompare(b.last_name);
                        })
                        return(
                        <>
                            <Box borderBottom='1px solid black' pb='4' w='100%' display='flex' justifyContent='space-between' alignItems='center'>
                                <Box mr='3' display='flex' gap='2' w='750px'>
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
                                        <MenuButton as={Button} isDisabled={trainingID.length === 0} onClick={() => {setCloseBlur(false);}} size='sm' w='200px' variant='ghost' colorScheme='blue' transition='all 0.2s'> 
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
                                    <InputGroup w='300px' display='flex' justifyContent='space-between' alignItems='center'>
                                        <FormControl display='flex' isDisabled={trainingID.length === 0}>
                                            <FormLabel htmlFor='switch' m='0'>All Conducted Online:</FormLabel>
                                            <Switch id='switch' onChange={handleConductedOnline} />
                                        </FormControl>
                                    </InputGroup>
                                    {certTitleHtml && (
                                        <Button onClick={handleChangeContents} loadingText='Saving...' isLoading={loading} size='sm' colorScheme='blue' w='150px' bgColor='blue.700' shadow='md' isDisabled={certTitleHtml === ''}>Save Content</Button>
                                    )}    
                                    {(() => {
                                        // This returns true if at least one record has a missing or empty cert_no
                                        const isMissingCertNo = selectedTrainings.length === 0 || selectedTrainings.some(t => !t.cert_no || t.cert_no.trim() === "");
                                        
                                        return(
                                            <Button onClick={() => {handleSaveCertNo()}} isDisabled={isMissingCertNo} size='sm' w='200px' shadow='md' bgColor='blue.700' colorScheme='blue'>
                                                Save Certificate No.
                                            </Button>
                                        )
                                    })()} 
                                </Box>
                                <Box>
                                    <Button size='sm' variant='solid' onClick={toggleAll} mr='3'>
                                        {Array.isArray(openIndexes) && openIndexes.length === allTData.length ? "Collapse All" : "Expand All"}
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
                            {batchTrainings?.map((training: any, index: number) => {//.sort((a, b) => a.cert_no.localeCompare(b.cert_no))
                                const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
                                const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                                const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                                //const reg_id = allRegData?.find((reg) => 
                                const batchYear = courseBatch?.find((batch) => batch.id === training.batch)?.createdAt
                                const getYear = new Date().getFullYear()
                                const year = new Date().getFullYear()
                                const splitMonth = formatTrainingSchedule((training.end_date === '' ? training.start_date : training.end_date), training.year || 0).split(' ')[0]
                                const splitDay = formatTrainingSchedule((training.end_date === '' ? training.start_date : training.end_date), training.year || 0).split(' ')[1].replace(/\D/g, '')
                                const nthDay = getOrdinalHTML(Number(splitDay))
                                
                                const trainingDate = training.numOfDays === 1 
                                    ? formatTrainingSchedule(training.start_date, training.year || 0) 
                                    : `${formatTrainingSchedule(training.start_date, training.year || 0)} to ${formatTrainingSchedule(training.end_date, training.year || 0)}`
            
                                if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                                )){
                                
                                return(
                                    <AccordionItem key={training.id} _hover={{bgColor: 'gray.50', color: 'black'}} borderRadius='5px' fontWeight='normal' >
                                        <AccordionButton fontSize='sm' display='flex' justifyContent='space-between' textTransform='uppercase'>
                                            <Checkbox onChange={() => {setSelectedTrainingID(prev => prev.includes(training.id) ? prev.filter(id => id !== training.id) : [...prev, training.id])}} isChecked={trainingID.includes(training.id)}/>
                                            <Text w="30px" textAlign='center'>{`${(index + 1)}.`}</Text>                                                                             
                                            {/* <Text w="200px" _hover={{color: 'blue.700'}} onClick={() => {
                                                // setRegNum(reg_id); 
                                                // onOpenReg();
                                                }} className='hover:cursor-pointer'>
                                                {`${training.cert_no}`}
                                            </Text> */}
                                            <Input w='200px' onClick={(e) => e.stopPropagation()} onKeyDown={(e) => {if(e.key === ' ' || e.key === 'Enter'){e.stopPropagation();}}} onChange={(e) => {setSelectedTrainings(prev => prev.map(t => t.id === training.id ? {...t, cert_no: e.target.value.toUpperCase()} : t))}} value={training.cert_no} size='xs' shadow='md' />
                                            <Text w="300px">{`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''} ${trainee.suffix || ''}`}</Text>                                        
                                            {/* <Text w="120px" _hover={{ cursor: 'pointer'}} onClick={() => {training.cert_status !== 0 && onOpenEdit(); setID(training.id); setTDate(training.cert_released);}} >{(training.cert_status !== 0 ? parsingTimestamp(training.cert_released).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric', year: 'numeric'}) : '')}</Text>   */}
                                            <Text w="150px" >{allClients?.find((client) => client.id === trainee.company)?.alias || trainee.company}</Text>  
                                            <Text w="100px" >{training.accountType === 0 ? 'TRAINEE' : 'COMPANY'}</Text>  
                                            <Text w="100px" >{training?.printCount || 0}</Text>  
                                            <Text w="100px" onClick={() => {setTraining_ID(training.id); onOpenView();}} _hover={{ cursor: 'pointer'}}>{training?.hasViewed ? 'Viewed' : 'Not yet'}</Text>  
                                            <Text w="100px" onClick={() => {setTraining_ID(training.id); onOpenViewCount();}} _hover={{ cursor: 'pointer'}}>{training?.viewCount || 0}</Text>  
                                            <AccordionIcon />
                                        </AccordionButton>
                                        <AccordionPanel px='10' py='5' display='flex' gap='2'>
                                            <Box position='relative' w='950px' display='flex' flexDir='column' justifyContent='center' alignItems='center' >
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
                                                            <div style={{ display: 'block', lineHeight: '1.1'}}
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
                                                            {training?.conductedOnline ? (
                                                                <div style={{fontSize: '12pt', display: 'block', lineHeight: '1.2'}}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: `<span>Conducted online on ${trainingDate} </span>${normalizeCertContent(training.certContent)}`
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div style={{fontSize: '12pt', display: 'block', lineHeight: '1.2'}}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: `<span>Conducted on ${trainingDate} </span>${normalizeCertContent(training.certContent)}`
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                        <div style={{marginTop: '10px'}}
                                                            dangerouslySetInnerHTML={{
                                                                __html: `Issued this ${nthDay} day of ${splitMonth}, ${training.year} in Manila City, Philippines`
                                                            }}
                                                        />
                                                        <Box pt='4' display='flex' alignItems='end' w='85%'>
                                                            <Box w='40%' position='relative' display='flex' flexDirection='column' justifyContent={'center'} alignItems='center' >
                                                                {(() => {
                                                                    const isMentalHelth = training.certTitle?.toUpperCase().trim() === 'MENTAL HEALTH AWARENESS'
                                                                    const targetIns = isMentalHelth ? 'NEPTHALI A. SAGUIL' : 'ROGELIO C. MAHINAY'
                                                                    const ins = allInstructors?.find((i) => i.name === targetIns)
                                                                    const eSignSrc = ins?.e_sign || '/placeholder-signature.png'
                                                                    if(!ins) return null

                                                                    return(
                                                                        <>
                                                                            <Box position='absolute' top='-50px' left='20%' transform="translateX(-10%)" zIndex={2} >
                                                                                <ChakraImage src={eSignSrc} w='100%' h='100%' alt='signature' />
                                                                            </Box>
                                                                            <Box borderTop='1px solid black' w='80%' />
                                                                            <Text position='relative' textAlign='center' zIndex={1} w='100%' pt='2' fontSize='10pt' fontWeight='bold'>
                                                                                {(() => {
                                                                                    if (!ins) return 'No Instructor';
                                                                                    return `${ins.rank !== 'DR.' ? ins.rank : ''} ${ins.name}${ins.rank === 'DR.' ? ', MD' : ''}`;
                                                                                })()}
                                                                            </Text>
                                                                            <Text fontSize='10pt'>{`${ins?.rank === 'DR.' ? 'Facilitator' : 'Training Director'}`}</Text>
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
                                            <Box borderRadius='10px' h='100%' shadow='md' p='2' w='780px'>
                                                <Box display='flex' justifyContent='space-between'>
                                                    <FormLabel>Trainee Name</FormLabel>
                                                    <Button onClick={(e) => {
                                                            traineeName.id === '' 
                                                            ? setTraineeName({id: trainee.id, last_name: trainee.last_name, first_name: trainee.first_name, middle_name: trainee.middle_name})
                                                            : handleTraineeName()
                                                        }} size='sm' shadow='md' bgColor='blue.700' colorScheme='blue'
                                                    >
                                                        {`${traineeName.id === '' ?  'Override' : 'Save'} Details`}
                                                    </Button>
                                                </Box>
                                                <Box display='flex' gap='3' px='4'>
                                                    <FormControl>
                                                        <FormLabel color='gray.500' fontSize='sm'>Last Name</FormLabel>
                                                        <Input value={`${traineeName.id !== trainee.id ? '' : traineeName.last_name}`} onChange={(e) => setTraineeName(prev => ({...prev, last_name: e.target.value}))} shadow='md' />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel color='gray.500' fontSize='sm'>Given Name</FormLabel>
                                                        <Input value={`${traineeName.id !== trainee.id ? '' : traineeName.first_name}`} onChange={(e) => setTraineeName(prev => ({...prev, first_name: e.target.value}))} shadow='md' />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel color='gray.500' fontSize='sm'>Middle Name</FormLabel>
                                                        <Input value={`${traineeName.id !== trainee.id ? '' : traineeName.middle_name}`} onChange={(e) => setTraineeName(prev => ({...prev, middle_name: e.target.value}))} shadow='md' />
                                                    </FormControl>
                                                </Box>
                                                <FormControl mt='2'>
                                                    <FormLabel fontSize='sm'>Year:</FormLabel>
                                                    <Input value={training.year} onChange={(e) => 
                                                        {
                                                            const newVal= e.target.value
                                                            setSelectedTrainings(prev => prev.map(t => t.id === training.id ? {...t, year: newVal} : t))
                                                        }} 
                                                        size='sm' 
                                                        shadow='md' 
                                                    />
                                                </FormControl>
                                                <Box w='500px'>
                                                    <Text fontWeight='bold' fontSize='lg'>Valid ID:</Text>
                                                    <Box>
                                                        <ButtonGroup size='sm' isAttached variant='outline' mb='2' colorScheme='blue'>
                                                            <IconButton aria-label="Zoom in" icon={<AddIcon />} onClick={handleZoomIn} />
                                                            <IconButton aria-label="Zoom out" icon={<MinusIcon />} onClick={handleZoomOut} />
                                                            <Button leftIcon={<RepeatIcon />} onClick={handleRotate}>Rotate</Button>
                                                            <Button onClick={() => {setZoom(1); setRotation(0)}}>Reset</Button>
                                                        </ButtonGroup>
                                                    </Box>
                                                    <Box border='1px' 
                                                        borderColor='gray.200' 
                                                        borderRadius='md' 
                                                        overflow='hidden' 
                                                        bg='gray.50'
                                                        h='400px'
                                                        display='flex'
                                                        alignItems='center'
                                                        justifyContent='center'
                                                        position='relative'
                                                        p='4'
                                                    >
                                                        <ChakraImage src={trainee?.valid_id} transition="transform 0.2s ease-out" transform={`rotate(${rotation}deg) scale(${zoom})`} maxW='100%' maxH='100%' cursor={zoom > 1 ? 'zoom-out' : 'zoom-in'} objectFit='contain' alt={`Trainee Valid ID`}/>
                                                    </Box>
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
                    <Box ref={componentRef}>
                        <InHouseCert selectedTrainings={selectedTrainings} searchTerm={searchTerm} trainingID={trainingID} />
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
        <Modal isOpen={isOpenBDCert} onClose={onCloseBDCert} scrollBehavior='inside' size='xl' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader pb={0} >{`Create Certificate/s`}</ModalHeader>
                <ModalCloseButton />
                <ModalBody pt={0} display='flex' flexDir='column' gap='3'>
                    <Text fontSize='lg' color='blue.700'>Are you sure you want to create certificate/s for the selected training?</Text>
                    <Button colorScheme='blue' bgColor='blue.700' w='100%' shadow='md' 
                    onClick={() => {generateCertForSelected(); onCloseBDCert();}}
                    >Yes, Create Certificate/s</Button>
                </ModalBody>
            </ModalContent>
        </Modal>
        </>
    )
}