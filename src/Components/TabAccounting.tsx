'use client'

import Link from 'next/link'
import { useState } from 'react';

export default function TabTraining() {
    const [currentTab, setTab] = useState<string | null>('acknowledge')

    const handleClick = (tab: string) => {
        setTab(tab)
    }

    return(
        <nav className='flex space-x-6'>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'acknowledge' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/acknowledge' onClick={() => {handleClick('acknowledge')}}>Acknowledge</Link>
            {/* <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'ccr' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/ccr' onClick={() => {handleClick('ccr')}}>Course Completion</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'certification' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/certification' onClick={() => {handleClick('certification')}}>Certification</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'transmittal' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/transmittal' onClick={() => {handleClick('transmittal')}}>Transmittals</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'report' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/report' onClick={() => {handleClick('report')}}>Reports</Link> */}
        </nav>
    )
}