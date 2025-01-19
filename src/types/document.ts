import { Timestamp } from 'firebase/firestore'
export interface FormValues {
    user_code: string;
    password: string;
}

export interface touchValues {
    user_code: boolean;
    password: boolean;
}

export interface prioFields {
    fName: boolean,
    lName: boolean,
    gender: boolean;
    birthDate: boolean;
    birthPlace: boolean;
    age: boolean;
    status: boolean;
    address: boolean;
    phone: boolean;
    email: boolean;
    citizenship: boolean;
    religion: boolean;
}

export const prioState: prioFields = {
    fName: false,
    lName: false,
    gender: false,
    birthDate: false,
    birthPlace: false,
    age: false,
    status: false,
    address: false,
    phone: false,
    email: false,
    citizenship: false,
    religion: false,
}

export interface prioTraineeInfoFields {
    srn: boolean;
    last_name: boolean;
    given_name: boolean;
    rank: boolean;
    company: boolean;
    vesselType: boolean;
    address: boolean;
    phone: boolean;
    email: boolean;
    nationality: boolean;
    gender: boolean;
    birth_date: boolean;
    birth_place: boolean;
    contact_person: boolean,
    contact: boolean,
    relationship: boolean,
    contact_address: boolean,
    marketing_type: boolean;
}

export const initTraineeFields: prioTraineeInfoFields = {
    srn: false,
    last_name: false,
    given_name: false,
    rank: false,
    company: false,
    vesselType: false,
    address: false,
    phone: false,
    email: false,
    nationality: false,
    gender: false,
    birth_date: false,
    birth_place: false,
    contact_person: false,
    contact: false,
    relationship: false,
    contact_address: false,
    marketing_type: false,
}

export interface SelectedCourses{
    courseSelected: string;
    training_sched: string;
    timeSched: string;
    status: string;
    payment_mode: string;
    ttl_fee: number;
}

export interface CourseCount {
    [key: string]:  number; // Index signature allowing indexing by string keys
}
// Initialize the initial state as an empty array of CourseCount
export const initialCourseCounts: CourseCount = {};

export interface CompanyCount {
    [company: string]: number;
}

export interface NewStaffValues{
    full_name: string;
    gender: string;
    birthDate: string | null;
    age: number;
    status: string;
    address: string;
    province: string;
    phone: string;
    email: string;
    birthPlace: string;
    contact_person: string;
    emergency_contact: string;
    relationship: string;
    contact_address: string;
    sss: string;
    philhealth: string;
    hdmf: string;
    tin: string;
    dependents: Record<string, ImmediateDependents>;
    educational_attainment: Record<string, EducationalAttainment>;
    work_exp: Record<string, WorkExperience>;
    training_history: Record<string, TrainingHistory>;
    roles: Record<string, Role>;
}

export interface WorkExperience{
    company: string;
    position: string;
    stats: string;
    company_address: string;
    reason_leave: string;
    inc_dates: {from: string, to: string};
}

export interface EducationalAttainment{
    attainment: string;
    school: string;
    degree: string;
    inc_dates: {from: string, to: string};
}

export interface TrainingHistory{
    training_title: string;
    training_provider: string;
    inc_dates: {from: string, to: string};
}

export interface Role{
    emp_type: string;
    emp_cat: string;
    job_position: string;
    department: string;
    rank: number;
}   

export interface ImmediateDependents{
    name: string,
    dependent_relationship: string,
    dependent_gender: string;
    dependent_birth_date: string;
}

export const initStaffValues : NewStaffValues = {
    full_name: '',
    gender: '',
    birthDate: '',
    age: 0,
    status: '',
    address: '',
    province: '',
    phone: '',
    email: '',
    birthPlace: '',
    contact_person: '',
    emergency_contact: '',
    relationship: '',
    contact_address: '',
    sss: '',
    philhealth: '',
    hdmf: '',
    tin: '',
    dependents: {},
    educational_attainment: {},
    work_exp: {},
    training_history: {},
    roles: {},
}

export interface CandidateValues{
    id: string,
    candidate_added: string,
    user_code: number;
    full_name: string;
    emp_status: string;
    application_type: string;
    department: string; // Add department property
    job_position: string; // Add job_position property
}

export const initCandidateData: CandidateValues = {
    id: '',
    candidate_added: '',
    user_code: 0,
    full_name: '',
    emp_status: '',
    application_type: '',
    department: '',
    job_position: '',
}

export interface ViewCandidateValues{
    id: string;
    candidate_added: Timestamp;
    user_code: number;
    e_sig: string;
    pfp: string;
    emp_status: string;
    application_type: string;
    full_name: string;
    gender: string;
    password: string;
    birthDate: Date;
    age: number;
    status: string;
    address: string;
    phone: string;
    email: string;
    birthPlace: string;
    province: string;
    contact_person: string;
    emergency_contact: string;
    relationship: string;
    contact_address: string;
    hdmf: string;
    sss: string;
    tin: string;
    philhealth: string;
    dependents: Record<string, ImmediateDependents>;
    educational_attainment: Record<string, EducationalAttainment>;
    work_exp: Record<string, WorkExperience>;
    training_history: Record<string, TrainingHistory>;
    roles: Record<string, Role>;
}

export const initViewCandidate : ViewCandidateValues = {
    id: '',
    candidate_added: Timestamp.now(),
    user_code: 0,
    password: '',
    emp_status: '',
    pfp: '',
    e_sig: '',
    application_type: '',
    full_name: '',
    gender: '',
    birthDate: new Date(),
    age: 0,
    status: '',
    address: '',
    phone: '',
    email: '',
    birthPlace: '',
    province: '',
    contact_person: '',
    emergency_contact: '',
    relationship: '',
    contact_address: '',
    hdmf: '',
    sss: '',
    tin: '',
    philhealth: '',
    dependents: {},
    educational_attainment: {},
    work_exp: {},
    training_history: {},
    roles: {},
}

export interface filledFields {
    field1: boolean;
    field2: boolean;
    field3: boolean;
    field4: boolean;
    eduField1: boolean;
    eduField2: boolean;
    eduField3: boolean;
    eduField4: boolean;
    eduField5: boolean;
    workField1: boolean;
    workField2: boolean;
    workField3: boolean;
    workField4: boolean;
    workField5: boolean;
    workField6: boolean;
    workField7: boolean;
    trainingField1: boolean;
    trainingField2: boolean;
    trainingField3: boolean;
    trainingField4: boolean;
    jobField1: boolean;
    jobField2: boolean;
    jobField3: boolean;
    jobField4: boolean;
    jobField5: boolean;
}

export const initFillFields: filledFields = {
    field1: false,
    field2: false,
    field3: false,
    field4: false,
    eduField1: false,
    eduField2: false,
    eduField3: false,
    eduField4: false,
    eduField5: false,
    workField1: false,
    workField2: false,
    workField3: false,
    workField4: false,
    workField5: false,
    workField6: false,
    workField7: false,
    trainingField1: false,
    trainingField2: false,
    trainingField3: false,
    trainingField4: false,
    jobField1: false,
    jobField2: false,
    jobField3: false,
    jobField4: false,
    jobField5: false,
}

export interface HistoryLog{
    actor: string,
    action: string,
    date_created: string,
}
