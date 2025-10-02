'use client'

import React, { useState } from 'react'
import { Box, Text, Input, InputLeftAddon, InputGroup, } from '@chakra-ui/react'

import { SearchIcon, } from '@/Components/Icons'
import { CoursesById } from '@/types/courses'

interface TabProps{
    handleCourseSelection: (value: string, value2: string) => void;
    allCourses: CoursesById[];
    onCloseModal: () => void;
} 

export default function InHouseCourses({ handleCourseSelection, allCourses, onCloseModal }: TabProps){
    const [search, setSearch]  = useState<string>('')

    return(
    <>
        <Box >
            <InputGroup className="shadow-md rounded-lg">
                <InputLeftAddon>
                    <SearchIcon color="#a1a1a1" size="18" />
                </InputLeftAddon>
                <Input
                    fontSize='13px'
                    fontWeight='400'
                    textTransform='uppercase' 
                    placeholder="type course here..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </InputGroup>
        </Box> 
        <Box>
            <Box className="p-3">
                <Box className="space-y-3">
                    {(() => {
                        const filteredCourses = allCourses?.filter(
                            (course) => course.course_code.toUpperCase().includes(search.toUpperCase()) 
                                || course.course_name.toUpperCase().includes(search.toUpperCase())
                            )
                            .filter((course) => course.courseType === 1) // Force to filter out MARINA Courses
                            .sort((a,b) => a.course_code.localeCompare(b.course_code)) || []

                        return filteredCourses.length > 0 ?(
                            filteredCourses.map((course) => (
                                <Box key={course?.id} onClick={() => { 
                                        handleCourseSelection(course.id, 'course'); 
                                        handleCourseSelection(course.course_fee.toString(), 'course_fee'); 
                                        handleCourseSelection(course.numOfDays.toString(), 'numOfDays'); 
                                        onCloseModal(); 
                                    }} _hover={{ boxShadow: '4px 4px 8px #3182ce',  cursor: 'pointer'}} textTransform='uppercase' shadow='md' className={`rounded`}>
                                    <Box fontSize='13px' fontWeight='400' p='2' className="text-start uppercase flex" >
                                            <Text as='span' fontSize='15px' fontWeight='500'>
                                                {`(${course?.course_code || "Unknown Code"})`}
                                            </Text>
                                            <Text as='span'>
                                                {` - ${course?.course_name || "Unknown Name"}`}
                                            </Text>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Text textAlign="center" fontWeight='500' fontSize="14px" color="gray.500" py={4} >
                                🚫 No courses found matching your search.
                            </Text>
                        )
                    })()}
                </Box>
            </Box>
        </Box>
    </>
    )
}