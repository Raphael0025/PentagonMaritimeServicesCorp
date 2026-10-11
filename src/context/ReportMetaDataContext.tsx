'use client'

import React,{createContext, useContext, useEffect, useState, ReactNode} from 'react'
import { TrainingReportByID, RegistrationReportByID } from '@/types/ReportMetadata.model'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { firestore, FETCH_REPORTMETADATA, FETCH_REG_REPORT } from '@/lib/ReportMetadata.controller'

interface ReportMetadataContextType{
    data: TrainingReportByID[] | null;
    regData: RegistrationReportByID[] | null;
    setReport: React.Dispatch<React.SetStateAction<TrainingReportByID[] | null>>;
    setRegReport: React.Dispatch<React.SetStateAction<RegistrationReportByID[] | null>>;
}

const ReportMetadataContext = createContext<ReportMetadataContextType>({data: null, regData: null, setRegReport: () => {}, setReport: () => {},})

interface ReportMetadataProviderProps{
    children: ReactNode
}

export const ReportMetadataProvider: React.FC<ReportMetadataProviderProps>  = ({children}) => {
    const [data, setData] = useState<TrainingReportByID[] | null>(null)
    const [regData, setRegReport] = useState<RegistrationReportByID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await FETCH_REPORTMETADATA()
                setData(initData)
                const initRegData = await FETCH_REG_REPORT()
                setRegReport(initRegData || [])

                const report = collection(firestore, 'REPORT_METADATA')
                const regReport = collection(firestore, 'REGISTRATION_REPORT')
                
                const order_query = query(report)
                const unsubscribe = onSnapshot(order_query, (snapshot) => {
                    const updateData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() })) as TrainingReportByID[]
                    setData(updateData)
                })

                const reg_rep_query = query(regReport)
                const unsubscribe2 = onSnapshot(reg_rep_query, (snapshot) => {
                    const updateRegData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() })) as RegistrationReportByID[]
                    setRegReport(updateRegData)
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
        <ReportMetadataContext.Provider value={{data, regData, setRegReport, setReport: setData}}>
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