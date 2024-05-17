import { Firestore, addDoc, DocumentData, DocumentSnapshot, QueryDocumentSnapshot, deleteDoc, getDoc, updateDoc, setDoc, doc, arrayUnion, getDocs, query, orderBy, limit, where, collection, getFirestore, getCountFromServer, serverTimestamp, increment } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadString, getStorage, deleteObject } from 'firebase/storage'
import { storage } from './firebase'
import { app } from './firebase'

import { NewStaffValues, CandidateValues, Role, Course, GetCourses, ReadCourses, newPromo, EditCourses, CompanyCharge, CourseHistoryLog, TraineeInfo } from '@/types/document'
import { generateUserCode } from '@/types/handling'

export const firestore = getFirestore(app)

// User in the company Collection
export const companyUsers = collection(firestore, 'company_users')

// User in the enrollees Collection
export const enrollees = collection(firestore, 'enrollees')

// User in the courses Collection
export const courses = collection(firestore, 'course_mgmt')

// Function to check if the generated user code already exists in the database
const checkUserCodeExists = async (userCode: number) => {
    const q = query(companyUsers, where('userCode', '==', userCode));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Return true if user code exists, false otherwise
};

// Add Trainee to db 
export const addNewTrainee = async (traineeInfo: TraineeInfo, validID: any, file: string, profileID: any, pfpFile: string, validSignature: any, sig_file: string, sign: string, sign_name: string, proofPayment: any, payment_file: string) => {
    try{
        // Upload valid id to Storage
        const idRef = ref(storage, `trainees/valid_id/${file}`)
        const id_data = await uploadBytes(idRef, validID[0])
        const id_url = await getDownloadURL(id_data.ref)

        // Upload valid pfp to Storage
        const pfpRef = ref(storage, `trainees/photos/${pfpFile}`)
        const pfp_data = await uploadBytes(pfpRef, profileID[0])
        const pfp_url = await getDownloadURL(pfp_data.ref)
        
        // Upload valid signature to Storage
        const sigRef = ref(storage, `trainees/e-signs/${sig_file}`)
        const sig_data = await uploadBytes(sigRef, validSignature[0])
        const sig_url = await getDownloadURL(sig_data.ref)
    
        // create file ref
        const e_signature = ref(storage, `/trainees/e-signs/${sign_name}`)
        // Upload file to Storage
        await uploadString(e_signature, sign, 'data_url')
        // get download url
        const signatureURL = await getDownloadURL(e_signature)
        
        // Upload valid id to Storage
        const paymentRef = ref(storage, `trainees/proof_of_payment/${payment_file}`)
        const payment_data = await uploadBytes(paymentRef, proofPayment[0])
        const payment_url = await getDownloadURL(payment_data.ref)

        
        const newTrainee = {
            ...traineeInfo,
            e_sig: validSignature.length > 0 ? sig_url : signatureURL,
            pfp: pfp_url,
            proof_payment: payment_url,
            valid_id: id_url,
        }

        const traineeAdded = await addDoc(enrollees, {
            ...newTrainee,
            trainee_added: serverTimestamp(),
        })
    }catch(error){
        console.error('Error adding trainee: ', error)
        throw error
    }
}

// Add Candidate to db
export const addCandidate = async (staffVal: NewStaffValues, fileData: any, file: string, sign: string, sign_name: string, staff_status: string, app_type: string) => {
    let userCode: number = 0;
    try{
        // Upload file to Storage
        const fileRef = ref(storage, `company_users/photos/${file}`)
        const data = await uploadBytes(fileRef, fileData[0])
        const url = await getDownloadURL(data.ref)
        
        // create file ref
        const e_signature = ref(storage, `/company_users/signatures/${sign_name}`)
        // Upload file to Storage
        await uploadString(e_signature, sign, 'data_url')
        // get download url
        const signatureURL = await getDownloadURL(e_signature)

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
            e_sig: signatureURL,
            password: `pentagon_${userCode}`,
            pfp: url,
        }

        const staffAdded = await addDoc(companyUsers, {
            ...staffData,
            candidate_added: serverTimestamp(),
        })
        return staffAdded.id;
    }catch(error){
        console.error('Error adding candidate: ', error)
        throw error
    }
}

// Add Candidate to db
export const addCourse = async (courseObj: Course, staff: string | null) => {
    // Create a new Date object representing the current date and time
    const currentDate = new Date();

    // Options for formatting the date
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    // Get the formatted date string
    const formattedDate = currentDate.toLocaleDateString('en-US', options);

    try{
        const courseDetails = {
            ...courseObj,
            history_log: [
                {
                    actor: staff,
                    action: 'created',
                    date_created: formattedDate,
                }
            ]
        }

        const courseAdded = await addDoc(courses, {
            ...courseDetails
        })

        return courseAdded.id;
    }catch(error){
        console.error('Error adding course: ', error)
        throw error
    }
}

