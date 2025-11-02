'use client'

import React, { useState } from 'react'
import { Box, Text, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext';
import { useTrainees } from '@/context/TraineeContext';

import { CloseIcon } from '@/Components/Icons';
import { Course, CourseFee, TrainingDate, AccountType } from './EditTraining'
import { TRAINING_BY_ID, initTraining } from '@/types/trainees'
import { InsertTraining } from '@/Components/Modal/Pending'

import { UPDATE_TRAINING, UPDATE_REGISTRATION } from '@/lib/trainee_controller'

interface PageProps {
    onClose: () => void;
    reg_id: string;
    reg_Type: number;
}

export default function EditRegistration({onClose, reg_id, reg_Type}: PageProps){
    const { lastMonthReg: allRegistrations } = useRegistrations()
    const { data: allTraining } = useTraining()
    const { data: allTrainee } = useTrainees()
    const { data: allCourses } = useCourses()
    const { courseCodes } = useClients()
    
    const { isOpen: isOpenCourse, onOpen: onOpenCourse, onClose: onCloseCourse } = useDisclosure()
    const { isOpen: isOpenCF, onOpen: onOpenCF, onClose: onCloseCF } = useDisclosure()
    const { isOpen: isOpenTD, onOpen: onOpenTD, onClose: onCloseTD } = useDisclosure()
    const { isOpen: isOpenAT, onOpen: onOpenAT, onClose: onCloseAT } = useDisclosure()
    const { isOpen: isOpenRB, onOpen: onOpenRB, onClose: onCloseRB } = useDisclosure()
    const { isOpen: isOpenTraining, onOpen: onOpenTraining, onClose: onCloseTraining } = useDisclosure()
    
    const [cID, setCID] = useState<string>('')
    const [account_type, setAccType] = useState<number>(0)
    const [trainingID, setTID] = useState<string>('')
    const [regID, setRegID] = useState<string>('')
    const [courseFee, setCF] = useState<number>(0)
    const [at, setAT] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [trainingDoc, setTraining] = useState<TRAINING_BY_ID>(initTraining)

    const fetchedReg = allRegistrations?.find((reg) => reg.id === reg_id)
    const companyID = allTrainee?.find((t) => t.id === fetchedReg?.trainee_ref_id)?.company || ''

    const handleRollback = async () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const rollbackTraining = {
                        reg_status: 2,
                        regType: 2,
                    }
                    const rollbackReg = {
                        reg_no: '',
                        regType: 2,
                    }
                    const totalTrainings = allTraining && allTraining.filter((train) => train.reg_status === 3 && train.regType === reg_Type && train.reg_ref_id === reg_id).length || 0
                    if(totalTrainings > 1){
                        await UPDATE_TRAINING(trainingID, rollbackTraining, actor)
                    } else {
                        await UPDATE_TRAINING(trainingID, rollbackTraining, actor)
                        await UPDATE_REGISTRATION(regID, rollbackReg, actor)
                        onClose()
                    }
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
            onCloseRB()
        })
    }

    return(
    <>
    <Box>
        <Box display='flex' justifyContent='space-between'>
            <Text fontSize='lg' fontWeight='800' color='blue.700' textTransform='uppercase'>Trainings</Text>
            <Button onClick={onClose} variant='ghost' ><CloseIcon /></Button>
        </Box>
        <Box mt='4'>
            <Box display='flex' justifyContent='space-between'>
                <Box display='flex'>
                    <Text mr='2'>Account Type:</Text>
                    <Text onClick={() => {onOpenAT(); setRegID(fetchedReg?.id ?? ''); setAT(fetchedReg?.reg_accountType ?? 0);}} _hover={{color: 'blue.700'}} className='hover:cursor-pointer'>{`${fetchedReg?.reg_accountType === 0 ? 'Crew' : 'Company'} Charge`}</Text>
                </Box>
                <Box display='flex' >
                    <Text color='gray.600' mr='3'>Registraion Number:</Text>
                    <Text color='blue.700'>{`REG-${fetchedReg?.reg_no}`}</Text>
                </Box>
            </Box>
            <Box display='flex' justifyContent='end' py='3'>
                <Button size='xs' onClick={() => {onOpenTraining(); setAccType(fetchedReg?.reg_accountType ?? 0); setCID(companyID); setRegID(fetchedReg?.id ?? '');}} colorScheme='blue' bgColor='blue.700' shadow='md'>Add Training</Button>
            </Box>
            <Box mt='2'>
                <Box p='2' borderBottom='1px' bgColor='blue.700' borderBottomColor='gray.500' mb='2' display='flex' alignItems='center' justifyContent='space-between'>
                    <Text color='#fff' w='50%' textTransform={'uppercase'} fontSize='12px'>Course</Text>
                    <Text color='#fff' w='50%' textTransform={'uppercase'} fontSize='12px'>Course Fee</Text>
                    <Text color='#fff' w='100%' textTransform={'uppercase'} fontSize='12px'>Training Dates</Text>
                    <Text color='#fff' w='50%' display='flex' justifyContent='end' textTransform={'uppercase'} fontSize='12px'>Action</Text>
                </Box>
                {allTraining && allTraining.filter((train) => train.reg_status === 3 && train.regType === reg_Type && train.reg_ref_id === reg_id)
                .map((train) => {

                    const course = allCourses?.find((course) => course.id === train.course)?.course_code || courseCodes?.find((course) => course.id === train.course)?.company_course_code || ''

                    return(
                        <Box key={train.id} p='2' borderBottom='1px' borderBottomColor='gray.500' mb='2' display='flex' alignItems='center' justifyContent='space-between'>
                            <Text w='50%' className='hover:cursor-pointer' _hover={{color: 'blue.700'}} onClick={() => {onOpenCourse(); setTID(train.id);}} textTransform={'uppercase'} fontSize='12px'>{course}</Text>
                            <Text w='50%' className='hover:cursor-pointer' _hover={{color: 'blue.700'}} onClick={() => {onOpenCF(); setCF(train.course_fee); setTID(train.id);}} textTransform={'uppercase'} fontSize='12px'>{`₱ ${train.course_fee}`}.00</Text>
                            <Text w='100%' className='hover:cursor-pointer' _hover={{color: 'blue.700'}} onClick={() => {onOpenTD(); setTraining(train);}} >
                                <Text as='span' mr='3'>{train.start_date}</Text>
                                {train.end_date !== '' && (
                                <>
                                    <Text as='span' mr='3'>to</Text>
                                    <Text as='span'>{train.end_date}</Text>
                                </>
                                )}
                            </Text>
                            <Box w='50%' display='flex' justifyContent='end' >
                                <Button colorScheme='red' onClick={() => {onOpenRB(); setTID(train.id); setRegID(reg_id);}} size='xs' shadow='md'>Rollback</Button>
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </Box>
    </Box>
    <Modal isOpen={isOpenCourse} onClose={onCloseCourse}>
        <ModalOverlay />
        <Course onClose={onCloseCourse} company_id={companyID} trainingID={trainingID} />
    </Modal>
    <Modal isOpen={isOpenCF} onClose={onCloseCF}>
        <ModalOverlay />
        <CourseFee onClose={onCloseCF} course_fee={courseFee} training_id={trainingID}/>
    </Modal>
    <Modal isOpen={isOpenTD} onClose={onCloseTD}>
        <ModalOverlay />
        <TrainingDate onClose={onCloseTD} training={trainingDoc} />
    </Modal>
    <Modal isOpen={isOpenAT} size='lg' onClose={onCloseAT}>
        <ModalOverlay />
        <AccountType onClose={onCloseAT} regID={regID} curr_accountType={at} />
    </Modal>
    <Modal isOpen={isOpenTraining} onClose={onCloseTraining} scrollBehavior='inside' size='full'>
        <ModalOverlay />
        <ModalContent bgColor='#00000099'>
            <ModalBody px={{base: '5%', md: '10%', lg: '30%'}} py='2%'>
                <InsertTraining c_id={cID} accountType={account_type} onClose={onCloseTraining} reg_id={regID} tab={1} />
            </ModalBody>
        </ModalContent>
    </Modal>
    <Modal isOpen={isOpenRB} onClose={onCloseRB}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader >Rollback to Pending</ModalHeader>
            <ModalBody display={'flex'} flexDir='column' justifyContent={'center'} alignItems='center'>
                <Text fontSize={'base'} textAlign='center'>
                    Are you sure to transfer this training back to Pending? You cannot undo This action for it is permanent.
                </Text>
            </ModalBody>
            <ModalFooter display='flex' justifyContent={'center'}>
                <Button onClick={onCloseRB} mr='3' variant='outline' colorScheme='red' shadow='md'>Cancel</Button>
                <Button onClick={handleRollback} isLoading={loading} loadingText='Rolling Back...' colorScheme='blue' bgColor='blue.700' shadow='md'>Proceed</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
    
    </>
    )
}