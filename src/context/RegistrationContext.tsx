'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { REGISTRATION_BY_ID} from '@/types/trainees'
import { firestore } from '@/lib/controller'
import { getRegistrationData } from '@/lib/trainee_controller'
import { collection, query, onSnapshot } from 'firebase/firestore';

interface RegistrationContextType {
    data: REGISTRATION_BY_ID[] | null;
    setRegistrations: React.Dispatch<React.SetStateAction<REGISTRATION_BY_ID[] | null>>;
}

const RegistrationContext = createContext<RegistrationContextType>({data: null, setRegistrations: () => {}})

interface RegistrationProvderProps {
    children: ReactNode;
}

export const RegistrationProvider: React.FC<RegistrationProvderProps>= ({ children }) => {
    const [data, setData] = useState<REGISTRATION_BY_ID[] | null>(null)
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await getRegistrationData();
                setData(initData);
                const registrationRef = collection(firestore, 'REGISTRATION');
                const orderedQuery = query(registrationRef);
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as REGISTRATION_BY_ID[];
                    setData(updatedData);
                });
                // Cleanup subscription on unmount
                return () => {
                    unsubscribe();
                };
            } catch(error){
                throw error
            } 
        };
        fetchData();
    }, []);
    return (
        <RegistrationContext.Provider value={{data, setRegistrations: setData}}>
            { children }
        </RegistrationContext.Provider>
    )
}

export const useRegistrations = () => {
    const context = useContext(RegistrationContext)
    if(context === undefined) {
        throw new Error('useRegistrations must be used within a RegistrationProvider')
    }
    return context
}