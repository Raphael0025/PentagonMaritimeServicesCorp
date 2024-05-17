'use client'

import { usePathname  } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { Box, Button, Center, Circle, Heading, Text, Wrap, WrapItem, useDisclosure, Avatar, AvatarBadge, IconButton, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer,  } from '@chakra-ui/react'
import 'animate.css'
import EmployeeIcon from '@/Components/Icons/EmployeeIcon'
import OnLeaveIcon from '@/Components/Icons/OnLeaveIcon'
import EducatedIcon from '@/Components/Icons/EducatedIcon'
import BusinessIcon from '@/Components/Icons/BusinessIcon'
import ViewIcon from '@/Components/Icons/ViewIcon'
import { firestore, getTotalEmployees, getAllCandidateData } from '@/lib/controller'
import { CandidateValues } from '@/types/document'
import { collection, onSnapshot } from 'firebase/firestore'

export default function Page(){
    
    const [employees, setEmployees] = useState<CandidateValues[]>([])
    const [totalEmployees, setTotalEmployees] = useState<number>(0)
    const [totalNTS, setTotalNTS] = useState<number>(0)
    const [totalTS, setTotalTS] = useState<number>(0)
    const [totalLE, setTotalLE] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)

    const db = firestore

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllCandidateData('Hired')
                setEmployees(data)

                const te = await getTotalEmployees('all')
                setTotalEmployees(te)

                // Fetch total number of on-site candidates
                const nts = await getTotalEmployees('Non-Teaching Staff');
                setTotalNTS(nts);

                // Fetch total number of on-site candidates
                const ts = await getTotalEmployees('Teaching Staff');
                setTotalTS(ts);

                setLoading(false); // Data fetching completed, set loading to false
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false); // Set loading to false even if there's an error
            }
        }

        // Fetch initial data
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
            <main className='flex flex-col p-6 space-y-5 py-0 h-full'>
                {/* <Heading as='h4' size='md' color='#a1a1a1'>Employee Management</Heading> */}
                <section className='w-full space-y-4'>
                    <section className='flex space-x-4'>
                        <Box className='w-full flex flex-col space-y-5'>
                            <Heading as='h4' size='md' color='#a1a1a1'>Employee Management</Heading>
                            <Box className='w-full grid gap-4 grid-cols-2'>
                                <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 px-5 p-3 rounded border-t border-gray-200 items-center '>
                                    <Box>
                                        <Heading as='h4' size='lg'>{loading ? 'Loading...' : totalEmployees}</Heading>
                                        <Text color='#a1a1a1'>Total Employees</Text>
                                    </Box>
                                    <Circle size='50px' bg='#2F67B250'>
                                        <EmployeeIcon />
                                    </Circle>
                                </Box>
                                <Box bgGradient='linear(to-br, #fff, #fff, #ffd84d)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 px-5 p-3 rounded border-t border-gray-200 items-center '>
                                    <Box>
                                        <Heading as='h4' size='lg'>{loading ? 'Loading...' : 0}</Heading>
                                        <Text color='#a1a1a1'>On Leave</Text>
                                    </Box>
                                    <Circle size='50px' bg='#dbac0050'>
                                        <OnLeaveIcon />
                                    </Circle>
                                </Box>
                                <Box bgGradient='linear(to-br, #fff, #fff, #17ab0d60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 px-5 p-3 rounded border-t border-gray-200 items-center '>
                                    <Box>
                                        <Heading as='h4' size='lg'>{loading ? 'Loading...' : totalTS}</Heading>
                                        <Text color='#a1a1a1'>Teaching Staff</Text>
                                    </Box>
                                    <Circle size='50px' bg='#17ab0d50'>
                                        <EducatedIcon />
                                    </Circle>
                                </Box>
                                <Box bgGradient='linear(to-br, #fff, #fff, #a1a1a170)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 px-5 p-3 rounded border-t border-gray-200 items-center '>
                                    <Box>
                                    <Heading as='h4' size='lg'>{loading ? 'Loading...' : totalNTS}</Heading>
                                        <Text color='#a1a1a1'>Non-Teaching Staff</Text>
                                    </Box>
                                    <Circle size='50px' bg='#a1a1a150'>
                                        <BusinessIcon />
                                    </Circle>
                                </Box>
                            </Box>
                        </Box>
                        <Box className='w-3/4 flex flex-col '>
                            <Heading as='h4' color='#a1a1a1' size='sm' className='py-3'>Pending Approval</Heading>
                            <Box className='flex flex-col'>
                                <Box style={{maxHeight: "175px"}} className='p-3 overflow-y-scroll shadow-md shadow-gray-500/50 rounded border border-gray-300'>
                                    <Text className='p-3'>Table here</Text>
                                    <Text className='p-3'>Table here</Text>
                                    <Text className='p-3'>Table here</Text>
                                    <Text className='p-3'>Table here</Text>
                                    <Text className='p-3'>Table here</Text>
                                    <Text className='p-3'>Table here</Text>
                                    <Text className='p-3'>Table here</Text>
                                </Box>
                            </Box>
                        </Box>
                    </section>
                    <section className='w-full py-3 space-y-3'>
                        <Box className='flex justify-between items-center'>
                            <Box>Insert search bar here</Box>
                        </Box>
                        <Box>
                            <TableContainer>
                                <Table variant='simple'>
                                    <Thead>
                                        <Tr>
                                            <Th>Date Added</Th>
                                            <Th>User Code</Th>
                                            <Th>Employee</Th>
                                            <Th>Department</Th>
                                            <Th>Job Title</Th>
                                            <Th>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody> 
                                        {loading ? (
                                            <Tr>
                                                <Td colSpan={8} textAlign="center">Loading...</Td>
                                            </Tr>
                                        ) : (
                                            <>
                                            {employees.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={8} textAlign="center">No employees available</Td>
                                                </Tr>
                                            ) : (
                                                employees.map((employee: CandidateValues) => (
                                                    <Tr key={employee.id}>
                                                        <Td>{employee.candidate_added}</Td>
                                                        <Td>{employee.user_code}</Td>
                                                        <Td>{employee.full_name}</Td>
                                                        <Td>{employee.department}</Td>
                                                        <Td>{employee.job_position}</Td>
                                                        <Td>
                                                            <Box className='flex space-x-2 items-center'>
                                                                <Link href={`/enterprise-portal/admin/employee/${employee.id}`} >
                                                                    <ViewIcon />
                                                                </Link>
                                                                {/* <button ref={cancelRef} onClick={() => {openDeleteDialog(); setIdRef(candidate.id)}}>
                                                                    <CloseIcon />
                                                                </button> */}
                                                            </Box>
                                                        </Td>
                                                    </Tr>
                                                )))}
                                            </>
                                        )}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </section>
                </section>
            </main>
        </>
    )
}