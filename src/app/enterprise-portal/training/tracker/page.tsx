'use client'

import React, { useState, useEffect } from 'react'
import { Box, Text, Input, Textarea, Button, InputLeftAddon, FormControl, Select, FormLabel, Tooltip, InputGroup, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';

import { useTrainees } from '@/context/TraineeContext'
import { useTraining } from '@/context/TrainingContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useRank } from '@/context/RankContext'

import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { handleRegStatus } from '@/handlers/trainee_handler'

export default function TrackerPage(){
    const toast = useToast()
    const { data: courseBatch } = useCourseBatch()
    const { data: allRanks } = useRank()
    const { data: allClients, courseCodes } = useClients()
    const { data: allTrainee } = useTrainees()
    const { data: allTraining, setMonth: setTMonth, setYear: setTYear } = useTraining()
    const { data: allCourses } = useCourses()
    const { lastMonthReg: allRegistrations, setMonth: setRMonth, setYear: setRYear } = useRegistrations()

    const [searchTerm, setSearch] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const [filterMarket, setFilter] = useState<string>('')
    const [filterCourse, setCFilter] = useState<string>('')
    const [filterCompany, setCompanyFilter] = useState<string>('')


    return(
    <>
        <Box>
            <Text>TRAINING TRACKER</Text>
            <Box></Box>
            <Box h='650px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}} >
                {/** Headers */}
                <Box w='2650px' display='flex' textAlign='center' className='space-x-3' alignItems='center' borderRadius='5px' borderColor='gray' borderWidth='1px' borderStyle='solid' p='2'>
                    <Text w='100px'>Date Endorsed</Text>
                    <Text w='150px'>Registration No.</Text>
                    <Text w='80px'>Type</Text>
                    <Text w='80px'>Course</Text>
                    <Text w='80px'>Batch</Text>
                    <Text w='150px'>Last Name</Text>
                    <Text w='150px'>First Name</Text>
                    <Text w='150px'>Middle Name</Text>
                    <Text w='100px'>Rank</Text>
                    <Box display={'flex'} flexDirection='column'>
                        <Text>Training Schedule</Text>
                        <Box display='flex' className='space-x-3' justifyContent='space-between'>
                            <Text w='100px'>From</Text>
                            <Text w='100px'>To</Text>
                        </Box>
                    </Box>
                    <Text w='100px'>Payment Mode</Text>
                    <Text w='105px'>Mode of Training</Text>
                    <Text w='105px'>Instructor</Text>
                    <Text w='105px'>Attendance</Text>
                    <Text w='105px'>Assessment</Text>
                    <Text w='105px'>CCR</Text>
                    <Text w='105px'>Feedback</Text>
                    <Text w='105px'>Status</Text>
                    <Text w='300px'>Remarks</Text>
                </Box>
                {/** Data Table */}
                <Box>
                {allTraining && allTraining.sort((a, b) => {
                        return a.date_enrolled.toMillis() - b.date_enrolled.toMillis();
                    }).filter((t) => t.reg_status >= 3 && t.regType === 0 )
                    .filter((t) => {
                        const registration = allRegistrations?.find((r) => r.id === t.reg_ref_id);
                        const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);
                        if (!trainee) return false;
                        if (filterCompany === '') return true;

                        return trainee.company === filterCompany
                        //allClients?.find((client) => client.id === trainee.company)?.company || trainee.company
                    })
                    .filter((t) => {
                        if (!filterCourse || filterCourse === '') return true;

                        return (
                            allCourses?.find((course) => course.id === t.course)?.course_code.toUpperCase() === filterCourse.toUpperCase() || 
                            courseCodes?.find((course) => course.id === t.course)?.company_course_code.toUpperCase() === filterCourse.toUpperCase()
                        )
                    })
                    .filter((t) => {
                        const registration = allRegistrations?.find((r) => r.id === t.reg_ref_id);
                        const trainee = allTrainee?.find((tr) => tr.id === registration?.trainee_ref_id);
                        if (!trainee) return false;
                
                        // if filter is 'ALL', show all trainees
                        if (filterMarket === "") return true;
                        
                        // otherwise match marketing field
                        return trainee.marketing?.toUpperCase() === filterMarket;
                    })
                    .map((training) => {
                    
                    const registration = allRegistrations?.find((r) => r.id === training.reg_ref_id)
                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                    const reg_num = allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                    const reg_id = allRegistrations?.find((reg) => reg.id === training.reg_ref_id)?.id ?? ''
                    
                    if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    ){
                        return(
                            <Box key={training.id} w='2650px' fontWeight='normal' className="flex text-center p-1 border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                    <Box className='w-full flex space-x-3'>
                                        <Text w="100px">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                        <Text w="150px" _hover={{color: 'blue.700'}} onClick={() => {
                                            // setRegNum(reg_id); 
                                            // onOpenReg();
                                            }} className='hover:cursor-pointer'>
                                            {`Reg-${reg_num}`}
                                        </Text>        
                                        <Text w="80px">
                                            {allCourses?.find((course) => course.id === training.course)?.trainingMode === 0 ? 'Non' : 'Simu' }
                                        </Text>                                
                                        <Text w="80px">
                                            {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                        </Text>                                        
                                        <Text w="80px">
                                            {`${courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `B${courseBatch.find((batch) => batch.id === training.batch)?.batch_no}` : ''}`}
                                        </Text>                                        
                                        <Text w="150px">{`${trainee.last_name}`}</Text>                                        
                                        <Text w="150px">{`${trainee.first_name}`}</Text>                                        
                                        <Text w="150px">{trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''}</Text>                                                                            
                                        <Text w="100px">
                                            {allRanks?.find((rank) => rank.code === trainee.rank)?.rank || trainee.rank}
                                        </Text>   
                                    </Box>
                                </Box>
                                <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                    <Box className='w-full flex uppercase space-x-3'>
                                        <Text w="100px">{training.start_date}</Text>    
                                        <Text w="100px">{training.end_date === '' ? '--' : training.end_date}</Text>    
                                    </Box>
                                </Box>
                                <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                                <Text w="100px" >
                                    {`${courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `${courseBatch.find((batch) => batch.id === training.batch)?.training_mode}` : ''}`}
                                </Text>  
                                <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                                <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                                <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                                <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                                <Text w="100px" >{training.accountType === 0 ? 'crew' : 'company'}</Text>  
                                <Text w='100px' className={`${training.reg_status >= 3 ? 'text-green-500 font-bolder' : ''} text-xs uppercase`}>{handleRegStatus(training.reg_status)}</Text>
                                <Button onClick={() => {
                                    // setID(training.id); 
                                    // setRemarks(training.train_remarks); 
                                    // onOpenRm();
                                    }} size='sm' p={0} variant='link' w='300px'>
                                    <Text className={`${training.train_remarks === '' ? 'text-gray-400' : 'text-cyan-600'}`}>
                                        {training.train_remarks === '' ? 'None' : 'View'}
                                    </Text>
                                </Button>                                     
                            </Box>
                        )
                    }
                })}
                </Box>
            </Box>
        </Box>
    </>
    )
}
