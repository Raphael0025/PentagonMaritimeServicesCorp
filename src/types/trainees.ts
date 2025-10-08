import { Timestamp } from 'firebase/firestore'
import { ClientCompanyByID } from './client_company';
import { RanksByID } from './type';
import React from 'react';

export interface TRAINEE_BY_ID extends TRAINEE{
    id: string
    createdAt: Timestamp;
}
export const initTRAINEE_BY_ID = {
    id: '',
    house_no: '',
    street: '',
    brgy: '',
    city: '',
    area: '',
    otherAddress: '',
    last_name: '',
    first_name: '',
    middle_name: '',
    suffix: '',
    rank: '',
    srn: '',
    contact_no: '',
    email: '',
    gender: '',
    nationality: '',
    birthPlace: '',
    birthDate: Timestamp.now(),
    company: '',
    vessel: '',
    endorser: '',
    e_contact_person: '',
    e_contact: '',
    relationship: '',
    
    valid_id: '',
    photo: '',
    e_sig: '',
    marketing: '',
    otherMarketing: '',
    createdAt: Timestamp.now(),
}
export interface TRAINEE {
    house_no: string;
    street: string;
    brgy: string;
    city: string;
    area: string;
    otherAddress: string;

    last_name: string;
    first_name: string;
    middle_name: string;
    suffix: string;
    rank: string;
    srn: string;
    contact_no: string;
    email: string;
    gender: string;
    nationality: string;
    birthPlace: string;
    birthDate: Timestamp;
    company: string;
    vessel: string;
    endorser: string;
    e_contact_person: string;
    e_contact: string;
    relationship: string;
    
    valid_id: string;
    photo: string;
    e_sig: string;
    marketing: string;
    otherMarketing: string;
}

export const initTRAINEE = {
    house_no: '',
    street: '',
    brgy: '',
    city: '',
    area: '',
    otherAddress: '',

    last_name: '',
    first_name: '',
    middle_name: '',
    suffix: '',
    rank: '',
    srn: '',
    birthDate: Timestamp.now(),
    birthPlace: '',
    contact_no: '',
    email: '',
    nationality: '',
    gender: '',
    endorser: '',
    company: '',
    vessel: '',
    e_contact: '',
    e_contact_person: '',
    relationship: '',
    valid_id: '',
    photo: '',
    e_sig: '',
    marketing: '',
    otherMarketing: '',
    createdAt: Timestamp.now(),
}

export interface REGISTRATION_BY_ID extends REGISTRATION{
    id: string;
}

export interface TRAINING_BY_ID extends TRAINING {
    id: string;
}

export interface REGISTRATION {
    trainee_ref_id: string;

    reg_no: string;
    regApproach: number; // 0 - ol | 1 - os
    traineeType: number; // 0 - new | 1 - old
    payment_status: number; // 0 - Full | 1 - partial | 2 - unpaid
    payment_mode: number; // 0 - cash | 1 - gcash | 2 - bank | 3 - def
    payment_balance: number;
    
    date_registered: Timestamp;
    reg_remarks: string;
    regType: number; // 2 - def | 0 - dated | 1 - bd | 3 - cancel
    marketing: string;
    otherMarketing: string;
    reg_accountType: number; // 0 - crew | 1 - company
}

export interface TRAINING {
    reg_ref_id: string;

    reg_status: number; // 0 - def | 1 - AR | 2 - AC | 3 - enrolled | 4 - on-hold | 5 - pending | 6 - grad | 7 - cancel
    course_fee: number;
    course: string;
    start_date: string;
    numOfDays: number;
    end_date: string;
    accountType: number; // 0 - crew | 1 - company
    
    date_enrolled: Timestamp;
    batch: string;
    regType: number; // 2 - def | 0 - dated | 1 - bd
    
    isCertified: boolean;
    cert_released: Timestamp;
    cert_status: number; // 0 - pending | 1 - released
    cert_no: string;
    practical: number;
    written: number;
    result: number;
    marketing: string;
    otherMarketing: string;
    train_remarks: string;
}

export const initTraining = {
    id: '',
    reg_ref_id: '',

    reg_status: 0, // 0 - def | 1 - AR | 2 - AC | 3 - enrolled | 4 - on-hold | 5 - pending | 6 - grad | 7 - cancel
    course_fee: 0,
    course: '',
    start_date: '',
    numOfDays: 0,
    end_date: '',
    accountType: 0, // 0 - crew | 1 - company
    
    date_enrolled: Timestamp.now(),
    batch: '',
    regType: 0, // 2 - def | 0 - dated | 1 - bd
    
    isCertified: false,
    cert_released: Timestamp.now(),
    cert_status: 0, // 0 - pending | 1 - released
    cert_no: '',
    practical: 0,
    written: 0,
    result: 0,
    train_remarks: '',
    marketing: '',
}

export interface TEMP_COURSES {
    course_fee: number;
    course: string;
    start_date: string;
    end_date: string;
    numOfDays: number;
    accountType: number; 
}

export interface TEMP_COURSES_V2{
    course_fee: number;
    course: string;
    t_sched: string;
    numOfDays: number;
    accountType: number; 
}

export interface TEMP_COURSES_WITH_PM extends TEMP_COURSES{
    payment_mode: number;
}

export interface NewTraineeProps {
    // Trainee Info
    traineeInfo: TRAINEE;
    setTraineeInfo: React.Dispatch<React.SetStateAction<TRAINEE>>;
    // Rank Ref
    rankRef: string;
    selectedRank: string;
    setRankRef: React.Dispatch<React.SetStateAction<string>>
    setSelectedRank: React.Dispatch<React.SetStateAction<string>>;
    // Vessel Ref
    vesselRef: string;
    selectedVessel: string;
    setVesselRef: React.Dispatch<React.SetStateAction<string>>
    setSelectVessel: React.Dispatch<React.SetStateAction<string>>;
    // Company Ref
    companyRef: string;
    selectCompany: string;
    setCompanyRef: React.Dispatch<React.SetStateAction<string>>;
    setSelectCompany: React.Dispatch<React.SetStateAction<string>>;
    setCompanyID: React.Dispatch<React.SetStateAction<string>>;
    // Contexts
    allClients: ClientCompanyByID[] | null;
    allRanks: RanksByID[] | null;
}

export interface OldTraineeProps {
    setTrainee: (value: string) => void;
    trainee: string;
    allTrainee: TRAINEE_BY_ID[] | null;
    setTraineeID: (value: string) => void;
}

export type SelectedTraining = {
    trainee: TRAINEE_BY_ID;
    registration: REGISTRATION_BY_ID;
    training: TRAINING_BY_ID;
}
