'use client'

import React from 'react'
import { Box, Text, Input, Textarea, Button, Select,  Grid, GridItem, InputLeftAddon, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';


export default function FormDescription() {
    return(
    <>
        <Box w='md' display='flex' justifyContent='start' flexDir='column' alignItems='center'>
            <Text>Practical Assessment Plan</Text>
            <Box display='flex' justifyContent='space-between' >
                <Text mr='3'>Course Title</Text>
                <Text>{`Ratings Forming Part of a Watch in a Manned Engine-room or designated to perform duties in a Periodically Unmanned Engine-room`}</Text>
            </Box>
            <Box display='flex' justifyContent='space-between' >
                <Text mr='3'>Assessment Number</Text>
                <Text>{`2 (A5.1, A5.3, A5.4)`}</Text>
            </Box>
            <Box display='flex' justifyContent='space-between' >
                <Text mr='3'>Assessment Title</Text>
                <Box>
                    <Text>{`Relieve, maintain, and hand over a watch applying the prescribed principles and procedures`}</Text>
                    <Text>{`Take actions upon hearing an alarm of a specific emergency in the engine room`}</Text>
                    <Text>{`Monitor, maintain and record the safe operating parameters of the boiler while in operation`}</Text>
                </Box>
            </Box>
        </Box>
    </>
    )
}