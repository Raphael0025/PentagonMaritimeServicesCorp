'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { HistoryLogWithID } from '@/types/utils'
import { getLogs, firestore } from '@/lib/history_log_controller'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';


interface HistoryLogContextType {
    data: HistoryLogWithID[] | null;
    setLog: React.Dispatch<React.SetStateAction<HistoryLogWithID[] | null>>;
}

const HistoryLogContext = createContext<HistoryLogContextType>({data: null, setLog: () => {} })

interface HistoryLogProviderProps {
    children: ReactNode;
}

export const HistoryLogProvider: React.FC<HistoryLogProviderProps>= ({ children }) => {
    const [data, setData] = useState<HistoryLogWithID[] | null>(null)
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await getLogs();
                setData(initData);
                const historyLogRef = collection(firestore, 'history_log');
                // Create a query with ordering by HistoryLog_added field in descending order
                const orderedQuery = query(historyLogRef);
                // Set up Firestore listener for real-time updates
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HistoryLogWithID[];
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
        <HistoryLogContext.Provider value={{data, setLog: setData}}>
            { children }
        </HistoryLogContext.Provider>
    )
}

export const useHistoryLogs = () => {
    const context = useContext(HistoryLogContext)
    if(context === undefined) {
        throw new Error('useHistoryLog mustbe used within a HistoryLogProvider')
    }
    return context
}