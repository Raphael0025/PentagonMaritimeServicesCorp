'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useRoles } from '@/context/UserRolesContext'

export default function TabSysAdmin() {
    const { data: allRoles } = useRoles()
    const [currentTab, setTab] = useState<string | null>('tickets')

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
            {canAccess("Tickets") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'tickets' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/sys-admin/tickets' onClick={() => {handleClick('tickets')}}>Tickets</Link>
            )}
            {canAccess("Catalogs") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'catalogs' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/sys-admin/catalogs' onClick={() => {handleClick('catalogs')}}>Catalogs</Link>
            )}
            {canAccess("User Permissions") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'permissions' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/sys-admin/user-permissions' onClick={() => {handleClick('permissions')}}>User Permissions</Link>
            )}
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'notifications' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/sys-admin/notification-management' onClick={() => {handleClick('notifications')}}>Notification Management</Link>
        </nav>
    )
} 