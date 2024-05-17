'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, Circle, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, TableContainer, Table, Th, Thead, Tbody, Tr, Td, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import { collection, doc, getDoc, getDocs, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { firestore } from '@/lib/controller'
import { ViewCandidateValues, initViewCandidate } from '@/types/document'
import 'animate.css'

export default function Page(){
    const [loading, setLoading] = useState<boolean>(true)
    const [company_staff, setCompanyStaff] = useState<ViewCandidateValues>(initViewCandidate); // State to store candidate details

    const db = firestore
    
    useEffect(() => {
        const fetchData = async () => {
            const customToken = localStorage.getItem('customToken');

            try {
                const usersCollectionRef = collection(firestore, 'company_users');
                const userQuery = query(usersCollectionRef, where('full_name', '==', customToken));

                const userSnapshot = await getDocs(userQuery);
        
                const userData = userSnapshot.docs[0].data() as ViewCandidateValues;
                setCompanyStaff(userData);
                

            } catch (error) {
                console.error('Error getting employee record:', error);
            } finally {
                setLoading(false);
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
            <main className='grid grid-rows-2 gap-28'>
                <Box className='w-full flex flex-col justify-center row-span-full relative'>
                    <Box className='w-full flex justify-center rounded p-3' bgGradient='linear(to-b, #1A2B56, #0D70AB)'>
                        <Image src={'/label_pentagon_banner.png'} width={600} height={200} alt='pentagon' />
                    </Box>
                    <Box className='flex items-center space-x-6 w-full absolute top-32 ps-8'>
                        <Circle className='drop-shadow-xl outline-4 outline outline-offset-4 outline-white bg-slate-500'>
                            <Avatar src={`${company_staff.pfp}`} size='2xl' name={`${company_staff.full_name}`} />
                        </Circle>
                        <Box className=''>
                            <Heading as='h6' size='lg'>{company_staff.full_name}</Heading>
                            <Text fontSize='xs' color='#a1a1a1'>Employee ID: {`09090909`}</Text>
                        </Box>
                    </Box>
                </Box>
                <section className='flex space-x-5 p-4'>
                    {loading && <p>Loading...</p>}
                    {!loading && company_staff && 
                    (<section className='p-5 w-auto h-fit flex flex-col space-y-5 rounded border border-gray-300' style={{minWidth: '250px'}}>
                        <Box className='flex flex-col justify-end space-y-5'>
                            <Box className='flex flex-col justify-between space-y-5'>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >User Code:</Text>
                                    <Text fontSize='sm'>{company_staff.user_code}</Text>
                                </Box>

                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Contact:</Text>
                                    <Text fontSize='sm'>{company_staff.phone}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Email:</Text>
                                    <Text fontSize='sm'>{company_staff.email}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Gender:</Text>
                                    <Text fontSize='sm'>{company_staff.gender}</Text>
                                </Box>
                                
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Date of Birth:</Text>
                                    <Text fontSize='sm'>{new Date(company_staff.birthDate).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Age:</Text>
                                    <Text fontSize='sm'>{company_staff.age} yrs. old</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Place of Birth:</Text>
                                    <Text fontSize='sm'>{company_staff.birthPlace}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Marital Status:</Text>
                                    <Text fontSize='sm'>{company_staff.status}</Text>
                                </Box>

                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Residential Address:</Text>
                                    <p className='text-wrap'>{company_staff.address}</p>
                                </Box>
                                {company_staff.province && (
                                    <Box className='w-full justify-center flex flex-col'>
                                        <Text fontSize='xs' color='#a1a1a1'>Provincial Address:</Text>
                                        <Text fontSize='sm'>{company_staff.province}</Text>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </section>)}
                    {!loading && company_staff && 
                    (<section className='p-5 w-full flex flex-col space-y-8 border rounded border-gray-300'>
                        <Box className='flex justify-between flex-col space-y-5 '>
                            <Box className='flex space-x-2  items-start w-full'>
                                <Image src="/icons/work.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Position Details`}</Heading>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th><span className='text-xs font-medium'>Employee Type</span></Th>
                                            <Th><span className='text-xs font-medium'>Employee Category</span></Th>
                                            <Th><span className='text-xs font-medium'>Position</span></Th>
                                            <Th><span className='text-xs font-medium'>Department</span></Th>
                                            <Th><span className='text-xs font-medium'>Rank</span></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                    {Object.entries(company_staff.roles).map(([key, role]) => (
                                        <Tr key={key}>
                                            <Td>{role.emp_type}</Td>
                                            <Td>{role.emp_cat}</Td>
                                            <Td>{role.job_position}</Td>
                                            <Td>{role.department}</Td>
                                            <Td>{role.rank}</Td>
                                        </Tr>
                                    ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>
                        
                        <Box className='flex flex-col space-y-3'>
                            <Box className='flex space-x-2  items-start w-full'>
                                <Image src="/icons/Govt.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Government Issued ID's`}</Heading>
                            </Box>
                            <Box className='flex justify-between space-x-5'>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >SSS:</Text>
                                    <Text fontSize='sm'>{company_staff.sss}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >HDMF:</Text>
                                    <Text fontSize='sm'>{company_staff.hdmf}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Tin:</Text>
                                    <Text fontSize='sm'>{company_staff.tin}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >PhilHealth:</Text>
                                    <Text fontSize='sm'>{company_staff.philhealth}</Text>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Box className='flex flex-col space-y-3'>
                            <Box className='flex space-x-2  items-start w-full'>
                                <Image src="/icons/emergency.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Emergency Contact`}</Heading>
                            </Box>
                            <Box className='flex justify-between space-x-5'>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Contact Person:</Text>
                                    <Text fontSize='sm'>{company_staff.contact_person}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Contact No.:</Text>
                                    <Text fontSize='sm'>{company_staff.emergency_contact}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Relationship:</Text>
                                    <Text fontSize='sm'>{company_staff.relationship}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Address:</Text>
                                    <Text fontSize='sm'>{company_staff.contact_address}</Text>
                                </Box>
                            </Box>
                        </Box>

                        <Box className='flex justify-between flex-col space-y-5 '>
                            <Box className='flex space-x-2  items-start w-full'>
                                <Image src="/icons/educational.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Educational Attainent`}</Heading>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th><span className='text-xs font-medium'>Educational Attainment</span></Th>
                                            <Th><span className='text-xs font-medium'>School/University</span></Th>
                                            <Th><span className='text-xs font-medium'>Degree</span></Th>
                                            <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                    {Object.entries(company_staff.educational_attainment).map(([key, attain]) => (
                                        <Tr key={key}>
                                            <Td>{attain.attainment}</Td>
                                            <Td>{attain.school}</Td>
                                            <Td>{attain.degree}</Td>
                                            <Td> {`${new Date(attain.inc_dates.from).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})} to ${new Date(attain.inc_dates.to).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`} </Td>
                                        </Tr>
                                    ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Box className='flex justify-between flex-col space-y-5 '>
                            <Box className='flex space-x-2  items-start w-full'>
                                <Image src="/icons/work.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Work Experience`}</Heading>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th><span className='text-xs font-medium'>Company</span></Th>
                                            <Th><span className='text-xs font-medium'>Address</span></Th>
                                            <Th><span className='text-xs font-medium'>Position</span></Th>
                                            <Th><span className='text-xs font-medium'>Status</span></Th>
                                            <Th><span className='text-xs font-medium'>Reason for Leave</span></Th>
                                            <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                    {Object.entries(company_staff.work_exp).map(([key, exp]) => (
                                        <Tr key={key}>
                                            <Td>{exp.company}</Td>
                                            <Td>{exp.company_address}</Td>
                                            <Td>{exp.position}</Td>
                                            <Td>{exp.stats}</Td>
                                            <Td>{exp.reason_leave}</Td>
                                            <Td> {`${new Date(exp.inc_dates.from).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})} to ${new Date(exp.inc_dates.to).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`} </Td>
                                        </Tr>
                                    ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Box className='flex justify-between flex-col space-y-5 '>
                            <Box className='flex space-x-2  items-start w-full'>
                                <Image src="/icons/history.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Training History`}</Heading>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th><span className='text-xs font-medium'>Title</span></Th>
                                            <Th><span className='text-xs font-medium'>Provider</span></Th>
                                            <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                    {Object.entries(company_staff.training_history).map(([key, history]) => (
                                        <Tr key={key}>
                                            <Td>{history.training_title}</Td>
                                            <Td>{history.training_provider}</Td>
                                            <Td> {`${new Date(history.inc_dates.from).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})} to ${new Date(history.inc_dates.to).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}`} </Td>
                                        </Tr>
                                    ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Box className='flex justify-between flex-col space-y-5 '>
                            <Box className='flex space-x-2  items-start w-full'>
                                <Image src="/icons/history.png" alt="School Logo" width={24} height={24} />
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Immediate Dependent's`}</Heading>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th><span className='text-xs font-medium'>Immediate Dependent</span></Th>
                                            <Th><span className='text-xs font-medium'>Relationship</span></Th>
                                            <Th><span className='text-xs font-medium'>Gender</span></Th>
                                            <Th><span className='text-xs font-medium'>Date of Birth</span></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                    {Object.entries(company_staff.dependents).map(([key, dependent]) => (
                                        <Tr key={key}>
                                            <Td>{dependent.name}</Td>
                                            <Td>{dependent.dependent_relationship}</Td>
                                            <Td>{dependent.dependent_gender}</Td>
                                            <Td>{new Date(dependent.dependent_birth_date).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</Td> {/* Convert to string */}
                                        </Tr>
                                    ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </section>)}
                </section>
            </main>
        </>
    )
}