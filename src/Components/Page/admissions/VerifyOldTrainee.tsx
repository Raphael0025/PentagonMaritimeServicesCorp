'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
//components
import OldRegistrationForm from '@/Components/Page/admissions/OldRegistrationForm';
//types
import { TRAINEE, TRAINEE_BY_ID } from '@/types/trainees';
//css library
import 'animate.css';
import { FormControl, Input, Box, Button, Text, useToast, } from '@chakra-ui/react';
import { ToastStatus } from '@/types/handling'

import { useTrainees } from '@/context/TraineeContext';

interface UIProps {
    setTrainee: (trainee: TRAINEE_BY_ID) => void;
    setShow: (value: boolean) => void;
}

export default function VerifyOldTrainee({ setTrainee, setShow }: UIProps) {
    const toast = useToast()
    const router = useRouter();
    const { data: allTrainee } = useTrainees();

    const [last_name, setLN] = useState<string>('')
    const [first_name, setFN] = useState<string>('')
    const [srn, setSRN] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const [showForm, setShowForm] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        // Trigger outro animation
        setIsAnimating(true)
        // After animation completes, show the form
        setTimeout(() => {
            setShowForm(true);
            setIsAnimating(false);
        }, 1500); // Match the animation duration
    }
    
    const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
        toast({
            title: title,
            description: desc,
            position: 'top',
            variant: 'top-accent',
            status: status,
            duration: timer,
            isClosable: true,
        })
    }

    const handleVerify = () => {
        setLoading(true)
        let traineeFound: TRAINEE_BY_ID | undefined
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    traineeFound = allTrainee?.find((trainee) => `${trainee.srn}-${trainee.last_name.toLowerCase()}, ${trainee.first_name.toLowerCase()}` === `${srn}-${last_name.toLowerCase()}, ${first_name.toLowerCase()}`)
                    if(!traineeFound){
                        handleToast(`Information UnVerified!`, `Oops, it seems you've provided the wrong information.`, 4000, 'error')
                        setLoading(false)
                        return
                    }
                    setTrainee(traineeFound)
                    setShow(true)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 1500)
        }).then(() => {
            handleToast(`Hello!, ${traineeFound?.last_name.toUpperCase()}, ${traineeFound?.first_name.toUpperCase()}`, `Your information has been verified!`, 4000, 'success')
        }).catch((error) => {
            console.log('Error: ', error)
        }).finally(() => {
            setLoading(false)
        })
    }

    return (
        <Box display="flex" alignItems="center" justifyContent="center">
            <Box w={{md: '50%', base: '100%'}} className={`rounded border border-gray-100 shadow-md space-y-8 p-7 ${isAnimating ? 'animate__animated animate__fadeOut' : showForm ? 'animate__animated animate__fadeIn'  : '' }`}>
                {/* Greeting Section */}
                {!showForm && (
                    <Box className={`space-y-3 ${isAnimating ? 'pointer-events-none' : ''}`}>
                        <Text fontWeight="700" className="animate__animated animate__fadeInLeftBig text-xl text-sky-700">
                            {`Hey there Trainee!`}
                        </Text>
                        <Text fontWeight="500" className="animate__animated animate__fadeInRight text-base text-gray-500">
                            {`To get you started, we just need a few details to make sure we've got the right person. It'll
                            only take a minute.`}
                        </Text>
                        <Text fontWeight="900" className="animate__animated animate__fadeInLeftBig text-xl text-center text-sky-700">
                            {`Let's get you Verified!`}
                        </Text>
                        <Box display="flex" className="animate__animated animate__fadeInLeftBig" justifyContent="center" w="100%">
                            <Button onClick={handleClick} colorScheme="blue" w="50%" className="shadow-md uppercase" size="lg">Ok!</Button>
                        </Box>
                    </Box>
                )}
                {/* Form Section */}
                {showForm && (
                    <Box className="space-y-3 animate__animated animate__fadeIn" display="flex" flexDir="column" alignItems="center" justifyContent="center">
                        <Box display='flex' justifyContent='start' w='100%' >
                            <Text className='text-lg text-sky-700' fontWeight='800'>Please fill-up your information below</Text>
                        </Box>
                        <FormControl className='space-y-2'>
                            <label className='text-base text-gray-400'>SRN:</label>
                            <Input id='srn' onChange={(e) => setSRN(e.target.value)} className='uppercase' type='text' placeholder="Provide your SRN here..." />
                        </FormControl>
                        <FormControl className='space-y-2'>
                            <label className='text-base text-gray-400'>Last Name:</label>
                            <Input id='last_name' onChange={(e) => setLN(e.target.value)} className='uppercase' type='text' placeholder="e.g. Doe..." />
                        </FormControl>
                        <FormControl className='space-y-2'>
                            <label className='text-base text-gray-400'>First Name:</label>
                            <Input id='first_name' onChange={(e) => setFN(e.target.value)} className='uppercase' type='text' placeholder="e.g. John..." />
                        </FormControl>
                        <Box w='100%'>
                            <Button onClick={handleVerify} isLoading={loading} loadingText='Verifying...' colorScheme='blue' w='100%' className='uppercase shadow-md'>verify</Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
