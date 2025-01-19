'use client'

import { usePathname, useRouter  } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';
import {HelpIcon, BellIcon, SysAdIcon, RADIcon } from '@/Components/Icons'
import {CalendarIcon, CashIcon, DeBugIcon, CatalogIcon, FeedbackIcon, UserIcon, HomeIcon, LogoutIcon, PurchaseIcon, RegistrationIcon, RolesIcon, SalesIcon, LeaveIcon, SettingsIcon, SupportIcon, TrainingIcon, BankIcon, AdminFolderIcon, ListIcon } from '@/Components/SideIcons'
import { useCompanyUsers } from '@/context/CompanyUserContext'

export default function TopWithSideNav() {
    const pathname = usePathname()
    const {data: allCompanyUsers} = useCompanyUsers()
    const [customToken, setCustomToken] = useState<string>();
    const [pfp, setPfp] = useState<string | null>(null);
    const { isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter()

    const [current, setCurrent] = useState<string>('')
    const [permittedDept, setPermittedDept] = useState<string[]>([]);
    
    const pathParts = pathname.split('/'); // Split the pathname by '/'
    const homePath = `/${pathParts[2]}`;

    useEffect(() => {
        const token = localStorage.getItem('customToken')
        const departmentsToken = localStorage.getItem('departmentToken')
         // Extract the home path, which is the second part of the pathname
        setCurrent(homePath)
        if(token === null){
            router.push('/login')
        } else {
            setCustomToken(token)
            
            if (departmentsToken) {
                // Split the departments token into an array if it is not null
                const departmentsArray = departmentsToken.split('/');
                // Adding new departments to the existing array
                setPermittedDept([...departmentsArray]);
            }
        }
    }, [])
    
    useEffect(() => {
        const getActor: string | null = localStorage.getItem('customToken')
        const getPfp: string | null = localStorage.getItem('pfpToken')
        if (!allCompanyUsers) return;

        const company_staff = allCompanyUsers.find(staff => {
            return getActor === staff.full_name;
        });

        setPfp(company_staff?.pfp || getPfp);
    }, [allCompanyUsers]);

    const shouldHideNavbar = pathname?.startsWith('/enterprise-portal/admin/candidates/new-candidate')

    if (shouldHideNavbar) {
        return null; // Don't render anything if conditions are met
    }

    return (
        <>
            <nav className='top-nav border-b border-gray-200'>
                <Box className='space-x-5 flex items-center'>
                    <Link href='/enterprise-portal/calendar' onClick={() => {setCurrent('calendar')}}>
                        <CalendarIcon size={'24'} color={'#0D70AB'} />
                    </Link>
                    <Popover isLazy>
                        <PopoverTrigger>
                            <Button bg='#FFFFFF00' _hover={{bg: '#FFFFFF00'}} p={0}>
                                <Avatar bg='#FFFFFF00' _hover={{bg: '#FFFFFF00'}} size='xs' icon={<BellIcon />}>
                                </Avatar>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent w='500px'>
                            <PopoverHeader fontWeight='semibold'>Notifications</PopoverHeader>
                            <PopoverArrow />
                            <PopoverBody className='overflow-y-auto' h='200px'>
                                <Text className='py-2 font-normal border-b border-gray-300'>Notif 1</Text>
                            </PopoverBody>
                            <PopoverFooter>
                                <Link href='/enterprise-portal/notifications' onClick={() => {setCurrent('notifications')}} className='flex space-x-2 items-center hover:cursor-pointer' >
                                    <ListIcon size={'22'} color={'#a1a1a1'} />See all
                                </Link>
                            </PopoverFooter>
                        </PopoverContent>
                    </Popover>
                    <Menu isLazy  >
                        <MenuButton bg='#FFFFFF00' _hover={{bg: '#FFFFFF00'}} as={IconButton} aria-label='Profile' icon={<Avatar name={customToken} size='xs' src={pfp || ''} />} />
                        <MenuList className='space-y-1'>
                            <MenuItem>
                                <Link href='/enterprise-portal/user_profile' className='w-full flex justify-start' onClick={() => setCurrent('/user_profile')}>
                                    <span><UserIcon size={'20'} color={'#a1a1a1'} /></span>
                                    <span className='ps-2'>My Profile</span>
                                </Link>
                            </MenuItem>
                            <MenuItem className='flex p-0 justify-start text-start w-full'>
                                <Button bg='#FFFFFF00' p={'0px'} style={{height: '30px'}} _hover={{bg: '#FFFFFF00'}} className='w-full flex' justifyContent='start' fontSize='12px' onClick={onOpen}>
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                            <path fill="#a1a1a1" d="M12.003 21q-1.866 0-3.51-.708q-1.643-.709-2.859-1.924t-1.925-2.856T3 12.003t.708-3.51t1.924-2.859t2.856-1.925T11.997 3t3.51.708t2.859 1.924t1.925 2.856t.709 3.509t-.708 3.51t-1.924 2.859t-2.856 1.925t-3.509.709M9.1 19.45l1.738-3.942q-.822-.287-1.42-.888q-.597-.6-.887-1.42l-4.02 1.65q.595 1.6 1.795 2.8t2.794 1.8m-.57-8.65q.253-.82.861-1.395Q10 8.829 10.8 8.53L9.15 4.51q-1.62.62-2.82 1.82T4.513 9.15zm3.465 3.892q1.12 0 1.909-.784t.788-1.903t-.784-1.909t-1.903-.788t-1.909.784t-.788 1.903t.784 1.909t1.903.788M14.9 19.45q1.575-.6 2.763-1.787T19.45 14.9l-3.942-1.738q-.26.8-.862 1.399t-1.396.908zm.57-8.7l3.98-1.65q-.6-1.575-1.787-2.762T14.9 4.55l-1.65 3.992q.756.318 1.333.878t.886 1.33" />
                                        </svg>
                                    </span>
                                    <span className='ps-2'>Help</span>
                                </Button>
                            </MenuItem>
                            <MenuItem>
                                <span><SettingsIcon size={'22'} color={'#a1a1a1'} /></span>
                                <span className='ps-2'>Settings</span>
                            </MenuItem>
                            <MenuItem onClick={() => {localStorage.removeItem('customToken'); localStorage.removeItem('pfpToken'); localStorage.removeItem('departmentToken'); localStorage.removeItem('rankToken'); localStorage.removeItem('jobPositionToken'); router.push('/login')}} >
                                <span><LogoutIcon size={'20'} color={'#a1a1a1'} /></span>
                                <span className='ps-2'>Logout</span>
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
            </nav>
            <aside className='sideBar text-white font-normal flex flex-col text-center space-y-5 items-center justify-between' style={{width: '95px'}}>
                <Box className='p-4'>
                    <Image priority src='/pentagon_logo.png' width={48} height={48} alt='logo' />
                </Box>
                <Box className='flex flex-col w-full py-3 pb-5 text-center justify-between h-full'>
                    <List spacing={6} >
                        <Tooltip label='Home' placement='right-end'>
                            <ListItem  className={`px-3 list-item ${current === '/home' ? 'side-border-active' : ''}`} onClick={() => {setCurrent('/home')}}>
                                <Link href='/enterprise-portal/home'>
                                    <Box className='flex justify-center'> {current === '/home' ? <HomeIcon size={'34'} color={'#0D70AB'} /> : <HomeIcon size={'26'} color={'#a1a1a1'} /> }</Box>
                                    {current === '/home' 
                                    ? <span className='animate__animated animate__fadeInDown'>Home</span>
                                    : ''}
                                </Link>
                            </ListItem> 
                        </Tooltip>
                        {navigateDepartments.map((navigate) => (
                            permittedDept.some(dept => dept === navigate.name)
                            ? (
                                <Tooltip key={navigate.name} label={navigate.name} placement='right-end'>
                                    <ListItem
                                        className={`px-3 list-item ${current === `/` + navigate.href ? 'side-border-active' : ''}`}
                                        onClick={() => { setCurrent('/' + navigate.href) }}
                                    >
                                        <Link href={`/enterprise-portal/` + navigate.href}>
                                            <Box className='flex justify-center'>
                                                {current === `/` + navigate.href ? navigate.activeIcon : navigate.inActive}
                                            </Box>
                                            {current ===  `/` + navigate.href &&
                                                <span className='animate__animated animate__fadeInDown'>{navigate.name}</span>
                                            }
                                        </Link>
                                    </ListItem> 
                                </Tooltip>
                            )
                            : null
                        ))}
                        {navigateStaff.map((navigate) => (
                            <Tooltip key={navigate.name} label={navigate.name} placement='right-end' >
                                <ListItem  className={`px-3 list-item ${current === `/` + navigate.href  ? 'side-border-active' : ''}`} onClick={() => {setCurrent(`/` + navigate.href)}}>
                                    <Link href={`/enterprise-portal/` + navigate.href}>
                                        <Box className='flex justify-center'> {current === `/` + navigate.href  ? navigate.activeIcon : navigate.inActive }</Box>
                                        {current === `/` + navigate.href  
                                        ? <span className='animate__animated animate__fadeInDown'>{navigate.name}</span>
                                        : ''}
                                    </Link>
                                </ListItem> 
                            </Tooltip>
                        ))}
                    </List>
                </Box>
            </aside>
            
            <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size={'xl'}>
                <ModalOverlay />
                <ModalContent p={4}>
                    <ModalHeader className='flex space-x-5 items-center'>
                        <HelpIcon />
                        Help Center
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Wrap className=' w-full' spacing='20px' >
                            <WrapItem>
                                <Link href='/enterprise-portal/system-bug'>
                                    <Center className='flex space-x-5 p-3 rounded border border-solid border-slate-300' w='235px'>
                                        <DeBugIcon size={'42'} color={'#0D70AB'} />
                                        <Box>
                                            <h4 className='text-lg text-sky-600'>Report a Bug</h4>
                                            <Text className='font-normal'>Submit a ticket to report a bug.</Text>
                                        </Box>
                                    </Center>
                                </Link>
                            </WrapItem>
                            <WrapItem>
                                <Link href='/enterprise-portal/tech-support'>
                                    <Center className='flex space-x-5 p-3 rounded border border-solid border-slate-300' w='235px'>
                                        <SupportIcon size={'60'} color={'#0D70AB'} />
                                        <Box>
                                            <h4 className='text-lg text-sky-600'>Contact Support</h4>
                                            <Text className='font-normal'>Contact Support to assist your needs.</Text>
                                        </Box>
                                    </Center>
                                </Link>
                            </WrapItem>
                            <WrapItem>
                                <Link href='/enterprise-portal/user-feedback'>
                                    <Center className='flex space-x-5 p-3 rounded border border-solid border-slate-300' w='235px'>
                                        <FeedbackIcon size={'80'} color={'#0D70AB'} />
                                        <Box>
                                            <h4 className='text-lg text-sky-600'>User Feedback</h4>
                                            <Text className='font-normal'>Submit user feedback to help improve our system.</Text>
                                        </Box>
                                    </Center>
                                </Link>
                            </WrapItem>
                        </Wrap>
                    </ModalBody>
                </ModalContent>
            </Modal>

        </>
    )
}

// default staff navigation
const navigateStaff = [

    {name: 'Purchase Request', href: 'accounting/pr', activeIcon: <PurchaseIcon size={'34'} color={'#0D70AB'} />, inActive: <PurchaseIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Cash Advance', href: 'accounting/ca', activeIcon: <CashIcon size={'34'} color={'#0D70AB'} />, inActive: <CashIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Leave', href: 'admin/lf', activeIcon: <LeaveIcon size={'34'} color={'#0D70AB'} />, inActive: <LeaveIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Role Permissions', href: 'admin/roles', activeIcon: <RolesIcon size={'34'} color={'#0D70AB'} />, inActive: <RolesIcon size={'26'} color={'#a1a1a1'} />},

]

// Department Links
const navigateDepartments = [
    {name: 'Training', href: 'training', activeIcon: <TrainingIcon size={'34'} color={'#0D70AB'} />, inActive: <TrainingIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Registration', href: 'registration/pending', activeIcon: <RegistrationIcon size={'34'} color={'#0D70AB'} />, inActive: <RegistrationIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Accounting', href: 'accounting/acknowledge', activeIcon: <BankIcon size={'34'} color={'#0D70AB'} />, inActive: <BankIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Marketing', href: 'marketing/clients', activeIcon: <SalesIcon size={'34'} color={'#0D70AB'} />, inActive: <SalesIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Admin', href: 'admin', activeIcon: <AdminFolderIcon size={'34'} color={'#0D70AB'} />, inActive: <AdminFolderIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'R&D', href: 'research-development', activeIcon: <RADIcon size={'34'} color={'#0D70AB'} />, inActive: <RADIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'System Admin', href: 'sys-admin', activeIcon: <SysAdIcon size={'34'} color={'#0D70AB'} />, inActive: <SysAdIcon size={'26'} color={'#a1a1a1'} />},
    
]

// QMR and higher ups
const navigateQMR = [
    {name: 'Insights', href: 'registration', activeIcon: <HomeIcon size={'34'} color={'#0D70AB'} />, inActive: <HomeIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Training', href: 'training', activeIcon: <TrainingIcon size={'34'} color={'#0D70AB'} />, inActive: <TrainingIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Registration', href: 'registration', activeIcon: <RegistrationIcon size={'34'} color={'#0D70AB'} />, inActive: <RegistrationIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Accounting', href: 'accounting/pr', activeIcon: <BankIcon size={'34'} color={'#0D70AB'} />, inActive: <BankIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Marketing', href: 'accounting/ca', activeIcon: <SalesIcon size={'34'} color={'#0D70AB'} />, inActive: <SalesIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Administration', href: 'admin/lf', activeIcon: <AdminFolderIcon size={'34'} color={'#0D70AB'} />, inActive: <AdminFolderIcon size={'26'} color={'#a1a1a1'} />},
    
    {name: 'Role Permissions', href: 'admin/roles', activeIcon: <RolesIcon size={'34'} color={'#0D70AB'} />, inActive: <RolesIcon size={'26'} color={'#a1a1a1'} />},

]