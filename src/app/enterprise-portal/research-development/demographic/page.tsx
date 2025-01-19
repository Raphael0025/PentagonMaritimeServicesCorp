'use client'

import React, {useState, useEffect} from 'react'
import { Box, Text, Tooltip, Input, InputLeftAddon, InputGroup, useDisclosure, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, AlertDialog, AlertDialogCloseButton, AlertDialogBody, AlertDialogHeader, AlertDialogOverlay, AlertDialogFooter, AlertDialogContent, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@chakra-ui/react'
import { ToastStatus, } from '@/types/handling'

import {addRank, addTypeCatalog} from '@/lib/type-controller'
import {useCategory} from '@/context/CategoryContext'
import {useRank} from '@/context/RankContext'

export default function Page(){
    const toast = useToast()
    const { data: allCategories } = useCategory()
    const { data: allRanks } = useRank()

    const { isOpen: isRankOpen, onOpen: onRankOpen, onClose: onRankClose } = useDisclosure()
    const { isOpen: isNatOpen, onOpen: onNatOpen, onClose: onNatClose } = useDisclosure()

    const [loading, setLoading] = useState<boolean>(false)
    const [rank, setRank] = useState('')
    const [rankCode, setRankCode] = useState('')
    const [nationality, setNationality] = useState('')

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

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        if(id === 'rank'){
            setRank(value)
        } else if(id === 'rankCode'){
            setRankCode(value)
        } else if (id === 'nationality'){
            setNationality(value)
        }
    }

    const handleSaveRank = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')
            await addRank(rankCode, rank, actor)
                
        }catch(error){
            throw error
        }finally{
            setLoading(false)
            handleToast('Save Successful', 'New Rank Catalog Added...', 3000, 'success')
            setRank('')
            setRankCode('')
            onRankClose()
        }
    }

    const handleSaveNationality = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')

            await addTypeCatalog('Nationality', nationality, 'demographic', actor)
        }catch(error){
            throw error
        }finally{
            setLoading(false)
            handleToast('Save Successful', 'New Nationality Catalog Added...', 3000, 'success')
            setNationality('')
            onNatClose()
        }
    }

    return(
    <>
        <main className='w-full space-y-3'>
            <Box>
                <Text className='text-lg text-sky-700'>Demographic Data</Text>
            </Box>
            <Box className='flex space-x-4 w-1/2'>
                <Box className='w-1/2 shadow-md space-y-3 p-3 rounded outline outline-1 outline-gray-300'>
                    <Box className='flex justify-between'>
                        <Text className='text-gray-400'>{`Seafarer's Ranks`}</Text>
                        <Button onClick={onRankOpen} colorScheme='blue' size='sm'>Add Rank</Button>
                    </Box>
                    <Box className=''>
                        <Box className='border-b py-2 px-2 border-gray-400 flex justify-between'>
                            <Text className='text-gray-600'>Code</Text>
                            <Text className='text-gray-600'>Rank</Text>
                            <Text className='text-gray-600'>Action</Text>
                        </Box>
                        {allRanks && allRanks.map((rankData, index) => (
                            <Box className='flex justify-between p-2' key={index}>
                                <Text className='uppercase'>{rankData.code}</Text>
                                <Text className='uppercase'>{rankData.rank}</Text>
                                <Text>{``}</Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box className='w-1/2 shadow-md p-3 space-y-3 rounded outline outline-1 outline-gray-300'>
                    <Box className='flex justify-between'>
                        <Text className='text-gray-400'>Nationalities</Text>
                        <Button onClick={onNatOpen} colorScheme='blue' size='sm'>Add Nationality</Button>
                    </Box>
                    <Box className=''>
                        <Box className='border-b py-2 px-2 border-gray-400 flex justify-between'>
                            <Text className='text-gray-600'>Nationaltiy</Text>
                            <Text className='text-gray-600'>Action</Text>
                        </Box>
                        {allCategories && allCategories.filter(category => category.category === 'demographic' && category.selectedType === 'Nationality')
                        .map((natData) => (
                            <Box className='flex justify-between p-2' key={natData.id}>
                                <Text className='uppercase'>{natData.type}</Text>
                                <Text>{``}</Text> {/* Replace with an appropriate action or data */}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </main>
        <Modal isOpen={isRankOpen} closeOnOverlayClick={false} size='xl' onClose={onRankClose} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-sky-700'>{`Add Seafarer's Rank`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className='space-y-3'>
                        <InputGroup>
                            <InputLeftAddon>Rank Code</InputLeftAddon>
                            <Input id='rankCode' onChange={onChange} value={rankCode.toUpperCase()} />
                        </InputGroup>
                        <InputGroup>
                            <InputLeftAddon>{`Seafarer's Rank`}</InputLeftAddon>
                            <Input id='rank' onChange={onChange} value={rank.toUpperCase()} />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onRankClose}>Cancel</Button>
                    <Button onClick={handleSaveRank} ml={3} colorScheme='blue' isLoading={loading} loadingText='Saving...'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Modal isOpen={isNatOpen} closeOnOverlayClick={false} size='xl' onClose={onNatClose} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-sky-700'>{`Add Nationality`}</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box className='space-y-3'>
                        <InputGroup>
                            <InputLeftAddon>Nationality</InputLeftAddon>
                            <Input id='nationality' onChange={onChange} value={nationality.toUpperCase()} />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={onNatClose}>Cancel</Button>
                    <Button onClick={handleSaveNationality} ml={3} colorScheme='blue' isLoading={loading} loadingText='Saving...'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}