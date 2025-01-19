import { addLog } from '@/lib/history_log_controller'
import { app } from './firebase'
import { Firestore, addDoc, deleteDoc, getDoc, updateDoc, setDoc, doc, getDocs, query, orderBy, where, collection, getFirestore, serverTimestamp, Timestamp } from 'firebase/firestore'

export const firestore = getFirestore(app)

export const companyUsers = collection(firestore, 'Research-Dev')