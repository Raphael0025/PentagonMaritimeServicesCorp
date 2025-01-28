'use client'

import React, {useState} from 'react'
import { Box, Text, Input, InputLeftAddon, InputGroup, useDisclosure, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react'
import { addType } from '@/lib/type-controller'
import { useTypes } from '@/context/TypeContext'
import { ToastStatus, } from '@/types/handling'

export default function Page(){
    const toast = useToast()
    const {data: allTypes} = useTypes()

    const [loading, setLoading] = useState<boolean>(false)
    const [typeName, setType] = useState('')
    
    const { isOpen: isAddTypeModal, onOpen: openTypeModal, onClose: closeTypeModal } = useDisclosure()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setType(value)
    }

    const handleSave = async () => {
        try{
            setLoading(true)
            const actor: string | null = localStorage.getItem('customToken')
            await addType(typeName, actor)
            
        } catch(error){
            console.log(error)
        } finally {
            setLoading(false)
            handleToast('Save Successful', 'New Type Catalog Added...', 3000, 'success')
            closeTypeModal()
            setType('')
        }
    }

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

    return(
        <>
        <main className='w-full p-3'>
            <Box className='p-3 w-1/4 space-y-2'>
                <Box className='flex justify-between items-center'>
                    <Text className='text-lg text-gray-400'>Type Catalog</Text>
                    <Button onClick={openTypeModal} size='sm' colorScheme='blue'>Add Type</Button>
                </Box>
                <Box className='outline outline-1 outline-gray-300 rounded p-3'>
                {allTypes && allTypes.map((type, id) => (
                    <Box key={id}>
                        <Text>{type.type}</Text>
                    </Box>
                ))}
                </Box>
            </Box>
        </main>
        <Modal onClose={closeTypeModal} closeOnOverlayClick={false} size='xl' isOpen={isAddTypeModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text className='text-sky-700'>New Type</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box>
                        <InputGroup>
                            <InputLeftAddon>Type Name:</InputLeftAddon>
                            <Input value={typeName} onChange={handleChange} type='text' />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter className='flex justify-between' borderTopWidth='1px' mx='3'>
                    <Button onClick={closeTypeModal} size='sm' variant='outline'>Cancel</Button>
                    <Button onClick={handleSave} loadingText='Saving...' isLoading={loading} size='sm' ml='3' colorScheme='blue'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}