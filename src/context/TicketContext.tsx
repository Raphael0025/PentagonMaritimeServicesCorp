'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { GetTickets, firestore } from '@/lib/ticket_controller'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { TICKET_BY_ID } from '@/types/utils';

interface TicketContextType {
    data: TICKET_BY_ID[] | null;
    setTicket: React.Dispatch<React.SetStateAction<TICKET_BY_ID[] | null>>
}

const TicketContext = createContext<TicketContextType>({data: null, setTicket: () => {}, })

interface TicketProviderProps {
    children: ReactNode
}

export const TicketProvider: React.FC<TicketProviderProps> = ({children}) => {
    const [data, setData] = useState<TICKET_BY_ID[] | null>(null)
    
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await GetTickets()
                setData(initData)
                const ticket_ref = collection(firestore, 'TICKETS')
                const orderedQuery = query(ticket_ref, orderBy('createdAt', 'desc'))
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TICKET_BY_ID[]
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
        <TicketContext.Provider value={{data, setTicket: setData}}>
            {children}
        </TicketContext.Provider>
    )
}

export const useTickets = () => {
    const context = useContext(TicketContext)
    if(context === undefined){
        throw new Error('useTickets must be within a Provider')
    }
    return context
}