'use client'

import UnderMaintenance from '@/Components/UnderMaintenance'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, Circle, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, TableContainer, Table, Th, Thead, Tbody, Td, Tr, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css'

export default function Page(){
    return(
        <>
            <main className='flex space-x-6 py-6 px-6 '>
            <UnderMaintenance />
            </main>
        </>
    )
}