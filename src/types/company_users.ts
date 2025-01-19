import { Timestamp } from 'firebase/firestore'

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

export interface PersonalInfo{
    ref_id: string,
    full_name: string;
    gender: string;
    birthDate: Date;
    age: number;
    status: string;
    pfp: string;
    e_sig: string;
    address: string;
    phone: string;
    email: string;
    birthPlace: string;
    province: string;
    contact_person: string;
    emergency_contact: string;
    relationship: string;
    contact_address: string;
}

export const initPersonalInfo: PersonalInfo = {
    ref_id: '',
    full_name: '',
    gender: '',
    birthDate: new Date(),
    age: 0,
    status: '',
    pfp: '',
    e_sig: '',
    address: '',
    phone: '',
    email: '',
    birthPlace: '',
    province: '',
    contact_person: '',
    emergency_contact: '',
    relationship: '',
    contact_address: '',
}

export interface GovtID{
    sss: string,
    philhealth: string,
    hdmf: string,
    tin: string
}

export const initGovtID: any = {
    sss: '',
    philhealth: '',
    hdmf: '',
    tin: '',
}

export const initWorkExp: WorkExperience = {
    company: '',
    position: '',
    stats: '',
    company_address: '',
    reason_leave: '',
    inc_dates: {from: '', to: ''},
}

export const initEducation: EducationalAttainment = {
    attainment: '',
    school: '',
    degree: '',
    inc_dates: {from: '', to: ''}
}

export const initTrainings: TrainingHistory = {
    training_title: '',
    training_provider: '',
    inc_dates: {from: '', to: ''}
}

export const initDependents: ImmediateDependents = {
    name: '',
    dependent_relationship: '',
    dependent_gender: '',
    dependent_birth_date: '',
}

export const initInsertPosition: Role = {
    emp_type: '',
    emp_cat: '',
    job_position: '',
    department: '',
    rank: 0,
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

export interface GetCompanyUserSpecificData{
    id: string;
    candidate_added: Timestamp;
    user_code: number;
    full_name: string;
    emp_status: string;
    application_type: string;
    department: string; // Add department property
    job_position: string; // Add job_position property
}

export const initGetCompanyUserSpecificData: GetCompanyUserSpecificData = {
    id: '',
    candidate_added: Timestamp.now(),
    user_code: 0,
    full_name: '',
    emp_status: '',
    application_type: '',
    department: '', // Add department property
    job_position: '', // Add job_position property
}

export interface GetAllCompanyUsers {
    id: string;
    candidate_added: Timestamp;
    user_code: number;
    employee_id: string;
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

export const initGetAllCompanyUsers : GetAllCompanyUsers = {
    id: '',
    candidate_added: Timestamp.now(),
    user_code: 0,
    employee_id: '',
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
