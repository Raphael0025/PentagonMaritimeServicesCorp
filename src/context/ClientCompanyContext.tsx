'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ClientCompanyByID, ClientLinksByID, ClientContactsByID, CompanyCourseCodesByID, CompanyChargeByID } from '@/types/client_company'
import { firestore } from '@/lib/controller'
import { getClients, getContacts, getLinks, GetCompanyCharge, GetCourseCodes } from '@/lib/client-controller'
import { collection, query, onSnapshot } from 'firebase/firestore';

interface ClientContextType{
    data: ClientCompanyByID[] | null;
    links: ClientLinksByID[] | null;
    contacts: ClientContactsByID[] | null;
    companyCharge: CompanyChargeByID[] | null
    courseCodes: CompanyCourseCodesByID[] | null
    setClient: React.Dispatch<React.SetStateAction<ClientCompanyByID[] | null>>;
}

const ClientContext = createContext<ClientContextType>({data: null, links: null, contacts: null, companyCharge: null, courseCodes: null, setClient: () => {}})
interface ClientProviderProps{
    children: ReactNode
}

export const ClientProvider: React.FC<ClientProviderProps>= ({children}) => {
    const [data, setData] = useState<ClientCompanyByID[] | null>(null)
    const [links, setDataLink] = useState<ClientLinksByID[] | null>(null)
    const [contacts, setContacts] = useState<ClientContactsByID[] | null>(null)
    const [companyCharge, setCompanyCharge] = useState<CompanyChargeByID[] | null>(null)
    const [courseCodes, setCourseCodes] = useState<CompanyCourseCodesByID[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const initData = await getClients();
                setData(initData)

                const initLinkData = await getLinks();
                setDataLink(initLinkData)
                
                const initContact = await getContacts();
                setContacts(initContact)
                
                const initCC = await GetCompanyCharge();
                setCompanyCharge(initCC)
                
                const initCourseCodes = await GetCourseCodes();
                setCourseCodes(initCourseCodes)

                const clientRef = collection(firestore, 'client_company');
                const orderedQuery = query(clientRef);
                const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as ClientCompanyByID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setData(updatedData)
                });
               
                const linkRef = collection(firestore, 'client_links');
                const orderedQuery2 = query(linkRef);
                const unsubscribe2 = onSnapshot(orderedQuery2, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as ClientLinksByID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setDataLink(updatedData)
                });
               
                const contactRef = collection(firestore, 'client_contacts');
                const orderedQuery3 = query(contactRef);
                const unsubscribe3 = onSnapshot(orderedQuery3, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as ClientContactsByID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setContacts(updatedData)
                });

                const ccRef = collection(firestore, 'companyCharges');
                const orderedQuery4 = query(ccRef);
                const unsubscribe4 = onSnapshot(orderedQuery4, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as CompanyChargeByID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setCompanyCharge(updatedData)
                });

                const courseRef = collection(firestore, 'courseCodes');
                const orderedQuery5 = query(courseRef);
                const unsubscribe5 = onSnapshot(orderedQuery5, (snapshot) => {
                    const updatedData = snapshot.docs.map(doc => {
                        const data = doc.data() as CompanyCourseCodesByID;
                        return { ...data, id: doc.id }; // Ensure id is correctly assigned
                    })
                    setCourseCodes(updatedData)
                });

                // Cleanup subscription on unmount
                return () => {
                    unsubscribe();
                    unsubscribe2();
                    unsubscribe3();
                    unsubscribe4();
                    unsubscribe5();
                };
            } catch(error){
                throw error
            } 
        };
        fetchData();
    }, []);
    return(
        <ClientContext.Provider value={{data, links, contacts, companyCharge, courseCodes, setClient: setData,}}>
            { children }
        </ClientContext.Provider>
    )
}

export const useClients = () => {
    const context = useContext(ClientContext)
    if(context === undefined) {
        throw new Error('useClients must be used within a Client Provider')
    }
    return context
}