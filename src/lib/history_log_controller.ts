import { addDoc, getDocs, deleteDoc, where, query, collection, getFirestore } from 'firebase/firestore'
import { app } from './firebase'

import { getCurrentFormattedDateTime } from '@/types/handling'
import { HistoryLogWithID } from '@/types/utils'

export const firestore = getFirestore(app)

const historyLogs = collection(firestore, 'history_log')

export const addLog = async (actor: string | null, action: string, collection_ref: string, id_ref: string) => {
    try{
        const logWithDate = {
            actor,
            action,
            collection_ref,
            id_ref,
            date_created: getCurrentFormattedDateTime()
        }
        await addDoc(historyLogs, logWithDate)
    }catch(error){
        throw error
    }
}

export const deleteLog = async () => {
    try {

        // Create a query to find documents where collection_ref equals the given value
        const q = query(historyLogs, where("collection_ref", "==", 'courses'));

        // Get all documents matching the query
        const querySnapshot = await getDocs(q);

        // Delete each document found
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });

        console.log(`Deleted all history logs where collection_ref is courses.`);
    } catch (error) {
        console.error("Error deleting history logs: ", error);
    }
}

export const getLogs = async () => {
    try{
        const snapShot = await getDocs(historyLogs)
        const data: HistoryLogWithID[] =[]

        if(!snapShot.empty){
            snapShot.forEach((doc) => {
                const docData = doc.data() as HistoryLogWithID
                docData.id = doc.id
                data.push(docData)
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}