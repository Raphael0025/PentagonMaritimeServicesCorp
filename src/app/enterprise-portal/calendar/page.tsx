'use client' 

import { usePathname  } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, Fragment } from 'react';
import { Box, Button, Center, Circle, Heading, Text, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';
import CalendarComponent from '@/Components/CalendarComponent'

export default function Page(){
    return(
        <>
            <main className='px-8 z-0'>
                <Box>
                    <CalendarComponent />
                </Box>
            </main>
        </>
    )
}