'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
import { Box, Button, Center, Circle, Heading, Text,  Wrap, WrapItem, useDisclosure, Avatar, AvatarBadge, IconButton, Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, } from '@chakra-ui/react'
import 'animate.css'
import { getTotalCandidates, getAllCandidateData, firestore, deleteCandidate, hireCandidate, getCandidate } from '@/lib/controller'
import { collection, doc, getDoc, getDocs, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { ViewCandidateValues, initViewCandidate } from '@/types/document'

interface PageProps {
    params: { id: string }; // Adjust the type according to your actual data structure
}

export default function Page({params}: PageProps){
    const router = useRouter()
    const [loading, setLoading] = useState<boolean>(true)
    const [company_staff, setCompanyStaff] = useState<ViewCandidateValues>(initViewCandidate); // State to store candidate details

    // Assuming candidate_added is of type Timestamp
    const { candidate_added } = company_staff;
    // Convert Firestore Timestamp to JavaScript Date object
    const addedDate = candidate_added.toDate();
    // Format the date as needed
    const formattedDate = addedDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    const db = firestore
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(firestore, 'company_users', params.id);
                const docSnap = await getDoc(docRef);
        
                if (docSnap.exists()) {
                    setCompanyStaff(docSnap.data() as ViewCandidateValues)
                } else {
                    console.log('No such record!');
                }

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
    }, [params.id]);

    return(
        <>
            <main className='flex flex-col p-6 space-y-5 py-0 h-full'>
                <Heading as='h4' size='md' color='#a1a1a1'>Employee Details</Heading>
                <section className='flex space-x-5'>
                    {loading && <p>Loading...</p>}
                    {!loading && company_staff && 
                    (<section className='p-5 w-auto flex flex-col space-y-5 rounded border border-gray-300' style={{maxWidth: '240px'}}>
                        <Box className='flex flex-col justify-end space-y-5'>
                            <Box className='w-full items-end flex flex-col'>
                                <p style={{fontSize: '9px', color: '#a1a1a1'}}>Candidate Added:</p>
                                <p style={{fontSize: '11px'}}>{formattedDate}</p>
                            </Box>
                            <Box className='drop-shadow-xl' style={{width: '200px', height: '200px'}}>
                                <Avatar className='drop-shadow-lg' size='full' name={company_staff.full_name} src={company_staff.pfp} />
                            </Box>
                            <Box>
                                <Box className='w-100 h-auto relative' style={{ minWidth: '50px', minHeight: '65px' }}>
                                    <div className="w-full h-full overflow-hidden">
                                        <Image src={company_staff.e_sig} layout="fill" objectFit="cover" alt='user-pfp' />
                                    </div>
                                </Box>
                                <Center className='border-t border-gray-400'>
                                    <Text >E-Signature</Text>
                                </Center>
                            </Box>
                            
                            <Box className='flex flex-col justify-between space-y-5'>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >User Code:</Text>
                                    <Text fontSize='sm'>{company_staff.user_code}</Text>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Employee ID:</Text>
                                    <Text fontSize='sm'>{company_staff.tin}</Text>
                                </Box>

                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >Name:</Text>
                                    <Text fontSize='sm'>{company_staff.full_name}</Text>
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