'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react';
import { Box, Input, FormControl, FormLabel, Button, Text, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import { CloseIcon, ViewIcon, UserSearchIcon, UserHired, InHouseUserIcon, PlusIcon } from '@/Components/Icons'
//types
import { ToastStatus } from '@/types/handling'
import { ClientCompany, ClientCompanyByID, initClientCompany } from '@/types/client_company';
import { useClients } from '@/context/ClientCompanyContext'
import { addClient } from '@/lib/client-controller'

export default function Page(){
    const toast = useToast()
    const {data: allClients} = useClients()

    const { isOpen: openModal, onOpen: modalOpen, onClose: closeModal } = useDisclosure()
    
    const [loading, setLoading] = useState<boolean>(false)
    const [clientInfo, setClientInfo] = useState<ClientCompany>(initClientCompany)

    const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
        toast({
            title: title,
            description: desc,
            position: 'top-right',
            variant: 'left-accent',
            status: status,
            duration: timer,
            isClosable: true,
        })
    }

    const handleCloseModal = () => {
        setClientInfo(initClientCompany)
        closeModal()
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setClientInfo(prev => ({
            ...prev,
            [id]: value
        }))
    }

    const handleSaveData = async () => {
        setLoading(true)
        const getActor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    await addClient(clientInfo, getActor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 2000)
        }).then(() => {
            handleToast('Client Added Successfully!', `${clientInfo.company} has been successfully added to the database.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            handleCloseModal()
        })
    }

    return(
    <>
        <main className='flex space-x-6 px-6'>
            <section>
                <Button colorScheme='blue' onClick={modalOpen}>Add Client</Button>
            </section>
            <section>

            </section>
        </main>
        <Modal isOpen={openModal} onClose={handleCloseModal} size='xl' motionPreset='slideInTop' >
            <ModalOverlay/>
            <ModalContent px='10px'>
                <ModalHeader ><span className='font-semibold text-gray-600'>New Client Company</span></ModalHeader>
                <ModalBody>
                    <Box px='10px'>
                        <Box className='space-y-4 pb-3' >
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Company Name:</FormLabel>
                                <Input id='company' onChange={handleOnChange} type='text' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Company Address:</FormLabel>
                                <Input id='address' onChange={handleOnChange} type='text' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Contact Person:</FormLabel>
                                <Input id='contact_person' onChange={handleOnChange} type='text' variant='flushed' />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize='14' color='#a1a1a1'>Contact Number:</FormLabel>
                                <Input id='contact_number' onChange={handleOnChange} type='tel' variant='flushed' />
                            </FormControl>
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='2px' >
                    <Button onClick={handleCloseModal} boxShadow='md' colorScheme='gray' mr='4'>Cancel</Button>
                    <Button onClick={handleSaveData} isLoading={loading} loadingText='Creating...' boxShadow='md' colorScheme='blue'>Create</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}