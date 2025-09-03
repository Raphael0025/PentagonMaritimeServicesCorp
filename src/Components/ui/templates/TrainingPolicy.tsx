'use client' 
import React from 'react'
import { Box, Text, OrderedList, ListItem } from '@chakra-ui/react'

export default function TrainingPolicy() {
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
        <Text fontWeight='600' fontSize='0.9375rem' mt='5' textTransform='uppercase' color='blue.700'>Training Policy</Text>
        <Box>
            <OrderedList lineHeight='1.7rem' fontSize='13px' fontWeight='400' sx={oL_style}>
                <ListItem>
                    Remember to come on time and in presentable clothing throughout your training
                    <OrderedList>
                        <ListItem>Any shirt with a collar EXCEPT shirt bearing names of other training centers</ListItem>
                        <ListItem> Pants/slacks</ListItem>
                        <ListItem>Closed shoes</ListItem>
                    </OrderedList>
                </ListItem>
                <ListItem>
                    Present you Admission Form to the Instructor upon entry into your class
                </ListItem>
                <ListItem>
                    For ONLINE Training, kindly ensure the following has been complied with:
                    <OrderedList>
                        <ListItem> Download 'GOOGLE MEET' and GOOGLE CLASSROOM APP </ListItem>
                        <ListItem> Must have a stable internet connection, a convenient place free from unnecessary noise or distractions </ListItem>
                        <ListItem> Stay online at least 10 minutes before the start of training. Training invite/link shall be sent a day before the start of training </ListItem>
                        <ListItem> Attendance to a course shall be turned in </ListItem>
                        <ListItem> Mic shall be turned off/muted unless prompted by the insructor or a trainee wants to participate in the discussion </ListItem>
                        <ListItem> The camera shall be turned ON throughout the training </ListItem>
                    </OrderedList>
                </ListItem>
            </OrderedList>
        </Box>
    </>
    )
}