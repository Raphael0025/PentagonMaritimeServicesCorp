'use client'
import React,{createContext, useContext, useEffect, useState, ReactNode} from 'react'
import { InstructorByID } from '@/types/instructor'
import {collection, query, onSnapshot} from 'firebase/firestore'
import { firestore, FETCH_INSTRUCTORS } from '@/lib/instructor_controller'

interface InstructorContextType{
    data: InstructorByID[] | null;
    setInstructors: React.Dispatch<React.SetStateAction<InstructorByID[] | null>>;
}

const InstructorContext = createContext<InstructorContextType>({data: null, setInstructors: () => {},})

interface InstructorProviderProps{
    children: ReactNode
}

export const InstructorProvider: React.FC<InstructorProviderProps>  = ({children}) => {
    const [data, setData] = useState<InstructorByID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await FETCH_INSTRUCTORS()
                setData(initData)
                const instructors = collection(firestore, 'INSTRUCTORS')
                const order_query = query(instructors)
                const unsubscribe = onSnapshot(order_query, (snapshot) => {
                    const updateData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() })) as InstructorByID[]
                    setData(updateData)
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
        <InstructorContext.Provider value={{data, setInstructors: setData}}>
            {children}
        </InstructorContext.Provider>
    )
}

export const useInstructors = () => {
    const context = useContext(InstructorContext)
    if(context === undefined){
        throw new Error('useInstructors must be used within a InstructorProvider')
    }
    return context
}