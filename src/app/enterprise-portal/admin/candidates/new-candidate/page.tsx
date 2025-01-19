'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react';
import { Box, Button, Heading, Text, FormControl, FormErrorMessage, Input, useDisclosure, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, } from '@chakra-ui/react'
import { PrevIcon } from '@/Components/Icons'
import { PlusIcon, EducIcon, EmergencyIcon, GovtIcon, ClipIcon, WorkIcon, SignIcon, HistoryIcon, FamilyIcon, ListIcon } from '@/Components/SideIcons'
import { NewStaffValues, initStaffValues, WorkExperience, initWorkExp, initInsertPosition, initEducation, initDependents, initTrainings, ImmediateDependents, EducationalAttainment, TrainingHistory, Role, prioFields, prioState, filledFields, initFillFields } from '@/types/company_users'
import { formatDateWithDay, formatDateToWords, formatDateWithDayToWords } from '@/types/handling'
import { addCandidate } from '@/lib/company_user_controller'
import SignatureCanvas from 'react-signature-canvas'
import DatePicker from 'react-datepicker'

export default function Page(){
    const router = useRouter()
    
    const [file, setFilename] = useState<string>('')
    const [dirFile, setDirFile] = useState<File[]>([])

    const [fName, setFName] = useState<string>('')
    const [mName, setMName] = useState<string>('')
    const [lName, setLName] = useState<string>('')
    const [suffix, setSuffix] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    const [sign, setSign] = useState<string>('') // filename of signature file
    const [validSignature, setSignature] = useState<File[]>([])
    const { isOpen, onOpen, onClose } = useDisclosure()
    let padRef = useRef<SignatureCanvas>(null)
    const [isSignatureValid, setIsSignatureValid] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    
    const [formVal, setFormVal] = useState<NewStaffValues>(initStaffValues)
    const [touchedFields, setTouched] = useState<prioFields>(prioState)
    const [isInsufficient, setSufficient] = useState<boolean>(false)
    const [filledField, setFillField] = useState<filledFields>(initFillFields)

    const [positionArr, setPositionArr] = useState<Role>(initInsertPosition)
    const [educationArr, setEducArr] = useState<EducationalAttainment>(initEducation)
    const [workArr, setWorkArr] = useState<WorkExperience>(initWorkExp)
    const [trainingArr, setTrainingArr] = useState<TrainingHistory>(initTrainings)
    const [dependentArr, setDependentArr] = useState<ImmediateDependents>(initDependents)

    const [customBirthDate, setBirthDate] = useState<Date >(new Date())
    const [customFromDate, setCustomFromDate] = useState<Date >(new Date())
    const [customToDate, setCustomToDate] = useState<Date >(new Date())

    const handleGenerate= () =>{
        const url = padRef.current?.getTrimmedCanvas().toDataURL("image/png");
        if (url) setSign(url);
    }

    const handleClear = () =>{
        padRef.current?.clear();
        setSign('')
    }

    const handleValidSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            const signature = files[0];
            setSign(file);
            setSignature(Array.from(files));
            setIsSignatureValid(true)

            const objectUrl = URL.createObjectURL(signature)
            setPreview(objectUrl)
        } else {
            setSign('')
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const file = files[0].name
            setFilename(file);
            setDirFile(Array.from(files));
        } else {
            setFilename('')
        }
    }

    const SettingData = (name: string, id: string, value: string) => {
        switch(name){
            case 'positions':
                setPositionArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'education':
                setEducArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'work':
                setWorkArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'training':
                setTrainingArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            case 'dependents':
                setDependentArr(prev => ({
                    ...prev,
                    [id]: value
                }))
                break;
            default:
                break;
        }
    }

    const handleInitData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, name, value} = e.target
        SettingData(name, id, value)
    }

    const handleInitDataSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {id, name, value} = e.target
        SettingData(name, id, value) 
    }

    const handleDates = (date: Date | null, name: string, pos: 'from' | 'to') => {
        const validDate = date ?? new Date()
        pos === 'from' ? setCustomFromDate(validDate) : setCustomToDate(validDate)
        const formattedDate = validDate.toLocaleDateString('en-CA')
        if(name === 'education'){
            setEducArr(prev => ({
                ...prev,
                inc_dates: {
                    ...prev.inc_dates,
                    [pos]: formattedDate
                }
            }))
        } else if (name === 'work_exp'){
            setWorkArr(prev => ({
                ...prev,
                inc_dates: {
                    ...prev.inc_dates,
                    [pos]: formattedDate
                }
            }))
        } else if (name === 'training'){
            setTrainingArr(prev => ({
                ...prev,
                inc_dates: {
                    ...prev.inc_dates,
                    [pos]: formattedDate
                }
            }))
        } else if (name === 'dependents') {
            setBirthDate(validDate)
            setDependentArr(prev => ({
                ...prev,
                dependent_birth_date: formattedDate
            }))
        }
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
        }))
    }

    const handleInsertNewData = (val: string) => {
        if(val === 'work'){
            const newKey = `work_exp_${Object.keys(formVal.work_exp).length + 1}`
            setFormVal(prevState => ({
                ...prevState,
                work_exp: {
                    ...prevState.work_exp,
                    [newKey]: workArr,
                },
            }))
            setWorkArr(initWorkExp)
        } else if (val === 'dependent'){
            const newKey = `dependent_${Object.keys(formVal.dependents).length + 1}`;
            setFormVal(prevState => ({
                ...prevState,
                dependents: {
                    ...prevState.dependents,
                    [newKey]: dependentArr,
                },
            }))
            setDependentArr(initDependents)
        } else if (val === 'training'){
            const newKey = `training_history_${Object.keys(formVal.training_history).length + 1}`;
            setFormVal(prevState => ({
                ...prevState,
                training_history: {
                    ...prevState.training_history,
                    [newKey]: trainingArr,
                },
            }))
            setTrainingArr(initTrainings)
        } else if (val === 'roles'){
            const newKey = `roles_${Object.keys(formVal.roles).length + 1}`
            // Update the state with the new work experience
            setFormVal(prevState => ({
                ...prevState,
                roles: {
                    ...prevState.roles,
                    [newKey]: positionArr,
                },
            }))
            setPositionArr(initInsertPosition)
        } else if (val === 'edu'){
            const newKey = `edu_${Object.keys(formVal.educational_attainment).length + 1}`
            // Update the state with the new work experience
            setFormVal(prevState => ({
                ...prevState,
                educational_attainment: {
                    ...prevState.educational_attainment,
                    [newKey]: educationArr,
                },
            }))
            setEducArr(initEducation)
        }
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleSubmit = async () => {
        try{
            const actor: string | null = localStorage.getItem('customToken')
            if(!formVal.full_name || !formVal.gender || !formVal.birthDate || !formVal.age || !formVal.status || !formVal.address || !formVal.phone || !formVal.email || !formVal.birthPlace || !formVal.sss || !formVal.philhealth || !formVal.tin || !formVal.hdmf ){
                setSufficient(true)
                scrollToTop()
            } else {
                setIsLoading(true)
                await addCandidate(formVal, dirFile, file, sign, validSignature, formVal.full_name, 'In Probation', 'Walk-in', actor)
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
                            <ListIcon size='24' color='#A1A1A1' />
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
                            <FamilyIcon size='24' color='#a1a1a1' />
                            <Box className='flex space-x-3 items-end'>
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Immediate Dependents`}</Heading>
                                <Text as='samp' style={{fontSize: '9px'}} className='italic text-gray'>{`Fill out fields if necessary`}</Text>
                            </Box>
                        </Box>
                        <Box className='flex items-end w-full justify-between space-x-4'>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired>
                                    <Input onChange={handleInitData} id='name' name='dependents' value={dependentArr.name} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='name' className='form-label'>Immediate Dependent</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-1/2'>
                                <FormControl>
                                    <Input onChange={handleInitData} id='dependent_relationship' name='dependents' value={dependentArr.dependent_relationship} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='dependent_relationship' className='form-label'>Relationship</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-1/2'>
                                <select onChange={handleInitDataSelect} id='dependent_gender' name='dependents' className='drop form-input w-full' defaultValue={dependentArr.dependent_gender} required>
                                    <option value='' hidden disabled>Select gender</option>
                                    <option value='Male'>Male</option>
                                    <option value='Female'>Female</option>
                                </select>
                            </Box>
                            <Box className='flex w-3/5 items-center justify-around space-x-4 '>
                                <span className='text-gray text-xs w-full text-end'>Date of Birth:</span>
                                <FormControl >
                                    <DatePicker showPopperArrow={false} selected={customBirthDate} onChange={(date) => handleDates(date, 'dependents', 'to')} dateFormat="MMM dd, yyy"
                                        customInput={
                                            <Input variant='flushed' w='100%' id='dependent_birth_date' name='dependents' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customBirthDate)} />
                                        }
                                    />
                                </FormControl>
                            </Box>
                            <Button w='100px' variant='ghost' colorScheme='blue' isDisabled={dependentArr.name === '' || dependentArr.dependent_relationship === '' || dependentArr.dependent_gender === '' || dependentArr.dependent_birth_date === ''} onClick={() => {handleInsertNewData('dependent')}} ><PlusIcon size='24' color='#0D70AB' /></Button>
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
                            <EmergencyIcon size='24' color='#a1a1a1' />
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
                            <EducIcon size='24' color='#a1a1a1'/>
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Educational Attainment`}</Heading>
                        </Box>
                        <Box className='flex w-full flex-col justify-start space-y-4'>
                            <Box className='flex items-end w-full justify-between space-x-4'>
                                <Box className='input-grp w-2/6'>
                                    <FormControl isRequired>
                                        <Input onChange={handleInitData} id='attainment' name='education' value={educationArr.attainment} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                        <label htmlFor='attainment' className='form-label'>Educational Attainment</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-1/2'>
                                    <FormControl isRequired>
                                        <Input onChange={handleInitData} id='school' name='education' value={educationArr.school} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                        <label htmlFor='school' className='form-label'>School</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-2/5'>
                                    <FormControl isRequired>
                                        <Input onChange={handleInitData} id='degree' name='education' value={educationArr.degree} placeholder='' type='text' className='p-3 form-input' autoComplete='off-auto' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' fontSize='xs' size='lg' _hover={{borderColor: '#2f67b2'}} _focus={{boxShadow: '0 0 0px 0px rgba(0, 0, 0, 0)'}} />
                                        <label htmlFor='degree' className='form-label'>Degree Earned</label>
                                    </FormControl>
                                </Box>
                                <Box className='flex space-x-3 justify-end'>
                                    <Box className='w-full justify-center flex flex-col'>
                                        <Text fontSize='xs' color='#a1a1a1' >From:</Text>
                                        <FormControl >
                                            <DatePicker showPopperArrow={false} selected={customFromDate} onChange={(date) => handleDates(date, 'education', 'from')} dateFormat="MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='from' name='education' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customFromDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box className='w-full justify-center flex flex-col'>
                                        <Text fontSize='xs' color='#a1a1a1' >To:</Text>
                                        <FormControl >
                                            <DatePicker showPopperArrow={false} selected={customToDate} onChange={(date) => handleDates(date, 'education', 'to')} dateFormat="MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='to' name='education' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customToDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                </Box>
                                <Button w='100px' variant='ghost' colorScheme='blue' isDisabled={educationArr.attainment === '' || educationArr.school === '' || educationArr.degree === '' || educationArr.inc_dates.from === '' || educationArr.inc_dates.to === ''} onClick={() => {handleInsertNewData('edu')}} ><PlusIcon size='24' color='#0D70AB' /></Button>
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
                            <WorkIcon size='24' color='#a1a1a1' />
                            <Box className='flex space-x-3 items-end'>
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Work Experience`}</Heading>
                                <Text as='samp' style={{fontSize: '9px'}} className='italic text-gray'>{`Fill out fields if necessary`}</Text>
                            </Box>
                        </Box>
                        <Box className='flex flex-col items-end w-full justify-between space-y-4'>
                            <Box className='flex items-end w-full justify-between space-x-4'>
                                <Box className='input-grp w-full'>
                                    <FormControl isRequired>
                                        <Input onChange={handleInitData} name='work' id='company' value={workArr.company} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='company' className='form-label'>Company</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-full'>
                                    <FormControl>
                                        <Input onChange={handleInitData} name='work' id='position' value={workArr.position} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='position' className='form-label'>Position</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-3/4'>
                                    <FormControl>
                                        <Input onChange={handleInitData} name='work' id='reason_leave' value={workArr.reason_leave} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='reason_leave' className='form-label'>Reason for Leave</label>
                                    </FormControl>
                                </Box>
                            </Box>
                            <Box className='flex items-end w-full justify-between space-x-4'>
                                <Box className='input-grp w-1/2'>
                                    <FormControl>
                                        <Input onChange={handleInitData} name='work' id='company_address' value={workArr.company_address} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='company_address' className='form-label'>Address</label>
                                    </FormControl>
                                </Box>
                                <Box className='input-grp w-1/2'>
                                    <FormControl>
                                        <Input onChange={handleInitData} name='work' id='stats' value={workArr.stats} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                        <label htmlFor='stats' className='form-label'>Status</label>
                                    </FormControl>
                                </Box>
                                <Box className='flex space-x-3 justify-end'>
                                    <Box className='w-full justify-center flex flex-col'>
                                        <Text fontSize='xs' color='#a1a1a1' >From:</Text>
                                        <FormControl >
                                            <DatePicker showPopperArrow={false} selected={customFromDate} onChange={(date) => handleDates(date, 'work_exp', 'from')} dateFormat="MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='from' name='work' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customFromDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box className='w-full justify-center flex flex-col'>
                                        <Text fontSize='xs' color='#a1a1a1' >To:</Text>
                                        <FormControl >
                                            <DatePicker showPopperArrow={false} selected={customToDate} onChange={(date) => handleDates(date, 'work_exp', 'to')} dateFormat="MMM dd, yyy"
                                                customInput={
                                                    <Input variant='flushed' w='100%' id='to' name='work' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customToDate)} />
                                                }
                                            />
                                        </FormControl>
                                    </Box>
                                </Box>
                                <Button w='100px' variant='ghost' colorScheme='blue' isDisabled={workArr.company === '' || workArr.company_address === '' || workArr.position === '' || workArr.stats === '' || workArr.reason_leave === '' || workArr.inc_dates.from === '' || workArr.inc_dates.to === ''} onClick={() => {handleInsertNewData('work')}} ><PlusIcon size='24' color='#0D70AB' /></Button>
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
                            <HistoryIcon size='24' color='#a1a1a1' />
                            <Box className='flex space-x-3 items-end'>
                                <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Training History`}</Heading>
                                <Text as='samp' style={{fontSize: '9px'}} className='italic text-gray'>{`Fill out fields if necessary`}</Text>
                            </Box>
                        </Box>
                        <Box className='flex items-end w-full justify-between space-x-4'>
                            <Box className='input-grp w-1/2'>
                                <FormControl isRequired>
                                    <Input onChange={handleInitData} name='training' id='training_title' value={trainingArr.training_title} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='training_title' className='form-label'>Title</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-1/2'>
                                <FormControl>
                                    <Input onChange={handleInitData} name='training' id='training_provider' value={trainingArr.training_provider} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='training_provider' className='form-label'>Provider</label>
                                </FormControl>
                            </Box>
                            <Box className='flex space-x-3 justify-end'>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >From:</Text>
                                    <FormControl >
                                        <DatePicker showPopperArrow={false} selected={customFromDate} onChange={(date) => handleDates(date, 'training', 'from')} dateFormat="MMM dd, yyy"
                                            customInput={
                                                <Input variant='flushed' w='100%' id='from' name='training' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customFromDate)} />
                                            }
                                        />
                                    </FormControl>
                                </Box>
                                <Box className='w-full justify-center flex flex-col'>
                                    <Text fontSize='xs' color='#a1a1a1' >To:</Text>
                                    <FormControl >
                                        <DatePicker showPopperArrow={false} selected={customToDate} onChange={(date) => handleDates(date, 'training', 'to')} dateFormat="MMM dd. yyy"
                                            customInput={
                                                <Input variant='flushed' w='100%' id='to' name='training' className=' p-3' type='text' placeholder='' value={formatDateWithDay(customToDate)} />
                                            }
                                        />
                                    </FormControl>
                                </Box>
                            </Box>
                            <Button w='100px' variant='ghost' colorScheme='blue' isDisabled={trainingArr.training_title === '' || trainingArr.training_provider === '' || trainingArr.inc_dates.from === '' || trainingArr.inc_dates.to === ''} onClick={() => {handleInsertNewData('training')}} ><PlusIcon size='24' color='#0D70AB' /></Button>
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
                            <GovtIcon size='24' color='#a1a1a1' />
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
                                <FormControl isRequired isInvalid={isInsufficient && !formVal.philhealth}>
                                    <Input id='philhealth' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='philhealth' className='form-label'>PhilHealth ID</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>This field is required</FormErrorMessage>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-full'>
                                <FormControl isRequired isInvalid={isInsufficient && !formVal.hdmf}>
                                    <Input id='hdmf' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='hdmf' className='form-label'>HDMF ID</label>
                                    <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>This field is required</FormErrorMessage>
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
                            <WorkIcon size='24' color='#a1a1a1' />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Position Details`}</Heading>
                        </Box>
                        <Box className='flex items-end w-full justify-between space-x-4'>
                            <Box className='input-grp w-2/3'>
                                <select onChange={handleInitDataSelect} id='emp_type' name='positions' value={positionArr.emp_type} className='drop form-input w-full' required>
                                    <option value='' hidden disabled>Select Employee Type</option>
                                    <option value='Full Time'>Full Time</option>
                                    <option value='Part Time'>Part Time</option>
                                    <option value='Internship'>Internship</option>
                                </select>
                            </Box>
                            <Box className='input-grp w-3/5'>
                                <select onChange={handleInitDataSelect} id='emp_cat' name='positions' value={positionArr.emp_cat} className='drop form-input w-full' required>
                                    <option value='' hidden disabled>Select Category</option>
                                    <option value='Teaching Staff'>Teaching Staff</option>
                                    <option value='Non-Teaching Staff'>Non-Teaching Staff</option>
                                </select>
                            </Box>
                            <Box className='input-grp w-1/2'>
                                <FormControl>
                                    <Input onChange={handleInitData} id='job_position' name='positions' value={positionArr.job_position} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='job_position' className='form-label'>Position</label>
                                </FormControl>
                            </Box>
                            <Box className='input-grp w-1/2'>
                                <select onChange={handleInitDataSelect} id='department' name='positions' className='drop form-input w-full' value={positionArr.department} required>
                                    <option value='' hidden disabled>Select Department</option>
                                    <option value='Admin'>Admin</option>
                                    <option value='Training'>Training</option>
                                    <option value='Registration'>Registration</option>
                                    <option value='Accounting'>Accounting</option>
                                    <option value='Marketing'>Marketing</option>
                                    <option value='System Admin'>System Admin</option>
                                    <option value='R&D'>R&D</option>
                                </select>
                            </Box>
                            <Box className='input-grp w-1/4'>
                                <FormControl>
                                    <Input onChange={(e) => setPositionArr(prev => ({ ...prev, rank: Number(e.target.value)}))}  id='rank' name='positions' value={positionArr.rank === 0 ? 'Rank' : positionArr.rank} fontSize='xs' size='lg' placeholder='' type='number' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#a1a1a1' borderRadius='0' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{boxShadow: '0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                                    <label htmlFor='rank' className='form-label'>Rank</label>
                                </FormControl>
                            </Box>
                            <Button w='100px' variant='ghost' colorScheme='blue' isDisabled={positionArr.emp_type === '' || positionArr.emp_cat === '' || positionArr.job_position === '' || positionArr.department === '' || positionArr.rank === 0 } onClick={() => {handleInsertNewData('roles')}} ><PlusIcon size='34' color='#0D70AB' /></Button>
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
                            <ClipIcon size='24' color='#a1a1a1' />
                            <Heading as='h4' size='sm' fontWeight='bold' className='text-gray'>{`Attachments:`}</Heading>
                        </Box>
                        <Box className='space-y-4 w-full'>
                            <FormControl className='flex flex-col space-y-1'>
                                <label>Please upload a 2x2 ID photo. <span className='italic' style={{fontSize: '9px'}}>(Note: Ensure photo is clear.)</span></label>
                                <input onChange={handleFileChange} type='file' className='w-1/2' accept='.png, .jpg' />
                            </FormControl>
                            <FormControl className='flex w-full flex-col space-y-1' isRequired isInvalid={isInsufficient && !sign}>
                                <label>{`Click "Create E-Signature" to upload digital signature or just send a photo of your written signature.`}<span className='text-red-500'>*</span></label>
                                <Box className='flex w-full items-center flex-col md:flex-row md:space-x-8 '>
                                    <Box className='flex flex-col space-y-1'>
                                        <label>Please attach your written signature here. <span className='italic' style={{fontSize: '9px'}}>(Note: photo must be clear.)</span></label>
                                        <input disabled={sign !== ''} type='file' onChange={handleValidSignature} accept='.png, .jpg' />
                                    </Box>
                                    <Text fontSize='lg'>or</Text>
                                    <Button isDisabled={isSignatureValid} borderRadius='base' bg='#1C437E' _hover={{ bg: 'blue.600' }} fontSize='xs' color='white' className='w-full space-x-3 md:w-1/4' onClick={() => {onOpen(); handleClear();}}>
                                        <SignIcon size={'24'}/>
                                        <span>Create E-Signature</span>
                                    </Button>
                                </Box>
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
                        <Button isDisabled={sign === '' || file === '' || Object.keys(formVal.roles).length === 0} isLoading={isLoading} onClick={() => handleSubmit()} loadingText='Adding Candidate..' colorScheme='blue' py={6} leftIcon={<PlusIcon size='24' color='#fff' />}>Add Candidate</Button>
                    </Box>
                </section>
            </main>
        </>
    )
}