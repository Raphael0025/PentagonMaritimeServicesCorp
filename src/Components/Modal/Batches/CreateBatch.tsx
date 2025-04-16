'use client'

import React, {useState, useEffect} from 'react'
import { Box, Text, Input, useToast, Checkbox, Button, useDisclosure, Modal, ModalOverlay, ModalCloseButton, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';

import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTrainees } from '@/context/TraineeContext'

import { fullMonth } from '@/handlers/util_handler'
import { deployYDate } from '@/types/utils' 

import { UPDATE_TRAINING } from '@/lib/trainee_controller'

import { ToastStatus } from '@/types/handling'
import { TRAINING_BY_ID } from '@/types/trainees'

interface PageProps {
    onClose: () => void;
    reg_id: string;
    reg_Type: number;
    course_id: string;
}


export default function CreateBatch({onClose, course_id, reg_Type}: PageProps){
    const toast = useToast()
    const { data: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { data: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()
    const { data: allTrainee } = useTrainees()
    const { data: allCourses } = useCourses()
    const { courseCodes } = useClients()

    const [selectedTrainings, setSelection] = useState<TRAINING_BY_ID[]>([])
    const [startDate, setStart] = useState<string>('')
    const [endDate, setEnd] = useState<string>('')

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

    const handlerevise = async () => {
        // const newBatch = {
        //     batch: 1
        // }
        // allTraining?.forEach(async (element) => {
        //     await UPDATE_TRAINING(element.id, newBatch, '')
            
        // });
    }

    const courseName = allCourses?.find((course) => course.id === course_id)
    const matchedCourseAndCompanyCourse = courseCodes?.find((courseCode) => courseCode.id_course_ref === course_id)?.id // fetched company course code that matches the document course id
    const matchedCourseTraining = allTraining?.filter((training) => (training.course === course_id || training.course === matchedCourseAndCompanyCourse) && training.regType === reg_Type && Number(training.batch) === 1)
    
    const handleVerifySelection = (val: string, start_date: string, end_date: string) => {
        if(startDate === '' && endDate === ''){
            setStart(start_date)
            setEnd(end_date)
            handleSelection(val)
        } else if (endDate !== '' && endDate === end_date){
            if(startDate !== start_date){
                handleToast('Training Date Not Matched!', `You're trying to select a training with un-matching training schedule. Kindly select a training with matching dates.`, 7000, 'warning')
                return
            } 
            handleSelection(val)
        } else {
            handleToast('Training Date Not Matched!', `You're trying to select a training with un-matching training schedule. Kindly select a training with matching dates.`, 7000, 'warning')
            return
        }
    }

    const handleSelection = (val: string) => {
        const training = matchedCourseTraining?.find((t) => t.id === val);
        if (!training) return;

        setSelection((prev) => {
            const alreadySelected = prev.some((t) => t.id === training.id);
            if (alreadySelected) {
                // remove if already selected (toggle behavior)
                return prev.filter((t) => t.id !== training.id);
            } else {
                // add if not selected
                return [...prev, training];
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
            <ModalHeader color='blue.700'>{`SELECT TRAININGS for ${courseName?.course_code} - ${courseName?.course_name}`}</ModalHeader>
            <ModalBody>
                <Box display='flex' justifyContent='start'>
                    <Button size='sm' bgColor='blue.700' colorScheme='blue' onClick={onOpenM}>Filter Date</Button>
                </Box>
                <Box display='flex' gap='4' mt='2'>
                    <Box w='30%' display='flex' flexDir='column'>
                    {matchedCourseTraining?.map((training) => {
                        const registeredTrainee = allRegistrations?.find((reg) => reg.id === training.reg_ref_id) // get reg doc using training id
                        const traineeInfo = allTrainee?.find((trainee) => trainee.id === registeredTrainee?.trainee_ref_id) // get the trainee info using reg id
                        return(
                            <Checkbox mb='3' isChecked={selectedTrainings.some((t) => t.id === training.id)} 
                                onChange={() => handleVerifySelection(training.id, training.start_date, training.end_date)} borderRadius={'5px'} border={selectedTrainings.some((t) => t.id === training.id) ? '2px' : '1px'} borderColor={selectedTrainings.some((t) => t.id === training.id) ? 'blue.600' : 'gray.200'} shadow={'lg'} p='3'>
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
                                <Text mt='2' fontSize='12px' textTransform='uppercase' >
                                    <Text color='gray.500' as='span'>Trainee</Text>
                                    {`: ${traineeInfo?.rank} ${traineeInfo?.last_name}, ${traineeInfo?.first_name}`}
                                </Text>
                            </Checkbox>
                        )
                    })}
                    </Box>
                    <Box w='100%' shadow='md' borderRadius={'5px'} border='1px' borderColor='gray.200' p='5'>
                        <Box display='flex' >
                            <Text whiteSpace={'8'}>
                                Batch:
                                <Text as='span'>{``}</Text>
                            </Text>
                            <Text whiteSpace={'8'} ml='2'>
                                From:
                                <Text as='span'>{`${startDate}`}</Text>
                            </Text>
                            <Text whiteSpace={'8'} ml='2'>
                                To:
                                <Text as='span'>{`${endDate}`}</Text>
                            </Text>
                        </Box>
                        <Box>
                        {selectedTrainings.map((training, index) => (
                            <Box key={index}>
                                <Text>{training.id}</Text>
                                <Text>{training.start_date}</Text>
                                {training.numOfDays > 1 && (
                                    <Text>{training.end_date}</Text>
                                )}
                            </Box>
                        ))}
                        </Box>
                    </Box>
                </Box>
            </ModalBody>
            <ModalFooter borderTopWidth='2px' display={'flex'} justifyContent='center'>
                <Button onClick={onClose} variant={'outline'} colorScheme='red' mr={3} shadow='md'>Cancel</Button>
                <Button onClick={handlerevise} loadingText='Creating Batch...' colorScheme='blue' bgColor='blue.700' shadow='md'>Create Batch</Button>
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