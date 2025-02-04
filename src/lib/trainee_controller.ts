import { addDoc, getDoc, updateDoc, setDoc, doc, getDocs, query, orderBy, where, collection, limit, getFirestore, serverTimestamp, DocumentReference, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage'
import { storage } from './firebase'
import { app } from './firebase'
import Swal from 'sweetalert2'

import { TRAINEE, REGISTRATION, TRAINEE_BY_ID, TRAINING, TRAINING_BY_ID, TEMP_COURSES, REGISTRATION_BY_ID } from '@/types/trainees'
import { SelectedCourses } from '@/types/utils'

import { addLog } from '@/lib/history_log_controller'

export const firestore = getFirestore(app)

export const trainees = collection(firestore, 'TRAINEES')
export const registration = collection(firestore, 'REGISTRATION')
export const training = collection(firestore, 'TRAINING')

export const trainingCollection = collection(firestore, 'training')

// INSERT FUNCTIONS
export const addNewTrainee = async (traineeDetails: TRAINEE, trainee_type: number, validID: any, profileID: any, validSignature: any, file: string, pfpFile: string,) => {
    try{
        const traineeQuery = query(trainees, where('last_name', '==', traineeDetails.last_name), where('first_name', '==', traineeDetails.first_name))
        const querySnapshot = await getDocs(traineeQuery)

        if(!querySnapshot.empty){
            Swal.fire({
                title: `Oops, looks like you've already submitted a form to Pentagon...`,
                text: `If you want to re-enroll at Pentagon please select the "Re-Enrolled" trainee type.`,
                icon: 'error',
            })
            return null
        }

        const newDetails = {
            ...traineeDetails,
        }
        
        const docRef: DocumentReference = await addDoc(trainees, {...newDetails})
        await addAttachments(docRef.id, traineeDetails.last_name, traineeDetails.first_name, trainee_type, validID, profileID, validSignature, file, pfpFile)
        return docRef.id
    } catch(error){
        throw error
    }
}

export const addAttachments = async (id: string, lastName: string, givenName: string, traineeType: number, validID: any, profileID: any, validSignature: any, file: string, pfpFile: string) => {
    try{
        let sig_url = '';
        let validURL = '';
        let validProfileURL = '';

        if (file !== 'No file chosen yet...') {
            // Upload valid id to Storage
            const idRef = ref(storage, `TRAINEES/valid_id/${traineeType !== 0 ? 're-enroll_' : ''}${lastName}_${givenName}_validID.png`);
            const id_data = await uploadBytes(idRef, validID[0]);
            validURL = await getDownloadURL(id_data.ref);
        }
        if (pfpFile !== 'No file chosen yet...') {
            // Upload valid pfp to Storage
            const pfpRef = ref(storage, `TRAINEES/photos/${traineeType !== 0 ? 're-enroll_' : ''}${lastName}_${givenName}_idPic.png`);
            const pfp_data = await uploadBytes(pfpRef, profileID[0]);
            validProfileURL = await getDownloadURL(pfp_data.ref);
        }
        
        if (validSignature && validSignature.length > 0) {
            // Upload valid signature to Storage
            const sigRef = ref(storage, `TRAINEES/e-signs/${traineeType !== 0 ? 're-enroll_' : ''}${lastName}_${givenName}_esign.png`);
            const sig_data = await uploadBytes(sigRef, validSignature[0]);
            sig_url = await getDownloadURL(sig_data.ref);
        }
        const getDoc = doc(firestore, `TRAINEES/${id}`)
        const newAttachments = {
            e_sig: sig_url,
            photo: validProfileURL,
            valid_id: validURL,
        }
        await setDoc(getDoc, newAttachments, {merge: true})
    }catch(error){
        throw error
    }
}

export const addRegistrationDetails = async (ref_id: string, payment_fee: number, registrationType: number, traineeType: number, account_type: number) => {
    try{
            const newRegistration: REGISTRATION = {
                trainee_ref_id: ref_id,
                reg_no: '',
                regApproach: registrationType,
                traineeType,
                payment_balance: payment_fee,
                payment_status: 2,
                payment_mode: 3,
                date_registered: Timestamp.now(),
                reg_remarks: '',
                regType: 2,
                reg_accountType: account_type === 0 ? account_type : 1,
            }  
            const idRef: DocumentReference = await addDoc(registration, {...newRegistration})
            return idRef.id
        
    }catch(error){
        console.error('Error: ', error)
    }
}

export const addTrainingDetails = async (tempCourses: TEMP_COURSES, id: string) => {
    try{
        if(tempCourses){
            // Get the current date and subtract one day
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - 1);  // Subtract one day
            
            // Convert the new date (previous day) to Firestore Timestamp
            // const previousDayTimestamp = Timestamp.fromDate(currentDate);
            const newTraining: TRAINING = {
                ...tempCourses,
                reg_ref_id: id,
                reg_status: 0,
                isCertified: false,
                cert_released: Timestamp.now(),
                cert_status: 0,
                cert_no: '',
                practical: 0,
                written: 0,
                result: 0,
                train_remarks: '',
                regType: 2,
                batch: 1,
                date_enrolled: Timestamp.now(),
            }
            await addDoc(training, {...newTraining})
        }
    }catch(error){
        throw error
    }
}

