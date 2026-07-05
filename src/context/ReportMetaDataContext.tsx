'use client'

import React,{createContext, useContext, useEffect, useState, ReactNode} from 'react'
import { TrainingReportByID } from '@/types/ReportMetadata.model'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { firestore, FETCH_REPORTMETADATA } from '@/lib/ReportMetadata.controller'

interface ReportMetadataContextType{
    data: TrainingReportByID[] | null;
    setReport: React.Dispatch<React.SetStateAction<TrainingReportByID[] | null>>;
}

const ReportMetadataContext = createContext<ReportMetadataContextType>({data: null, setReport: () => {},})

interface ReportMetadataProviderProps{
    children: ReactNode
}

export const ReportMetadataProvider: React.FC<ReportMetadataProviderProps>  = ({children}) => {
    const [data, setData] = useState<TrainingReportByID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await FETCH_REPORTMETADATA()
                setData(initData)
                const report = collection(firestore, 'REPORT_METADATA')
                const order_query = query(report)
                const unsubscribe = onSnapshot(order_query, (snapshot) => {
                    const updateData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() })) as TrainingReportByID[]
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
        <ReportMetadataContext.Provider value={{data, setReport: setData}}>
            {children}
        </ReportMetadataContext.Provider>
    )
}
export const useReportMetaData = () => {
    const context = useContext(ReportMetadataContext)
    if(context === undefined){
        throw new Error('useReportMetaData must be used within a ReportMetadataProvider')
    }
    return context
}