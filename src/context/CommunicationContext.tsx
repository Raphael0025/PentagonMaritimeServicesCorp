'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CommunicaitonsByID } from '@/types/communication'
import { firestore } from '@/lib/controller'
import { GET_MESSAGES } from '@/lib/communications_controller'
import { collection, query, onSnapshot } from 'firebase/firestore';

interface CommsContextType{
    data: CommunicaitonsByID[] | null;
    setComms: React.Dispatch<React.SetStateAction<CommunicaitonsByID[] | null>>;
}

const CommunicationContext = createContext<CommsContextType>({data: null, setComms: () => {}})
interface CommsProviderProps{
    children: ReactNode
}

export const CommsProvider: React.FC<CommsProviderProps>= ({children}) => {
    const [data, setData] = useState<CommunicaitonsByID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await GET_MESSAGES();
                setData(initData)
                
                const commsRef = collection(firestore, 'COMMUNICATIONS');
                const orderedQuery = query(commsRef);
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as CommunicaitonsByID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setData(updatedData)
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
    return(
        <CommunicationContext.Provider value={{data, setComms: setData,}}>
            { children }
        </CommunicationContext.Provider>
    )
}

export const useComms = () => {
    const context = useContext(CommunicationContext)
    if(context === undefined) {
        throw new Error('useComms must be used within a Communication Provider')
    }
    return context
}