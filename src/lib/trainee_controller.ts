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
            const idRef = ref(storage, `TRAINEES/valid_id/${traineeType !== 0 ? 're-enroll_' : ''}${lastName}_${givenName}_validID.jpg`);
            const id_data = await uploadBytes(idRef, validID[0]);
            validURL = await getDownloadURL(id_data.ref);
        }
        if (pfpFile !== 'No file chosen yet...') {
            // Upload valid pfp to Storage
            const pfpRef = ref(storage, `TRAINEES/photos/${traineeType !== 0 ? 're-enroll_' : ''}${lastName}_${givenName}_idPic.jpg`);
            const pfp_data = await uploadBytes(pfpRef, profileID[0]);
            validProfileURL = await getDownloadURL(pfp_data.ref);
        }
        
        if (validSignature && validSignature.length > 0) {
            // Upload valid signature to Storage
            const sigRef = ref(storage, `TRAINEES/e-signs/${traineeType !== 0 ? 're-enroll_' : ''}${lastName}_${givenName}_esign.jpg`);
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
                reg_status: 2,
                isCertified: false,
                cert_released: Timestamp.now(),
                cert_status: 0,
                cert_no: '',
                practical: 0,
                written: 0,
                result: 0,
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
                reg_status: 3,
                isCertified: false,
                cert_released: Timestamp.now(),
                cert_status: 0,
                cert_no: '',
                practical: 0,
                written: 0,
                result: 0,
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

// export const addRegTypeField = async () => {
//     const trainingRef = collection(firestore, 'TRAINING'); // Adjust the collection name as needed
//     const registrationRef = collection(firestore, 'REGISTRATION');
    
//     try {
//         // Get all documents from the training collection
//         const trainingSnapshot = await getDocs(trainingRef);

//         for (const trainingDoc of trainingSnapshot.docs) {
//             const trainingData = trainingDoc.data();
//             const regType = trainingData.regType;
//             const regRefId = trainingData.reg_ref_id;
            
//             // Find the corresponding registration document by reg_ref_id
//             const regDocRef = doc(firestore, 'REGISTRATION', regRefId);
//             const regDocSnapshot = await getDoc(regDocRef);  // Use getDoc instead of getDocs for single document retrieval

//             if (regDocSnapshot.exists()) {
//                 const regData = regDocSnapshot.data();
                
//                 // Check if regType already exists in the registration document
//                 if (!regData.hasOwnProperty('regType')) {
//                     // If regType does not exist, add it
//                     await updateDoc(regDocRef, {
//                         regType: regType
//                     });
//                     console.log(`Added regType to document ${regRefId}`);
//                 } else {
//                     console.log(`regType already exists in document ${regRefId}, skipping.`);
//                 }
//             } else {
//                 console.log(`No matching document found for reg_ref_id: ${regRefId}`);
//             }
//         }

//     } catch (error) {
//         console.error('Error updating registration documents:', error);
//     }
// };

export const UPDATE_TRAINING = async (training_id: string, updateTrainingDoc: Partial<TRAINING>, actor: string | null) => {
    try{
        const trainingRef = doc(firestore, 'TRAINING', training_id)
        await updateDoc(trainingRef, updateTrainingDoc)
    }catch(error){
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

// export const UPDATE_TS = async (training_id: string, startDate: string, endDate: string, actor: string | null) => {
//     try{
//         const trainingRef = doc(firestore, 'TRAINING', training_id)
//         await updateDoc(trainingRef, {start_date: startDate, end_date: endDate})
//         await addLog(actor, 'Training Scheduled Updated', 'TRAINING', training_id)
//     }catch(error){
//         throw error
//     }
// }

// export const UPDATE_COURSE_FEE = async (training_id: string, course_fee: number, actor: string | null) => {
//     try{
//         const trainingRef = doc(firestore, 'TRAINING', training_id)
//         await updateDoc(trainingRef, {course_fee})
//         await addLog(actor, 'Training Fee Updated', 'TRAINING', training_id)
//     }catch(error){
//         throw error
//     }
// }

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

export const ENROLL_COURSE = async (batch: string, training_id: string, registration_id: string, trainee_id: string, reg_type: number, reg_account_type: number, actor: string | null) => {
    try {
        const reg_Collection_Snapshot = await getDocs(registration);

        // 🔹 Filter docs by regType to maintain separate numbering per type
        const filteredDocs = reg_Collection_Snapshot.docs.filter(
            (doc) => doc.data().regType === reg_type
        );

        const currentYear = new Date().getFullYear();
        let maxNum = 0;

        // 🔹 Extract max reg_no for this regType
        filteredDocs.forEach((doc) => {
            const regNo = doc.data().reg_no; // e.g., "2025-1001"
            if (!regNo) return;
            const parts = regNo.split("-");
            const numPart = parseInt(parts[1]);
            if (!isNaN(numPart) && numPart > maxNum) {
                maxNum = numPart;
            }
        });

        // 🔹 Generate new reg_no safely
        const newRegNo = `${currentYear}-${maxNum + 1}`;

        // 🔹 Fetch training documents using same registration
        const tQuery = query(training, where("reg_ref_id", "==", registration_id));
        const tQSnapshot = await getDocs(tQuery);
        const data: TRAINING_BY_ID[] = [];

        if (!tQSnapshot.empty) {
            const currDate = new Date();
            const currDateString = `${currDate.getFullYear()}-${String(
                currDate.getMonth() + 1
            ).padStart(2, "0")}-${String(currDate.getDate()).padStart(2, "0")}`;

            tQSnapshot.forEach((docSnap) => {
                const docData = docSnap.data() as TRAINING_BY_ID;
                docData.id = docSnap.id;
                data.push(docData);
            });

            const hasRegStat3 = data.some((doc) => doc.reg_status === 3);
            const hasMatchingDate = data.some((doc) => {
                if (doc.date_enrolled instanceof Timestamp) {
                    const enrolledDate = doc.date_enrolled.toDate();
                    const enrolledDateString = `${enrolledDate.getFullYear()}-${String(
                        enrolledDate.getMonth() + 1
                    ).padStart(2, "0")}-${String(enrolledDate.getDate()).padStart(2, "0")}`;
                    return enrolledDateString === currDateString;
                }
                return false;
            });

            // 🔹 Check if the registration type matches the current training’s regType
            const regRefSnap = await getDoc(doc(firestore, "REGISTRATION", registration_id));
            const existingRegType = regRefSnap.exists() ? regRefSnap.data().regType : null;

            // 🔸 If the regType differs, we must create a new REGISTRATION doc
            if (existingRegType !== null && existingRegType !== reg_type) {
                const newRegistration: REGISTRATION = {
                    trainee_ref_id: trainee_id,
                    reg_no: newRegNo,
                    regApproach: 0,
                    traineeType: 0,
                    regType: reg_type,
                    payment_status: 2,
                    payment_mode: 0,
                    payment_balance: 0,
                    date_registered: Timestamp.now(),
                    reg_remarks: "",
                    marketing: "",
                    otherMarketing: "",
                    reg_accountType: reg_account_type,
                };

                const idRef = await addDoc(registration, { ...newRegistration });

                const trainingRef = doc(firestore, "TRAINING", training_id);
                const newStatus = {
                    batch,
                    reg_ref_id: idRef.id,
                    regType: reg_type,
                    reg_status: 3,
                    date_enrolled: Timestamp.now(),
                };

                await updateDoc(trainingRef, { ...newStatus });
                await addLog(actor, "Registration was enrolled successfully", "TRAINING", training_id);
                return;
            }

            // 🔹 Existing regType matches
            if (hasRegStat3 && hasMatchingDate) {
                const trainingRef = doc(firestore, "TRAINING", training_id);
                await updateDoc(trainingRef, {
                    batch,
                    regType: reg_type,
                    reg_status: 3,
                    date_enrolled: Timestamp.now(),
                });
            } else if (!hasRegStat3) {
                const trainingRef = doc(firestore, "TRAINING", training_id);
                const regRef = doc(firestore, "REGISTRATION", registration_id);

                await updateDoc(trainingRef, {
                    batch,
                    regType: reg_type,
                    reg_status: 3,
                    date_enrolled: Timestamp.now(),
                });

                await updateDoc(regRef, {
                    reg_no: newRegNo,
                    regType: reg_type,
                });
            } else {
                const newRegistration: REGISTRATION = {
                    trainee_ref_id: trainee_id,
                    reg_no: newRegNo,
                    regApproach: 0,
                    traineeType: 0,
                    regType: reg_type,
                    payment_status: 2,
                    payment_mode: 0,
                    payment_balance: 0,
                    date_registered: Timestamp.now(),
                    reg_remarks: "",
                    marketing: "",
                    otherMarketing: "",
                    reg_accountType: reg_account_type,
                };

                const idRef = await addDoc(registration, { ...newRegistration });

                const trainingRef = doc(firestore, "TRAINING", training_id);
                await updateDoc(trainingRef, {
                    batch,
                    reg_ref_id: idRef.id,
                    regType: reg_type,
                    reg_status: 3,
                    date_enrolled: Timestamp.now(),
                });
            }

            await addLog(actor, "Registration was enrolled successfully", "TRAINING", training_id);
            return data;
        }
    } catch (error) {
        console.error("ENROLL_COURSE error:", error);
        throw error;
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
