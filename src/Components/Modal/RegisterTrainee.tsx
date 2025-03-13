'use client'

import React, { useEffect, useState } from 'react'
import { Box, Text, Input, Button, FormLabel, useToast, Switch, Select, Stack, RadioGroup, Radio, useDisclosure, FormControl, Modal, ModalOverlay, InputLeftAddon, InputGroup, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import DatePicker from 'react-datepicker'

import { useCourses } from '@/context/CourseContext'
import { useClients } from '@/context/ClientCompanyContext'
import { useTrainees } from '@/context/TraineeContext';

import { ToastStatus } from '@/types/handling';
import { TEMP_COURSES, TRAINEE, initTRAINEE, TRAINEE_BY_ID, NewTraineeProps, OldTraineeProps } from '@/types/trainees';
import { HoliDates } from '@/handlers/course_handler';
import { TrashIcon, SearchIcon } from '../Icons';
import { PlusIcon } from '../SideIcons';
import { addRegistrationDetails, addNewTrainee, addTrainingDetails } from '@/lib/trainee_controller';

interface PageProps {
    onClose: () => void;
}

export default function RegisterTrainee({onClose}: PageProps){
    const toast = useToast()
    const { data: allTrainee } = useTrainees()
    const { data: allCourses } = useCourses()
    const { data: allClients, companyCharge: companyCharges, courseCodes: companyCourseCodes} = useClients()

    const [loading, setLoading] = useState<boolean>(false)
    const [isNewTrainee, setNewTrainee] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const [c_id, setCompanyID] = useState<string>('')
    const [tempCourses, setTempCourses] = useState<TEMP_COURSES[]>([])
    const [traineeInfo, setTraineeInfo] = useState<TRAINEE>(initTRAINEE)

    const [start_date, setStartDate] = useState<Date | null>(new Date())
    const [end_date, setEndDate] = useState<Date | null>(new Date())

    // temp storage for Course Selection
    const [selectCourse, setSelectedCourse] = useState<string>('')
    const [tempSelectCourse, setTempCourse] = useState<string>('')
    const [previewCourse, setPreviewCourse] = useState<string>('')

    const [days, setDays] = useState<string>('')
    const [courseFee, setCFee] = useState<number>(0)
    const [account_type, setAT] = useState<string>('')

    const { isOpen: isOpenC, onOpen: onOpenC, onClose: onCloseC } = useDisclosure()

    const [trainee, setTrainee] = useState<string>('')
    const [traineeId, setTraineeID] = useState<string>('')

    useEffect(() => {
        const fetchData = () => {
                const traineeFound = allTrainee?.find((t) => t.id === traineeId)
                setCompanyID(traineeFound?.company ?? '')
        }
        fetchData()
    }, [traineeId])

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

    const clearData = () => {
        setStartDate(new Date())
        setEndDate(new Date())
        setSelectedCourse('')
        setDays('')
        setAT('')
        setCFee(0)
        if(isNewTrainee){
            setTraineeInfo(initTRAINEE)
        }
    }

    const handleTempCourses = () => {
        let templateData;
        if(tempCourses.find((course) => course.course === selectCourse)){
            handleToast('Action Denied!', `It seems that this course is already selected, please select another.`, 4000, 'warning')
            clearData()
            return
        }
        const startDateStr = start_date
            ? new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
            }).format(start_date)
            : '';

        const endDateStr = end_date
            ? new Intl.DateTimeFormat('en-US', {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
            }).format(end_date)
            : '';

        if (Number(days) > 1) {
            templateData = {
                course: selectCourse,
                course_fee: courseFee,
                start_date: startDateStr,
                end_date: endDateStr,
                numOfDays: Number(days),
                accountType: Number(account_type), // 0 - crew | 1 - company
            }
        } else {
            templateData = {
                course: selectCourse,
                course_fee: courseFee,
                start_date: startDateStr,
                end_date: '',
                numOfDays: Number(days),
                accountType: Number(account_type), // 0 - crew | 1 - company
            }
        }
        
        setTempCourses((prev) => [...prev, templateData])
        clearData()
    }

    // export const addNewTrainee = async (traineeDetails: TRAINEE, trainee_type: number, validID: any, profileID: any, validSignature: any, file: string, pfpFile: string,) => {
    //     try{
    //         const traineeQuery = query(trainees, where('last_name', '==', traineeDetails.last_name), where('first_name', '==', traineeDetails.first_name))
    //         const querySnapshot = await getDocs(traineeQuery)
    
    //         if(!querySnapshot.empty){
    //             Swal.fire({
    //                 title: `Oops, looks like you've already submitted a form to Pentagon...`,
    //                 text: `If you want to re-enroll at Pentagon please select the "Re-Enrolled" trainee type.`,
    //                 icon: 'error',
    //             })
    //             return null
    //         }
    
    //         const newDetails = {
    //             ...traineeDetails,
    //         }
            
    //         const docRef: DocumentReference = await addDoc(trainees, {...newDetails})
    //         await addAttachments(docRef.id, traineeDetails.last_name, traineeDetails.first_name, trainee_type, validID, profileID, validSignature, file, pfpFile)
    //         return docRef.id
    //     } catch(error){
    //         throw error
    //     }
    // }

    const handleRegister = async () => {
        setLoading(true)

        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const traineeType: number = isNewTrainee ? 0 : 1
                    let totalFee: number = 0, trainee_ref_id: string = '', reg_id: string | null = null
                    for(const course of tempCourses){
                        totalFee = totalFee + course.course_fee
                    }

                    if(isNewTrainee){
                        //const newTrainee = await addNewTrainee()
                        //trainee_ref_id = newTrainee ?? ''

                    } else {
                        trainee_ref_id = traineeId
                    }
                    
                    if(trainee_ref_id){
                        const regID = await addRegistrationDetails(trainee_ref_id, totalFee, 1, traineeType, Number(account_type))
                        
                        reg_id = regID ?? null
                        if(reg_id){
                            for(const course of tempCourses){
                                try{
                                    if(reg_id){
                                        await addTrainingDetails(course, reg_id)
                                    }
                                }catch(error){
                                    console.error('Failed to process this: ', error)
                                }
                            }
                        }
                    }
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Registered Successfully!', `You have successfully registered this trainee and their training.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            setTempCourses([])
            onClose()
        })
    }

    const handleRemoveCourse = (index: number) => {
        setTempCourses((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSelectedCourse = (val: string) => {
        const getCourse = allCourses?.find((course) => course.id === val)
        if(!getCourse){
            const getCompanyCourseCode = companyCourseCodes?.find((course) => course.id === val)
            const getCompanyCourse = allCourses?.find((course) => course.id === getCompanyCourseCode?.id_course_ref)
            const clientCompany = allClients?.find((company) => company.id === c_id)
            const getCompanyCharge = companyCharges?.find((charge) => charge.company_ref === clientCompany?.id && charge.course_ref === getCompanyCourse?.id)
            
            setCFee(getCompanyCharge?.charge_fee ?? 0)
            setSelectedCourse(getCompanyCourseCode?.id ?? '')
            setPreviewCourse(getCompanyCourseCode?.company_course_code ?? '')
        }else{
            setCFee(getCourse?.course_fee ?? 0)
            setSelectedCourse(getCourse?.id ?? '')
            setPreviewCourse(getCourse?.course_code ?? '')
        }
    }

    const currYear = new Date().getFullYear()
    const dynamicHolidays = HoliDates.map(holiday => {
        return {
            ...holiday,
            date: `${currYear}-${holiday.date}`
        }
    })

    const isSunday = (date: Date) => {
        const day = date.getDay()
        return day !== 0
    }

    const handleCourseFee = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setCFee(Number(val))
    }

    const handleDisplayCourse =(course: string) => {
        const getCourse = allCourses?.find((c) => c.id === course)
        if(!getCourse){
            return companyCourseCodes?.find((c) => c.id === course)?.company_course_code
        } else {
            return getCourse.course_code
        }
    }

    return(
    <>
        <Box p={'4'} bg='#fff' borderRadius={'10px'}>
            <Box display={'flex'} justifyContent='space-between' alignItems='center'>
                <Text w='100%' textTransform='uppercase' fontSize='xl' color='blue.700' fontWeight='700'>Register Trainee</Text>
                <FormControl display='flex' justifyContent={'flex-end'} alignItems='center'>
                    <FormLabel fontWeight='600' color='gray.500'>{`Register New Trainee?`}</FormLabel>
                    <Switch onChange={() => {setNewTrainee(!isNewTrainee); setTrainee(''); setTraineeID('');}} />
                </FormControl>
            </Box>
            <Box mt={3}>
                {isNewTrainee ? (
                    <NewTrainee setTraineeInfo={setTraineeInfo} />
                ) : (
                    <OldTrainee setTrainee={setTrainee} trainee={trainee} allTrainee={allTrainee} setTraineeID={setTraineeID} />
                )}
            </Box>
            <Box mt={3}>
                <Text color='blue.700' fontWeight='700' fontSize='xl' textTransform='uppercase'>Course Details:</Text>
                <Box display='flex' mt='3' flexDir={{base: 'column', md: 'row', lg: 'row'}}>
                    <Box mr={4} className='space-y-4' w='50%'>
                        <Box w='100%' className='space-y-3'>
                            <FormControl display='flex' className='space-x-4' alignItems='center' borderBottomWidth='2px' p='2'>
                                <FormLabel m='0' color='gray.500'>Course:</FormLabel>
                                <Button textTransform='uppercase' variant='ghost' onClick={onOpenC}>{`${selectCourse === '' ? 'Select Course' : previewCourse}`}</Button>
                            </FormControl>
                            <FormControl display='flex' flexDir={{base: 'column', md: 'row'}} alignItems='start' borderBottomWidth='2px' p='2'>
                                <FormLabel m='0' w={{base: '100%', md: '30%'}} color='gray.500'>Course Fee:</FormLabel>
                                <Input type='number' onChange={handleCourseFee} value={courseFee}/>
                            </FormControl>
                            <FormControl display='flex' flexDir={{base: 'column', md: 'row'}} alignItems='start' borderBottomWidth='2px' p='2'>
                                <FormLabel m='0' color='gray.500'>Account Type:</FormLabel>
                                <RadioGroup mx={{base: '0', md: '2'}} value={account_type} onChange={setAT}>
                                    <Stack direction={'row'} >
                                        <Radio value='0'>Crew Charge</Radio>
                                        <Radio value='1' colorScheme='green'>Company Charge</Radio>
                                    </Stack>
                                </RadioGroup>
                            </FormControl>
                            <FormControl display='flex' flexDir='column' alignItems='start' borderBottomWidth='2px' p='2'>
                                <FormLabel m='0' color='gray.500'>Number of Days:</FormLabel>
                                <RadioGroup mt='2' value={days} onChange={setDays}>
                                    <Box className='space-x-3'>
                                        {Array.from({ length: 6 }, (_, index) => (
                                            <Radio key={index} value={String(index + 1)}>
                                                {index + 1}
                                            </Radio>
                                        ))}
                                    </Box>
                                </RadioGroup>
                            </FormControl>
                            <FormControl display='flex' flexDir='column' alignItems='start' borderBottomWidth='2px' p='2'>
                                <FormLabel m='0' color='gray.500'>Start Date:</FormLabel>
                                <DatePicker showPopperArrow={false} selected={start_date} onChange={(date) => setStartDate(date)} filterDate={isSunday} holidays={dynamicHolidays} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd'
                                    customInput={<Input id='start_date' textAlign='center' className='shadow-md' /> } />
                                <Text className='mt-2 text-black' style={{fontSize: '11px'}}>You can select a date from the calendar or type it directly in the field above</Text>
                            </FormControl>
                            {Number(days) > 1 ? (
                                <FormControl display='flex' flexDir='column' alignItems='start' borderBottomWidth='2px' p='2'>
                                    <FormLabel m='0' color='gray.500'>End Date:</FormLabel>
                                    <DatePicker showPopperArrow={false} selected={end_date} onChange={(date) => setEndDate(date)} filterDate={isSunday} holidays={dynamicHolidays} showMonthDropdown useShortMonthInDropdown dateFormat='E, MMM. dd'
                                        customInput={<Input id='end_date' textAlign='center' className='shadow-md' /> } />
                                    <Text className='mt-2 text-black' style={{fontSize: '11px'}}>You can select a date from the calendar or type it directly in the field above</Text>
                                </FormControl>
                            ) : (
                                null
                            )}
                            <Button 
                                size='sm'
                                isDisabled={ 
                                    days === '' || 
                                    courseFee === 0 || 
                                    selectCourse === '' || 
                                    account_type === '' ||
                                    (days === '1' ? 
                                        (start_date === null) 
                                        : 
                                        (start_date === null && end_date === null))} 
                                onClick={() => {handleTempCourses()}} 
                                colorScheme='blue' 
                                bgColor='#1c437e' 
                                leftIcon={<PlusIcon size={'24'} color={'#fff'} />} >
                                    Add
                            </Button>
                        </Box>
                    </Box>
                    <Box w='50%' >
                        <Text color='blue.700' fontSize='0.9rem'>Selected Trainings:</Text>
                        <Box overflowY='auto' maxH='450px' borderRadius='10px'>
                            {tempCourses.map((temp, index) => (
                                <Box borderWidth='1px' borderColor='gray.400' shadow='md' borderRadius='10px' p='2' color='gray.500' mb='2' key={index}>
                                    <Box display='flex' justifyContent={'space-between'}>
                                        <Text display='flex'>
                                            <Text mr='3'>Course:</Text>
                                            <Text textTransform='uppercase' color='gray.700'>
                                                {handleDisplayCourse(temp.course)}
                                            </Text>
                                        </Text>
                                        <Text display='flex' >
                                            <Text mr='3'>Fee:</Text>
                                            <Text color='gray.700'>{temp.course_fee}</Text>
                                        </Text>
                                    </Box>
                                    <Box display='flex' justifyContent={'space-between'}>
                                        <Text display='flex' >
                                            <Text mr='3'>No. of Days:</Text>
                                            <Text color='gray.700'>{temp.numOfDays}</Text>
                                        </Text>
                                        <Text display='flex' >
                                            <Text mr='3'>Account Type:</Text>
                                            <Text color='gray.700'>{temp.accountType === 0 ? 'Crew' : 'Company'}</Text>
                                        </Text>
                                    </Box>
                                    <Box display='flex' justifyContent={'space-between'}>
                                        <Text display='flex' >
                                            <Text mr='3'>Start Date:</Text>
                                            <Text color='gray.700'>{temp.start_date}</Text>
                                        </Text>
                                        {temp.numOfDays !== 1 ? (
                                            <Text display='flex' >
                                                <Text mr='3'>End Date:</Text>
                                                <Text color='gray.700'>{temp.end_date}</Text>
                                            </Text>
                                        ) : (
                                            <Text>{''}</Text>
                                        )}
                                    </Box>
                                    <Box py='2'>
                                        <Button onClick={() => {handleRemoveCourse(index)}} size='xs' w='100%' colorScheme='red' leftIcon={<TrashIcon color='#fff' size='20' />}>Remove Training</Button>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box display='flex' mt={4} justifyContent='flex-end'>
                <Button mr={3} onClick={onClose} colorScheme='red' variant='outline' shadow='md'>Cancel</Button>
                <Button isLoading={loading} onClick={handleRegister} loadingText='Processing...' bgColor='#1c437e' colorScheme='blue' shadow='md'>Register</Button>
            </Box>
        </Box>
        <Modal isOpen={isOpenC} closeOnOverlayClick={false} scrollBehavior='inside' size='xl' onClose={onCloseC}>
            <ModalOverlay />
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
                    </Box>      
                    <Box mt='3' overflowY='auto' maxH='calc(100% - 50px)'>
                        <Box >
                        <Text fontSize='lg' textDecoration='underline' fontWeight='bold' color='blue.600'>Company Specific:</Text>
                        {allCourses?.slice().sort((a, b) => a.course_code.localeCompare(b.course_code)).map((course, index) => {
                            const matchingCharges = companyCharges?.filter(
                                (charge) => charge.course_ref === course.id && charge.company_ref === c_id
                            )

                            if (!matchingCharges || matchingCharges.length === 0) return null;

                            const matchingCourseCodes = companyCourseCodes?.filter(
                                (courseCode) =>
                                    courseCode.id_company_ref === c_id &&
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
                    <Button onClick={onCloseC} mr={4}>Close</Button>
                    <Button onClick={() => {setSelectedCourse(tempSelectCourse); handleSelectedCourse(tempSelectCourse); onCloseC()}} bgColor='#1c437e' colorScheme='blue'>Select</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}

const NewTrainee = ({setTraineeInfo}: NewTraineeProps) => {

    const handleSetInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target
        setTraineeInfo((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    return(
        <Box>
            <Text fontSize='lg' fontWeight='600' color='gray.600'>{`Trainee Information`}</Text>
            <Box mt='2' display='flex' flexDir={{base: 'column', md: 'row'}}>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} >
                        <FormLabel fontWeight='600' color='gray.500'>{`Last Name`}</FormLabel>
                        <Input id='last_name' textTransform='uppercase' shadow='md'  />
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>{`First Name`}</FormLabel>
                        <Input id='first_name' textTransform='uppercase' shadow='md'  />
                    </FormControl>
                </Box>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>{`Middle Name`}</FormLabel>
                        <Input id='middle_name' textTransform='uppercase' shadow='md'  />
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>{`Suffix`}</FormLabel>
                        <Input id='suffix' textTransform='uppercase' shadow='md'  />
                    </FormControl>
                </Box>
            </Box>
            <Box display='flex' mt='2' flexDir={{base: 'column', md: 'row'}}>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>SRN</FormLabel>
                        <Input id='srn' textTransform='uppercase' shadow='md' />
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Rank</FormLabel>
                        <Input id='rank' isReadOnly onClick={() => {alert('click');}} textTransform='uppercase' shadow='md' />
                    </FormControl>
                </Box>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Email</FormLabel>
                        <Input id='email' textTransform='uppercase' shadow='md' />
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Contact No#.</FormLabel>
                        <Input id='contact_no' textTransform='uppercase' shadow='md' />
                    </FormControl>
                </Box>
            </Box>
            <Box display='flex' mt='2' flexDir={{base: 'column', md: 'row'}}>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Gender</FormLabel>
                        <Select id='gender' shadow='md' textTransform='uppercase'>
                            <option hidden>Select Gender</option>
                            <option value='male'>Male</option>
                            <option value='female'>Female</option>
                        </Select>
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Nationality</FormLabel>
                        <Input id='nationality' textTransform='uppercase' shadow='md' />
                    </FormControl>
                </Box>
                <Box w={{base: '100%', md: '50%'}} display='flex' flexDir={{base: 'column', md: 'row'}}>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Birth Date</FormLabel>
                        <Input id='birthDate' textTransform='uppercase' shadow='md' />
                        <FormLabel fontSize='sm' color='gray.500'>{`Format: mm/dd/yyyy`}</FormLabel>
                    </FormControl>
                    <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                        <FormLabel fontWeight='600' color='gray.500'>Birth Place</FormLabel>
                        <Input id='birthPlace' textTransform='uppercase' shadow='md' />
                    </FormControl>
                </Box>
            </Box>
            <FormControl mt='2' px={{base: '0', md: '2'}}>
                <FormLabel fontWeight='600' color='gray.500'>Address</FormLabel>
                <Input id='otherAddress' shadow='md' textTransform='uppercase' />
            </FormControl>
            <Box w='100%' mt='2' display='flex' flexDir={{base: 'column', md: 'row'}}>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Vessel Type</FormLabel>
                    <Input id='vessel' isReadOnly onClick={() => {alert('click');}} textTransform='uppercase' shadow='md' />
                </FormControl>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Company</FormLabel>
                    <Input id='company' isReadOnly onClick={() => {alert('click');}} textTransform='uppercase' shadow='md' />
                </FormControl>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Endorser</FormLabel>
                    <Input id='endorser' textTransform='uppercase' shadow='md' />
                </FormControl>
            </Box>

            <Text mt='2' fontSize='lg' fontWeight='600' color='gray.600'>{`In case of emergency:`}</Text>
            <Box w='100%' mt='2' display='flex' flexDir={{base: 'column', md: 'row'}}>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Emergency Contact Person</FormLabel>
                    <Input id='nationality' textTransform='uppercase' shadow='md' />
                </FormControl>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Emergency Contact No#.</FormLabel>
                    <Input id='nationality' textTransform='uppercase' shadow='md' />
                </FormControl>
                <FormControl px={{base: '0', md: '2'}} mt={{base: '2', md: '0'}}>
                    <FormLabel fontWeight='600' color='gray.500'>Relationship</FormLabel>
                    <Input id='birthDate' textTransform='uppercase' shadow='md' />
                </FormControl>
            </Box>
        </Box>
    )
} 


const OldTrainee = ({setTrainee, trainee, allTrainee, setTraineeID}: OldTraineeProps) => {

    return(
        <FormControl >
            <FormLabel fontWeight='600' color='gray.500'>{`Search Old Trainee's Name`}</FormLabel>
            <Input mt='2' onChange={(e) => {setTrainee(e.target.value);}} placeholder={`Last Name, First Name`} shadow='md' />
            <Select mt='2' shadow='md' onChange={(e) => {setTraineeID(e.target.value)}}>
                <option hidden>Select Trainee</option>
                {allTrainee && allTrainee.filter((t) => `${t.last_name}, ${t.first_name}`.toLowerCase().includes(trainee.toLowerCase()))
                    .sort((a, b) => a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name)) // Sort alphabetically by last name, then first name
                    .map((t) => (
                        <option key={t.id} value={t.id}>{`${t.last_name.toLocaleUpperCase()}, ${t.first_name.toLocaleUpperCase()} ${t.middle_name.toLocaleUpperCase()} ${t.suffix.toLocaleUpperCase()}`}</option>
                    ))
                }
            </Select>
        </FormControl>
    )
}