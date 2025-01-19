'use client'

import React, { useState } from 'react'
import { useClients } from '@/context/ClientCompanyContext'
import { Box, Input, FormControl, FormLabel, Link, Button, Select, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Alert, AlertIcon, AlertTitle, AlertDescription, Text, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import { CloseIcon, ViewIcon, PlusIcon, EditIcon, TrashIcon } from '@/Components/Icons'
import { ToastStatus } from '@/types/handling'
import { CompanyCharge, initCompanyCharge, CompanyCourseCodesByID } from '@/types/client_company'
import { useCourses } from '@/context/CourseContext'
import { generateDateRanges } from '@/handlers/course_handler'
import { addCompanyCharge, addCourseCodes, UpdateCompanyCharge, DeleteCompanyCharge, DeleteCourseCodes } from '@/lib/client-controller'

interface props{
    id: string
}

export default function CompanyChargesModal ({id}: props) {
    const toast = useToast()
    const {data: allClients, companyCharge: companyCharges, courseCodes: companyCourseCodes} = useClients()
    const { data: allCourses } = useCourses()
    
    const { isOpen: isOpenModal, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
    const { isOpen: isOpenTS, onOpen: onOpenTS, onClose: onCloseTS } = useDisclosure()

    const [loading, setLoading] = useState<boolean>(false)
    const [companyCharge, setCompanyCharge] = useState<CompanyCharge>(initCompanyCharge)
    const [courseCodes, setCodes] = useState<string[]>([])
    const [courseCodeUpdate, setCodeUpdate] = useState<CompanyCourseCodesByID[]>([])
    const [courseCode, setCode] = useState<string>('')
    const [idRef, setID] = useState<string>('')
    const [idCompanyRef, setCompanyID] = useState<string>('')
    const [deleteCourseID, setCourseDelete] = useState<string[]>([])
    const [dates, setDateRange] = useState<string[]>([])

    const [numRef, setNumRef] = useState<number>(0)
    const [dayRef, setDayRef] = useState<string>('')

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
    
    const clientCompany = allClients ? allClients.find((client) => client.id === id) : undefined

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        if(id === 'company_course_code'){
            setCode(value)
        }else{
            setCompanyCharge((prev) => ({
                ...prev,
                [id]: value,
            }))
        }
    }
    
    const handleSaveData = async () => {
        setLoading(true)
        const getActor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const newCharge = {
                        ...companyCharge,
                        company_ref: id,
                        charge_fee: Number(companyCharge.charge_fee),
                        numOfDays: Number(companyCharge.numOfDays)
                    }
                    await addCompanyCharge(newCharge, getActor)
                    // Add new codes if available
                    if (courseCodes.length > 0) {
                        for (const codeObj of courseCodes) {
                            const newCode = {
                                company_course_code: codeObj,
                                id_company_ref: id,
                                id_course_ref: companyCharge.course_ref
                            }
                            await addCourseCodes(newCode);  // Add each contact individually
                        }
                    }
                    res()
                } catch (error) {
                    rej(error)
                }
            }, 2000)
        }).then(() => {
            handleToast('Company Charge Added Successfully!', `Successfully Added in the database.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            onCloseModal()
            setCodes([])
            setCompanyCharge(initCompanyCharge)
        })
    }

    const handleUpdateData = async () => {
        setLoading(true)
        const getActor: string | null = localStorage.getItem('customToken')
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const newCharge = {
                        ...companyCharge,
                        charge_fee: Number(companyCharge.charge_fee),
                        numOfDays: Number(companyCharge.numOfDays)
                    }
                    await UpdateCompanyCharge(idRef, newCharge, getActor)

                    if (deleteCourseID.length > 0) {
                        for (const contactID of deleteCourseID) {
                            await DeleteCourseCodes(contactID)  // Call deleteContact using the contact's ID
                        }
                    }

                    if (courseCodes.length > 0) {
                        for (const codeObj of courseCodes) {
                            const newCode = {
                                company_course_code: codeObj,
                                id_company_ref: id,
                                id_course_ref: companyCharge.course_ref
                            }
                            await addCourseCodes(newCode);  // Add each contact individually
                        }
                    }
                    res()
                } catch (error) {
                    rej(error)
                }
            }, 2000)
        }).then(() => {
            handleToast('Company Charge Added Successfully!', `Successfully Added in the database.`, 5000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
            onCloseEdit()
            setCodes([])
            setCompanyCharge(initCompanyCharge)
        })
    }

    const handleDelete = async () => {
        setLoading(true);
    
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try {
                    // Delete all contacts associated with this client
                    const courseCodes = companyCourseCodes ? companyCourseCodes.filter((course) => course.id_company_ref === id && course.id_course_ref === idRef) : []
                    if (courseCodes.length > 0) {
                        for (const course of courseCodes) {
                            await DeleteCourseCodes(course.id);
                        }
                    }
                    await DeleteCompanyCharge(idCompanyRef);
                    res(); 
                } catch (error) {
                    rej(error); 
                }
            }, 2000);
        })
        .then(() => {
            handleToast('Company Charge Deleted Successfully!', `This Company Charge has been successfully removed from the database.`, 5000, 'success')
        })
        .catch((error) => {
            console.log('Error deleting client:', error);
            handleToast('Error', 'Failed to delete company charge. Please try again.', 4000, 'error');
        })
        .finally(() => {
            setLoading(false)
            onCloseDelete()
            setID('')
        });
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target
        setCompanyCharge((prev) => ({
            ...prev,
            [id]: value,
        }))
    }

    const handleSetCodes = () => {
        setCodes((prev) => [
            ...prev,
            courseCode,
        ])
        setCode('')
    }

    const handleRemoveCode = (index: number) => {
        setCodes(prev => prev.filter((_, i) => i !== index));
    }

    const handleEdit = (id: string) => {
        if(!companyCharges) return
        const chargeToEdit = companyCharges.find((charge) => charge.id === id);
        if (chargeToEdit) {
            const { company_ref, course_ref, charge_fee, day, numOfDays, } = chargeToEdit;
            setCompanyCharge({ company_ref, course_ref, charge_fee, day, numOfDays, });
            
            const matchingCourseCodes = companyCourseCodes?.filter(
                (courseCode) => courseCode.id_company_ref === company_ref && courseCode.id_course_ref === course_ref
            ) || [];
            setCodeUpdate(matchingCourseCodes);
            setID(id)
            onOpenEdit() 
        }
    }

    const handleRemoveUpdateCourse = (index: number, id: string) => {
        setCodeUpdate(prev => prev.filter((_, i) => i !== index))
        setCourseDelete(prev => [
            ...prev,
            id,
        ])
    }

    const handleRange = (day: string, numOfDays: number) => {
        const dateRanges = generateDateRanges(day, 5, numOfDays.toString());
        setDateRange(dateRanges)
    }

    return(
    <>
        <Box className='flex flex-col space-y-3'>
            <Box className='flex items-center justify-between'>
                <Box className='flex space-x-4'>
                    <Text className='text-base text-gray-400'>Company:</Text>
                    <Text className='text-base'>{clientCompany ? clientCompany.company : 'Not Available'}</Text>
                </Box>
                <Button colorScheme='blue' onClick={onOpenModal} >Add</Button>
            </Box>
            <Box className='space-y-3'>
                <Box className='flex uppercase items-center border-b p-2 justify-between'>
                    <Text className='text-gray-400' w='50%'>Course Code</Text>
                    <Text className='text-gray-400' w='100%'>Company Course Code</Text>
                    <Text className='text-gray-400' w='50%'>Charge fee</Text>
                    <Text className='text-gray-400' w='50%'>Training Schedules</Text>
                    <Text className='text-gray-400 text-center' w='50%'>actions</Text>
                </Box>
                <Box>
                {clientCompany && companyCharges?.filter((cc) => cc.company_ref === clientCompany.id) // Only include charges associated with clientCompany.id
                    .sort((a, b) => {
                        const courseA = allCourses?.find((course) => course.id === a.course_ref)?.course_code || '';
                        const courseB = allCourses?.find((course) => course.id === b.course_ref)?.course_code || '';
                        return courseA.localeCompare(courseB); // Compare course codes alphabetically
                    }).map((cc) => {
                        const course = allCourses?.find((course) => course.id === cc.course_ref);
                        const matchingCourseCodes = companyCourseCodes?.filter(
                            (courseCode) =>
                                courseCode.id_company_ref === cc.company_ref &&
                                courseCode.id_course_ref === cc.course_ref
                        )
                        return (
                            <Box key={cc.id} className="flex justify-between uppercase p-2 border-b items-center">
                                <Text w="50%">{course ? course.course_code : 'Course not found'}</Text>
                                <Box w="100%" className="uppercase">
                                    {matchingCourseCodes && matchingCourseCodes.length > 0 ? (
                                        matchingCourseCodes.map((courseCode) => (
                                            <Text key={courseCode.id}>{courseCode.company_course_code}</Text>
                                        ))
                                    ) : (
                                        <Text>{``}</Text>
                                    )}
                                </Box>
                                <Text w="50%">Php {cc.charge_fee}</Text>
                                <Box w="50%">
                                    <Button size="xs" onClick={() => { setDayRef(cc.day); setNumRef(cc.numOfDays); handleRange(cc.day, cc.numOfDays); onOpenTS();}}>View</Button>
                                </Box>
                                <Box w="50%" className="flex justify-center">
                                    <Button size="xs" onClick={() => handleEdit(cc.id)} colorScheme="blue" mr={3}>
                                        <EditIcon size="18" color="#fff" />
                                    </Button>
                                    <Button size="xs" onClick={() => { onOpenDelete(); setID(cc.course_ref); setCompanyID(cc.id);}} colorScheme="red">
                                        <TrashIcon size="18" color="#fff" />
                                    </Button>
                                </Box>
                            </Box>
                        )
                    })}
                </Box>
            </Box>
        </Box>
        {/** Training Schedules */}
        <Modal isOpen={isOpenTS} onClose={onCloseTS} scrollBehavior='inside' size='md' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Training Schedules</ModalHeader>
                <ModalBody>
                    <Box className='flex flex-col space-y-6 justify-center'>
                        <Box className='flex space-x-6 justify-between'>
                            <Box className='flex space-x-6'>
                                <Text fontSize='14px' color='#a1a1a1' as='b'>Day:</Text>
                                <Text fontSize='14px' as='b'>{dayRef}</Text>
                            </Box>
                            <Box className='flex space-x-6'>
                                <Text fontSize='14px' color='#a1a1a1' as='b'>Number of Days:</Text>
                                <Text fontSize='14px' as='b'>{numRef}</Text>
                            </Box>
                        </Box>
                        {/* <Box className='flex space-x-4'>
                            <Text fontSize='14px' color='#a1a1a1' as='b'>Time Schedule:</Text>
                            <Text fontSize='14px' as='b'>{formatTime(startTimeRef, endTimeRef)}</Text>
                        </Box> */}
                        <Box className='flex flex-col space-y-2'>
                            <Text fontSize='14px' as='b' color='#a1a1a1'>Schedule Dates:</Text>
                            <Box className='flex flex-col space-y-6'>
                            {dates.map((date, index) => (
                                <Text className='p-2 rounded bg-slate-200 w-full' textAlign='center' key={index} fontSize='14px'>{date}</Text>
                            ))}
                            </Box>
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter></ModalFooter>
            </ModalContent>
        </Modal>
        {/** Edit Modal */}
        <Modal isOpen={isOpenEdit} onClose={onCloseEdit} scrollBehavior='inside' size='xl' motionPreset='slideInTop' >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Company Charge</ModalHeader>
                <ModalBody>
                    <Box className='space-y-3'>
                        <Box className='flex'>
                            <Box className='w-1/2 space-y-2'>
                                <Text className='text-gray-400'>Old</Text>
                                <Text className='uppercase'> {allCourses?.find((course) => course.id === companyCharge.course_ref)?.course_code || 'Course not found'}</Text>
                            </Box>
                            <FormControl w='50%'>
                                <label className='text-gray-400'>New Course Code</label>
                                <Select id='course_ref' w='100%' onChange={handleSelectChange} className='uppercase' size='sm' >
                                    <option hidden>{`Select Course Code`}</option>
                                {allCourses && allCourses.sort((a, b) => a.course_code.localeCompare(b.course_code)).map((course, index) => (
                                    <option key={index} label={course.course_code} value={course.id} />
                                ))}   
                                </Select>
                            </FormControl>
                        </Box>
                        <FormControl>
                            <label className='text-gray-400'>Charge Fee</label>
                            <Input id='charge_fee' value={companyCharge.charge_fee} placeholder='e.g. 2500' onChange={handleOnChange} w='100%' size='sm' fontSize='11px' className='uppercase' type='number' />
                        </FormControl>
                        <Box className='flex space-x-4'>
                            <Box className='input-grp w-full '>
                                <select id='day' value={companyCharge.day} onChange={handleSelectChange} className='drop form-input w-full' defaultValue='' required>
                                    <option value='' hidden disabled>Start Day</option>
                                    <option value='Monday'>Monday</option>
                                    <option value='Tuesday'>Tuesday</option>
                                    <option value='Wednesday'>Wednesday</option>
                                    <option value='Thursday'>Thursday</option>
                                    <option value='Friday'>Friday</option>
                                    <option value='Saturday'>Saturday</option>
                                </select>
                            </Box>
                            <Box className='input-grp w-full '>
                                <select id='numOfDays' value={companyCharge.numOfDays} onChange={handleSelectChange} className='drop form-input w-full' defaultValue='' required>
                                    <option value='' hidden disabled>Select Number of Days</option>
                                    <option value={6}>6 days</option>
                                    <option value={5}>5 days</option>
                                    <option value={4}>4 days</option>
                                    <option value={3}>3 days</option>
                                    <option value={2}>2 days</option>
                                    <option value={1}>1 day</option>
                                </select>
                            </Box>
                        </Box>
                        <Box className='flex space-x-3 items-end'>
                            <FormControl>
                                <label className='text-gray-400'>Company Course Code</label>
                                <Input id='company_course_code' placeholder='e.g. MAHIVO' value={courseCode} onChange={handleOnChange} w='100%' size='sm' fontSize='11px' className='uppercase' type='text' />
                            </FormControl>
                            <Button onClick={handleSetCodes} size='sm'>Add</Button>
                        </Box>
                        <Box className='space-y-2 uppercase'>
                            <Text className='text-gray-400'>{`Company Course Code(s)`}</Text>
                            {Array.isArray(courseCodeUpdate) && courseCodeUpdate.map((courseCode, index) => (
                                <Box key={index} className='flex items-center justify-between'>
                                    <Box className='flex space-x-4'>
                                        <Text className='text-gray-400'>Company Course Code:</Text>
                                        <Text>{courseCode.company_course_code}</Text>
                                    </Box>
                                    <Button onClick={() => { handleRemoveUpdateCourse(index, courseCode.id) }} variant='ghost' colorScheme='red'>
                                        <TrashIcon size='24' color='red' />
                                    </Button>
                                </Box>
                            ))}
                            {courseCodes.map((code, index) => (
                                <Box key={index} className='flex items-center justify-between'>
                                    <Box className='flex space-x-4'>
                                        <Text className='text-gray-400'>Company Course Code:</Text>
                                        <Text>{code}</Text>
                                    </Box>
                                    <Button onClick={() => { handleRemoveCode(index) }} variant='ghost' colorScheme='red'>
                                        <TrashIcon size='24' color='red' />
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='1px' >
                    <Button onClick={onCloseEdit} mr={3}>Cancel</Button>
                    <Button onClick={handleUpdateData} isLoading={loading} colorScheme='blue' loadingText='Saving...'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Delete Modal */}
        <Modal isOpen={isOpenDelete} onClose={onCloseDelete} scrollBehavior='inside' size='sm' motionPreset='slideInTop' >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Delete Company Charge</ModalHeader>
                <ModalBody>
                    <Box className='flex flex-col items-center justify-center'>
                        <Text fontSize='13px' >Are you sure you want to proceed to delete this data?</Text>
                        <Text fontSize='13px' >You cannot undo this action?</Text>
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='1px' >
                    <Button onClick={onCloseDelete} mr={3}>Cancel</Button>
                    <Button onClick={handleDelete} isLoading={loading} loadingText='Deleting...' colorScheme='red'>Delete</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Add Modal */}
        <Modal isOpen={isOpenModal} onClose={onCloseModal} scrollBehavior='inside' size='xl' motionPreset='slideInTop'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>New Company Charge</ModalHeader>
                <ModalBody>
                    <Box className='space-y-3'>
                        <FormControl>
                            <label className='text-gray-400'>Course Code</label>
                            <Select id='course_ref' w='100%' onChange={handleSelectChange} className='uppercase' size='sm' >
                                <option hidden>{`Select Course Code`}</option>
                            {allCourses && allCourses.sort((a, b) => a.course_code.localeCompare(b.course_code)).map((course, index) => (
                                <option key={index} label={course.course_code} value={course.id} />
                            ))}   
                            </Select>
                        </FormControl>
                        <FormControl>
                            <label className='text-gray-400'>Charge Fee</label>
                            <Input id='charge_fee' placeholder='e.g. 2500' onChange={handleOnChange} w='100%' size='sm' fontSize='11px' className='uppercase' type='number' />
                        </FormControl>
                        <Box className='flex space-x-4'>
                            <Box className='input-grp w-full '>
                                <select id='day' onChange={handleSelectChange} className='drop form-input w-full' defaultValue='' required>
                                    <option value='' hidden disabled>Start Day</option>
                                    <option value='Monday'>Monday</option>
                                    <option value='Tuesday'>Tuesday</option>
                                    <option value='Wednesday'>Wednesday</option>
                                    <option value='Thursday'>Thursday</option>
                                    <option value='Friday'>Friday</option>
                                    <option value='Saturday'>Saturday</option>
                                </select>
                            </Box>
                            <Box className='input-grp w-full '>
                                <select id='numOfDays' onChange={handleSelectChange} className='drop form-input w-full' defaultValue='' required>
                                    <option value='' hidden disabled>Select Number of Days</option>
                                    <option value={6}>6 days</option>
                                    <option value={5}>5 days</option>
                                    <option value={4}>4 days</option>
                                    <option value={3}>3 days</option>
                                    <option value={2}>2 days</option>
                                    <option value={1}>1 day</option>
                                </select>
                            </Box>
                        </Box>
                        <Box className='flex space-x-3 items-end'>
                            <FormControl>
                                <label className='text-gray-400'>Company Course Code</label>
                                <Input id='company_course_code' placeholder='e.g. MAHIVO' value={courseCode} onChange={handleOnChange} w='100%' size='sm' fontSize='11px' className='uppercase' type='text' />
                            </FormControl>
                            <Button onClick={handleSetCodes} size='sm'>Add</Button>
                        </Box>
                        <Box className='space-y-2 uppercase'>
                            <Text className='text-gray-400'>{`Company Course Code(s)`}</Text>
                            {courseCodes.map((code, index) => (
                                <Box key={index} className='flex items-center justify-between'>
                                    <Text>{`${index + 1}.)`}</Text>
                                    <Text>{code}</Text>
                                    <Button onClick={() => {handleRemoveCode(index)}} variant='ghost' colorScheme='red'><TrashIcon size='24' color='red' /></Button>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter borderTopWidth='1px'>
                    <Button onClick={onCloseModal} mr={3} >Cancel</Button>
                    <Button onClick={handleSaveData} isLoading={loading} loadingText='Saving...' colorScheme='blue'>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}