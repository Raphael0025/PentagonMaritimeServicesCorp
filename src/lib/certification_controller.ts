import { addDoc, getDoc, updateDoc, setDoc, writeBatch, doc, getDocs, query, arrayUnion, orderBy, where, collection, limit, getFirestore, serverTimestamp, DocumentReference, Timestamp, deleteDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage'
import { storage } from './firebase'
import { app } from './firebase'

import { CERTIFICATION_BY_ID, TRANSMITTAL, CERTIFICATION_REPORT, CERTIFICATION_REPORT_BY_ID, CERTIFICATION, certVersion, changeLog } from '@/types/certification'
import { sortByCreatedAt, removeVersion, reassignActiveVersion } from '@/handlers/cert_helper'

import { addLog } from '@/lib/history_log_controller'

export const firestore = getFirestore(app)

export const certificateController = collection(firestore, 'CERTIFICATE_CONTROL')
export const certificateReportController = collection(firestore, 'CERTIFICATE_REPORT')
export const transmittalController = collection(firestore, 'TRANSMITTALS')

type MonthKeys = 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec';
type MetricFields = 'ttl_certs' | 'issued' | 'unClaimed' | 'pending' | 'note' | 'trainee' | 'company';

export const UPDATE_CERT_MONTHLY_METRIC = async (
    docId: string,
    monthKey: MonthKeys,
    fieldKey: MetricFields,
    newValue: number | string
): Promise<void> => {
    try {
        // 🟢 Uses your collection instance reference directly to build the document path safely
        const docRef = doc(certificateReportController, docId); 
        const nestedFieldPath = `${monthKey}.${fieldKey}`;

        await updateDoc(docRef, {
            [nestedFieldPath]: newValue
        });

        console.log(`Successfully updated ${nestedFieldPath} in CERTIFICATE_REPORT`);
    } catch (error) {
        console.error(`Error updating metric for ${monthKey}.${fieldKey}:`, error);
        throw error;
    }
}

export const GET_CERT_REPORT_BY_YEAR = async (targetYear: number, reportType: 'dated' | 'bd'): Promise<CERTIFICATION_REPORT_BY_ID | null> => {
    try {
        const certQuery = query(
            certificateReportController, 
            where('year', '==', targetYear),
            where('type', '==', reportType),
            limit(1) // 🟢 Tells Firestore to stop searching once it finds the matching year document
        );
        
        const certSnapshot = await getDocs(certQuery);
        
        // If no document exists for that year, return null
        if (certSnapshot.empty) {
            return null;
        }

        // Grab the very first document in the query results
        const doc = certSnapshot.docs[0];
        
        return { 
            id: doc.id, 
            ...doc.data() 
        } as CERTIFICATION_REPORT_BY_ID;
        
    } catch (error) {
        console.error(`Error fetching certificate report for year ${targetYear}:`, error);
        throw error;
    }
}

export const SAVED_CERT_TEMPLATE = async (certData: CERTIFICATION, userID: string) => {
    try {
        await addDoc(certificateController, {...certData })
        
    } catch (error) {
        console.error('Error saving certificate template:', error)
        throw error
    }
}

export const UPDATE_CERT_TEMPLATE = async (certData: Partial<CERTIFICATION>, certID: string) => {
    try {
        const certRef = doc(firestore, 'CERTIFICATE_CONTROL', certID)
        await setDoc(certRef, certData, { merge: true })
        
    } catch (error) {
        console.error('Error saving certificate template:', error)
        throw error
    }
}

export const UPDATE_VERSION_FIELDS = async ( certID: string, versionNumber: string, updates: Partial<certVersion>) => {
    const certRef = doc(firestore, 'CERTIFICATE_CONTROL', certID)
    const snap = await getDoc(certRef)

    if (!snap.exists()) return

    const data = snap.data()
    const updatedVersions = data.versions.map((v: certVersion) =>
        v.version_number === versionNumber
        ? { ...v, ...updates }
        : v
    )

    await updateDoc(certRef, { versions: updatedVersions })
}

export const ADD_CHANGELOG_ENTRY = async (entry: { certID: string, v_Number: string, newEntry: changeLog}) => {
    try {
        const certRef = doc(firestore, 'CERTIFICATE_CONTROL', entry.certID)
        const snap = await getDoc(certRef)

        if (!snap.exists()) {
            console.warn('Certificate not found')
            return
        }

        const data = snap.data()
        const versions = (data.versions || []) as certVersion[]

        console.log('Current versions:', versions)

        const versionIndex = versions.findIndex(
            (v) => v.version_number === entry.v_Number
        )

        if (versionIndex < 0) {
            console.warn('Version not found for changelog append')
            return
        }

        const updatedVersions = [...versions]
        const targetVersion = { ...updatedVersions[versionIndex] }

        console.log('Before update changelog:', targetVersion.changelogArr)

        targetVersion.changelogArr = [
            ...(targetVersion.changelogArr || []),
            entry.newEntry,
        ]

        console.log('After update changelog:', targetVersion.changelogArr)

        updatedVersions[versionIndex] = targetVersion
        await updateDoc(certRef, { versions: updatedVersions })

        console.log('✅ Changelog entry added successfully')
    } catch (error) {
        console.error('Error adding changelog entry:', error)
        throw error
    }
} 

export const ADD_CERT_VERSION = async (certID: string, newVersion: certVersion) => {
    try{
        const certRef = doc(firestore, 'CERTIFICATE_CONTROL', certID)
        await updateDoc(certRef, {versions: arrayUnion(newVersion)})

    }catch(error){
        console.error('Error: ', error)
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

export const ADD_TRANSMITTAL = async (transmittal: TRANSMITTAL) => {
    try{
        const newCharge = {
            ...transmittal,
            createdAt: Timestamp.now()
        }
        const trans_ID: DocumentReference = await addDoc(transmittalController, {...newCharge})
        return trans_ID
    }catch(error){
        throw error
    }
}

export const DELETE_TRANSMITTAL = async (transmittalID: string) => {
    const clientWithID: DocumentReference = doc(firestore, 'TRANSMITTALS', transmittalID)
    await deleteDoc(clientWithID)
}

export const GET_TRANSMITTAL = async (): Promise<TRANSMITTAL[]> => {
    try {
        const tQuery = query(transmittalController)
        const tSnapshot = await getDocs(tQuery)
        const transmittals = tSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TRANSMITTAL[]
        return transmittals
    } catch (error) {
        console.error('Error fetching certificate templates:', error)
        throw error
    }
}

export const UPDATE_TRANSMITTAL = async (data: Partial<TRANSMITTAL>, t_id: string) => {
    try {
        const t_ref = doc(firestore, 'TRANSMITTALS', t_id)
        await setDoc(t_ref, data, { merge: true })
        
    } catch (error) {
        console.error('Error saving certificate template:', error)
        throw error
    }
}

export const scannedAttachment = async (id: string, companyName: string, accountType: string, transFile: any, fileID: string) => {
    try{
        let transmittalScanned = '';

        if (fileID !== 'No file chosen yet...') {
            // Upload valid id to Storage
            const idRef = ref(storage, `TRANSMITTALS/${companyName}/${accountType}/${fileID}`);
            const id_data = await uploadBytes(idRef, transFile[0]);
            transmittalScanned = await getDownloadURL(id_data.ref);
        }
        const getDoc = doc(firestore, `TRANSMITTALS/${id}`)
        await updateDoc(getDoc, { images: arrayUnion(transmittalScanned)})
    }catch(error){
        throw error
    }
}

export const DELETE_CERT_VERSION = async (certID: string, versionNumber: string) => {
    try {
        const certRef = doc(firestore, 'CERTIFICATE_CONTROL', certID)
        const snap = await getDoc(certRef)

        if (!snap.exists()) return

        const versions = sortByCreatedAt(snap.data().versions || [])
        const deleteIndex = versions.findIndex(v => v.version_number === versionNumber)

        if (deleteIndex === -1) return

        const versionToDelete = versions[deleteIndex]

        // 🔹 Scenario 3: archived → simple delete
        if (versionToDelete.status === 'archived') {
            return await updateDoc(certRef, {
                versions: removeVersion(versions, versionNumber),
            })
        }

        // 🔹 Deleting ACTIVE version
        const remaining = removeVersion(versions, versionNumber)

        const reassigned = reassignActiveVersion(remaining, deleteIndex)

        await updateDoc(certRef, { versions: reassigned })
    } catch (error) {
        console.error('Error deleting certificate version:', error)
        throw error
    }
}

