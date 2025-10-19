'use client'

import React, { useState, useEffect } from "react"

import { Box, Button, Select, Textarea, FormControl, FormLabel, Input, Text, useToast, useDisclosure, Tooltip, Modal, ModalOverlay, ModalHeader, ModalBody, ModalContent, ModalFooter, ModalCloseButton} from '@chakra-ui/react'
import { INQUIRIES, initInquiry } from '@/types/inquiries'
import { useInquiries } from '@/context/InquiriesContext'
import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { INSERT_INQUIRY, UPDATE_INQUIRY, DELETE_INQUIRY } from '@/lib/inquiry_controller'

export default function Page () {
    const toast = useToast()
    const {data: allInquiries} = useInquiries()

    const [inquiry, setInquiry] = useState<INQUIRIES>(initInquiry)
    const [inquiryID, setIDInquiry] = useState<string>('')

    const [loading, setLoading] = useState<boolean>(false)
    const { isOpen: isInquiryOpen, onOpen: onInquiryOpen, onClose: onInquiryClose } = useDisclosure()
    const { isOpen: isInquiryEditOpen, onOpen: onInquiryEditOpen, onClose: onInquiryEditClose } = useDisclosure()
    const { isOpen: isInquiryDeleteOpen, onOpen: onInquiryDeleteOpen, onClose: onInquiryDeleteClose } = useDisclosure()
    const { isOpen: isPrintOpen, onOpen: onPrintOpen, onClose: onPrintClose } = useDisclosure()

    // * filter by month 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setInquiry((prev) => ({
            ...prev,
            [id]: value.toUpperCase(),
        }))
    }
    
    const handleChangeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setInquiry((prev) => ({
            ...prev,
            [id]: value.toUpperCase(),
        }))
    }

    const handleSubmitInquiry = async () => {
        setLoading(true)
        
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    await INSERT_INQUIRY(inquiry, actor ?? null)
                    handleToast('Inquiry Created Successfully', ``, 5000, 'success')
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
            setInquiry(initInquiry)
            onInquiryClose()
        })
    }
    
    const handleUpdateInquiry = async () => {
        setLoading(true)
        
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    await UPDATE_INQUIRY(inquiryID, inquiry, actor ?? null)
                    handleToast('Inquiry Update Successfully', ``, 5000, 'success')
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
            setInquiry(initInquiry)
            onInquiryEditClose()
        })
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

    const handleDelete = (id: string) => {
        setLoading(true)
        
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    await DELETE_INQUIRY(id, actor ?? null)
                    handleToast('Inquiry Deleted Successfully', ``, 5000, 'success')
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
            onInquiryClose()
        })
    }

    if(!allInquiries){
        return <Text>Loading...</Text>
    }

    return(
        <>
            <Box>
                {/** Components: date filter | create inquiry button | print button  */}
                <Box display='flex' justifyContent='end' gap='4'>
                    <Button size='sm' colorScheme='blue' bgColor='blue.700' shadow='md'>Filter Date</Button>
                    <Button onClick={onInquiryOpen} size='sm' colorScheme='blue' bgColor='blue.700' shadow='md'>Create Inquiry</Button>
                    <Button onClick={onPrintOpen} size='sm' colorScheme='blue' bgColor='blue.700' shadow='md'>Print Inquiries</Button>
                </Box>
                {/** Inquiry Table with Action Column (Edit | Delete button) */}
                <Box mt='4' >
                    <Box px='5' borderRadius='5px' shadow='md' maxHeight='700px' overflowY={'auto'}>
                        {/** Header */}
                        <Box display='flex' borderBottom='1px solid gray' textAlign='center' w='full' justifyContent='space-between' alignItems='center' fontWeight='bold' textTransform='uppercase'>
                            <Text w='100px'>Date of Inquiry</Text>
                            <Text w='300px'>Name</Text>
                            <Text w='150px'>Contact No.</Text>
                            <Text w='150px'>Company</Text>
                            <Text w='150px'>Referred By</Text>
                            <Text w='250px'>Course Inquiry</Text>
                            <Text w='150px'>Available Date for Training</Text>
                            <Text w='250px'>{`Remarks`}<br />{`(Registration Officer)`}</Text>
                            <Text w='150px'>Action</Text>
                        </Box>
                        {/** Body */}
                        <Box>
                        {allInquiries.length === 0 ? (
                            <Box display='flex' p='5' alignItems='center' justifyContent='center'>
                                <Text>No Inquiries Found.</Text>
                            </Box>
                        ) : allInquiries && allInquiries
                            .sort((a,b) => {
                                return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
                            })    
                            .map((i) => (
                                <Box key={i.id} py='3' textAlign='center' display='flex' fontWeight='normal' borderBottom='1px solid gray' justifyContent='space-between' alignItems='center'>
                                    <Text w='100px'>{parsingTimestamp(i?.createdAt).toLocaleDateString('en-US', {  year: 'numeric', month: 'numeric',  day: 'numeric',})}</Text>
                                    <Text w='300px'>{i.name}</Text>
                                    <Text w='150px'>{i.contact_no}</Text>
                                    <Text w='150px'>{i.company}</Text>
                                    <Text w='150px'>{i.referral}</Text>
                                    <Text w='250px'>{i.course_inquiry}</Text>
                                    <Text w='150px'>{i.date_avail}</Text>
                                    <Text w='250px'>{i.remarks}</Text>
                                    <Box w='150px' display='flex' justifyContent='center' alignItems='center'>
                                        <Button onClick={() => {setInquiry(i); setIDInquiry(i.id); onInquiryEditOpen(); }} size='xs' mr={3} shadow='md' colorScheme='blue'>Edit</Button>
                                        <Button isLoading={loading} loadingText='Deleting...' onClick={() => handleDelete(i.id)} size='xs' shadow='md' colorScheme='red'>Delete</Button>
                                    </Box>
                                </Box>
                        ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
            {/** EDIT */}
            <Modal isOpen={isInquiryEditOpen} onClose={onInquiryEditClose} size='xl' scrollBehavior='inside'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Update Inquiry</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='name' fontSize='sm' fontWeight='normal'>Inquirer:</FormLabel>
                            <Input id='name' value={inquiry.name} onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='contact_no' fontSize='sm' fontWeight='normal'>Contact No.:</FormLabel>
                            <Input id='contact_no' value={inquiry.contact_no} onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='company' fontSize='sm' fontWeight='normal'>Company:</FormLabel>
                            <Input id='company' value={inquiry.company} onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='referral' fontSize='sm' fontWeight='normal'>Referred By:</FormLabel>
                            <Input id='referral' value={inquiry.referral} onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='course_inquiry' fontSize='sm' fontWeight='normal'>Course Inquiry:</FormLabel>
                            <Input id='course_inquiry' value={inquiry.course_inquiry} onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='date_avail' fontSize='sm' fontWeight='normal'>Available Date for Training:</FormLabel>
                            <Input id='date_avail' value={inquiry.date_avail} onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='remarks' fontSize='sm' fontWeight='normal'>Remarks:</FormLabel>
                            <Textarea id='remarks' value={inquiry.remarks} onChange={handleChangeTextarea} shadow='md'></Textarea>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter display='flex' justifyContent='end'>
                        <Button mr={3} shadow='md' size='sm'>Cancel</Button>
                        <Button onClick={handleUpdateInquiry} isLoading={loading} loadingText='Updating...' colorScheme='blue' bgColor='blue.700' shadow='md' size='sm'>Update</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/** CREATION */}
            <Modal isOpen={isInquiryOpen} onClose={onInquiryClose} size='xl' scrollBehavior='inside'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create New Inquiry</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='name' fontSize='sm' fontWeight='normal'>Inquirer:</FormLabel>
                            <Input id='name' onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='contact_no' fontSize='sm' fontWeight='normal'>Contact No.:</FormLabel>
                            <Input id='contact_no' onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='company' fontSize='sm' fontWeight='normal'>Company:</FormLabel>
                            <Input id='company' onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='referral' fontSize='sm' fontWeight='normal'>Referred By:</FormLabel>
                            <Input id='referral' onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='course_inquiry' fontSize='sm' fontWeight='normal'>Course Inquiry:</FormLabel>
                            <Input id='course_inquiry' onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='date_avail' fontSize='sm' fontWeight='normal'>Available Date for Training:</FormLabel>
                            <Input id='date_avail' onChange={handleChange} shadow='md' />
                        </FormControl>
                        <FormControl isRequired mb={3}>
                            <FormLabel htmlFor='remarks' fontSize='sm' fontWeight='normal'>Remarks:</FormLabel>
                            <Textarea id='remarks' onChange={handleChangeTextarea} shadow='md'></Textarea>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter display='flex' justifyContent='end'>
                        <Button mr={3} shadow='md' size='sm'>Cancel</Button>
                        <Button onClick={handleSubmitInquiry} isLoading={loading} loadingText='Creating...' colorScheme='blue' bgColor='blue.700' shadow='md' size='sm'>Create</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}