import { Firestore, addDoc, deleteDoc, getDoc, DocumentReference, updateDoc, setDoc, doc, getDocs, query, orderBy, where, collection, getFirestore, Timestamp } from 'firebase/firestore'
import { app } from './firebase'
import { CourseBatch, AddCourseBatch } from '@/types/course-batches'
import { BATCH, BATCH_BY_ID } from '@/types/training'
import { addLog } from '@/lib/history_log_controller'

export const firestore = getFirestore(app)
// Course batches Collection
export const courseBatches = collection(firestore, 'BATCHES')

export const GENERATE_BATCH = async (batch_no: string, course: string, start_date: string, end_date: string, numOfDays: string, actor: string | null) => {
    try{
        const newBatch = {
            batch_no,
            start_date,
            end_date,
            numOfDays,
            course,
        }
        const batchID: DocumentReference = await addDoc(courseBatches, {...newBatch})
        await addLog(actor, 'New Batch Created', 'BATCHES', batchID.id)
        return batchID.id
    }catch(error){
        throw error
    }
}

export const FETCH_BATCHES = async () => {
    try{
        const batchQuery = query(courseBatches)
        const qSnapshot = await getDocs(batchQuery)
        const data: BATCH_BY_ID[] = []

        if(!qSnapshot.empty){
            qSnapshot.forEach((doc) => {
                const docData = doc.data() as BATCH_BY_ID
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

export const addBatch = async (batch: AddCourseBatch) => {
    try {
        // Introduce a delay before checking the Firebase collection
        await new Promise(resolve => setTimeout(resolve, 4000)); // 2-second delay

        // Query the 'CourseBatches' collection for batches with the same training schedule
        const batchQuery = query(
            collection(firestore, 'CourseBatches'),
            where('training_sched', '==', batch.training_sched)
        );

        await new Promise(resolve => setTimeout(resolve, 4000)); // 1-second delay
        
        const querySnapshot = await getDocs(batchQuery);
        // If there are any results, the training schedule already exists
        if (!querySnapshot.empty) {
            return false;
        }

        // Proceed with adding the new batch if no match is found
        await addDoc(collection(firestore, 'CourseBatches'), batch);
        return true;

    } catch (error) {
        console.error('Error adding batch:', error);
        return false;
    }
}

export const getCourseBatches = async (): Promise<CourseBatch[]> => {
    try{
        const course_batches = query(courseBatches, orderBy('year', 'desc'))
        const querySnapshot = await getDocs(course_batches)
        const data: CourseBatch[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as CourseBatch
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {// do not forget to add a sorting an time stamp with history log
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
            })
            return data
        } else {
            return data
        }
        return []
    }catch(error){
        throw error
    }
}

export const assignInstructor = async (id: string, instructor: string, actor: string | null, action: string, course: string, selectedBatch: number) => {
    try{
        const newInstructor = {instructor: instructor}
        const getDoc = doc(firestore, `CourseBatches/${id}`)
        await setDoc(getDoc, newInstructor, {merge: true})
        const LOG_ACTION: string = `${action === 'Newly Assigned' ? `An Instructor is assigned to ${course} Batch ${selectedBatch}.` : `The instructor for ${course} Batch ${selectedBatch} was updated.`}`
        // Create a new history log entry
        await addLog(actor, LOG_ACTION, 'CourseBatches', id)
        return true
    }catch(error){
        throw error
    }
}