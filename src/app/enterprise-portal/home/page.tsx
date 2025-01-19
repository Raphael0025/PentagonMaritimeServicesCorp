'use client' 

import { usePathname  } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, Fragment } from 'react';
import { Box, Button, Center, Circle, Heading, Text, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';
import { collection, doc, getDoc, getDocs, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { firestore } from '@/lib/controller'
import { ViewCandidateValues, initViewCandidate } from '@/types/document'
import Clock from '@/Components/Clock'
import Date from '@/Components/DateComponent'
import TaskIcon from '@/Components/Icons/TaskIcon'
import ProcessIcon from '@/Components/Icons/ProcessIcon'
import WarningIcon from '@/Components/Icons/WarningIcon'
import TaskComplete from '@/Components/Icons/TaskComplete'
import ComingSoon from '@/Components/ComingSoon'
import React from 'react';

export default function Page() {
    const [loading, setLoading] = useState<boolean>(false)
    const [company_staff, setCompanyStaff] = useState<ViewCandidateValues>(initViewCandidate); // State to store candidate details
    const [countTotaltask, setTotal] =useState<number>(0)
    const [countOngoingtask, setOngoing] =useState<number>(0)
    const [countDuetask, setDue] =useState<number>(0)
    const [countCompletetask, setCompleted] =useState<number>(0)
    const db = firestore
    
    useEffect(() => {
        const fetchData = async () => {
            const customToken = localStorage.getItem('customToken');

            try {
                setLoading(true)
                const usersCollectionRef = collection(firestore, 'company_users');
                const userQuery = query(usersCollectionRef, where('full_name', '==', customToken));

                const userSnapshot = await getDocs(userQuery);
        
                const userData = userSnapshot.docs[0].data() as ViewCandidateValues;
                setCompanyStaff(userData);
                

            } catch (error) {
                console.error('Error getting employee record:', error);
            } finally {
                setLoading(false)
            }
        };
    
        fetchData();
        
        // Set up real-time listener for database changes
        const candidatesCollection = collection(db, 'company_users');
        const unsubscribe = onSnapshot(candidatesCollection, (snapshot) => {
            fetchData(); // Fetch data again when database changes
        });
        // Clean up subscription
        return () => {
            unsubscribe(); // Unsubscribe from the real-time listener when component unmounts
        };
    }, []);

    return(
        <>
            <main className='flex flex-col p-3 space-y-5 '>
                <section className='border-b border-gray-300 pb-2 flex justify-between'>
                    <Box>
                    {loading ? (
                        <Text fontSize='md' color='#a1a1a1'>Loading...</Text>
                    ) : (
                        <>
                            <Heading as='h4' size='md'>{`Hello, ${company_staff?.full_name}`}</Heading>
                            <Text fontSize='sx' color='#a1a1a1'>
                                {company_staff.roles && typeof company_staff.roles === 'object' ? (
                                    Object.values(company_staff.roles)
                                        .filter(role => role && typeof role === 'object' && role.job_position) // Filter out roles without job_position
                                        .map(role => role.job_position) // Extract job_position values
                                        .join(" / ")
                                ) : (
                                    company_staff.roles
                                )}
                            </Text>
                        </>
                    )}
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
                {countTotaltask ? (
                    <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading fontSize='14px' as='h4' size='lg'>{countTotaltask}</Heading>
                            <Text color='#a1a1a1'>Total Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#2F67B250'>
                            <TaskIcon />
                        </Circle>
                    </Box>
                ) : (
                    <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading fontSize='14px' as='h4' size='lg'>{`No total tasks found`}</Heading>
                            <Text color='#a1a1a1'>Total Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#2F67B250'>
                            <TaskIcon />
                        </Circle>
                    </Box>
                )}

                {countOngoingtask ? (
                    <Box bgGradient='linear(to-br, #fff, #fff, #FFFF99)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading fontSize='14px' as='h4' size='lg'>{countOngoingtask}</Heading>
                            <Text color='#a1a1a1'>Ongoing Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#FFFF99'>
                            <ProcessIcon />
                        </Circle>
                    </Box>
                ) : (
                    <Box bgGradient='linear(to-br, #fff, #fff, #FFFF99)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading fontSize='14px' as='h4' size='lg'>No ongoing tasks found</Heading>
                            <Text color='#a1a1a1'>Ongoing Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#FFFF99'>
                            <ProcessIcon />
                        </Circle>
                    </Box>
                )}

                {countDuetask ? (
                    <Box bgGradient='linear(to-br, #fff, #fff, #f4626260)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading as='h4' fontSize='14px' size='lg'>{countDuetask}</Heading>
                            <Text color='#a1a1a1'>Due Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#f4626260'>
                            <WarningIcon />
                        </Circle>
                    </Box>
                ) : (
                    <Box bgGradient='linear(to-br, #fff, #fff, #f4626260)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading as='h4' fontSize='14px' size='lg'>No due tasks found</Heading>
                            <Text color='#a1a1a1'>Due Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#f4626260'>
                            <WarningIcon />
                        </Circle>
                    </Box>
                )}

                {countCompletetask ? (
                    <Box bgGradient='linear(to-br, #fff, #fff, #0ed10050)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading as='h4' fontSize='14px' size='lg' >{countCompletetask}</Heading>
                            <Text color='#a1a1a1'>Completed Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#0ed10050'>
                            <TaskComplete />
                        </Circle>
                    </Box>
                ) : (
                    <Box bgGradient='linear(to-br, #fff, #fff, #0ed10050)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 p-3 rounded border-t border-gray-200 items-center '>
                        <Box>
                            <Heading as='h4'  fontSize='14px' size='lg'>No completed tasks found</Heading>
                            <Text color='#a1a1a1'>Completed Tasks</Text>
                        </Box>
                        <Circle size='50px' bg='#0ed10050'>
                            <TaskComplete />
                        </Circle>
                    </Box>
                )}
                </section>
                <section className='w-full flex space-x-5 justify-between h-full'>
                    <Box className='p-5 w-1/2 border rounded border-gray-200 h-full'>
                        <Box className='flex justify-between items-center'>
                            <Heading as='h5' size='sm'>To-do List</Heading>
                            <Button size='sm'>Create Task</Button>
                        </Box>
                        <Box>
                            <ComingSoon />
                        </Box>
                    </Box>
                    {/* <Box className='p-5 w-1/2 border rounded border-gray-200 h-full'>
                        <Box className='flex justify-between items-center'>
                            <Heading as='h5' size='sm'>My Agendas</Heading>
                            <Button size='sm'>Create Task</Button>
                        </Box>
                        <Box>
                            <ComingSoon />
                        </Box>
                    </Box> */}
                </section>
            </main>
        </>
    )
}