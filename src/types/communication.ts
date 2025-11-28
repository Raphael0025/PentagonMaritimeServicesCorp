import { Timestamp } from 'firebase/firestore'

export interface Communicaitons {
    title: string;
    message: string;
    recipient: string;
    type: string; // announcement" | "alert" | "info" | "message
    sender: string;
}

export const initCommunicaitons = {
    title: '',
    message: '',
    recipient: '',
    type: '', // announcement" | "alert" | "info" | "message
    sender: '',
}

export interface CommunicaitonsByID extends Communicaitons {
    id: string;
    read: boolean;
    read_at: Timestamp;
    createdAt: Timestamp;
}

export const initCommunicationsByID: CommunicaitonsByID = {
    id: '',
    title: '',
    message: '',
    recipient: '',
    type: '',
    sender: '',
    read: false,
    read_at: Timestamp.now(),
    createdAt: Timestamp.now(),
}