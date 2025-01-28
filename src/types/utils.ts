import { Timestamp } from 'firebase/firestore'

export interface TICKET {
    actor: string | null;
    category: number; // 0 - soft | 1 - hard
    createdAt: Timestamp;
    title: string;
    issue: string;
    prio: number; // 0 - low | 1 - med | 2 - high
    status: number; // 0 - open | 1 - in progress | 2 - resolved | 3 - closed
    ticket_id: string;
}

export interface TICKET_BY_ID extends TICKET{
    id: string;
}

export interface DEPARTMENT{
    name: string;
    code: string;
}

export const initDept = {
    name: '',
    code: '',
}

export interface DEPARTMENT_ID extends DEPARTMENT{
    id: string;
    createdAt: Timestamp;
}

export const initDeptID = {
    id: '',
    name: '',
    code: '',
    createdAt: Timestamp.now()
}

export interface CATALOGUE{
    type: string;
    code: string;
    value: string;
    departmentID: string;
}

export interface CATALOGUE_TYPE{
    type_code: number;
    type_value: string;
}

export interface CATALOGUE_TYPE_ID extends CATALOGUE_TYPE{
    id: string;
    createdAt: Timestamp;
}

export interface CATALOGUE_ID extends CATALOGUE{
    id: string;
    createdAt: Timestamp;
}

export interface SelectedCourses{
    courseSelected: string;
    training_sched: string;
    timeSched: string;
    status: string;
    payment_mode: string;
    ttl_fee: number;
}

export const initSelectedCourses:SelectedCourses = {
    courseSelected: '',
    training_sched: '',
    timeSched: '',
    status: '',
    payment_mode: '',
    ttl_fee: 0,
}

export interface HistoryLog{
    actor: string | null,
    action: string,
    date_created: string,
    id_ref: string,
    collection_ref: string,
}

export interface HistoryLogWithID extends HistoryLog{
    id:string
}

export type UpdateFilter = (category: string, value: string) => void

export interface FilterState {
    traineeFilter?: string;
    registrationFilter?: string;
    marketingFilter?: string;
    statusFilter?: string;
    [key: string]: any;
}

export interface CourseCount {
    [key: string]:  number; // Index signature allowing indexing by string keys
}
// Initialize the initial state as an empty array of CourseCount
export const initialCourseCounts: CourseCount = {};

export interface CompanyCount {
    [company: string]: number;
}

export interface PromoDates {
    startDate: Date;
    numOfPromoDays: number;
    endDate: Date;
    dateRange: string;
}

export interface SurveyData {
    user: {
        given_name: string;
        last_name: string;
        email: string;
        srn: string;
        instructorName: string;
        course: string;
    };
    answers: string[];
    answers2: string[];
    textarea1Answer: string;
    textarea2Answer: string;
    textarea3Answer: string;
    textarea4Answer: string;
    overall: string;
    submittedAt: Date;
}

export interface certificationDetails {
    registration_num: string;
    reg_id: string;
    training_id: string;
    trainee_name: string;
    course: string;
    description: string;
    batch_no: number;
    cert_released: Timestamp;
    cert_status: string;
    cert_no: string;
}

export const initCertificationDetails = {
    registration_num: '',
    reg_id: '',
    training_id: '',
    trainee_name: '',
    course: '',
    description: '',
    batch_no: 0,
    cert_released: Timestamp.now(),
    cert_status: '',
    cert_no: '',
}

export interface FullAddress {
    street: string;
    city: string;
    zip: string;
    house_no: string;
    brgy: string;
    subdivision: string;
} 

export const initFullAddress = {
    street: '',
    city: '',
    zip: '',
    house_no: '',
    brgy: '',
    subdivision: '',
} 

export interface SelectedTrainings {
    trainee: string;
    training_id: string;
    training_sched: string;
}