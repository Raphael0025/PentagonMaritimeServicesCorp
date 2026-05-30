import{ Timestamp } from 'firebase/firestore'

export interface CourseBatch{
    batch_no: string;
    start_date: string;
    end_date: string;
    numOfDays: number;
    course: string | undefined;
    practicumSite: string;
    practicumDate: string;
    room: string;
    instructor: string;
    assessor: string;
    act_ins: string;
    act_ass: string;
}

export interface CourseBatchByID extends CourseBatch{
    id: string;
    time_duration: string
    training_mode: string;
    remarks: string;
    attendance: string;
    ccr: string;
    createdAt: Timestamp;
    updateAt: Timestamp;
}

export interface BDCourseBatchByID extends BDCourseBatch{
    id: string;
    createdAt: Timestamp;
}

export interface BDCourseBatch {
    batch_no: number;
    course: string;
}

export const initCourseBatch = {
    id: '',
    course: '',
    attendance: '',
    ccr: '',
    batch_no: '',
    start_date: '',
    end_date: '',
    numOfDays: 0,
    time_duration: '',    
    training_mode: '',
    room: '',
    instructor: '',
    assessor: '',
    practicumSite: '',
    practicumDate: '',
    remarks: '',
    createdAt: Timestamp.now(),
    updateAt: Timestamp.now(),
    act_ins: '',
    act_ass: '',
}
