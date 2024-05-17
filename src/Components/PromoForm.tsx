'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, useDisclosure, List, ListItem,  InputGroup, InputRightElement, Input, FormErrorMessage, FormControl, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, TableContainer, Table, Td, Tr, Th, Tbody, Thead } from '@chakra-ui/react'
import 'animate.css';
import { initNewPromo, newPromo, } from '@/types/document'
import { calculateDates, } from '@/types/handling'
import { addPromo, firestore } from '@/lib/controller'
import Loading from '@/Components/Icons/Loading'
import Swal from 'sweetalert2'
import { collection, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'
import PlusIcon from '@/Components/Icons/PlusIcon'

interface IProps{
    onClose: () => void
    id: string
}

export default function EditCourseForm({ onClose, id } : IProps){
    const [promo, setPromo] = useState<newPromo>(initNewPromo)
    const [course_name, setCourseName] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [promo_bool, setPromo_bool] = useState<boolean>(false)
    const [promoDates, setPromoDates] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const docRef = doc(firestore, 'course_mgmt', id)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    // Retrieve the course_name field from the document data
                    const courseName = docSnap.get('course_name')
                    const promoBool = docSnap.get('hasPromo')
                    const promoInfo = docSnap.get('promo')
                    // Set the fetched course name to the state
                    setCourseName(courseName)
                    setPromo_bool(promoBool)
                    if(promoBool){
                        setPromo(promoInfo)
                    }
                } else {
                    console.log('No such Course!')
                }
            } catch (error) {
                console.error('Error getting Course record:', error)
            } finally {
                setIsLoading(false);
            }
        }
        fetchData()
    }, [id])

    useEffect(() => {
        if (promo_bool) {
            const days = parseInt(promo.numOfPromoDays);
            const dated = calculateDates(promo.start_date, promo.end_date, days);
            setPromoDates(dated);
        }
    }, [promo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        setPromo (prevState => ({
            ...prevState,
            [id]: value
        }))
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;
    
        setPromo(prevState => ({
            ...prevState,
            [id]: value
        }));
    }

    const viewDates = () =>{
        const days = parseInt(promo.numOfPromoDays)
        
        const dated = calculateDates(promo.start_date, promo.end_date, days)
        setPromoDates(dated)
    }

    const handleSubmit = async () => {
        const actor: string | null = localStorage.getItem('customToken')
        try{
            setIsSubmitting(true)
            await addPromo(id, promo, actor, promo_bool)
            onClose()
        } catch(error){
            throw error
        } finally {
            setIsSubmitting(false)
            if(promo_bool){
                Swal.fire({
                    title: `Promo for ${course_name} has been save successfully`,
                    showConfirmButton: false,
                    timer: 2000,
                    icon: 'success',
                })
            }else{
                Swal.fire({
                    title: `Promo for ${course_name} has been created successfully`,
                    showConfirmButton: false,
                    timer: 2000,
                    icon: 'success',
                })
            }
        }
    }

    return(
        <Box className='flex flex-col space-y-8 py-4'>
            {isLoading ? (
                <Box className='text-center w-full'>Loading...</Box>
            ):(
            <>
            <Box className='flex space-x-6'>
                <Box className='w-1/2 flex flex-col space-y-6'>
                    <Box className='flex flex-col space-y-6'>
                        <Box className='input-grp w-full' >
                            <FormControl isRequired>
                                <Input id='course_name' value={course_name} onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                <label htmlFor='course_name' className='form-label'>Course Name </label>
                                {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                            </FormControl>
                        </Box>
                        <Box className='input-grp w-full' >
                            <FormControl isRequired>
                                <InputGroup>
                                    <InputRightElement pointerEvents='none' color='#a1a1a1' className='z-0'> % </InputRightElement>
                                    <Input value={promo.rate} id='rate' onChange={handleChange} fontSize='lg' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                    <label htmlFor='rate' className='form-label-num z-10'>Promo Rate</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>{`(required)`}</FormHelperText> */}
                                </InputGroup>
                            </FormControl>
                        </Box>
                    </Box>

                    <Box className='flex flex-col space-y-8'>
                        <Box className='input-grp w-full '>
                            <Text color='#a1a1a1'>Start Date:</Text>
                            <Box className='input-grp w-full'>
                                <input value={promo.start_date} onChange={handleChange} id='start_date' type='date' className='p-3 border-slate-500 w-full rounded border-2' required/>
                            </Box>
                        </Box>
                        <Box className='input-grp w-full '>
                            <Text color='#a1a1a1'>End Date:</Text>
                            <Box className='input-grp w-full'>
                                <input value={promo.end_date} onChange={handleChange} id='end_date' type='date' className='p-3 border-slate-500 w-full rounded border-2' required/>
                            </Box>
                        </Box>
                    </Box>

                    <Box className='input-grp flex flex-col space-y-2w-full '>
                        <Text color='#a1a1a1'>Select Number of Promo Days</Text>
                        <select id='numOfPromoDays' onChange={handleSelect}  className='drop form-input w-full' defaultValue={promo.numOfPromoDays} required>
                            <option value='' hidden disabled>Select Number of Promo Days</option>
                            <option value={'6'}>6 days</option>
                            <option value={'5'}>5 days</option>
                            <option value={'4'}>4 days</option>
                            <option value={'3'}>3 days</option>
                            <option value={'2'}>2 days</option>
                            <option value={'1'}>1 day</option>
                        </select>
                    </Box>
                </Box>
                <Box className='w-1/2'>
                    <Text color='#a1a1a1' >Selected Dates</Text>
                    <Box className='flex flex-col space-y-5'>
                    {promoDates.length === 0 ? (
                        <Text>No Promo Dates available</Text>
                    ) : (
                        promoDates.map((date, index) => (
                            <Text textAlign='center' className='p-3 rounded bg-slate-200' key={index}>{date}</Text>
                        ))
                    )}
                    </Box>
                </Box>
            </Box>
            </>)}
            <Box className='flex justify-between items-center p-3 space-x-6'>
                <Button bg={promo.start_date !== '' && promo.end_date !== '' && promo.numOfPromoDays !== '' ? `#1C437E` : '#a1a1a1'} color='white' _hover={{ bg: (promo.start_date !== '' && promo.end_date !== '' && promo.numOfPromoDays !== '' ? 'blue.600' : '#a1a1a1') }} isDisabled={promo.start_date === '' && promo.end_date === '' && promo.numOfPromoDays !== ''} onClick={() => viewDates()}>View Dates</Button>
                <Box className='flex justify-end p-3 space-x-6'>
                    <Button variant='outline' colorScheme='red' onClick={() => onClose()}>Cancel</Button>
                    {promo_bool ? (
                        <Button bg={`#1C437E`} color='white' _hover={{ bg: `blue.600` }} onClick={handleSubmit}>
                        { isSubmitting ? (
                            <>
                                <span>Saving...</span>
                                <Loading /> 
                            </>
                        ):( 
                            <> 
                                <span>Save Changes</span>
                            </>
                        )}
                        </Button>
                    ) 
                    :
                    (<Button bg={`#1C437E`} color='white' _hover={{ bg: `blue.600` }} onClick={handleSubmit}>
                    { isSubmitting ? (
                        <>
                            <span>Creating Promo...</span>
                            <Loading /> 
                        </>
                    ):( 
                        <> 
                            <PlusIcon />
                            <span>Create Promo</span>
                        </>
                    )}
                    </Button>)
                    }
                </Box>
            </Box>
        </Box>
    )
}