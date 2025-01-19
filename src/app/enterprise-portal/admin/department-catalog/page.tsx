'use client'

import React, {useState, useEffect} from 'react'
import { Box, Text, Heading, useToast, Button, useDisclosure, Modal, ModalHeader, ModalBody, ModalContent, ModalCloseButton, ModalOverlay} from '@chakra-ui/react'
import 'animate.css'
import { PlusIcon } from '@/Components/SideIcons'
import NewDeptCatalog from '@/Components/NewDeptCatalog'
import EditDeptCatalog from '@/Components/EditDeptCatalog'
import { useCatalogs } from '@/context/CatalogContext'
import { DEPARTMENT_ID } from '@/types/utils'

export default function Page(){
    const {department_catalog: allDepartmentCatalogs} = useCatalogs()
    const [catalogID, setCatalogID] = useState<string>('')

    const {isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
    const {isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()

    return(
    <>
        <main className='px-6 space-y-4'>
            <section className='flex-col space-y-2 '>
                <Heading size='md' className='text-xl text-sky-700'>Department Catalog</Heading>
                <Box className='flex justify-end'>
                    <Button onClick={() => onOpenModal()} colorScheme='blue' borderRadius='5px' size='sm' py={'20px'} leftIcon={<PlusIcon color='#fff' size='24' />} >Create Catalog</Button>
                </Box>
            </section>
            <section className='space-y-3'>
                <Box borderRadius='5px' className='flex items-center p-3 outline-0 shadow-md bg-sky-600'>
                    <Text w='100%' as='b' color='#fff'>Code</Text>
                    <Text w='100%' as='b' color='#fff'>Department</Text>
                    <Text className='text-end' w='100%' as='b' color='#fff'>Date & Time Created</Text>
                    <Text className='text-center' w='100%' as='b' color='#fff'>Action</Text>
                </Box>
                {allDepartmentCatalogs && allDepartmentCatalogs.map((val: DEPARTMENT_ID, index: number) => (
                    <Box key={index} borderRadius='5px' className='flex p-3 items-center border border-gray-300 outline-0 shadow-md '>
                        <Text w='100%' className='text-gray-500'>{val.code}</Text>
                        <Text w='100%' className='text-gray-500'>{val.name}</Text>
                        <Text w='100%' className='text-end text-gray-500'>{`${val.createdAt.toDate().toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})} at ${val.createdAt.toDate().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}`}</Text>
                        <Box w='100%' className='text-center text-gray-500'>
                            <Button onClick={() => {onOpenEdit(); setCatalogID(val.id); }} mr={3} colorScheme='blue' size='sm' >Edit</Button>
                            {/* <Button colorScheme='red' size='sm' >Delete</Button> */}
                        </Box>
                    </Box>
                ))}
            </section>
        </main>
        {/** New Catalog Dept */}
        <Modal onClose={onCloseModal} isOpen={isOpenModal} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading size='md' as='h1' className='text-sky-700'>New Catalog</Heading>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <NewDeptCatalog onCloseModal={onCloseModal} />
                </ModalBody>
            </ModalContent>
        </Modal>
        {/** Edit Catalog Dept */}
        <Modal onClose={onCloseEdit} isOpen={isOpenEdit} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading size='md' as='h1' className='text-sky-700'>Edit Catalog</Heading>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <EditDeptCatalog onClose={onCloseEdit} id={catalogID} />
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
    )
}