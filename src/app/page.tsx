'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import { Box, Button, Heading, Image, Text, useDisclosure, List, ListItem, Tooltip, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';

export default function Home() {
    const router = useRouter();


    return (
        <main >
            <Box>Content</Box>
        </main>
    );
}












// // Function to change the URL pathname
  // const changePathname = () => {
  //     router.push('/admissions/ol/forms');
  // }
  
  // const handleLogin = () => {
  //   router.push('/login');
  // }

{/* <UnderMaintenance />
      <button onClick={changePathname}>Click here to be directed to admissions online</button>
      <button onClick={handleLogin}>Click here to be directed to Login</button>
      <Link href='/enterprise-portal/home'>Go to Enterprise Portal</Link> */}