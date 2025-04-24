'use client'

import React, { useState, useEffect } from 'react'
import { Box, Text, Input, useToast, Alert, AlertIcon, AlertTitle, AlertDescription, FormLabel, FormControl, Checkbox, Button, useDisclosure, Modal, ModalOverlay, ModalCloseButton, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';

import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRank } from '@/context/RankContext'

import { fullMonth, getFormatDateWithTime } from '@/handlers/util_handler'
import { deployYDate } from '@/types/utils' 

import { UPDATE_BATCH } from '@/lib/course_batches_controller'
import { UPDATE_TRAINING } from '@/lib/trainee_controller'

import { ToastStatus } from '@/types/handling'
import { SelectedTraining, TRAINING_BY_ID } from '@/types/trainees'
import { CourseBatchByID, initCourseBatch } from '@/types/course-batches'

interface PageProps {
    onClose: () => void;
    batch_id: string;
    batchNum: number;
    course_id: string;
    reg_Type: number;
}


export default function EditBatch({onClose, batch_id, batchNum, reg_Type, course_id}: PageProps){
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { allData: allTrainings, data: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { allData: allRegistration, data: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()
    const { data: allTrainee } = useTrainees()
    const { data: allCourses } = useCourses()
    const { data: allRanks } = useRank()
    const { courseCodes } = useClients()

    const [selectedTraining, setSelectedTrainings] = useState<SelectedTraining[]>([])
    const [additionalTraining, setAdditionalTrainings] = useState<SelectedTraining[]>([])
    const [removeTrainings, setTrainingRemoval] = useState<string[]>([])
    const [batchInfo, setBatchInfo] = useState<CourseBatchByID>(initCourseBatch)

    const [trainingID, setID] = useState<string>('')
    const [indexNum, setIndx] = useState<number>(0)

    const [startDate, setStart] = useState<string | undefined>('')
    const [endDate, setEnd] = useState<string | undefined>('')
    const [batch, setBatch] = useState<number | undefined>(0)
    const [batchAssigned, setBatchAssign] = useState<number | undefined>(0)
    const [numDays, setNumDays] = useState<number | undefined>(0)
    const [loading, setLoading] = useState<boolean>(false)

    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth())
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear())

    const {isOpen: isOpenM, onOpen: onOpenM, onClose: onCloseM } = useDisclosure()
    const {isOpen: isOpenRemove, onOpen: onOpenRemove, onClose: onCloseRemove } = useDisclosure()

    const courseName = allCourses?.find((course) => course.id === course_id)

    useEffect(() => {
        const fetchData = () => {
            const getCourseBatch = courseBatch?.find((b) => b.id === batch_id)
            setBatchInfo(getCourseBatch || initCourseBatch)
            setStart(getCourseBatch?.start_date)
            setEnd(getCourseBatch?.end_date)
            setBatch(getCourseBatch?.batch_no)
            setBatchAssign(getCourseBatch?.batch_no)
            setNumDays(getCourseBatch?.numOfDays)

            const matchingBatchTraining = allTrainings?.filter((training) => training.batch === batch_id) || []

            const newSelectedTrainings: SelectedTraining[] = []
            for(const training of matchingBatchTraining){
                const registration = allRegistration?.find((r) => r.id === training.reg_ref_id)
                if (!registration) continue

                const trainee = allTrainee?.find((t) => t.id === registration.trainee_ref_id)
                if (!trainee) continue

                newSelectedTrainings.push({
                    trainee,
                    registration,
                    training
                })
            }
            setSelectedTrainings(newSelectedTrainings)
        }
        if (batch_id && allTrainings && allRegistration && allTrainee && courseBatch) {
            fetchData()
        }
    },[batch_id, allTrainings, allRegistration, allTrainee, courseBatch])

    const matchedCourseAndCompanyCourse = courseCodes?.find((courseCode) => courseCode.id_course_ref === course_id)?.id // fetched company course code that matches the document course id
    const matchedCourseTraining = allTraining?.filter((training) => 
        (training.course === course_id || training.course === matchedCourseAndCompanyCourse)
    && training.regType === reg_Type // By using training.regType || reg_Type like reg_status to validate the status of training, is also considered if a training is enrolled or not.
    && Number(training.batch) === 1) // this will validate if training is still has 1 as its value
    
    const courseTrainingBatches = matchedCourseTraining?.filter((training) => (training.batch === batch_id)) 

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

    const handleVerifySelection = (training: string, registration: string, trainee: string, start_date: string, end_date: string, numOfDays: number) => {
        if(startDate === '' && endDate === ''){
            setStart(start_date)
            setEnd(end_date)
            setNumDays(numOfDays)
            handleSelection(training, registration, trainee)
        } else if (endDate !== '' && endDate === end_date){
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
        
        setAdditionalTrainings((prev) => {
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

    const handleDataRemoval = (training_id: string, index: number) => {
        setTrainingRemoval((prev) => [...prev,training_id])
        setSelectedTrainings((prev) => prev.filter((_, i) => i !== index))
    }

    const lastBatchNum = courseBatch && courseBatch?.filter((batch) => batch.course === courseName?.id).reduce((max, curr) => (curr.batch_no > max ? curr.batch_no : max), 0)
    const handleBatchDuplication = (batchVal: number | undefined) => {
        return courseBatch?.some((batch) => batch.course === courseName?.id && batch.batch_no === batchVal) && batchAssigned !== batchVal
    }

    const handleUpdateBatch = async () => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')

        handleToast('Processing...', `This may take some time to finish, Kindly wait for it to complete.`, 5000, 'info')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const newBatchRecord = { batch_no: batch }
                    await UPDATE_BATCH(batch_id, newBatchRecord, actor) 
                    // This function is to add some more trainings, if the condition is true then function will execute 
                    additionalTraining.length > 0 && (
                        await Promise.all(
                            additionalTraining.map((trainingData) => {
                                return Promise.resolve(UPDATE_TRAINING(trainingData.training.id, {batch: batch_id}, actor))
                            })
                        )
                    )
                    // This function is to remove some not needed trainings, if the condition is true then function will execute 
                    removeTrainings.length > 0 && (
                        await Promise.all(
                            removeTrainings.map((removal) => 
                                UPDATE_TRAINING(removal, {batch: '1'}, actor)
                            )
                        )
                    )
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Batch Successfully Updated!', `Batch# ${batch} for this course ${courseName?.course_code} has been updated.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error:, ', error)
        }).finally(() => {
            setLoading(false)
            setSelectedTrainings([])
            setAdditionalTrainings([])
            setTrainingRemoval([])
            setBatchInfo(initCourseBatch)
            setID('')
            setIndx(0)
            setStart('')
            setEnd('')
            setBatch(0)
            setNumDays(0)
            onClose()
        })
    }

    return(
    <>
        <ModalContent px='5'>
            <ModalHeader color='blue.700'>{`Edit Details for BATCH# ${batchNum} ${courseName?.course_code !== undefined ? `of ${courseName?.course_code}` : ''} ${courseName?.course_name !== undefined ? `- ${courseName?.course_name}` : ''}`}</ModalHeader>
            <ModalBody>
                <Box display='flex' justifyContent='start'>
                    <Button size='sm' bgColor='blue.700' colorScheme='blue' onClick={onOpenM}>Filter Date</Button>
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
                                        <Text color='gray.500' as='span'>{`Registration #:`}</Text>
                                        <Text as='span' textAlign='end'>{`REG-${registeredTrainee?.reg_no}`}</Text>
                                    </Text>
                                    <Text mt='2' fontSize='12px' display='flex' justifyContent='space-between' textTransform='uppercase' >
                                        <Text color='gray.500' as='span'>{`Enrolled Date:`}</Text>
                                        <Text as='span' textAlign='end'>{getFormatDateWithTime(training.date_enrolled.toDate())}</Text>
                                    </Text>
                                </Checkbox>
                            )
                        })
                    ) : (
                        <Text py='5' fontSize='xl'>
                            There are no trainings enrolled in this course.
                        </Text>
                    )}
                    </Box>
                    <Box h='100%' w='100%' shadow='md' borderRadius={'5px'} border='1px' borderColor='gray.200' p='5'>
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
                        </Box>
                        <Box py='4'>
                            <Box px='6' display='flex' color='gray.600' py='3' justifyContent={'space-between'} alignItems={'center'} borderRadius='5px' borderWidth='1px' borderColor='gray.400'>
                                <Text w='30%' textAlign='start'>#</Text>
                                <Text w='100%' textAlign='start'>Trainee</Text>
                                <Text w='100%' textAlign='center'>Rank</Text>
                                <Text w='100%' textAlign='center'>Registration No.</Text>
                                <Text w='30%' textAlign='center'>Action</Text>
                            </Box>
                            {selectedTraining.map((row, index) => (
                                <Box key={index} display='flex' py='3' px='6' textTransform='uppercase' justifyContent={'space-between'} alignItems={'center'} borderBottomWidth='1px' borderColor='gray.400'>
                                    <Text w='30%' textAlign='start'>{(index + 1)}</Text>
                                    <Text w='100%' textAlign='start'>{`${row.trainee.last_name}, ${row.trainee.first_name} ${!row.trainee.middle_name || ['n/a', 'na'].includes(row.trainee.middle_name.toLowerCase()) ? '' : `${row.trainee.middle_name.charAt(0)}.`} ${!row.trainee.suffix || ['n/a', 'na'].includes(row.trainee.suffix.toLowerCase()) ? '' : row.trainee.suffix}`}</Text>
                                    <Text w='100%' textAlign='center'>{`${row.trainee.rank}`}</Text>
                                    <Text w='100%' textAlign='center'>{`REG-${row.registration.reg_no}`}</Text>
                                    <Box w='30%' display='flex' justifyContent={'center'}>
                                        <Button onClick={() => {onOpenRemove(); setID(row.training.id); setIndx(index); }} size='sm' variant='ghost' colorScheme='red'>Remove</Button>
                                    </Box>
                                </Box>
                            ))}
                            {additionalTraining.map((row, index) => (
                                <Box key={index} display='flex' py='3' px='6' textTransform='uppercase' justifyContent={'space-between'} alignItems={'center'} borderBottomWidth='1px' borderColor='gray.400'>
                                    <Text w='30%' textAlign='start'>{((index + 1) + selectedTraining.length)}</Text>
                                    <Text w='100%' textAlign='start'>{`${row.trainee.last_name}, ${row.trainee.first_name} ${!row.trainee.middle_name || ['n/a', 'na'].includes(row.trainee.middle_name.toLowerCase()) ? '' : `${row.trainee.middle_name.charAt(0)}.`} ${!row.trainee.suffix || ['n/a', 'na'].includes(row.trainee.suffix.toLowerCase()) ? '' : row.trainee.suffix}`}</Text>
                                    <Text w='100%' textAlign='center'>{`${row.trainee.rank}`}</Text>
                                    <Text w='100%' textAlign='center'>{`REG-${row.registration.reg_no}`}</Text>
                                    <Box w='30%' display='flex' justifyContent={'center'}>
                                        <Button onClick={() => {onOpenRemove(); setID(row.training.id); setIndx(index); }} size='sm' variant='ghost' colorScheme='red'>Remove</Button>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </ModalBody>
            <ModalFooter borderTopWidth='2px' display={'flex'} justifyContent='center'>
                <Button onClick={onClose} variant={'outline'} colorScheme='red' mr={3} shadow='md'>Cancel</Button>
                <Button onClick={handleUpdateBatch} isDisabled={batch === 0 || handleBatchDuplication(batch)} isLoading={loading} loadingText='Updating Batch Info...' colorScheme='blue' bgColor='blue.700' shadow='md'>Update Batch</Button>
            </ModalFooter>
        </ModalContent>
        {/** ALert Dialog */}
        <Modal isOpen={isOpenRemove} size='lg' onClose={onCloseRemove}>
            <ModalOverlay />
            <ModalContent px='4'>
                <ModalHeader borderBottomWidth='1px' borderColor='gray.500'>Action to Remove Data from this Batch</ModalHeader>
                <ModalBody >
                    <Text fontSize='16px' fontWeight='normal'>{`Are you sure you want to remove this training data from this batch. This action cannot be undone. If yes, kindly proceed, otherwise cancel.`}</Text>
                    <Alert borderRadius='5px' mt='5' status='info' variant='left-accent'>
                        <AlertIcon />
                        <AlertDescription fontWeight='normal'>{`Note: If you have mistaken to remove a training, You can still recover it by cancelling the "Edit Batch" and don't click the update button.`}</AlertDescription>
                    </Alert>
                </ModalBody>
                <ModalFooter display='flex' justifyContent='center' borderTopWidth='1px' borderColor='gray.500'>
                    <Button variant='ghost' onClick={onCloseRemove}>No, Cancel it</Button>
                    <Button ml='3' onClick={() => {handleDataRemoval(trainingID, indexNum); onCloseRemove();}} colorScheme='red'>Yes, Proceed to remove</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
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