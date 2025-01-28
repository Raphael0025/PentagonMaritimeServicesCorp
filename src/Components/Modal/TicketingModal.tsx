'use client'

import React, { useState } from 'react'
import { Box, Text, Textarea, Input, Button, useToast } from '@chakra-ui/react'

import { ToastStatus } from '@/types/handling'

import { AddTicket } from '@/lib/ticket_controller'

interface ModalProp{
    onClose: () => void;
}

export default function TicketingModal({onClose}: ModalProp){
    const toast = useToast()
    
    const [issue, setIssue] = useState<string>('')
    const [subject, setSubject] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    
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

    const handleSubmitTicket = async () => {
        setLoading(true)
        const getActor = localStorage.getItem('customToken')

        await AddTicket(issue, subject, getActor)
        handleToast('Successfully Submitted Ticket!', `Your ticket has been submitted, please await for the support to resolve your problem.`, 6000, 'success')
        setIssue('')   

        setLoading(false)
        onClose()
    }

    return(
        <>
            <Box>
                <Text fontWeight='bold' color='blue.700' fontSize='2xl' textAlign='center'>IT SUPPORT TICKET FORM</Text>
                <Text fontSize='lg' color='gray.500' textAlign='center'>Please provide the issue of the problem</Text>
            </Box>
            <Box mt='3' className='space-y-4'>
                <Text fontSize='lg'>Subject:</Text>
                <Input onChange={(e) => {setSubject(e.target.value)}} shadow='md' placeholder='Type the Subject here...' />
            </Box>
            <Box mt='3' className='space-y-4'>
                <Text fontSize='lg'>Message:</Text>
                <Textarea onChange={(e) => {setIssue(e.target.value)}} shadow='md' minH='250px' resize='vertical' placeholder='Type the problem here...' />
                <Button onClick={handleSubmitTicket} isDisabled={!issue} colorScheme='blue' w='100%' bgColor='blue.700' isLoading={loading} loadingText='Submitting...'>Submit Ticket</Button>
            </Box>
        </>
    )
}