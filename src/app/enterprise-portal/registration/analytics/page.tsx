'use client'

import { useState, useEffect} from 'react';

import {BackDated, Dated} from '@/Components/Page/registration_analytics'
import { Box, Button, Text,} from '@chakra-ui/react'

import { useRoles } from '@/context/UserRolesContext'

export default function Page(){
    const { data: allRoles } = useRoles()
    const [actor, setActor] = useState<string | null>('')
    const [rank, setRank] = useState<number | null>(0)
    const [dept, setDept] = useState<string | null>('')
    const [permittedTo, setPermittedTo] = useState<string>('')
    const [switchTo, setSwitch] = useState<boolean>(false)

    useEffect(() => {
        const fetchData = () => {
            const role = localStorage.getItem('roleToken')
            const UserRole = allRoles?.find((item) => item.id === role)

            if(!UserRole) return

            const roleScope = UserRole?.permissions.find((r) => r.feature === 'Pending')?.scope || ''
            setPermittedTo(roleScope)

            const getActor = localStorage.getItem('customToken')
            setActor(getActor)

            const getDept = localStorage.getItem('departmentToken')
            const getRank = localStorage.getItem('rankToken')

            const rankArr = getRank ? getRank.split('/') : []
            const deptArr = getDept ? getDept.split('/') : []

            const targetDept = 'Registration'

            const index = deptArr.indexOf(targetDept)
            if(index !== 1){
                const correspondRank = rankArr[index]
                const correspondDept = deptArr[index]
                setRank(Number(correspondRank))
                setDept(correspondDept)
            }
        }
        fetchData()
    },[])

    useEffect(() => {
        if (permittedTo !== 'both') return; // Only activate shortcut for 'both'

        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
                setSwitch(prev => !prev);
            }
        };

        window.addEventListener('keydown', handler);

        return () => window.removeEventListener('keydown', handler);
    }, [permittedTo])

    if (permittedTo === 'dated') return <Dated />;
    if (permittedTo === 'bd') return <BackDated />;

    if (permittedTo === 'both') {
        return (
            <>
                {/* Debug indicator (OPTIONAL - remove if you want fully hidden) */}
                {/* <Text fontSize="xs" color="gray.400">Press CTRL + ALT + R to toggle</Text> */}

                {switchTo ? <BackDated /> : <Dated />}
            </>
        );
    }

    return null
    
}