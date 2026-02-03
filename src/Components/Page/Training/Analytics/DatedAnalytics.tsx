'use client'
import { useState, useMemo, useEffect} from 'react';
import { Box, Text, Textarea, Spinner, Center, Button, Tooltip, Checkbox, Select, Input, FormControl, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons'
import { Timestamp } from 'firebase/firestore'

import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useInstructors } from '@/context/InstructorContext'

import { CourseBatchByID } from '@/types/course-batches'
import { BATCH_ANALYSIS, batchArr } from '@/types/training'

import { ToastStatus } from '@/types/handling'
import { fullMonth, } from '@/handlers/util_handler'
import { deployYDate } from '@/types/utils' 

export default function Dated () {
    const toast = useToast()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allInstructors } = useInstructors()
    const { data: allClients, courseCodes } = useClients()
    const { allData: allTrainingData, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { allData: allRegData, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const { isOpen: isOpenDate, onOpen: onOpenDate, onClose: onCloseDate } = useDisclosure()

    const [batchCourses, setBatchCourses] = useState<BATCH_ANALYSIS[]>([])
    const [hasNoBatch, setBatch] = useState<boolean>(true)
    
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
        if (!allCourses || !courseBatch || !allTrainingData) return

        const months = [
            "jan", "feb", "mar", "apr", "may", "jun",
            "jul", "aug", "sep", "oct", "nov", "dec"
        ];
        const trimmedMonth = months[monthSelected];
        console.log('Trimmed Month:', trimmedMonth);
        /* ----------------------------------------
            1. Filter batches by CREATED date
        ----------------------------------------- */
        const filteredBatches = courseBatch && courseBatch.filter((cb) => {
            const createdDate = cb.createdAt.toDate();
            console.log(createdDate.getMonth())
            console.log(createdDate.getFullYear())
            return (
                createdDate.getMonth() === monthSelected &&
                createdDate.getFullYear() === yearSelected
            )
        })

        // Fast lookup map (batchId → batch)
        const batchMap = new Map(filteredBatches.map(b => [b.id, b]));
        
        /* ----------------------------------------
            2. Filter training data by ACTUAL dates
        ----------------------------------------- */
        const allTrainData = allTrainingData && allTrainingData
            .filter((t) => t.reg_status >= 3 )    
            .filter((t) => {
                const start = t.start_date.toLowerCase();
                const end = t.end_date.toLowerCase();
                
                return (
                    (start.includes(trimmedMonth) && end.includes(trimmedMonth)) ||
                    (end === '' && start.includes(trimmedMonth))
                );
            })
            .filter(t => batchMap.has(t.batch));

        /* ----------------------------------------
            3. Build analysis per course
        ----------------------------------------- */
        const batchAnalysis = allCourses.reduce<BATCH_ANALYSIS[]>((acc, course) => {
            const courseBatches = filteredBatches.filter((b) =>{
                const start = b.start_date.toLowerCase();
                const end = b.end_date.toLowerCase();
                
                return (
                    (start.includes(trimmedMonth) && end.includes(trimmedMonth)) ||
                    (end === '' && start.includes(trimmedMonth))
                );
            }).filter(
                b => b.course === course.id
            )

            if (!courseBatches.length) return acc;

            let totalTraineesCount = 0;

            const batches = courseBatches.map((batch) => {
                const trainees = allTrainData.filter(
                    t => t.batch === batch.id
                );

                const delivered = trainees.filter(t => t.reg_status === 6).length;
                const cancelled = trainees.filter(t => t.reg_status === 7).length;
                const nonAppearance = trainees.filter(t => t.reg_status === 9).length;

                totalTraineesCount += trainees.length;

                return {
                    batch_no: batch.batch_no.toString(),
                    trainees_per_batch: trainees.length.toString(),
                    delivered: delivered.toString(),
                    trainingMode: batch.training_mode,
                    cancelled: cancelled.toString(),
                    non_appearance: nonAppearance.toString(),
                    remarks: batch.remarks,
                }
            })

            acc.push({
                course: course.course_code,
                courseType: course.trainingMode.toString(),
                batches,
                total_batches: courseBatches.length,
                total_trainees: totalTraineesCount,
            })
            return acc;
        }, [])

        setBatchCourses(batchAnalysis)
    }, [ allCourses, courseBatch, allTrainingData, monthSelected, yearSelected ])

    return(
        <>
            <Button w='60%' mr={4} onClick={onOpenDate} rightIcon={<ChevronDownIcon />} size='sm' shadow='md'>Filter Date</Button>
            <Box h='700px' style={{maxHeight: '750px', overflowY: 'auto', scrollbarWidth: 'thin'}}>
                {/** HEADER */}
                <Box py='1' h='60px' display='flex' alignItems='start' textAlign='center' borderRadius={'5px'} bgColor='blue.700' color='white' position='sticky' top='0' zIndex='10'>
                    <Box w='200px' sx={headerStyle}> Courses </Box>
                    <Box w='140px' sx={headerStyle}>Batch</Box>
                    <Box w='140px' sx={headerStyle}>Total # of Batches</Box>
                    <Box w='140px' sx={headerStyle}>No. of Trainees per Batch</Box>
                    <Box w='140px' sx={headerStyle}>Total # of Trainees</Box>
                    <Box w='140px' sx={headerStyle}>Delivered</Box>
                    <Box w='300px' borderRight='1px solid white'>
                        <Text>MODE OF TRAINING</Text>
                        <Box display={'flex'} h='35px' borderTop='1px solid white'alignItems='center' justifyContent='space-between'>
                            <Text w='50px' sx={headerStyle} >F2F</Text>
                            <Box w='100px' borderRight='1px solid white' >
                                <Text>ONLINE</Text>
                                <Box display='flex' justifyContent='space-between'>
                                    <Text w='50px' borderRight='1px solid white' borderTop='1px solid white'>INS</Text>
                                    <Text w='50px' borderTop='1px solid white'>MOD</Text>
                                </Box>
                            </Box>
                            <Text w='50px' sx={headerStyle} >CBT</Text>
                            <Text w='100px' >BLENDED</Text>
                        </Box>
                    </Box>
                    <Box w='250px' >
                        <Text borderRight='1px solid white'>COMPLETION</Text>
                        <Box display='flex' h='35px' borderTop='1px solid white' alignItems='center' justifyContent='space-between'>
                            <Text w='50px' sx={headerStyle}>C</Text>
                            <Text w='50px' sx={headerStyle}>F</Text>
                            <Text w='50px' sx={headerStyle}>NT</Text>
                            <Text w='50px' sx={headerStyle}>NA</Text>
                            <Text w='50px' sx={headerStyle}>D</Text>
                        </Box>
                    </Box>
                    <Box w='300px' sx={headerStyle}>REMARKS</Box>
                </Box>
                {/** BODY */}
                <Box>
                {batchCourses && batchCourses
                .sort((a, b) => a.course.localeCompare(b.course))
                .map((bc, index) => {
                    return(
                        <Box key={index} display='flex' alignItems='center' textAlign='center' fontWeight='normal' borderBottom='1px solid gray' borderX='1px solid gray'>
                            <Text w='200px' fontWeight='bold' color={bc.courseType === '1' ? '#0070c0' : 'black'}>{bc.course.toUpperCase()}</Text>
                            <Box w='140px'>
                                {bc.batches
                                .sort((a, b) => b.batch_no.localeCompare(a.batch_no))
                                .map((b, idx, arr) => 
                                    <Text key={idx} borderBottom={idx === arr.length - 1 ? 'none' : '1px solid gray'} borderX='1px solid gray'>
                                        {b.batch_no}
                                    </Text>)
                                }
                            </Box>
                            <Text w='140px'>{bc.total_batches}</Text>
                            <Box w='140px'>
                                {bc.batches
                                .sort((a, b) => b.batch_no.localeCompare(a.batch_no))
                                .map((b, idx, arr) => 
                                    <Text key={idx} borderBottom={idx === arr.length - 1 ? 'none' : '1px solid gray'} borderX='1px solid gray'>
                                        {b.trainees_per_batch}
                                    </Text>)
                                }
                            </Box>
                            <Text w='140px'>{bc.total_trainees}</Text>
                            <Box>
                                {bc.batches.sort((a, b) => b.batch_no.localeCompare(a.batch_no))
                                .map((b, idx, arr) => (
                                    <Box key={idx} display='flex' alignItems='center' justifyContent='space-between' borderBottom={idx === arr.length - 1 ? 'none' : '1px solid gray'} borderX='1px solid gray'>
                                        <Text w='140px' borderRight='1px solid gray'>{b.delivered}</Text>
                                        <Box w='300px' >
                                            <Box display={'flex'} alignItems='center' justifyContent='space-between'>
                                                <Text w='50px' bgColor='#eaf1dd' sx={headerStyle} borderRight='1px solid gray'>{['f2f', 'f2ft', 'f2fp'].includes(b.trainingMode) ? b.delivered : <>&nbsp;</>}</Text>
                                                <Box w='100px' >
                                                    <Box display='flex' justifyContent='space-between'>
                                                        <Text bgColor='#daeef3' w='50px' borderX='1px solid gray'>{['ol', 'olt', 'olp'].includes(b.trainingMode) ? b.delivered : <>&nbsp;</>}</Text>
                                                        <Text bgColor='#daeef3' w='50px' borderRight='1px solid gray'>{b.trainingMode === 'olm' ? b.delivered : <>&nbsp;</>}</Text>
                                                    </Box>
                                                </Box>
                                                <Text w='50px' bgColor='#ddd9c3' sx={headerStyle} >{b.trainingMode === 'f2fm' ? b.delivered : <>&nbsp;</>}</Text>
                                                <Text w='100px' bgColor='#b6dde8' borderX='1px solid gray'>{b.trainingMode === 'blended' ? b.delivered : <>&nbsp;</>}</Text>
                                            </Box>
                                        </Box>
                                        <Box w='250px' display='flex' alignItems='center' justifyContent='space-between'>
                                            <Text w='50px' borderRight={'1px solid gray'}>{b.cancelled !== '0' ? b.cancelled : <>&nbsp;</>}</Text> {/** Re-evaluate this status */}
                                            <Text w='50px' borderRight={'1px solid gray'}>&nbsp;</Text>
                                            <Text w='50px' borderRight={'1px solid gray'}>&nbsp;</Text>
                                            <Text w='50px' borderRight={'1px solid gray'}>{b.non_appearance !== '0' ? b.non_appearance : <>&nbsp;</>}</Text> {/** Re-evaluate this status */}
                                            <Text w='50px'>{b.delivered !== '0' ? b.delivered : <>&nbsp;</>}</Text>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            <Text w='300px' >
                            {bc.batches
                            .sort((a, b) => b.batch_no.localeCompare(a.batch_no))
                            .map((b, idx, arr) => 
                                <Text key={idx} _hover={{cursor: 'pointer'}} borderBottom={idx === arr.length - 1 ? 'none' : '1px solid gray'}>
                                    {b.remarks === '' ? 'None' : b.remarks}
                                </Text>)
                            }
                            </Text>
                        </Box>
                    )
                })}
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

const headerStyle= {
    h: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: '1px solid white',
}