// UPDATE FUNCTIONS
export const PROCESS_CANCELLATION = async (val_id: string, type: number, reason: string, actor: string | null) => {
    try{
        const docRef = doc(firestore, type === 0 ? 'REGISTRATION' : 'TRAINING', val_id)
        if(type === 0){
            await updateDoc(docRef, {regType: 3})
            await addLog(actor, reason, 'REGISTRATION', val_id)
        } else {
            await updateDoc(docRef, {reg_status: 7})
            await addLog(actor, reason, 'TRAINING', val_id)
        }
    }catch(error){
        throw error
    }
}

export const addRegTypeField = async () => {
    const trainingRef = collection(firestore, 'TRAINING'); // Adjust the collection name as needed
    const registrationRef = collection(firestore, 'REGISTRATION');
    
    try {
        // Get all documents from the training collection
        const trainingSnapshot = await getDocs(trainingRef);

        for (const trainingDoc of trainingSnapshot.docs) {
            const trainingData = trainingDoc.data();
            const regType = trainingData.regType;
            const regRefId = trainingData.reg_ref_id;
            
            // Find the corresponding registration document by reg_ref_id
            const regDocRef = doc(firestore, 'REGISTRATION', regRefId);
            const regDocSnapshot = await getDoc(regDocRef);  // Use getDoc instead of getDocs for single document retrieval

            if (regDocSnapshot.exists()) {
                const regData = regDocSnapshot.data();
                
                // Check if regType already exists in the registration document
                if (!regData.hasOwnProperty('regType')) {
                    // If regType does not exist, add it
                    await updateDoc(regDocRef, {
                        regType: regType
                    });
                    console.log(`Added regType to document ${regRefId}`);
                } else {
                    console.log(`regType already exists in document ${regRefId}, skipping.`);
                }
            } else {
                console.log(`No matching document found for reg_ref_id: ${regRefId}`);
            }
        }

    } catch (error) {
        console.error('Error updating registration documents:', error);
    }
};

export const UPDATE_TS = async (training_id: string, startDate: string, endDate: string, actor: string | null) => {
    try{
        const trainingRef = doc(firestore, 'TRAINING', training_id)
        await updateDoc(trainingRef, {start_date: startDate, end_date: endDate})
        await addLog(actor, 'Training Scheduled Updated', 'TRAINING', training_id)
    }catch(error){
        throw error
    }
}

export const UPDATE_COURSE_FEE = async (training_id: string, course_fee: number, actor: string | null) => {
    try{
        const trainingRef = doc(firestore, 'TRAINING', training_id)
        await updateDoc(trainingRef, {course_fee})
        await addLog(actor, 'Training Fee Updated', 'TRAINING', training_id)
    }catch(error){
        throw error
    }
}

