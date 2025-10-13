import { addDoc, updateDoc, setDoc, doc, deleteDoc, getDocs, query, orderBy, where, collection, getFirestore, DocumentReference, Timestamp } from 'firebase/firestore'
import { storage } from './firebase'
import { app } from './firebase'

import { INQUIRIES_BY_ID, INQUIRIES, } from '@/types/inquiries'

export const firestore = getFirestore(app)

export const inquiries = collection(firestore, 'INQUIRIES')

export const INSERT_INQUIRY = async (inquiryDetails: INQUIRIES, actor: string | null) => {
    try{
        const newInquiry = { ...inquiryDetails, actor }
        const inquiry: DocumentReference = await addDoc(inquiries, {...newInquiry})
        return inquiry.id
    }catch(error){
        console.error(error)
    }
}

export const UPDATE_INQUIRY = async (inquiry_id: string, updateInquiry: Partial<INQUIRIES>, actor: string | null) => {
    try{
        const inquiryRef = doc(firestore, 'INQUIRIES', inquiry_id)
        const newInquiry = {
            ...updateInquiry,
            updateAt: Timestamp.now()
        }
        await updateDoc(inquiryRef, newInquiry)
    }catch(error){
        console.error(error)
    }
}

export const DELETE_INQUIRY = async (inquiry_id: string, actor: string | null) => {
    try{
        const inquiryRef = doc(firestore, 'INQUIRIES', inquiry_id)
        await deleteDoc(inquiryRef)
    }catch(error){
        console.error(error)
    }
}

export const FETCH_INQUIRIES = async () => {
    try{
        const inquiryQuery = query(inquiries)
        const snapShot = await getDocs(inquiryQuery)
        const data: INQUIRIES_BY_ID[] = []

        if(!snapShot.empty){
            snapShot.forEach((doc) => {
                const docData = doc.data() as INQUIRIES_BY_ID
                docData.id = doc.id
                data.push(docData)
            })
            return data
        } else {
            return data
        }
    }catch(error){
        console.error(error)
    }
}