// Get necessary Data 
export const getAllCourses = async (): Promise<ReadCourses[]> => {
    try{
        const q = query(collection(firestore, 'course_mgmt'));
        const querySnapshot = await getDocs(q)
        const data: ReadCourses[] = [];

        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            // Add document ID to the data object
            const courseData: ReadCourses = {
                id: doc.id,
                course_code: docData.course_code,
                course_name: docData.course_name,
                course_fee: docData.course_fee,
                day: docData.day,
                timeSched: docData.timeSched,
                numOfDays: docData.numOfDays,
                history_log: docData.history_log,
                company_charge: docData.company_charge
            };
            data.push(courseData);
        })
        return data
    } catch(error){
        throw error
    }
}

// Get necessary Data 
export const getAllRegistrationCourses = async (): Promise<GetCourses[]> => {
    try{
        const q = query(collection(firestore, 'course_mgmt'));
        const querySnapshot = await getDocs(q)
        const data: GetCourses[] = [];

        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            // Add document ID to the data object
            const courseData: GetCourses = {
                id: doc.id,
                course_code: docData.course_code,
                course_name: docData.course_name,
                course_fee: docData.course_fee,
                day: docData.day,
                timeSched: docData.timeSched,
                numOfDays: docData.numOfDays,
                company_charge: docData.company_charge,
                hasPromo: docData.hasPromo,
                promo: docData.promo
            };
            data.push(courseData);
        })
        return data
    } catch(error){
        throw error
    }
}

// Delete Course
export const deleteCourse = async (id: string) => {
    try{
        const course = doc(firestore, `course_mgmt/${id}`)
        await deleteDoc(course)

    } catch(error){
        throw error
    }
}

// Edit Course
export const editCourse = async (id: string, courseObj: EditCourses, staff: string | null) => {
    // Create a new Date object representing the current date and time
    const currentDate = new Date();

    // Options for formatting the date
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    // Get the formatted date string
    const formattedDate = currentDate.toLocaleDateString('en-US', options);

    try{
        const newHistoryEntry = {
            actor: staff,
            action: 'updated',
            date_created: formattedDate,
        }

        // Append the new history log entry to the existing history log
        const updatedHistoryLog = [newHistoryEntry, ...courseObj.history_log]

        // Update the course object with the new history log
        const updatedCourseObj = {
            ...courseObj,
            history_log: updatedHistoryLog,
        };

        // Add document to Firestore
        const getDoc = doc(firestore, `course_mgmt/${id}`)
        await setDoc(getDoc, updatedCourseObj, {merge: true})
        console.log('Course updated successfully')
    } catch(error){
        throw error
    }
}

// Edit Company Charge
export const editCompanyCharge = async (id: string, newCompanyCharge: ReadCourses, staff: string | null) => {
    try {
        // Create a new Date object representing the current date and time
        const currentDate = new Date()
        // Options for formatting the date
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        // Get the formatted date string
        const formattedDate = currentDate.toLocaleDateString('en-US', options)

        // Create a new history log entry
        const newHistoryEntry = {
            actor: staff,
            action: 'updated company charge',
            date_created: formattedDate,
        }

        // Construct the updated data object with the new company charge and updated history log
        const updatedData = {
            company_charge: newCompanyCharge.company_charge,
            // Append the new history log entry to the existing history log
            history_log: [newHistoryEntry, ...newCompanyCharge.history_log],
        }

        // Reference to the document in Firestore
        const docRef = doc(firestore, 'course_mgmt', id);

        // Update the specified document using updateDoc
        await updateDoc(docRef, updatedData);

        console.log('Company charge updated successfully');
    } catch (error) {
        throw error;
    }
}

// Add Candidate to db
export const addPromo = async (id: string, promo: newPromo, staff: string | null, hasPromo: boolean) => {
    // Create a new Date object representing the current date and time
    const currentDate = new Date();
    // Options for formatting the date
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // Get the formatted date string
    const formattedDate = currentDate.toLocaleDateString('en-US', options);
    
    try{
        const courseMgmt  = doc(firestore, `course_mgmt/${id}`)
        const courseSnap = await getDoc(courseMgmt);
        // Create a new history log entry
        const newHistoryEntry = {
            actor: staff,
            action: hasPromo ? `promo changed` : `promo added`,
            date_created: formattedDate,
        };
        // Check if the document exists
        if (courseSnap.exists()) {
            // Get the current data
            const courseData = courseSnap.data();
            // Update the data with new values
            const updatedData = {
                ...courseData,
                hasPromo: true,
                promo: promo,
                history_log: [newHistoryEntry, ...courseData.history_log],
            };
            // Write the updated data back to Firestore
            await setDoc(courseMgmt, updatedData);
        } else {
            throw new Error('Promo document not found');
        }
    }catch(error){
        console.error('Error adding promo: ', error)
        throw error
    }
}

