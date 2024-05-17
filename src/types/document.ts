import { Timestamp } from 'firebase/firestore'
import firebase from 'firebase/app';

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
    marketing_type: false,
}

export interface TraineeInfo{
    srn: string;
    last_name: string;
    given_name: string;
    middle_name: string;
    suffix: string;
    rank: string;
    company: string;
    vesselType: string;
    others: string;
    address: string;
    phone: string;
    email: string;
    nationality: string;
    gender: string;
    birth_date: string;
    birth_place: string;
    contact_person: string;
    contact: string;
    relationship: string;
    contact_address: string;
    endorser: string;
    endorsed_company: string;
    endorser_phone: string;
}

export const initTraineeInfo: TraineeInfo = {
    srn: '',
    last_name: '',
    given_name: '',
    middle_name: '',
    suffix: '',
    rank: '',
    company: '',
    vesselType: '',
    others: '',
    address: '',
    phone: '',
    email: '',
    nationality: '',
    gender: '',
    birth_date: '',
    birth_place: '',
    contact_person: '',
    contact: '',
    relationship: '',
    contact_address: '',
    endorser: '',
    endorsed_company: '',
    endorser_phone: '',
}

export interface SelectedCourses{
    courseSelected: string;
    training_sched: string;
    timeSched: string;
    payment_mode: string;
    ttl_fee: number;
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

export interface Course{
    course_code: string;
    course_name: string;
    course_fee: number;
    day: string;
    timeSched: string;
    numOfDays: number;
    company_charge: Record<string, CompanyCharge>
}

export const initCourseVal: Course ={
    course_code: '',
    course_name: '',
    course_fee: 0,
    day: '',
    timeSched: '',
    numOfDays: 0,
    company_charge: {}
}

export const initCompanyCharge: CompanyCharge = {
    company: '',
    course_fee: 0,
}

export interface CompanyCharge{
    company: string,
    course_fee: number,
}

export interface companyFields{
    company: boolean,
    course_fee: boolean,
}

export const initCompanyFields: companyFields = {
    company: false,
    course_fee: false,
}

export interface ReadCourses{
    id: string;
    course_code: string;
    course_name: string;
    course_fee: number;
    day: string;
    timeSched: string;
    numOfDays: number;
    history_log: Record<string, CourseHistoryLog>;
    company_charge: Record<string, CompanyCharge>;
}

export interface CourseHistoryLog{
    actor: string,
    action: string,
    date_created: string,
}

export const initReadCourses: ReadCourses = {
    id: '',
    course_code: '',
    course_name: '',
    course_fee: 0,
    day: '',
    timeSched: '',
    numOfDays: 0,
    history_log: {} as Record<string, CourseHistoryLog>,
    company_charge: {}
}

export interface GetCourses{
    id: string;
    course_code: string;
    course_name: string;
    course_fee: number;
    day: string;
    timeSched: string;
    numOfDays: number;
    hasPromo:boolean;
    company_charge: Record<string, CompanyCharge>;
    promo: Record<string, getPromo>;
}

export interface getPromo{
    end_date: string;
    start_date: string;
    rate: number;
    numOfPromoDays: string;
}

export const initGetCourses: GetCourses = {
    id: '',
    course_code: '',
    course_name: '',
    course_fee: 0,
    day: '',
    timeSched: '',
    numOfDays: 0,
    hasPromo: false,
    company_charge: {},
    promo: {},
}

export interface EditCourses{
    id: string;
    course_code: string;
    course_name: string;
    course_fee: number;
    day: string;
    timeSched: string;
    numOfDays: string;
    history_log: Record<string, CourseHistoryLog>;
}

export const initEditCourses: EditCourses = {
    id: '',
    course_code: '',
    course_name: '',
    course_fee: 0,
    day: '',
    timeSched: '',
    numOfDays: '',
    history_log: {} as Record<string, CourseHistoryLog>,
}

export interface newPromo{
    rate: number;
    start_date: string;
    end_date: string;
    numOfPromoDays: string;
}

export const initNewPromo: newPromo = {
    rate: 0,
    start_date: '',
    end_date: '',
    numOfPromoDays: '',
}
