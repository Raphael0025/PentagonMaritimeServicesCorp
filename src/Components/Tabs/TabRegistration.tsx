'use client'

import Link from 'next/link'
import {useState } from 'react';

import { Box } from '@chakra-ui/react'

export default function TabRegistration() {
    const [currentTab, setTab] = useState<string | null>('pending')

    const handleClick = (tab: string) => {
        setTab(tab)
    }

    return(
        <nav className='w-full flex justify-between space-x-6'>
            <Box className='space-x-4'>
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'pending' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/pending' onClick={() => {handleClick('pending')}}>Pending</Link>
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'inquiries' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/inquiry' onClick={() => {handleClick('inquiries')}}>Inquiries</Link>
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'upcoming' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/upcoming-courses' onClick={() => {handleClick('upcoming')}}>Upcoming Courses</Link>
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'registrations' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/registrations' onClick={() => {handleClick('registrations')}}>Registrations</Link>
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'batch' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/batches' onClick={() => {handleClick('batch')}}>Batch Records</Link>
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'report' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/analytics' onClick={() => {handleClick('report')}}>Analytics</Link>
            </Box>
            <Box className='space-x-4'>
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'trainees' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/trainees' onClick={() => {handleClick('trainees')}}>Trainees</Link>
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'courses' ? 'border-tab-active font-semibold text-sky-700' : 'border-tab-inactive font-normal text-gray-600'} `} href='/enterprise-portal/registration/courses' onClick={() => {handleClick('courses')}}>Courses</Link>
            </Box>
        </nav>
    )
}