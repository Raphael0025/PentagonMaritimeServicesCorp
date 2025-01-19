'use client'

import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { GetAllCompanyUsers } from '@/types/company_users'
import { getAllCompanyUsers } from '@/lib/company_user_controller'
import { firestore } from '@/lib/controller'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

interface CompanyUserContextType {
    data: GetAllCompanyUsers[] | null;
    setCompanyUsers: React.Dispatch<React.SetStateAction<GetAllCompanyUsers[] | null>>
}

const CompanyUserContext = createContext<CompanyUserContextType>({data: null, setCompanyUsers: () => {}, })

interface CompanyUserProviderProps {
    children: ReactNode
}

export const CompanyUserProvider: React.FC<CompanyUserProviderProps> = ({children}) => {
    const [data, setData] = useState<GetAllCompanyUsers[] | null>(null)
    
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await getAllCompanyUsers()
                setData(initData)
                const company_users_ref = collection(firestore, 'company_users')
                const orderedQuery = query(company_users_ref, orderBy('candidate_added', 'desc'))
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GetAllCompanyUsers[]
                    setData(updatedData)
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
    const router = useRouter();

    // Function to remove custom token from local storage
    const removeTokenFromLocalStorage = () => {
        localStorage.removeItem('customToken');
        localStorage.removeItem('pfpToken');
    };

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | undefined;

        const removeTokenAt8PM = () => {
            const now = new Date();
            const targetTime = new Date(now);
            targetTime.setHours(17, 0, 0, 0); // Set the target time to 6:00 PM
            
            const timeUntil6PM = targetTime.getTime() - now.getTime();
            
            if (timeUntil6PM > 0) {
                timeoutId = setTimeout(() => {
                    router.push('/login')
                    removeTokenFromLocalStorage()
                }, timeUntil6PM);
            }
        };

        removeTokenAt8PM();

        // Cleanup: Clear the timeout when component unmounts
        return () => {
            clearTimeout(timeoutId);
        };
    }, [])
    return(
        <CompanyUserContext.Provider value={{data, setCompanyUsers: setData}}>
            {children}
        </CompanyUserContext.Provider>
    )
}

export const useCompanyUsers = () => {
    const context = useContext(CompanyUserContext)
    if(context === undefined){
        throw new Error('useCompanyUsers must be within a Provider')
    }
    return context
}