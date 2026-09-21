'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/controller'
import { RoleWithID } from '@/types/company_users'
import { GET_ROLES} from '@/lib/company_user_controller'

interface UserRoleContextType {
    data: RoleWithID[] | null;
    setRoles: React.Dispatch<React.SetStateAction<RoleWithID[] | null>>;
}

const UserRoleContext = createContext<UserRoleContextType>({data: null, setRoles: () => {}})

interface UserRoleProviderProps {
    children: ReactNode;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps>= ({ children }) => {
    const [data, setData] = useState<RoleWithID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await GET_ROLES();
                setData(initData)

                const typeRef = collection(firestore, 'USER_ROLES');
                const orderedQuery = query(typeRef);
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as RoleWithID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setData(updatedData)
                })
                
                return () => {
                    unsubscribe()
                };
            } catch(error){
                throw error
            } 
        };
        fetchData();
    }, []);
    return (
        <UserRoleContext.Provider value={{data, setRoles: setData,}}>
            { children }
        </UserRoleContext.Provider>
    )
}

export const useRoles = () => {
    const context = useContext(UserRoleContext)
    if(context === undefined) {
        throw new Error('userRoles must be used within a UserRoleProvider')
    }
    return context
}