'use client'

import Link from 'next/link'
import {useState } from 'react';

export default function TabSysAdmin() {
    const [currentTab, setTab] = useState<string | null>('tickets')

    const handleClick = (tab: string) => {
        setTab(tab)
    }

    return(
        <nav className='flex space-x-6'>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'tickets' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/sys-admin/tickets' onClick={() => {handleClick('tickets')}}>Tickets</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'catalogs' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/sys-admin/catalogs' onClick={() => {handleClick('catalogs')}}>Catalogs</Link>
        </nav>
    )
}