import { addDoc, getDoc, updateDoc, setDoc, writeBatch, doc, getDocs, query, arrayUnion, orderBy, where, collection, limit, getFirestore, serverTimestamp, DocumentReference, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage'
import { storage } from './firebase'
import { app } from './firebase'

import { CERTIFICATION_BY_ID, CERTIFICATION, certVersion, changeLog } from '@/types/certification'
import { sortByCreatedAt, removeVersion, reassignActiveVersion } from '@/handlers/cert_helper'

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

export const UPDATE_CERT_TEMPLATE = async (certData: Partial<CERTIFICATION>, certID: string) => {
    try {
        const certRef = doc(firestore, 'CERTIFICATE_CONTROL', certID)
        await setDoc(certRef, certData, { merge: true })
        
    } catch (error) {
        console.error('Error saving certificate template:', error)
        throw error
    }
}

export const UPDATE_VERSION_FIELDS = async (
    certID: string,
    versionNumber: string,
    updates: Partial<certVersion>
) => {
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

export const ADD_CHANGELOG_ENTRY = async (entry: {
    certID: string
    v_Number: string
    newEntry: changeLog
}) => {
    try {
        console.log('Incoming entry:', entry)

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

