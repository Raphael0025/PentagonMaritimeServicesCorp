import { Timestamp } from 'firebase/firestore'

export interface Instructor {
    name: string;
    rank: string;
    e_sign: string;
} 

export const initInstructor = {
    name: '',
    rank: '',
    e_sign: '',
}

export interface InstructorByID extends Instructor {
    id: string;
    date_added: Timestamp;
}