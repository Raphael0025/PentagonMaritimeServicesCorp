import { addDoc, deleteDoc, getDoc, updateDoc, setDoc, doc, getDocs, DocumentReference, query, orderBy, where, collection, getFirestore, Timestamp } from 'firebase/firestore'
import { app } from './firebase'

import { CoursesById, Courses, CoursePromo, CoursePromoById, CoursePromoPeriod, CoursePromoPeriodById, Promo, PromoById} from '@/types/courses'

import { addLog } from '@/lib/history_log_controller'

import { generateCourseCode } from '@/handlers/course_handler'

export const firestore = getFirestore(app)

export const courses_mgmt = collection(firestore, 'courses')
export const course_promos = collection(firestore, 'course_promos')
export const coursePromos = collection(firestore, 'coursePromos')
export const promoPeriods = collection(firestore, 'promoPeriods')

export const INSERT_COURSE_PROMO = async (promoObj: CoursePromo, actor: string | null) => {
    try{
        const newPromoObj = {
            ...promoObj,
            createdAt: Timestamp.now()
        }
        const promoDoc: DocumentReference = await addDoc(coursePromos, {...newPromoObj})
        await addLog(actor, `Course Promo was created`, 'coursePromos', promoDoc.id)
        return promoDoc.id
    }catch(error){
        throw error
    }
}

export const INSERT_PROMO_PERIOD = async (promoPeriodObj: CoursePromoPeriod, actor: string | null) => {
    try{
        const newPromoPeriod = {
            ...promoPeriodObj,
            createdAt: Timestamp.now()
        }
        const periodDoc: DocumentReference = await addDoc(promoPeriods, {...newPromoPeriod})
        await addLog(actor, 'Promo Period Inserted successfully', 'promoPeriod', periodDoc.id)
    }catch(error){
        throw error
    }
}

export const FETCH_COURSE_PROMOS = async () => {
    try{
        const collectionQuery = query(coursePromos)
        const querySnapshot = await getDocs(collectionQuery)
        const data: CoursePromoById[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as CoursePromoById
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
            })
            return data
        }else{
            return data
        }
    }catch(error){
        throw error
    }
}



export const UPDATE_COURSE_PROMO = async (id: string, coursePromo: CoursePromo, actor: string | null) => {
    try{
        const promoRef = doc(firestore, 'coursePromos', id)
        await updateDoc(promoRef, {...coursePromo})

        await addLog(actor, 'Course Promo Updated', 'coursePromos', id)
    }catch(error){
        throw error
    }
}

export const UPDATE_PROMO_PERIOD  = async (id: string, promoPeriod: CoursePromoPeriod, actor: string | null) => {
    try{
        const periodRef = doc(firestore, 'promoPeriods', id)
        await updateDoc(periodRef, {...promoPeriod})

        await addLog(actor, 'Promo Period Updated', 'promoPeriods', id)
    }catch(error){
        throw error
    }
}

export const DELETE_PROMO_PERIOD = async (id: string) => {
    try{
        const clientWithID: DocumentReference = doc(firestore, 'promoPeriods', id)
        await deleteDoc(clientWithID)
    }catch(error){
        throw error

    }
}

export const DELETE_COURSE_PROMO = async (id: string) => {
    try{
        const clientWithID: DocumentReference = doc(firestore, 'coursePromos', id)
        await deleteDoc(clientWithID)
    }catch(error){
        throw error
    }
}

export const FORCE_STOP_PROMO = async (id: string, actor: string | null) => {
    try{
        const docRef = doc(firestore, 'coursePromos', id)

        await updateDoc(docRef, {forceToEnd: true})

        await addLog(actor, 'This Course Promo was stopped', 'coursePromos', id) 
    }catch(error){
        throw error
    }
}

export const FORCE_STOP_PERIOD = async (id: string, actor: string | null) => {
    try{
        const docRef = doc(firestore, 'promoPeriods', id)

        await updateDoc(docRef, {forceToEnd: true})

        await addLog(actor, 'This Promo period was stopped', 'promoPeriods', id) 
    }catch(error){
        throw error
    }
}

