'use client'

import { usePathname, useRouter  } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, Wrap, WrapItem, useDisclosure, List, ListItem, Tooltip, Avatar, AvatarBadge, Menu, MenuButton, MenuList, IconButton, MenuItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter, PopoverArrow,Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import 'animate.css';
import BellIcon from '@/Components/Icons/BellIcon'
import HelpIcon from '@/Components/Icons/HelpIcon'

export default function TopWithSideNav() {

    const pathname = usePathname()
    const [customToken, setCustomToken] = useState<string>();
    const [pfp, setPfp] = useState<string | null>(null);
    const { isOpen, onOpen, onClose} = useDisclosure()
    const router = useRouter()

    const [current, setCurrent] = useState<string>('')
    const [permittedDept, setPermittedDept] = useState<string[]>([]);
    
    const pathParts = pathname.split('/'); // Split the pathname by '/'
    const homePath = `/${pathParts[2]}`;

    useEffect(() => {
        // Adding new departments to the existing array
        setPermittedDept(['Registration', 'Training', 'Admin']);
         // Extract the home path, which is the second part of the pathname
        setCurrent(homePath)
        const token = localStorage.getItem('customToken')
        if(token === null){
            router.push('/login')
        } else {
            setCustomToken(token)
            setPfp(localStorage.getItem('pfpToken'))
        }
    }, []);


    const shouldHideNavbar = pathname?.startsWith('/enterprise-portal/admin/candidates/new-candidate')

    if (shouldHideNavbar) {
        return null; // Don't render anything if conditions are met
    }

    return (
        <>
            <nav className='top-nav border-b border-gray-200 p-1 px-8 fixed bg-white flex items-center justify-end z-10'>
                <Box className='space-x-5 flex items-center'>
                    <Link href='/enterprise-portal/calendar' onClick={() => {setCurrent('calendar')}}>
                        <Image priority src='/icons/calendar.png' width={22} height={22} alt='logo' /> 
                    </Link>
                    <Popover isLazy>
                        <PopoverTrigger>
                            <Button bg='#FFFFFF00' _hover={{bg: '#FFFFFF00'}} p={0}>
                                <Avatar bg='#FFFFFF00' _hover={{bg: '#FFFFFF00'}} size='xs' icon={<BellIcon />}>
                                    {/* <AvatarBadge boxSize='1.25em' bg='red.500' /> */}
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
                                    <Image priority src='/icons/list.png' width={22} height={22} alt='logo' />See all
                                </Link>
                            </PopoverFooter>
                        </PopoverContent>
                    </Popover>
                    <Menu isLazy  >
                        <MenuButton bg='#FFFFFF00' _hover={{bg: '#FFFFFF00'}} as={IconButton} aria-label='Profile' icon={<Avatar name={customToken} size='xs' src={`${pfp}`} />} />
                        <MenuList className='space-y-1'>
                            <MenuItem>
                                <Link href='/enterprise-portal/user_profile' className='w-full' onClick={() => setCurrent('/user_profile')}>Profile</Link>
                            </MenuItem>
                            <MenuItem className='flex justify-start w-full'>
                                <Button bg='#FFFFFF00' p={'0px'} style={{height: '30px'}} _hover={{bg: '#FFFFFF00'}} className='w-full' fontSize='12px' onClick={onOpen}>
                                    <span className='text-start w-full'>Help</span>
                                </Button>
                            </MenuItem>
                            <MenuItem>Settings</MenuItem>
                            <MenuItem onClick={() => {localStorage.removeItem('customToken'); localStorage.removeItem('pfpToken'); router.push('/login')}} >Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
            </nav>
            <aside className='fixed h-full bg-slate-800 text-white font-normal flex flex-col text-center space-y-5 items-center justify-between z-20' style={{width: '95px'}}>
                <Box className='p-4'>
                    <Image priority src='/pentagon_logo.png' width={48} height={48} alt='logo' />
                </Box>
                <Box className='flex flex-col w-full py-3 pb-5 text-center justify-between h-full'>
                    <List spacing={6} >
                        <Tooltip label='Home' placement='right-end'>
                            <ListItem  className={`px-3 list-item ${current === '/home' ? 'border-r-4 border-blue-600' : ''}`} onClick={() => {setCurrent('/home')}}>
                                <Link href='/enterprise-portal/home'>
                                    <Box className='flex justify-center'> {current === '/home' ? <Image priority src='/icons/home.png' width={34} height={34} alt='logo' /> : <Image priority src='/icons/home-inactive.png' width={26} height={26} alt='logo' /> }</Box>
                                    {current === '/home' 
                                    ? <span className='animate__animated animate__fadeInDown'>Home</span>
                                    : ''}
                                </Link>
                            </ListItem> 
                        </Tooltip>
                        {navigateDepartments.map((navigate) => (
                            permittedDept.includes(navigate.name)
                            ?(<Tooltip key={navigate.name} label={navigate.name} placement='right-end'>
                                <ListItem  className={`px-3 list-item ${current.includes(navigate.href) ? 'border-r-4 border-blue-600' : ''}`} onClick={() => {setCurrent(`/` + navigate.href)}}>
                                    <Link href={`/enterprise-portal/` + navigate.href}>
                                        <Box className='flex justify-center'> {current.includes(navigate.href) ? navigate.activeIcon : navigate.inActive }</Box>
                                        {current.includes(navigate.href) 
                                        ? <span className='animate__animated animate__fadeInDown'>{navigate.name}</span>
                                        : ''}
                                    </Link>
                                </ListItem> 
                            </Tooltip>)
                            : null
                        ))}
                        {navigateStaff.map((navigate) => (
                            <Tooltip key={navigate.name} label={navigate.name} placement='right-end' >
                                <ListItem  className={`px-3 list-item ${current === `/` + navigate.href  ? 'border-r-4 border-blue-600' : ''}`} onClick={() => {setCurrent(`/` + navigate.href)}}>
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
                                        <Image priority src='/icons/bug.png' width={35} height={35} alt='logo' />
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
                                        <Image priority src='/icons/support.png' width={35} height={35} alt='logo' />
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
                                        <Image priority src='/icons/feedback.png' width={40} height={40} alt='logo' />
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
    {name: 'Purchase Request', href: 'accounting/pr', activeIcon: <Image priority src='/icons/purchase.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/purchase-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Cash Advance', href: 'accounting/ca', activeIcon: <Image priority src='/icons/cash.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/cash-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Leave', href: 'admin/lf', activeIcon: <Image priority src='/icons/leave.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/leave-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Role Permissions', href: 'admin/roles', activeIcon: <Image priority src='/icons/roles.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/roles-inactive.png' width={26} height={26} alt='logo' />}

]

// Department Links
const navigateDepartments = [
    {name: 'Training', href: 'training', activeIcon: <Image priority src='/icons/training-icon.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/training-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Registration', href: 'registration', activeIcon: <Image priority src='/icons/register.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/register-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Accounting', href: 'accounting', activeIcon: <Image priority src='/icons/accounting.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/accounting-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Marketing', href: 'sales', activeIcon: <Image priority src='/icons/sales.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/sales-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Admin', href: 'admin', activeIcon: <Image priority src='/icons/admin.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/admin-inactive.png' width={26} height={26} alt='logo' />},
    
]

// System Admin
const navigateSysAdmin = [
    {name: 'Analytics', href: 'registration', activeIcon: <Image priority src='/icons/bug.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/bug-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Ticketing', href: 'training', activeIcon: <Image priority src='/icons/bug.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/bug-inactive.png' width={26} height={26} alt='logo' />},
    
]

// QMR and higher ups
const navigateQMR = [
    {name: 'Insights', href: 'registration', activeIcon: <Image priority src='/icons/bug.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/bug-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Training', href: 'training', activeIcon: <Image priority src='/icons/training-icon.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/training-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Registration', href: 'registration/reports', activeIcon: <Image priority src='/icons/register.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/register-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Accounting', href: 'accounting/pr', activeIcon: <Image priority src='/icons/accounting.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/accounting-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Marketing', href: 'accounting/ca', activeIcon: <Image priority src='/icons/sales.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/sales-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Administration', href: 'admin/lf', activeIcon: <Image priority src='/icons/admin.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/admin-inactive.png' width={26} height={26} alt='logo' />},
    
    {name: 'Role Permissions', href: 'admin/roles', activeIcon: <Image priority src='/icons/roles.png' width={34} height={34} alt='logo' />, inActive: <Image priority src='/icons/roles-inactive.png' width={26} height={26} alt='logo' />}

]