'use client' 

import { usePathname  } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, Fragment } from 'react';
import { Box, Button, Center, Circle, Heading, Text, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';
import Clock from '@/Components/Clock'
import Date from '@/Components/DateComponent'
import TaskIcon from '@/Components/Icons/TaskIcon'
import ProcessIcon from '@/Components/Icons/ProcessIcon'
import WarningIcon from '@/Components/Icons/WarningIcon'
import TaskComplete from '@/Components/Icons/TaskComplete'

export default function Page() {


    return(
        <>
            <main className='flex flex-col p-3 space-y-5 '>
                <section className='border-b border-gray-300 pb-2 flex justify-between'>
                    <Box>
                        <Heading as='h4' size='md'>Hello, Raphael Isla</Heading> 
                        <Text fontSize='sx' color='#a1a1a1' >Software Developer</Text>
                    </Box>
                    <Box className='flex space-x-6 items-center'>
                        <Box className='border rounded border-gray-300 p-3'>
                            <Clock />
                        </Box>
                        <Box className='border rounded border-gray-300 p-3'>
                            <Date />
                        </Box>
                    </Box>
                </section>
                <section className='flex space-x-5'>
                    <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading as='h4' size='lg'>56</Heading>
                            <Text color='#a1a1a1'>Total Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#2F67B250'>
                            <TaskIcon />
                        </Circle>
                    </Box>
                    <Box bgGradient='linear(to-br, #fff, #fff, #FFFF99)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading as='h4' size='lg'>56</Heading>
                            <Text color='#a1a1a1'>Ongoing Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#FFFF99'>
                            <ProcessIcon />
                        </Circle>
                    </Box>

                    <Box bgGradient='linear(to-br, #fff, #fff, #f4626260)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading as='h4' size='lg'>56</Heading>
                            <Text color='#a1a1a1'>Due Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#f4626260'>
                            <WarningIcon />
                        </Circle>
                    </Box>
                    <Box bgGradient='linear(to-br, #fff, #fff, #0ed10050)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading as='h4' size='lg'>56</Heading>
                            <Text color='#a1a1a1'>Completed Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#0ed10050'>
                            <TaskComplete />
                        </Circle>
                    </Box>
                </section>
                <section className='w-full flex space-x-5 justify-between h-full'>
                    <Box className='p-5 w-1/2 border rounded border-gray-200 h-full'>
                        <Box className='flex justify-between items-center'>
                            <Heading as='h5' size='sm'>To-do List</Heading>
                            <Button size='sm'>Create Task</Button>
                        </Box>
                        <Box>
                            <Text>Hello</Text>
                            <Text>Hello</Text>
                            <Text>Hello</Text>
                            <Text>Hello</Text>
                            <Text>Hello</Text>
                            <Text>Hello</Text>
                            <Text>Hello</Text>
                            <Text>Hello</Text>
                        </Box>
                    </Box>
                    <Box className='p-5 w-1/2 border rounded border-gray-200 h-full'>
                        <Box className='flex justify-between items-center'>
                            <Heading as='h5' size='sm'>My Agendas</Heading>
                            <Button size='sm'>Create Task</Button>
                        </Box>
                        <Box>
                            <Text>Hello</Text>
                        </Box>
                    </Box>
                </section>
            </main>
        </>
    )
}