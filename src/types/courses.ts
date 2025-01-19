import { Timestamp } from 'firebase/firestore'

export interface CoursesById extends Courses {
    id: string;
    code: string;
    createdAt: Timestamp;
}

export interface Courses{
    course_code: string;
    course_name: string;
    course_fee: number;
    day: string;
    startTime: Timestamp;
    endTime: Timestamp;
    trainingMode: number; // 0 - NS | 1 - Simu
    numOfDays: number;
    courseType: number; // 0 - Marina | 1 - In-house  
}

export const initCourses = {
    course_code: '',
    course_name: '',
    course_fee: 0,
    day: '',
    numOfDays: 0,
    courseType: 2,
    trainingMode: 2,
    startTime: Timestamp.now(),
    endTime: Timestamp.now(),
}

export const initCoursesById = {
    id: '',
    code: '',
    course_code: '',
    course_name: '',
    course_fee: 0,
    day: '',
    startTime: Timestamp.now(),
    endTime: Timestamp.now(),
    courseType: 2,
    numOfDays: 0,
    trainingMode: 2,
    createdAt: Timestamp.now()
}

export interface Promo{
    end_date: Date;
    start_date: Date;
    rate: number;
    forceToEnd: boolean;
    numOfPromoDays: number;
    ref_course_id: string;
}

export interface PromoById extends Promo {
    id: string;
    createdAt: Timestamp;
}

export interface CoursePromo{
    course_ref: string;
    forceToEnd: boolean;
    rate: number;
}

export const initCoursePromo = {
    course_ref: '',
    forceToEnd: false,
    rate: 0,
}

export interface CoursePromoById extends CoursePromo{
    id: string;
    createdAt: Timestamp;
}

export interface CoursePromoPeriod {
    start_date: Date;
    end_date: Date;
    numOfPromoDays: number;
    forceToEnd: boolean; // Decide if include or nah
    course_promo_ref: string;
}

export interface CoursePromoPeriodById extends CoursePromoPeriod {
    id: string;
    createdAt: Timestamp;
}