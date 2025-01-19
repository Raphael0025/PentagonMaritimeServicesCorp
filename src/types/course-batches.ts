import { HistoryLog } from './utils'
import{ Timestamp } from 'firebase/firestore'

export interface AddCourseBatch{
    batch_no: number;
    course: string;
    month: number;
    training_sched: string;
    year: number;
    createdAt: Timestamp;
}

export interface CourseBatch{
    id: string;
    batch_no: number;
    course: string;
    month: number;
    training_sched: string;
    year: number;
    instructor: string;
    createdAt: Timestamp;
}

export const initCourseBatch = {
    id: '',
    batch_no: 0,
    course: '',
    month: 0,
    training_sched: '',
    year: 0,
    instructor: '',
    createdAt: Timestamp.now()
}

export interface ClassCatalogue {
    id: string;
    batch_no: number;
    course: string;
    traineeSize: number | undefined;
    instructor: string;
    training_sched: string
}