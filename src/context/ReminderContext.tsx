'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getAgendaByReminderType } from '@/lib/agenda_controller'
import { firestore } from '@/lib/controller'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { Reminder_Agenda } from '@/types/agendas';

interface ReminderContextType {
    data: Reminder_Agenda[] | null;
    setReminder: React.Dispatch<React.SetStateAction<Reminder_Agenda[] | null>>
}

const ReminderContext = createContext<ReminderContextType>({data: null, setReminder: () => {}, })

interface ReminderProviderProps {
    children: ReactNode
}

export const ReminderProvider: React.FC<ReminderProviderProps> = ({children}) => {
    const [data, setData] = useState<Reminder_Agenda[] | null>(null)
    
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await getAgendaByReminderType()
                setData(initData)
                const agendas_ref = collection(firestore, 'agendas')
                const orderedQuery = query(agendas_ref, orderBy('createdAt', 'desc'))
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reminder_Agenda[]
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
    return(
        <ReminderContext.Provider value={{data, setReminder: setData}}>
            {children}
        </ReminderContext.Provider>
    )
}

export const useReminders = () => {
    const context = useContext(ReminderContext)
    if(context === undefined){
        throw new Error('useReminders must be within a Provider')
    }
    return context
}