'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Box, Text, Input, Spinner, Center, Button, InputLeftAddon, Select, InputGroup, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';
import { ChevronDownIcon } from '@chakra-ui/icons'

import { TRAINING_BY_ID } from '@/types/trainees'

import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useInstructors } from '@/context/InstructorContext'

import { deployYDate } from '@/types/utils' 
import { fullMonth, } from '@/handlers/util_handler'

import { BatchedDated, UnBatchedDated, BDTracker } from '@/Components/Page/Training/Tracker'

export default function TrackerPage(){
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allInstructors } = useInstructors()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allTrainingData, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { allData: allRegData, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [hasNoBatch, setBatch] = useState<boolean>(false)
    const [isDated, setIsDated] = useState<boolean>(true)

    const [filterCourse, setCFilter] = useState<string>('')
    const [filterCompany, setCompanyFilter] = useState<string>('')
    const [filterCharge, setChargeType] = useState<string>('')
    const [filterInstructor, setInstructorFilter] = useState('')
    const [filterMode, setModeFilter] = useState('')

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()
    
    const [allTData, setAllTData] = useState<TRAINING_BY_ID[] | null>(null)

    const [totalTraineeC, setTraineeCharge] = useState<number>(0)
    const [totalCompanyC, setCompanyCharge] = useState<number>(0)
    const [totalF2FINS, setF2fIns] = useState<number>(0)
    const [totalOLIns, setOLIns] = useState<number>(0)
    const [totalF2FM, setF2FM] = useState<number>(0)
    const [totalOLM, setOLM] = useState<number>(0)
    const [totalBlended, setBlended] = useState<number>(0)
    
    const [totalGrad, setGrad] = useState<number>(0)
    const [totalPending, setPending] = useState<number>(0)
    const [totalAbsent, setAbsent] = useState<number>(0)
    const [totalCancelled, setCancelled] = useState<number>(0)
    const [totalWithdraw, setWithdraw] = useState<number>(0)

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
                    
                    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                    const trimmedMonth = months[monthSelected];

                    return (start.includes(trimmedMonth) || end.includes(trimmedMonth) )
                })
                .sort((a, b) => {
                    /* ======================
                    1️⃣ COURSE SORT
                    ====================== */
                    const courseA = allCourses?.find((c) => c.id === a.course)?.course_code?.toLowerCase() ||
                        courseCodes?.find((c) => c.id === a.course)?.company_course_code?.toLowerCase() ||
                        '';
                    const courseB = allCourses?.find((c) => c.id === b.course)?.course_code?.toLowerCase() ||
                        courseCodes?.find((c) => c.id === b.course)?.company_course_code?.toLowerCase() ||
                        '';
                    if (courseA !== courseB) {
                        return courseA.localeCompare(courseB);
                    }
                    /* ======================
                    2️⃣ BATCH NUMBER SORT
                    ====================== */
                    const batchA = courseBatch?.find((batch) => batch.id === a.batch)?.batch_no ?? '';
                    const batchB = courseBatch?.find((batch) => batch.id === b.batch)?.batch_no ?? '';
                    if (batchA !== batchB) {
                        return Number(batchB) - Number(batchA);
                    }
                    /* ======================
                    3️⃣ REGISTRATION NO SORT
                    ====================== */
                    const regNoA = allRegData?.find((r) => r.id === a.reg_ref_id)?.reg_no || '';
                    const regNoB = allRegData?.find((r) => r.id === b.reg_ref_id)?.reg_no || '';
                    // Expected format: YYYY-MM-NNN (or similar)
                    const [yearA, monthA, numA] = regNoA.split('-').map(Number);
                    const [yearB, monthB, numB] = regNoB.split('-').map(Number);
                    if (yearA !== yearB) return yearA - yearB;
                    //if (monthA !== monthB) return monthA - monthB;
                    return (numB ?? 0) - (numA ?? 0);
                })
                .filter((t) => t.reg_status >= 3 )
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
                    if (!filterInstructor) return true;
                
                    const batch = courseBatch?.find((b) => b.id === t.batch);
                    // Prioritize act_instructor if exists
                    const instructorId = batch?.act_ins || batch?.instructor;
                    return instructorId === filterInstructor;
                })
                .filter((t) => {
                    if (!filterMode) return true;
                
                    const batch = courseBatch?.find((b) => b.id === t.batch);
                    const mode = batch?.training_mode?.toLowerCase() || '';
                
                    switch (filterMode.toLowerCase()) {
                        case 'f2f':
                            return ['f2f', 'f2ft', 'f2fp'].includes(mode);
                        case 'ol':
                            return ['ol', 'olt', 'olp'].includes(mode);
                        case 'blended':
                            return mode === 'blended';
                        case 'f2fm':
                            return mode === 'f2fm';
                        case 'olm':
                            return mode === 'olm';
                        default:
                            return true;
                    }
                })
                .filter((t) => {
                    if (!filterCourse || filterCourse === '') return true;

                    return (
                        allCourses?.find((course) => course.id === t.course)?.course_code.toUpperCase() === filterCourse.toUpperCase() || 
                        courseCodes?.find((course) => course.id === t.course)?.company_course_code.toUpperCase() === filterCourse.toUpperCase()
                    )
                })

            if(!allTrainData) return

            const filteredTrainingData: TRAINING_BY_ID[] = allTrainData?.filter(t => t.batch !== '1' && t.regType === 0) || []

            const traineeChargeCount = filteredTrainingData?.filter(t => t.accountType === 0).length
            const companyChargeCount = filteredTrainingData?.filter(t => t.accountType === 1).length

            let f2fIns = 0, olIns = 0, f2fM = 0, olM = 0, blended = 0, ttlGrad = 0, ttlPending = 0, ttlCancel = 0, ttlAbsent = 0, ttlWithdraw = 0;

            allTrainData.filter((t) => t.batch !== '1').forEach(training => {
                const batch = courseBatch?.find(batch => batch.id === training.batch);
                const mode = batch?.training_mode?.toLowerCase();
                const regStatus = training.reg_status

                if (!mode) return;

                if (mode === "f2f" || mode === "f2ft" || mode === "f2fp"){
                    f2fIns++;
                    if(regStatus === 6) ttlGrad++;
                    else if (regStatus === 5) ttlPending++;
                    else if (regStatus === 7) ttlCancel++;
                    else if (regStatus === 8) ttlAbsent++;
                    else if (regStatus === 9) ttlWithdraw++;
                } 
                else if (mode === "ol" || mode === "olt" || mode === "olp"){
                    olIns++;
                    if(regStatus === 6) ttlGrad++;
                    else if (regStatus === 5) ttlPending++;
                    else if (regStatus === 7) ttlCancel++;
                    else if (regStatus === 8) ttlAbsent++;
                    else if (regStatus === 9) ttlWithdraw++;
                } 
                else if (mode === "olm"){
                    olM++;
                    if(regStatus === 6) ttlGrad++;
                    else if (regStatus === 5) ttlPending++;
                    else if (regStatus === 7) ttlCancel++;
                    else if (regStatus === 8) ttlAbsent++;
                    else if (regStatus === 9) ttlWithdraw++;
                } 
                else if (mode === "f2fm"){
                    f2fM++;
                    if(regStatus === 6) ttlGrad++;
                    else if (regStatus === 5) ttlPending++;
                    else if (regStatus === 7) ttlCancel++;
                    else if (regStatus === 8) ttlAbsent++;
                    else if (regStatus === 9) ttlWithdraw++;
                } 
                else if (mode === "blended"){
                    blended++;
                    if(regStatus === 6) ttlGrad++;
                    else if (regStatus === 5) ttlPending++;
                    else if (regStatus === 7) ttlCancel++;
                    else if (regStatus === 8) ttlAbsent++;
                    else if (regStatus === 9) ttlWithdraw++;
                } 
            });

            // 3️⃣ Set the states
            setAllTData(allTrainData ?? []);

            setTraineeCharge(traineeChargeCount);
            setCompanyCharge(companyChargeCount);
            setF2fIns(f2fIns);
            setOLIns(olIns);
            setF2FM(f2fM);
            setOLM(olM);
            setBlended(blended);
            setGrad(ttlGrad);
            setPending(ttlPending);
            setAbsent(ttlAbsent);
            setCancelled(ttlCancel);
            setWithdraw(ttlWithdraw);
            setLoading(false)
        }
        fetchData()
    },[monthSelected, yearSelected, allTrainingData, filterCharge, filterCourse, filterInstructor, filterMode, filterCompany])

    const batchedData = useMemo(
        () => allTData?.filter(t => t.regType === 0).filter(t => t.batch !== '1'),
        [allTData]
    );

    const unBatchedData = useMemo(
        () => allTData?.filter(t => t.regType === 0).filter(t => t.batch === '1'),
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

    return(
    <>
        <Box>
            {/** Helpful Widgets, 
             * Gets Total Company Charge | Total Trainee Charge |
             * Total f2f Modular |
            * Total Ol Modular |
             * Problem: How to determine the OL/INS, F2f/INS, and BLENDED (OL THEO & F2F PRAC)
             * Given:
                * Total f2f theoretical | Total f2f Practical | Total f2f Both Prac & Theo
                * total ol theoretical | Total ol Practical | Total OL Both Prac & Theo 
            * Solution:
                * OL/INS = olt + olp + ol
                * F2f/INS = f2ft + f2fp +f2f
                * Blended = purely blended
            * */}
            {isDated ? (
            <>
                <Box display='flex' fontWeight='normal' justifyContent='space-between' gap='8' mb='2'>
                    <Box display='flex' w='50%' justifyContent='space-between'>
                        <Box w='100%'>
                            <Box p='1' px='3' border='1px solid black' borderBottom='none' borderRight='none' w='100%'>
                                <Text>Company</Text>
                                <Text fontWeight='bold' textAlign='center' >{totalCompanyC}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>Trainee</Text>
                                <Text fontWeight='bold' textAlign='center' >{totalTraineeC}</Text>
                            </Box>
                        </Box>
                        <Box w='100%'>
                            <Box p='1' px='3' border='1px solid black' borderBottom='none' borderRight='none' w='100%'>
                                <Text>F2F/MODULAR</Text>
                                <Text fontWeight='bold' textAlign='center' >{totalF2FM}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>OL/MODULAR</Text>
                                <Text fontWeight='bold' textAlign='center' >{totalOLM}</Text>
                            </Box>
                        </Box>
                        <Box w='100%'>
                            <Box p='1' px='3' border='1px solid black' borderBottom='none' borderRight='none' w='100%'>
                                <Text>F2F/INS</Text>
                                <Text fontWeight='bold' textAlign='center' >{totalF2FINS}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderRight='none' w='100%'>
                                <Text>OL/INS</Text>
                                <Text fontWeight='bold' textAlign='center' >{totalOLIns}</Text>
                            </Box>
                        </Box>
                        <Box w='100%'>
                            <Box p='1' px='3' border='1px solid black' borderBottom='none' w='100%'>
                                <Text>BLENDED</Text>
                                <Text fontWeight='bold' textAlign='center' >{totalBlended}</Text>
                            </Box>
                            <Box p='1' px='3' border='1px solid black' borderBottom='none' borderRight='none' w='100%'>
                                <Text>&nbsp;</Text>
                                <Text>&nbsp;</Text>
                            </Box>
                        </Box>
                    </Box>
                    <Box display='flex' w='50%' justifyContent='space-between' mb='4'>
                        <Box ms='4' w='100%'>
                            <Box w='100%' py='1' h='50%' textAlign='center' bgColor='green.400'>
                                <Text fontWeight='bold' >GRADUATED</Text>
                                <Text>{`${totalGrad} trainee${totalGrad === 1 ? '' : 's'}`}</Text>
                            </Box>
                            <Box w='100%' py='1' h='50%' color='white' textAlign='center' bgColor='blue.400'>
                                <Text fontWeight='bold' >WITHDRAW</Text>
                                <Text>{`${totalWithdraw} trainee${totalWithdraw === 1 ? '' : 's'}`}</Text>
                            </Box>
                        </Box>
                        <Box w='100%'>
                            <Box w='100%' py='1' h='50%' textAlign='center' bgColor='yellow.400'>
                                <Text fontWeight='bold' >PENDING</Text>
                                <Text>{`${totalPending} trainee${totalPending === 1 ? '' : 's'}`}</Text>
                            </Box>
                            <Box w='100%' py='1' h='50%' textAlign='center' bgColor='red.400'>
                                <Text fontWeight='bold' >ABSENT</Text>
                                <Text>{`${totalAbsent} trainee${totalAbsent === 1 ? '' : 's'}`}</Text>
                            </Box>
                        </Box>
                        <Box w='100%' display='flex' flexDir='column' justifyContent='center' alignItems='center' color='white' textAlign='center' bgColor='red.500'>
                            <Text fontWeight='bold' >CANCELLED</Text>
                            <Text>{`${totalCancelled} trainee${totalCancelled === 1 ? '' : 's'}`}</Text>
                        </Box>
                    </Box>
                </Box>
                <Box mb='2' className="w-full flex justify-between">
                    <Box className="flex" w='55%' mr='2'>
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
                        {/* Instructor Filter */}
                        <Select size='sm' mr='4' value={filterInstructor} onChange={(e) => setInstructorFilter(e.target.value)} shadow='md'>
                            <option hidden>Filter Instructor</option>
                            {allInstructors && [...allInstructors]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((ins) => (
                                <option key={ins.id} value={ins.id}>{ins.name.toUpperCase()}</option>
                            ))}
                        </Select>

                        {/* Mode of Training Filter */}
                        <Select size='sm' mr='4' value={filterMode} onChange={(e) => setModeFilter(e.target.value)} shadow='md'>
                            <option hidden>Filter Mode</option>
                            <option value='f2f'>F2F/INS</option>
                            <option value='ol'>OL/INS</option>
                            <option value='blended'>Blended</option>
                            <option value='f2fm'>F2F-Modular</option>
                            <option value='olm'>OL-Modular</option>
                        </Select>
                        {(filterCourse || filterCompany || filterInstructor || filterCharge || filterMode) && (
                            <Button w='50%' mr={4} onClick={() => { setChargeType(''); setCompanyFilter(''); setInstructorFilter(''); setModeFilter(''); setCFilter('');}} colorScheme='red' size='sm' shadow='md'>Clear Filter</Button>
                        )}
                        <Button w='60%' mr={4} onClick={onOpenDate} rightIcon={<ChevronDownIcon />} size='sm' shadow='md'>Filter Date</Button>
                    </Box>
                </Box>
                {loading ? (
                    <Center py={8}>
                        <Spinner size="lg" color="blue.500" mr={3} />
                        <Text fontWeight="medium" color="gray.600">Loading Training Records...</Text>
                    </Center>
                ) : (hasNoBatch ? (
                        <UnBatchedDated searchTerm={searchTerm} trainings={unBatchedData || []} />
                    ) : (
                        <BatchedDated searchTerm={searchTerm} trainings={batchedData || []} />
                    )
                )}
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
