import { Firestore, addDoc, deleteDoc, getDoc, updateDoc, setDoc, doc, getDocs, query, orderBy, where, collection, getFirestore, serverTimestamp, Timestamp, DocumentReference } from 'firebase/firestore'
import { TypeWithID, RanksByID, CatalogTypeById, AREAS, AREA_BY_ID, SUB_AREAS, SUBAREA_BY_ID } from '@/types/type'
import { app } from './firebase'
import { addLog } from '@/lib/history_log_controller'

export const firestore = getFirestore(app)

export const areaCatalog = collection(firestore, 'AREAS')
export const subAreaCatalog = collection(firestore, 'SUB_AREA')
export const typeCatalog = collection(firestore, 'Type_Catalog')
export const rankCatalog = collection(firestore, 'Rank_Catalog')
export const categoryCatalog = collection(firestore, 'Category_Catalog')

export const addRank = async (rank: string, code: string, createdBy: string | null) => {
    try{
        const newData = {rank, code, createdBy, createdAt: Timestamp.now()}
        const docRef = await addDoc(rankCatalog, newData)
        if(docRef){
            await addLog(createdBy, 'New Rank Created', 'Rank_Catalog', 'Rank_Catalog')
        }
    }catch(error){
        console.log(error)
    }
}

export const INSERT_AREA = async (areaObj: AREAS) => {
    try{
        const newAreaObj = {...areaObj, createdAt: Timestamp.now()}
        const docRef: DocumentReference = await addDoc(areaCatalog, newAreaObj)
        if(docRef){
            await addLog(areaObj.createdBy, 'New Area Added', 'AREAS', docRef.id)
        }
    }catch(error){
        console.log(error)
    }
}

export const FETCH_AREA = async (): Promise<AREA_BY_ID[]> => {
    try{
        const areaQuery = query(areaCatalog, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(areaQuery)
        const data: AREA_BY_ID[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as AREA_BY_ID
                docData.id = doc.id 
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}

export const UPDATE_AREA = async (id: string, newObj: AREAS, actor: string | null) => {
    try{
        const getDoc = doc(firestore, 'AREAS', id)
        await updateDoc(getDoc, {
            ...newObj
        })
        await addLog(actor, 'Area Updated', 'AREAS', id)
    }catch(error){
        throw error
    }
}

export const DELETE_AREA = async (id: string, actor: string | null) => {
    try{
        const area: DocumentReference = doc(firestore, 'AREAS', id)
        await deleteDoc(area)
        
        await addLog(actor, 'Area Deleted', 'AREAS', id)
    }catch(error){
        throw error
    }
}

export const INSERT_SUB_AREA = async (areaObj: SUB_AREAS) => {
    try{
        const newAreaObj = {...areaObj, createdAt: Timestamp.now()}
        const docRef: DocumentReference = await addDoc(subAreaCatalog, newAreaObj)
        if(docRef){
            await addLog(areaObj.createdBy, 'New sUB Area Added', 'SUB_AREA', docRef.id)
        }
    }catch(error){
        console.log(error)
    }
}

export const FETCH_SUB_AREA = async (): Promise<SUBAREA_BY_ID[]> => {
    try{
        const areaQuery = query(subAreaCatalog, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(areaQuery)
        const data: SUBAREA_BY_ID[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as SUBAREA_BY_ID
                docData.id = doc.id 
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}

export const UPDATE_SUB_AREA = async (id: string, newObj: SUB_AREAS, actor: string | null) => {
    try{
        const getDoc = doc(firestore, 'SUB_AREA', id)
        await updateDoc(getDoc, {
            ...newObj
        })
        await addLog(actor, 'Sub Area Updated', 'SUB_AREAS', id)
    }catch(error){
        throw error
    }
}

export const DELETE_SUB_AREA = async (id: string, actor: string | null) => {
    try{
        const area: DocumentReference = doc(firestore, 'SUB_AREA', id)
        await deleteDoc(area)
        
        await addLog(actor, 'Sub Area Deleted', 'SUB_AREAS', id)
    }catch(error){
        throw error
    }
}

export const addTypeCatalog = async (selectedType: string, type: string, category: string, createdBy: string | null) => {
    try{
        const newData = {type, category, selectedType, createdBy, createdAt: Timestamp.now()}
        const docRef = await addDoc(categoryCatalog, newData)
        if(docRef){
            await addLog(createdBy, 'New Category Created', 'Category_Catalog', 'Category_Catalog')
        }
    }catch(error){
        console.log(error)
    }
}

export const addType = async (type: string, createdBy: string | null) => {
    try{
        const newData = {type, createdBy, createdAt: Timestamp.now()}
        const docref = await addDoc(collection(firestore, 'Type_Catalog'), newData)
        if(docref){
            await addLog(createdBy, 'New Type Catalog Created', 'Type_Catalog', 'Type_Catalog' )
        }
    } catch (error) {
        throw error
    }
}

export const GetCategories = async (): Promise<CatalogTypeById[]> => {
    try{
        const categoryQuery = query(categoryCatalog, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(categoryQuery)
        const data: CatalogTypeById[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as CatalogTypeById
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}

export const GetRanks = async (): Promise<RanksByID[]> => {
    try{
        const rankQuery = query(rankCatalog, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(rankQuery)
        const data: RanksByID[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as RanksByID
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a, b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}

export const GetTypes = async (): Promise<TypeWithID[]> => {
    try{
        const deptQuery = query(typeCatalog, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(deptQuery)
        const data: TypeWithID[] = []

        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const docData = doc.data() as TypeWithID
                docData.id = doc.id
                data.push(docData)
            })
            data.sort((a,b) => {
                return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
            })
            return data
        } else {
            return data
        }
    }catch(error){
        throw error
    }
}