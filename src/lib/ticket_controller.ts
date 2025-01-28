import { addDoc, deleteDoc, updateDoc, doc, getDocs, query, orderBy, collection, getFirestore, serverTimestamp, Timestamp, DocumentReference } from 'firebase/firestore'
import { TICKET_BY_ID, TICKET } from '@/types/utils'
import { app } from './firebase'
import { addLog } from '@/lib/history_log_controller'
import { generateTicketID, } from '@/handlers/util_handler'

export const firestore = getFirestore(app)

export const ticketCollection = collection(firestore, 'TICKETS')

export const UpdateTicket = async (id: string, val: number, type: string) => {
    try{
        const ticketRef = doc(firestore, 'TICKETS', id);

        // Dynamically build the update object
        const updateField = { [type]: val };

        // Update Firestore document
        await updateDoc(ticketRef, updateField);
    }catch(error){
        throw error
    }
}

export const AddTicket = async (issue: string, subject: string, actor: string | null) => {
    try{
        const ticketDesc = {
            status: 3,
            prio: 0,
            actor,
            title: subject,
            issue,
            category: 0,
            createdAt: Timestamp.now(),
            ticket_id: generateTicketID()
        }
        await addDoc(ticketCollection, ticketDesc)
    }catch(error){
        throw error
    }
}

export const GetTickets = async (): Promise<TICKET_BY_ID[]> => {
    try{
        const ticketQuery = query(ticketCollection, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(ticketQuery)
        const data: TICKET_BY_ID[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as TICKET_BY_ID
                docData.id = doc.id 
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}