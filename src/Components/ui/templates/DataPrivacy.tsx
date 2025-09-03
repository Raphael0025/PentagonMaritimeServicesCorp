'use client' 
import React from 'react'
import { Box, Text, OrderedList, ListItem } from '@chakra-ui/react'

export default function DataPrivacy() {
    const oL_style = { counterReset: "item", listStyleType: "none", pl: 4, 
                        "& li": {
                            display: "block",
                        },
                        "& li::before": {
                            content: 'counters(item, ".") ". "',
                            counterIncrement: "item",
                        },
                        "& ol": {
                            counterReset: "item",
                        },
                    }

    return (
    <>
        <Text fontWeight='600' fontSize='0.9375rem' mt='5' textTransform='uppercase' color='blue.700'>Data Privacy</Text>
        <Box lineHeight='1.7rem' fontSize='13px' fontWeight='400' >
            <Text>PENTAGON MARITIME SERVICES CORP. are committed to ensuring the confidentiality of your information under Republic Act No. 10173 of the Data Privacy Act of 2012 and will exert reasonable efforts to protext against its unauthorized use or disclosure.</Text>
            <Text>In compliance with the requirements of the Data Privacy Act and it's implementing rules and regulations, we would like to inform you how we handle and protect the data you provide in the course of your transaction/s with PENTAGON.</Text>
            <Text>These data, which include your personal or sensitive personal information may be collected processed, stored, updated to the information and data base of PENTAGON in strict confidence;</Text>
            <OrderedList lineHeight='1.7rem' fontSize='13px' fontWeight='400' sx={oL_style}>
                <ListItem>for legitimate purposes</ListItem>
                <ListItem>to implement transaction/s which you request, allow or authorize,</ListItem>
                <ListItem>to offer and provide new or related products and services of PENTAGON</ListItem>
                <ListItem>to comply with PENTAGON policies and it's reporting obligations under applicable laws.</ListItem>
            </OrderedList>
            <Text>That you hereby grant your express and continuing consent to allow PENTAGON to process your personal information and use it as may deem necessary</Text>
        </Box>
    </>
    )
}