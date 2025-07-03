import { addDoc, deleteDoc, DocumentReference, updateDoc, doc, getDocs, query, collection, getFirestore, Timestamp } from 'firebase/firestore'
import { app } from './firebase'
import { CourseBatch, CourseBatchByID } from '@/types/course-batches'
import { addLog } from '@/lib/history_log_controller'

export const firestore = getFirestore(app)
// Course batches Collection
export const courseBatches = collection(firestore, 'BATCH_RECORDS')

export const GENERATE_BATCH = async (batch_record: CourseBatch, actor: string | null) => {
    try{
        const newBatch = { ...batch_record, time_duration: '', room: '', remarks: '', instructor: '', training_mode: '', createdAt: Timestamp.now(), updateAt: Timestamp.now() }
        const batchID: DocumentReference = await addDoc(courseBatches, {...newBatch})
        //await addLog(actor, 'New Batch Created', 'BATCHES', batchID.id)
        return batchID.id
    }catch(error){
        throw error
    }
}

export const UPDATE_BATCH = async (batch_id: string, updateBatchDoc: Partial<CourseBatch>, actor: string | null) => {
    try{
        const batchRef = doc(firestore, 'BATCH_RECORDS', batch_id)
        const newBatchRecord = {
            ...updateBatchDoc,
            updateAt: Timestamp.now()
        }
        await updateDoc(batchRef, newBatchRecord)
    }catch(error){
        throw error
    }
}

export const DELETE_BATCH = async (batch_id: string, actor: string | null) => {
    try{
        const batch: DocumentReference = doc(firestore, 'BATCH_RECORDS', batch_id)
        await deleteDoc(batch)
        
        //await addLog(actor, 'Batch Record Deleted', 'BATCH_RECORDS', id)
    }catch(error){
        throw error
    }
}

export const FETCH_BATCHES = async () => {
    try{
        const batchQuery = query(courseBatches)
        const qSnapshot = await getDocs(batchQuery)
        const data: CourseBatchByID[] = []

        if(!qSnapshot.empty){
            qSnapshot.forEach((doc) => {
                const docData = doc.data() as CourseBatchByID
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
