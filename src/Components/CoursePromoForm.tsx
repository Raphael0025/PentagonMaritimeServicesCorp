'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Text, useDisclosure, Select, useToast, InputGroup, InputRightElement, InputLeftElement, Input, FormErrorMessage, FormControl, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import DatePicker from 'react-datepicker'

import { TrashIcon } from '@/Components/Icons'
import { PlusIcon, CalendarIcon, } from '@/Components/SideIcons'

import { calculateDates, getFormattedDateRange, formatPromoPeriod, ToastStatus } from '@/types/handling'
import { CoursesById, PromoById, initCoursesById } from '@/types/courses'
import { PromoDates } from '@/types/utils'

import { HoliDates } from '@/handlers/course_handler'

import { addCoursePromo, stopCoursePromo, } from '@/lib/course_controller'

import { useCourses } from '@/context/CourseContext'

interface IProps{
    onClose: () => void
    id: string
}

export default function EditCourseForm({ onClose, id } : IProps){
    const toast = useToast()
    const {data: courses, coursePromos, } = useCourses()

    const [course, setCourse] = useState<CoursesById>(initCoursesById)
    const [numOfDays, setNumOfDays] = useState<number>(0)
    const [promoRate, setPromoRate] = useState<number>(0)
    const [promoID, setPromoID] = useState<string>('')

    const [loading, setLoading] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [closeNow, setClose] = useState<boolean>(false)
    const [isCreate, setCreateTo] = useState<boolean>(true)

    const [customStartDate, setCustomStartDate] = useState<Date | null>(new Date())
    const [selectedDates, setDates] = useState<PromoDates[]>([])
    const [knownPromos, setKnownPromos] = useState<PromoById[]>([])

    const { isOpen: deleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure()

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

    const handleSubmit = async () => {
        const actor: string | null = localStorage.getItem('customToken')
        try{
            setIsSubmitting(true)
            const forceToEnd: boolean = false

            for (const promo of selectedDates) {
                const newPromoObj = {
                    start_date: promo.startDate,
                    end_date: promo.endDate,
                    rate: promoRate,
                    forceToEnd,
                    ref_course_id: course.id,
                    numOfPromoDays: promo.numOfPromoDays,
                };
                await addCoursePromo(newPromoObj, course.course_name, actor);
            }
            setDates([])
            setPromoRate(0)
            setCreateTo(true)
        } catch(error){
            throw error
        } finally {
            setIsSubmitting(false)
            handleToast('Created Successfully!', `Promo for ${course.course_name} has been saved successfully`, 4000, 'success')
        }
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target
        setNumOfDays(Number(value))
    }

    const handleInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setPromoRate(Number(value))
    }

    const handleInsertDate = () => {
        if (customStartDate && numOfDays > 0) {
            
            const dateExists = selectedDates.some(
                (date) => date.startDate.toDateString() === customStartDate.toDateString()
            )
            if(!dateExists){
                const { dateRange, endDate } = getFormattedDateRange(customStartDate, numOfDays - 1)
                setDates(prev => [
                    ...prev,
                    {
                        startDate: customStartDate,
                        numOfPromoDays: numOfDays,
                        endDate: endDate,
                        dateRange: dateRange
                    }
                ])
            } else {
                handleToast('Date Selected', `Apparently, this date is already selected. please select another.`, 4000, 'warning')
            }
            setCustomStartDate(new Date())
            setNumOfDays(0)
        } else {
            console.error("Start date or number of promo days is invalid.")
            handleToast('Selection Required', `Please select an item from the dropdown list to proceed.`, 4000, 'warning')
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

    const handleClose = () => {
        const isTempEmpty = selectedDates.length === 0
        if(isTempEmpty || closeNow){
            onClose()
        } else {
            handleToast('Warning', `You have UnSaved Data. You sure you want to close?`, 5000, 'warning')
        }
        setClose(!closeNow)
    }

    const handleOpenStopDialog = () => {
        openDeleteDialog()
    }

    const handleStopPromo = async () => {
        const actor: string | null = localStorage.getItem('customToken')
        try{
            setLoading(true)
            await stopCoursePromo(promoID, actor)
            handleToast('Promo Successfully Stopped', `A Course Promo has been stopped.`, 3000, 'success')
        } catch(error){
            throw error
        }finally{
            setLoading(false)
            closeDeleteDialog()
        }
    }

    return(
        <>
        <Box className='flex flex-col space-y-8 pb-4' >
        {isCreate ? (
            <Box className='w-full space-y-3 flex-col'>
                <Box className='flex justify-end'>
                    <Button size='sm' onClick={() => setCreateTo(false)} leftIcon={<PlusIcon size='24' color='#2f67b2'/>} colorScheme='blue' variant='ghost'>Create Promo</Button>
                </Box>
                <Box className='w-full space-y-3 flex-col flex'>
                    <Box className='rounded bg-sky-600 flex p-2 px-4 text-white'>
                        <Text className='font-bold text-sm' style={{width: '10%'}}>#</Text>
                        <Text className='font-bold text-sm w-full ps-3'>Promo Period</Text>
                        <Text className='font-bold text-sm w-full text-center'>{`Promo (%)`}</Text>
                        <Text className='font-bold text-sm text-center' style={{width: '30%'}}>Action</Text>
                    </Box>
                    {knownPromos.length === 0 ? (
                        <Box className='flex justify-center items-center py-4'>
                            <Text color='gray.500' fontSize='lg'>
                                No Promos created for this course yet.
                            </Text>
                        </Box> 
                    ) : (
                        knownPromos.map((promo, index) => (
                            <Box key={index} className='flex items-center rounded border border-gray-400 shadow-md p-3'>
                                <Text style={{width: '10%'}}>{(index + 1)}.)</Text>
                                <Box className='w-full flex-col ps-3'>
                                    <Text className='w-full font-bold'>{formatPromoPeriod(promo.start_date, promo.end_date, promo.numOfPromoDays)}</Text>
                                    <Text className='w-full'><span className='text-gray-500'>No. of Days:</span> {promo.numOfPromoDays}</Text>
                                </Box>
                                <Text className='w-full text-center text-lg'>{promo.rate}%</Text>
                                <Button colorScheme='red' size='sm' w={'30%'} onClick={() => {handleOpenStopDialog(); setPromoID(promo.id)}} >Stop</Button>
                            </Box>
                        ))
                    )}
                </Box>
            </Box>
        ) : (
        <>
            <Box className='flex space-x-4 w-full'>
                <Box className='flex space-x-6 w-1/2'>
                    <Box className='w-full flex flex-col space-y-6'>
                        <Box className='flex flex-col space-y-6'>
                            <Box className='input-grp w-full' >
                                <FormControl isRequired>
                                    <Input id='course_name' value={course.course_name} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                    <label htmlFor='course_name' className='form-label'><span className='text-base'>Course Name</span></label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full' >
                                <FormControl isRequired>
                                    <InputGroup>
                                        <InputRightElement pointerEvents='none' color='#a1a1a1' className='z-0'> % </InputRightElement>
                                        <Input id='rate' onChange={handleInfo} value={promoRate === 0 ? '' : promoRate} fontSize='lg' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                        <label htmlFor='rate' className='form-label-num text-base z-10'>Promo Rate</label>
                                    </InputGroup>
                                </FormControl>
                            </Box>
                        </Box>
                        <Box className='flex flex-col space-y-8'>
                            <Box className='input-grp '>
                                <Text color='#a1a1a1'>Start Date:</Text>
                                <FormControl isRequired className='flex'>
                                    <DatePicker showPopperArrow={false} showIcon selected={customStartDate} onChange={(date) => setCustomStartDate(date)} showMonthDropdown useShortMonthInDropdown showYearDropdown dateFormat='E, MMM. dd, yyyy' minDate={new Date()} filterDate={isSunday} holidays={dynamicHolidays} 
                                        customInput={<Input id='start_date' className='w-full p-2' textAlign='center' size='lg' fontSize='md' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' _hover={{ borderColor: '#2f67b2' }} _focus={{ boxShadow: '0 0 0 0 rgba(88, 144, 255, .75), 0 0 0 rgba(0, 0, 0, .15)' }} /> } />
                                </FormControl>
                            </Box>
                        </Box>
                        <Box className='input-grp flex flex-col space-y-2 w-full '>
                            <Text color='#a1a1a1'>Number of Promo Days</Text>
                            <Select id='numOfPromoDays' onChange={handleSelect} value={numOfDays === 1 ? 'Select' : numOfDays} required>
                                <option >Select number of Days</option>
                                <option value={'6'}>6 days</option>
                                <option value={'5'}>5 days</option>
                                <option value={'4'}>4 days</option>
                                <option value={'3'}>3 days</option>
                                <option value={'2'}>2 days</option>
                                <option value={'1'}>1 day</option>
                            </Select>
                        </Box>
                        <Box>
                            <Button onClick={handleInsertDate} colorScheme='blue' leftIcon={<PlusIcon size='24' color='#2f67b2' />} variant='outline'>Insert Date</Button>
                        </Box>
                    </Box>
                </Box>
                <Box className='w-1/2 px-2'>
                    <Text className='w-full text-gray-500 font-semibold text-base'>Selected Dates</Text>
                    <Box className='space-y-3'>
                        {selectedDates.map((val, index) => (
                            <Box key={index} className="p-4 border rounded-md shadow-md">
                                <Box className='flex justify-between items-center w-full'>
                                    <Text fontWeight="bold" color='gray.400' >Promo Period:</Text>
                                    <Button size='sm' colorScheme='red' variant='ghost' onClick={() => setDates(prev => prev.filter((_, i) => i !== index ))}><TrashIcon size='24' color='red' /></Button>
                                </Box>
                                <Text className='font-bold text-base'>{val.dateRange}</Text>
                                <Text className='w-full text-end'>Promo Days: <span className='font-bold'>{val.numOfPromoDays}</span></Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
            <Box className='flex w-full justify-between items-center p-3 space-x-6'>
                <Button variant='ghost' onClick={() => setCreateTo(true)} >Back</Button>
                <Box className='flex w-full justify-end p-3 space-x-6'>
                    <Button variant='outline' colorScheme='red' onClick={handleClose}>Cancel</Button>
                    <Button isDisabled={selectedDates.length === 0} loadingText='Creating Promo...' leftIcon={<PlusIcon size={'24'} color='#fff' />} isLoading={isSubmitting} bg={`#1C437E`} color='white' _hover={{ bg: `blue.600` }} onClick={handleSubmit}>Create Promo</Button>
                </Box>
            </Box>
        </>
        )}
        </Box>
        <Modal isOpen={deleteDialogOpen} onClose={closeDeleteDialog}>
            <ModalOverlay />
            <ModalContent px={'10px'}>
                <ModalHeader>Stop this Promo?</ModalHeader>
                <ModalBody textAlign='center' fontSize='15px'>
                    {`Are you Sure you want to stop this Course Promo?
                    You can't undo this action afterwards.`}                    
                </ModalBody>
                <ModalFooter borderTopWidth='2px'>
                    <Box className='flex w-full justify-end'>
                        <Button onClick={closeDeleteDialog} mr={3} >{`No, I don't`}</Button>
                        <Button isLoading={loading} onClick={handleStopPromo} loadingText='Stopping...' colorScheme='red' >Yes, Force Stop.</Button>
                    </Box>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    )
}