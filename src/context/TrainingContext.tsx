'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TRAINING_BY_ID} from '@/types/trainees'
import { firestore } from '@/lib/controller'
import { getTrainingData } from '@/lib/trainee_controller'
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface TrainingContextType {
    data: TRAINING_BY_ID[] | null;
    setTraining: React.Dispatch<React.SetStateAction<TRAINING_BY_ID[] | null>>;
    setMonth: React.Dispatch<React.SetStateAction<number>>;
    setYear: React.Dispatch<React.SetStateAction<number>>;
}

const TrainingContext = createContext<TrainingContextType>({data: null, setTraining: () => {}, setMonth: () => {}, setYear: () => {}})

interface TrainingProvderProps {
    children: ReactNode;
}

export const TrainingProvider: React.FC<TrainingProvderProps>= ({ children }) => {
    const [data, setData] = useState<TRAINING_BY_ID[] | null>(null)
    const [month, setMonth] = useState<number>(0)
    const [year, setYear] = useState<number>(0)
    
    useEffect(() => {
        const currentDate = new Date();
        setMonth(currentDate.getMonth() + 1); // Get current month (1-based)
        setYear(currentDate.getFullYear());
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try{
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59);

                const initData = await getTrainingData(month, year);
                setData(initData);
                const registrationRef = collection(firestore, 'TRAINING');
                const filteredQuery = query(
                    registrationRef,
                    where("date_enrolled", ">=", startDate),  // Ensure month matches
                    where("date_enrolled", "<=", endDate)     // Ensure year matches
                )
                const unsubscribe = onSnapshot(filteredQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TRAINING_BY_ID[];
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
        if (month > 0 && year > 0) {  // Ensure valid values
            fetchData();
        }
    }, [month, year])
    
    return (
        <TrainingContext.Provider value={{data, setTraining: setData, setMonth, setYear}}>
            { children }
        </TrainingContext.Provider>
    )
}

export const useTraining = () => {
    const context = useContext(TrainingContext)
    if(context === undefined) {
        throw new Error('useTraining must be used within a TrainingProvider')
    }
    return context
}