export const UPDATE_TRAINEE = async (traineeInfo: TRAINEE_BY_ID, actor: string | null) => {
    try{
        const traineeRef = doc(firestore, 'TRAINEES', traineeInfo.id)
        await updateDoc(traineeRef, {...traineeInfo})
        await addLog(actor, 'Trainee Updated', 'TRAINEES', traineeInfo.id)
    }catch(error){
        console.error('Error: ', error)
        throw error
    }
}

export const SAVE_REMARKS = async (training_id: string, remarks: string, actor: string | null) => {
    try{
        const traineeRef = doc(firestore, 'TRAINING', training_id)
        await updateDoc(traineeRef, {train_remarks: remarks})
        await addLog(actor, 'Remarks Added', 'TRAINING', training_id)
    }catch(error){
        throw error
    }
}

export const ENROLL_COURSE = async (batch: string, training_id: string, registration_id: string, trainee_id: string, reg_type: number, reg_account_type: number, actor: string | null) => {
    try{
        // this part fetches the latest registration number then increments it, 
        // but if no data is found it initializes a registration number
        let maxRegNo: string = ''
        const qSnapshot = await getDocs(registration)
        
        // Filter documents with the matching reg_type
        const filteredDocs = qSnapshot.docs.filter(
            (doc) => doc.data().regType === reg_type
        )
    
        // If there are matching documents, find the one with the highest reg_no
        if (filteredDocs.length > 0) {
            const latestRegDoc = filteredDocs.reduce((prev, current) =>
                prev.data().reg_no > current.data().reg_no ? prev : current
            )
            maxRegNo = latestRegDoc.data().reg_no
        }
        
        const currentYear = new Date().getFullYear();
        // this is where it initializes a reg number 
        if (maxRegNo === '') {
            maxRegNo = `${currentYear}-0001`; // First reg_no will be [current_year]-0001
        } else {
            // Increment maxRegNo by 1 for the new registration
            const [year, num] = maxRegNo.split('-');
            const incrementedNum = (parseInt(num, 10) + 1).toString().padStart(4, '0');
            maxRegNo = `${currentYear}-${incrementedNum}`;
        }
        
        // on this part, it fetches all documents with the same reg_ref_id in training collection
        const tQuery = query(training, where('reg_ref_id', '==', registration_id))
        const tQSnapshot = await getDocs(tQuery)
        const data: TRAINING_BY_ID[] = []

        if (!tQSnapshot.empty) {
            const currDate = new Date()
            const currDateString = `${currDate.getFullYear()}-${String(currDate.getMonth()+1).padStart(2, "0")}-${String(currDate.getDate()).padStart(2, "0")}`
            
            tQSnapshot.forEach((doc) => {
                const docData = doc.data() as TRAINING_BY_ID;
                docData.id = doc.id
                data.push(docData);
            })
            // then it ensures that some of the documents have enrolled (3) and enrolled date are the same as the current date
            const hasRegStat3 = data.some((doc) => doc.reg_status === 3)
            const hasMatchingDate = data.some((doc) => {
                if (doc.date_enrolled instanceof Timestamp) {
                    const enrolledDate = doc.date_enrolled.toDate();
                    const enrolledDateString = `${enrolledDate.getFullYear()}-${String(
                        enrolledDate.getMonth() + 1
                    ).padStart(2, "0")}-${String(enrolledDate.getDate()).padStart(2, "0")}`;
                    return enrolledDateString === currDateString;
                }
                return false;
            })

            if (hasRegStat3 && hasMatchingDate) { 
                // If both are true, then update the reg_status of the document to enrolled (3) and its date_enrolled
                const trainingRef = doc(firestore, 'TRAINING', training_id);
                const newStatus = {
                    batch,
                    regType: reg_type === 0 ? reg_type : 1,
                    reg_status: 3, // Set reg_status to 3 (enrolled)
                    date_enrolled: Timestamp.now()  // Set current date as enrollment date
                };
                await updateDoc(trainingRef, { ...newStatus });
            } else if(!hasRegStat3){
                // on this condition, check if the fetched training documents with the same reg_ref_id
                // if some of them have 3 as values for reg_status 
                const trainingRef = doc(firestore, 'TRAINING', training_id);
                const regRef = doc(firestore, 'REGISTRATION', registration_id);
                
                const newStatus = {
                    batch,
                    regType: reg_type === 0 ? reg_type : 1,
                    reg_status: 3, // Set reg_status to 3 (enrolled)
                    date_enrolled: Timestamp.now()  // Set current date as enrollment date
                }
                await updateDoc(trainingRef, { ...newStatus })

                const newRegInfo = {
                    reg_no: maxRegNo,
                    regType: reg_type === 0 ? reg_type : 1,  
                }
                await updateDoc(regRef, { ...newRegInfo })
            } else { 
                // then here, if the conditions are not met, it will create a new registration document that links to the
                // and creates a new registration number
                const newRegistration: REGISTRATION = {
                    trainee_ref_id: trainee_id,         // You can adjust the reference field as needed
                    reg_no: maxRegNo,                  // Use the incremented reg_no
                    regApproach: 0,                    
                    traineeType: 0,    
                    regType: reg_type === 0 ? reg_type : 1,                
                    payment_status: 2,                 
                    payment_mode: 0,                   
                    payment_balance: 0,                
                    date_registered: Timestamp.now(),  // Current timestamp
                    reg_remarks: '',
                    reg_accountType: reg_account_type === 0 ? reg_account_type : 1,              
                };
                const idRef: DocumentReference = await addDoc(registration, {...newRegistration})

                const trainingRef = doc(firestore, 'TRAINING', training_id)
                const newStatus= {
                    batch,
                    reg_ref_id: idRef.id,
                    regType: reg_type === 0 ? reg_type : 1,
                    reg_status: 3,
                    date_enrolled: Timestamp.now()
                }
                await updateDoc(trainingRef, {...newStatus})
            }
            return data
        } 
        await addLog(actor, 'Registration was enrolled successfully', 'TRAINING', training_id)
    }catch(error){
        throw error
    }
}

