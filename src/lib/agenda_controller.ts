import { Firestore, addDoc, DocumentData, DocumentSnapshot, QueryDocumentSnapshot, deleteDoc, getDoc, updateDoc, setDoc, doc, arrayUnion, getDocs, query, orderBy, limit, where, collection, getFirestore, getCountFromServer, serverTimestamp, Timestamp, increment } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadString, getStorage, deleteObject } from 'firebase/storage'
import { storage, app } from './firebase'
import Swal from 'sweetalert2'
import { firestore } from './controller'
import { Reminder_Agenda, Add_Reminder} from '@/types/agendas';

export const agendas = collection(firestore, 'agendas')

export const getAgendaByReminderType = async (): Promise<Reminder_Agenda[]> => {
    try{
        const agenda = query(agendas, orderBy('createdAt', 'desc'))
        const querySnapshot = await(getDocs(agenda))
        const data: Reminder_Agenda[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as Reminder_Agenda;
                docData.id = doc.id;
                data.push(docData)
            })
            data.sort((a, b) => {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            })
            return data
        }else{
            return data
        }
    }catch(error){
        throw error
    }
}

export const addReminder = async (agenda: Add_Reminder) => {
    try{
        await addDoc(collection(firestore, 'agendas'), agenda)
        return true
    }catch(error){
        return false
    }
}

export const deleteAgenda = async () => {

}

export const completeAgenda = async (id: string) => {
    try{
        const completeStatus = {
            status: true
        }
        const getDoc = doc(firestore, `agendas/${id}`)
        await setDoc(getDoc, completeStatus, {merge: true})
        return true
    }catch(error){
        throw error
    }
}