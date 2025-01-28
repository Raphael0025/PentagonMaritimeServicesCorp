'use client'

import Link from 'next/link'
import { useState } from 'react';

export default function TabMarketing() {
    const [currentTab, setTab] = useState<string | null>('clients')

    const handleClick = (tab: string) => {
        setTab(tab)
    }

    return(
        <nav className='flex space-x-6'>
{/*             
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'marketing' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing' onClick={() => {handleClick('marketing')}}>Analytics</Link>
             */}
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'clients' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing/clients' onClick={() => {handleClick('clients')}}>Clients</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'promos' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing/promos' onClick={() => {handleClick('promos')}}>Promos</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'sales' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing/sales' onClick={() => {handleClick('sales')}}>Sales</Link>
            <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'report' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/marketing/report' onClick={() => {handleClick('report')}}>Reports</Link>
        </nav>
    )
}