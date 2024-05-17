'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, Circle, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, TableContainer, Table, Th, Thead, Tbody, Td, Tr, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css'
import EmployeeIcon from '@/Components/Icons/EmployeeIcon'
import NewTraineeIcon from '@/Components/Icons/NewTraineeIcon'
import PieChatWithLabel from '@/Components/PieChartWithLabel'
import MixedBarChartComponent from '@/Components/MixedBarChartComponent'

export default function Page(){
    
    return(
        <> 
            <main className='flex space-y-4 px-6 flex-col'>
                <section className='w-2/5 grid grid-flow-col grid-cols-2 md:grid-flow-row gap-4'>
                <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3  rounded border-t border-gray-200 items-center '>
                        <Box className='w-full'>
                            <Heading as='h4' size='lg' textAlign='center' >56</Heading>
                            <Text color='#a1a1a1'>New Trainees</Text>
                        </Box>
                        <Circle size='50px' bg='#2F67B250'>
                            <NewTraineeIcon />
                        </Circle>
                    </Box>
                    <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3  rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading as='h4' size='lg' textAlign='center' >56</Heading>
                            <Text color='#a1a1a1'>Total Trainees Enrolled</Text>
                        </Box>
                        <Circle size='50px' bg='#2F67B250'>
                            <EmployeeIcon />
                        </Circle>
                    </Box>
                </section>
                <section className='w-full flex space-x-6 justify-between'>
                    <Box className='rounded w-full border p-3 border-slate-500'>
                        <MixedBarChartComponent />
                    </Box>
                    <PieChatWithLabel />
                    <PieChatWithLabel />
                </section>
                <section className='w-full grid gap-4 grid-cols-5' style={{minHeight: '300px'}}>
                    <Box className='rounded border border-slate-500 px-4 col-span-3 h-full'>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Full Name</Th>
                                        <Th>Rank/Position</Th>
                                        <Th>Registration No.</Th>
                                        <Th>Date & time</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        <Td fontSize={10}>Raphael Pepiton B. Isla</Td>
                                        <Td fontSize={10}>Software Developer</Td>
                                        <Td fontSize={10}>123456789012</Td>
                                        <Td fontSize={10}>May 4, 2024, 05:30 pm</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='rounded border border-slate-500 px-1'>
                        <TableContainer>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Companies</Th>
                                        <Th>Trainees</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        <Td>Marsaman</Td>
                                        <Td>3000</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    <Box className='rounded border border-slate-500 px-2'>
                        <TableContainer>
                        <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Course</Th>
                                        <Th>Enrolled</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        <Td>Anti-Piracy</Td>
                                        <Td>3000</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                </section>
            </main>
        </>
    )
}