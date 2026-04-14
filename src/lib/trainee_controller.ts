import { addDoc, getDoc, updateDoc, setDoc, writeBatch, doc, getDocs, query, orderBy, where, collection, limit, getFirestore, serverTimestamp, DocumentReference, Timestamp } from 'firebase/firestore'
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
export const INSERT_TRAINEE = async (traineeDetails: TRAINEE, ) => {
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
        return docRef.id
    } catch(error){
        throw error
    }
}

export const addNewTrainee = async (traineeDetails: TRAINEE, trainee_type: number, allFiles: any) => {
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
        
        const docRef: DocumentReference = await addDoc(trainees, {...traineeDetails, trainee_type})
        await addAttachments(docRef.id, {...traineeDetails, trainee_type}, allFiles)

        return docRef.id
    } catch(error){
        throw error
    }
}

export const uploadTraineeFile = async (folder: string, fileNameSuffix: string, fileData: any, checkString: string, context: {lastName: string, givenName: string, isReEnroll: boolean}) => {
    if(!fileData || !fileData[0] || checkString === 'No file chosen yet...') return '';
    const prefix = context.isReEnroll ? 're-enroll_' : '';
    const path = `TRAINEES/${folder}/${prefix}${context.lastName}_${context.givenName}_${fileNameSuffix}.jpg`
    const storageRef = ref(storage, path)

    const uploadRes = await uploadBytes(storageRef, fileData[0])
    return await getDownloadURL(uploadRes.ref)
}

export const addAttachments = async (id: string, traineeDetails: any, files: any) => {
    try{
        const {last_name, first_name, trainee_type} = traineeDetails
        const context = {lastName: last_name, givenName: first_name, isReEnroll: trainee_type !== 0}

        const fileMap = [
            { key: 'valid_id', folder: 'valid_id', suffix: 'validID', data: files.validID, check: files.file},
            { key: 'photo', folder: 'photos', suffix: 'idPic', data: files.profileID, check: files.pfpfile},
            { key: 'e_sig', folder: 'e-signs', suffix: 'esign', data: files.validSignature, check: files.validSignaturefile},
            { key: 'mismoSC', folder: 'MISMO', suffix: 'mismo', data: files.mismoSC, check: files.mismoSCfile},
            { key: 'medCert', folder: 'MEDICAL_CERTS', suffix: 'medCert', data: files.medCert, check: files.mcfile},
            { key: 'cop', folder: 'CERTIFICATE_OF_PROFICIENCY', suffix: 'cop', data: files.cop, check: files.copfile},
            { key: 'ssr', folder: 'SEA_SERVICE_RECORDS', suffix: 'ssr', data: files.ssr, check: files.ssrfile},
        ]
        const uploadPromises = fileMap.map(item => 
            uploadTraineeFile(item.folder, item.suffix, item.data, item.check, context)
            .then(url => ({ [item.key]: url}))
        )

        const res = await Promise.all(uploadPromises)
        const newAttachments = Object.assign({}, ...res)

        const docRef = doc(firestore, `TRAINEES/${id}`)
        await setDoc(docRef, newAttachments, { merge: true})
    }catch(error){
        console.error("Attachment upload failed: ", error)
        throw error
    }
}

export const addRegistrationDetails = async (ref_id: string, payment_fee: number, registrationType: number, traineeType: number, account_type: number, marketing: string) => {
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
                marketing: marketing,
                otherMarketing: '',
                reg_accountType: account_type,
            }  
            const idRef: DocumentReference = await addDoc(registration, {...newRegistration})
            return idRef.id
        
    }catch(error){
        console.error('Error: ', error)
    }
}

export const addTrainingDetails = async (tempCourses: TEMP_COURSES, id: string, marketing: string) => {
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
                enrolledBy: 0,
                reg_status: 2,
                isCertified: false,
                cert_released: Timestamp.now(),
                cert_status: 0,
                cert_no: '',
                certTitle: '',
                certContent: '',
                cert_version: '',
                printCount: 0,
                viewCount: 0,
                hasViewed: false,
                isUrgent: false,
                webCertTitle: '',
                webCertContent: '',
                conductedOnline: false,
                transmittalID: '',
                attendance: false,
                act_end_date: '',
                act_start_date: '',
                ccr: false,
                act_ins: '',
                act_assessor: '',
                releasedBy: '',
                releasingProof: '',
                assessment: false,
                evaluation: false,
                practical: 0,
                written: 0,
                result: 0,
                train_remarks: '',
                trainingMode: '',
                regType: 2,
                batch: '1',
                marketing: marketing,
                otherMarketing: '',
                date_enrolled: Timestamp.now(),
            }
            await addDoc(training, {...newTraining})
        }
    }catch(error){
        throw error
    }
}

