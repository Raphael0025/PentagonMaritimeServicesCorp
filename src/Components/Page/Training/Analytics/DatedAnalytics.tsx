'use client'
import { useState, useMemo, useEffect} from 'react';
import { Box, Text, Textarea, Spinner, Center, Button, Tooltip, Checkbox, Select, Input, FormControl, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons'

import { useTraining } from '@/context/TrainingContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useInstructors } from '@/context/InstructorContext'

import { CourseBatchByID } from '@/types/course-batches'
import { BATCH_ANALYSIS } from '@/types/training'

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

        /** Step 1: Pre-filter batches by selected month & year */
        const filteredBatches = courseBatch.filter(t => {
            const start = t.start_date.toLowerCase();
            const tYear = new Date(t.createdAt).getFullYear()

            const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            const trimmedMonth = months[monthSelected]; // convert number → "jan"
            
            return (
                (start.includes(trimmedMonth) && tYear === yearSelected)
            );
        })

        /** Step 2: Group training data by batchId (FAST lookup) */
        const traineesByBatch = allTrainingData.reduce<Record<string, number>>(
            (acc, training) => {
                const batchId = training.batch
                acc[batchId] = (acc[batchId] || 0) + 1
                return acc
            },
            {}
        )

        /** Step 3: Build course analysis */
        const analysis: BATCH_ANALYSIS[] = allCourses.map(course => {
            const courseBatches = filteredBatches.filter(
                batch => batch.course === course.id
            )

            const traineesPerBatch: Record<string, number> = {}
            let totalTrainees = 0

            courseBatches.forEach(batch => {
                const count = traineesByBatch[batch.id] || 0
                traineesPerBatch[batch.id] = count
                totalTrainees += count
            })

            return {
                course: course.id,
                batches: {
                    total_batches: courseBatches.length,
                    total_trainees: totalTrainees,
                    trainees_per_batch: 0,
                    delivered: 0,
                    batch_no: 0,
                    trainingMode: 'olt',
                },
                remarks: '',
                start_date: courseBatches[0]?.start_date || new Date().toISOString(),
                createdAt: new Date().toISOString(),
            }
        })
        console.log(analysis)
        setBatchCourses(analysis)
        }, [
            allCourses,
            courseBatch,
            allTrainingData,
            monthSelected,
            yearSelected,
        ])

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
                {batchCourses && batchCourses.map((bc, index) => {
                    return(
                        <Box key={index}>
                            <Text>{allCourses && allCourses.find((c) => c.id === bc.course)?.course_code}</Text>
                            <Text>{bc.total_trainees}</Text>
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