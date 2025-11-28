'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react'
import { useRoles } from '@/context/UserRolesContext'

export default function TabRegistration() {
    const { data: allRoles } = useRoles()
    const [currentTab, setTab] = useState<string | null>('pending')

    const [permissions, setPermissions] = useState<any[]>([])

    useEffect(() => {
        const fetchData = () => {
            const role = localStorage.getItem('roleToken');
            if (!role) return;

            const userRole = allRoles?.find(r => r.id === role)
            if (!userRole) return;

            // Check whether the found role belongs to the training department
            const permissions = userRole.permissions.filter(
                (p: any) => p.department === "Registration"
            )
            setPermissions(permissions)
        }
        fetchData()
    }, [])

    const canAccess = (feature: string) => {
        return permissions.some(p => p.feature === feature);
    }

    const handleClick = (tab: string) => {
        setTab(tab)
    }

    return(
        <nav className='w-full flex justify-between space-x-6'>
            <Box className='space-x-4'>
                {canAccess("Pending") && (
                    <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'pending' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/pending' onClick={() => {handleClick('pending')}}>Pending</Link>
                )}
                {canAccess("Inquiries") && (
                    <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'inquiries' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/inquiry' onClick={() => {handleClick('inquiries')}}>Inquiries</Link>
                )}
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'upcoming' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/upcoming-courses' onClick={() => {handleClick('upcoming')}}>Upcoming Courses</Link>
                {canAccess("Registrations") && (
                    <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'registrations' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/registrations' onClick={() => {handleClick('registrations')}}>Registrations</Link>
                )}
                {canAccess("Batch Records") && (
                    <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'batch' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/batches' onClick={() => {handleClick('batch')}}>Batch Records</Link>
                )}
                {canAccess("Analytics") && (
                    <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'report' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/analytics' onClick={() => {handleClick('report')}}>Analytics</Link>
                )}
            </Box>
            <Box className='space-x-4'>
                {canAccess("Trainees") && (
                    <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'trainees' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/trainees' onClick={() => {handleClick('trainees')}}>Trainees</Link>
                )}
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'courses' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/courses' onClick={() => {handleClick('courses')}}>Courses</Link>
            </Box>
        </nav>
    )
} 