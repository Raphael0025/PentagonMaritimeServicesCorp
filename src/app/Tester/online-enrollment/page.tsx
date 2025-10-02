'use client'

import { useRouter } from 'next/navigation';
import 'animate.css';
import { useState } from 'react';
import { Collapse, Box, Button, Heading, Text, Container, Radio, RadioGroup, VStack } from '@chakra-ui/react'
import Swal from 'sweetalert2'
import Stepper from '@/Components/NavStepper'
import { NextIcon } from '@/Components/SideIcons' 
import Registration_Background from "@/Components/ui/Registration_Background"

export default function Admissions(){

    const [path, setPath] = useState<string>('traineeType')
    const [step, setStep] = useState<number>(0)
    const router = useRouter()
    const [traineeType, setTraineeType] = useState<string>('')
    const [courseType, setCourseType] = useState<string>('2')

    const setNewPath = () => {
        if(traineeType === 'new'){
            if(courseType === '0'){
                router.push('online-enrollment/new-trainee-tester/stcw-training')
            } else {
                router.push('online-enrollment/new-trainee-tester')
            }
        } else {
            router.push('online-enrollment/new-trainee-tester')
        }
        setPath('traineeType')
        setStep(0)
    }

    return(
        <>
        <Registration_Background />
        <Container border='0px' h='auto' maxW='container.lg' mt={5} >
            <section className={`w-full animate__animated animate__fadeInRight ${path === 'review' || path === 'completed' ? 'hidden' : ''}`}>
                <Heading as='h3' size='lg' className='text-db mb-2'>{`Online Enrollment - Tester`}</Heading>
                <p className='text-slate-950 font-medium mb-2'>We warmly welcome seafarers to our training center.</p>
                <p className='text-slate-950 font-medium mb-2'>We kindly request that you complete the online registration form to facilitate a swift and efficient admissions process.</p>
                {/** Registration type */}
                <section className={`rounded outline mb-8 outline-2 outline-gray-200 space-y-5 p-7 ${path === 'step2' || path === 'completed' || path === 'review' || path === 'step1' ? 'hidden' : ''}`}>
                    <Heading as='h4' size='sm' className='text-og text-base font-bold'>What type of trainee are you</Heading>
                    <RadioGroup onChange={setTraineeType}>
                        <VStack spacing={5}>
                            <Box className='w-full px-5 bg-zinc-100 transition ease-in-out delay-150 hover:cursor-pointer hover:-translate-y-3 duration-300' border="1px" borderColor='gray.200'  borderRadius='md' >
                                <Radio w='100%' value='new'>
                                    <Text className='w-full py-5 px-2' fontSize='sm'>New</Text>
                                </Radio>
                            </Box>
                            <Box className='w-full px-5 bg-zinc-100 transition ease-in-out delay-150 hover:cursor-pointer hover:-translate-y-3 duration-300' border='1px' borderColor='gray.200' borderRadius='md' >
                                <Radio w='100%' value='reEnrolled'>
                                    <Text className='w-full py-5 px-2' fontSize='sm'>Re-Enrolled</Text>
                                </Radio>
                            </Box>
                        </VStack>
                    </RadioGroup>
                    <Collapse in={traineeType !== ''} animateOpacity>
                        <Button onClick={() => {setNewPath()}} borderRadius='base' bg='#1C437E' _hover={{ bg: 'blue.600' }} className=' animate__animated animate__fadeInDown' fontSize='xs' color='white' ><span className='me-2'>Proceed Registration</span>
                            <NextIcon size={'20'} />
                        </Button>
                    </Collapse>
                </section> 
            </section>
        </Container>
        </>
    )
}