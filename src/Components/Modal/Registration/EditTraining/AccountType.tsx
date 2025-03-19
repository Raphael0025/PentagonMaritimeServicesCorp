'use client'

import React, { useState } from 'react'
import { Text, Button, ModalContent, ModalFooter, ModalHeader, ModalBody } from '@chakra-ui/react';
import { useTraining } from '@/context/TrainingContext'

import { UPDATE_TRAINING, UPDATE_REGISTRATION } from '@/lib/trainee_controller'

interface PageProps {
    onClose: () => void;
    regID: string;
    curr_accountType: number;
}

export default function AccountType({onClose, regID, curr_accountType}: PageProps){
    const [loading, setLoading] = useState<boolean>(false)
    const { data: allTraining } = useTraining()

    const handleChangeAT = () => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const updatedAT = curr_accountType === 0 ? 1 : 0

                    const updateAT = { reg_accountType: updatedAT }
                    const updateTrainingAT = { accountType: updatedAT }

                    await UPDATE_REGISTRATION(regID, updateAT, actor)
                    
                    const SpecificTrainings = allTraining && allTraining.filter((training) => training.reg_ref_id === regID)
                    SpecificTrainings?.forEach(async (training) => {
                        await UPDATE_TRAINING( training.id, updateTrainingAT, actor)
                    })
                    res()
                }catch(error){
                    rej(error)
                }
            },500)
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            onClose()
        }) 
    }

    return(
    <>
        <ModalContent>
            <ModalHeader>Change Account Type</ModalHeader>
            <ModalBody>
                <Text fontSize='md' textAlign='center'>Are you sure to change the account type of this registration?</Text>
                <Text fontSize='md' textAlign='center'>Please be informed that all trainings under this registration will also change their account types and this action is permanent and cannot be undone.</Text>
            </ModalBody>
            <ModalFooter display='flex' justifyContent='center'>
                <Button onClick={onClose} mr='3' shadow='md' colorScheme='red' variant='outline'>Cancel</Button>
                <Button onClick={handleChangeAT} loadingText='Updating...' colorScheme='blue' bgColor='blue.700' isLoading={loading} shadow='md'>Change</Button>
            </ModalFooter>
        </ModalContent>
    </>
    )
}