'use client'

import { usePathname } from 'next/navigation';
import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useRoles } from '@/context/UserRolesContext'


export default function TabAdmin() {
    const { data: allRoles } = useRoles()
    const pathname = usePathname()
    const [currentTab, setTab] = useState<string | null>('admin')

    const [permissions, setPermissions] = useState<any[]>([])

    useEffect(() => {
        const fetchData = () => {
            const role = localStorage.getItem('roleToken');
            if (!role) return;

            const userRole = allRoles?.find(r => r.id === role)
            if (!userRole) return;

            // Check whether the found role belongs to the training department
            const permissions = userRole.permissions.filter(
                (p: any) => p.department === "Admin"
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

    const shouldHideNavbar = pathname?.startsWith('/enterprise-portal/admin/candidates/new-candidate')

    if (shouldHideNavbar) {
        return null; // Don't render anything if conditions are met
    }
    
    return(
        <nav className='flex space-x-6'>
            {canAccess("Overview") && (
                <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'admin' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin' onClick={() => {handleClick('admin')}}>Overview</Link>
            )}
            {/* {canAccess("Feedback Management") && (
                <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'fms' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/feedback-management-system' onClick={() => {handleClick('fms')}}>Feedback Management</Link>
            )} */}
            {canAccess("Feedback Management") && (
                <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'fms' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/feedback-management-system/post-training' onClick={() => {handleClick('fms')}}>Feedback Management</Link>
            )}
            {canAccess("Employee") && (
                <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'employee' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/employee' onClick={() => {handleClick('employee')}}>Employee</Link>
            )}
            {canAccess("Candidates") && (
                <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'candidates' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/candidates' onClick={() => {handleClick('candidates')}}>Candidates</Link>
            )}
            
            {canAccess("Facilities") && (
                <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'facilities' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/facilities' onClick={() => {handleClick('facilities')}}>Facilities</Link>
            )}
            {canAccess("Catalog") && (
                <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'catalog' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/department-catalog' onClick={() => {handleClick('catalog')}}>Catalogs</Link>
            )}
        </nav>
    ) 
}