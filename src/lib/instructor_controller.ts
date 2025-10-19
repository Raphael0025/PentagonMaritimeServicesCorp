import { addDoc, deleteDoc, DocumentReference, updateDoc, where, setDoc, doc, getDocs, query, collection, getFirestore, Timestamp } from 'firebase/firestore'
import { app } from './firebase'
import { Instructor, InstructorByID } from '@/types/instructor'
import { addLog } from '@/lib/history_log_controller'
import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const firestore = getFirestore(app)
// Course batches Collection
export const instructors = collection(firestore, 'INSTRUCTORS')

export const ADD_INSTRUCTOR = async (instructor: Instructor, e_sign: any, fileName: string, actor: string | null) => {
    try{
        const newInstructor = { ...instructor, date_added: Timestamp.now() }
        const instructorID: DocumentReference = await addDoc(instructors, {...newInstructor})
        await ADD_ATTACHMENTS(instructorID.id, e_sign, fileName)
        await addLog(actor, 'New Instructor Added', 'INSTRUCTORS', instructorID.id)
        return instructorID.id
    }catch(error){
        console.error(error)
    }
}

export const ADD_ATTACHMENTS = async (instructor_id: string, e_sig: any, file_name: string) => {
    try{
        let e_sigURL = ''
        if(file_name !== 'No file chosen yet...'){
            const idRef = ref(storage, `instructors/${file_name}_e_sign.png`)
            const id_data = await uploadBytes(idRef, e_sig[0])
            e_sigURL = await getDownloadURL(id_data.ref)
        }
        const getDoc = doc(firestore, `INSTRUCTORS/${instructor_id}`)
        const newAttachments = {
            e_sign: e_sigURL
        }
        await setDoc(getDoc, newAttachments, { merge: true})
    } catch(error){
        console.error(error)
    }
}

export const CHANGE_ATTACHMENTS = async (instructor_id: string, name: string, file: string, newFile: any) => {
    try{
        const instructorRef = query(instructors, where('name', '==', name))
        const querySnap = await getDocs(instructorRef)

        if(querySnap.empty){
            throw new Error('No matching instructors found.')
        }

        let URL = ''

        const instructorDoc = querySnap.docs[0]
        const idRef = doc(firestore, `INSTRUCTORS`, instructorDoc.id)

        if(file !== 'No file chosen yet...'){
            const id_ref = ref(storage, `instructors/${name}_e_sign.png`)
            const id_data = await uploadBytes(id_ref, newFile[0])
            URL = await getDownloadURL(id_data.ref)
        }

        let updatedInstructor: { [key: string]: any }
        updatedInstructor = {e_sign: URL}

        await updateDoc(idRef, updatedInstructor)
    }catch(error){
        console.error(error)
    }

}

export const UPDATE_INSTRUCTOR = async (instructor_id: string, updateInstructorDoc: Partial<Instructor>, actor: string | null) => {
    try{
        const instructorRef = doc(firestore, 'INSTRUCTORS', instructor_id)
        await updateDoc(instructorRef, updateInstructorDoc)
        await addLog(actor, 'Instructor Record Updated', 'INSTRUCTORS', instructor_id)
    }catch(error){
        console.error(error)
    }   
}

export const DELETE_INSTRUCTOR = async (instructor_id: string, actor: string | null) => {
    try{
        const instructor: DocumentReference = doc(firestore, 'INSTRUCTORS', instructor_id)
        await deleteDoc(instructor)
        await addLog(actor, 'Instructor Record Deleted', 'INSTRUCTORS', instructor_id)
    }catch(error){
        console.error(error)
    }
}

export const FETCH_INSTRUCTORS = async () => {
    try{
        const instructorQuery = query(instructors)
        const qSnapshot = await getDocs(instructorQuery)
        const data: InstructorByID[] = []
        if(!qSnapshot.empty){
            qSnapshot.forEach((doc) => {
                const docData = doc.data() as InstructorByID
                docData.id = doc.id
                data.push(docData)
            })
            return data
        } else {
            return data
        }
    }catch(error){
        console.error(error)
        return []
    }
}
