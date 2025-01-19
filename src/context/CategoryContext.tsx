'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CatalogTypeById } from '@/types/type'
import { firestore } from '@/lib/controller'
import { GetCategories } from '@/lib/type-controller'
import { collection, query, onSnapshot } from 'firebase/firestore';

interface CategoryContextType {
    data: CatalogTypeById[] | null;
    setType: React.Dispatch<React.SetStateAction<CatalogTypeById[] | null>>;
}

const CategoryContext = createContext<CategoryContextType>({data: null, setType: () => {}})

interface CategoryProviderProps {
    children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps>= ({ children }) => {
    const [data, setData] = useState<CatalogTypeById[] | null>(null)
    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await GetCategories();
                setData(initData)
                const CategoryRef = collection(firestore, 'Category_Catalog');
                // Create a query with ordering by trainee_added field in descending order
                const orderedQuery = query(CategoryRef);
                // Set up Firestore listener for real-time updates
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as CatalogTypeById;
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
        <CategoryContext.Provider value={{data, setType: setData,}}>
            { children }
        </CategoryContext.Provider>
    )
}

export const useCategory = () => {
    const context = useContext(CategoryContext)
    if(context === undefined) {
        throw new Error('useCategory must be used within a CategoryProvider')
    }
    return context
}