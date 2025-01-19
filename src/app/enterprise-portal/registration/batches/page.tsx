'use client'

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { Box, Text, Input, Textarea, Button, InputLeftAddon, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import { SearchIcon } from '@/Components/Icons';

import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'

import { handleRegStatus } from '@/handlers/trainee_handler'
import { parsingTimestamp, ToastStatus } from '@/types/handling'

import { useReactToPrint } from 'react-to-print'

export default function Page(){
    const toast = useToast()
    const router = useRouter()
    const { data: courseBatch } = useCourseBatch()
    const { data: allCourses } = useCourses()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `REGISTRATION_FORM.pdf`,
    })

    return(
    <>
        <Box className='flex flex-col'>
            <Text className='text-sky-700 text-lg'>Courses</Text>
            <Box className='flex space-x-4'>
                {allCourses && allCourses?.filter((c) => courseBatch?.some((batch) => batch.course === c.id)).sort((a, b) => a.course_code.toLowerCase().localeCompare(b.course_code.toLowerCase())).map((course) => (
                    <Box key={course.id} w='350px' onClick={() => {router.push(`/enterprise-portal/registration/batches/${course.id}`)}} className='rounded shadow-md p-5 text-center text-xl hover:shadow-lg hover:bg-sky-300 transition duration-75 delay-75 ease-in-out' fontWeight='700'>
                        {course.course_code}
                    </Box>
                ))}
            </Box>
        </Box>
    </>
    )
}