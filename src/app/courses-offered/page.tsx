'use client'

'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import { Box, Button, Image, Text, Input, FormControl, Textarea, FormLabel, useDisclosure, List, ListItem, Tooltip, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';
import { ElementView, MapComponent, BannerView, BannerComponent } from '@/Components/SiteComponents'

export default function CoursesOffered() {

    return (
        <main className='pb-10'>
            <BannerView 
                initial={{opacity: 0, x: 100}}
                animate={{opacity: 1, x: 0}}
                transition={{ duration: 0.3, delay: 1, ease: 'linear' }}
            >
                <BannerComponent title='COURSES WE OFFER' content='Pentagon Maritime is committed to providing quality training programs aimed at developing highly skilled and capable seafarers.' image='./Images/ContactUs.jpg' />
            </BannerView>
            {/** Main Form */}
            <Box px={{base: '0%', lg: '20%'}} bgColor='#fbffff'>
            </Box>
        </main>
    );
}
