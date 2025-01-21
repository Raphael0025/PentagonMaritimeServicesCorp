'use client'

import React, { useState} from 'react'
import { Box, Text, FormControl, Textarea, Button, useToast, } from '@chakra-ui/react'

import { ToastStatus } from '@/types/handling'

import {PROCESS_CANCELLATION} from '@/lib/trainee_controller'

interface ModalProp{
    onClose: () => void;
    reg_id: string;
    training_id: string;
    course: string;
}

export default function CancelModal({onClose, reg_id = '', course = '', training_id = ''}: ModalProp){
    const toast = useToast()

    const [loading, setLoading] = useState<boolean>(false)
    const [isSure, setSure] = useState<boolean>(false)
    const [reason, setReason] = useState<string>('')

    const cancel_Data = reg_id === '' ? `${course} Training` : 'Registration'
    
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

    const handleCancel = async () => {
        setLoading(true)
        const getActor = localStorage.getItem('customToken')

        if(reg_id === '' ){
            await PROCESS_CANCELLATION(training_id, 1, reason, getActor)
            
        }else{
            await PROCESS_CANCELLATION(reg_id, 0, reason, getActor)

        }
        handleToast('Cancelled Successfully!', `This action has now been processed.`, 4000, 'success')
        setLoading(false)
        setReason('')
        setSure(false)
        onClose()
    }

    return(
    <>
        <Box bgColor='#fbffff' py='5' >
        {
            !isSure ? (
                <Box p='5' className='space-y-8'>
                    <Box >
                        <Text textAlign='center' fontSize='xl'>Are you sure to Cancel this {cancel_Data}?</Text>
                        <Text textAlign='center' fontSize='base' color='gray.500'>This action will be permanent and cannot be undone.</Text>
                    </Box>
                    <Box display='flex' justifyContent='center'>
                        <Button onClick={onClose} shadow='md' mr={3}>No</Button>
                        <Button colorScheme='red' shadow='md' onClick={() => {setSure(!isSure)}}>Yes, I'm sure</Button>
                    </Box>
                </Box>
            ) : (
                <Box mt='3' className='space-y-3'>
                    <Text color='gray.700' fontSize='lg'>Please Indicate below the reason for this cancellation:</Text>
                    <FormControl>
                        <Textarea onChange={(e) => {setReason(e.target.value)}} resize='vertical' minH='200px' placeholder='Type here the reason...'/>
                    </FormControl>
                    <Button onClick={handleCancel} isLoading={loading} isDisabled={reason === ''} colorScheme='blue' shadow='md' bgColor='#1c437e' loadingText='Processing...'  w='100%'>Process this action</Button>
                    <Text color='gray.500'>Note: Be advised that the person responsible for this action will be recorded accordingly.</Text>
                </Box>
            )
        }
        </Box>
    </>
    )
}