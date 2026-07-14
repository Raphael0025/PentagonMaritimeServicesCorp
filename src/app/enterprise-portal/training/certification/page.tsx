'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Box, Image as ChakraImage, Text, Input, Spinner, Center, Button, InputLeftAddon, Select, Tabs, TabList, TabPanels, Tab, TabPanel, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';
import { ChevronDownIcon } from '@chakra-ui/icons'
import { writeBatch, doc, setDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/trainee_controller'
import { PinIcon, MailIcon, PhoneIcon, FacebookIcon } from '@/Components/Icons'

import { TRAINING_BY_ID } from '@/types/trainees'
import { CERTIFICATION_REPORT_BY_ID } from '@/types/certification'

import { GET_CERT_REPORT_BY_YEAR, UPDATE_CERT_MONTHLY_METRIC, certificateReportController } from '@/lib/certification_controller'

import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useInstructors } from '@/context/InstructorContext'

import { deployYDate } from '@/types/utils' 
import { fullMonth, } from '@/handlers/util_handler'

import { ToastStatus } from '@/types/handling'
import { useReactToPrint } from 'react-to-print'

import { BatchedDated, BDTracker, Transmittal, BDTransmittal, ReleaseLog, BDReleaseLog, Certificate_Content_Mgmt } from '@/Components/Page/Training/CertificationMonitoring'

