'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { REGISTRATION_BY_ID} from '@/types/trainees'
import { firestore } from '@/lib/controller'
import { getRegistrationData } from '@/lib/trainee_controller'
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface RegistrationContextType {
    data: REGISTRATION_BY_ID[] | null;
    setRegistrations: React.Dispatch<React.SetStateAction<REGISTRATION_BY_ID[] | null>>;
    setMonth: React.Dispatch<React.SetStateAction<number>>;
    setYear: React.Dispatch<React.SetStateAction<number>>;
}

const RegistrationContext = createContext<RegistrationContextType>({data: null, setRegistrations: () => {}, setMonth: () => {}, setYear: () => {}})

interface RegistrationProvderProps {
    children: ReactNode;
}

export const RegistrationProvider: React.FC<RegistrationProvderProps>= ({ children }) => {
    const [data, setData] = useState<REGISTRATION_BY_ID[] | null>(null)
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [year, setYear] = useState<number>(new Date().getFullYear())

    useEffect(() => {
        const fetchData = async () => {
            try{
                const startDate = new Date(year, month - 1, 1);
                console.log(startDate)
                const endDate = new Date(year, month, 0, 23, 59, 59);
                console.log(endDate)

                const initData = await getRegistrationData(month, year);
                setData(initData);
                const registrationRef = collection(firestore, 'REGISTRATION');
                const filteredQuery = query(
                    registrationRef,
                    where("date_registered", ">=", startDate),  // Ensure month matches
                    where("date_registered", "<=", endDate)     // Ensure year matches
                )
                const unsubscribe = onSnapshot(filteredQuery, (snapshot) => {
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
        }
        if (month > 0 && year > 0) {  // Ensure valid values
            fetchData();
        }
    }, [month, year])

    return (
        <RegistrationContext.Provider value={{data, setRegistrations: setData, setMonth, setYear}}>
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