'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import { Box, Button, Image, Text, Input, FormControl, Textarea, FormLabel, useDisclosure, List, ListItem, Tooltip, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';
import { ElementView, MapComponent, BannerView, BannerComponent } from '@/Components/SiteComponents'

export default function ContactUs() {

    return (
        <main className='pb-10'>
            <BannerView 
                initial={{opacity: 0, x: 100}}
                animate={{opacity: 1, x: 0}}
                transition={{ duration: 0.3, delay: 1, ease: 'linear' }}
            >
                <BannerComponent title='Talk to Us' content='Feel Free to contact us and send your inquiries!' image='./Images/ContactUs.jpg' />
            </BannerView>
            {/** Main Form */}
            <Box px={{base: '0%', lg: '20%'}} bgColor='#fbffff'>
                <BannerView
                    initial={{opacity: 0, y: 100}}
                    animate={{opacity: 1, y: 0}}
                    transition={{ duration: 0.3, delay: 1, ease: 'linear' }}
                >
                    <Box display='flex' p='5' flexDir={{base: 'column', md: 'row', lg: 'row'}} >
                        <Box mr={4} w={{base: '100%', md: '50%', lg: '50%'}}>
                            <Text fontSize='3xl' fontWeight='800' color='#1c437e'>Pentagon Maritime Services Corp.</Text>
                            <Box mt='4'>
                                <Text fontSize='xl' color='gray.600' fontWeight='700' >Our Office</Text>
                                <Text fontSize='md' color='gray.500' >2/F 801, Building United Nations Ave. 1000 Ermita NCR, City of Manila, First District Philippines</Text>
                            </Box>
                            <Box mt='4'>
                                <Text fontSize='xl' color='gray.600' fontWeight='700' >Operating Hours</Text>
                                <Text fontSize='md' color='gray.500'>{`Mon-Fri 8:00AM - 5:00PM`}</Text>
                                <Text fontSize='md' color='gray.500'>{`Sat 8:00AM - 2:00PM`}</Text>
                            </Box>
                            <Box mt='4'>
                                <Text fontSize='xl' color='gray.600' fontWeight='700' >Contacts</Text>
                                <Box display='flex' flexDir='column' className='space-y-3'>
                                    <Box>
                                        <Text fontSize='md' color='gray.600'>{`Landline:`}</Text>
                                        <Text fontSize='md' color='gray.500'>{`(02) 8 281- 8155`}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize='md' color='gray.600'>{`Registration:`}</Text>
                                        <Text fontSize='md' color='gray.500'>{`0999-190-9273`}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize='md' color='gray.600'>{`Marketing:`}</Text>
                                        <Text fontSize='md' color='gray.500'>{`0999-513-5916`}</Text>
                                    </Box>
                                </Box>
                            </Box>
                            <Box my='4'>
                                <Text fontSize='xl' color='gray.600' fontWeight='700' >Email</Text>
                                <Text fontSize='md' color='gray.500' >pentagonmaritimecorp@gmail.com | pentagonmaritimeservices@gmail.com</Text>
                            </Box>
                        </Box>
                        <MapComponent />
                    </Box>
                </BannerView>
                {/** Contact Form */}
                <Box p='5' pt='3'>
                    <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut'>
                        <Text textTransform='uppercase' color='#1c437e' fontWeight='750' fontSize='2xl'>Send us a message</Text>
                        <Text color='gray.600' fontWeight='400' fontSize='md'>{`We'd love to hear from you! Whether you have a question, feedback, or need assistance, just fill out the form below,  and we'll get back to you soon.`}</Text>
                        <Box mt='3' display='flex' flexDir={{base: 'column', md: 'row', lg: 'row'}}>
                            <FormControl>
                                <FormLabel color='gray.500'>Last Name</FormLabel>
                                <Input placeholder='Doe' type='text' shadow='md' size='lg' required />
                            </FormControl>
                            <FormControl ms={{base: '0', md: '4', lg: '4'}} mt={{base: '3', md: '0', lg: '0'}}>
                                <FormLabel color='gray.500'>First Name</FormLabel>
                                <Input placeholder='John' type='text' shadow='md' size='lg' required />
                            </FormControl>
                        </Box>
                        <Box mt='3'>
                            <FormControl>
                                <FormLabel color='gray.500'>Email</FormLabel>
                                <Input placeholder='e.g. abc@xyz.com' type='email' shadow='md' size='lg' required />
                            </FormControl>
                        </Box>
                        <Box mt='3'>
                            <FormControl>
                                <FormLabel color='gray.500'>Contact No.</FormLabel>
                                <Input placeholder='Your mobile number' shadow='md' size='lg' type='tel' />
                            </FormControl>
                        </Box>
                        <Box mt='3'>
                            <FormControl>
                                <FormLabel color='gray.500'>Subject</FormLabel>
                                <Input placeholder='Type here your purpose of inquiry...' type='text' shadow='md' size='lg' required/>
                            </FormControl>
                        </Box>
                        <Box mt='3'>
                            <FormControl>
                                <FormLabel color='gray.500'>Your Message</FormLabel>
                                <Textarea minH='250px' resize='none' shadow='lg' size='lg' placeholder='Type your comment or message here...'></Textarea>
                            </FormControl>
                        </Box>
                        <Box mt='3'>
                            <Box className='py-3'>
                                <Text fontSize='md' color='gray.600'>
                                {`By submitting this form, I agree to receive communications from Pentagon Maritime Services Corp. and confirm that I have read and accept the privacy policy.`}
                                </Text>
                            </Box>
                            <Button w={{base: '100%', md: '100%', lg: '30%'}} borderRadius='5px' colorScheme='blue' bgColor='#1c437e'>Submit Inquiry</Button>
                        </Box>
                    </ElementView>
                </Box>
            </Box>
        </main>
    );
}
