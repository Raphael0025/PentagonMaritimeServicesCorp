import { Timestamp } from 'firebase/firestore'

export interface BATCH {
    batch_no: string;
    start_date: string;
    end_date: string;
    numOfDays: string;
    course: string;
}

export interface BATCH_BY_ID extends BATCH {
    id: string;
    createdAt: Timestamp;
}