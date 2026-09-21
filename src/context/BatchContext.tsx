'use client'

import React,{createContext, useContext, useEffect, useState, ReactNode} from 'react'
import { CourseBatchByID, BDCourseBatchByID } from '@/types/course-batches'
import {collection, query, onSnapshot} from 'firebase/firestore'
import { firestore, FETCH_BATCHES, FETCH_BD_BATCHES } from '@/lib/course_batches_controller'

interface CourseBatchContextType{
    data: CourseBatchByID[] | null;
    bdData: BDCourseBatchByID[] | null;
    setCourseBatch: React.Dispatch<React.SetStateAction<CourseBatchByID[] | null>>;
}

const CourseBatchContext = createContext<CourseBatchContextType>({data: null, bdData: null, setCourseBatch: () => {},})

interface CourseBatchProviderProps{
    children: ReactNode
}

export const CourseBatchProvider: React.FC<CourseBatchProviderProps>  = ({children}) => {
    const [data, setData] = useState<CourseBatchByID[] | null>(null)
    const [bdData, setBDData] = useState<BDCourseBatchByID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await FETCH_BATCHES()
                setData(initData)
                const batches = collection(firestore, 'BATCH_RECORDS')
                const order_query = query(batches)
                const unsubscribe = onSnapshot(order_query, (snapshot) => {
                    const updateData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() })) as CourseBatchByID[]
                    setData(updateData)
                })
                
                const initBdData = await FETCH_BD_BATCHES()
                setBDData(initBdData)
                const bd_batches = collection(firestore, 'BD_BATCH_RECORDS')
                const order_query2 = query(bd_batches)
                const unsubscribe2 = onSnapshot(order_query2, (snapshot) => {
                    const updateData2 = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() })) as BDCourseBatchByID[]
                    setBDData(updateData2)
                })
                return () => {
                    unsubscribe()
                    unsubscribe2()
                }
            }catch(error){
                throw error
            }
        }
        fetchData()
    }, [])
    return(
        <CourseBatchContext.Provider value={{data, bdData, setCourseBatch: setData}}>
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