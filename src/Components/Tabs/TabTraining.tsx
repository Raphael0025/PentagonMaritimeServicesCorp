'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useRoles } from '@/context/UserRolesContext'

export default function TabTraining() {
    const { data: allRoles } = useRoles()
    const [currentTab, setTab] = useState<string | null>('training')

    const [trainingPermissions, setTrainingPermissions] = useState<any[]>([])

    useEffect(() => {
        const fetchData = () => {
            const role = localStorage.getItem('roleToken');
            if (!role) return;

            const userRole = allRoles?.find(r => r.id === role)
            if (!userRole) return;

            // Check whether the found role belongs to the training department
            const trainingPermissions = userRole.permissions.filter(
                (p: any) => p.department === "Training"
            )
            setTrainingPermissions(trainingPermissions)
        }
        fetchData()
    }, [])

    const canAccess = (feature: string) => {
        return trainingPermissions.some(p => p.feature === feature);
    }

    const handleClick = (tab: string) => {
        setTab(tab)
    }
    
    return(
        <nav className='flex space-x-6'>
            {canAccess("Scheduling") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'training' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training' onClick={() => {handleClick('training')}}>Scheduling</Link>
            )}
            {canAccess("Training Tracker") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'tracker' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/tracker' onClick={() => {handleClick('tracker')}}>Training Tracker</Link>
            )}
            {canAccess("Batch Records") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'batch-records' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/batch-records' onClick={() => {handleClick('batch-records')}}>Batch Records</Link>
            )}
            {canAccess("Certification") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'certificate' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/certification' onClick={() => {handleClick('certificate')}}>Certification</Link>
            )}
            {canAccess("Instructors") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'instructor' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/instructors' onClick={() => {handleClick('instructor')}}>Instructors</Link>
            )}
            {canAccess("Analytics") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'analytics' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/analytics' onClick={() => {handleClick('analytics')}}>Analytics</Link>
            )}
            {canAccess("Analytics") && (
                <Link  className={`p-2 px-4 transition ease-in-out duration-300 ${ currentTab === 'course_mats' ? 'border-tab-active font-semibold text-sky-600' : 'border-tab-inactive font-normal text-gray-400'} `} href='/enterprise-portal/training/course-materials' onClick={() => {handleClick('course_mats')}}>Course Materials</Link>
            )}
        </nav>
    )
} 