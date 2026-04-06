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
    webCertTitle: string;
    webCertContent: string;
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

export interface TRANSMITTAL {
    id?: string;
    createdAt?: Timestamp;
    companyID: string;
    isDated: boolean;
    images?: string[];
    endorsements: TransmittalEndorsement[];
}

export interface TransmittalEndorsement {
    endorser: string;
    certificate_id: string[];
}