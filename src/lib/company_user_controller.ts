import { addDoc, deleteDoc, getDoc, updateDoc, setDoc, doc, getDocs, query, orderBy, where, collection, serverTimestamp, Timestamp,} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadString,} from 'firebase/storage'
import { storage } from './firebase'
import { generateUserCode, } from '@/types/handling'
import { NewStaffValues, GetAllCompanyUsers, TICKET } from '@/types/company_users'
import { firestore } from './controller'
import { addLog } from '@/lib/history_log_controller'

export const companyUsers = collection(firestore, 'company_users')

// Get All Company User Accounts
export const getAllCompanyUsers = async (): Promise<GetAllCompanyUsers[]> => {
    try{
        const company_user = query(companyUsers, orderBy('candidate_added', 'desc'))
        const querySnapshot = await getDocs(company_user)
        const data: GetAllCompanyUsers[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as GetAllCompanyUsers
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.candidate_added.toDate().getTime() - b.candidate_added.toDate().getTime()
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}

// Function to check if the generated user code already exists in the database
const checkUserCodeExists = async (userCode: number) => {
    const q = query(companyUsers, where('userCode', '==', userCode));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Return true if user code exists, false otherwise
}

// Add Candidate to db
export const addCandidate = async (staffVal: NewStaffValues, fileData: any, file: string, sign: string, sigFile: any, file_name: string, staff_status: string, app_type: string, actor: string | null) => {
    let userCode: number = 0;
    let sig_url = ''
    let url = ''
    try{
        // Upload file to Storage
        if(file !== ''){
            const fileRef = ref(storage, `company_users/photos/${file_name}_pfp.png`)
            const data = await uploadBytes(fileRef, fileData[0])
            url = await getDownloadURL(data.ref)
        }

        if(sigFile && sigFile.length > 0){
            const sigRef = ref(storage, `company_users/signatures/${file_name}_esign.png`)
            const sign_data = await uploadBytes(sigRef, sigFile[0])
            sig_url = await getDownloadURL(sign_data.ref)
        } else {
            // create file ref
            const e_signature = ref(storage, `/company_users/signatures/${file_name}_esign.png`)
            // Upload file to Storage
            await uploadString(e_signature, sign, 'data_url')
            sig_url = await getDownloadURL(e_signature)
        }
        
        let userCodeExists = true;
        // Generating unique user code
        while(userCodeExists){
            userCode = generateUserCode();
            userCodeExists = await checkUserCodeExists(userCode)
        }

        const staffData = {
            ...staffVal,
            user_code: String(userCode),
            emp_status: staff_status,
            application_type: app_type,
            e_sig: sig_url,
            password: `pentagon_${userCode}`,
            pfp: url,
        }

        const staffAdded = await addDoc(companyUsers, { ...staffData, candidate_added: serverTimestamp(), })
        await addLog(actor, 'Created new candidate profile.', 'companyUser', staffAdded.id)
        await addLog(actor, 'Created new candidate profile.', 'companyUser', 'Log')
        return staffAdded.id
    }catch(error){
        console.error('Error adding candidate: ', error)
        throw error
    }
}

export const editStaffDetails = async (company_staff_id: string, action: string, actor: string | null, company_staff: GetAllCompanyUsers, file_name: number, signImg: string, signImgFile: any, isSignDigital: boolean, pfp: string, pfpFile: any) => {
    try{
        const { birthDate, ...prevData } = company_staff
        const formattedBirthDate = birthDate instanceof Date ? birthDate.toISOString().split('T')[0] : birthDate
        const updatedCompanyStaff = { ...prevData, birthDate: formattedBirthDate }
        const company_staff_Ref = doc(firestore, `company_users/${company_staff_id}`)
        await updateDoc(company_staff_Ref, {...updatedCompanyStaff})
        const getPfpURL = await editAttachment(company_staff_id, file_name, signImg, signImgFile, isSignDigital, pfp, pfpFile)

        await addLog(actor, action, 'companyUser', company_staff_id)
        await addLog(actor, action, 'companyUser', 'Log')
        return { staff_pfp: getPfpURL, staff_name: company_staff.full_name}
    }catch(error){
        throw error
    }
}

const editAttachment = async (company_staff_id: string, file_name: number, signImg: string, signImgFile: any, isSignDigital: boolean, pfp: string, pfpFile: any) => {
    try {
        let sig_url = '';
        let url = '';
        const newAttachment: { [key: string]: any } = {}; // Initialize an empty object for the updated fields
        if (pfp !== '') {
            const fileRef = ref(storage, `company_users/photos/${file_name}_pfp.png`);
            const data = await uploadBytes(fileRef, pfpFile[0]);
            url = await getDownloadURL(data.ref);
            newAttachment.pfp = url;
        }

        if (signImgFile && signImgFile.length > 0) {
            const sigRef = ref(storage, `company_users/signatures/${file_name}_esign.png`);
            const sign_data = await uploadBytes(sigRef, signImgFile[0]);
            sig_url = await getDownloadURL(sign_data.ref);
            newAttachment.e_sig = sig_url;
        } else if (isSignDigital) {
            const e_signature = ref(storage, `/company_users/signatures/${file_name}_esign.png`);
            await uploadString(e_signature, signImg, 'data_url');
            sig_url = await getDownloadURL(e_signature);
            newAttachment.e_sig = sig_url;
        }

            const getDoc = doc(firestore, `company_users/${company_staff_id}`);
            await setDoc(getDoc, newAttachment, { merge: true });
        
        return url
    } catch (error) {
        console.log('Error: ', error)
    }
}

export const reqToUpdateData = async (id: string, data: any, action: string, actor: string | null) => {
    try{
        const employeeRef = doc(firestore, `company_users/${id}`)
        await updateDoc(employeeRef, data)
        await addLog(actor, action, 'companyUser', 'Log')
    } catch(error){
        console.log('Error: ', error)
    }
}

// Delete Candidate
export const deleteCandidate = async (id: string, actor: string | null, candidateName: string) => {
    try{
        const candidate = doc(firestore, `company_users/${id}`)
        await deleteDoc(candidate)
        await addLog(actor, `Candidate Profile of ${candidateName} was deleted, therefore terminated from the company.`, 'companyUser', 'Log')
    } catch(error){
        console.log('Error: ', error)
    }
}

// Hire Candidate
export const hireCandidate = async (id: string, actor: string | null, candidateName: string) => {
    try{
        const candidateRef  = doc(firestore, `company_users/${id}`)
        // Fetch the current data of the candidate document
        const candidateSnap = await getDoc(candidateRef);
        // Check if the document exists
        if (candidateSnap.exists()) {
            // Get the current data
            const candidateData = candidateSnap.data();
            // Update the data with new values
            const updatedData = {
                ...candidateData,
                emp_status: 'Hired',
                hired_date: serverTimestamp()
            };
            // Write the updated data back to Firestore
            await setDoc(candidateRef, updatedData)
            await addLog(actor, 'You have been hired in the company.', 'companyUser', id)
            await addLog(actor, `Candidate ${candidateName} has been successfully hired.`, 'companyUser', 'Log')
        } else {
            throw new Error('Candidate document not found');
        }
    }catch(error){
        console.log('Error: ', error)
    }
}