// Function to get the total number of candidates with application type "online"
export const getTotalCandidates = async (app_type: string): Promise<number> => {
    const q = query(companyUsers, where('application_type', '==', app_type));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}

// Function to get the total number of candidates with application type "online"
export const getTotalEmployees = async (empCat: string): Promise<number> => {
    try{
        const q = query(collection(firestore, 'company_users'));
        const querySnapshot = await getDocs(q);
        let totalCount = 0;

        if(empCat === 'all'){
            const q = query(companyUsers);
            const querySnapshot = await getDocs(q);
            return querySnapshot.size;
        } else {
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                const roles: Record<string, Role> = docData.roles;

                // Iterate over the keys (role IDs) of the roles object
                Object.keys(roles).forEach((roleId) => {
                    const role = roles[roleId];
                    if (role.emp_cat === empCat) {
                        totalCount++;
                    }
                });
            });

            return totalCount;
        } 
    } catch(error){
        throw error
    }
    return 0
}

// Get necessary Data 
export const getAllCandidateData = async (stats: string): Promise<CandidateValues[]> => {
    try{
        const q = query(collection(firestore, 'company_users'), where('emp_status', '==', stats));

        const querySnapshot = await getDocs(q)
        const data: CandidateValues[] = [];

        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            const candidate_added = docData.candidate_added?.toDate().toLocaleString(); // Convert to Date object
            const roles: Record<string, Role> = docData.roles; 

            let departments: string[] = [];
            let jobPositions: string[] = [];

            // Iterate over the keys (role IDs) of the roles object
            Object.keys(roles).forEach((roleId) => {
                const role = roles[roleId];
                departments.push(role.department);
                jobPositions.push(role.job_position);
            });

            const candidate: CandidateValues = {
                id: doc.id,
                candidate_added: candidate_added,
                user_code: docData.user_code,
                full_name: docData.full_name,
                emp_status: docData.emp_status,
                application_type: docData.application_type,
                department: departments.join(" / "),
                job_position: jobPositions.join(" / ")
            };
            data.push(candidate);
        })
        return data
    } catch(error){
        throw error
    }
}

// Delete Candidate
export const deleteCandidate = async (id: string) => {
    try{
        const candidate = doc(firestore, `company_users/${id}`)
        await deleteDoc(candidate)

    } catch(error){
        throw error
    }
}

// Hire Candidate
export const hireCandidate = async (id: string) => {
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
            await setDoc(candidateRef, updatedData);
        } else {
            throw new Error('Candidate document not found');
        }
    }catch(error){
        throw error
    }
}

export const getCandidate = async (id: string) => {
    try{
        const candidateRef  = doc(firestore, `company_users/${id}`)
        const candidateSnap = await getDoc(candidateRef)

        // Check if the document exists
        if (candidateSnap.exists()) {
            // Access the data of the candidate using .data()
            const candidateData = candidateSnap.data();
            return candidateData;
        } else {
            // Handle the case where the document doesn't exist
            throw new Error('Candidate not found');
        }
    }catch(error){
        throw error
    }
}

// Login user
export const loginUser = async (userCode: string, password: string) => {
    
    console.log(userCode + ' ' + password)
    try {
        const q = query(companyUsers, where('user_code', '==', userCode));
        const querySnapshot = await getDocs(q);

        // Check if any documents were returned
        if (querySnapshot.empty) {
            alert('User not found.');
            throw new Error('User not found');
        }

        // Get the first user matching the username
        const user = querySnapshot.docs[0].data();
        console.log(user)
        // Check if the password matches
        if (user.password !== password) {
            alert('Password is incorrect.')
            throw new Error('Incorrect password');
        }

        // User is authenticated
        console.log('User logged in:', user);

        // Store the user's ID in localStorage for sessions
        localStorage.setItem('customToken', user.full_name);
        // Store the user's PFP in localStorage for sessions
        localStorage.setItem('pfpToken', user.pfp);

        // You can return the user object or any relevant information
        return user;
    } catch (error) {
        console.error('Error logging in:');
        throw error;
    }
}