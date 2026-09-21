import { addDoc, deleteDoc, DocumentReference, updateDoc, arrayUnion, doc, getDocs, query, collection, getFirestore, Timestamp } from 'firebase/firestore'
import { app } from './firebase'
import { TrainingReportByID, TrainingReport, } from '@/types/ReportMetadata.model'
import { addLog } from '@/lib/history_log_controller'

export const firestore = getFirestore(app)
// Course batches Collection
export const reportMD = collection(firestore, 'REPORT_METADATA')

export const FETCH_REPORTMETADATA = async () => {
    try{
        const reportQuery = query(reportMD)
        const qSnapshot = await getDocs(reportQuery)
        const data: TrainingReportByID[] = []

        if(!qSnapshot.empty){
            qSnapshot.forEach((doc) => {
                const docData = doc.data() as TrainingReportByID
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

export const GENERATE_REPORT = async (report_temp: TrainingReport, actor: string | null) => {
    try{
        const newReportRecord = { 
            ...report_temp, 
            generatedAt: Timestamp.now(), 
            generatedBy: actor 
        }
        const reportID: DocumentReference = await addDoc(reportMD, {...newReportRecord})
        return reportID.id
    }catch(error){
        throw error
    }
}

export const UPDATE_REPORT = async (report_id: string, updateReportRecord: Partial<TrainingReport>) => {
    try{
        const reportRef = doc(firestore, 'REPORT_METADATA', report_id)
        const newReportRecord = {
            ...updateReportRecord,
        }
        await updateDoc(reportRef, newReportRecord)
    }catch(error){
        throw error
    }
}