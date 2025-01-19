'use client'

import React,{createContext, useContext, useEffect, useState, ReactNode} from 'react'
import {CourseBatch} from '@/types/course-batches'
import { BATCH_BY_ID } from '@/types/training'
import {collection, query, onSnapshot} from 'firebase/firestore'
import { firestore, FETCH_BATCHES, } from '@/lib/course_batches_controller'

interface CourseBatchContextType{
    data: BATCH_BY_ID[] | null;
    setCourseBatch: React.Dispatch<React.SetStateAction<BATCH_BY_ID[] | null>>;
}

const CourseBatchContext = createContext<CourseBatchContextType>({data: null, setCourseBatch: () => {},})

interface CourseBatchProviderProps{
    children: ReactNode
}

export const CourseBatchProvider: React.FC<CourseBatchProviderProps>  = ({children}) => {
    const [data, setData] = useState<BATCH_BY_ID[] | null>(null)
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await FETCH_BATCHES()
                setData(initData)
                const batches = collection(firestore, 'BATCHES')
                const order_query = query(batches)
                const unsubscribe = onSnapshot(order_query, (snapshot) => {
                    const updateData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() })) as BATCH_BY_ID[]
                    setData(updateData)
                })
                return () => {
                    unsubscribe()
                }
            }catch(error){
                throw error
            }
        }
        fetchData()
    }, [])
    return(
        <CourseBatchContext.Provider value={{data, setCourseBatch: setData}}>
            {children}
        </CourseBatchContext.Provider>
    )
}
export const useCourseBatch = () => {
    const context = useContext(CourseBatchContext)
    if(context === undefined){
        throw new Error('useCourseBatch must be used within a CourseBatchProvider')
    }
    return context
}