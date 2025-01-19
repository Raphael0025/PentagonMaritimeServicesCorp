import { Timestamp } from 'firebase/firestore'

export interface TypeCatalog{
    type: string;
    createdBy: string;
}

export interface TypeWithID extends TypeCatalog{
    id: string
    createdAt: Timestamp;
}

export const initType = {
    type: '',
    createdBy: '',
}

export interface Ranks {
    rank: string;
    code: string;
    createdBy: string;
}

export interface RanksByID extends Ranks {
    id: string;
    createdAt: Timestamp;
}

export interface CatalogTypes {
    selectedType: string;
    type: string;
    category: 'demographic' | 'categorical' | 'geographic';
    createdBy: string;
}

export interface CatalogTypeById extends CatalogTypes {
    id: string;
    createdAt: Timestamp;
}

export interface AREAS {
    ref_city: string;
    zipCode: string;
    location: string;
    category: 'demographic' | 'categorical' | 'geographic';
    createdBy: string;
}

export const initAREAS: AREAS = {
    ref_city: '',
    zipCode: '',
    location: '',
    category: 'geographic',
    createdBy: '',
}

export interface AREA_BY_ID extends AREAS {
    id: string;
    createdAt: Timestamp;
}

export interface SUB_AREAS {
    location_ref: string; // MAIN
    brgy: string;
    category: 'demographic' | 'categorical' | 'geographic';
    createdBy: string;
}

export const initSUBAREAS: SUB_AREAS = {
    location_ref: '', 
    brgy: '',
    category: 'geographic',
    createdBy: '',
}

export interface SUBAREA_BY_ID extends SUB_AREAS {
    id: string;
    createdAt: Timestamp;
}

export const initAREASByID: AREA_BY_ID = {
    id: '',
    createdAt: Timestamp.now(),
    ref_city: '',
    zipCode: '',
    location: '',
    category: 'geographic',
    createdBy: '',
}

export const initSUBAREASByID: SUBAREA_BY_ID = {
    id: '',
    createdAt: Timestamp.now(),
    location_ref: '', 
    brgy: '',
    category: 'geographic',
    createdBy: '',
}

