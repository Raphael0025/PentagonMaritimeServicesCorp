'use client' 
import React from 'react'
import { Box, Text, OrderedList, ListItem } from '@chakra-ui/react'

export default function AdmissionPolicy() {
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
        <Text fontWeight='600' fontSize='0.9375rem' mt='3' textTransform='uppercase' color='blue.700'>Admisison Policy</Text>
        <Box>
            <OrderedList lineHeight='1.7rem' fontSize='13px' fontWeight='400' sx={oL_style}>
                <ListItem>
                    Trainees are admitted to a course upon completion of the registration process
                </ListItem>
                <ListItem>
                    Enrollment to a course shall be confirmed upon payment of at least 50% of the course fee as partial payment for every course enrolled
                </ListItem>
                <ListItem>
                    The folowwing charges/fees shall be imposed:
                    <OrderedList>
                        <ListItem>
                            Cancellation/Rescheduling of Enrollment
                            <OrderedList>
                                <ListItem>At least a WEEK before the start of training - ₱500</ListItem>
                                <ListItem>At least ONE DAY before the start of training - FULL COURSE FEE</ListItem>
                            </OrderedList>
                        </ListItem>
                        <ListItem>
                            Change of Course
                            <OrderedList>
                                <ListItem>At least a WEEK before the start of training - ₱500</ListItem>
                                <ListItem>At least ONE DAY before the start of training - FULL COURSE FEE</ListItem>
                            </OrderedList>
                        </ListItem>
                        <ListItem>
                            For government-accredited courses, no cancellation/rescheduling or change, of course, shall be allowed unless done earlier than a WEEK before the start of training or otherwise shall be charged the FULL COURSE FEE
                        </ListItem>
                    </OrderedList>
                </ListItem>
                <ListItem>Trainees with unauthorized absences should attend "MAKE UP CLASS" and will be charged ₱500</ListItem>
                <ListItem>Assessment will only be allowed upon full payment of fees</ListItem>
                <ListItem>Certificates shall be claimed upon presentation of proof of FULL payment. Certificate/s must be claimed within five(5) working days upon completion of training to avoid an archiving charge</ListItem>
                <ListItem>
                    Releasing of certificates shall follow these guidelines:
                    <OrderedList>
                        <ListItem>For Trainee account: a day after completion of training</ListItem>
                        <ListItem>For Company account: deliver directly to Company/Agency representative upon completion of training</ListItem>
                    </OrderedList>
                </ListItem>
                <ListItem>
                    OTHER charges related to Certificate printing
                    <OrderedList>
                        <ListItem>Reprinting of Certificate (due to lost copy) - ₱50 and notarized Affidavit of Loss</ListItem>
                        <ListItem>Request for Certified True Copy - ₱500</ListItem>
                        <ListItem>Archiving/late claiming - ₱50</ListItem>
                    </OrderedList>
                </ListItem>
            </OrderedList>
        </Box>
    </>
    )
}