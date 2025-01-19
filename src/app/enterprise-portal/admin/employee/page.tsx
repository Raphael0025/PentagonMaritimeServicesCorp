'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react';
import { Box, Button, Circle, Heading, Text, Wrap, WrapItem, useDisclosure, Avatar, AvatarBadge, IconButton, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer,  } from '@chakra-ui/react'
import { ViewIcon, BusinessIcon, EducatedIcon, OnLeaveIcon, EmployeeIcon, } from '@/Components/Icons'
import { GetCompanyUserSpecificData } from '@/types/company_users'
import { formatDate } from '@/types/handling'
import { countCompanyUsersByCategoryStatusAndType, getUserPerStatusOf } from '@/handlers/company_user_handler'
import { useCompanyUsers } from '@/context/CompanyUserContext'

export default function Page(){
    const {data: allCompanyUsers} = useCompanyUsers()
    const [employees, setEmployees] = useState<GetCompanyUserSpecificData[]>([])
    const [totalEmployees, setTotalEmployees] = useState<number>(0)
    const [totalNTS, setTotalNTS] = useState<number>(0)
    const [totalTS, setTotalTS] = useState<number>(0)
    const [totalLE, setTotalLE] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const {total_staff, total_teaching_staff, total_non_teaching_staff } = await countCompanyUsersByCategoryStatusAndType(allCompanyUsers)
                const company_staff_data = await getUserPerStatusOf('Hired', allCompanyUsers)
                setEmployees(company_staff_data)
                setTotalEmployees(total_staff)
                setTotalNTS(total_non_teaching_staff);
                setTotalTS(total_teaching_staff);                
                
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false); // Set loading to false even if there's an error
            } finally {
                setLoading(false); // Data fetching completed, set loading to false
            }
        }
        fetchData();
    }, [allCompanyUsers]);

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
                                                employees.map((employee: GetCompanyUserSpecificData) => (
                                                    <Tr key={employee.id}>
                                                        <Td>{formatDate(employee.candidate_added.toDate())}</Td>
                                                        <Td>{employee.user_code}</Td>
                                                        <Td>{employee.full_name}</Td>
                                                        <Td>{employee.department}</Td>
                                                        <Td>{employee.job_position}</Td>
                                                        <Td>
                                                            <Box className='flex space-x-2 items-center'>
                                                                <Link href={`/enterprise-portal/admin/employee/${employee.id}`} >
                                                                    <ViewIcon color={'#0D70AB'} size={'24'} />
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