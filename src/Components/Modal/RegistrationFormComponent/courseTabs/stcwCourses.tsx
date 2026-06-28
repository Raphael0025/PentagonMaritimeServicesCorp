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

export default function SCTWCourses({ handleCourseSelection, allCourses, onCloseModal }: TabProps){
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
                            .sort((a,b) => a.course_code.localeCompare(b.course_code)) || []
                        
                        if (filteredCourses.length === 0) {
                            return (
                                <Text textAlign="center" fontWeight='500' fontSize="14px" color="gray.500" py={4} >
                                    🚫 No courses found matching your search.
                                </Text>
                            );
                        }

                        const marinaCourses = filteredCourses.filter(c => c.courseType === 0)
                        const stcwCourses = filteredCourses.filter(c => c.courseType === 2)
                        const safetyCourses = filteredCourses.filter(c => c.courseType === 3)
                        
                        interface CourseCardProps {
                            course: {
                                id: string; // or number, depending on your database schema
                                course_code: string;
                                course_name: string;
                                course_fee: number | string;
                                numOfDays: number | string;
                            };
                        }

                        const CourseCard = ({ course }: { course: CoursesById }) => (
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
                        )

                        return (
                            <>
                            {marinaCourses.length > 0 && (
                                <Box mb={4}>
                                    <Text fontSize="14px" fontWeight="700" color="blue.600" mb={2} textTransform="uppercase" borderBottom="2px solid" borderColor="blue.100" pb={1}>
                                        ⚓ Marina Courses
                                    </Text>
                                    {marinaCourses.map(course => <CourseCard key={course.id} course={course} />)}
                                </Box>
                            )}
                            {stcwCourses.length > 0 && (
                                <Box mb={4}>
                                    <Text fontSize="14px" fontWeight="700" color="teal.600" mb={2} textTransform="uppercase" borderBottom="2px solid" borderColor="teal.100" pb={1}>
                                        📜 STCW Courses
                                    </Text>
                                    {stcwCourses.map(course => <CourseCard key={course.id} course={course} />)}
                                </Box>
                            )}
                            {safetyCourses.length > 0 && (
                                <Box mb={4}>
                                    <Text fontSize="14px" fontWeight="700" color="orange.600" mb={2} textTransform="uppercase" borderBottom="2px solid" borderColor="orange.100" pb={1}>
                                        🦺 Safety Courses
                                    </Text>
                                    {safetyCourses.map(course => <CourseCard key={course.id} course={course} />)}
                                </Box>
                            )}
                            </>
                        )
                    })()}
                </Box>
            </Box>
        </Box>
    </>
    )
}