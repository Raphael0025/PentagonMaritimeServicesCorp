'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TRANSMITTAL} from '@/types/certification'
import { firestore } from '@/lib/controller'
import { GET_TRANSMITTAL } from '@/lib/certification_controller'
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface TransmittalContextType {
    data: TRANSMITTAL[] | null;
    setCerts: React.Dispatch<React.SetStateAction<TRANSMITTAL[] | null>>;
}

const TransmittalContext = createContext<TransmittalContextType>({data: null, setCerts: () => {}})

interface TransmittalProvderProps {
    children: ReactNode;
}

export const TransmittalProvider: React.FC<TransmittalProvderProps>= ({ children }) => {
    const [data, setData] = useState<TRANSMITTAL[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await GET_TRANSMITTAL();
                setData(initData)

                const t_Controller = collection(firestore, 'TRANSMITTALS')
                const allTrainingQuery = query(t_Controller)

                const unsubscribe = onSnapshot(allTrainingQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TRANSMITTAL[];
                    setData(updatedData);
                });
                // Cleanup subscription on unmount
                return () => {
                    unsubscribe();
                };
            } catch(error){
                throw error
            } 
        }
        fetchData()
    }, [])
    
    return (
        <TransmittalContext.Provider value={{data, setCerts: setData}}>
            { children }
        </TransmittalContext.Provider>
    )
}

export const useTransmittal = () => {
    const context = useContext(TransmittalContext)
    if(context === undefined) {
        throw new Error('useTransmittal must be used within a TransmittalProvider')
    }
    return context
}