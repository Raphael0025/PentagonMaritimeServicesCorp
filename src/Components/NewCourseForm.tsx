'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, useDisclosure, List, ListItem,  InputGroup, InputLeftElement, Input, FormErrorMessage, FormControl, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, TableContainer, Table, Td, Tr, Th, Tbody, Thead } from '@chakra-ui/react'
import 'animate.css';
import PlusIcon from '@/Components/Icons/PlusIcon'
import TrashIcon from '@/Components/Icons/TrashIcon'
import { Course, initCourseVal, initCompanyFields, companyFields, CompanyCharge } from '@/types/document'
import { addCourse } from '@/lib/controller'
import Loading from '@/Components/Icons/Loading'
import Swal from 'sweetalert2'

interface IProps{
    onClose: () => void;
}

export default function NewCourseForm({ onClose } : IProps){
    const [courseVal, setCourseVal] = useState<Course>(initCourseVal)
    const [filledField, setFillField] = useState<companyFields>(initCompanyFields)
    const [isInsufficient, setSufficient] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [startTime, setStart] = useState<boolean>('')
    const [endTime, setEnd] = useState<boolean>('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        setCourseVal (prevState => ({
            ...prevState,
            [id]: value
        }))
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;
    
        setCourseVal(prevState => ({ 
            ...prevState,
            [id]: value
        }));
    }

    const handleCompanyCharges = () =>{
        const company = (document.getElementById('company') as HTMLInputElement).value
        const course_fee_num = (document.getElementById('company_fee') as HTMLInputElement).value

        const course_fee = parseInt(course_fee_num)

        const newCompanyCharge: CompanyCharge = {company, course_fee}
        const newKey = `company_${Object.keys(courseVal.company_charge).length + 1}`

        setCourseVal(prevState => ({
            ...prevState,
            company_charge:{
                ...prevState.company_charge,
                [newKey]: newCompanyCharge
            }
        }))
    }

    const handleDelete = (key: string) => {
        // Assuming courseVal is a state variable and setCourseVal is the function to update it
        const updatedCompanyCharge = { ...courseVal.company_charge };
        delete updatedCompanyCharge[key];
        setCourseVal(prevState => ({
            ...prevState,
            company_charge: updatedCompanyCharge
        }));
    };

    const handleSubmit = async () => {
        const actor: string | null = localStorage.getItem('customToken')
        try{
            if(!courseVal.course_code || !courseVal.course_name || !courseVal.course_fee || !courseVal.day || !courseVal.numOfDays ){
                setSufficient(true)
            } else {
                setIsLoading(true)
                
                await addCourse(courseVal, actor)
                onClose()
            }
        } catch(error){
            throw error
        } finally {
            setIsLoading(false)
            Swal.fire({
                title: `${courseVal.course_name} has been created successfully`,
                showConfirmButton: false,
                timer: 1500,
                icon: 'success',
            })
        }
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, id } = e.target;

        if (id === 'start_Time') {
            setStart(value);
        } else if (id === 'end_Time') {
            setEnd(value);
        } 
    }

    // this is to combine the names
    useEffect(() => {
        // Construct full name when any of the name fields change
        const timeSched = [startTime, endTime].filter(Boolean).join(' - ');
        setCourseVal(prevState => ({
            ...prevState,
            timeSched: timeSched
        }));
    }, [startTime, endTime]);

    return(
        <Box className='flex flex-col space-y-8 py-4'>
            <Box className='flex justify-between'>
                <Box className='input-grp w-full md:w-2/5' >
                    <FormControl isRequired>
                        <Input id='course_code' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                        <label htmlFor='course_code' className='form-label'>Course Code </label>
                        {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                    </FormControl>
                </Box>
                <Box className='input-grp w-full md:w-2/5' >
                    <FormControl isRequired>
                        <InputGroup>
                            <InputLeftElement pointerEvents='none' color='#a1a1a1' className='z-0'> Php </InputLeftElement>
                            <Input id='course_fee' onChange={handleChange} fontSize='lg' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                            <label htmlFor='course_fee' className='form-label-num z-10'>Course Fee</label>
                            {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                        </InputGroup>
                    </FormControl>
                </Box>
            </Box>
            <Box className='input-grp' >
                <FormControl isRequired>
                    <Input id='course_name' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                    <label htmlFor='course_name' className='form-label'>Course </label>
                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                </FormControl>
            </Box>
            <Box className='flex space-x-4'>
                <Box className='input-grp w-full '>
                    <select id='day' onChange={handleSelect} className='drop form-input w-full' defaultValue='' required>
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
                    <select id='numOfDays' onChange={handleSelect} className='drop form-input w-full' defaultValue='' required>
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
            <Box className='flex justify-center space-x-6'>
                <Box className='input-grp  w-1/2'>
                    <Input id='start_Time' onChange={handleTimeChange} fontSize='xs' size='lg' placeholder='' type='time' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                    <label htmlFor='start_Time' className='form-label'>Start Time </label>
                </Box>
                <Box className='input-grp w-1/2'>
                    <Input id='end_Time' onChange={handleTimeChange} fontSize='xs' size='lg' placeholder='' type='time' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                    <label htmlFor='end_Time' className='form-label'>End Time </label>
                </Box>
            </Box>
            <Box className='flex flex-col space-y-8'>
                <Text color='#a1a1a1'>Company Charge</Text>
                <Box className='flex justify-between items-end'>
                    <Box className='input-grp w-full md:w-2/5' >
                        <FormControl isRequired>
                            <Input id='company' onChange={(event) => setFillField((prev) => ({...prev, company: !!event.target.value}))} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                            <label htmlFor='company' className='form-label'>Company </label>
                            {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                        </FormControl>
                    </Box>
                    <Box className='input-grp w-full md:w-2/5' >
                        <FormControl isRequired>
                            <InputGroup>
                                <InputLeftElement pointerEvents='none' color='#a1a1a1' className='z-0'> Php </InputLeftElement>
                                <Input id='company_fee' onChange={(event) => setFillField((prev) => ({...prev, course_fee: !!event.target.value}))} fontSize='lg' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                <label htmlFor='company_fee' className='form-label-num z-10'>Company Fee</label>
                                {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                            </InputGroup>
                        </FormControl>
                    </Box>
                    <button disabled={!filledField.company || !filledField.course_fee} className={` ${!filledField.company || !filledField.course_fee ? 'btn-primary-disable' : 'btn-primary'} rounded flex items-center space-x-2 h-fit`} onClick={() => {handleCompanyCharges()}} style={{padding: '5px'}}><PlusIcon /></button>
                </Box>
                <TableContainer w='100%'>
                    <Table variant='simple'>
                        <Tbody>
                        {Object.entries(courseVal.company_charge).map(([key, company_charge]) => (
                            <Tr key={key}>
                                <Td>{company_charge.company}</Td>
                                <Td>{company_charge.course_fee.toString()}</Td>
                                <Td p={1}><button className='w-fit h-fit' onClick={() => handleDelete(key)}><TrashIcon /></button></Td>
                            </Tr>
                        ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </Box>
            <Box className='flex justify-end p-3 space-x-6'>
                <Button variant='outline' colorScheme='red' onClick={() => onClose()}>Cancel</Button>
                <Button isDisabled={!courseVal.course_code || !courseVal.course_name || !courseVal.course_fee || !courseVal.day || !courseVal.numOfDays}  bg={!courseVal.course_code || !courseVal.course_name || !courseVal.course_fee || !courseVal.day || !courseVal.numOfDays ? `#a1a1a1` : `#1C437E`} color='white' _hover={{ bg: (!courseVal.course_code || !courseVal.course_name || !courseVal.course_fee || !courseVal.day || !courseVal.numOfDays ? `#a1a1a1` : `blue.600`) }} className={!courseVal.course_code || !courseVal.course_name || !courseVal.course_fee || !courseVal.day || !courseVal.numOfDays ? `cursor-not-allowed` : ''} onClick={handleSubmit}>
                { isLoading ? (
                    <>
                        <span>Creating...</span>
                        <Loading /> 
                    </>
                ):( 
                    <> 
                        <span>Create Course</span>
                    </>
                )}
                </Button>
            </Box>
        </Box>
    );
}