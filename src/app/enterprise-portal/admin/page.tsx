'use client'

import { usePathname  } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, Circle, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css'
import EmployeeIcon from '@/Components/Icons/EmployeeIcon'
import OnLeaveIcon from '@/Components/Icons/OnLeaveIcon'

export default function Page(){
    return(
        <>
            <main className='flex space-x-6 px-6 '>
                <section className='w-full space-y-7'>
                    <Box className='flex space-x-8 w-full'>
                        <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 w-1/4 rounded border-t border-gray-200 items-center '>
                            <Box>
                                <Heading as='h4' size='lg'>56</Heading>
                                <Text color='#a1a1a1'>Employees</Text>
                            </Box>
                            <Circle size='50px' bg='#2F67B250'>
                                <EmployeeIcon />
                            </Circle>
                        </Box>
                        <Box bgGradient='linear(to-br, #fff, #fff, #ffd84d)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 w-1/4 rounded border-t border-gray-200 items-center '>
                            <Box>
                                <Heading as='h4' size='lg'>56</Heading>
                                <Text color='#a1a1a1'>Leave Requests</Text>
                            </Box>
                            <Circle size='50px' bg='#dbac0050'>
                                <OnLeaveIcon />
                            </Circle>
                        </Box>
                        <Box bgGradient='linear(to-br, #fff, #fff, #ffd84d)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 w-1/4 rounded border-t border-gray-200 items-center '>
                            <Box>
                                <Heading as='h4' size='lg'>56</Heading>
                                <Text color='#a1a1a1'>Candidates</Text>
                            </Box>
                            <Circle size='50px' bg='#dbac0050'>
                                <OnLeaveIcon />
                            </Circle>
                        </Box>
                    </Box>
                    <Box className='space-y-5'>
                        <Heading as='h4' size='md' color="#a1a1a1">Satisfaction</Heading>
                        <Box className='flex justify-evenly'>
                            <Box className='w-1/3'>
                                <Heading as='h5' size='sm' color="#a1a1a1" >Client</Heading>
                                <Box></Box>
                            </Box>
                            <Box className='w-1/3'>
                                <Heading as='h5' size='sm' color="#a1a1a1" >Customer</Heading>
                                <Box></Box>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Heading as='h4' size='md' color='#a1a1a1'>Inventory Issue Log</Heading>
                        <Box></Box>
                    </Box>
                </section>
                <section className='w-1/3 flex flex-col justify-between'>
                    <Box className='p-4'>
                        <Heading as='h5' size='sm' color='#a1a1a1'>Birthday Celebrants</Heading>
                        <Box></Box>
                    </Box>
                    <Box className='p-4'>
                        <Heading as='h5' size='sm' color='#a1a1a1'>Equipment Requests</Heading>
                        <Box></Box>
                    </Box>
                </section>
            </main>
        </>
    )
}