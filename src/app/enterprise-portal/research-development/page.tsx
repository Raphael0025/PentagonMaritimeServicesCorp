'use client'

import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import { Box, Text, Tooltip, Input, InputLeftAddon, InputGroup, useDisclosure, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, AlertDialog, AlertDialogCloseButton, AlertDialogBody, AlertDialogHeader, AlertDialogOverlay, AlertDialogFooter, AlertDialogContent, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@chakra-ui/react'
import { ToastStatus, } from '@/types/handling'

export default function Page(){
    return(
    <>
        <main className='w-full space-y-3'>
            <Box>
                <Text className='text-lg text-sky-700'>Navigation</Text>
            </Box>
            <Box className='flex space-x-3'>
                <Link href='/enterprise-portal/research-development/demographic' style={{width: '250px'}} className='text-center rounded shadow-md bg-sky-600 p-4 hover:bg-sky-400 scale-90 hover:scale-100 hover:shadow-lg transition duration-300 ease-in-out'>
                    <Text className='text-xl text-white'>Demographic</Text>
                </Link>
                <Link href='/enterprise-portal/research-development/geographic' style={{width: '250px'}} className='text-center rounded shadow-md bg-sky-600 p-4 hover:bg-sky-400 scale-90 hover:scale-100 hover:shadow-lg transition duration-300 ease-in-out'>
                    <Text className='text-xl text-white'>Geographic</Text>
                </Link>
                <Link href='/enterprise-portal/research-development/categorical' style={{width: '250px'}} className='text-center rounded shadow-md bg-sky-600 p-4 hover:bg-sky-400 scale-90 hover:scale-100 hover:shadow-lg transition duration-300 ease-in-out'>
                    <Text className='text-xl text-white'>Categorical</Text>
                </Link>
            </Box>
        </main>
    </>
    )
}