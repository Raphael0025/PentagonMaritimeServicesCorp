import { Timestamp } from "firebase/firestore";

export interface ClientCompany{
    company: string;
    code: string;
    email: string;
    address: string;
    street: string;
    brgy: string;
    zipCode: string;
    city: string;
}

export interface ClientCompanyByID extends ClientCompany {
    id: string;
    createdAt: Timestamp
}

export interface ClientLinks {
    id_ref: string;
    link: string;
}

export interface ClientLinksByID extends ClientLinks {
    id: string;
    dateAdded: Timestamp;
}

export interface ClientContacts {
    id_ref: string;
    contact_person: string;
    contact_number: string;
}

export interface ClientContactsByID extends ClientContacts {
    id: string;
    createdAt: Timestamp;
}

export const initClientCompany = {
    company: '',
    code: '',
    email: '',
    address: '',
    street: '',
    brgy: '',
    zipCode: '',
    city: '',
}

export const initClientCompanyByID = {
    id: '',
    createdAt: Timestamp.now(),
    company: '',
    code: '',
    email: '',
    address: '',
    street: '',
    brgy: '',
    zipCode: '',
    city: '',
}

export const initClientLinksByID = {
    id: '',
    id_ref: '',
    link: '',
    dateAdded: Timestamp.now()
}

export const initClientContactsByID = {
    id: '',
    id_ref: '',
    contact_person: '',
    contact_number: '',
    createdAt: Timestamp.now()
}

export interface CompanyCharge {
    company_ref: string;
    course_ref: string;
    charge_fee: number;
    day: string;
    numOfDays: number;
}
//company_course_code: string;
export interface CompanyCourseCodes {
    id_company_ref: string;
    id_course_ref: string;
    company_course_code: string;
}

export interface CompanyCourseCodesByID extends CompanyCourseCodes {
    id: string;
    createdAt: Timestamp;
}

export const initCompanyCharge = {
    company_ref: '',
    course_ref: '',
    charge_fee: 0,
    day: '',
    numOfDays: 0,
}

export interface CompanyChargeByID extends CompanyCharge{
    id: string;
    createdAt: Timestamp;
}