export const FETCH_PROMO_PERIODS = async () => {
    try{
        const collectionQuery = query(coursePromos)
        const querySnapshot = await getDocs(collectionQuery)
        const data: CoursePromoPeriodById[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const { start_date, end_date, ...rest } = doc.data() as CoursePromoPeriodById
                const startDate = start_date instanceof Timestamp ? start_date.toDate() : new Date(0)
                const endDate = end_date instanceof Timestamp ? end_date.toDate() : new Date(0)

                data.push({
                    ...rest,        
                    id: doc.id,     
                    start_date: startDate,  
                    end_date: endDate,      
                })
            })
            return data
        }else{
            return data
        }
    }catch(error){
        throw error
    }
}

export const addCoursePromo = async (promoObj: Promo, course: string, actor: string | null) => {
    try{
        const createdAt = Timestamp.now()
        const newPromoObj = {
            ...promoObj,
            createdAt,
        }
        const promo = await addDoc(course_promos, {...newPromoObj})
        await addLog(actor, `Created a new Promo for ${course}`, 'course_promos', promo.id)
    }catch(error){
        throw error
    }
}

export const getCoursePromo = async () => {
    try{
        const collectionQuery = query(course_promos)
        const querySnapshot = await getDocs(collectionQuery)
        const data: PromoById[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const { start_date, end_date, ...rest } = doc.data() as PromoById
                const startDate = (start_date as unknown as Timestamp).toDate()
                const endDate = (end_date as unknown as Timestamp).toDate()

                data.push({
                    ...rest,        
                    id: doc.id,     
                    start_date: startDate,  
                    end_date: endDate,      
                })
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}

export const stopCoursePromo = async (promoID: string, actor: string | null) => {
    try{
        const promoData = doc(firestore, `course_promos/${promoID}`)
        await updateDoc(promoData, {forceToEnd: true})

        await addLog(actor, 'Forced to Stop a Promo before due.', 'course_promos', promoID)
    } catch(error){
        throw error
    }
}

export const addCourse = async (newCourse: Courses, actor: string | null) => {
    try {
        // Generate the course code and add it to newCourse
        const courseCode = generateCourseCode(newCourse);
        const newCourseWithCode = { 
            ...newCourse, 
            code: courseCode,
            createdAt: Timestamp.now()
        };

        // Add the course to the database
        const newCourseRef = await addDoc(courses_mgmt, newCourseWithCode);

        // Log the creation of the new course
        await addLog(actor, `Created ${newCourse.course_name} as new Course.`, 'courses', newCourseRef.id);
    } catch (error) {
        throw error;
    }
};

// Get necessary Data 
export const getAllCourses = async (): Promise<CoursesById[]> => {
    try{
        const q = query(courses_mgmt);
        const querySnapshot = await getDocs(q)
        const data: CoursesById[] = [];
        querySnapshot.forEach((doc) => {
            const docData = doc.data() as CoursesById
            docData.id = doc.id
            data.push(docData)
        })
        return data
    } catch(error){
        throw error
    }
}

// Delete Course
export const deleteCourse = async (id: string, courseName: string, actor: string | null) => {
    try{
        const course = doc(firestore, `courses/${id}`)
        await deleteDoc(course)
        await addLog(actor, `Course: ${courseName} has been Deleted.`, 'courses', id)
    } catch(error){
        throw error
    }
}

// Edit Course
export const editCourse = async (courseObj: CoursesById, actor: string | null) => {
    try{
        const getDoc = doc(firestore, `courses/${courseObj.id}`)
        await setDoc(getDoc, courseObj, {merge: true})
        await addLog(actor, `New Details for this course ${courseObj.course_code} has been saved.`, 'courses', courseObj.id)
    } catch(error){
        throw error
    }
}

// Edit Trainings
export const editTrainingSchedule = async (id: string, actor: string | null, trainee: string, trainingSched: string) => {
    try{
        const trainingDoc = doc(firestore, `training/${id}`)
        await updateDoc(trainingDoc, {training_sched: trainingSched})
        await addLog(actor, `Training Schedule for ${trainee} was changed.`, 'trainings', id)
    }catch(error){
        throw error
    }
}