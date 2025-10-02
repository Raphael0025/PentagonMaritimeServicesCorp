'use client'

import React from 'react'
import { Tabs, TabList, TabPanels, Tab, TabPanel, } from '@chakra-ui/react'

import {StcwCourses, InHouseCourses} from './courseTabs'

import { useCourses } from '@/context/CourseContext'
import { TEMP_COURSES_V2 } from '@/types/trainees'

interface ModalProps {
    setTempCourses: React.Dispatch<React.SetStateAction<TEMP_COURSES_V2[]>>;
    courseIndex: number;
    onClose: () => void;
}

export default function CoursesModal({setTempCourses, courseIndex, onClose}: ModalProps){
    const { data: allCourses } = useCourses()

    const handleCourseSelection: (val: string, type: string) => void = (val, type) => {
        setTempCourses((prev: TEMP_COURSES_V2[]) =>
            prev.map((course: TEMP_COURSES_V2, index: number) =>
                index === courseIndex
                    ? {
                        ...course,
                        ...(type === "course_fee" ? { course_fee: Number(val) }
                            : type === "accountType" ? { accountType: Number(val) } 
                            : type === "numOfDays" ? { numOfDays: Number(val) } 
                            : type === "course" ? { course: val } : {}),
                    }
                    : course
            )
        )
    }

    return(
    <>
        <Tabs isLazy variant='enclosed' colorScheme='blue'>
            <TabList>
                <Tab >In-House Courses</Tab>
                <Tab >Marina Courses</Tab>
            </TabList>
            <TabPanels>
                <TabPanel  >
                    <InHouseCourses 
                        handleCourseSelection={handleCourseSelection} 
                        allCourses={allCourses || []}
                        onCloseModal={onClose}
                    />
                </TabPanel>
                <TabPanel  >
                    <StcwCourses 
                        handleCourseSelection={handleCourseSelection} 
                        allCourses={allCourses || []}
                        onCloseModal={onClose}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </>
    )
}