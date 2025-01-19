'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TRAINEE_BY_ID } from '@/types/trainees'
import { getAllTrainees, firestore } from '@/lib/trainee_controller'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface TraineeContextType {
    data: TRAINEE_BY_ID[] | null;
    setFullTraineeInfo: React.Dispatch<React.SetStateAction<TRAINEE_BY_ID[] | null>>;
    traineeLoading: boolean;
    setTraineeLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const TraineeContext = createContext<TraineeContextType>({data: null, setFullTraineeInfo: () => {}, traineeLoading: true, setTraineeLoading: () => {}})

interface TraineeProviderProps {
    children: ReactNode;
}

export const TraineeProvider: React.FC<TraineeProviderProps>= ({ children }) => {
    const [data, setData] = useState<TRAINEE_BY_ID[] | null>(null)
    const [traineeLoading, setTraineeLoading] = useState<boolean>(true)
    useEffect(() => {
        const fetchData = async () => {
            setTraineeLoading(true)
            try{
                const initData = await getAllTrainees();
                setData(initData);
                const enrolleesRef = collection(firestore, 'TRAINEES');
                const orderedQuery = query(enrolleesRef, orderBy('createdAt', 'desc'));
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TRAINEE_BY_ID[];
                    setData(updatedData);
                });
                // Cleanup subscription on unmount
                return () => {
                    unsubscribe();
                };
            } catch(error){
                throw error
            } finally {
                setTraineeLoading(false)
            }
        };
        fetchData();
    }, []);
    return (
        <TraineeContext.Provider value={{data, setFullTraineeInfo: setData, traineeLoading, setTraineeLoading}}>
            { children }
        </TraineeContext.Provider>
    )
}

export const useTrainees = () => {
    const context = useContext(TraineeContext)
    if(context === undefined) {
        throw new Error('useTrainee mustbe used within a TraineeProvider')
    }
    return context
}