import { Timestamp } from 'firebase/firestore'

export interface INQUIRIES {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    name: string;
    contact_no: string;
    company: string;
    referral: string;
    course_inquiry: string;
    date_avail: string;
    remarks: string;
}

export interface INQUIRIES_BY_ID extends INQUIRIES {
    id: string;
}

export const initInquiry = {
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    name: '',
    contact_no: '',
    company: '',
    referral: '',
    course_inquiry: '',
    date_avail: '',
    remarks: '',
}