'use client'

import React, { useState } from 'react'
import { Box, Text, Input, Textarea, Button, Select,  Grid, GridItem, InputLeftAddon, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';


interface ComponentProps {
    setSelectedAssessment: (value: string) => void
}

export default function AssessmentSelector({setSelectedAssessment}: ComponentProps) {
    // const [selectAssessment, setSelection] = useState<string>()


    return(
    <>
        <Box w='md' display='flex' justifyContent='start' flexDir='column' alignItems='center'>
            <Text mb='3' fontSize='lg' fontWeight='bold' textTransform='uppercase' color='blue.700'>Practical Assessment Plan</Text>
            <Box display='flex' justifyContent='start' flexDir='column' alignItems='center'>
                <Text mb='3' fontSize='xl'>Choose an Assessment</Text>
                <Text>Please select an assessment from the list below to begin.</Text>
            </Box>
            <Box p='5' w='100%'>
                <Text onClick={() => setSelectedAssessment('a1')} _hover={{bgColor: 'blue.300'}} borderRadius='5px' shadow='md' w='100%' p='5' mb='3'>Assessment No. 1 (A5.1, A5.3, A5.4)</Text>
                <Text onClick={() => setSelectedAssessment('a2')} _hover={{bgColor: 'blue.300'}} borderRadius='5px' shadow='md' w='100%' p='5' mb='3'>Assessment No. 2 (A5.2)</Text>
                <Text onClick={() => setSelectedAssessment('a3')} _hover={{bgColor: 'blue.300'}} borderRadius='5px' shadow='md' w='100%' p='5' mb='3'>Assessment No. 3 (A5.5, A5.6, A5.7)</Text>
            </Box>
        </Box>
    </>
    )
}