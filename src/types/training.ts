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

export interface BATCH_ANALYSIS {
    course: string;
    batches: {
        batch_no: number;
        total_batches: number;
        trainees_per_batch: number;
        total_trainees: number;
        delivered: number;
        trainingMode: string;
    }
    remarks: string;
    start_date: string;
    createdAt: Timestamp;
}