'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useRoles } from '@/context/UserRolesContext'

export default function TabInventory() {
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
                (p: any) => p.department === "Inventory"
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
            {canAccess("Master List") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'masterList' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/inventory-management/master-list' onClick={() => {handleClick('masterList')}}>Master List</Link>
            )}
            {canAccess("Categories") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'categories' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/inventory-management/categories' onClick={() => {handleClick('categories')}}>Categories</Link>
            )}
            {canAccess("Item Location") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'location' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/inventory-management/location' onClick={() => {handleClick('location')}}>Item Location</Link>
            )}
            {canAccess("Supplier") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'supplier' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/inventory-management/supplier' onClick={() => {handleClick('supplier')}}>Supplier</Link>
            )}
            {canAccess("Borrower's Log") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'borrowersLog' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/inventory-management/borrowers-log' onClick={() => {handleClick('borrowersLog')}}>{`Borrower's Log`}</Link>
            )}
        </nav>
    )
} 