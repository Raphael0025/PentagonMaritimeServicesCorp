'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getAllCourses, firestore, FETCH_COURSE_PROMOS, FETCH_PROMO_PERIODS } from '@/lib/course_controller'
import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore'
import { CoursesById, PromoById, CoursePromoById, CoursePromoPeriodById } from '@/types/courses'

const CourseContext = createContext<{
    data: CoursesById[] | null ; 
    coursePromos: CoursePromoById[] | null;
    periods: CoursePromoPeriodById[] | null;
    setCourses: React.Dispatch<React.SetStateAction<CoursesById[] | null>>;
    }>({data: null, coursePromos: null, periods: null, setCourses: () => {} })

    interface CourseProviderProps {
        children: ReactNode;
    }

export const CourseProvider: React.FC<CourseProviderProps>= ({ children }) => { 
    const [data, setData] = useState<CoursesById[] | null>(null)
    const [coursePromos, setCoursePromos] = useState<CoursePromoById[] | null>(null)
    const [periods, setPeriods] = useState<CoursePromoPeriodById[] | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const initData = await getAllCourses()
            setData(initData)
            const courseRef = collection(firestore, 'courses')
            const orderedQuery = query(courseRef);

            const coursePromoData = await FETCH_COURSE_PROMOS()
            setCoursePromos(coursePromoData)
            const coursePromoRef = collection(firestore, 'coursePromos')
            const cpQuery = query(coursePromoRef)
            
            const promoPeriods = await FETCH_PROMO_PERIODS()
            setPeriods(promoPeriods)
            const promoPeriodsRef = collection(firestore, 'promoPeriods')
            const ppQuery = query(promoPeriodsRef)

            // Set up Firestore listener for real-time updates
            const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
                const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CoursesById[];
                setData(updatedData);
            })
            const unsubscribe2 = onSnapshot(cpQuery, (snapshot) => {
                const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CoursePromoById[];
                setCoursePromos(updatedData);
            })

            const unsubscribe3 = onSnapshot(ppQuery, (snapshot) => {
                const updatedCPData = snapshot.docs.map((doc) => {
                    const { start_date, end_date, ...rest } = doc.data() as CoursePromoPeriodById
                    const startDate = (start_date as unknown as Timestamp).toDate()
                    const endDate = (end_date as unknown as Timestamp).toDate()

                    return{
                        ...rest,        
                        id: doc.id,     
                        start_date: startDate,  
                        end_date: endDate,      
                    }
                })
                setPeriods(updatedCPData)
            })
            return () => {
                unsubscribe()
                unsubscribe2()
                unsubscribe3()
            }
        }
        fetchData()
    }, []) 

    return (
        <CourseContext.Provider value={{data, coursePromos, periods, setCourses: setData }}>
            { children }
        </CourseContext.Provider>
    )
}

export const useCourses = () => {
    const context = useContext(CourseContext)
    if(context === undefined) {
        throw new Error('useCourses must be used within a CourseProvider')
    }
    return context
}