'use client'

import Link from 'next/link'
import { useState } from 'react';

export default function TabTraining() {
    const [currentTab, setTab] = useState<string | null>('training')

    const handleClick = (tab: string) => {
        setTab(tab)
    }

    return(
        <nav className='flex space-x-6'>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'training' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training' onClick={() => {handleClick('training')}}>Scheduling</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'tracker' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/tracker' onClick={() => {handleClick('tracker')}}>Training Tracker</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'batch-records' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/batch-records' onClick={() => {handleClick('batch-records')}}>Batch Records</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'certificate' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/certificate-monitoring' onClick={() => {handleClick('certificate')}}>Certification</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'instructor' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/instructors' onClick={() => {handleClick('instructor')}}>Instructors</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'analytics' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/analytics' onClick={() => {handleClick('analytics')}}>Analytics</Link>
            {/* <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'report' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/report' onClick={() => {handleClick('report')}}>Reports</Link> */}
        </nav>
    )
}