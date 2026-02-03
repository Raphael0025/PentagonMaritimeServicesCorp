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
    course: string; // solve
    courseType: string; // courses: trainingMode
    batches: batchArr[];
    total_trainees: number; // solve
    total_batches: number; // solve
}

export interface batchArr {
    batch_no: string; // solve
    trainees_per_batch: string; // solve
    delivered: string; // solve
    cancelled: string; // solve
    non_appearance: string; // solve
    trainingMode: string; // solve
    remarks: string;
}