'use client'

import { usePathname, useRouter  } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import 'animate.css';


export default function TabRegistration() {
    const [currentTab, setTab] = useState<string | null>(null)
    const pathname = usePathname()

    const handleClick = (tab: string) => {
        setTab(tab)
    }

    const pathParts = pathname.split('/'); // Split the pathname by '/'
    const numPaths = pathParts.length;
    const homePath = `${pathParts[3]}`;

    useEffect(() => {
        setTab(numPaths === 3 ? 'registration' : homePath)
    }, []);


    // const shouldHideNavbar = pathParts[4] === 'new-candidate';

    // if (shouldHideNavbar) {
    //     return null
    // }

    return(
        <nav className='flex space-x-6'>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'registration' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/registration' onClick={() => {handleClick('registration')}}>Overview</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'trainee-mgmt' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/registration/trainee-mgmt' onClick={() => {handleClick('trainee-mgmt')}}>Trainees</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'batches' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/registration/batches' onClick={() => {handleClick('batches')}}>Batches</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'course-mgmt' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/registration/course-mgmt' onClick={() => {handleClick('course-mgmt')}}>Courses</Link>
            <Link className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'report' ? 'border-b-4 border-blue-500 ' : 'border-b border-gray-300'} `} href='/enterprise-portal/registration/report' onClick={() => {handleClick('report')}}>Reports</Link>
        </nav>
    )
}