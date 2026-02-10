import { addDoc, getDoc, updateDoc, setDoc, writeBatch, doc, getDocs, query, orderBy, where, collection, limit, getFirestore, serverTimestamp, DocumentReference, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage'
import { storage } from './firebase'
import { app } from './firebase'

import { CERTIFICATION_BY_ID, CERTIFICATION } from '@/types/certification'

import { addLog } from '@/lib/history_log_controller'

export const firestore = getFirestore(app)

export const certificateController = collection(firestore, 'CERTIFICATE_CONTROL')

export const SAVED_CERT_TEMPLATE = async (certData: CERTIFICATION, userID: string) => {
    try {
        await addDoc(certificateController, {...certData })
        
    } catch (error) {
        console.error('Error saving certificate template:', error)
        throw error
    }
}

export const GET_CERT_TEMPLATE = async (): Promise<CERTIFICATION_BY_ID[]> => {
    try {
        const certQuery = query(certificateController)
        const certSnapshot = await getDocs(certQuery)
        const certs = certSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CERTIFICATION_BY_ID[]
        return certs
    } catch (error) {
        console.error('Error fetching certificate templates:', error)
        throw error
    }
}
