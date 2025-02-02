'use client'

import React, { useState } from 'react'
import { Box, Text, Select } from '@chakra-ui/react'
import { getFormatTimeDate, convertVal, getBorderTextColor, getBGColor } from '@/handlers/util_handler' 
import { useTickets } from '@/context/TicketContext'
import { UpdateTicket } from '@/lib/ticket_controller'

export default function Tickets(){

    const {data: allTickets} = useTickets()
    const [isEdit, setEdit] = useState<boolean>(false)

    const changeValue = async (id: string, val: number, type: string) => {
        setEdit(true)
        
        await UpdateTicket(id, val, type)
        
        setEdit(false)
    }

    return(
    <>
        <Box>
            <Text color='blue.700' fontSize='2xl' fontWeight='750'>Ticketing System</Text>
            <Box>
                {/** 1st Row widgets */}
                <Box display='flex' justifyContent='space-between' className='space-x-4'>
                    <Box w='20%' display='flex' borderRadius='10px' borderColor='gray.400' p='4' shadow='md'>
                        <Box >
                            <Text fontSize='lg' color='gray.500' >Overall Tickets</Text>
                            <Text fontSize='xl' color='blue.700' >{allTickets?.length || 0}</Text>
                        </Box>
                        <Box >
                        </Box>
                    </Box>
                    <Box w='20%' display='flex' borderRadius='10px' borderColor='gray.400' p='4' shadow='md'>
                        <Box >
                            <Text fontSize='lg' color='gray.500' >Closed Tickets</Text>
                            <Text fontSize='xl' color='blue.700' >{allTickets?.filter((ticket) => ticket.status === 3).length || 0}</Text>
                        </Box>
                        <Box >
                        </Box>
                    </Box>
                    <Box w='20%' display='flex' borderRadius='10px' borderColor='gray.400' p='4' shadow='md'>
                        <Box >
                            <Text fontSize='lg' color='gray.500' >Opened Tickets</Text>
                            <Text fontSize='xl' color='blue.700' >{allTickets?.filter((ticket) => ticket.status === 0).length || 0}</Text>
                        </Box>
                        <Box >
                        </Box>
                    </Box>
                    <Box w='20%' display='flex' borderRadius='10px' borderColor='gray.400' p='4' shadow='md'>
                        <Box >
                            <Text fontSize='lg' color='gray.500' >Resolved Tickets</Text>
                            <Text fontSize='xl' color='blue.700' >{allTickets?.filter((ticket) => ticket.status === 2).length || 0}</Text>
                        </Box>
                        <Box >
                        </Box>
                    </Box>
                    <Box w='20%' display='flex' borderRadius='10px' borderColor='gray.400' p='4' shadow='md'>
                        <Box >
                            <Text fontSize='lg' color='gray.500' >High Priority Tickets</Text>
                            <Text fontSize='xl' color='blue.700' >{allTickets?.filter((ticket) => ticket.prio === 2).length || 0}</Text>
                        </Box>
                        <Box >
                        </Box>
                    </Box>
                </Box>
                {/** 2nd Row Table */}
                <Box p='4' >
                    <Box color='gray.500' display='flex' justifyContent='space-between' borderRadius='10px' borderWidth='2px' borderColor='gray.400' px='6' py='3'>
                        <Text w='20%'>ID</Text>
                        <Text w='20%'>Title</Text>
                        <Text w='40%'> Issue</Text>
                        <Text textAlign='center' w='20%'>User</Text>
                        <Text textAlign='center' w='20%'>Status</Text>
                        <Text textAlign='center' w='20%'>Category</Text>
                        <Text textAlign='center' w='20%'>Priority</Text>
                        <Text textAlign='center' w='20%'>Created At</Text>
                    </Box>
                    <Box maxH='550px' overflowY='auto'>
                    {allTickets && allTickets.map((ticket, index) => (
                        <Box key={index} display='flex' color='gray.600' borderColor='gray.400' borderBottomWidth='1px' justifyContent='space-between' px='6' py='3'>
                            <Text w='20%'>{ticket.ticket_id}</Text>
                            <Text w='20%' textTransform='uppercase' >{ticket.title}</Text>
                            <Text w='40%' textTransform='uppercase' >{ticket.issue}</Text>
                            <Text textAlign='center' w='20%'>{ticket.actor}</Text>
                            <Box display='flex' justifyContent='center' w='20%'>
                                <Select size='sm' bgColor={getBGColor(ticket.status, 'status')} color={getBorderTextColor(ticket.status, 'status')} borderColor={getBorderTextColor(ticket.status, 'status')} isDisabled={isEdit} onChange={(e) => {changeValue(ticket.id, Number(e.target.value), 'status')}} textAlign='center' borderRadius='full' w='70%' >
                                    <option hidden>{convertVal(ticket.status, 'status')}</option>
                                    <option value={0}>{`Open`}</option>
                                    <option value={1}>{`In Progress`}</option>
                                    <option value={2}>{`Resolved`}</option>
                                </Select>
                            </Box>
                            <Box display='flex' justifyContent='center' w='20%'>
                                <Select size='sm' bgColor={getBGColor(ticket.category, 'category')} color={getBorderTextColor(ticket.category, 'category')} borderColor={getBorderTextColor(ticket.category, 'category')} isDisabled={isEdit} onChange={(e) => {changeValue(ticket.id, Number(e.target.value), 'category')}} textAlign='center' borderRadius='full' w='70%' >
                                    <option hidden>{convertVal(ticket.category, 'category')}</option>
                                    <option value={0}>{`Software`}</option>
                                    <option value={1}>{`Hardware`}</option>
                                </Select>
                            </Box>
                            <Box display='flex' justifyContent='center' w='20%'>
                                <Select size='sm' bgColor={getBGColor(ticket.prio, 'prio')} color={getBorderTextColor(ticket.prio, 'prio')} borderColor={getBorderTextColor(ticket.prio, 'prio')} isDisabled={isEdit} onChange={(e) => {changeValue(ticket.id, Number(e.target.value), 'prio')}} textAlign='center' borderRadius='full' w='70%' >
                                    <option hidden>{convertVal(ticket.prio, 'prio')}</option>
                                    <option value={0}>{`Low`}</option>
                                    <option value={1}>{`Medium`}</option>
                                    <option value={2}>{`High`}</option>
                                </Select>
                            </Box>
                            <Text textAlign='center' w='20%'>{getFormatTimeDate(ticket.createdAt.toDate())}</Text>
                        </Box>
                    ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    </>
    )
}