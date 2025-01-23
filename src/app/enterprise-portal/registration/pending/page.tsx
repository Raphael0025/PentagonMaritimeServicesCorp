'use client'

import { useState, useEffect } from 'react';

import BackDated from '@/Components/Page/Pending/BackDated'
import Dated from '@/Components/Page/Pending/Dated'

export default function Page(){
    const [actor, setActor] = useState<string | null>('')
    const [rank, setRank] = useState<number | null>(0)
    const [dept, setDept] = useState<string | null>('')

    useEffect(() => {
        const fetchData = () => {
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

    if(rank !== null){
        if(rank < 3){
            return <Dated />
        }
        return <BackDated />
    }
    
}