export const ACKNOWLEDGE_REGISTRATION = async (id: string, training: TRAINING, actor: string | null) => {
    try{
        const regRef = doc(firestore, 'TRAINING', id)
        let status = training.reg_status
        status++
        const newReg= {
            ...training,
            reg_status: status
        }
        await updateDoc(regRef, {...newReg})
        await addLog(actor, 'Registration acknowledge', 'TRAINING', id)
    }catch(error){
        console.error(error)
        throw error
    }
}

export const RE_ENROLLED_TRAINEE = async (trainee_id: string, newTrainee: TRAINEE) => {
    try{
        const traineeRef = doc(firestore, 'TRAINEES', trainee_id)
        await updateDoc(traineeRef, {...newTrainee})
    }catch(error){
        console.log('Error: ', error)
        throw error
    }
}

export const changeImg = async (trainee_id: string, last_name: string, first_name: string, cat: string, attachment_type: string, validID: any, file: string, staff: string | null) => {
    try {
        // Check if a trainee with the same first and last name already exists
        const traineeQuery = query(trainees, where("last_name", "==", last_name), where("first_name", "==", first_name));
        const querySnapshot = await getDocs(traineeQuery);

        // If no matching trainee found, throw an error
        if (querySnapshot.empty) {
            throw new Error('No matching trainee found.');
        }

        let URL = '';
        // Get the trainee document reference
        const traineeDoc = querySnapshot.docs[0];
        const traineeDocRef = doc(firestore, 'TRAINEES', traineeDoc.id);

        if (file !== 'No file chosen yet...') {
            // Upload valid id to Storage
            const idRef = ref(storage, `TRAINEES/${attachment_type}/${last_name}_${first_name}_${cat}.png`);
            const id_data = await uploadBytes(idRef, validID[0]);
            URL = await getDownloadURL(id_data.ref);
        }

        let updatedTraineeData: { [key: string]: any }
        switch (attachment_type) {
            case 'valid_id':
                updatedTraineeData = { valid_id: URL, };
                break;
            case 'e-signs':
                updatedTraineeData = { e_sig: URL, };
                break;
            case 'photos':
                updatedTraineeData = { photo: URL, };
                break;
            default:
                throw new Error('Invalid attachment type.');
        }

        const traineeAdded = await updateDoc(traineeDocRef, updatedTraineeData)
        // Create a new history log entry
        await addLog(staff, `Image Attachment of ${first_name} ${last_name} has been updated.`, 'TRAINEES', trainee_id)
    
        return traineeAdded
    } catch (error) {
        console.error('Error adding trainee: ', error);
        throw error;
    }
}

