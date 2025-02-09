'use client'

import React, { useState, useEffect } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { useTickets } from '@/context/TicketContext'
import { TICKET_BY_ID } from '@/types/utils' 
import { convertVal, getBorderTextColor } from '@/handlers/util_handler'

export default function Page (){
    const {data: allTickets} = useTickets();
    const [actor, setActor] = useState<string | null>('')

    useEffect(() => {
        const fetchData = () => {
            const getActor = localStorage.getItem('customToken')
            setActor(getActor)
        } 
        fetchData()
    }, [actor])
    
    return(
    <>
        <Box p='8'>
            <Text fontSize='2xl' color='blue.700' >Ticket Monitoring</Text>    
            <Text fontSize='md' fontWeight='normal' color='gray.500' >{`This page allows you to view and track the status of your submitted tickets. Monitor updates, check progress, and stay informed about resolutions provided by the system administrator.`}</Text>    
            <Box mt='5' display='flex' gap='4' flexWrap={'wrap'}>
            {allTickets && allTickets.length > 0 ? (
                allTickets && allTickets.filter((ticket) => ticket.actor === actor).map((ticket: TICKET_BY_ID) => (
                <Box key={ticket.id} p="4" w='550px' borderWidth="1px" borderRadius="lg" shadow="md" mb="4">
                    <Box h='100%' display='flex' flexDir='column' justifyContent={'space-between'}>
                        <Box display='flex' fontSize="base" textTransform='uppercase' color="blue.700" alignItems='center' justifyContent='space-between'>
                            <Text>{`Ticket ID: ${ticket.ticket_id}`}</Text>
                            <Text>Subject: {ticket.title}</Text>
                        </Box>
                        <Text px='6' my='3' color='gray.500'>{ticket.issue}</Text>
                        <Box display='flex' textTransform='uppercase' alignItems='center' justifyContent='space-between'>
                            <Text fontSize="sm" color={getBorderTextColor(ticket.status, 'status')}>{`Status: ${convertVal(ticket.status, 'status')}`}</Text>
                            <Text fontSize="sm" color={getBorderTextColor(ticket.prio, 'prio')}>{`Priority: ${convertVal(ticket.prio, 'prio')}`}</Text>
                        </Box>
                    </Box>
                </Box>
                ))
            ) : (
                <Text fontSize="md" color="gray.500">{`No tickets found for the current user.`}</Text>
            )}
            </Box>
        </Box>
    </>
    )
}