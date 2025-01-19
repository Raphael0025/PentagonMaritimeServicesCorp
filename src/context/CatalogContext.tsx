'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { firestore, GetCatalogDept } from '@/lib/controller'
import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore'
import { DEPARTMENT_ID, CATALOGUE_ID } from '@/types/utils'

const CatalogContext = createContext<{
    data: CATALOGUE_ID[] | null;
    department_catalog: DEPARTMENT_ID[] | null;
}>({data: null, department_catalog: null})

interface CatalogProviderProps{
    children: ReactNode;
}

export const CatalogProvider: React.FC<CatalogProviderProps> = ({children}) => {
    const [data, setData] = useState<CATALOGUE_ID[] | null>(null)
    const [department_catalog, setDC] = useState<DEPARTMENT_ID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const dcData = await GetCatalogDept()
            setDC(dcData)
            const departmentCatalogs = collection(firestore, 'Dept_Catalog')
            const orderedQuery = query(departmentCatalogs);
            // Set up Firestore listener for real-time updates
            const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DEPARTMENT_ID[];
                setDC(updatedData);
            })
            return () => {
                unsubscribe()
            }
        }
        fetchData()
    },[])

    return (
        <CatalogContext.Provider value={{data, department_catalog }}>
            { children }
        </CatalogContext.Provider>
    )
}

export const useCatalogs = () => {
    const context = useContext(CatalogContext)
    if(context === undefined) {
        throw new Error('useCatalogs must be used within a Catalog Provider')
    }
    return context
}