export default function TrackerPage(){
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allInstructors } = useInstructors()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allTrainingData, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { allData: allRegData, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [certLoading, setCertLoading] = useState<boolean>(false)
    const [hasNoBatch, setBatch] = useState<boolean>(false)
    const [isDated, setIsDated] = useState<boolean>(true)

    const [filterCourse, setCFilter] = useState<string>('')
    const [filterCompany, setCompanyFilter] = useState<string>('')
    const [filterCharge, setChargeType] = useState<string>('')
    const [filterStatus, setStatus] = useState<string>('')
    const [filterRecency, setRecencyFilter] = useState<string>('')

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()
    const { isOpen: isOpenReport, onOpen: onOpenReport, onClose: onCloseReport } = useDisclosure()
    
    const [selectedReport, setSelectedReport] = useState<CERTIFICATION_REPORT_BY_ID | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    const [allTData, setAllTData] = useState<TRAINING_BY_ID[]>([])
    const [t_ids, setIDS] = useState<string[]>([])
    const [firstSelected, setFirstSelected] = useState<boolean>(false)

    const [totalTraineeC, setTraineeCharge] = useState<number>(0)
    const [totalCompanyC, setCompanyCharge] = useState<number>(0)
    const [releasedCerts, setReleasedCerts] = useState<number>(0)
    const [unclaimedCerts, setUnclaimedCert] = useState<number>(0)
    const [pendingCerts, setPendingCerts] = useState<number>(0)

    const componentRef = useRef<HTMLDivElement | null>(null)

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

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
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
            const allTrainData = allTrainingData && allTrainingData
                .filter((t) => {
                    if(!t.batch) {
                        return false;
                    } 
                    else if (!hasNoBatch) {
                        const batch = courseBatch?.find((b) => b.id === t.batch);
                        if (!batch?.createdAt) return false;
                        
                        // Firestore Timestamp → JS Date
                        const createdDate = batch.createdAt.toDate();
                        
                        return (
                            createdDate.getMonth() === monthSelected &&
                            createdDate.getFullYear() === yearSelected
                        );
                    } 
                    else {    
                        return true;
                    }
                })
                .filter(t => {
                    const start = t.start_date.toLowerCase();
                    const end = t.end_date.toLowerCase();
                    
                    const MONTH_MAP = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                    const trimmedMonth = MONTH_MAP[monthSelected];

                    return (start.includes(trimmedMonth) || end.includes(trimmedMonth) )
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
                .filter((t) => t.reg_status === 6 || t.reg_status === 3)
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

            const filteredTrainingData: TRAINING_BY_ID[] = allTrainData?.filter(t => t.batch !== '1' && t.regType === 0) || []

            const traineeChargeCount = filteredTrainingData?.filter(t => t.accountType === 0).length
            const companyChargeCount = filteredTrainingData?.filter(t => t.accountType === 1).length
            const ttlReleased = filteredTrainingData?.filter(t => t.cert_status === 2).length
            const ttlUnclaimed = filteredTrainingData?.filter(t => t.cert_status === 1).length
            const ttlPending = filteredTrainingData?.filter(t => t.cert_status === 0).length

            // 3️⃣ Set the states
            setAllTData(allTrainData ?? []);

            setTraineeCharge(traineeChargeCount)
            setCompanyCharge(companyChargeCount)
            setReleasedCerts(ttlReleased);
            setUnclaimedCert(ttlUnclaimed);
            setPendingCerts(ttlPending);
            setLoading(false)
        }
        fetchData()
    },[monthSelected, yearSelected, allTrainingData, filterCharge, filterCourse, filterStatus, filterRecency, filterCompany])

    const batchedData = useMemo(
        () => allTData?.filter(t => t.regType === 0).filter(t => t.batch !== '1'),
        [allTData]
    );

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear()
    const startYear = parseInt(deployYDate, 10)

    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i)

    const handleData = () => {
        setTMonth(monthSelected + 1) 
        setTYear(yearSelected)
        setRMonth(monthSelected + 1) 
        setRYear(yearSelected)
        onCloseDate()
    }

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'b') {
                setBatch(prev => !prev)
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [])
    
    useEffect(() => {
        const bdHandler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
                setIsDated(prev => !prev)
            }
        };
        window.addEventListener('keydown', bdHandler);
        return () => window.removeEventListener('keydown', bdHandler);
    }, [])

    const handleCertStatus = async (newStatus: number) => {
        if (!t_ids.length) return
        setCertLoading(true)
        try {
            const actor = localStorage.getItem('customToken')
            const batch = writeBatch(firestore)

            t_ids.forEach(t_id => {
                const ref = doc(firestore, 'TRAINING', t_id)
                batch.update(ref, {
                    cert_status: newStatus,
                    cert_released: Timestamp.now(),
                    updated_by: actor
                })
            })

            // 🔥 ONE network request only
            await batch.commit()

            handleToast(
                'Status Updated',
                "Crew's certificate status updated successfully.",
                3000,
                'success'
            )

            setIDS([]) // clear selection
        } catch (error) {
            console.error('ERROR DETECTED:', error)
        } finally {
            setCertLoading(false)
        }
    }

    const getRelativeDate = (endDate?: string, startDate?: string) => {
        const dateStr = endDate || startDate
        if (!dateStr) return '-'
        const year = new Date().getFullYear()
        const target = new Date(`${dateStr} ${year}`)
        if (isNaN(target.getTime())) return '-'
        
        console.log('Date Str ',dateStr)
        console.log(target)
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
        if (diffDays === 2) return 'tomorrow 2'

        return target.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })   
    }

    const handleViewReport = async () => {
        try {
            setIsLoading(true);
            
            const getYear = new Date().getFullYear();
            // 1. Attempt to fetch the report for the current year
            let report = await GET_CERT_REPORT_BY_YEAR(getYear, 'dated');
            
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
                    type: 'dated', // Default fallback type
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
        <Box>
            {isDated ? (
            <Tabs size='sm' variant='enclosed' isLazy>
                <TabList fontWeight='normal'>
                    <Tab _selected={{ color: 'white', bg: 'green.500'}}>Monitoring</Tab>
                    <Tab _selected={{ color: 'white', bg: 'teal.500' }}>Transmittals</Tab>
                    <Tab _selected={{ color: 'white', bg: 'blue.500' }}>Release Log</Tab>
                    <Tab _selected={{ color: 'white', bg: 'cyan.500' }}>Certificate Template Management</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
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
                                            <Text fontWeight='bold' textAlign='center' >{unclaimedCerts}</Text>
                                        </Box>
                                        <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                            <Text>Pending</Text>
                                            <Text fontWeight='bold' textAlign='center' >{pendingCerts}</Text>
                                        </Box>
                                        <Box p='1' px='3' borderTopRightRadius={'5px'} border='1px solid black' w='100%'>
                                            <Text>Total</Text>
                                            <Text fontWeight='bold' textAlign='center' >{releasedCerts + unclaimedCerts + pendingCerts}</Text>
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
                        {loading ? (
                            <Center py={8}>
                                <Spinner size="lg" color="blue.500" mr={3} />
                                <Text fontWeight="medium" color="gray.600">Loading Certification Records...</Text>
                            </Center>
                        ) : (
                            <BatchedDated filterCompany={filterCompany} searchTerm={searchTerm} trainings={batchedData || []} trainingIDs={t_ids} setTrainingIDs={setIDS} setFirstSelected={setFirstSelected} />
                        )}
                    </TabPanel>
                    <TabPanel>
                        {loading ? (
                            <Center py={8}>
                                <Spinner size="lg" color="blue.500" mr={3} />
                                <Text fontWeight="medium" color="gray.600">Loading Transmittal Records...</Text>
                            </Center>
                        ) : (
                            <Transmittal />
                        )}
                    </TabPanel>
                    <TabPanel>
                        {loading ? (
                            <Center py={8}>
                                <Spinner size="lg" color="blue.500" mr={3} />
                                <Text fontWeight="medium" color="gray.600">Loading Release Log Records...</Text>
                            </Center>
                        ) : (
                            <ReleaseLog />
                        )}
                    </TabPanel>
                    <TabPanel>
                        <Certificate_Content_Mgmt />
                    </TabPanel>
                </TabPanels>
            </Tabs>
            ) : (
            <Tabs size='sm' variant='enclosed' isLazy>
                <TabList fontWeight='normal'>
                    <Tab _selected={{ color: 'white', bg: 'green.500' }}>Monitoring</Tab>
                    <Tab _selected={{ color: 'white', bg: 'teal.500' }}>Transmittals</Tab>
                    <Tab _selected={{ color: 'white', bg: 'blue.500' }}>Release Log</Tab>                    
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <BDTracker />
                    </TabPanel>
                    <TabPanel>
                        <BDTransmittal />
                    </TabPanel>
                    <TabPanel>
                        <BDReleaseLog />
                    </TabPanel>
                </TabPanels>
            </Tabs>
            )}
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
                                <Text fontWeight='bold' textAlign='center' >{releasedCerts + unclaimedCerts + pendingCerts}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>Issued</Text>
                                <Text fontWeight='bold' textAlign='center' >{releasedCerts}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>Unclaimed</Text>
                                <Text fontWeight='bold' textAlign='center' >{unclaimedCerts}</Text>
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
                                        await handleMetricUpdate(currentMonth, 'ttl_certs', (releasedCerts + unclaimedCerts + pendingCerts));
                                        await handleMetricUpdate(currentMonth, 'issued', releasedCerts);
                                        await handleMetricUpdate(currentMonth, 'unClaimed', unclaimedCerts);
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
                                            <Box display="flex" justifyContent="space-between" alignItems="center" pb="4" mb="6" >
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
                                                    <Text>{`MONTHLY REPORT FOR THE MONTH OF: ${MONTH_MAP[monthSelected]?.label.toUpperCase() || ''} ${yearSelected}`}</Text>
                                                    <Text>{`PREPARED BY: RAFFY P. LOPEZ`}</Text>
                                                </Box>
                                                <Box>
                                                    <Text>{`DEPARTMENT: ADMIN-CERTIFICATION`}</Text>
                                                </Box>
                                            </Box>
                                            <Box textAlign='start' mt='2'>
                                                <Text>OVERVIEW</Text>
                                                <Text fontWeight='normal'>{`For the month of ${MONTH_MAP[monthSelected]?.label || ''} a total number of ${(releasedCerts + unclaimedCerts + pendingCerts)} certificates has been processed.`}</Text>
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
                    </Box>
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
    </>
    )
}
