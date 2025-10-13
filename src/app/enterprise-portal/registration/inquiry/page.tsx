'use client'

import React, { useState, useEffect } from "react"

import { Box, Button, Select, Text, useDisclosure, Tooltip, Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, ModalCloseButton} from '@chakra-ui/react'
import { INQUIRIES_BY_ID, INQUIRIES, initInquiry } from '@/types/inquiries'
import { useInquiries } from '@/context/InquiriesContext'
import { parsingTimestamp, ToastStatus } from '@/types/handling'

export default function Page () {
    const {data: allInquiries} = useInquiries()

    const [inquiry, setInquiry] = useState<INQUIRIES>(initInquiry)

    const [loading, setLoading] = useState<boolean>(false)
    const { isOpen: isInquiryOpen, onOpen: onInquiryOpen, onClose: onInquiryClose } = useDisclosure()
    const { isOpen: isPrintOpen, onOpen: onPrintOpen, onClose: onPrintClose } = useDisclosure()

    // ? Date
    // ? Name 
    // ? Contact #
    // ? Company
    // ? referrered by
    // ? course inquiry
    // ? available date for training
    // ? Remarks (Registered officer)
    // * filter by month 

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
                        <Box display='flex' borderBottom='1px solid gray' textAlign='center' w='full' justifyContent='space-between' alignItems='center' fontWeight='normal' textTransform='uppercase'>
                            <Text >Date of Inquiry</Text>
                            <Text >Name</Text>
                            <Text >Contact No.</Text>
                            <Text >Company</Text>
                            <Text >Referred By</Text>
                            <Text >Course Inquiry</Text>
                            <Text >Available Date for Training</Text>
                            <Text >{`Remarks`}<br />{`(Registration Officer)`}</Text>
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
                                <Box key={i.id} display='flex' fontWeight='normal' borderBottom='1px solid solid gray' justifyContent='space-between' alignItems='center'>
                                    <Text>{parsingTimestamp(i?.createdAt).toLocaleDateString('en-US', {  year: 'numeric', month: 'numeric',  day: 'numeric',})}</Text>
                                    <Text>{i.name}</Text>
                                    <Text>{i.name}</Text>
                                    <Text>{i.name}</Text>
                                    <Text>{i.name}</Text>
                                    <Text>{i.name}</Text>
                                    <Text>{i.name}</Text>
                                    <Text>{i.name}</Text>
                                </Box>
                        ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    )
}