'use client'

import { Box, Text, } from '@chakra-ui/react';

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { parsingTimestamp } from '@/types/handling'

import { reformatTrainingSched } from '@/handlers/trainee_handler'

interface PageProps{
    reg_id: string
}

export default function Page({ reg_id }:PageProps) {
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining } = useTraining()
    const { data: allCourses } = useCourses()
    const { data: allRegistrations } = useRegistrations()

    const registration = allRegistrations?.find((r) => r.id === reg_id)
    if(!registration) return

    const trainee = allTrainee?.find((t) => t.id === registration.trainee_ref_id)
    if(!trainee) return
    
    const training = allTraining?.filter((t) => t.reg_ref_id === registration.id)
    if(!training) return

    return (
        <Box w='100%'>
            <Text textTransform='uppercase' ps={6} pt={3} color='gray.500' fontSize='22px' fontWeight='700'>Registration Form</Text>
            <Box w='100%' display='flex' flexDir='column' className='rounded px-8 pb-8 space-y-3'>
                <Box className='border-b-2 border-gray-400 py-2'>
                    <Text className='base uppercase text-sky-700'>{`Trainee's Information`}</Text>
                </Box>
                <Box w='100%' display='flex' className='border-b-2 border-gray-300 p-2' justifyContent='space-between' alignItems='center'>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>last name</Text>
                        <Text className='text-sm'>{trainee.last_name}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>first name</Text>
                        <Text className='text-sm'>{trainee.first_name}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>middle name</Text>
                        <Text className='text-sm'>{trainee.middle_name}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>suffix</Text>
                        <Text className='text-sm'>{trainee.suffix === '' || trainee.suffix.toLowerCase() === 'n/a' ? '--' : trainee.suffix}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>position/rank</Text>
                        <Text className='text-sm'>{trainee.rank}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>srn#</Text>
                        <Text className='text-sm'>{trainee.srn}</Text>
                    </Box>
                </Box>
                <Box w='100%' display='flex' className='border-b-2 border-gray-300 p-2' justifyContent='space-between' alignItems='center'>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>Address</Text>
                        <Text className='text-sm'>
                            {trainee.otherAddress === '' ? `${trainee.house_no} ${trainee.street} Brgy. ${trainee.brgy}, ${trainee.city} City` : trainee.otherAddress}
                        </Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>company</Text>
                        <Text className='text-sm'>
                            {allClients?.find((client) => client.id === trainee.company)?.company || trainee.company}
                        </Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>reffered by</Text>
                        <Text className='text-sm'>{trainee.endorser}</Text>
                    </Box>
                </Box>
                <Box w='100%' display='flex' className='border-b-2 border-gray-300 p-2' justifyContent='space-between' alignItems='center'>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>contact number</Text>
                        <Text className='text-sm'>{trainee.contact_no}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>email</Text>
                        <Text className='text-sm'>{trainee.email}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>nationality</Text>
                        <Text className='text-sm'>{trainee.nationality}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>gender</Text>
                        <Text className='text-sm'>{trainee.gender}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>date of birth</Text>
                        <Text className='text-sm'>{parsingTimestamp(trainee.birthDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>place of birth</Text>
                        <Text className='text-sm'>{trainee.birthPlace}</Text>
                    </Box>
                </Box>
                <Box w='100%' display='flex' className='border-b-2 border-gray-300 p-2' justifyContent='space-between' alignItems='center'>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>contact person</Text>
                        <Text className='text-sm'>{trainee.e_contact_person}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>contact number</Text>
                        <Text className='text-sm'>{trainee.e_contact}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>relationship</Text>
                        <Text className='text-sm'>{trainee.relationship}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>type of vessel</Text>
                        <Text className='text-sm'>{trainee.vessel}</Text>
                    </Box>
                    <Box display='flex' flexDir='column' className='uppercase'>
                        <Text className='text-xs text-gray-400'>trainee type</Text>
                        <Text className='text-sm'>{registration?.traineeType === 0 ? 'New' : 'Old'}</Text>
                    </Box>
                </Box>
                <Box className='border-b-2 border-gray-500 py-2'>
                    <Text className='base uppercase text-sky-700'>training details</Text>
                </Box>
                <Box w='100%' display='flex' className='uppercase' justifyContent='space-between' alignItems='center'>
                    <Text className='text-xs text-gray-400'>course</Text>
                    <Text className='text-xs text-gray-400'>schedule</Text>
                    <Text className='text-xs text-gray-400'>Charge</Text>
                    <Text className='text-xs text-gray-400'>course fee</Text>
                </Box>
                {training && training.length > 0 ? (
                    training.filter((training) => training.reg_status !== 7).map((training, index) => (
                        <Box key={index} className='flex items-center border border-gray-400 p-2 rounded justify-between'>
                            <Text className='text-base uppercase'>
                                {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                            </Text>
                            <Text className='text-base'>
                                {reformatTrainingSched(training.start_date, training.end_date)}
                            </Text>
                            <Text className='text-base'>
                                {training.accountType === 0 ? 'CREW' : 'COMPANY'}
                            </Text>
                            <Text className='text-base'>{`Php ${training.course_fee}`}</Text>
                        </Box>
                    ))
                ) : (
                    <Box className='w-full flex items-center justify-center'>
                        <Box className='flex justify-center items-center'>
                            <Text>No Courses found</Text>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    )
}
