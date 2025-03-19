'use client'

import React, { useState } from 'react'
import { Box, Text, Input, Button, InputLeftAddon, InputGroup, ModalContent, ModalFooter, ModalHeader, ModalBody } from '@chakra-ui/react';
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'

import { UPDATE_TRAINING } from '@/lib/trainee_controller'
import { SearchIcon } from '@/Components/Icons'

interface PageProps {
    onClose: () => void;
    company_id: string;
    trainingID: string;
}

export default function Course({onClose, company_id, trainingID}: PageProps){
    const { data: allCourses } = useCourses()
    const { companyCharge: companyCharges, courseCodes: companyCourseCodes} = useClients()
    const [search, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [tempSelectCourse, setTempCourse] = useState<string>('')

    const handleUpdateCourse = async () => {
        setLoading(true)
        const actor: string | null = localStorage.getItem('customToken')

        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const updateCourse = {
                        course: tempSelectCourse
                    }
                    await UPDATE_TRAINING(trainingID, updateCourse, actor)
                    res()
                } catch(error){
                    rej(error)
                }
            }, 500)
        }).catch((error) => {
            console.log('Error:', error)
        }).finally(() => {
            setLoading(false)
            onClose()
        })
    }

    return(
    <>
        <ModalContent h='600px'>
            <ModalHeader color='blue.700'>Select a Course</ModalHeader>
            <ModalBody overflowY='hidden'>
                <Box >
                    <InputGroup className="shadow-md rounded-lg">
                        <InputLeftAddon>
                            <SearchIcon color="#a1a1a1" size="18" />
                        </InputLeftAddon>
                        <Input
                            textTransform='uppercase' 
                            placeholder="type course here..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputGroup>
                    <Text fontWeight='normal' color='gray.600' mt='3'>{`Note: When searched for a training course, don't forget to select it before clicking the "Select" button.`}</Text>
                </Box>      
                <Box mt='3' overflowY='auto' maxH='calc(100% - 50px)'>
                    <Box >
                    <Text fontSize='lg' textDecoration='underline' fontWeight='bold' color='blue.600'>Company Specific:</Text>
                    {allCourses?.slice().sort((a, b) => a.course_code.localeCompare(b.course_code)).map((course, index) => {
                        const matchingCharges = companyCharges?.filter(
                            (charge) => charge.course_ref === course.id && charge.company_ref === company_id
                        )

                        if (!matchingCharges || matchingCharges.length === 0) return null;

                        const matchingCourseCodes = companyCourseCodes?.filter(
                            (courseCode) =>
                                courseCode.id_company_ref === company_id &&
                                courseCode.id_course_ref === course.id
                        )

                        if (!matchingCourseCodes || matchingCourseCodes.length === 0) return null;

                        return(
                            <Box key={index}>
                                {matchingCourseCodes.filter((courseC) => courseC.company_course_code.toUpperCase().includes(search.toUpperCase()) || course.course_name.toUpperCase().includes(search.toUpperCase())).map((courseCode) => (
                                    <Box key={courseCode.id}>
                                        <Text bgColor={`${tempSelectCourse === courseCode.id ? 'blue.100' : ''}`} borderLeftWidth={`${tempSelectCourse === courseCode.id ? '6px' : ''}`} borderColor={tempSelectCourse === courseCode.id ? 'blue.600' : ''} _hover={{ bgColor: 'gray.100',}} onClick={() => setTempCourse(courseCode.id)} className='hover:cursor-pointer' borderRadius='5px' p='4' fontSize='lg' textTransform='uppercase' key={courseCode.id}>
                                            <Text color={`${tempSelectCourse === courseCode.id ? 'blue.900' : 'blue.500'}`} as='span'>{courseCode.company_course_code}: </Text>
                                            <Text fontSize='sm' as='i'>({course.course_name})</Text>
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        )
                    })}    
                    <Text fontSize='lg' textDecoration='underline' fontWeight='bold' color='blue.600'>Other Courses:</Text>
                    {allCourses && allCourses.filter((course) => course.course_code.toUpperCase().includes(search.toUpperCase()) || course.course_name.toUpperCase().includes(search.toUpperCase())).sort((a,b) => a.course_code.localeCompare(b.course_code)).map((course) => (
                        <Text bgColor={`${tempSelectCourse === course.id ? 'blue.100' : ''}`} borderLeftWidth={`${tempSelectCourse === course.id ? '6px' : ''}`} borderColor={tempSelectCourse === course.id ? 'blue.600' : ''} _hover={{ bgColor: 'gray.100',}} onClick={() => setTempCourse(course.id)} className='hover:cursor-pointer' borderRadius='5px' p='4' fontSize='lg' textTransform='uppercase'  key={course.id}>
                            <Text color={`${tempSelectCourse === course.id ? 'blue.900' : 'blue.500'}`} as='span'>{course.course_code}: </Text>
                            <Text fontSize='sm' as='i'>({course.course_name})</Text>
                        </Text>
                    ))}    
                    </Box>      
                </Box>      
            </ModalBody>
            <ModalFooter>
                <Button onClick={onClose} shadow='md' mr={4}>Close</Button>
                <Button onClick={() => {handleUpdateCourse(); onClose()}} isLoading={loading} loadingText='Updating...'  shadow='md' bgColor='#1c437e' colorScheme='blue'>Update</Button>
            </ModalFooter>
        </ModalContent>
    </>
    )
}