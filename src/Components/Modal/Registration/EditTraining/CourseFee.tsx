'use client'

import React, { useState } from 'react'
import { Input, Button, InputLeftAddon, InputGroup, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';

import { UPDATE_TRAINING } from '@/lib/trainee_controller'

interface PageProps {
    onClose: () => void;
    course_fee: number;
    training_id: string;
}

export default function CourseFee({onClose, course_fee, training_id}: PageProps){
    const [courseFee, setCF] = useState<number>(course_fee)
    const [loading, setLoading] = useState<boolean>(false)

    const handleUpdate = async () => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const updateCF = {
                        course_fee: courseFee
                    }
                    await UPDATE_TRAINING(training_id, updateCF, actor)
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
            <ModalHeader>Edit Course Fee</ModalHeader>
            <ModalBody>
                <InputGroup shadow='md'>
                    <InputLeftAddon>₱</InputLeftAddon>
                    <Input id='course_fee' onChange={(e) => setCF(Number(e.target.value))} type='number' value={courseFee} />
                </InputGroup>
            </ModalBody>
            <ModalFooter display='flex' justifyContent='end'>
                <Button onClick={onClose} mr='3' shadow='md' colorScheme='red' variant='outline'>Cancel</Button>
                <Button onClick={handleUpdate} colorScheme='blue' bgColor='blue.700' isLoading={loading} shadow='md'>Update</Button>
            </ModalFooter>
        </ModalContent>
    </>
    )
}