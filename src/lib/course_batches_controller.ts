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

export const scannedAttachment = async (BATCH_ID: string, attachmentType: string, course: string, batch_remarks: string, fileList: any) => {
    try {
        const filesArray = Array.from(fileList);
        if (filesArray.length === 0) return;

        // 1. Upload files concurrently (Storing only name and url)
        const uploadedAttachments = await Promise.all(
            filesArray.map(async (individualFile: any) => {
                const uniqueFileName = `${Date.now()}_${individualFile.name}`;
                const idRef = ref(storage, `BATCH_ATTACHMENTS/${attachmentType}/${course}/${uniqueFileName}`);
                
                const snapshot = await uploadBytes(idRef, individualFile);
                const downloadUrl = await getDownloadURL(snapshot.ref);

                return {
                    name: individualFile.name,
                    url: downloadUrl
                };
            })
        );

        const getDoc = doc(firestore, `BATCH_RECORDS/${BATCH_ID}`);

        // 2. Push files into the list and save the single remarks string globally
        switch(attachmentType) {
            case 'attendance':
                await updateDoc(getDoc, { 
                    attendance: arrayUnion(...uploadedAttachments),
                    attendance_remarks: batch_remarks // 🟢 Single global remarks field
                });
                break;
            case 'ccr':
                await updateDoc(getDoc, { 
                    ccr: arrayUnion(...uploadedAttachments),
                    ccr_remarks: batch_remarks // 🟢 Single global remarks field
                });
                break;
            default:                 
                break;
        }
        
        return uploadedAttachments;
    } catch(error) {
        console.error("Failed processing file upload cycle:", error);
        throw error;
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
