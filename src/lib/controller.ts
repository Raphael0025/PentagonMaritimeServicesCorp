import { Firestore, addDoc, deleteDoc, getDoc, updateDoc, setDoc, doc, getDocs, query, orderBy, where, collection, getFirestore, serverTimestamp, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadString, getStorage, deleteObject } from 'firebase/storage'
import { storage } from './firebase'
import { app } from './firebase'
import Swal from 'sweetalert2'
import { addLog } from '@/lib/history_log_controller'

import { DEPARTMENT, DEPARTMENT_ID, CATALOGUE, CATALOGUE_ID } from '@/types/utils'

import { generateUserCode, getCurrentFormattedDateTime, parsingTimestamp } from '@/types/handling'
import { SurveyData } from '@/types/utils'

export const firestore = getFirestore(app)

export const companyUsers = collection(firestore, 'company_users')
export const deptCatalog = collection(firestore, 'Dept_Catalog')

export const NewCatalogDept = async (data: DEPARTMENT, actor: string | null) => {
    try{
        const newData = {...data, createdAt: Timestamp.now()}
        const docref = await addDoc(collection(firestore, 'Dept_Catalog'), newData)
        if(docref){
            await addLog(actor, 'New Department Catalog Created', 'Dept_Catalog', 'Dept_Catalog' )
        }
    } catch (error) {
        throw error
    }
}

export const EditCatalogDept = async (data: DEPARTMENT_ID, actor: string | null) => {
    try{
        const getDoc = doc(firestore, `Dept_Catalog/${data.id}`)
        await setDoc(getDoc, data, {merge: true})
        await addLog(actor, `New Catalog Data has been saved.`, 'courses', data.id)
    }catch(error){
        throw error
    }
}

export const GetCatalogDept = async (): Promise<DEPARTMENT_ID[]> => {
    try{
        const deptQuery = query(deptCatalog, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(deptQuery)
        const data: DEPARTMENT_ID[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as DEPARTMENT_ID
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a,b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}

// Survey HERE ====================================================
export const submitClientSurvey = async (data: SurveyData) => {
    try{
        const docRef = await addDoc(collection(firestore, 'client_survey'), data)
        return docRef
    } catch(error){
        throw error
    }
}


// USER LOGIN HERE ++++++++++++++++++++++++++++++++++++++++++++++++++
// Login user
export const loginUser = async (userCode: string, password: string) => {
    
    try {
        const q = query(companyUsers, where('user_code', '==', userCode));
        const querySnapshot = await getDocs(q);

        // Check if any documents were returned
        if (querySnapshot.empty) {
            Swal.fire({
                title: `User not Found...`,
                text: `This account does not exist Enter correct account details.`,
                icon: 'error',
            })
            throw new Error('User not found');
        }

        // Get the first user matching the username
        const user = querySnapshot.docs[0].data();
        // Check if the password matches
        if (user.password !== password) {
            Swal.fire({
                title: `Login Error...`,
                text: `Sorry, your account password is incorrect.`,
                icon: 'error',
            })
            
            throw new Error('Incorrect password');
        }
        // Initialize arrays for department, rank, and job position tokens
        const departmentTokens: string[] = [];
        const rankTokens: string[] = [];
        const jobPositionTokens: string[] = [];

        // Check if user.roles is an object
        if (user.roles && typeof user.roles === 'object') {
            // Iterate over each role object in user.roles
            Object.values(user.roles).forEach((role: any) => {
                if (role.department) {
                    departmentTokens.push(role.department);
                }
                if (role.rank !== undefined) {
                    rankTokens.push(role.rank.toString());
                }
                if (role.job_position) {
                    jobPositionTokens.push(role.job_position);
                }
            });
        }

        // Concatenate multiple values into a single string separated by "/"
        const departmentToken = departmentTokens.length > 0 ? departmentTokens.join('/') : 'NoDepartments';
        const rankToken = rankTokens.length > 0 ? rankTokens.join('/') : 'NoRanks';
        const jobPositionToken = jobPositionTokens.length > 0 ? jobPositionTokens.join('/') : 'NoJobPositions';

        // Store the user's data in localStorage for sessions
        localStorage.setItem('customToken', user.full_name);
        localStorage.setItem('tokenID', user.id);
        localStorage.setItem('pfpToken', user.pfp);
        localStorage.setItem('departmentToken', departmentToken);
        localStorage.setItem('rankToken', rankToken);
        localStorage.setItem('jobPositionToken', jobPositionToken);

        return user;
    } catch (error) {
        console.error('Error logging in:');
        throw error;
    }
}