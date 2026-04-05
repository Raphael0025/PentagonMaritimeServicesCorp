'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TRAINING_BY_ID} from '@/types/trainees'
import { firestore } from '@/lib/controller'
import { getTrainingData } from '@/lib/trainee_controller'
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface TrainingContextType {
    data: TRAINING_BY_ID[] | null;
    allData: TRAINING_BY_ID[] | null;
    prevData: TRAINING_BY_ID[] | null;
    setTraining: React.Dispatch<React.SetStateAction<TRAINING_BY_ID[] | null>>;
    setMonth: React.Dispatch<React.SetStateAction<number>>;
    setYear: React.Dispatch<React.SetStateAction<number>>;
}

const TrainingContext = createContext<TrainingContextType>({data: null, allData: null, prevData: null, setTraining: () => {}, setMonth: () => {}, setYear: () => {}})

interface TrainingProvderProps {
    children: ReactNode;
}

export const TrainingProvider: React.FC<TrainingProvderProps>= ({ children }) => {
    const [data, setData] = useState<TRAINING_BY_ID[] | null>(null)
    const [allData, setAllData] = useState<TRAINING_BY_ID[] | null>(null)
    const [prevData, setPrevData] = useState<TRAINING_BY_ID[] | null>(null)
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
    const [year, setYear] = useState<number>(new Date().getFullYear())
    
    useEffect(() => {
        const currentDate = new Date();
        setMonth(currentDate.getMonth() + 1); // Get current month (1-based)
        setYear(currentDate.getFullYear());
    }, [])

    useEffect(() => {
        // const fetchData = async () => {
            try{
                // current month
                const startDate = new Date(year, month - 2, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59);
                // previous month
                // previous month range
                const prevMonth = month === 1 ? 12 : month - 1
                const prevYear = month === 1 ? year - 1 : year
                const prevStart = new Date(prevYear, prevMonth - 1, 1)
                const prevEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59)
                // const initData = await getTrainingData(month, year);
                // setData(initData);
                const trainingRef = collection(firestore, 'TRAINING');
                const currentMonthQuery = query(
                    trainingRef,
                    where("date_enrolled", ">=", startDate),  // Ensure month matches
                    where("date_enrolled", "<=", endDate)     // Ensure year matches
                )

                const prevMonthQuery = query(
                    trainingRef,
                    where("date_enrolled", ">=", prevStart),  // Ensure month matches
                    where("date_enrolled", "<=", prevEnd)     // Ensure year matches
                )

                const allTrainingQuery = query(trainingRef)

                const unsubscribe = onSnapshot(currentMonthQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TRAINING_BY_ID[];
                    setData(updatedData);
                });
                const unsubscribeAllData = onSnapshot(allTrainingQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TRAINING_BY_ID[];
                    setAllData(updatedData);
                });
                const unsubscribePrevData = onSnapshot(prevMonthQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TRAINING_BY_ID[];
                    setPrevData(updatedData);
                });
                // Cleanup subscription on unmount
                return () => {
                    unsubscribe();
                    unsubscribeAllData();
                    unsubscribePrevData();
                };
            } catch(error){
                throw error
            } 
    }, [month, year])
    
    return (
        <TrainingContext.Provider value={{data, allData, prevData, setTraining: setData, setMonth, setYear}}>
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