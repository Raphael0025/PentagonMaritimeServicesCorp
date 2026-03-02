'use client'

import React, { useState, useMemo } from 'react'
import { Box, Text, Textarea, Spinner, Center, Button, Checkbox, Select, FormControl, useDisclosure, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';

import { TRAINING_BY_ID } from '@/types/trainees'

import { parsingTimestamp, ToastStatus } from '@/types/handling'
import { handleRegStatus } from '@/handlers/trainee_handler'
import { backgroundColor, trainingModeFontColor, trainingModeColor } from '@/handlers/util_handler'

import { useRank } from '@/context/RankContext'
import { useCourses } from '@/context/CourseContext'
import { useCourseBatch } from '@/context/BatchContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useInstructors } from '@/context/InstructorContext'
import { useTrainees } from '@/context/TraineeContext'
import { useRegistrations } from '@/context/RegistrationContext'
import { useCertification } from '@/context/CertificationContext'
import { useTraining } from '@/context/TrainingContext'

import { CourseBatchByID } from '@/types/course-batches'

import { UPDATE_TRAINING, UPDATE_TRAINING_FORMS } from '@/lib/trainee_controller'
import { Timestamp } from 'firebase/firestore';

interface BatchedDatedProps {
    searchTerm: string;
    trainings: TRAINING_BY_ID[];
}

export default function BatchedDated ({ searchTerm, trainings }: BatchedDatedProps){
    const toast = useToast()
    const { courseCodes } = useClients()
    const { data: allRanks } = useRank()
    const { data: allCourses } = useCourses()
    const { data: allTrainee } = useTrainees()
    const { data: courseBatch } = useCourseBatch()
    const { data: allInstructors } = useInstructors()
    const { data: allCertTemplates } = useCertification()
    const { allData: allRegData } = useRegistrations()
    const { allData: allTrainingData } = useTraining()

    const [loading, setLoading] = useState<boolean>(false)

    const [remarks, setRemarks] = useState<string>('')
    const [t_id, setID] = useState<string>('')
    const [courseID, setCourseID] = useState<string>('')
    const [selectedTrainings, setSelectedTrainings] = useState<TRAINING_BY_ID[]>([])


    const { isOpen: isOpenRemarks, onOpen: onOpenRemarks, onClose: onCloseRemarks } = useDisclosure()
    
    const handleComplianceStatus = (trainingID: string, complianceForm: string) => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat: Partial<TRAINING_BY_ID> = {}
                    switch(complianceForm){
                        case 'attendance':
                            const currentAttendance = trainings?.find(t => t.id === trainingID)?.attendance || false
                            updateStat.attendance = !currentAttendance
                            break;
                        case 'assessment':
                            const currentAssessment = trainings?.find(t => t.id === trainingID)?.assessment || false
                            updateStat.assessment = !currentAssessment
                            break;
                        case 'ccr':
                            const currentCcr = trainings?.find(t => t.id === trainingID)?.ccr || false
                            updateStat.ccr = !currentCcr
                            break;
                        case 'evaluation':
                            const currentEvaluation = trainings?.find(t => t.id === trainingID)?.evaluation || false
                            updateStat.evaluation = !currentEvaluation
                            break;
                        default:
                            break;
                    }
                    await UPDATE_TRAINING_FORMS(trainingID, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast(`${complianceForm.charAt(0).toUpperCase()+complianceForm.slice(1)} Successfully Complied!`, `Trainee has complied their ${complianceForm}.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
        })
    }

    
    const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
        toast({
            title: title,
            description: desc,
            position: 'top-right',
            variant: 'left-accent',
            status: status,
            duration: timer,
            isClosable: true,
        })
    }

    const certificates = useMemo(() => {
            return allCertTemplates ?? []
        }, [allCertTemplates])
    
    const certificateVersions = useMemo(() => {
        if (!courseID) return []

        const cert = certificates.find(
            cert => cert.courseID === courseID
        )

        return cert?.versions ?? []
    }, [certificates, courseID])

    const generateCertForSelected = () => {
        return new Promise(async (resolve, reject) => {
            try {
                setLoading(true)

                if (!selectedTrainings.length) {
                    console.warn("No trainings selected.")
                    setLoading(false)
                    return resolve(null)
                }

                const course = allCourses?.find(c => c.id === courseID)
                if (!course) {
                    console.warn("Course not found.")
                    setLoading(false)
                    return resolve(null)
                }

                const courseCode = course.course_code
                const currentYear = new Date().getFullYear()
                const regMap = new Map(allRegData?.map(reg => [reg.id, reg]) ?? [])

                // Determine batch of selected trainings
                const batchIds = Array.from(new Set(selectedTrainings.map(t => t.batch)))
                if (batchIds.length > 1) {
                    console.warn("Selected trainings are from different batches. Please select from a single batch.")
                    setLoading(false)
                    return resolve(null)
                }

                const currentBatchId = batchIds[0]
                const currentBatch = courseBatch?.find(b => b.id === currentBatchId)
                if (!currentBatch) {
                    console.warn("Batch not found for selected trainings.")
                    setLoading(false)
                    return resolve(null)
                }

                // Previous batches
                const previousBatches = (courseBatch ?? [])
                    .filter(b => b.course === courseID && Number(b.batch_no) < Number(currentBatch.batch_no))
                    .sort((a, b) => Number(a.batch_no) - Number(b.batch_no))

                // Starting sequence
                let startSequence = 1
                const currentBatchTrainings = trainings?.filter(t => t.batch === currentBatch.id) ?? []
                const existingCertsInCurrent = currentBatchTrainings.map(t => t.cert_no).filter(Boolean)
                if (existingCertsInCurrent.length > 0) {
                    startSequence = Math.max(...existingCertsInCurrent.map(c => Number(c.split('-').pop()))) + 1
                } else if (previousBatches.length > 0) {
                    const prevCerts = previousBatches.flatMap(batch =>
                        trainings?.filter(t => t.batch === batch.id && t.cert_no)?.map(t => Number(t.cert_no.split('-').pop())) ?? []
                    )
                    if (prevCerts.length > 0) startSequence = Math.max(...prevCerts) + 1
                }

                const activeVersion = certificateVersions.find(v => v.status === 'active')
                if (!activeVersion) {
                    console.warn("No active certificate version found for this course.")
                    setLoading(false)
                    return resolve(null)
                }

                const sortedSelected = [...selectedTrainings].sort((a, b) => {
                    const regA = regMap.get(a.reg_ref_id)?.reg_no ?? ''
                    const regB = regMap.get(b.reg_ref_id)?.reg_no ?? ''
                    return regA.localeCompare(regB, undefined, { numeric: true, sensitivity: 'base' })
                })

                let sequenceCounter = startSequence
                const actor = localStorage.getItem('customToken')

                // 🔹 Wrap in setTimeout to simulate completion
                setTimeout(async () => {
                    try {
                        const generated = await Promise.all(sortedSelected.map(async training => {
                            const regNo = regMap.get(training.reg_ref_id)?.reg_no ?? 'UNKNOWN'

                            const sequence = String(sequenceCounter++).padStart(3, '0')
                            const certNo = training.cert_no ?? `${courseCode}-${currentYear}-B${currentBatch.batch_no}-${sequence}`

                            const updateData = {
                                reg_status: 6,
                                cert_no: certNo,
                                certTitle: activeVersion.certTitleHtml,
                                certContent: activeVersion.certContentHtml,
                                cert_version: activeVersion.version_number
                            }

                            await UPDATE_TRAINING(training.id, updateData, actor)

                            return {
                                trainingId: training.id,
                                reg_no: regNo,
                                cert_no: certNo,
                                existing: !!training.cert_no
                            }
                        }))

                        setSelectedTrainings([])
                        setLoading(false)
                        resolve({
                            batch: currentBatch,
                            generatedCerts: generated
                        })
                    } catch (err) {
                        console.error("Error updating trainings:", err)
                        setLoading(false)
                        reject(err)
                    }
                }, 200) // Delay to simulate async processing
            } catch (error) {
                console.error("Error in generation:", error)
                setLoading(false)
                reject(error)
            }
        })
    }

    const handleStatus = async (trainingID: string, newStatus: number) => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')

                    const updateStat = {
                        reg_status: newStatus,
                    }
                    await UPDATE_TRAINING(trainingID, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Status Updated Successfully!', `Crew's training status has been updated successfully.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
        })
    }

    const handleRemarks = () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const actor = localStorage.getItem('customToken')
                    const updateStat = {
                        train_remarks: remarks,
                    }
                    await UPDATE_TRAINING(t_id, updateStat, actor)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Remarks Saved Successfully!', ``, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setRemarks('')
            setID('')
            setLoading(false)
        })
    }

    return(
        <>
        <Box mb='3' display='flex' justifyContent={'end'}>
            {selectedTrainings.length > 0 && 
                <Button onClick={generateCertForSelected} isLoading={loading} loadingText='Processing...' colorScheme='green' shadow='md' size='sm' >Graduate</Button>
            }
        </Box>
        <Box h='650px' style={{maxHeight: '700px', overflowY: 'auto', scrollbarWidth: 'thin'}} >
            {/** Headers */}
            <Box position='sticky' top='0' zIndex='10' w='2650px' bgColor='blue.700' mb='2' color='white' display='flex' textAlign='center' className='space-x-3' alignItems='center' borderRadius='5px' borderColor='gray' borderWidth='1px' borderStyle='solid' p='2'>
                <Text w='15px'>#</Text>
                <Text w='100px'>Date Endorsed</Text>
                <Text w='150px'>Registration No.</Text>
                <Text w='80px'>Type</Text>
                <Text w='80px'>Course</Text>
                <Text w='80px'>Batch</Text>
                <Text w='280px'>Trainee Name</Text>
                <Text w='50px'>Rank</Text>
                <Box display={'flex'} flexDirection='column'>
                    <Text>Training Schedule</Text>
                    <Box display='flex' className='space-x-3' justifyContent='space-between'>
                        <Text w='100px'>From</Text>
                        <Text w='100px'>To</Text>
                    </Box>
                </Box>
                <Text w='100px'>Payment Mode</Text>
                <Text w='105px'>Mode of Training</Text>
                <Text w='105px'>Status</Text>
                <Text w='185px'>Instructor</Text>
                <Text w='105px'>Attendance</Text>
                <Text w='105px'>Assessment</Text>
                <Text w='105px'>CCR</Text>
                <Text w='105px'>Feedback</Text>
                <Text w='300px'>Remarks</Text>
            </Box>
            {/** Current Month Data Table */}
            <Box>
            {!trainings ? (
                <Center py={8}>
                    <Spinner size="lg" color="blue.500" mr={3} />
                    <Text fontWeight="medium" color="gray.600">Loading current month training records...</Text>
                </Center>
            ) : trainings.length === 0 ? (
                <Center py={8}>
                    <Text fontWeight="medium" color="gray.500">No training records found.</Text>
                </Center>
            ) : (trainings?.map((training, index) => {
                    const registration = allRegData?.find((r) => r.id === training.reg_ref_id)
                    const trainee = allTrainee?.find((t) => t.id === registration?.trainee_ref_id)
                    const reg_num = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.reg_no
                    //const reg_id = allRegData?.find((reg) => reg.id === training.reg_ref_id)?.id ?? ''
                    const trainingMode = courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `${courseBatch.find((batch) => batch.id === training.batch)?.training_mode}` : ''

                    if(trainee && registration && (trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        trainee.srn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        `REG-${registration.reg_no}`?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                ){
                    return(
                        <Box key={training.id} _hover={{bgColor: 'blue.100', color: 'black'}} borderRadius='5px' color={training.reg_status === 7 ? 'white' : 'black'} bgColor={backgroundColor(training.reg_status)} w='2650px' fontWeight='normal' mb='1' className="flex text-center border-b space-x-4 items-center uppercase" style={{ whiteSpace: 'nowrap' }} >
                            <Box display='flex' flexDir='column' justifyContent='center' alignItems='center'>
                                <Box px='1' className='w-full flex space-x-3'>
                                    <Text w="15px" textAlign='center'>{`${(index + 1)}.`}</Text>                                                                             
                                    <Text w="100px">{parsingTimestamp(training.date_enrolled).toLocaleDateString('en-US', {  month: 'short',  day: 'numeric',})}</Text>                                                                             
                                    <Text w="150px" _hover={{color: 'blue.700'}} onClick={() => {
                                        // setRegNum(reg_id); 
                                        // onOpenReg();
                                        }} className='hover:cursor-pointer'>
                                        {`Reg-${reg_num}`}
                                    </Text>        
                                    <Text w="80px">
                                    {(() => {
                                        const courseCode = courseCodes?.find((code) => code.id === training.course);
                                        const courseFound = allCourses?.find((course) => course.id === training.course || course.id === courseCode?.id_course_ref)
                                        return courseFound?.trainingMode === 0 ? 'Non' : 'Simu'
                                    })()}
                                    </Text>                                
                                    <Text w="80px">
                                        {allCourses?.find((course) => course.id === training.course)?.course_code || courseCodes?.find((course) => course.id === training.course)?.company_course_code || ''}
                                    </Text>                                        
                                    <Text w="80px">
                                        {`${courseBatch?.find((batch) => batch.id === training.batch)?.batch_no ? `B${courseBatch.find((batch) => batch.id === training.batch)?.batch_no}` : ''}`}
                                    </Text>                                        
                                    <Text w="280px">{`${trainee.last_name}, ${trainee.first_name} ${trainee.middle_name !== '' || trainee.middle_name.toLowerCase() !== 'n/a' ? trainee.middle_name : ''}`}</Text>                                        
                                    <Text w="50px">
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
                            <Text w="100px" p='1' borderRadius='5px' color={trainingModeFontColor(trainingMode)} bgColor={trainingModeColor(trainingMode)}>
                                {`${trainingMode}`}
                            </Text>  
                            <Checkbox onChange={() => {
                                const course = allCourses?.find((course) => course.id === training.course) || allCourses?.find((course) => course.id === courseCodes?.find((c) => c.id === training.course)?.id_course_ref);
                                setSelectedTrainings((prev) => prev.some(t => t.id === training.id) ? prev.filter(t => t.id !== training.id) : [...prev, training]);
                                setCourseID(course?.id || '');
                            }} 
                                isChecked={selectedTrainings.some((t) => t.id === training.id)} />
                            <Select isDisabled={loading} 
                            onChange={(e) => 
                                {
                                    //handleStatus(training.id, Number(e.target.value))
                                    const course = allCourses?.find((course) => course.id === training.course) || allCourses?.find((course) => course.id === courseCodes?.find((c) => c.id === training.course)?.id_course_ref);
                                    generateCertForSelected();
                                    //generateCertForTraining(training.id, course?.id || '');
                                }
                            } 
                            borderRadius='5px' size='xs' w='100px' shadow='md' >
                                <option value={3} hidden>{handleRegStatus(training.reg_status)}</option>
                                <option value={6}>Graduated</option>
                                <option value={5}>Pending</option>
                                <option value={7}>Cancelled</option>
                                <option value={8}>Absent</option>
                            </Select>
                            <Text w="180px" >
                            {(() => {
                                const trainingBatch = courseBatch?.find((batch) => batch.id === training.batch)
                                const ins = allInstructors?.find((i) => i.id === trainingBatch?.act_ins);
                                if (!ins) return trainingBatch?.act_ins || 'No Instructor';

                                // Add 'MM' if rank is 'CAPT'
                                const suffix = ins.rank === 'CAPT' ? ', MM' : '';
                                return `${ins.rank} ${ins.name}${suffix}`;
                            })()}
                            </Text>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'attendance')}} isChecked={training?.attendance} shadow='md' />
                            </Box>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'assessment')}} isChecked={training?.assessment} shadow='md' />
                            </Box>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'ccr')}} isChecked={training?.ccr} shadow='md' />
                            </Box>  
                            <Box w="100px" >
                                <Checkbox colorScheme='blue' onChange={() => {handleComplianceStatus(training.id, 'evaluation')}} isChecked={training?.evaluation} shadow='md' />
                            </Box>  
                            <Button onClick={() => { setID(training.id); setRemarks(training.train_remarks); onOpenRemarks(); }} size='sm' p={0} variant='link' w='300px'>
                                <Text fontWeight='normal' color={training.reg_status === 7 ? 'white' : 'black'}>
                                    {training.train_remarks === '' ? 'None' : training.train_remarks}
                                </Text>
                            </Button>                                     
                        </Box>
                    )
                }
            }))}
            </Box>
        </Box>
        <Modal isOpen={isOpenRemarks} scrollBehavior='inside' onClose={() => {setRemarks(''); setID(''); onCloseRemarks();}}>
            <ModalOverlay />
            <ModalContent px='2'>
                <ModalHeader>Training Remarks</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder='Type here your remarks...' fontWeight='normal' shadow='md' minH='150px'></Textarea>
                    </FormControl>
                </ModalBody>
                <ModalFooter display='flex' borderTopWidth='1px' borderColor='gray.500'>
                    <Button onClick={handleRemarks} isLoading={loading} loadingText='Saving...' colorScheme='blue' shadow='md' size='sm' bgColor='blue.700'>Save Remarks</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}