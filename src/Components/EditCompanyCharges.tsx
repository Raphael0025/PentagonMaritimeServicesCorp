'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, Text, useDisclosure, List, ListItem,  InputGroup, InputLeftElement, Input, FormErrorMessage, FormControl, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, TableContainer, Table, Td, Tr, Th, Tbody, Thead } from '@chakra-ui/react'
import 'animate.css';
import { initReadCourses, CompanyCharge, ReadCourses, initCompanyFields, companyFields, } from '@/types/document'
import { editCompanyCharge, firestore } from '@/lib/controller'
import Loading from '@/Components/Icons/Loading'
import Swal from 'sweetalert2'
import { doc, getDoc } from 'firebase/firestore'
import PlusIcon from '@/Components/Icons/PlusIcon'
import TrashIcon from '@/Components/Icons/TrashIcon'

interface IProps{
    onClose: () => void;
    id: string;
}

export default function EditCourseForm({ onClose, id } : IProps){
    const [company_info, setCompanyInfo] = useState<ReadCourses>(initReadCourses)
    const [filledField, setFillField] = useState<companyFields>(initCompanyFields)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const handleCompanyCharges = () =>{
        const company = (document.getElementById('company') as HTMLInputElement).value
        const course_fee_num = (document.getElementById('company_fee') as HTMLInputElement).value

        const course_fee = parseInt(course_fee_num)

        const newCompanyCharge: CompanyCharge = {company, course_fee}
        const newKey = `company_${Object.keys(company_info.company_charge).length + 1}`

        setCompanyInfo(prevState => ({
            ...prevState,
            company_charge:{
                ...prevState.company_charge,
                [newKey]: newCompanyCharge
            }
        }))
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(firestore, 'course_mgmt', id);
                const docSnap = await getDoc(docRef);
        
                if (docSnap.exists()) {
                    setCompanyInfo(docSnap.data() as ReadCourses)
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

    const handleDelete = (key: string) => {
        // Assuming courseVal is a state variable and setCourseVal is the function to update it
        const updatedCompanyCharge = { ...company_info.company_charge };
        delete updatedCompanyCharge[key];
        setCompanyInfo(prevState => ({
            ...prevState,
            company_charge: updatedCompanyCharge
        }));
    };

    const handleSubmit = async () => {
        const actor: string | null = localStorage.getItem('customToken')
        try{
            setIsSubmitting(true)
            await editCompanyCharge(id, company_info, actor)
            onClose()
        } catch(error){
            throw error
        } finally {
            setIsSubmitting(false)
            Swal.fire({
                title: `Company Charges has been edited successfully`,
                showConfirmButton: false,
                timer: 1500,
                icon: 'success',
            })
        }
    }

    return(
        <Box className='flex flex-col pt-3 space-y-8'>
            {isLoading && <p>Loading...</p>}
            {!isLoading && company_info && (
            <>
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
                <Box className='flex flex-col space-y-3'>
                {Object.entries(company_info.company_charge).map(([key, company_charge]) => (
                    <Box className='p-2 flex justify-between items-center bg-slate-200 rounded' key={key}>
                        <Text textAlign='center' className='w-full'>{company_charge.company}</Text>
                        <Text textAlign='center' className='w-full'>{company_charge.course_fee.toString()}</Text>
                        <Text p={1}><button className='w-fit h-fit' onClick={() => handleDelete(key)}><TrashIcon /></button></Text>
                    </Box>
                ))}
                </Box>
            </>
            )}
            <Box className='flex justify-end p-3 space-x-6'>
                <Button variant='outline' colorScheme='red' onClick={() => onClose()}>Cancel</Button>
                <Button bg={`#1C437E`} color='white' _hover={{ bg: `blue.600` }} onClick={handleSubmit}>
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
