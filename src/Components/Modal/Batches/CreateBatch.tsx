'use client'

import React, { useState } from 'react'
import { Box, Text, Input, useToast, FormLabel, FormControl, Checkbox, Button, useDisclosure, Modal, ModalOverlay, ModalCloseButton, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';

import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTrainees } from '@/context/TraineeContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useRank } from '@/context/RankContext'

import { fullMonth, getFormatDateWithTime } from '@/handlers/util_handler'

import { deployYDate } from '@/types/utils' 

import { GENERATE_BATCH } from '@/lib/course_batches_controller'
import { UPDATE_TRAINING } from '@/lib/trainee_controller'

import { ToastStatus } from '@/types/handling'
import { SelectedTraining } from '@/types/trainees'

interface PageProps {
    onClose: () => void;
    reg_Type: number;
    course_id: string;
}


export default function CreateBatch({onClose, course_id, reg_Type}: PageProps){
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { data: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { data: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()
    const { data: allTrainee } = useTrainees()
    const { data: allCourses } = useCourses()
    const { data: allRanks } = useRank()
    const { courseCodes } = useClients()

    const [selectedTraining, setSelectedTrainings] = useState<SelectedTraining[]>([])

    const [startDate, setStart] = useState<string>('')
    const [endDate, setEnd] = useState<string>('')
    const [batch, setBatch] = useState<number>(0)
    const [numDays, setNumDays] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const {isOpen: isOpenM, onOpen: onOpenM, onClose: onCloseM } = useDisclosure()

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

    
    const courseName = allCourses?.find((course) => course.id === course_id)
    const matchedCourseAndCompanyCourse = courseCodes?.filter((courseCode) => courseCode.id_course_ref === course_id).map((courseCode) => courseCode.id)
    const matchedCourseTraining = allTraining?.filter((training) => 
        (training.course === course_id || matchedCourseAndCompanyCourse?.includes(training.course))
    && training.regType === reg_Type // By using training.regType || reg_Type like reg_status to validate the status of training, is also considered if a training is enrolled or not.
    && (Number(training.batch) === 1 || Number(training.batch) === 0)) // this will validate if training is still has 1 as its value
    
    const lastBatchNum = courseBatch && courseBatch?.filter((batch) => batch.course === courseName?.id).reduce((max, curr) => (curr.batch_no > max ? curr.batch_no : max), 0)

    const handleBatchDuplication = (batchVal: number) => {
        return courseBatch?.some((batch) => batch.course === courseName?.id && batch.batch_no === batchVal)
    }

    const handleCreateBatch = async () => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')
        const courseID = courseName?.id

        handleToast('Processing...', `This may take some time to finish, Kindly wait for it to complete.`, 5000, 'info')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const newBatchRecord = {
                        batch_no: batch,
                        start_date: startDate,
                        end_date: endDate,
                        numOfDays: numDays,
                        course: courseID,
                    }
                    const batch_id = await GENERATE_BATCH(newBatchRecord, actor) 
                    await Promise.all(
                        selectedTraining.map((trainingData) => 
                            UPDATE_TRAINING(trainingData.training.id, {batch: batch_id}, actor)
                        )
                    )
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('New Batch Created Successfully!', `Batch# ${batch} for this course ${courseName?.course_code} has been created.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error:, ', error)
        }).finally(() => {
            setLoading(false)
            setSelectedTrainings([])
            setStart('')
            setEnd('')
            setBatch(0)
            setNumDays(0)
            onClose()
        })
    }

    const handleVerifySelection = (training: string, registration: string, trainee: string, start_date: string, end_date: string, numOfDays: number) => {
        if(startDate === '' && endDate === ''){
            setStart(start_date)
            setEnd(end_date)
            setNumDays(numOfDays)
            handleSelection(training, registration, trainee)
        } else if (endDate !== '' || endDate === end_date){
            if(startDate !== start_date){
                handleToast('Training Date Not Matched!', `You're trying to select a training with un-matching training schedule. Kindly select a training with matching dates.`, 7000, 'warning')
                return
            } 
            handleSelection(training, registration, trainee)
        } else {
            handleToast('Training Date Not Matched!', `You're trying to select a training with un-matching training schedule. Kindly select a training with matching dates.`, 7000, 'warning')
            return
        }
    }

    const handleSelection = (trainingVal: string, registrationVal: string | undefined, traineeVal: string | undefined) => {
        const training = matchedCourseTraining?.find((t) => t.id === trainingVal)
        const registration = allRegistrations?.find((t) => t.id === registrationVal)
        const trainee = allTrainee?.find((t) => t.id === traineeVal)

        if (!training && !registration && !trainee) return;
        
        setSelectedTrainings((prev) => {
            if (!trainee || !registration || !training) {
                // If any of the required properties are undefined, return the previous state unchanged
                return prev;
            }
            const alreadySelected = prev.some((data) => data.training.id === training?.id)

            if(alreadySelected){
                return prev.filter((data) => data.training.id !== training?.id)
            }else{
                return [
                    ...prev,
                    {
                        trainee,
                        registration,
                        training,
                    }
                ]
            }
        })
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear()
    const startYear = parseInt(deployYDate, 10)
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

    const handleData = () => {
        setTMonth(monthSelected + 1) 
        setTYear(yearSelected)
        setRMonth(monthSelected + 1) 
        setRYear(yearSelected)
        setMonthSelected(new Date().getMonth())
        setYearSelected(new Date().getFullYear())
        onCloseM()
    }

    return(
    <>
        <ModalContent px='5'>
            <ModalHeader color='blue.700'>{`SELECT TRAININGS ${courseName?.course_code !== undefined ? `for ${courseName?.course_code}` : ''} ${courseName?.course_name !== undefined ? `- ${courseName?.course_name}` : ''}`}</ModalHeader>
            <ModalBody>
                <Box display='flex' justifyContent='start'>
                    <Button size='sm' bgColor='blue.700' colorScheme='blue' onClick={onOpenM}>Filter Enrolled Date</Button>
                </Box>
                <Box display='flex' gap='4' mt='2'>
                    <Box w='25%' display='flex' flexDir='column' overflowY={'auto'} maxH='700px'>
                    {matchedCourseTraining && matchedCourseTraining.length > 0 ? (
                        matchedCourseTraining?.map((training) => {
                            const registeredTrainee = allRegistrations?.find((reg) => reg.id === training.reg_ref_id) // get reg doc using training id
                            const traineeInfo = allTrainee?.find((trainee) => trainee.id === registeredTrainee?.trainee_ref_id) // get the trainee info using reg id
                            
                            if(!registeredTrainee && !traineeInfo) return null;
                            
                            return(
                                <Checkbox mb='3' size='lg' key={training.id} isChecked={selectedTraining.some((t) => t.training.id === training.id)} 
                                    onChange={() => handleVerifySelection(training.id, registeredTrainee?.id || '', traineeInfo?.id || '', training.start_date, training.end_date, Number(training.numOfDays))} borderRadius={'5px'} border={selectedTraining.some((t) => t.training.id === training.id) ? '2px' : '1px'} borderColor={selectedTraining.some((t) => t.training.id === training.id) ? 'blue.600' : 'gray.200'} shadow={'lg'} p='3'>
                                    <Box fontSize='16px' display='flex' >
                                        <Text>
                                            <Text color='gray.500' as='span'>{training.numOfDays > 1 ? 'From:' : 'From - To:'}</Text>
                                            {training.start_date}
                                        </Text>
                                        {training.numOfDays > 1 && (
                                            <Text ml='2'>
                                                <Text color='gray.500' as='span'>To:</Text>
                                                {training.end_date}
                                            </Text>
                                        )}
                                    </Box>
                                    <Text mt='2' fontSize='12px' display='flex' justifyContent='space-between' textTransform='uppercase' >
                                        <Text color='gray.500' as='span'>Trainee:</Text>
                                        <Text as='span' textAlign='end'>{`${allRanks?.find((rank) => rank.code === traineeInfo?.rank)?.rank || traineeInfo?.rank} ${traineeInfo?.last_name}, ${traineeInfo?.first_name}`}</Text>
                                    </Text>
                                    <Text mt='2' fontSize='12px' display='flex' justifyContent='space-between' textTransform='uppercase' >
                                        <Text color='gray.500' as='span'>Registration #:</Text>
                                        <Text as='span' textAlign='end'>{`REG-${registeredTrainee?.reg_no}`}</Text>
                                    </Text>
                                    <Text mt='2' fontSize='12px' display='flex' justifyContent='space-between' textTransform='uppercase' >
                                        <Text color='gray.500' as='span'>Enrolled Date:</Text>
                                        <Text as='span' textAlign='end'>{getFormatDateWithTime(training.date_enrolled.toDate())}</Text>
                                    </Text>
                                </Checkbox>
                            )
                        })
                    ) : (
                        <Text py='5' fontSize='xl'>
                            There are no trainings enrolled in this course.
                        </Text>
                    )
                    }
                    </Box>
                    <Box w='100%' shadow='md' borderRadius={'5px'} border='1px' borderColor='gray.200' p='5'>
                        <Box display='flex' alignItems='start' borderBottomWidth={'1px'} borderColor='gray.400' py='4'>
                            <Box display='flex' flexDir='column' alignItems='start'>
                                <FormControl display='flex' flexDir='column' justifyContent='start' alignItems='start'>
                                    <Text fontSize='14px' mr='4'>Batch:</Text>
                                    <Input className={`${selectedTraining.length === 0 ? 'hover:cursor-not-allowed' : ''}`} value={batch === 0 ? '' : batch} isDisabled={selectedTraining.length === 0} type='number' onChange={(e) => setBatch(Number(e.target.value))} placeholder='Batch #' shadow='md' />
                                </FormControl>
                                <FormLabel mt='2' fontSize='12px' color='red.500'>
                                    <Text>
                                        {`Last Batch #: ${lastBatchNum === null || lastBatchNum === 0 ? '' : lastBatchNum}`}
                                    </Text>
                                    {handleBatchDuplication(batch) && (
                                        <Text>
                                            {`You cannot duplicate a batch number. That batch number already exists.`}
                                        </Text>
                                    )}
                                </FormLabel>
                            </Box>
                            <Text fontSize='14px' display='flex' flexDir='column' whiteSpace={'8'} ml='4'>
                                <Text as='span'>{`From:`}</Text>
                                <Text as='span'>{`${startDate}`}</Text>
                            </Text>
                            <Text fontSize='14px' display='flex' flexDir='column' whiteSpace={'8'} ml='4'>
                                <Text as='span'>{`To:`}</Text>
                                <Text as='span'>{`${endDate}`}</Text>
                            </Text>
                            <Button onClick={() => {setStart(''); setEnd(''); setBatch(0); setSelectedTrainings([])}} ml='4' size='xs' colorScheme='red' isDisabled={startDate === ''} shadow='md'> Clear Data</Button>
                        </Box>
                        <Box py='4'>
                            <Box px='6' display='flex' color='gray.600' py='3' justifyContent={'space-between'} alignItems={'center'} borderRadius='5px' borderWidth='1px' borderColor='gray.400'>
                                <Text w='30%' textAlign='start'>#</Text>
                                <Text w='100%' textAlign='start'>Name</Text>
                                <Text w='100%' textAlign='center'>Rank</Text>
                                <Text w='100%' textAlign='center'>Registration No.</Text>
                            </Box>
                            {selectedTraining.map((row, index) => (
                                <Box key={index} display='flex' py='3' px='6' textTransform='uppercase' justifyContent={'space-between'} alignItems={'center'} borderBottomWidth='1px' borderColor='gray.400'>
                                    <Text w='30%' textAlign='start'>{(index + 1)}</Text>
                                    <Text w='100%' textAlign='start'>{`${row.trainee.last_name}, ${row.trainee.first_name} ${!row.trainee.middle_name || ['n/a', 'na'].includes(row.trainee.middle_name.toLowerCase()) ? '' : `${row.trainee.middle_name.charAt(0)}.`} ${!row.trainee.suffix || ['n/a', 'na'].includes(row.trainee.suffix.toLowerCase()) ? '' : row.trainee.suffix}`}</Text>
                                    <Text w='100%' textAlign='center'>{`${row.trainee.rank}`}</Text>
                                    <Text w='100%' textAlign='center'>{`REG-${row.registration.reg_no}`}</Text>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </ModalBody>
            <ModalFooter borderTopWidth='2px' display={'flex'} justifyContent='center'>
                <Button onClick={onClose} variant={'outline'} colorScheme='red' mr={3} shadow='md'>Cancel</Button>
                <Button onClick={handleCreateBatch} isDisabled={batch === 0 || handleBatchDuplication(batch)} isLoading={loading} loadingText='Creating Batch...' colorScheme='blue' bgColor='blue.700' shadow='md'>Create Batch</Button>
            </ModalFooter>
        </ModalContent>
        {/*  Date Modal */}
        <Modal isOpen={isOpenM} scrollBehavior='inside' onClose={onCloseM}>
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