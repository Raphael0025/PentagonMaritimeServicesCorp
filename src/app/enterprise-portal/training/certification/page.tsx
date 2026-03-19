'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Box, Text, Input, Spinner, Center, Button, InputLeftAddon, Select, Tabs, TabList, TabPanels, Tab, TabPanel, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';
import { ChevronDownIcon } from '@chakra-ui/icons'
import { writeBatch, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/trainee_controller'

import { TRAINING_BY_ID } from '@/types/trainees'

import { UPDATE_TRAINING } from '@/lib/trainee_controller'

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

import { BatchedDated, BDTracker, Transmittal, ReleaseLog, Certificate_Template_Mgmt } from '@/Components/Page/Training/CertificationMonitoring'

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
    
    const [allTData, setAllTData] = useState<TRAINING_BY_ID[]>([])
    const [t_ids, setIDS] = useState<string[]>([])
    const [firstSelected, setFirstSelected] = useState<boolean>(false)

    const [totalTraineeC, setTraineeCharge] = useState<number>(0)
    const [totalCompanyC, setCompanyCharge] = useState<number>(0)
    const [releasedCerts, setReleasedCerts] = useState<number>(0)
    const [pendingCerts, setPendingCerts] = useState<number>(0)

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
            const ttlReleased = filteredTrainingData?.filter(t => t.cert_status === 1).length
            const ttlPending = filteredTrainingData?.filter(t => t.cert_status === 0).length

            // 3️⃣ Set the states
            setAllTData(allTrainData ?? []);

            setTraineeCharge(traineeChargeCount)
            setCompanyCharge(companyChargeCount)
            setReleasedCerts(ttlReleased);
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

    return(
    <>
        <Box>
            {isDated ? (
            <>
                <Tabs size='sm' variant='enclosed' isLazy>
                    <TabList fontWeight='normal'>
                        <Tab _selected={{ color: 'white', bg: 'green.500' }}>Monitoring</Tab>
                        <Tab _selected={{ color: 'white', bg: 'teal.500' }}>Transmittals</Tab>
                        <Tab _selected={{ color: 'white', bg: 'blue.500' }}>Release Log</Tab>
                        <Tab _selected={{ color: 'white', bg: 'teal.500' }}>Certificate Template Management</Tab>
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
                                            <Box p='1' px='3' border='1px solid black' borderTopLeftRadius={'5px'} borderBottom='none' borderRight='none' w='100%'>
                                                <Text>Company</Text>
                                                <Text fontWeight='bold' textAlign='center' >{totalCompanyC}</Text>
                                            </Box>
                                            <Box p='1' px='3' border='1px solid black' borderBottom='none' borderRight='none' w='100%'>
                                                <Text>Trainee</Text>
                                                <Text fontWeight='bold' textAlign='center' >{totalTraineeC}</Text>
                                            </Box>
                                            <Box p='1' px='3' border='1px solid black' borderTopRightRadius={'5px'} borderBottom='none' w='100%'>
                                                <Text>Total of Enrollees</Text>
                                                <Text fontWeight='bold' textAlign='center' >{(totalTraineeC + totalCompanyC)}</Text>
                                            </Box>
                                        </Box>
                                        <Box w='100%' display='flex'>
                                            <Box p='1' px='3' border='1px solid black' borderBottomLeftRadius={'5px'} borderRight='none' w='100%'>
                                                <Text>Certificate Released</Text>
                                                <Text fontWeight='bold' textAlign='center' >{releasedCerts}</Text>
                                            </Box>
                                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                                <Text>Pending Certificates</Text>
                                                <Text fontWeight='bold' textAlign='center' >{pendingCerts}</Text>
                                            </Box>
                                            <Box p='1' px='3' borderBottomRightRadius={'5px'} border='1px solid black' w='100%'>
                                                <Text>Total</Text>
                                                <Text fontWeight='bold' textAlign='center' >{releasedCerts + pendingCerts}</Text>
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
                                <BatchedDated searchTerm={searchTerm} trainings={batchedData || []} trainingIDs={t_ids} setTrainingIDs={setIDS} setFirstSelected={setFirstSelected} />
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
                            <Certificate_Template_Mgmt />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </>
            ) : (
                <BDTracker />
            )}
        </Box>
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
