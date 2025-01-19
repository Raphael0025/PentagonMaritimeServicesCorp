'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TRAINING_BY_ID} from '@/types/trainees'
import { firestore } from '@/lib/controller'
import { getTrainingData } from '@/lib/trainee_controller'
import { collection, query, onSnapshot } from 'firebase/firestore';

interface TrainingContextType {
    data: TRAINING_BY_ID[] | null;
    setTraining: React.Dispatch<React.SetStateAction<TRAINING_BY_ID[] | null>>;
}

const TrainingContext = createContext<TrainingContextType>({data: null, setTraining: () => {}})

interface TrainingProvderProps {
    children: ReactNode;
}

export const TrainingProvider: React.FC<TrainingProvderProps>= ({ children }) => {
    const [data, setData] = useState<TRAINING_BY_ID[] | null>(null)
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await getTrainingData();
                setData(initData);
                const registrationRef = collection(firestore, 'TRAINING');
                const orderedQuery = query(registrationRef);
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
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
        fetchData();
    }, []);
    return (
        <TrainingContext.Provider value={{data, setTraining: setData}}>
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