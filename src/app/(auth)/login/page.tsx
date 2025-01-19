'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';
import { FormControl, FormErrorMessage, InputGroup, InputRightElement, Input, Box, Button, Heading, Text } from '@chakra-ui/react'
import { touchValues, FormValues } from '@/types/document'
import { loginUser } from '@/lib/controller'
import Loading from '@/Components/Icons/Loading'
import ShowIcon from '@/Components/SideIcons/ShowIcon'
import HideIcon from '@/Components/SideIcons/HideIcon'

const initState: FormValues = { user_code: '', password: '', }
const touchedState: touchValues = { user_code: false, password: false };

export default function Login() {
    // states
    const [state, setState] = useState<FormValues>(initState)
    const [touched, setTouched] = useState<touchValues>(touchedState)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [show, setShow] = useState<boolean>(false)

    const router = useRouter();

    // handling functions
    const onBlur = ({target}: React.ChangeEvent<HTMLInputElement>) => 
        setTouched((prev) => ({...prev, [target.name]: true }))  

    const handleChange = ({target}: React.ChangeEvent<HTMLInputElement>) => setState((prev) => ({
        ...prev, 
        [target.name]: target.value,
    }))

    const handleSubmit = async () => {
        try{
            setIsLoading(true)
            await loginUser(state.user_code, state.password)
            router.push('/enterprise-portal/home')

        }catch (error) {
            console.error(error)
        }finally {
            setIsLoading(false)
        }
    }

    return(
        <main className='w-full h-dvh flex bg-wave' style={{backgroundColor: '#E6E6E6'}}>
            <section className='login-container py-5 px-20 flex flex-col justify-center items-center'>
                <section className='space-y-8'>
                    <Box className='flex px-10 space-y-2 flex-col text-center'>
                        <Heading as='h1' size='lg'>Welcome Aboard!</Heading>
                        <Text className='font-normal'>Sign in your account and explore all the features and services tailored just for you.</Text>
                    </Box>
                    <form className='flex flex-col justify-center items-center w-full space-y-8'>
                        <Box className='input-grp' w='75%'>
                            <FormControl isRequired isInvalid={touched.user_code && !state.user_code}>
                                <Input id='user_code' fontSize='lg' size='lg' placeholder='' type='text' name='user_code' value={state.user_code} onBlur={onBlur} onChange={handleChange} className='p-3 form-input-login' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' errorBorderColor='red.300' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                <label htmlFor='user_code' className='form-label-login'>User Code </label>
                                <FormErrorMessage w='100%' fontSize='md' className='flex justify-end font-normal'>User Code required</FormErrorMessage>
                            </FormControl>
                        </Box>
                        <Box className='input-grp' w='75%'>
                            <FormControl isRequired isInvalid={touched.password && !state.password}>
                                <InputGroup>
                                    <Input id='password' fontSize='lg' size='lg' placeholder='' name='password' value={state.password} onBlur={onBlur} onChange={handleChange} type={show ? 'text' : 'password'} className='p-3  form-input-password' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' errorBorderColor='red.300' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                                    <label htmlFor='password' className='form-label-login'>Password </label>
                                    <InputRightElement>
                                        <button type='button' onClick={() => {setShow(!show)}}>
                                        {show ? <HideIcon size={'24'} /> 
                                        : <ShowIcon size={'24'} />}
                                        </button>
                                    </InputRightElement>
                                </InputGroup>
                                <FormErrorMessage w='100%' fontSize='md' className='flex justify-end font-normal'>Password required</FormErrorMessage>
                            </FormControl>
                        </Box>
                        <Button onClick={handleSubmit} isDisabled={!state.user_code || !state.password} borderRadius='base' bg={!state.user_code || !state.password ? `#a1a1a1` : `#1C437E`} _hover={{ bg: (!state.user_code || !state.password ? `#a1a1a1` : `blue.600`) }} w='75%' fontSize='sm' className={!state.user_code || !state.password ? `cursor-not-allowed` : ''} color='white'>
                            { isLoading ? (
                                <>
                                    <span>Signing In...</span>
                                    <Loading /> 
                                </>
                            ):( 
                                <> 
                                    <span>Sign In</span>
                                </>
                            )}
                        </Button>
                        <Box className='flex space-x-3'>
                            <Link className='underline font-normal' style={{fontSize: '12px', color: '#0094D3'}} href='/'>Forgot Password</Link>
                        </Box>
                    </form>
                </section>
            </section>
            <section className='bg-logo flex justify-center items-center'>
                <Image src='/pentagon_logo.png' className='me-2 bottom-5 left-5' alt='banner' width={665} height={666} /> 
            </section>
            <Box className='absolute bg-banner flex justify-center items-center flex-col space-y-5'>
                <Image src='/label_pentagon_banner.png' className='me-2 bottom-5 left-5' alt='banner' width={180} height={40} /> 
                <Text style={{fontSize: '10px', color: 'white'}}>© Copyright 2024 Pentagon Maritime Services Corp. All Rights Reserved. </Text>
            </Box>
        </main> 
    )
}