export const getAllTrainees = async (): Promise<TRAINEE_BY_ID[]> => {
    try {
        // Query to fetch all trainees
        const traineeQuery = query(trainees, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(traineeQuery);
        const data: TRAINEE_BY_ID[] = [];

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as TRAINEE_BY_ID;
                docData.id = doc.id
                data.push(docData);
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
            })
            return data
        } else {
            return data
        }
    } catch (error) {
        throw error;
    }
}

export const GET_TRAINING_REGISTRAION = async (month: number, year: number): Promise<REGISTRATION_BY_ID[]> => {
    try{
        const startDate = new Date(year, month - 1, -15, 12, 0, 0)
        const endDate = new Date(year, month, 0, 23, 59, 59)

        const regRef = collection(firestore, "REGISTRATION")
        const registrationQuery = query(regRef, where("date_registered", ">=", startDate), where("date_registered", "<=", endDate))
        const querySnapshot = await getDocs(registrationQuery)

        const data: REGISTRATION_BY_ID[] = [];

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as REGISTRATION_BY_ID;
                docData.id = doc.id
                data.push(docData);
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}

export const getRegistrationData = async (month: number, year: number): Promise<REGISTRATION_BY_ID[]> => {
    try {
        const startDate = new Date(year, month - 1, 1, 12, 0, 0)
        const endDate = new Date(year, month, 0, 23, 59, 59)

        // Query to fetch all trainees
        const regRef = collection(firestore, "REGISTRATION")
        const registrationQuery = query(regRef, where("date_registered", ">=", startDate), where("date_registered", "<=", endDate))
        const querySnapshot = await getDocs(registrationQuery)

        const data: REGISTRATION_BY_ID[] = [];

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as REGISTRATION_BY_ID;
                docData.id = doc.id
                data.push(docData);
            })
            return data
        } else {
            return data
        }
    } catch (error) {
        throw error;
    }
}

export const getTrainingData = async (month: number, year: number): Promise<TRAINING_BY_ID[]> => {
    try{
        const startDate = new Date(year, month - 1, 1, 12, 0, 0)
        const endDate = new Date(year, month, 0, 23, 59, 59)

        const trainingRef = collection(firestore, "TRAINING")
        const tQuery = query(trainingRef, where("date_enrolled", ">=", startDate), where("date_enrolled", "<=", endDate))
        const qSnapshot = await getDocs(tQuery)

        const data: TRAINING_BY_ID[] = []
        
        if(!qSnapshot.empty){
            qSnapshot.forEach((doc) => {
                const docData = doc.data() as TRAINING_BY_ID
                docData.id = doc.id
                console.log("Document Data:", docData)
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

// READ FUNCTIONS
export const verifyTrainee = async (last_name: string, given_name: string,) => {
    try{
        // Check if a trainee with the same first and last name already exists
        const traineeQuery = query(trainees, where("last_name", "==", last_name), where("given_name", "==", given_name))
        const querySnapshot = await getDocs(traineeQuery)
        const data: TRAINEE_BY_ID[] = []

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as TRAINEE_BY_ID;
                docData.id = doc.id
                data.push(docData);
            })
            return data
        } else {
            return data
        }
    }  catch(error){
        throw error
    }
}