export const EnrolledTraining = async (tempCourses: TEMP_COURSES, id: string, marketing: string) => {
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
                enrolledBy: 0,
                reg_status: 3,
                isCertified: false,
                cert_released: Timestamp.now(),
                cert_status: 0,
                cert_no: '',
                certTitle: '',
                certContent: '',
                cert_version: '',
                printCount: 0,
                viewCount: 0,
                hasViewed: false,
                isUrgent: false,
                webCertTitle: '',
                webCertContent: '',
                conductedOnline: false,
                act_end_date: '',
                act_start_date: '',
                transmittalID: '',
                act_ins: '',
                act_assessor: '',
                releasedBy: '',
                releasingProof: '',
                attendance: false,
                ccr: false,
                assessment: false,
                evaluation: false,
                practical: 0,
                written: 0,
                result: 0,
                trainingMode: '',
                train_remarks: '',
                regType: 2,
                batch: '1',
                marketing: marketing,
                otherMarketing: '',
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

export const STORE_PROOF_RELEASING = async (training_id: string, isDated: boolean, certificate_no: string, proofFile: string) => {
    try{
        let proof = '';
        const category = isDated ? 'dated' : 'bd';

        if (proofFile) {
            // Upload valid signature to Storage
            const proofRef = ref(storage, `certifications/RELEASING/${category}/release-log/${certificate_no}-${training_id}.jpg`);
            await uploadString(proofRef, proofFile, "data_url");
            proof = await getDownloadURL(proofRef);
        }
        const getDoc = doc(firestore, `TRAINING/${training_id}`)
        const newAttachments = {
            releasingProof: proof,
        }
        await setDoc(getDoc, newAttachments, {merge: true})
    }catch(error){
        throw error
    }
}

export const UPDATE_TRAINING = async (training_id: string, updateTrainingDoc: Partial<TRAINING>, actor: string | null) => {
    try{
        const trainingRef = doc(firestore, 'TRAINING', training_id)
        await updateDoc(trainingRef, updateTrainingDoc)
    }catch(error){
        throw error
    }
}

export const UPDATE_VIEW_CERT_ACCESS = async (training_id: string, view_count: number, actor: string | null) => {
    try{
        const trainingRef = doc(firestore, 'TRAINING', training_id)
        await updateDoc(trainingRef, {hasViewed: true, viewCount: view_count})
    }catch(error){
        throw error
    }
}

export async function BATCH_UPDATE_TRAININGS(
        updates: { id: string; cert_status: number }[],
        actor: string | null
    ) {
    const batch = writeBatch(firestore)

    updates.forEach(({ id, cert_status }) => {
        const ref = doc(firestore, 'TRAINING', id)
        batch.update(ref, {
        cert_status,
        cert_released: Timestamp.now(),
        updated_by: actor,
        updated_at: Timestamp.now(),
        })
    })

    await batch.commit()
}

export const UPDATE_TRAINING_FORMS = async (training_id: string, updateTrainingDoc: Partial<TRAINING>, actor: string | null) => {
    try{
        const trainingRef = doc(firestore, 'TRAINING', training_id)
        await setDoc(trainingRef, updateTrainingDoc, {merge: true})
    }catch(error){
        console.error(error)
        throw error
    }
}

export const UPDATE_REGISTRATION = async (reg_id: string, updateRegDoc: Partial<REGISTRATION>, actor: string | null) => {
    try{
        const regRef = doc(firestore, 'REGISTRATION', reg_id)
        await updateDoc(regRef, updateRegDoc)
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

export const CHANGE_AT = async (training_id: string, reg_doc: REGISTRATION_BY_ID | null, curr_reg: REGISTRATION_BY_ID | null, reg: string) => {
    try{
        // Get first the document of training ID
        const traineeRef = doc(firestore, 'TRAINING', training_id)
        if(!reg_doc){
            if(curr_reg){
                // Create new Reg Doc
                const newReg: REGISTRATION = {
                    // Just get the values of the curr_reg fields
                    trainee_ref_id: curr_reg.trainee_ref_id,
                    reg_no: '',
                    regApproach: curr_reg.regApproach,
                    traineeType: curr_reg.traineeType,
                    payment_status: curr_reg.payment_status,
                    payment_mode: curr_reg.payment_mode,
                    payment_balance: curr_reg.payment_balance,
                    date_registered: curr_reg.date_registered,
                    reg_remarks: '',
                    marketing: curr_reg.marketing,
                    otherMarketing: curr_reg.otherMarketing,
                    regType: curr_reg.regType,
                    reg_accountType: curr_reg.reg_accountType === 0 ? 1 : 0, // Use the current reg's reg_accountType value and take the opposite of it
                }
                const reg_id: DocumentReference = await addDoc(registration, {...newReg}) // Take reg doc id
                await updateDoc(traineeRef, {reg_ref_id: reg_id.id, accountType: curr_reg.reg_accountType === 0 ? 1 : 0})
                // Update the training doc with the newly created reg doc
            }
            return
        }
        await updateDoc(traineeRef, {reg_ref_id: reg_doc.id, accountType: reg_doc.reg_accountType})
        // if condition is not met, straight update the training document
        
    }catch(error){
        throw error
    }
} 

export const ENROLL_COURSE = async (user_code: number, batch: string, training_id: string, registration_id: string, trainee_id: string, reg_type: number, reg_account_type: number, actor: string | null) => {
    try{
        // this part fetches the latest registration number then increments it, 
        // but if no data is found it initializes a registration number
        
        const reg_Collection_Snapshot = await getDocs(registration)
        
        // Filter documents with the matching reg_type
        const filteredDocs = reg_Collection_Snapshot.docs.filter(
            (doc) => doc.data().regType === reg_type
        )
        
        const currentYear = new Date().getFullYear();
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

        let maxNum = 0, reg_num = '';
        const year_month = `${currentYear}-${currentMonth}`
        
        const filterDocsByYear = filteredDocs.filter(doc => {
            const regNo = doc.data().reg_no; // e.g., "2025-01-10000"
            const parts = regNo.split("-");
            const yearPart = parseInt(parts[0]);

            return yearPart === currentYear;
        })

        const numOfDigits = reg_type === 0 ? 4 : 5 
        let series_str = (maxNum + 1).toString()

        if(filterDocsByYear.length === 0){
            reg_num = `${year_month}-${series_str.padStart(numOfDigits, '0')}`;
        } else {
            filterDocsByYear.forEach(doc => {
                const regNo = doc.data().reg_no; // e.g., "2025-01-10000"
                const parts = regNo.split("-");
                const numPart = parseInt(parts[2]); // directly get the number part
                
                if (numPart > maxNum) {
                    maxNum = numPart;
                }
            });
            series_str = (maxNum + 1).toString()
            reg_num = `${year_month}-${series_str.padStart(numOfDigits, '0')}`;
        }
        
        // on this part, it fetches all documents with the same reg_ref_id in training collection
        const tQuery = query(training, where('reg_ref_id', '==', registration_id))
        const tQSnapshot = await getDocs(tQuery)
        const data: TRAINING_BY_ID[] = []

        if (!tQSnapshot.empty) {
            //This get current date of the day
            const currDate = new Date()
            //This converts the current date into a string
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
                const trainingRef = doc(firestore, 'TRAINING', training_id)
                const regRef = doc(firestore, 'REGISTRATION', registration_id)
                const regSnap = await getDoc(regRef)
                const regData = regSnap.data() as REGISTRATION

                if(regData.regType === reg_type){
                    const newStatus = {
                        batch,
                        enrolledBy: user_code,
                        regType: reg_type,
                        reg_status: 3, // Set reg_status to 3 (enrolled)
                        date_enrolled: Timestamp.now()  // Set current date as enrollment date
                    };
                    await updateDoc(trainingRef, { ...newStatus })
                } else {
                    const newRegistration: REGISTRATION = {
                        trainee_ref_id: trainee_id,         // You can adjust the reference field as needed
                        reg_no: reg_num,                  // Use the incremented reg_no
                        regApproach: 0,                    
                        traineeType: 0,    
                        regType: reg_type,                
                        payment_status: 2,                 
                        payment_mode: 0,                   
                        payment_balance: 0,                
                        date_registered: Timestamp.now(),  // Current timestamp
                        reg_remarks: '',
                        marketing: '',
                        otherMarketing: '',
                        reg_accountType: reg_account_type,              
                    };
                    const idRef: DocumentReference = await addDoc(registration, {...newRegistration})

                    const trainingRef = doc(firestore, 'TRAINING', training_id)
                    const newStatus= {
                        batch,
                        enrolledBy: user_code,
                        reg_ref_id: idRef.id,
                        regType: reg_type,
                        reg_status: 3,
                        date_enrolled: Timestamp.now()
                    }
                    await updateDoc(trainingRef, {...newStatus})
                }
            } else if(!hasRegStat3){
                // on this condition, check if the fetched training documents with the same reg_ref_id
                // if some of them have 3 as values for reg_status 
                const trainingRef = doc(firestore, 'TRAINING', training_id);
                const regRef = doc(firestore, 'REGISTRATION', registration_id);
                
                const newStatus = {
                    batch,
                    enrolledBy: user_code,
                    regType: reg_type,
                    reg_status: 3, // Set reg_status to 3 (enrolled)
                    date_enrolled: Timestamp.now()  // Set current date as enrollment date
                }
                await updateDoc(trainingRef, { ...newStatus })

                const newRegInfo = {
                    reg_no: reg_num,
                    regType: reg_type,  
                }
                await updateDoc(regRef, { ...newRegInfo })
            } else { 
                // then here, if the conditions are not met, it will create a new registration document that links to the
                // and creates a new registration number
                const newRegistration: REGISTRATION = {
                    trainee_ref_id: trainee_id,         // You can adjust the reference field as needed
                    reg_no: reg_num,                  // Use the incremented reg_no
                    regApproach: 0,                    
                    traineeType: 0,    
                    regType: reg_type,                
                    payment_status: 2,                 
                    payment_mode: 0,                   
                    payment_balance: 0,                
                    date_registered: Timestamp.now(),  // Current timestamp
                    reg_remarks: '',
                    marketing: '',
                    otherMarketing: '',
                    reg_accountType: reg_account_type,              
                };
                const idRef: DocumentReference = await addDoc(registration, {...newRegistration})

                const trainingRef = doc(firestore, 'TRAINING', training_id)
                const newStatus= {
                    batch,
                    enrolledBy: user_code,
                    reg_ref_id: idRef.id,
                    regType: reg_type,
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

export const updateTraineeAttachments = async(id: string, trainee: any, files: any, staff: string) => {
    try{
        const { last_name, first_name } = trainee
        const updates: Record<string, string> = {}

        const fileConfig = [
            {key: 'valid_id', data: files.validID, check: files.file, suffix: 'validID', folder: 'valid_id'},
            {key: 'photo', data: files.validPfp, check: files.pfpFile, suffix: 'idPic', folder: 'photos'},
            {key: 'e_sig', data: files.validSignature, check: files.sig_file, suffix: 'esign', folder: 'e-signs'},
            {key: 'mismoSC', data: files.screenshotFile, check: files.sc_fileName, suffix: 'mismo', folder: 'MISMO'},
            {key: 'medCert', data: files.medCertFile, check: files.mc_fileName, suffix: 'medCert', folder: 'MEDICAL_CERTS'},
            {key: 'cop', data: files.copFile, check: files.cop_fileName, suffix: 'cop', folder: 'CERTIFICATE_OF_PROFICIENCY'},
            {key: 'ssr', data: files.ssrFile, check: files.ssr_fileName, suffix: 'ssr', folder: 'SEA_SERVICE_RECORDS'},
        ]

        await Promise.all(fileConfig.map(async (item) => {
            if(item.check && item.check !== 'No file chosen yet...'){
                const storagePath = `TRAINEES/${item.folder}/${last_name}_${first_name}_${item.suffix}.jpg`
                const storageRef = ref(storage, storagePath)
                const snapshot = await uploadBytes(storageRef, item.data[0])
                updates[item.key] = await getDownloadURL(snapshot.ref)
            }
        }))

        if(Object.keys(updates).length > 0){
            const traineeRef = doc(firestore, 'TRAINEES', id)
            await updateDoc(traineeRef, updates)
            //await addLog(staff, `Attachments for ${first_name} ${last_name} updated.`, 'TRAINEES', id) 
        }
        return updates
    }catch(err){
        console.error(err)
        throw err
    }
}

// Obsolete, find this function on other files then replace it with the new function above
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
            const idRef = ref(storage, `TRAINEES/${attachment_type}/${last_name}_${first_name}_${cat}.jpg`);
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

// * Report
export const GET_MONTHLY_DATA = async (currentMonth: number, currentYear: number, reg_type: number): Promise<TRAINING_BY_ID[]> => {
    try {
        // Query for registration
        const trainingQuery = query(
            training,
            where("reg_status", "==", 3),
            where("regType", "==", reg_type),
            where("date_enrolled", ">=", new Date(currentYear, currentMonth, 1, 0, 0, 0, 0)),
            where("date_enrolled", "<=", new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)),
        );
        
        const querySnapshot = await getDocs(trainingQuery);
        const data: TRAINING_BY_ID[] = [];

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as TRAINING_BY_ID;
                docData.id = doc.id;
                data.push(docData);
            });
        }

        return data; // ✅ safely returning inside try
    } catch (error) {
        console.error(error);
        return []; // ✅ ensures a return in case of error
    }
};
