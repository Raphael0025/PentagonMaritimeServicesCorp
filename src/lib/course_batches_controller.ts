import { addDoc, deleteDoc, DocumentReference, updateDoc, arrayUnion, doc, getDocs, query, collection, getFirestore, Timestamp } from 'firebase/firestore'
import { app } from './firebase'
import { CourseBatch, BDCourseBatch, BDCourseBatchByID, CourseBatchByID } from '@/types/course-batches'
import { addLog } from '@/lib/history_log_controller'

import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage'
import { storage } from './firebase'

export const firestore = getFirestore(app)
// Course batches Collection
export const courseBatches = collection(firestore, 'BATCH_RECORDS')
export const bdCourseBatches = collection(firestore, 'BD_BATCH_RECORDS')

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

export const GENERATE_BD_BATCH = async (batch_record: BDCourseBatch) => {
    try{
        const newBatch = { ...batch_record, createdAt: Timestamp.now() }
        const batchID: DocumentReference = await addDoc(bdCourseBatches, {...newBatch})
        //await addLog(actor, 'New Batch Created', 'BATCHES', batchID.id)
        return batchID.id
    }catch(error){
        throw error
    }
}

export const scannedAttachment = async (BATCH_ID: string, attachmentType: string, course: string, batch_remarks: string, file: any, fileID: string) => {
    try{
        let scanned = '';

        if (fileID !== 'No file chosen yet...') {
            // Upload valid id to Storage
            // attachment Type: attendance | CCR
            const idRef = ref(storage, `BATCH_ATTACHMENTS/${attachmentType}/${course}/${fileID}`);
            const id_data = await uploadBytes(idRef, file[0]);
            scanned = await getDownloadURL(id_data.ref);
        }
        const getDoc = doc(firestore, `BATCH_RECORDS/${BATCH_ID}`)
        switch(attachmentType){
            case 'attendance':
                await updateDoc(getDoc, { attendance: scanned, remarks: batch_remarks})
                break;
            case 'ccr':
                await updateDoc(getDoc, { ccr: scanned, remarks: batch_remarks})
                break;
            default:                 
                break;
        }
    }catch(error){
        throw error
    }
}

export const UPDATE_BD_BATCH = async (batch_id: string, updateBatchDoc: Partial<BDCourseBatch>) => {
    try{
        const batchRef = doc(firestore, 'BD_BATCH_RECORDS', batch_id)
        const newBatchRecord = {
            ...updateBatchDoc,
            updateAt: Timestamp.now()
        }
        await updateDoc(batchRef, newBatchRecord)
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

export const UPDATE_BATCH_ID = async (batch_id: string, updateBatchDoc: Partial<CourseBatchByID>, actor: string | null) => {
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

export const FETCH_BD_BATCHES = async () => {
    try{
        const batchQuery = query(bdCourseBatches)
        const qSnapshot = await getDocs(batchQuery)
        const data: BDCourseBatchByID[] = []

        if(!qSnapshot.empty){
            qSnapshot.forEach((doc) => {
                const docData = doc.data() as BDCourseBatchByID
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
