import { addDoc, deleteDoc, getDoc, updateDoc, setDoc, doc, getDocs, query, orderBy, where, collection, serverTimestamp, Timestamp,} from 'firebase/firestore'
import { firestore } from './controller'
import { addLog } from '@/lib/history_log_controller'

import { CommunicaitonsByID, Communicaitons } from '@/types/communication'

export const communications = collection(firestore, 'COMMUNICATIONS')

export const SAVE_NOTIF_MESSAGE = async (newComms: Communicaitons) => {
    try{
        const newCommunicationData = {
            ...newComms,
            read: false,
            read_at: Timestamp.now(),
            createdAt: Timestamp.now()
        }
        await addDoc(communications, newCommunicationData)
    }catch(error){
        console.error('Error adding notification message: ', error)
    }
}

export const UPDATE_READ_MESSAGE = async (commID: string) => {
    try{
        const commRef = doc(firestore, 'COMMUNICATIONS', commID)
        await updateDoc(commRef, {
            read: true,
            read_at: Timestamp.now(),
        })
    }catch(error){
        console.error('Error updating read message: ', error)
    }
}

export const DELETE_MESSAGE = async (commID: string) => {
    try{
        const roleRef = doc(firestore, `COMMUNICATIONS/${commID}`)
        await deleteDoc(roleRef)
    }catch(error){
        console.error('Error updating read message: ', error)
    }
}

// Get All Company User Accounts
export const GET_MESSAGES = async (): Promise<CommunicaitonsByID[]> => {
    try{
        const comms = query(communications)
        const querySnapshot = await getDocs(comms)
        const data: CommunicaitonsByID[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as CommunicaitonsByID
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

// 