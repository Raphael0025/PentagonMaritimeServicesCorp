'use client'

import React, {useState, useEffect} from 'react'
import { Box, Text, Input, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTrainees } from '@/context/TraineeContext'

import { UPDATE_TRAINING } from '@/lib/trainee_controller'

interface PageProps {
    onClose: () => void;
    reg_id: string;
    reg_Type: number;
}


export default function CreateBatch({onClose}: PageProps){
    const { lastMonthReg: allRegistrations } = useRegistrations()
    const { data: allTraining } = useTraining()
    const { data: allTrainee } = useTrainees()
    const { data: allCourses } = useCourses()
    const { courseCodes } = useClients()

    const handlerevise = async () => {
        const newBatch = {
            batch: ''
        }
        // allTraining.forEach(element => {
            
        // });
        // await UPDATE_TRAINING('', newBatch, '')
    }

    return(
    <>
        <ModalContent>
            <ModalHeader>New Batch</ModalHeader>
            <ModalBody>

            </ModalBody>
            <ModalFooter display={'flex'} justifyContent='end'>
                <Button onClick={onClose} variant={'outline'} colorScheme='red' mr={3} shadow='md'>Cancel</Button>
                <Button onClick={handlerevise} loadingText='Creating Batch...' colorScheme='blue' bgColor='blue.700' shadow='md'>Create</Button>
            </ModalFooter>
        </ModalContent>
    </>
    )
}