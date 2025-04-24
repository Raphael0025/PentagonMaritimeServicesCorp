import{ Timestamp } from 'firebase/firestore'

export interface CourseBatch{
    batch_no: number;
    start_date: string;
    end_date: string;
    numOfDays: number;
    course: string | undefined;
}

export interface CourseBatchByID extends CourseBatch{
    id: string;
    createdAt: Timestamp;
    updateAt: Timestamp;
}

export const initCourseBatch = {
    batch_no: 0,
    start_date: '',
    end_date: '',
    numOfDays: 0,
    course: '',
    id: '',
    createdAt: Timestamp.now(),
    updateAt: Timestamp.now(),
}
