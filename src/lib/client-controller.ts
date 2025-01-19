import { addDoc, deleteDoc, getDoc, updateDoc, setDoc, doc, getDocs, query, orderBy, where, collection, DocumentReference, serverTimestamp, Timestamp,} from 'firebase/firestore'
import { firestore } from './controller'
import { ClientCompany, ClientCompanyByID, ClientLinks, CompanyCourseCodesByID, CompanyChargeByID, CompanyCharge, CompanyCourseCodes, ClientContacts, ClientLinksByID, ClientContactsByID } from '@/types/client_company'
import { addLog } from '@/lib/history_log_controller'

export const clientCompany = collection(firestore, 'client_company')
export const clientContacts = collection(firestore, 'client_contacts')
export const clientLinks = collection(firestore, 'client_links')
export const companyCharges = collection(firestore, 'companyCharges')
export const courseCodes = collection(firestore, 'courseCodes')

export const addCompanyCharge = async (companyCharge: CompanyCharge, actor: string | null) => {
    try{
        const newCharge = {
            ...companyCharge,
            createdAt: Timestamp.now()
        }
        const chargeID: DocumentReference = await addDoc(companyCharges, {...newCharge})
        await addLog(actor, 'Company Charge Added', 'companyCharge', chargeID.id)
    }catch(error){
        throw error
    }
}

export const UpdateCompanyCharge = async (id: string, newCompanyCharge: CompanyCharge, actor: string | null ) => {
    try{
        const clientRef = doc(firestore, 'companyCharges', id)
        await updateDoc(clientRef, {
            ...newCompanyCharge,  // Spread the updated client data
        })
        await addLog(actor, 'Company Charge Updated', 'companyCharges', id);
        return id;
    }catch(error){
        throw error
    }
}

export const GetCompanyCharge = async () => {
    try{
        const clientQuery = query(companyCharges, orderBy("createdAt", "desc"));
        const snapShot = await getDocs(clientQuery)
        const data:CompanyChargeByID[] = []
        if(!snapShot.empty){
            snapShot.forEach((doc) => {
                const docData = doc.data() as CompanyChargeByID
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
            })
            return data
        }else{
            return data
        }
    }catch(error){
        throw error
    }
}

export const GetCourseCodes = async () => {
    try{
        const clientQuery = query(courseCodes, orderBy("createdAt", "desc"));
        const snapShot = await getDocs(clientQuery)
        const data:CompanyCourseCodesByID[] = []
        if(!snapShot.empty){
            snapShot.forEach((doc) => {
                const docData = doc.data() as CompanyCourseCodesByID
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
            })
            return data
        }else{
            return data
        }
    }catch(error){
        throw error
    }
}

export const DeleteCompanyCharge = async (id: string) => {
    const clientWithID: DocumentReference = doc(firestore, 'companyCharges', id)
    await deleteDoc(clientWithID)
}

export const DeleteCourseCodes = async (id: string) => {
    const clientWithID: DocumentReference = doc(firestore, 'courseCodes', id)
    await deleteDoc(clientWithID)
}

export const addCourseCodes = async (courseCode: CompanyCourseCodes) => {
    try{
        const newCode = {
            ...courseCode,
            createdAt: Timestamp.now()
        }
        await addDoc(courseCodes, {...newCode})
    }catch(error){
        throw error
    }
}

export const updateClient = async (id: string, updatedClientInfo: ClientCompany, actor: string | null) => {
    try {
        // Reference to the specific client document in Firestore by ID
        const clientRef = doc(firestore, 'client_company', id);

        // Update the document with the new client data
        await updateDoc(clientRef, {
            ...updatedClientInfo,  // Spread the updated client data
        });

        await addLog(actor, 'Client Company Updated', 'client_company', id);
        return id;  // You could return the updated ID if needed

    } catch (error) {
        console.error('Error updating client: ', error);
        throw error;  // Re-throw the error for further handling
    }
};

export const addClient = async (clientInfo: ClientCompany, actor: string | null) => {
    try{
        const newClientInfo = {
            ...clientInfo,
            createdAt: Timestamp.now()
        }
        const clientWithID: DocumentReference = await addDoc(clientCompany, {...newClientInfo})
        await addLog(actor, 'Client Company Added', 'client_company', clientWithID.id)
        return clientWithID.id
    }catch(error){
        throw error
    }
}

export const deleteClient = async (id: string, actor: string | null) => {
    try{
        const clientWithID: DocumentReference = doc(firestore, 'client_company', id)
        await deleteDoc(clientWithID)
    }catch(error){
        throw error
    }
}

export const deleteContacts = async (id: string, actor: string | null) => {
    try{
        const clientWithID: DocumentReference = doc(firestore, 'client_contacts', id)
        await deleteDoc(clientWithID)
    }catch(error){
        throw error
    }
}

export const deleteLinks = async (id: string, actor: string | null) => {
    try{
        const clientWithID: DocumentReference = doc(firestore, 'client_links', id)
        await deleteDoc(clientWithID)
    }catch(error){
        throw error
    }
}

export const addContact = async (contact: ClientContacts, actor: string | null) => {
    try{
        const newData = {
            ...contact,
            dateAdded: Timestamp.now()
        }
        const clientContact = await addDoc(clientContacts, {...newData})
        await addLog(actor, 'Client Contact Added', 'client_contacts', clientContact.id)
        return true
    }catch(error){
        throw error
    }
}

export const addClientLink = async (link: ClientLinks, actor: string | null) => {
    try{
        const newData = {
            ...link,
            dateAdded: Timestamp.now()
        }
        const clientLink = await addDoc(clientLinks, {...newData})
        await addLog(actor, 'Client Link Added', 'client_links', clientLink.id)
        return true
    }catch(error){
        throw error
    }
}

export const getClients = async () => {
    try{
        const clientQuery = query(clientCompany, orderBy("createdAt", "desc"));
        const snapShot = await getDocs(clientQuery)
        const data:ClientCompanyByID[] = []
        if(!snapShot.empty){
            snapShot.forEach((doc) => {
                const docData = doc.data() as ClientCompanyByID
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
            })
            return data
        }else{
            return data
        }
    }catch(error){
        throw error
    }
}

export const getContacts = async () => {
    try{
        const clientQuery = query(clientContacts, orderBy("createdAt", "desc"));
        const snapShot = await getDocs(clientQuery)
        const data:ClientContactsByID[] = []
        if(!snapShot.empty){
            snapShot.forEach((doc) => {
                const docData = doc.data() as ClientContactsByID
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
            })
            return data
        }else{
            return data
        }
    }catch(error){
        throw error
    }
}

export const getLinks = async () => {
    try{
        const clientQuery = query(clientLinks, orderBy("dateAdded", "desc"));
        const snapShot = await getDocs(clientQuery)
        const data:ClientLinksByID[] = []
        if(!snapShot.empty){
            snapShot.forEach((doc) => {
                const docData = doc.data() as ClientLinksByID
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.dateAdded.toDate().getTime() - b.dateAdded.toDate().getTime();
            })
            return data
        }else{
            return data
        }
    }catch(error){
        throw error
    }
}
