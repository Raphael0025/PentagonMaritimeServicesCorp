'use client'

import React,{createContext, useContext, useEffect, useState, ReactNode} from 'react'
import { INQUIRIES_BY_ID } from '@/types/inquiries'
import {collection, query, onSnapshot} from 'firebase/firestore'
import { firestore, FETCH_INQUIRIES, } from '@/lib/inquiry_controller'

interface InquiriesContextType{
    data: INQUIRIES_BY_ID[] | null;
    setInquiries: React.Dispatch<React.SetStateAction<INQUIRIES_BY_ID[] | null>>;
}

const InquiriesContext = createContext<InquiriesContextType>({data: null, setInquiries: () => {}, })

interface InquiryProviderProps{
    children:ReactNode
}

export const InquiryProvider: React.FC<InquiryProviderProps> = ({children}) => {
    const [data, setData] = useState<INQUIRIES_BY_ID[] | null>(null)
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await FETCH_INQUIRIES()
                setData(initData ?? [])
                const inquiries = collection(firestore, 'INQUIRIES')
                const inquiry_query = query(inquiries)

                const unsubscribe = onSnapshot(inquiry_query, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as INQUIRIES_BY_ID[]
                    setData(updatedData)
                })
                return () => {
                    unsubscribe()
                }
            }catch(error){
                console.error(error)
            }
        } 
        fetchData()
    }, [])
    return(
        <InquiriesContext.Provider value={{ data, setInquiries: setData}}>
            {children}
        </InquiriesContext.Provider>
    )
}
export const useInquiries = () => {
    const context = useContext(InquiriesContext)
    if(context === undefined){
        throw new Error('useInquiry must  be within a Inquiry Provider')
    }
    return context
}