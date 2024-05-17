'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, useDisclosure, List, ListItem,  InputGroup, InputLeftElement, Input, FormErrorMessage, FormControl, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, TableContainer, Table, Td, Tr, Th, Tbody, Thead } from '@chakra-ui/react'
import 'animate.css';
import { EditCourses, initEditCourses } from '@/types/document'
import { editCourse, firestore } from '@/lib/controller'
import Loading from '@/Components/Icons/Loading'
import Swal from 'sweetalert2'
import { collection, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'

interface IProps{
    onClose: () => void;
    id: string;
}

export default function EditCourseForm({ onClose, id } : IProps){
    const [courseVal, setCourseInfo] = useState<EditCourses>(initEditCourses)
    const [isInsufficient, setSufficient] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        setCourseInfo (prevState => ({
            ...prevState,
            [id]: value
        }))
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;
    
        setCourseInfo(prevState => ({
            ...prevState,
            [id]: value
        }));
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(firestore, 'course_mgmt', id);
                const docSnap = await getDoc(docRef);
        
                if (docSnap.exists()) {
                    setCourseInfo(docSnap.data() as EditCourses)
                } else {
                    console.log('No such Course!');
                }
            } catch (error) {
                console.error('Error getting Course record:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, [id]);

    const handleSubmit = async () => {
        const actor: string | null = localStorage.getItem('customToken')
        try{
            if(!courseVal.course_code || !courseVal.course_name || !courseVal.course_fee || !courseVal.day || !courseVal.numOfDays ){
                setSufficient(true)
            } else {
                setIsSubmitting(true)
                await editCourse(id, courseVal, actor)
                onClose()
            }
        } catch(error){
            throw error
        } finally {
            setIsSubmitting(false)
            Swal.fire({
                title: `${courseVal.course_name} has been edited successfully`,
                showConfirmButton: false,
                timer: 1500,
                icon: 'success',
            })
        }
    }

    return(
        <Box className='flex flex-col space-y-8 py-4'>
            {isLoading && <p>Loading...</p>}
            {!isLoading && courseVal && (
            <>
                <Box className='flex justify-between'>
                    <Box className='input-grp w-full md:w-2/5' >
                        <FormControl isRequired>
                            <Input id='course_code' value={courseVal.course_code} onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                            <label htmlFor='course_code' className='form-label'>Course Code </label>
                            {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                        </FormControl>
                    </Box>
                    <Box className='input-grp w-full md:w-2/5' >
                        <FormControl isRequired>
                            <InputGroup>
                                <InputLeftElement pointerEvents='none' color='#a1a1a1' className='z-0'> Php </InputLeftElement>
                                <Input id='course_fee' value={courseVal.course_fee} onChange={handleChange} fontSize='lg' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                <label htmlFor='course_fee' className='form-label-num z-10'>Course Fee</label>
                                {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                            </InputGroup>
                        </FormControl>
                    </Box>
                </Box>
                <Box className='input-grp' >
                    <FormControl isRequired>
                        <Input id='course_name' value={courseVal.course_name}  onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                        <label htmlFor='course_name' className='form-label'>Course </label>
                        {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                    </FormControl>
                </Box>
                <Box className='flex space-x-4'>
                    <Box className='input-grp w-full '>
                        <select id='day' onChange={handleSelect} value={courseVal.day}  className='drop form-input w-full' defaultValue='' required>
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
                        <select id='numOfDays' onChange={handleSelect} value={courseVal.numOfDays}  className='drop form-input w-full' defaultValue='' required>
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
            </>
            )}
            <Box className='flex justify-end p-3 space-x-6'>
                <Button variant='outline' colorScheme='red' onClick={() => onClose()}>Cancel</Button>
                <Button isDisabled={!courseVal.course_code && !courseVal.course_name && !courseVal.course_fee && !courseVal.day && !courseVal.numOfDays}  
                bg={!courseVal.course_code && !courseVal.course_name && !courseVal.course_fee && !courseVal.day && !courseVal.numOfDays ? `#a1a1a1` : `#1C437E`} color='white' 
                _hover={{ bg: (!courseVal.course_code && !courseVal.course_name && !courseVal.course_fee && !courseVal.day && !courseVal.numOfDays ? `#a1a1a1` : `blue.600`) }} 
                className={!courseVal.course_code && !courseVal.course_name && !courseVal.course_fee && !courseVal.day && !courseVal.numOfDays ? `cursor-not-allowed` : ''} onClick={handleSubmit}>
                { isSubmitting ? (
                    <>
                        <span>Saving...</span>
                        <Loading /> 
                    </>
                ):( 
                    <> 
                        <span>Save Course</span>
                    </>
                )}
                </Button>
            </Box>
        </Box>
    )
}