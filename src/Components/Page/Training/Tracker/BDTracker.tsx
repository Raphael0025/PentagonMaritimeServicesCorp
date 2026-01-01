'use client'

import React, { useState, useEffect } from 'react'
import { Box, Text, Input, Textarea, Spinner, Center, Button, ButtonGroup, Checkbox, InputLeftAddon, FormControl, Select, InputGroup, useDisclosure, useToast, Alert, AlertTitle, AlertDescription, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';
import { ChevronDownIcon } from '@chakra-ui/icons'

import { TRAINING_BY_ID } from '@/types/trainees'

import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useRank } from '@/context/RankContext'
import { useInstructors } from '@/context/InstructorContext'

import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { handleRegStatus } from '@/handlers/trainee_handler'
import { deployYDate } from '@/types/utils' 
import { fullMonth, backgroundColor, trainingModeFontColor, trainingModeColor } from '@/handlers/util_handler'

import { UPDATE_TRAINING, UPDATE_TRAINING_FORMS } from '@/lib/trainee_controller'

export default function BDTracker (){
    const toast = useToast()
    const { data: allRanks } = useRank()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allInstructors } = useInstructors()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainingData, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { lastMonthReg: allRegData, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const staff: string | null = localStorage.getItem('customToken')
    const [position, setPosition] = useState<string | null>('')
    const [schedule, setSchedule] = useState<string>('')
    const [traineeName, setTraineeName] = useState<string>('')
    const [training_ID, setTrainingID] = useState<string>('')
    const [displayEmail, setEmailDisplay] = useState<string>('')
    const [time, setTime] = useState<string>('')
    const [trainingMode, setTrainingMode] = useState<string>('')
    const [courseID, setCourse] = useState<string>('')
    const [selectedEmails, setSelectedEmails] = useState<string[]>([])

    const [togglePanel, setToggle] = useState<boolean>(true)
    const [remarks, setRemarks] = useState<string>('')
    const [t_id, setID] = useState<string>('')

    const [filterCourse, setCFilter] = useState<string>('')
    const [filterCompany, setCompanyFilter] = useState<string>('')
    const [filterCharge, setChargeType] = useState<string>('')
    const [filterInstructor, setInstructorFilter] = useState('')
    const [filterMode, setModeFilter] = useState('')

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()
    const { isOpen: isOpenMod, onOpen: onOpenMod, onClose: onModClose } = useDisclosure()
    const { isOpen: isOpenRemarks, onOpen: onOpenRemarks, onClose: onCloseRemarks } = useDisclosure()
    
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
            const allTrainData = allTrainingData && allTrainingData.sort((a, b) => {
                    return a.date_enrolled.toMillis() - b.date_enrolled.toMillis();
                })
                .filter((t) => {
                    const registration = allRegData?.find((r) => r.id === t.reg_ref_id);
                    if(!registration) return false;
                    
                    //jconst currYear = new Date().getFullYear()

                    const splitRegNo = registration.reg_no.split('-')
                    const regYear = Number(splitRegNo[0])
                    
                    return regYear === yearSelected
                })
                .filter((t) => t.reg_status >= 3 && t.regType === 1)
                .sort((a, b) => {
                    // Get course names from allCourses or courseCodes
                    const courseA =
                    allCourses?.find((course) => course.id === a.course)?.course_code?.toLowerCase() ||
                    courseCodes?.find((course) => course.id === a.course)?.company_course_code?.toLowerCase() ||
                    '';
                    const courseB =
                    allCourses?.find((course) => course.id === b.course)?.course_code?.toLowerCase() ||
                    courseCodes?.find((course) => course.id === b.course)?.company_course_code?.toLowerCase() ||
                    '';
            
                    // Compare alphabetically by course name
                    if (courseA < courseB) return -1;
                    if (courseA > courseB) return 1;
            
                    return courseA.localeCompare(courseB);
                })
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

            const filteredTrainingData: TRAINING_BY_ID[] = allTrainData?.filter(t => t.regType === 1) || []

            const traineeChargeCount = filteredTrainingData?.filter(t => t.accountType === 0).length
            const companyChargeCount = filteredTrainingData?.filter(t => t.accountType === 1).length

            let f2fIns = 0, olIns = 0, f2fM = 0, olM = 0, blended = 0, ttlGrad = 0, ttlPending = 0, ttlCancel = 0, ttlAbsent = 0, ttlWithdraw = 0;

            allTrainData.filter((t) => t.batch === '1').forEach(training => {
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

    const handleComplianceStatus = (trainingID: string, complianceForm: string) => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat: Partial<TRAINING_BY_ID> = {}
                    switch(complianceForm){
                        case 'attendance':
                            const currentAttendance = allTData?.find(t => t.id === trainingID)?.attendance || false
                            updateStat.attendance = !currentAttendance
                            break;
                        case 'assessment':
                            const currentAssessment = allTData?.find(t => t.id === trainingID)?.assessment || false
                            updateStat.assessment = !currentAssessment
                            break;
                        case 'ccr':
                            const currentCcr = allTData?.find(t => t.id === trainingID)?.ccr || false
                            updateStat.ccr = !currentCcr
                            break;
                        case 'evaluation':
                            const currentEvaluation = allTData?.find(t => t.id === trainingID)?.evaluation || false
                            updateStat.evaluation = !currentEvaluation
                            break;
                        default:
                            break;
                    }
                    await UPDATE_TRAINING_FORMS(trainingID, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast(`${complianceForm.charAt(0).toUpperCase()+complianceForm.slice(1)} Successfully Complied!`, `Trainee has complied their ${complianceForm}.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
        })
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

    const handleTrainingMode = async () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat = {
                        trainingMode,
                    }
                    await UPDATE_TRAINING(training_ID, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Status Updated Successfully!', `Crew's training status has been updated successfully.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
        })
    }
    
    const handleStatus = async (trainingID: string, newStatus: number) => {
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
                }
            }, 500)
        }).then(() => {
            handleToast('Status Updated Successfully!', `Crew's training status has been updated successfully.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
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
            setLoading(false)
        })
    }

    const handleNotifyTrainees = () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout( async () => {
                try{
                    const courseFound = allCourses?.find((course) => {
                        if (course.id === courseID) {
                            return true;
                        }
                        const courseCode = courseCodes?.find((code) => code.id === courseID);
                        return course.id === courseCode?.id_course_ref;
                    });
                    const class_code = courseFound?.class_code

                    const route = trainingMode === 'olm' ? '/api/training-advise/olm-route' : '/api/training-advise/olt-route';
                    await fetch(route, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        }, 
                        body: JSON.stringify({
                            bcc: selectedEmails, 
                            course_code: courseFound?.course_code, 
                            course_name: courseFound?.course_name, 
                            schedule, 
                            time, 
                            class_code, 
                            staff, 
                            position 
                        })
                    })
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() =>{
            handleToast( 'Notified Trainee Successfully!', `Trainees have been successfully sent the training details via email.`, 5000, 'success' )
        }).catch((error) => {
            console.error('Error: ', error)
        }).finally(() =>{
            onModClose()
            setSelectedEmails([])
            setSchedule('')
            setCourse('')
            setTime('')
            setTrainingMode('')
            setLoading(false)
        })
    }

    const trainingModes = [
        {label: 'Face-to-Face BOTH THEORETICAL &  PRACTICAL', value: 'f2f'},
        {label: 'Face-to-Face MODULAR', value: 'f2fm'},
        {label: 'Face-to-Face THEORETICAL', value: 'f2ft'},
        {label: 'Face-to-Face PRACTICAL', value: 'f2fp'},
        {label: 'Online BOTH THEORETICAL &  PRACTICAL', value: 'ol'},
        {label: 'Online MODULAR', value: 'olm'},
        {label: 'Online THEORETICAL', value: 'olt'},
        {label: 'Online PRACTICAL', value: 'olp'},
        {label: 'Blended', value: 'blended'},
    ]

    return(
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
                    <Box p='1' px='3' border='1px solid black' w='100%'>
                        <Text>OL/INS</Text>
                        <Text fontWeight='bold' textAlign='center' >{totalOLIns}</Text>
                    </Box>
                </Box>
                <Box w='100%'>
                    <Box p='1' px='3' border='1px solid black' w='100%'>
                        <Text>BLENDED</Text>
                        <Text fontWeight='bold' textAlign='center' >{totalBlended}</Text>
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
        <Box h='650px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}} >
            {/** Headers */}
            <Text>BackDated Training Records</Text>
            <Box w='2650px' bgColor='blue.700' mb='2' color='white' display='flex' textAlign='center' className='space-x-3' alignItems='center' borderRadius='5px' borderColor='gray' borderWidth='1px' borderStyle='solid' p='2'>
                <Text w='15px'>#</Text>
                <Text w='100px'>Date Endorsed</Text>
                <Text w='150px'>Registration No.</Text>
                <Text w='80px'>Type</Text>
                <Text w='80px'>Course</Text>
                <Text w='280px'>Trainee Name</Text>
                <Text w='50px'>Rank</Text>
                <Box display={'flex'} flexDirection='column'>
                    <Text>Training Schedule</Text>
                    <Box display='flex' className='space-x-3' justifyContent='space-between'>
                        <Text w='100px'>From</Text>
                        <Text w='100px'>To</Text>
                    </Box>
                </Box>
                <Text w='100px'>Payment Mode</Text>
                <Text w='105px'>Mode of Training</Text>
                <Text w='105px'>Status</Text>
                <Text w='185px'>Instructor</Text>
                <Text w='105px'>Attendance</Text>
                <Text w='105px'>Assessment</Text>
                <Text w='105px'>Feedback</Text>
                <Text w='300px'>Remarks</Text>
            </Box>
            {/** Current Month Data Table */}
            <Box>
            {!allTData ? (
                <Center py={8}>
                    <Spinner size="lg" color="blue.500" mr={3} />
                    <Text fontWeight="medium" color="gray.600">Loading current month training records...</Text>
                </Center>
            ) : allTData.length === 0 ? (
                <Center py={8}>
                    <Text fontWeight="medium" color="gray.500">No training records found.</Text>
                </Center>
            ) : (allTData?.map((training, index) => {
                    const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                    const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                    //const reg_id = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.id ?? ''
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
                        <Box key={training.id} _hover={{bgColor: 'blue.100', color: 'black'}} borderRadius='5px' color={training.reg_status === 7 ? 'white' : 'black'} bgColor={backgroundColor(training.reg_status)} w='2650px' fontWeight='normal' mb='1' className="flex text-center border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                <Box px='1' className='w-full flex space-x-3'>
                                    <Text w="15px" textAlign='center'>{`${(index + 1)}.`}</Text>                                                                             
                                    <Text w="100px">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                    <Text w="150px" _hover={{cursor: 'pointer', color: 'blue.700'}} onClick={() => {
                                            setSchedule(training.end_date !== '' ? `${training.start_date.toUpperCase()} to ${training.end_date.toUpperCase()}` : `${training.start_date.toUpperCase()}`); 
                                            setSelectedEmails(prev => [...prev, trainee.email]); 
                                            setCourse(training.course);
                                            setTrainingMode(training?.trainingMode || '');
                                            setTrainingID(training.id);
                                            setTraineeName(`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name}`);
                                            setEmailDisplay(trainee.email);
                                            onOpenMod();
                                        }} className='hover:cursor-pointer'>
                                        {`Reg-${reg_num}`}
                                    </Text>        
                                    <Text w="80px">
                                        {(() => {
                                            const courseCode = courseCodes?.find((code) => code.id === training.course);
                                            const courseFound = allCourses?.find((course) => course.id === training.course || course.id === courseCode?.id_course_ref)
                                            return courseFound?.trainingMode === 0 ? 'Non' : 'Simu'
                                        })()}
                                    </Text>                                
                                    <Text w="80px">
                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                    </Text>                                         
                                    <Text w="280px">{`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''}`}</Text>                                        
                                    <Text w="50px">
                                        {allRanks?.find((rank) => rank.code === trainee.rank)?.rank || trainee.rank}
                                    </Text>   
                                </Box>
                            </Box>
                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                <Box className='w-full flex uppercase space-x-3'>
                                    <Text w="100px">{training.start_date}</Text>    
                                    <Text w="100px">{training.end_date === '' ? '--' : training.end_date}</Text>    
                                </Box>
                            </Box>
                            <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                            <Text w="100px" p='1' borderRadius='5px' color={trainingModeFontColor(trainingMode)} bgColor={trainingModeColor(trainingMode)}>
                                {`${training?.trainingMode ?? '--'}`}
                            </Text>  
                            <Select isDisabled={loading} onChange={(e) => handleStatus(training.id, Number(e.target.value))} borderRadius='5px' size='xs' w='100px' shadow='md' >
                                <option value={3} hidden>{handleRegStatus(training.reg_status)}</option>
                                <option value={6}>Graduated</option>
                                <option value={5}>Pending</option>
                                <option value={7}>Cancelled</option>
                                <option value={8}>Absent</option>
                            </Select>
                            <Text w="180px" >
                            {(() => {
                                const trainingBatch = courseBatch?.find((batch) => batch.id === training.batch)
                                const ins = allInstructors?.find((i) => i.id === trainingBatch?.act_ins);
                                if (!ins) return trainingBatch?.act_ins || 'No Instructor';

                                // Add 'MM' if rank is 'CAPT'
                                const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                return `${ins.rank} ${ins.name}${suffix}`;
                            })()}
                            </Text>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'attendance')}} isChecked={training?.attendance} shadow='md' />
                            </Box>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'assessment')}} isChecked={training?.assessment} shadow='md' />
                            </Box>   
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'evaluation')}} isChecked={training?.evaluation} shadow='md' />
                            </Box>  
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
        <Modal isOpen={isOpenMod} onClose={() => {setSelectedEmails([]); setTrainingID(''); setToggle(true); setSchedule(''); setCourse(''); setTime(''); setTrainingMode(''); onModClose();}} >
            <ModalOverlay />
            <ModalContent px='2'>
                <ModalHeader>
                {togglePanel ? (
                    <Text>Training Mode</Text>
                ) : (
                    <Text>Training Advisory</Text>
                )}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box display='flex' justifyContent='end' mb='1'>
                        <ButtonGroup isAttached size='sm' shadow='md'>
                            <Button size='sm' onClick={() => setToggle(false)} fontWeight='normal' colorScheme='blue' variant={!togglePanel ? 'solid' : 'outline'}>Notify Trainee</Button>
                            <Button size='sm' onClick={() => setToggle(true)} fontWeight='normal' colorScheme='blue' variant={togglePanel ? 'solid' : 'outline'}>Training Mode</Button>
                        </ButtonGroup>
                    </Box>
                    {!togglePanel ? (
                        <>
                        <Box borderTop='1px solid' pt='1'>
                            <Box display='flex' flexDir='column' justifyContent='space-between'>
                                <Box mb='2'>
                                    <Text color='gray.600' fontWeight='bold'>{`This will send the training details to the trainee displayed below. Please ensure that a training mode is selected before proceeding:`}</Text>
                                    <Box display='flex'>
                                        <Text fontWeight='bold' mr='2'>{`Trainee:`}</Text>
                                        <Text fontWeight='normal'>{`${traineeName.toUpperCase()}`}</Text>
                                    </Box>
                                    <Box display='flex'>
                                        <Text fontWeight='bold' mr='2'>{`Email:`}</Text>
                                        <Text fontWeight='normal'>{`${displayEmail}`}</Text>
                                    </Box>
                                </Box>
                                <Box display='flex'>
                                    <Text fontWeight='bold' mr='2'>{`Training Mode:`}</Text>
                                    <Text fontWeight='normal'>{`${trainingModes.find((tm) => tm.value === trainingMode)?.label.toUpperCase() || ''}`}</Text>
                                </Box>
                                <InputGroup shadow='md' my='2' w='100%' size='sm'>
                                    <InputLeftAddon>Time:</InputLeftAddon>
                                    <Input id='time_duration' type='text' value={time} placeholder={`e.g., 7:00am-5:00pm`} onChange={(e) => setTime(e.target.value)} />
                                </InputGroup>
                            </Box>
                        </Box>
                        <Alert status='info' display='flex' alignItems='start' flexDirection='column' gap={2} mt={3}>
                            <Box display='inline-flex'>
                                <AlertIcon />
                                <AlertTitle>Note:</AlertTitle>
                            </Box>
                            <AlertDescription lineHeight='0.9rem' fontWeight='normal'>
                                This will send an email notifying the trainee of the training details. Please ensure the training mode has been set. Also, Please ensure that the email address is valid and correct before proceeding, one incorrect detail may cause of not sending/advising the trainees.
                            </AlertDescription>
                        </Alert>
                        </>
                    ) : (   
                    <>
                    <Box mt='2' display='flex' flexDir='column'>
                        {trainingModes.map((mode, index) => (
                            <Button _hover={{bgColor: 'cyan.500', color: 'white', cursor: 'pointer', variant: 'solid' }} colorScheme='blue' variant={`${trainingMode === mode.value ? 'solid' : 'outline'}`} key={index} size='sm' fontWeight='normal' mb='2' shadow='md' onClick={() => setTrainingMode(mode.value)}>{mode.label}</Button>
                        ))}
                    </Box>
                    </>
                    )}
                </ModalBody>
                <ModalFooter>
                    {togglePanel ? (
                        <Button isLoading={loading} isDisabled={trainingMode === ''} loadingText='Updating...' bgColor='blue.700' colorScheme='blue' w='100%' shadow='md' onClick={handleTrainingMode}>Set Training Mode</Button>
                    ) : (
                        <Button isLoading={loading} isDisabled={time === '' } loadingText='Notifying Trainee...' bgColor='blue.700' colorScheme='blue' w='100%' shadow='md' onClick={handleNotifyTrainees}>Notify Trainee</Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal isOpen={isOpenRemarks} scrollBehavior='inside' onClose={() => {setRemarks(''); setID(''); onCloseRemarks();}}>
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
                    <Button onClick={handleRemarks} isLoading={loading} loadingText='Saving...' colorScheme='blue' shadow='md' size='sm' bgColor='blue.700'>Save Remarks</Button>
                </ModalFooter>
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