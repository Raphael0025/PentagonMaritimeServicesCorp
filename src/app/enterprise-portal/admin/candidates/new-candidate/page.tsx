'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
import { Box, Button, Heading, Text, FormControl, FormErrorMessage, Input, useDisclosure, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, } from '@chakra-ui/react'
import 'animate.css'
import PrevIcon from '@/Components/Icons/PrevIcon'
import PlusIcon from '@/Components/Icons/PlusIcon'
import Loading from '@/Components/Icons/Loading'
import { NewStaffValues, initStaffValues, WorkExperience, ImmediateDependents, EducationalAttainment, TrainingHistory, Role, prioFields, prioState, filledFields, initFillFields } from '@/types/document'
import { addCandidate } from '@/lib/controller'
import SignatureCanvas from 'react-signature-canvas'

export default function Page(){
    const router = useRouter()
    
    const [file, setFilename] = useState<string>('No file chosen yet...')
    const [dirFile, setDirFile] = useState<File[]>([])

    const [fName, setFName] = useState<string>('')
    const [mName, setMName] = useState<string>('')
    const [lName, setLName] = useState<string>('')
    const [suffix, setSuffix] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    const [sign, setSign] = useState<string>('');
    const { isOpen, onOpen, onClose } = useDisclosure()
    let padRef = useRef<SignatureCanvas>(null);

    const [formVal, setFormVal] = useState<NewStaffValues>(initStaffValues)
    const [touchedFields, setTouched] = useState<prioFields>(prioState)
    const [isInsufficient, setSufficient] = useState<boolean>(false)
    const [filledField, setFillField] = useState<filledFields>(initFillFields)

    const handleGenerate= () =>{
        const url = padRef.current?.getTrimmedCanvas().toDataURL("image/png");
        if (url) setSign(url);

        console.log(url)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        setFormVal (prevState => ({
            ...prevState,
            [id]: value
        }))
    }

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { id, value } = e.target;
    
        setFormVal(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleDetails = (val: string) => {
        // Get values from input fields
        const company = (document.getElementById('company') as HTMLInputElement).value;
        const position = (document.getElementById('position') as HTMLInputElement).value;
        const company_address = (document.getElementById('company_address') as HTMLInputElement).value;
        const stats = (document.getElementById('stats') as HTMLInputElement).value;
        const reason_leave = (document.getElementById('reason_leave') as HTMLInputElement).value;
        const fromStringWork = (document.getElementById('from_work') as HTMLInputElement).value;
        const toStringWork = (document.getElementById('to_work') as HTMLInputElement).value;

        const training_title = (document.getElementById('training_title') as HTMLInputElement).value;
        const training_provider = (document.getElementById('training_provider') as HTMLInputElement).value;
        const fromStringTraining = (document.getElementById('from_training') as HTMLInputElement).value;
        const toStringTraining = (document.getElementById('to_training') as HTMLInputElement).value;

        const emp_type = (document.getElementById('emp_type') as HTMLSelectElement).value;
        const emp_cat = (document.getElementById('emp_cat') as HTMLSelectElement).value;
        const job_position = (document.getElementById('job_position') as HTMLInputElement).value;
        const department = (document.getElementById('department') as HTMLSelectElement).value;
        const rankInput = (document.getElementById('rank') as HTMLInputElement).value;

        const name = (document.getElementById('name') as HTMLSelectElement).value;
        const dependent_relationship = (document.getElementById('dependent_relationship') as HTMLSelectElement).value;
        const dependent_gender = (document.getElementById('dependent_gender') as HTMLInputElement).value;
        const dependent_birth_date = (document.getElementById('dependent_birth_date') as HTMLSelectElement).value;

        const attainment = (document.getElementById('attainment') as HTMLInputElement).value;
        const school = (document.getElementById('school') as HTMLInputElement).value;
        const degree = (document.getElementById('degree') as HTMLInputElement).value;
        const fromStringEdu = (document.getElementById('from_edu') as HTMLInputElement).value;
        const toStringEdu = (document.getElementById('to_edu') as HTMLInputElement).value;

        const rank = parseInt(rankInput)
        // Create a new work experience object
        if(val === 'work'){
            const newInfo: WorkExperience = { company, position, stats, company_address, reason_leave, inc_dates: { from: fromStringWork, to: toStringWork }, }
            const newKey = `work_exp_${Object.keys(formVal.work_exp).length + 1}`

            setFormVal(prevState => ({
                ...prevState,
                work_exp: {
                    ...prevState.work_exp,
                    [newKey]: newInfo,
                },
            }));
        } else if (val === 'dependent'){
            const newInfo: ImmediateDependents = { name, dependent_relationship, dependent_gender, dependent_birth_date }
            const newKey = `dependent_${Object.keys(formVal.dependents).length + 1}`;

            setFormVal(prevState => ({
                ...prevState,
                dependents: {
                    ...prevState.dependents,
                    [newKey]: newInfo,
                },
            }));

        } else if (val === 'training'){
            const newInfo: TrainingHistory = { training_title, training_provider, inc_dates: { from: fromStringTraining, to: toStringTraining }, }
            const newKey = `training_history_${Object.keys(formVal.training_history).length + 1}`;

            setFormVal(prevState => ({
                ...prevState,
                training_history: {
                    ...prevState.training_history,
                    [newKey]: newInfo,
                },
            }));

        } else if (val === 'roles'){
            const newInfo: Role = { emp_type, emp_cat, job_position, department, rank }
            const newKey = `roles_${Object.keys(formVal.roles).length + 1}`

            // Update the state with the new work experience
            setFormVal(prevState => ({
                ...prevState,
                roles: {
                    ...prevState.roles,
                    [newKey]: newInfo,
                },
            }));
        } else if (val === 'edu'){
            const newInfo: EducationalAttainment = { attainment, school, degree, inc_dates: { from: fromStringEdu, to: toStringEdu } }
            const newKey = `edu_${Object.keys(formVal.educational_attainment).length + 1}`

            // Update the state with the new work experience
            setFormVal(prevState => ({
                ...prevState,
                educational_attainment: {
                    ...prevState.educational_attainment,
                    [newKey]: newInfo,
                },
            }));
        }
            console.log(formVal)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            setFilename(file);
            setDirFile(Array.from(files));
        } else {
            setFilename('No file chosen yet...')
        }
    }

    const handleSubmit = async () => {
        try{
            if(!formVal.full_name || !formVal.gender || !formVal.birthDate || !formVal.age || !formVal.status || !formVal.address || !formVal.phone || !formVal.email || !formVal.birthPlace || !formVal.sss || !formVal.tin ){
                setSufficient(true)
            } else {
                setIsLoading(true)
                await addCandidate(formVal, dirFile, file, sign, formVal.full_name, 'In Probation', 'Walk-in')

                router.push('/enterprise-portal/admin/candidates')
            }
        } catch(error){
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, id } = e.target;

        if (id === 'fName') {
            setFName(value);
        } else if (id === 'mName') {
            setMName(value);
        } else if (id === 'lName') {
            setLName(value);
        } else if (id === 'suffix') {
            setSuffix(value);
        }
    }

    // this is to combine the names
    useEffect(() => {
        // Construct full name when any of the name fields change
        const fullName = [fName, mName, lName, suffix].filter(Boolean).join(' ');
        setFormVal(prevState => ({
            ...prevState,
            full_name: fullName
        }));
    }, [fName, mName, lName, suffix]);

    const onBlur = ({target}: React.ChangeEvent<HTMLInputElement>) => 
        setTouched((prev) => ({...prev, [target.id]: true }))  

    const onBlurSelect = ({target}: React.ChangeEvent<HTMLSelectElement>) => 
        setTouched((prev) => ({...prev, [target.id]: true }))  

    return(
        <>
            <main className='flex flex-col items-center space-y-5 justify-center w-full'>
                <section className='w-full justify-between flex'>
                    <Box className='w-full items-center'>
                        <Link href='/enterprise-portal/admin/candidates' className='flex space-x-2 items-center' style={{color: '#a1a1a1'}}>
                            <PrevIcon />
                            <span>Back</span>
                        </Link>
                        <Heading as='h4' size='md'>{`New Candidate`}</Heading>
                    </Box>
                </section>
                <section className='rounded flex flex-col space-y-8 items-center justify-center'>
                    {/** Personal Info fields */}
                    <Box className='w-full p-8 rounded flex flex-col space-y-8 items-center justify-center border-2 border-gray-300'>
                        <Box className='flex space-x-2  items-start w-full'>
                            <Image src="/icons/list.png" alt="School Logo" width={24} height={24} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Candidate's Information`}</Heading>
                        </Box>
                        <Box className='flex items-center w-full justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={(touchedFields.fName && !fName) || (isInsufficient && !fName)}>
                                    <Input id='fName' value={fName} onBlur={onBlur} onChange={handleNameChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' errorBorderColor='red.300' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='fName' className='form-label'>Given Name</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Given Name is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl>
                                    <Input id='mName' value={mName} onChange={handleNameChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='mName' className='form-label'>Middle Name</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={(touchedFields.lName && !lName) || (isInsufficient && !lName)}>
                                    <Input id='lName' value={lName} onBlur={onBlur} onChange={handleNameChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' errorBorderColor='red.300' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='lName' className='form-label'>Last Name</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Last Name is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-1/3'>
                                <FormControl>
                                    <Input id='suffix' value={suffix} onChange={handleNameChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='suffix' className='form-label'>Suffix</label>
                                </FormControl>
                            </Box>
                        </Box>
                        <Box className='flex items-center w-full justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={(touchedFields.birthPlace && !formVal.birthPlace) || (isInsufficient && !formVal.birthPlace)}>
                                    <Input id='birthPlace' onChange={handleChange} onBlur={onBlur} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='birthPlace' className='form-label'>Place of Birth</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Place of Birth is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='flex w-full items-center justify-around space-x-4 '>
                                <span className='text-gray text-xs w-auto text-center'>Date of Birth:</span>
                                <Box className='input-grp w-full'>
                                    <input id='birthDate' type='date' onBlur={onBlur} value={formVal.birthDate || ''} onChange={handleChange} className={`${isInsufficient && !formVal.birthDate ? 'border-2 border-red-500' : ''} p-3 border-slate-500 w-full rounded border-2`} required/>
                                    {isInsufficient && !formVal.birthDate ? <span className='w-full text-xs flex justify-end font-normal text-red-500 py-1'>This field is required</span> : ''}
                                </Box>
                            </Box>
                            <Box className='input-grp w-1/3'>
                                <FormControl isRequired isInvalid={(touchedFields.age && !formVal.age) || (isInsufficient && !formVal.age)}>
                                    <Input id='age' onBlur={onBlur} onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='age' className='form-label'>Age</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Age is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                        </Box>
                        <Box className='flex w-full items-center justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={(touchedFields.address && !formVal.address) || (isInsufficient && !formVal.address)}>
                                    <Input id='address' onChange={handleChange} onBlur={onBlur} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='address' className='form-label'>Address</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Address is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                        </Box>
                        <Box className='flex w-full items-center justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl>
                                    <Input id='province_address' onChange={handleChange} onBlur={onBlur} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='province_address' className='form-label'>Provincial Address</label>
                                </FormControl>
                            </Box>
                        </Box>
                        <Box className='flex w-full items-center justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <select id='gender' onChange={handleSelect} onBlur={onBlurSelect} className={`${(touchedFields.gender && !formVal.gender) || (isInsufficient && !formVal.gender) ? 'border-2 border-red-500' : ''} drop form-input w-full`} defaultValue='' required>
                                    <option value='' hidden disabled>Select Gender</option>
                                    <option value='male'>Male</option>
                                    <option value='female'>Female</option>
                                </select>
                                {(touchedFields.gender && !formVal.gender) || (isInsufficient && !formVal.gender) ? <span className='w-full text-xs flex justify-end font-normal text-red-500 py-1'>Please select your gender</span> : ''}
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={(touchedFields.phone && !formVal.phone) || (isInsufficient && !formVal.phone)}>
                                    <Input id='phone' onChange={handleChange} onBlur={onBlur} fontSize='xs' size='lg' placeholder='' type='tel' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='phone' className='form-label'>Contact</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Contact Number is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={(touchedFields.email && !formVal.email) || (isInsufficient && !formVal.email)}>
                                    <Input id='email' onChange={handleChange} onBlur={onBlur} fontSize='xs' size='lg' placeholder='' type='email' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='email' className='form-label'>Email</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Email is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={(touchedFields.status && !formVal.status) || (isInsufficient && !formVal.status)}>
                                    <Input id='status' onChange={handleChange} onBlur={onBlur} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='status' className='form-label'>Marital Status</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Marital Status is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                        </Box>
                    </Box>
                    {/** Immediate Dependents fields */}
                    <Box className='w-full p-8 rounded flex flex-col space-y-4 items-center justify-center border-2 border-gray-300'>
                        <Box className='flex space-x-2  items-start w-full'>
                            <Image src="/icons/family-grey.png" alt="School Logo" width={28} height={28} />
                            <Box className='flex space-x-3 items-end'>
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Immediate Dependents`}</Heading>
                                <Text as='samp' style={{fontSize: '9px'}} className='italic text-gray'>{`Fill out fields if necessary`}</Text>
                            </Box>
                        </Box>
                        <Box className='flex items-end w-full justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input onChange={(event) => setFillField((prev) => ({...prev, field1 : !!event.target.value}))} id='name' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='name' className='form-label'>Immediate Dependent</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl>
                                    <Input onChange={(event) => setFillField((prev) => ({...prev, field2 : !!event.target.value}))} id='dependent_relationship' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='dependent_relationship' className='form-label'>Relationship</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <select onChange={(event) => setFillField((prev) => ({...prev, field3 : !!event.target.value}))} id='dependent_gender' className='drop form-input w-full' defaultValue='' required>
                                    <option value='' hidden disabled>Select gender</option>
                                    <option value='Male'>Male</option>
                                    <option value='Female'>Female</option>
                                </select>
                            </Box>
                            <Box className='flex w-full items-center justify-around space-x-4 '>
                                <span className='text-gray text-xs w-full text-center'>Date of Birth:</span>
                                <Box className='input-grp w-full'>
                                    <input onChange={(event) => setFillField((prev) => ({...prev, field4 : !!event.target.value}))} id='dependent_birth_date' type='date' className='p-3 border-slate-500 w-fit rounded border-2' required/>
                                </Box>
                            </Box>
                            <button disabled={!filledField.field1 || !filledField.field2 || !filledField.field3 || !filledField.field4} onClick={() => {handleDetails('dependent')}} className={`${!filledField.field1 || !filledField.field2 || !filledField.field3 || !filledField.field4 ? 'btn-primary-disable' : 'btn-primary' } rounded flex items-center space-x-2`} style={{padding: '10px'}}><PlusIcon /> <span>Add</span></button>
                        </Box>
                        <TableContainer w='100%'>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Immediate Dependent</span></Th>
                                        <Th><span className='text-xs font-medium'>Relationship</span></Th>
                                        <Th><span className='text-xs font-medium'>Gender</span></Th>
                                        <Th><span className='text-xs font-medium'>Date of Birth</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(formVal.dependents).map(([key, dependent]) => (
                                    <Tr key={key}>
                                        <Td>{dependent.name}</Td>
                                        <Td>{dependent.dependent_relationship}</Td>
                                        <Td>{dependent.dependent_gender}</Td>
                                        <Td>{dependent.dependent_birth_date}</Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    {/** Emergency Contact fields */}
                    <Box className='w-full p-8 rounded flex flex-col space-y-8 items-center justify-center border-2 border-gray-300'>
                        <Box className='flex space-x-2 items-start w-full'>
                            <Image src="/icons/emergency.png" alt="School Logo" width={24} height={24} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Emergency Contact`}</Heading>
                        </Box>
                        <Box className='flex items-center w-full justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='contact_person' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='contact_person' className='form-label'>Contact Person</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='emergency_contact' onChange={handleChange} placeholder='' type='tel' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='emergency_contact' className='form-label'>Contact Number</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='relationship' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='relationship' className='form-label'>Relationship</label>
                                    {/* <FormHelperText w='100%' style={{fontSize: '10px', marginTop: '3px' }} className='text-end'>Last Name is required</FormHelperText> */}
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input id='contact_address' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                    <label htmlFor='contact_address' className='form-label'>Address</label>
                                </FormControl>
                            </Box> 
                        </Box>
                    </Box>
                    {/** Educational Attainment fields */}
                    <Box className='w-full p-8 rounded flex flex-col space-y-6 items-center justify-center border-2 border-gray-300'>
                        <Box className='flex space-x-2 items-start w-full'>
                            <Image src="/icons/educational.png" alt="School Logo" width={24} height={24} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Educational Attainment`}</Heading>
                        </Box>
                        <Box className='flex w-full flex-col justify-start space-y-4'>
                            <Box className='flex items-end w-full justify-between space-x-4'>
                                <Box className='input-grp w-full'>
                                    <FormControl isRequired>
                                        <Input onChange={(event) => setFillField((prev) => ({...prev, eduField1: !!event.target.value}))} id='attainment' placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                        <label htmlFor='attainment' className='form-label'>Educational Attainment</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-full'>
                                    <FormControl isRequired>
                                        <Input onChange={(event) => setFillField((prev) => ({...prev, eduField2: !!event.target.value}))} id='school' placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                        <label htmlFor='school' className='form-label'>School</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-full'>
                                    <FormControl isRequired>
                                        <Input onChange={(event) => setFillField((prev) => ({...prev, eduField3: !!event.target.value}))} id='degree' placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                        <label htmlFor='degree' className='form-label'>Degree Earned</label>
                                    </FormControl>
                                </Box>
                                <Box className='flex flex-col justify-end'>
                                    <Text className='position-absolute text-gray text-xs w-full text-start'>Inclusive Dates:</Text>
                                    <Box className='flex w-full items-center justify-around space-x-4 position-relative '>
                                        <Text className='position-absolute text-gray text-xs w-full text-end'>From</Text>
                                        <Box className='input-grp w-full'>
                                            <input id='from_edu' onChange={(event) => setFillField((prev) => ({...prev, eduField4: !!event.target.value}))} type='date' className='p-3 border-slate-500 w-fit rounded border-2' required/>
                                        </Box>
                                        <Text className='position-absolute text-gray text-xs w-full text-end'>To</Text>
                                        <Box className='input-grp w-full'>
                                            <input id='to_edu' onChange={(event) => setFillField((prev) => ({...prev, eduField5: !!event.target.value}))} type='date' className='p-3 border-slate-500 w-fit rounded border-2' required/>
                                        </Box>
                                    </Box>
                                </Box>
                                <button disabled={!filledField.eduField1 || !filledField.eduField2 || !filledField.eduField3 || !filledField.eduField4 || !filledField.eduField5 } onClick={() => {handleDetails('edu')}} className={`${!filledField.eduField1 || !filledField.eduField2 || !filledField.eduField3 || !filledField.eduField4 || !filledField.eduField5 ? 'btn-primary-disable' : 'btn-primary'} rounded flex items-center space-x-2`} style={{padding: '10px'}}><PlusIcon /> <span>Add</span></button>
                            </Box>
                        </Box>
                        <TableContainer w='100%'>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Educational Attainment</span></Th>
                                        <Th><span className='text-xs font-medium'>School/University</span></Th>
                                        <Th><span className='text-xs font-medium'>Degree</span></Th>
                                        <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(formVal.educational_attainment).map(([key, edu]) => (
                                    <Tr key={key}>
                                        <Td>{edu.attainment}</Td>
                                        <Td>{edu.school}</Td>
                                        <Td>{edu.degree}</Td>
                                        <Td>{`${edu.inc_dates.from} to ${edu.inc_dates.to}`}</Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    {/** Work Experience fields */}
                    <Box className='w-full p-8 rounded flex flex-col space-y-4 items-center justify-center border-2 border-gray-300'>
                        <Box className='flex space-x-2  items-center w-full'>
                            <Image src="/icons/work.png" alt="School Logo" width={24} height={24} />
                            <Box className='flex space-x-3 items-end'>
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Work Experience`}</Heading>
                                <Text as='samp' style={{fontSize: '9px'}} className='italic text-gray'>{`Fill out fields if necessary`}</Text>
                            </Box>
                        </Box>
                        <Box className='flex flex-col items-end w-full justify-between space-y-4'>
                            <Box className='flex items-end w-full justify-between space-x-4'>
                                <Box className='input-grp w-full'>
                                    <FormControl isRequired>
                                        <Input onChange={(event) => setFillField((prev) => ({...prev, workField1: !!event.target.value}))} id='company' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='company' className='form-label'>Company</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-full'>
                                    <FormControl>
                                        <Input onChange={(event) => setFillField((prev) => ({...prev, workField2: !!event.target.value}))} id='position' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='position' className='form-label'>Position</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-3/4'>
                                    <FormControl>
                                        <Input onChange={(event) => setFillField((prev) => ({...prev, workField3: !!event.target.value}))} id='reason_leave' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='reason_leave' className='form-label'>Reason for Leave</label>
                                    </FormControl>
                                </Box>
                            </Box>
                            <Box className='flex items-end w-full justify-between space-x-4'>
                                <Box className='input-grp w-full'>
                                    <FormControl>
                                        <Input onChange={(event) => setFillField((prev) => ({...prev, workField4: !!event.target.value}))} id='company_address' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='company_address' className='form-label'>Address</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-full'>
                                    <FormControl>
                                        <Input onChange={(event) => setFillField((prev) => ({...prev, workField5: !!event.target.value}))} id='stats' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='stats' className='form-label'>Status</label>
                                    </FormControl>
                                </Box>
                                <Box className='flex flex-col justify-end'>
                                    <Text className='position-absolute text-gray text-xs w-full text-start'>Inclusive Dates:</Text>
                                    <Box className='flex w-full items-center justify-around space-x-4 position-relative '>
                                        <Text className='position-absolute text-gray text-xs w-full text-end'>From</Text>
                                        <Box className='input-grp w-full'>
                                            <input onChange={(event) => setFillField((prev) => ({...prev, workField6: !!event.target.value}))} id='from_work' type='date' className='p-3 border-slate-500 w-fit rounded border-2' required/>
                                        </Box>
                                        <Text className='position-absolute text-gray text-xs w-full text-end'>To</Text>
                                        <Box className='input-grp w-full'>
                                            <input onChange={(event) => setFillField((prev) => ({...prev, workField7: !!event.target.value}))} id='to_work' type='date' className='p-3 border-slate-500 w-fit rounded border-2' required/>
                                        </Box>
                                    </Box>
                                </Box>
                                <button disabled={!filledField.workField1 || !filledField.workField2 || !filledField.workField3 || !filledField.workField4 || !filledField.workField5 || !filledField.workField6 || !filledField.workField7} onClick={() => {handleDetails('work')}} className={`${!filledField.workField1 || !filledField.workField2 || !filledField.workField3 || !filledField.workField4 || !filledField.workField5 || !filledField.workField6 || !filledField.workField7 ? 'btn-primary-disable' : 'btn-primary'} rounded flex items-center space-x-2`} style={{padding: '10px'}}><PlusIcon /> <span>Add</span></button>
                            </Box>
                        </Box>
                        <TableContainer w='100%'>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Company</span></Th>
                                        <Th><span className='text-xs font-medium'>Address</span></Th>
                                        <Th><span className='text-xs font-medium'>Position</span></Th>
                                        <Th><span className='text-xs font-medium'>Status</span></Th>
                                        <Th><span className='text-xs font-medium'>Reason for Leave</span></Th>
                                        <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(formVal.work_exp).map(([key, experience]) => (
                                    <Tr key={key}>
                                        <Td>{experience.company}</Td>
                                        <Td>{experience.company_address}</Td>
                                        <Td>{experience.position}</Td>
                                        <Td>{experience.stats}</Td>
                                        <Td>{experience.reason_leave}</Td>
                                        <Td>{`${experience.inc_dates.from} to ${experience.inc_dates.to}`}</Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    {/** Training History fields */}
                    <Box className='w-full p-8 rounded flex flex-col space-y-4 items-center justify-center border-2 border-gray-300'>
                        <Box className='flex space-x-2  items-start w-full'>
                            <Image src="/icons/history.png" alt="School Logo" width={24} height={24} />
                            <Box className='flex space-x-3 items-end'>
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Training History`}</Heading>
                                <Text as='samp' style={{fontSize: '9px'}} className='italic text-gray'>{`Fill out fields if necessary`}</Text>
                            </Box>
                        </Box>
                        <Box className='flex items-end w-full justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input onChange={(event) => setFillField((prev) => ({...prev, trainingField1: !!event.target.value}))} id='training_title' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='training_title' className='form-label'>Title</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl>
                                    <Input onChange={(event) => setFillField((prev) => ({...prev, trainingField2: !!event.target.value}))} id='training_provider' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='training_provider' className='form-label'>Provider</label>
                                </FormControl>
                            </Box>
                            <Box className='flex flex-col justify-end'>
                                <Text className='position-absolute text-gray text-xs w-full text-start'>Inclusive Dates:</Text>
                                <Box className='flex w-full items-center justify-around space-x-4 position-relative '>
                                    <Text className='position-absolute text-gray text-xs w-full text-end'>From</Text>
                                    <Box className='input-grp w-full'>
                                        <input onChange={(event) => setFillField((prev) => ({...prev, trainingField3: !!event.target.value}))} id='from_training' type='date' className='p-3 border-slate-500 w-fit rounded border-2' required/>
                                    </Box>
                                    <Text className='position-absolute text-gray text-xs w-full text-end'>To</Text>
                                    <Box className='input-grp w-full'>
                                        <input onChange={(event) => setFillField((prev) => ({...prev, trainingField4: !!event.target.value}))} id='to_training' type='date' className='p-3 border-slate-500 w-fit rounded border-2' required/>
                                    </Box>
                                </Box>
                            </Box>
                            <button disabled={ !filledField.trainingField1 && !filledField.trainingField2 && !filledField.trainingField3 && !filledField.trainingField4 } onClick={() => {handleDetails('training')}} className={`${!filledField.trainingField1 && !filledField.trainingField2 && !filledField.trainingField3 && !filledField.trainingField4 ? 'btn-primary-disable' : 'btn-primary' } rounded flex items-center space-x-2`} style={{padding: '10px'}}><PlusIcon /> <span>Add</span></button>
                        </Box>
                        <TableContainer w='100%'>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Title</span></Th>
                                        <Th><span className='text-xs font-medium'>Provider</span></Th>
                                        <Th><span className='text-xs font-medium'>Inclusive Dates</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(formVal.training_history).map(([key, history]) => (
                                    <Tr key={key}>
                                        <Td>{history.training_title}</Td>
                                        <Td>{history.training_provider}</Td>
                                        <Td>{`${history.inc_dates.from} to ${history.inc_dates.to}`}</Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    {/** Government ID fields */}
                    <Box className='w-full p-8 rounded flex flex-col space-y-8 items-center justify-center border-2 border-gray-300'>
                        <Box className='flex space-x-2  items-start w-full'>
                            <Image src="/icons/Govt.png" alt="School Logo" width={24} height={24} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Government Issued ID's`}</Heading>
                        </Box>
                        <Box className='flex items-end w-full justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={isInsufficient && !formVal.sss}>
                                    <Input id='sss' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='sss' className='form-label'>SSS ID</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>This field is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl>
                                    <Input id='philhealth' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='philhealth' className='form-label'>PhilHealth ID</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl>
                                    <Input id='hdmf' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='hdmf' className='form-label'>HDMF ID</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={isInsufficient && !formVal.tin}>
                                    <Input id='tin' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='tin' className='form-label'>TIN ID</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>This field is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                        </Box>
                    </Box>
                    {/** Job Position fields */}
                    <Box className='w-full p-8 rounded flex flex-col space-y-4 items-center justify-center border-2 border-gray-300'>
                        <Box className='flex space-x-2  items-start w-full'>
                            <Image src="/icons/work.png" alt="School Logo" width={24} height={24} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Position Details`}</Heading>
                        </Box>
                        <Box className='flex items-end w-full justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <select onChange={(event) => setFillField((prev) => ({...prev, jobField1: !!event.target.value}))} id='emp_type' className='drop form-input w-full' defaultValue='' required>
                                    <option value='' hidden disabled>Select Employee Type</option>
                                    <option value='Full Time'>Full Time</option>
                                    <option value='Part Time'>Part Time</option>
                                    <option value='Internship'>Internship</option>
                                </select>
                            </Box>
                            <Box className='input-grp w-full'>
                                <select onChange={(event) => setFillField((prev) => ({...prev, jobField2: !!event.target.value}))} id='emp_cat' className='drop form-input w-full' defaultValue='' required>
                                    <option value='' hidden disabled>Select Category</option>
                                    <option value='Teaching Staff'>Teaching Staff</option>
                                    <option value='Non-Teaching Staff'>Non-Teaching Staff</option>
                                </select>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl>
                                    <Input onChange={(event) => setFillField((prev) => ({...prev, jobField3: !!event.target.value}))} id='job_position' fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='job_position' className='form-label'>Position</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <select onChange={(event) => setFillField((prev) => ({...prev, jobField4: !!event.target.value}))} id='department' className='drop form-input w-full' defaultValue='' required>
                                    <option value='' hidden disabled>Select Department</option>
                                    <option value='Admin'>Admin</option>
                                    <option value='Training'>Training</option>
                                    <option value='Registration'>Registration</option>
                                    <option value='Accounting'>Accounting</option>
                                    <option value='Marketing'>Marketing</option>
                                </select>
                            </Box>
                            <Box className='input-grp w-3/4'>
                                <FormControl>
                                    <Input onChange={(event) => setFillField((prev) => ({...prev, jobField5: !!event.target.value}))} id='rank' fontSize='xs' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='rank' className='form-label'>Rank</label>
                                </FormControl>
                            </Box>
                            <button disabled={!filledField.jobField1 || !filledField.jobField2 || !filledField.jobField3 || !filledField.jobField4 || !filledField.jobField5} onClick={() => {handleDetails('roles')}} className={`${!filledField.jobField1 || !filledField.jobField2 || !filledField.jobField3 || !filledField.jobField4 || !filledField.jobField5 ? 'btn-primary-disable' : 'btn-primary'} rounded flex items-center space-x-2`} style={{padding: '10px'}}><PlusIcon /> <span>Add</span></button>
                        </Box>
                        <TableContainer w='100%'>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th><span className='text-xs font-medium'>Employee Type</span></Th>
                                        <Th><span className='text-xs font-medium'>Employee Category</span></Th>
                                        <Th><span className='text-xs font-medium'>Position</span></Th>
                                        <Th><span className='text-xs font-medium'>Department</span></Th>
                                        <Th><span className='text-xs font-medium'>Rank</span></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                {Object.entries(formVal.roles).map(([key, role]) => (
                                    <Tr key={key}>
                                        <Td>{role.emp_type}</Td>
                                        <Td>{role.emp_cat}</Td>
                                        <Td>{role.job_position}</Td>
                                        <Td>{role.department}</Td>
                                        <Td>{role.rank}</Td>
                                    </Tr>
                                ))}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </Box>
                    {/** Attachments fields */}
                    <Box className='w-full p-8 rounded flex flex-col space-y-4 items-start justify-center border-2 border-gray-300'>
                        <Box className='flex'>
                            <Image src="/icons/attachment.png" alt="School Logo" width={24} height={24} />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Attachments:`}</Heading>
                        </Box>
                        <Box className='space-y-4 w-full'>
                            <FormControl className='flex flex-col space-y-1'>
                                <label>Please upload a 2x2 ID photo. <span className='italic' style={{fontSize: '9px'}}>(Note: Ensure photo is clear.)</span></label>
                                <input onChange={handleFileChange} type='file' className='w-1/2' accept='.png, .jpg' />
                            </FormControl>
                            <FormControl className='flex w-full flex-col space-y-1' isRequired isInvalid={isInsufficient && !sign}>
                                <label>Kindly click the button to provide your e-signature before submitting this form.</label>
                                <Button borderRadius='base' bg='#1C437E' _hover={{ bg: 'blue.600' }} fontSize='xs' color='white' className='w-1/4' onClick={onOpen}>
                                    <Image src='/icons/sign.png' className='me-2' alt='next-arrow' width={24} height={24}/>
                                    <span>Open Signature Pad</span>
                                </Button>
                                <FormErrorMessage w='100%' fontSize='xs' className='flex justify-start font-normal'>Signature is required</FormErrorMessage>
                                <Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
                                    <ModalOverlay />
                                    <ModalContent>
                                        <ModalHeader>Kindly provide your e-signature here</ModalHeader>
                                        <ModalCloseButton />
                                        <ModalBody>
                                            <div className='border rounded border-black' style={{width: '100%'}}>
                                                <SignatureCanvas canvasProps={{width: 462, height: 200, className: 'sigCanvas'}} ref={padRef} />
                                            </div>
                                        </ModalBody>
                                        <ModalFooter className='space-x-3'>
                                            <button className='rounded p-2 outline outline-2 outline-gray-700 text-black' style={{height:"30px",width:"60px"}} onClick={onClose}>Close</button>
                                            <button className='rounded p-2 outline outline-2 outline-gray-700 text-black' style={{height:"30px",width:"60px"}} onClick={() => {padRef.current?.clear();}}>Clear</button>
                                            <button className='rounded p-2 bg-gray-700 text-white outline outline-2 outline-gray-700' style={{height:"30px",width:"120px"}} onClick={() => {handleGenerate(); onClose();}}>Save signature</button>
                                        </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </FormControl>
                        </Box>
                    </Box>
                    <Box className='flex w-full justify-end'>
                        <button onClick={() => handleSubmit()} disabled={Object.keys(formVal.roles).length === 0} className={`${Object.keys(formVal.roles).length === 0 ? 'hover:cursor-no-drop btn-primary-disable' : 'btn-primary'} rounded flex items-center space-x-3`} style={{padding: '10px', width: 'auto'}}>
                            { isLoading ? (
                                <>
                                    <Loading /> 
                                    <span>Adding Candidate</span>
                                </>
                            ):( 
                                <> 
                                    <PlusIcon /> 
                                    <span>Add Candidate</span>
                                </>
                            )}
                        </button>
                    </Box>
                </section>
            </main>
        </>
    )
}