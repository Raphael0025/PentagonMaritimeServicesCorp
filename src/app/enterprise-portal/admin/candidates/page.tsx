'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
import { Box, Button, Center, Circle, Heading, Text, useDisclosure, Table, Thead, Tbody, Tr, Th, Td, TableContainer, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, } from '@chakra-ui/react'
import 'animate.css'
import InHouseUserIcon from '@/Components/Icons/InHouseUserIcon'
import PlusIcon from '@/Components/Icons/PlusIcon'
import UserHired from '@/Components/Icons/UserHired'
import UserSearchIcon from '@/Components/Icons/UserSearchIcon'
import ViewIcon from '@/Components/Icons/ViewIcon'
import CloseIcon from '@/Components/Icons/CloseIcon'
import { getTotalCandidates, getAllCandidateData, firestore, deleteCandidate, hireCandidate, getCandidate } from '@/lib/controller'
import { CandidateValues } from '@/types/document'
import { collection, onSnapshot } from 'firebase/firestore'

export default function Page(){

    const [onlineCandidates, setOnlineCandidates] = useState<number>(0)
    const [onSiteCandidates, setOnSiteCandidates] = useState<number>(0)
    const [candidates, setCandidates] = useState<CandidateValues[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [idRef, setIdRef] = useState<string>('')
    const toast = useToast()

    const { isOpen: deleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure()
    const { isOpen: hireDialogOpen, onOpen: openHireDialog, onClose: closeHireDialog } = useDisclosure()

    const cancelRef = useRef<HTMLButtonElement>(null)
    const hireRef = useRef<HTMLButtonElement>(null)

    const db = firestore

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch total number of online candidates
                const onlineCount = await getTotalCandidates('Online');
                setOnlineCandidates(onlineCount);

                // Fetch total number of on-site candidates
                const onSiteCount = await getTotalCandidates('Walk-in');
                setOnSiteCandidates(onSiteCount);

                const data = await getAllCandidateData('In Probation')
                setCandidates(data)

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
    
    const handleDelete = async () => {
        await deleteCandidate(idRef)
    }

    const handleHire = async () => {
        await hireCandidate(idRef)
    }

    return(
        <>
            <main className='flex flex-col p-6 space-y-5 py-0 h-full'>
                <Heading as='h4' size='md' color='#a1a1a1'>Candidate Management</Heading>
                <section className='w-full space-y-4'>
                    <section className='flex space-x-6'>
                        <Box className='w-full flex space-x-8'>
                            <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 px-5 p-3 w-1/4 rounded border-t border-gray-200 items-center '>
                                <Box>
                                    <Heading as='h4' size='lg'>{loading ? 'Loading...' : onlineCandidates}</Heading>
                                    <Text color='#a1a1a1'>Online Candidates</Text>
                                </Box>
                                <Circle size='50px' bg='#2F67B250'>
                                    <UserSearchIcon />
                                </Circle>
                            </Box>
                            <Box bgGradient='linear(to-br, #fff, #fff, #0D70AB60)' className='flex shadow-md shadow-gray-500/50 justify-between space-x-8 px-5 p-3 w-1/4 rounded border-t border-gray-200 items-center '>
                                <Box>
                                    <Heading as='h4' size='lg'>{loading ? 'Loading...' : onSiteCandidates}</Heading>
                                    <Text color='#a1a1a1'>Walk-in Candidates</Text>
                                </Box>
                                <Circle size='50px' bg='#2F67B250'>
                                    <InHouseUserIcon />
                                </Circle>
                            </Box>
                        </Box>
                    </section>
                    <section className='w-full py-3 space-y-3'>
                        <Box className='flex justify-between items-center'>
                            <Box>Insert search bar here</Box>
                            <Box>
                                <Link href='/enterprise-portal/admin/candidates/new-candidate' style={{padding: '10px 15px'}} className='flex space-x-2 items-center btn-primary rounded'>
                                    <PlusIcon />
                                    <span>Add Candidate</span>
                                </Link>
                            </Box>
                        </Box>
                        <Box>
                            <TableContainer>
                                <Table variant='simple'>
                                    <Thead>
                                        <Tr>
                                            <Th>Date Added</Th>
                                            <Th>User Code</Th>
                                            <Th>Candidate</Th>
                                            <Th>Application Type</Th>
                                            <Th>Status</Th>
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
                                            {candidates.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={8} textAlign="center">No candidates available</Td>
                                                </Tr>
                                            ) : (
                                                candidates.map((candidate: CandidateValues) => (
                                                    <Tr key={candidate.id}>
                                                        <Td>{candidate.candidate_added}</Td>
                                                        <Td>{candidate.user_code}</Td>
                                                        <Td>{candidate.full_name}</Td>
                                                        <Td>{candidate.application_type}</Td>
                                                        <Td>{candidate.emp_status}</Td>
                                                        <Td>
                                                            <Box className='flex space-x-2 items-center'>
                                                                <Link href={`/enterprise-portal/admin/candidates/${candidate.id}`} >
                                                                    <ViewIcon />
                                                                </Link>
                                                                <button ref={hireRef} onClick={() => {openHireDialog(); setIdRef(candidate.id)}}>
                                                                    <UserHired />
                                                                </button>
                                                                <button ref={cancelRef} onClick={() => {openDeleteDialog(); setIdRef(candidate.id)}}>
                                                                    <CloseIcon />
                                                                </button>
                                                            </Box>
                                                        </Td>
                                                    </Tr>
                                                )))}
                                            </>
                                        )}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                            <AlertDialog isOpen={deleteDialogOpen} leastDestructiveRef={cancelRef} onClose={closeDeleteDialog}>
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                        Delete Candidate
                                        </AlertDialogHeader>
                                        <AlertDialogBody>
                                        {`Are you sure you want to delete candidate? You can't undo this action afterwards.`}
                                        </AlertDialogBody>
                                        <AlertDialogFooter>
                                            <Button ref={cancelRef} onClick={closeDeleteDialog}>
                                                Cancel
                                            </Button>
                                            <Button colorScheme='red' onClick={() => {closeDeleteDialog(); handleDelete(); toast({
                                                title: 'Candidate Deleted!',
                                                description: "You've successfully deleted a candidate.",
                                                position: 'top-right',
                                                isClosable: true,
                                                variant: 'left-accent',
                                                status: 'success',
                                                duration: 5000,
                                            })}} ml={3}>
                                                Delete
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>
                            <AlertDialog isOpen={hireDialogOpen} leastDestructiveRef={hireRef} onClose={closeHireDialog}>
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                        Hire Candidate
                                        </AlertDialogHeader>

                                        <AlertDialogBody>
                                        {`Is the Candidate ready to be hired? You can't undo this action afterwards.`}
                                        </AlertDialogBody>
                                        <AlertDialogFooter>
                                            <Button ref={hireRef} onClick={closeHireDialog}>
                                                Cancel
                                            </Button>
                                            <Button colorScheme='blue' onClick={() => {closeHireDialog(); handleHire(); toast({
                                                title: 'Candidate Hired!',
                                                description: "You've successfully hired a candidate.",
                                                position: 'top-right',
                                                isClosable: true,
                                                variant: 'left-accent',
                                                status: 'success',
                                                duration: 5000,
                                            })}} ml={3}>
                                                Hire
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>
                        </Box>
                    </section>
                </section>
            </main>
        </>
    )
}