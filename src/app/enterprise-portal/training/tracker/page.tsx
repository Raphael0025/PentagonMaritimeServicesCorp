'use client'

import React, { useState } from 'react'
import { Box, Text, Input, Textarea, Spinner, Center, Button, Checkbox, InputLeftAddon, FormControl, Select, FormLabel, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';
import { ChevronDownIcon } from '@chakra-ui/icons'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
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

import { UPDATE_TRAINING } from '@/lib/trainee_controller'

export default function TrackerPage(){
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { data: allRanks } = useRank()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining, prevData: allPrevTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { data: allCourses } = useCourses()
    const { lastMonthReg: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()
    const { data: allInstructors } = useInstructors()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const [filterCourse, setCFilter] = useState<string>('')
    const [filterCompany, setCompanyFilter] = useState<string>('')

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())


    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()

    
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

    return(
    <>
        <Box>
            <Text>TRAINING TRACKER</Text>
            {/** Helpful Widgets, 
             * Gets Total Company Charge | Total Trainee Charge |
             * Total f2f Modular |
            * Total Ol Modular |
             * Problem: How to determine the OL/INS, F2f/INS, and BLENDED (OL THEO & F2F PRAC)
             * Given:
                * Total f2f theoretical | Total f2f Practical | Total f2f Both Prac & Theo
                * total ol theoretical | Total ol Practical | Total OL Both Prac & Theo 
            * Solution:
                *  
            * */}
            <Box>

            </Box>
            <Box mb='2' className="w-full flex justify-between">
                <Box className="w-full flex">
                    <InputGroup w="40%" className="shadow-md rounded-lg">
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
                <Box w='80%' display='flex' >
                    <Select size='sm' mr='4' value={filterCourse} onChange={(e) => {setCFilter(e.target.value);}} shadow='md'>
                        <option hidden>Filter Course</option>
                        {allCourses && [...allCourses]
                        .sort((a, b) => a.course_code.localeCompare(b.course_code))
                        .map((c) => (
                            <option key={c.id} value={c.course_code}>{c.course_code.toUpperCase()}</option>
                        ))}
                    </Select>
                    <Select size='sm' mr='4' value={filterCompany} onChange={(e) => {setCompanyFilter(e.target.value);}} shadow='md'>
                        <option hidden>Filter Company</option>
                        {allClients && [...allClients]
                        .sort((a, b) => a.company.localeCompare(b.company))
                        .map((c) => (
                            <option key={c.id} value={c.id}>{c.company.toUpperCase()}</option>
                        ))}
                    </Select>
                    {(filterCourse !== '')&& (
                        <Button w='50%' mr={4} onClick={() => { setCompanyFilter(''); setCFilter('');}} colorScheme='red' size='sm' shadow='md'>Clear Filter</Button>
                    )}
                    <Button w='60%' mr={4} onClick={onOpenDate} rightIcon={<ChevronDownIcon />} size='sm' shadow='md'>Filter Date</Button>
                </Box>
            </Box>
            <Box h='650px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}} >
                {/** Headers */}
                <Box w='2650px' bgColor='blue.700' mb='2' color='white' display='flex' textAlign='center' className='space-x-3' alignItems='center' borderRadius='5px' borderColor='gray' borderWidth='1px' borderStyle='solid' p='2'>
                    <Text w='100px'>Date Endorsed</Text>
                    <Text w='150px'>Registration No.</Text>
                    <Text w='80px'>Type</Text>
                    <Text w='80px'>Course</Text>
                    <Text w='80px'>Batch</Text>
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
                    <Text w='105px'>CCR</Text>
                    <Text w='105px'>Feedback</Text>
                    <Text w='300px'>Remarks</Text>
                </Box>
                {/** Previous Month Data Table */}
                <Box>
                <Text>{`*Trainings Enrolled from the previous month`}</Text>
                {!allPrevTraining ? (
                    <Center py={8}>
                        <Spinner size="lg" color="blue.500" mr={3} />
                        <Text fontWeight="medium" color="gray.600">Loading previous month training records...</Text>
                    </Center>
                ) : allPrevTraining.length === 0 ? (
                    <Center py={8}>
                        <Text fontWeight="medium" color="gray.500">No training records found.</Text>
                    </Center>
                ) : (allPrevTraining && allPrevTraining.sort((a, b) => {
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
                
                        // If same course, compare by batch number (ascending)
                        const batchA =
                        courseBatch?.find((batch) => batch.id === a.batch)?.batch_no || 0;
                        const batchB =
                        courseBatch?.find((batch) => batch.id === b.batch)?.batch_no || 0;
                
                        return batchA - batchB;
                    })
                    .filter((t) => t.reg_status >= 3 && t.regType === 0 )
                    .filter((t) => {
                        const registration = allRegistrations?.find((r) => r.id === t.reg_ref_id);
                        const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);
                        if (!trainee) return false;
                        if (filterCompany === '') return true;

                        return trainee.company === filterCompany
                        //allClients?.find((client) => client.id === trainee.company)?.company || trainee.company
                    })
                    .filter((t) => {
                        if (!filterCourse || filterCourse === '') return true;

                        return (
                            allCourses?.find((course) => course.id === t.course)?.course_code.toUpperCase() === filterCourse.toUpperCase() || 
                            courseCodes?.find((course) => course.id === t.course)?.company_course_code.toUpperCase() === filterCourse.toUpperCase()
                        )
                    })
                    .filter((t) => {
                        // Example: "Mon, Oct 1"
                        const monthFromStartDate = t.start_date?.split(', ')[1]?.split(' ')[0]; // e.g., "Oct"
                    
                        // Map month abbreviations to indices (0–11)
                        const monthMap: Record<string, number> = {
                            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
                            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
                        };
                    
                        // Convert extracted month (e.g. "Oct") to its index
                        const trainingMonthIndex = monthMap[monthFromStartDate.toLowerCase()];
                    
                        // Keep only if start_date month matches the selected month
                        return trainingMonthIndex === monthSelected;
                    })
                    .map((training) => {
                    
                    const registration = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                    const reg_num = allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                    //const reg_id = allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.id ?? ''
                    
                    if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    ){
                        return(
                            <Box key={training.id} borderRadius='5px' color={training.reg_status === 7 ? 'white' : 'black'} bgColor={backgroundColor(training.reg_status)} w='2650px' fontWeight='normal' mb='1' className="flex text-center border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                    <Box className='w-full flex space-x-3'>
                                        <Text w="100px">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                        <Text w="150px" _hover={{color: 'blue.700'}} onClick={() => {
                                            // setRegNum(reg_id); 
                                            // onOpenReg();
                                            }} className='hover:cursor-pointer'>
                                            {`Reg-${reg_num}`}
                                        </Text>        
                                        <Text w="80px">
                                            {allCourses?.find((course) => course.id === training.course)?.trainingMode === 0 ? 'Non' : 'Simu' }
                                        </Text>                                
                                        <Text w="80px">
                                            {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                        </Text>                                        
                                        <Text w="80px">
                                            {`${courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `B${courseBatch.find((batch) => batch.id === training.batch)?.batch_no}` : ''}`}
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
                                {(() => {
                                    const trainingMode = courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `${courseBatch.find((batch) => batch.id === training.batch)?.training_mode}` : ''
                                    return(
                                        <Text w="100px" p='1' borderRadius='5px' color={trainingModeFontColor(trainingMode)} bgColor={trainingModeColor(trainingMode)}>
                                            {`${trainingMode}`}
                                        </Text>  
                                    )
                                })()}
                                <Select isDisabled={loading} onChange={(e) => handleStatus(training.id, Number(e.target.value))} borderRadius='5px' size='xs' w='100px' shadow='md' >
                                    <option value={3} hidden>{handleRegStatus(training.reg_status)}</option>
                                    <option className='text-black' value={6}>Graduated</option>
                                    <option className='text-black' value={4}>On-Hold</option>
                                    <option className='text-black' value={7}>Cancelled</option>
                                    <option className='text-black' value={8}>Absent</option>
                                </Select>
                                <Text w="180px" >
                                {(() => {
                                    const trainingBatch = courseBatch?.find((batch) => batch.id === training.batch)
                                    const ins = allInstructors?.find((i) => i.id === trainingBatch?.assessor);
                                    if (!ins) return trainingBatch?.assessor || 'No Instructor';

                                    // Add 'MM' if rank is 'CAPT'
                                    const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                    return `${ins.rank} ${ins.name}${suffix}`;
                                })()}    
                                </Text>  
                                <Box w="100px" >
                                    <Checkbox colorScheme='green' defaultChecked/>
                                </Box>  
                                <Box w="100px" >
                                    <Checkbox colorScheme='green' defaultChecked/>
                                </Box>  
                                <Box w="100px" >
                                    <Checkbox colorScheme='green' defaultChecked/>
                                </Box>  
                                <Box w="100px" >
                                    <Checkbox colorScheme='green' defaultChecked/>
                                </Box>  
                                <Button onClick={() => {
                                    // setID(training.id); 
                                    // setRemarks(training.train_remarks); 
                                    // onOpenRm();
                                    }} size='sm' p={0} variant='link' w='300px'>
                                    <Text className={`${training.train_remarks === '' ? 'text-gray-400' : 'text-cyan-600'}`}>
                                        {training.train_remarks === '' ? 'None' : 'View'}
                                    </Text>
                                </Button>                                     
                            </Box>
                        )
                    }
                }))}
                </Box>
                {/** Current Month Data Table */}
                <Box>
                <Text>{`*Trainings Enrolled in the current month`}</Text>
                {!allTraining ? (
                    <Center py={8}>
                        <Spinner size="lg" color="blue.500" mr={3} />
                        <Text fontWeight="medium" color="gray.600">Loading current month training records...</Text>
                    </Center>
                ) : allTraining.length === 0 ? (
                    <Center py={8}>
                        <Text fontWeight="medium" color="gray.500">No training records found.</Text>
                    </Center>
                ) : (allTraining && allTraining.sort((a, b) => {
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
                
                        // If same course, compare by batch number (ascending)
                        const batchA =
                        courseBatch?.find((batch) => batch.id === a.batch)?.batch_no || 0;
                        const batchB =
                        courseBatch?.find((batch) => batch.id === b.batch)?.batch_no || 0;
                
                        return batchA - batchB;
                    })
                    .filter((t) => t.reg_status >= 3 && t.regType === 0 )
                    .filter((t) => {
                        const registration = allRegistrations?.find((r) => r.id === t.reg_ref_id);
                        const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);
                        if (!trainee) return false;
                        if (filterCompany === '') return true;

                        return trainee.company === filterCompany
                        //allClients?.find((client) => client.id === trainee.company)?.company || trainee.company
                    })
                    .filter((t) => {
                        if (!filterCourse || filterCourse === '') return true;

                        return (
                            allCourses?.find((course) => course.id === t.course)?.course_code.toUpperCase() === filterCourse.toUpperCase() || 
                            courseCodes?.find((course) => course.id === t.course)?.company_course_code.toUpperCase() === filterCourse.toUpperCase()
                        )
                    })
                    .filter((t) => {
                        // Example: "Mon, Oct 1"
                        const monthFromStartDate = t.start_date?.split(', ')[1]?.split(' ')[0]; // e.g., "Oct"
                    
                        // Map month abbreviations to indices (0–11)
                        const monthMap: Record<string, number> = {
                            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
                            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
                        };
                    
                        // Convert extracted month (e.g. "Oct") to its index
                        const trainingMonthIndex = monthMap[monthFromStartDate.toLowerCase()];
                    
                        // Keep only if start_date month matches the selected month
                        return trainingMonthIndex === monthSelected;
                    })
                    .map((training) => {
                    
                    const registration = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                    const reg_num = allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                    //const reg_id = allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.id ?? ''
                    
                    if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    ){
                        return(
                            <Box key={training.id} borderRadius='5px' color={training.reg_status === 7 ? 'white' : 'black'} bgColor={backgroundColor(training.reg_status)} w='2650px' fontWeight='normal' mb='1' className="flex text-center border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                    <Box className='w-full flex space-x-3'>
                                        <Text w="100px">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                        <Text w="150px" _hover={{color: 'blue.700'}} onClick={() => {
                                            // setRegNum(reg_id); 
                                            // onOpenReg();
                                            }} className='hover:cursor-pointer'>
                                            {`Reg-${reg_num}`}
                                        </Text>        
                                        <Text w="80px">
                                            {allCourses?.find((course) => course.id === training.course)?.trainingMode === 0 ? 'Non' : 'Simu' }
                                        </Text>                                
                                        <Text w="80px">
                                            {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                        </Text>                                        
                                        <Text w="80px">
                                            {`${courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `B${courseBatch.find((batch) => batch.id === training.batch)?.batch_no}` : ''}`}
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
                                {(() => {
                                    const trainingMode = courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `${courseBatch.find((batch) => batch.id === training.batch)?.training_mode}` : ''
                                    return(
                                        <Text w="100px" p='1' borderRadius='5px' color={trainingModeFontColor(trainingMode)} bgColor={trainingModeColor(trainingMode)}>
                                            {`${trainingMode}`}
                                        </Text>  
                                    )
                                })()}
                                <Select isDisabled={loading} onChange={(e) => handleStatus(training.id, Number(e.target.value))} borderRadius='5px' size='xs' w='100px' shadow='md' >
                                    <option value={3} hidden>{handleRegStatus(training.reg_status)}</option>
                                    <option className='text-black' value={6}>Graduated</option>
                                    <option className='text-black' value={4}>On-Hold</option>
                                    <option className='text-black' value={7}>Cancelled</option>
                                    <option className='text-black' value={8}>Absent</option>
                                </Select>
                                <Text w="180px" >
                                {(() => {
                                    const trainingBatch = courseBatch?.find((batch) => batch.id === training.batch)
                                    const ins = allInstructors?.find((i) => i.id === trainingBatch?.assessor);
                                    if (!ins) return trainingBatch?.assessor || 'No Instructor';

                                    // Add 'MM' if rank is 'CAPT'
                                    const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                    return `${ins.rank} ${ins.name}${suffix}`;
                                })()}
                                </Text>  
                                <Box w="100px" >
                                    <Checkbox colorScheme='green' defaultChecked/>    
                                </Box>  
                                <Box w="100px" >
                                    <Checkbox colorScheme='green' defaultChecked/>    
                                </Box>  
                                <Box w="100px" >
                                    <Checkbox colorScheme='green' defaultChecked/>    
                                </Box>  
                                <Box w="100px" >
                                    <Checkbox colorScheme='green' defaultChecked/>    
                                </Box>  
                                <Button onClick={() => {
                                    // setID(training.id); 
                                    // setRemarks(training.train_remarks); 
                                    // onOpenRm();
                                    }} size='sm' p={0} variant='link' w='300px'>
                                    <Text className={`${training.train_remarks === '' ? 'text-gray-400' : 'text-cyan-600'}`}>
                                        {training.train_remarks === '' ? 'None' : 'View'}
                                    </Text>
                                </Button>                                     
                            </Box>
                        )
                    }
                }))}
                </Box>
            </Box>
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
