'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useRoles } from '@/context/UserRolesContext'

export default function TabMarketing() {
    const { data: allRoles } = useRoles()
    const [currentTab, setTab] = useState<string | null>('clients')

    const [permissions, setPermissions] = useState<any[]>([])

    useEffect(() => {
        const fetchData = () => {
            const role = localStorage.getItem('roleToken');
            if (!role) return;

            const userRole = allRoles?.find(r => r.id === role)
            if (!userRole) return;

            // Check whether the found role belongs to the training department
            const permissions = userRole.permissions.filter(
                (p: any) => p.department === "Marketing"
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
{/*             
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'marketing' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing' onClick={() => {handleClick('marketing')}}>Analytics</Link>
             */}
            {canAccess("Clients") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'clients' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing/clients' onClick={() => {handleClick('clients')}}>Clients</Link>
            )}
            {canAccess("Promos") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'promos' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing/promos' onClick={() => {handleClick('promos')}}>Promos</Link>
            )}
            {canAccess("Sales") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'sales' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing/sales' onClick={() => {handleClick('sales')}}>Sales</Link>
            )}
            {canAccess("Analytics") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'report' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing/report' onClick={() => {handleClick('report')}}>Reports</Link>
            )}
        </nav>
    )
} 