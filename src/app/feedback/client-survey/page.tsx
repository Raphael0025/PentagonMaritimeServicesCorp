'use client'

import { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2'
import { Collapse, FormControl, Image, useDisclosure, Link, FormErrorMessage, Tooltip, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, NumberInput, NumberInputField, Input, Box, Button, Heading, Text, Container, Radio, RadioGroup, Stack, HStack, VStack, PinInput, PinInputField } from '@chakra-ui/react'
import { submitClientSurvey } from '@/lib/controller'; // Adjust the import based on your file structure
import PinIcon from '@/Components/Icons/PinIcon'
import MailIcon from '@/Components/Icons/MailIcon'
import PhoneIcon from '@/Components/Icons/PhoneIcon'
import FacebookIcon from '@/Components/Icons/FacebookIcon'
import { CheckIcon } from '@/Components/SideIcons'


export default function Feedback() {
    

    return(
    <>
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent={'center'} minHeight='100vh'>
        <Image position='absolute' left={{base: '-80%', md: '-50%'}} transform={{base: "translateX(30%)", md: "translateX(50%)"}} zIndex={1} src={'/pentagon_logo.png'} width={{base: '100%', md: '50%'}} h='100%' opacity={'30%'} />
        <Box w={{ base: '95%', md: '450px' }} h='450px' position='relative' zIndex={2} bgColor='#D4D4D4 ' shadow='md' display='flex' flexDirection='column' alignItems='center' border='1px solid gray'  borderRadius='md' textAlign='center'>
            {/** Header */}
            <Box bgColor='blue.900' placeItems='center' w='100%' borderBottom='3px solid #D2AC47' pt='3' pb='4' borderTopLeftRadius={'5'} borderTopRightRadius={'5'} >
                <Image src='/landscape_logo_white_text.png' width='50%' height='100%' alt='company logo' />
            </Box>
            <Box w='90%' h='100%' display='flex' alignItems='center' flexDir='column' justifyContent='center'>
                <Text fontSize='2xl' fontWeight='bold' >{`POST-TRAINING SATISFACTION SURVEY`}</Text>
                <Text mt='3' fontSize='md' fontWeight='normal'>{`Your feedback helps us improve future sessions. Click below to start.`}</Text>
                <Text 
                    w='100%'
                    as='a'
                    href='https://forms.gle/RHu5uPzbsZjQ2csdA' 
                    mt='5' 
                    bgColor='blue.700' 
                    px='6'
                    py='3' 
                    fontSize='2xl' 
                    color='white' 
                    borderRadius='5px' 
                    textAlign='center'
                    shadow='md'
                    _hover={{ bgColor: 'blue.800', textDecoration: 'none' }}
                >
                    Start Survey
                </Text>
            </Box> 
        </Box> 
    </Box> 
    </>
    )
}