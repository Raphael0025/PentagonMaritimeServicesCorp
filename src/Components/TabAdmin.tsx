'use client'

import { usePathname, useRouter  } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';


export default function TabAdmin() {
    const [currentTab, setTab] = useState<string | null>(null)
    const pathname = usePathname()

    const handleClick = (tab: string) => {
        setTab(tab)
    }

    const pathParts = pathname.split('/'); // Split the pathname by '/'
    const numPaths = pathParts.length;
    const homePath = `${pathParts[3]}`;

    useEffect(() => {
        setTab(numPaths === 3 ? 'admin' : homePath)
    }, []);


    const shouldHideNavbar = pathParts[4] === 'new-candidate';

    if (shouldHideNavbar) {
        return null
    }

    return(
        <nav className='flex space-x-6'>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'admin' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/admin' onClick={() => {handleClick('admin')}}>Overview</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'employee' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/admin/employee' onClick={() => {handleClick('employee')}}>Employee</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'candidates' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/admin/candidates' onClick={() => {handleClick('candidates')}}>Candidates</Link>
            
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'crm' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/admin/crm' onClick={() => {handleClick('crm')}}>CRM</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'inventory' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/admin/inventory' onClick={() => {handleClick('inventory')}}>Inventory</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'library' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/admin/library' onClick={() => {handleClick('library')}}>Library</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'facilities' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/admin/facilities' onClick={() => {handleClick('facilities')}}>Facilities</Link>
        </nav>
    )
}