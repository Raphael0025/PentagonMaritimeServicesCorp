'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { RanksByID } from '@/types/type'
import { firestore } from '@/lib/controller'
import { GetRanks } from '@/lib/type-controller'
import { collection, query, onSnapshot } from 'firebase/firestore';

interface RankContextType {
    data: RanksByID[] | null;
    setType: React.Dispatch<React.SetStateAction<RanksByID[] | null>>;
}

const RankContext = createContext<RankContextType>({data: null, setType: () => {}})

interface RankProviderProps {
    children: ReactNode;
}

export const RankProvider: React.FC<RankProviderProps>= ({ children }) => {
    const [data, setData] = useState<RanksByID[] | null>(null)
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await GetRanks();
                setData(initData)
                const RankRef = collection(firestore, 'Rank_Catalog');
                // Create a query with ordering by trainee_added field in descending order
                const orderedQuery = query(RankRef);
                // Set up Firestore listener for real-time updates
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as RanksByID;
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
    return (
        <RankContext.Provider value={{data, setType: setData,}}>
            { children }
        </RankContext.Provider>
    )
}

export const useRank = () => {
    const context = useContext(RankContext)
    if(context === undefined) {
        throw new Error('useRank must be used within a RankProvider')
    }
    return context
}