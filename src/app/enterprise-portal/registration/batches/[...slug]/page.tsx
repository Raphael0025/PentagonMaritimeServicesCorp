'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef} from 'react'

import { Timestamp } from 'firebase/firestore'
import DatePicker from 'react-datepicker'
import { Box, Text, Heading, Tooltip, Input, useToast, FormControl, Radio, Select, RadioGroup, Switch, VStack, HStack, useDisclosure, Button, Modal, ModalOverlay, ModalHeader, ModalContent, ModalBody, ModalFooter, } from '@chakra-ui/react'
import 'animate.css'

import {DotsIcon, EditIcon, TrashIcon} from '@/Components/Icons'

import { parsingTimestamp, formatTime, formatDateToWords, getStatusStyles, showTitleTextIcon, ToastStatus, handleMarketing, generateSlug} from '@/types/handling'

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import {useRank} from '@/context/RankContext'

import { useReactToPrint } from 'react-to-print'

interface PageProps {
    params: { slug: string[] };
}

export default function Page({params}: PageProps){
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { data: allRanks } = useRank()
    const { data: allClients } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining } = useTraining()
    const { data: allCourses } = useCourses()
    const { data: allRegistrations } = useRegistrations()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [batch, setBatch] = useState<string>('')
    const [batchID, setBatchID] = useState<string>('')

    const componentRef = useRef<HTMLDivElement | null>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `B-${batch}ENROLLMENT_REPORT.pdf`,
    })

    // Extract course ID from slug
    const courseID = Array.isArray(params.slug) ? params.slug[0] : undefined;

    if (!courseID) {
        console.error("Invalid course ID:", params);
        return <div>Invalid course ID</div>;
    }

    // Find the course
    const course = allCourses?.find((course) => course.id === courseID);
    
    return(
    <>
        <main>
            <Box className='space-x-4 flex'>
                <Text className='text-lg text-gray-400'>Course:</Text>
                <Text className='text-lg'>{course?.course_code}</Text>
                <Text className='text-lg'>{course?.course_name}</Text>
            </Box>
            <Box className='p-3 flex space-x-3'>
                <Box w='30%'>
                    <Text className='text-lg'>Batches</Text>
                    <Box className='p-4 space-y-3 w-full'>
                        <Box className='w-full flex border-b p-3 space-x-4 items-center text-gray-400'>
                            <Text w='30%'>Batch #</Text>
                            <Text w='100%'>Schedule</Text>
                            <Text w='40%'>No. of Days</Text>
                            <Text w='30%'>Action</Text>
                        </Box>
                        {courseBatch && courseBatch.filter((batch) => batch.course === course?.id).map((batch) => (
                            <Box onClick={() => {setBatch(batch.batch_no); setBatchID(batch.id)}} key={batch.id} className='w-full hover:bg-sky-200 hover:cursor-pointer transition duration-75 delay-75 ease-in-out p-3 border-b flex space-x-4 items-center '>
                                <Text w='30%'>{batch.batch_no}</Text>
                                <Text w='100%'>{`${batch.start_date} ${batch.end_date !== '' ? ` to ${batch.end_date}` : ''}`}</Text>
                                <Text w='40%'>{batch.numOfDays === '1' ? `${batch.numOfDays} Day` : `${batch.numOfDays} Days`}</Text>
                                <Text w='30%'>Edit</Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Box w='70%' className='border shadow-md space-y-3 w-full p-5'>
                    <Box className='flex justify-between'>
                        <Text w='100px' className='text-gray-500 text-lg'>{`Batch ${batch}`}</Text>
                        <Text className='text-gray-500 text-lg'>Enrollment Report</Text>
                    </Box>
                    <Box w='100%' className='space-y-3'>
                        <Box className='flex space-x-4 p-3 text-gray-400 border-b text-center uppercase' w='100%'>
                            <Text w='20%'>No.</Text>
                            <Text w='100%'>Name of Trainees</Text>
                            <Text w='100%'>Rank</Text>
                            <Text w='100%'>Registration No.</Text>
                        </Box>
                        {allTraining?.filter((training) => training.course === course?.id && training.batch.toString() === batchID).map((training, index) => {
                            const registrations = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                            const trainee = allTrainee?.find((t) => t.id === registrations?.trainee_ref_id)

                            return(
                                <Box key={training.id} w='100%'>
                                    <Box className='flex space-x-4 p-3 text-center uppercase' w='100%'>
                                        <Text w='20%'>{(index + 1)}</Text>
                                        <Text w='100%'>{`${trainee?.last_name}, ${trainee?.first_name} ${trainee?.middle_name.toLowerCase() === 'n/a' || trainee?.middle_name === '' ? '' : `${trainee?.middle_name.charAt(0)}.`}`}</Text>
                                        <Text w='100%'>{trainee?.rank}</Text>
                                        <Text w='100%'>{`Reg-${registrations?.reg_no}`}</Text>
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                </Box>
            </Box>
        </main>
    </>
    )
    
}