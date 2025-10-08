'use client'

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { Box, Text, Input, InputLeftAddon, InputGroup, useToast, } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';

import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'

import { useReactToPrint } from 'react-to-print'

export default function Page(){
    const router = useRouter()
    const { data: allCourses } = useCourses()

    const [search, setSearch] = useState<string>('')

    const componentRef = useRef<HTMLDivElement | null>(null);
    
    return(
    <>
        <Box className='flex flex-col'>
            <Text color='blue.700' fontWeight={'700'} fontSize='xl' textTransform={'uppercase'}>Courses</Text>
            <Text color='gray.500' fontWeight={'500'} fontSize='base'>Kindly select a course to view batches.</Text>
            <Box my='3'>
                <InputGroup className="shadow-md rounded-lg" w='30%'>
                    <InputLeftAddon>
                        <SearchIcon color="#a1a1a1" size="18" />
                    </InputLeftAddon>
                    <Input
                        textTransform='uppercase' 
                        placeholder="Search course here..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
            </Box>
            <Box px='5' display='flex' justifyContent='center'>
                <Box className='flex' w='100%' justifyContent='center' gridGap='4' flexWrap={'wrap'}>
                    {allCourses && allCourses?.filter((course) => course.course_code.toUpperCase().includes(search.toUpperCase())).sort((a, b) => a.course_code.toLowerCase().localeCompare(b.course_code.toLowerCase())).map((course) => (
                        <Box key={course.id} border='1px' borderColor={'gray.400'} minW='300px' textTransform='uppercase' onClick={() => {router.push(`/enterprise-portal/registration/batches/${course.id}`)}} className='rounded shadow-md p-5 text-center text-xl hover:cursor-pointer hover:shadow-lg hover:bg-sky-300 transition duration-75 delay-75 ease-in-out' fontWeight='700'>
                            {course.course_code}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    </>
    )
}