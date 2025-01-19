'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { TypeWithID, AREA_BY_ID, SUBAREA_BY_ID } from '@/types/type'
import { firestore } from '@/lib/controller'
import { GetTypes, FETCH_AREA, FETCH_SUB_AREA} from '@/lib/type-controller'
import { collection, query, onSnapshot } from 'firebase/firestore';

interface TypeContextType {
    data: TypeWithID[] | null;
    area: AREA_BY_ID[] | null;
    subArea: SUBAREA_BY_ID[] | null;
    setType: React.Dispatch<React.SetStateAction<TypeWithID[] | null>>;
}

const TypeContext = createContext<TypeContextType>({data: null, area: null, subArea: null, setType: () => {}})

interface TypeProviderProps {
    children: ReactNode;
}

export const TypeProvider: React.FC<TypeProviderProps>= ({ children }) => {
    const [data, setData] = useState<TypeWithID[] | null>(null)
    const [area, setArea] = useState<AREA_BY_ID[] | null>(null)
    const [subArea, setSubArea] = useState<SUBAREA_BY_ID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await GetTypes();
                setData(initData)

                const typeRef = collection(firestore, 'Type_Catalog');
                const orderedQuery = query(typeRef);
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as TypeWithID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setData(updatedData)
                })
                
                const initAreaData = await FETCH_AREA()
                setArea(initAreaData)

                const areaRef = collection(firestore, 'AREAS');
                const areaQuery = query(areaRef);
                const unsubscribe2 = onSnapshot(areaQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as AREA_BY_ID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setArea(updatedData)
                })
                
                const initSubAreaData = await FETCH_SUB_AREA()
                setSubArea(initSubAreaData)

                const subAreaRef = collection(firestore, 'SUB_AREA');
                const subAreaQuery = query(subAreaRef);
                const unsubscribe3 = onSnapshot(subAreaQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as SUBAREA_BY_ID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setSubArea(updatedData)
                })

                return () => {
                    unsubscribe()
                    unsubscribe2()
                    unsubscribe3()
                };
            } catch(error){
                throw error
            } 
        };
        fetchData();
    }, []);
    return (
        <TypeContext.Provider value={{data, area, subArea, setType: setData,}}>
            { children }
        </TypeContext.Provider>
    )
}

export const useTypes = () => {
    const context = useContext(TypeContext)
    if(context === undefined) {
        throw new Error('useTypes must be used within a TypeProvider')
    }
    return context
}