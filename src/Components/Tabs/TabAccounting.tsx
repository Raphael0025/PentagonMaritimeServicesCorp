'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useRoles } from '@/context/UserRolesContext'

export default function TabTraining() {
    const { data: allRoles } = useRoles()
    const [currentTab, setTab] = useState<string | null>('acknowledge')

    const [permissions, setPermissions] = useState<any[]>([])

    useEffect(() => {
        const fetchData = () => {
            const role = localStorage.getItem('roleToken');
            if (!role) return;

            const userRole = allRoles?.find(r => r.id === role)
            if (!userRole) return;

            // Check whether the found role belongs to the training department
            const permissions = userRole.permissions.filter(
                (p: any) => p.department === "System Admin"
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
        <nav className='flex space-x-6'>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'acknowledge' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/acknowledge' onClick={() => {handleClick('acknowledge')}}>Acknowledge</Link>
            {/* <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'ccr' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/ccr' onClick={() => {handleClick('ccr')}}>Course Completion</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'certification' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/certification' onClick={() => {handleClick('certification')}}>Certification</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'transmittal' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/transmittal' onClick={() => {handleClick('transmittal')}}>Transmittals</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'report' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/report' onClick={() => {handleClick('report')}}>Reports</Link> */}
        </nav> 
    )
}