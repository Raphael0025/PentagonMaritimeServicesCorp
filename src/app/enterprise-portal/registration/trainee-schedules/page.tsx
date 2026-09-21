'use client' 

import React from 'react';
import { useEffect, useState } from 'react';
import 'animate.css';
import { Box, Circle, Heading, Text, } from '@chakra-ui/react'
import { collection, getDocs, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { firestore } from '@/lib/controller'
import { ViewCandidateValues, initViewCandidate } from '@/types/document'
import Clock from '@/Components/Clock'
import Date from '@/Components/DateComponent'
import TaskIcon from '@/Components/Icons/TaskIcon'
import ProcessIcon from '@/Components/Icons/ProcessIcon'
import WarningIcon from '@/Components/Icons/WarningIcon'
import TaskComplete from '@/Components/Icons/TaskComplete'
import { useRoles } from '@/context/UserRolesContext'

import BackDated from '@/Components/Page/UpcomingCourses/BackDated'
import Dated from '@/Components/Page/UpcomingCourses/Dated'

export default function Page(){
    const [loading, setLoading] = useState<boolean>(false)
    const [company_staff, setCompanyStaff] = useState<ViewCandidateValues>(initViewCandidate); // State to store candidate details
    const [countTotaltask, setTotal] =useState<number>(0)
    const [countOngoingtask, setOngoing] =useState<number>(0)
    const [countDuetask, setDue] =useState<number>(0)
    const [countCompletetask, setCompleted] =useState<number>(0)
    const db = firestore

    const { data: allRoles } = useRoles()
    const [actor, setActor] = useState<string | null>('')
    const [rank, setRank] = useState<number | null>(0)
    const [dept, setDept] = useState<string | null>('')
    const [permittedTo, setPermittedTo] = useState<string>('')
    const [switchTo, setSwitch] = useState<boolean>(false)

    useEffect(() => {
        const fetchData = async () => {
            const customToken = localStorage.getItem('customToken');

            try {
                setLoading(true)
                const usersCollectionRef = collection(firestore, 'company_users');
                const userQuery = query(usersCollectionRef, where('full_name', '==', customToken));

                const userSnapshot = await getDocs(userQuery);
        
                const userData = userSnapshot.docs[0].data() as ViewCandidateValues;
                setCompanyStaff(userData);
                

            } catch (error) {
                console.error('Error getting employee record:', error);
            } finally {
                setLoading(false)
            }
        };
    
        fetchData();
        
        // Set up real-time listener for database changes
        const candidatesCollection = collection(db, 'company_users');
        const unsubscribe = onSnapshot(candidatesCollection, (snapshot) => {
            fetchData(); // Fetch data again when database changes
        });
        // Clean up subscription
        return () => {
            unsubscribe(); // Unsubscribe from the real-time listener when component unmounts
        };
    }, []);

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

    return(
    <>
        {switchTo ? <BackDated /> : <Dated />}
    </>
    )
}