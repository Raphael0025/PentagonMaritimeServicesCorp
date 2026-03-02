import { Timestamp } from 'firebase/firestore'

export interface CERTIFICATION_BY_ID extends CERTIFICATION {
    id: string;
}

export interface CERTIFICATION {
    courseID: string;
    versions: certVersion[];
    category: 'generic' | 'client';
    companyID?: string;
}

export interface certVersion {
    version_number: string; // v1.0.yymmdd
    certTitleHtml: string; 
    certContentHtml: string;
    subTitle: string;
    additionalDescription: string;
    status: 'active' | 'archived';
    primary_author: string;
    createdAt: Timestamp;
    changelogArr: changeLog[];
}

export interface changeLog {
    message: string;
    updatedBy?: string;
    updatedAt?: Timestamp;
}