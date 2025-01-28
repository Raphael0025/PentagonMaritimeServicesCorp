'use client'

import { usePathname } from 'next/navigation';
import Link from 'next/link'
import { useState } from 'react';


export default function TabAdmin() {
    const pathname = usePathname()
    const [currentTab, setTab] = useState<string | null>('admin')

    const handleClick = (tab: string) => {
        setTab(tab)
    }

    const shouldHideNavbar = pathname?.startsWith('/enterprise-portal/admin/candidates/new-candidate')

    if (shouldHideNavbar) {
        return null; // Don't render anything if conditions are met
    }
    
    return(
        <nav className='flex space-x-6'>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'admin' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin' onClick={() => {handleClick('admin')}}>Overview</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'employee' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/employee' onClick={() => {handleClick('employee')}}>Employee</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'candidates' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/candidates' onClick={() => {handleClick('candidates')}}>Candidates</Link>
            
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'crm' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/crm' onClick={() => {handleClick('crm')}}>CRM</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'inventory' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/inventory' onClick={() => {handleClick('inventory')}}>Inventory</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'library' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/library-mgmt' onClick={() => {handleClick('library')}}>Library</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'facilities' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/facilities' onClick={() => {handleClick('facilities')}}>Facilities</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'catalog' ? 'border-tab-active ' : 'border-tab-inactive'} `} href='/enterprise-portal/admin/department-catalog' onClick={() => {handleClick('catalog')}}>Catalogs</Link>
        </nav>
    )
}