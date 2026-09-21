'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CERTIFICATION_BY_ID} from '@/types/certification'
import { firestore } from '@/lib/controller'
import { GET_CERT_TEMPLATE } from '@/lib/certification_controller'
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface CertificationContextType {
    data: CERTIFICATION_BY_ID[] | null;
    setCerts: React.Dispatch<React.SetStateAction<CERTIFICATION_BY_ID[] | null>>;
}

const CertificationContext = createContext<CertificationContextType>({data: null, setCerts: () => {}})

interface CertificationProvderProps {
    children: ReactNode;
}

export const CertificationProvider: React.FC<CertificationProvderProps>= ({ children }) => {
    const [data, setData] = useState<CERTIFICATION_BY_ID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await GET_CERT_TEMPLATE();
                setData(initData)

                const certificateController = collection(firestore, 'CERTIFICATE_CONTROL')
                const allTrainingQuery = query(certificateController)

                const unsubscribe = onSnapshot(allTrainingQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CERTIFICATION_BY_ID[];
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
        <CertificationContext.Provider value={{data, setCerts: setData}}>
            { children }
        </CertificationContext.Provider>
    )
}

export const useCertification = () => {
    const context = useContext(CertificationContext)
    if(context === undefined) {
        throw new Error('useCertification must be used within a CertificationProvider')
    }
    return context
}