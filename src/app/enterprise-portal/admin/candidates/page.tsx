'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react';
import { Box, Button, Circle, Heading, Text, useDisclosure, Table, Thead, Tbody, Tr, Th, Td, TableContainer, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, } from '@chakra-ui/react'
import { CloseIcon, ViewIcon, UserSearchIcon, UserHired, InHouseUserIcon, PlusIcon } from '@/Components/Icons'
import { deleteCandidate, hireCandidate } from '@/lib/company_user_controller'
import { GetCompanyUserSpecificData } from '@/types/company_users'
import { countCompanyUsersByCategoryStatusAndType, getUserPerStatusOf } from '@/handlers/company_user_handler'
import { useCompanyUsers } from '@/context/CompanyUserContext'
import { formatDate } from '@/types/handling'

export default function Page(){
    const {data: allCompanyUsers} = useCompanyUsers()
    const [onlineCandidates, setOnlineCandidates] = useState<number>(0)
    const [onSiteCandidates, setOnSiteCandidates] = useState<number>(0)
    const [candidates, setCandidates] = useState<GetCompanyUserSpecificData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [idRef, setIdRef] = useState<string>('')
    const [candidateName, setCandidateName] = useState<string>('')
    const toast = useToast()

    const { isOpen: deleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure()
    const { isOpen: hireDialogOpen, onOpen: openHireDialog, onClose: closeHireDialog } = useDisclosure()

    const cancelRef = useRef<HTMLButtonElement>(null)
    const hireRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const {total_online, total_walk_in } = await countCompanyUsersByCategoryStatusAndType(allCompanyUsers)
                const company_staff_data = await getUserPerStatusOf('In Probation', allCompanyUsers)
                setOnlineCandidates(total_online)
                setOnSiteCandidates(total_walk_in)
                setCandidates(company_staff_data)
            } catch (error) {
                throw error
            }finally{
                setLoading(false);
            }
        }
        // Fetch initial data
        fetchData();
    }, [allCompanyUsers]);
    
    const handleDelete = async () => {
        const actor: string | null = localStorage.getItem('customToken')
        await deleteCandidate(idRef, actor, candidateName)
    }

    const handleHire = async () => {
        const actor: string | null = localStorage.getItem('customToken')
        await hireCandidate(idRef, actor, candidateName)
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
                                                candidates.map((candidate: GetCompanyUserSpecificData) => (
                                                    <Tr key={candidate.id}>
                                                        <Td>{formatDate(candidate.candidate_added.toDate())}</Td>
                                                        <Td>{candidate.user_code}</Td>
                                                        <Td>{candidate.full_name}</Td>
                                                        <Td>{candidate.application_type}</Td>
                                                        <Td>{candidate.emp_status}</Td>
                                                        <Td>
                                                            <Box className='flex space-x-2 items-center'>
                                                                <Link href={`/enterprise-portal/admin/candidates/${candidate.id}`} >
                                                                    <ViewIcon color={'#0D70AB'} size={'24'} />
                                                                </Link>
                                                                <button ref={hireRef} onClick={() => {openHireDialog(); setCandidateName(candidate.full_name); setIdRef(candidate.id)}}>
                                                                    <UserHired />
                                                                </button>
                                                                <button ref={cancelRef} onClick={() => {openDeleteDialog(); setCandidateName(candidate.full_name); setIdRef(candidate.id)}}>
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