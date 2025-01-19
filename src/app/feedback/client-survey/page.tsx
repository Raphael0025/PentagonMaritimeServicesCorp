'use client'

import 'animate.css';
import { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2'
import { Collapse, FormControl, useDisclosure, FormErrorMessage, Tooltip, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, NumberInput, NumberInputField, Input, Box, Button, Heading, Text, Container, Radio, RadioGroup, Stack, HStack, VStack, PinInput, PinInputField } from '@chakra-ui/react'
import { submitClientSurvey } from '@/lib/controller'; // Adjust the import based on your file structure
import PinIcon from '@/Components/Icons/PinIcon'
import MailIcon from '@/Components/Icons/MailIcon'
import PhoneIcon from '@/Components/Icons/PhoneIcon'
import FacebookIcon from '@/Components/Icons/FacebookIcon'
import { CheckIcon } from '@/Components/SideIcons'

interface FormData {
    given_name: string;
    last_name: string;
    email: string;
    srn: string;
    instructorName: string;
    course: string;
};

export default function NewTrainee() {
    const partA = ['Method of teaching (clarify or delivery by instructor)',
        'Instructor is qualified to handle the course. (must have IMO 6.09 for instructor and/or IMO 3.12 for Assessor)',
        'Instructor is professional (Observe Skill and Personality)',
        'Training equipment are adequate and appropriate for the course (suitability to the course)',
        'Training room is conducive to learning (well-it, adequate air conditioning, durable and sufficient table and chairs)',
        'Training materials/handouts are available (browse through handout and ensure if readable',
        'Accessibility of Pentagon to the trainee(prominently located, accessibility to public transport)',
        'Staff are accomodating and approachable',
        'Tuition Fee'
    ]
    
    const partB = ['Did the Instructor arrive on time?',
        'Did the Instructor wear corporate or appropriate attire?',
        'Did the Instructor properly introduce himself including his credentials?',
        'Did the Instructor appear fiendly, approachable yet firm in handling the class?',
        'Did the Instructor teach the course with expertise?',
        'Did the instructor employ good communication skills?',
        'Did the Instructor face the class while using the presentation slides and move around the room while discussing?',
        'Did the Instructor give enough time for training and not in a hurry to go home or end the class?',
        'Did the Instructor optimize the allocated time for the course?',
        'How well did you understand the lesson through the use of audio-visual material or slide presentation used?'
    ]
    
    const [user, setUser] = useState<FormData>({
        given_name: '',
        last_name: '',
        email: '',
        srn: '',
        instructorName: '',
        course: '',
    })
    const [steps, setStep] = useState<string>('intro')
    const [otp, setOTP] = useState<string>('')
    const [userOtp, setUserOtp] = useState<string>('')
    const [loading, setLoading] = useState(false);

    const [answers, setAnswers] = useState(partA.map(() => '')); // Initialize answers state
    const [answers2, setAnswers2] = useState(partB.map(() => '')); // Initialize answers state
    const [textarea1Answer, setTextarea1Answer] = useState<string>("");
    const [textarea2Answer, setTextarea2Answer] = useState<string>("");
    
    const [textarea3Answer, setTextarea3Answer] = useState<string>("");
    const [textarea4Answer, setTextarea4Answer] = useState<string>("");

    const [overall, setOverall] = useState<string>('')

    const handleAnswerChange = (value: string, index: number) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    }

    const handleAnswer2Change = (value: string, index: number) => {
        const newAnswers = [...answers2];
        newAnswers[index] = value;
        setAnswers2(newAnswers);
    }

    const handleTextarea1Change = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextarea1Answer(event.target.value);
    };
    
    const handleTextarea2Change = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextarea2Answer(event.target.value);
    };
    
    const handleTextarea3Change = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextarea3Answer(event.target.value);
    };
    
    const handleTextarea4Change = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextarea4Answer(event.target.value);
    }

    const handleSubmit = async () => {
        try{
            setLoading(true)
            Swal.fire({
                title: 'Please wait to submit your survery, this may take a few moments.',
                showConfirmButton: false,
                icon: 'info',
                allowOutsideClick: false,
            });
            const data = {
                user,
                answers,
                answers2,
                textarea1Answer,
                textarea2Answer,
                textarea3Answer,
                textarea4Answer,
                overall,
                submittedAt: new Date(),
            }
            await submitClientSurvey(data)

            const response = await fetch('/api/submit-survey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                to: user.email,
                subject: 'Pentagon Maritime Services Corp.',
                text: 'Thank you for taking your time by answering the client survey',
                last_name: user.last_name,
                given_name: user.given_name,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to send OTP');
            }
        }catch(error){
            throw error
        } finally {
            setLoading(false)
            Swal.close();
            setStep('complete')
        }
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setUser (prevState => ({
            ...prevState,
            [id]: value
        }))
    }
    
    function generateOTP() {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < 6; i++) {
          otp += digits[Math.floor(Math.random() * 10)];
        }
        setOTP(otp)
        return otp;
    }
    
    const handleSendOtp = async () => {
        if(!user.email){
            Swal.fire({
                title: 'Error',
                text: 'Please provide your information.',
                icon: 'error',
            })
            return;
        }
        setLoading(true)
        Swal.fire({
            title: 'Please wait for your OTP to send, this may take a few moments.',
            showConfirmButton: false,
            icon: 'info',
            allowOutsideClick: false,
        });
        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                to: user.email,
                subject: 'Pentagon Maritime Services Corp.',
                text: 'Thank you for taking your time by answering the client survey',
                last_name: user.last_name,
                given_name: user.given_name,
                otp: generateOTP(),
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
        } finally {
            setLoading(false);
            Swal.close();
            setStep('otp')
        }
    }
    
    const handleOtpChange = (value: string) => {
        setUserOtp(value);
    }
    
    const handleVerifyOtp = () => {
        if (userOtp === otp) {
            Swal.fire({
                title: 'OTP Verified',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            setStep('step1')
        } else {
            Swal.fire({
                title: 'Invalid OTP',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    }

    return(
    <>
    <section className={`${steps === 'intro' ? 'animate__fadeInLeft' : 'hidden'} animate__animated flex justify-center items-center w-full p-3 h-screen py-4 bg-wave`}>
        <Container className='flex flex-col rounded bg-white border-2 border-slate-400 p-5'>
            <Text as='b' align='center' fontSize='xl'>Dear Trainee</Text>
            <Text py={3} fontSize='md'>In our desire to serve you better, we are hoping you could help us gauge how we are performing presently. <br /> Please answer this questionnaire as honetly as possible for continous improvement of our services with you. <br /> Please rate the level of service you have received from us by checking the appropriate column.</Text>
            <Button onClick={() => {setStep('credentials')}} colorScheme='blue'>Continue</Button>
        </Container>
    </section>
    <section className={`${steps === 'credentials' ? '' : 'hidden'} flex justify-center items-center h-dvh flex-col p-3 pt-8 py-4 bg-wave w-full`}>
        <Box className='md:w-1/2 text-start'>
            <Text as='b' fontSize='xl'>Client Survey</Text>
            <Text fontSize='md'>Please provide your information below.</Text>
            <Text fontSize='xs' as='i' color='gray' >Fields mark with <span className='text-red-400'>(*)</span> are required.</Text>
        </Box>
        <Box className='flex flex-col space-y-8 rounded w-full md:w-1/2 border-2 bg-white border-slate-400 p-5 pt-8'>
            {/** Srn & Course */}
            <Box className='flex space-y-8 md:space-y-0 md:space-x-4 flex-col md:flex-row items-center justify-between '>
                <Box className='input-grp w-full md:w-1/4'>
                <Tooltip placement='top' label='Your SRN must be 10 digits'>
                    <FormControl isRequired >
                        <Input id='srn' value={user.srn} onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' maxLength={10} className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                        <label htmlFor='srn' className='form-label'>SRN# <span className='text-red-500'>*</span></label>
                        <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>SRN is required</FormErrorMessage>
                    </FormControl>
                </Tooltip>
            </Box>
                <Box className='input-grp w-full'>
                    <FormControl isRequired >
                        <Input id='course' onChange={handleChange} placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                        <label htmlFor='course' className='form-label'>Course<span className='text-red-500'>*</span></label>
                        <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Course is required</FormErrorMessage>
                    </FormControl>
                </Box>
            </Box>
            {/** Name */}
            <Box className='flex space-y-8 md:space-y-0 md:space-x-4 flex-col md:flex-row items-center justify-between '>
                <Box className='input-grp' w='100%' >
                    <FormControl isRequired >
                        <Input id='last_name' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off-auto'  _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                        <label htmlFor='last_name' className='form-label'>Last Name<span className='text-red-500'>*</span></label>
                        <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Last name is required</FormErrorMessage>
                    </FormControl>
                </Box>
                <Box className='input-grp w-full'>
                    <FormControl isRequired >
                        <Input id='given_name' onChange={handleChange}  placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                        <label htmlFor='given_name' className='form-label'>Given Name<span className='text-red-500'>*</span></label>
                        <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Given name is required</FormErrorMessage>
                    </FormControl>
                </Box>
            </Box>
            {/** Other Cred */}
            <Box className='flex space-y-8 md:space-y-0 md:space-x-4 flex-col md:flex-row items-center justify-between '>
                <Box className='input-grp' w='100%' >
                    <FormControl isRequired >
                        <Input id='email' onChange={handleChange} fontSize='xs' size='lg' placeholder='' type='email' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' autoComplete='off-auto'  _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}}/>
                        <label htmlFor='email' className='form-label'>Email<span className='text-red-500'>*</span></label>
                        <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Email is required</FormErrorMessage>
                    </FormControl>
                </Box>
                <Box className='input-grp w-full'>
                    <FormControl isRequired >
                        <Input id='instructor' onChange={handleChange}  placeholder='' type='text' className='p-3 form-input' border='0' borderBottom='2px' borderColor='#A1A1A1' borderRadius='0' fontSize='xs' size='lg' autoComplete='off-auto' _hover={{borderColor: '#2F67B2'}} _focus={{ boxShadow:'0 0 0px 0px rgba(88, 144, 255, .75), 0 0px 0px rgba(0, 0, 0, .15)'}} />
                        <label htmlFor='instructor' className='form-label'>{`Instructor's Name`}<span className='text-red-500'>*</span></label>
                        <FormErrorMessage w='100%' fontSize='xs' className='flex justify-end font-normal'>Instructor is required</FormErrorMessage>
                    </FormControl>
                </Box>
            </Box>
            <Button mt={4} onClick={() => {handleSendOtp();}} colorScheme="blue" isLoading={loading} isDisabled={loading}>
                Get OTP
            </Button>
        </Box>
    </section>
    <section className={`${steps === 'otp' ? '' : 'hidden'} flex justify-center items-center h-screen flex-col p-3 bg-wave w-full`}>
        <Text as='b' fontSize='xl'>Client Survey</Text>
        <Text fontSize='md'>OTP verification.</Text>
        <Text fontSize='xs' as='i' color='gray' >Please now check your email for your OTP.</Text>
        <Box pt={4}>
            <HStack>
                <PinInput otp onChange={handleOtpChange}>
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                </PinInput>
            </HStack>
            <Button mt={4} onClick={handleVerifyOtp} colorScheme="green">
                Verify OTP
            </Button>
        </Box>
    </section>
    <main className='w-full flex justify-center items-center md:h-fit py-4 h-full bg-wave '>
        <section className={`${steps === 'step1' ? '' : 'hidden'} w-full flex items-center h-full py-8 px-3 justify-center flex-col`}>
            <Box className='w-full md:w-1/2'>
                <Text as='b' fontSize='xl' textAlign='start'>Client Survey</Text>
                <Text textTransform='uppercase' fontSize='md'>About Pentagon Maritime Services.</Text>
                <Text fontSize='xs' as='i' color='gray' >Please take your time answering each question, at the end of this survey you can review your answers.</Text>
            </Box>
            <Box className='border-2 border-slate-400 rounded p-3 mt-3 w-full md:w-fit bg-white'>
                <Box>
                    {partA.map((question, index) => (
                    <Box key={index} className="mb-4">
                        <Text mb={2}>{question}</Text>
                        <RadioGroup onChange={(value) => handleAnswerChange(value, index)} justifyItems='center' value={answers[index]}>
                            <Stack className='flex flex-wrap md:justify-between justify-center'  direction='row'> 
                            {index === partA.length - 1 ? (
                                <>
                                    <Radio fontSize='md' value="High">High</Radio>
                                    <Radio fontSize='md' value="Mid">Mid</Radio>
                                    <Radio fontSize='md' value="Low">Low</Radio>
                                </>
                            ) : (
                                <>
                                    <Radio fontSize='md' value="Excellent">Excellent</Radio>
                                    <Radio fontSize='md' value="Very Good">Very Good</Radio>
                                    <Radio fontSize='md' value="Good">Good</Radio>
                                    <Radio fontSize='md' value="Fair">Fair</Radio>
                                    <Radio fontSize='md' value="Poor">Poor</Radio>
                                </>
                            )}
                            </Stack>
                        </RadioGroup>
                    </Box>
                    ))}
                </Box>
                <Box>
                    <Box mt={6}>
                        <Text mb={2}>What other courses have you attended in Pentagon?</Text>
                        <Textarea
                            size='sm'
                            resize='none'
                            value={textarea1Answer}
                            onChange={handleTextarea1Change}
                            placeholder="Type your answer here..."
                        />
                    </Box>

                    <Box mt={6}>
                        <Text mb={2}>What courses/s do you suggest that we must offer in the future?</Text>
                        <Textarea
                            size='sm'
                            resize='none'
                            value={textarea2Answer}
                            onChange={handleTextarea2Change}
                            placeholder="Type your answer here..."
                        />
                    </Box>
                </Box>
                <Box className='flex justify-between flex-col md:flex-row mt-4 space-y-4 md:space-y-0'>
                    <Button colorScheme='blue' onClick={() => {setStep('step2'); scrollToTop();}} >Proceed</Button>
                </Box>
            </Box>
        </section>
        <section className={`${steps === 'step2' ? '' : 'hidden'} w-full flex items-center h-full py-8 px-3 justify-center flex-col`}>
            <Box className='w-full md:w-1/2'>
                <Text as='b' fontSize='xl' textAlign='start'>Client Survey</Text>
                <Text textTransform='uppercase' fontSize='md'>About the Instructor.</Text>
                <Text fontSize='xs' as='i' color='gray' >Please take your time answering each question, at the end of this survey you can review your answers.</Text>
            </Box>
            <Box className='border-2 border-slate-400 rounded p-3 mt-3 w-full md:w-fit bg-white'>
                <Box>
                    {partB.map((question, index) => (
                    <Box key={index} className="mb-4">
                        <Text mb={2}>{question}</Text>
                        <RadioGroup onChange={(value) => handleAnswer2Change(value, index)} justifyItems='center' value={answers2[index]}>
                            <Stack className='flex flex-wrap md:justify-between justify-center'  direction='row'> 
                                <Radio fontSize='md' value="Excellent">Excellent</Radio>
                                <Radio fontSize='md' value="Very Good">Very Good</Radio>
                                <Radio fontSize='md' value="Good">Good</Radio>
                                <Radio fontSize='md' value="Fair">Fair</Radio>
                                <Radio fontSize='md' value="Poor">Poor</Radio>
                            </Stack>
                        </RadioGroup>
                    </Box>
                    ))}
                </Box>
                <Box>
                    <Box mt={6}>
                        <Text mb={2}>What other training centers have you visited aside from Pentagon?</Text>
                        <Textarea
                            size='sm'
                            resize='none'
                            value={textarea3Answer}
                            onChange={handleTextarea3Change}
                            placeholder="Type your answer here..."
                        />
                    </Box>

                    <Box mt={6}>
                        <Text mb={2}>Please specify areas for improvement</Text>
                        <Textarea
                            size='sm'
                            resize='none'
                            value={textarea4Answer}
                            onChange={handleTextarea4Change}
                            placeholder="Type your answer here..."
                        />
                    </Box>
                </Box>
                <Box className='flex justify-between flex-col md:flex-row mt-4 space-y-4 md:space-y-0'>
                    <Button variant='outline' onClick={() => {setStep('step1'); scrollToTop();}} colorScheme='gray' >Go Back</Button>
                    <Button colorScheme='blue' onClick={() => {setStep('overall')}} >Proceed</Button>
                </Box>
            </Box>
        </section>
        <section className={`${steps === 'overall' ? '' : 'hidden'} w-full flex items-center h-screen py-8 px-3 justify-center flex-col`}>
            <Box className='w-full md:w-1/2'>
                <Text as='b' fontSize='xl' textAlign='start'>Client Survey</Text>
                <Text textTransform='uppercase' fontSize='md'>Overall Satisfaction.</Text>
                <Text fontSize='xs' as='i' color='gray' >Please take your time answering each question, at the end of this survey you can review your answers.</Text>
            </Box>
            <Box className='border-2 border-slate-400 rounded p-3 mt-3 w-full md:w-1/2 bg-white'>
                <Box className="mb-4">
                    <Text mb={2} fontSize='lg'>Overall, are you satisfied with the way we meet your requirements?</Text>
                    <RadioGroup onChange={(value) => {setOverall(value)}} justifyItems='center' value={overall}>
                        <Stack className='flex flex-wrap md:justify-between justify-center'  direction='row'> 
                            <Radio fontSize='md' value="Very Satisfied">Very Satisfied</Radio>
                            <Radio fontSize='md' value="Satisfied">Satisfied</Radio>
                            <Radio fontSize='md' value="Needs Improvement">Needs Improvement</Radio>
                        </Stack>
                    </RadioGroup>
                </Box>
            </Box>
            <Box className='flex w-full md:w-1/2 justify-between flex-row mt-6 space-x-5 '>
                <Button variant='outline' onClick={() => {setStep('step2'); scrollToTop();}} colorScheme='gray' >Go Back</Button>
                <Button colorScheme='blue' onClick={() => {setStep('review')}} >Proceed</Button>
            </Box>
        </section>
        <section className={`${steps === 'review' ? '' : 'hidden'} w-full flex items-center h-full py-8 px-3 justify-center flex-col`}>
            <Box className='w-full flex flex-col md:w-1/2'>
                <Text as='b' fontSize='xl' textAlign='start'>Review Survey</Text>
                <Text fontSize='xs' as='i' color='gray' >Please make sure that all your answers are correct before submiting.</Text>
            </Box>
            <Box className='border-2 border-slate-400 rounded p-3 mt-3 w-full md:w-fit bg-white'>
                <Box>
                    <Text as='b' fontSize='lg'>Part A Answers</Text>
                    {partA.map((question, index) => (
                    <Box key={index} className="mb-4">
                        <Text color='gray' mb={2}>{question}</Text>
                        <Text fontSize='md'>{`Answer: ${answers[index]}`}</Text>
                    </Box>
                    ))}
                </Box>
                <Box>
                    <Text as='b' fontSize='lg'>Part B Answers</Text>
                    {partB.map((question, index) => (
                    <Box key={index} className="mb-4">
                        <Text color='gray' mb={2}>{question}</Text>
                        <Text fontSize='md'>{`Answer: ${answers2[index]}`}</Text>
                    </Box>
                    ))}
                </Box>
                <Box mt={6}>
                    <Text as='b' fontSize='lg'>Overall</Text>
                    <Text>{`Answer: ${overall}`}</Text>
                </Box>
                <Box mt={6}>
                    <Text color='gray' mb={2}>What other courses have you attended in Pentagon?</Text>
                    <Text fontSize='md'>{textarea1Answer}</Text>
                </Box>
                <Box mt={6}>
                    <Text color='gray' mb={2}>What course/s do you suggest that we must offer in the future?</Text>
                    <Text fontSize='md'>{textarea2Answer}</Text>
                </Box>
                <Box mt={6}>
                    <Text color='gray' mb={2}>What other training centers have you visited aside from Pentagon?</Text>
                    <Text fontSize='md'>{textarea3Answer}</Text>
                </Box>
                <Box mt={6}>
                    <Text color='gray' mb={2}>Please specify areas for improvement</Text>
                    <Text fontSize='md'>{textarea4Answer}</Text>
                </Box>
                <Box className='flex justify-between flex-col md:flex-row mt-4 space-y-4 md:space-y-0'>
                    <Button variant='outline' onClick={() => {setStep('overall'); scrollToTop();}} colorScheme='gray' >Go back</Button>
                    <Button colorScheme='blue' isLoading={loading} isDisabled={loading} onClick={() => {handleSubmit();}} >Submit Survey</Button>
                </Box>
            </Box>
        </section>
        <section className={`${steps === 'complete' ? '' : 'hidden'} w-full flex items-center h-screen py-8 px-3 justify-center flex-col`}>
            <Box className='border-2 border-slate-400 rounded p-3 mt-3 w-full md:w-fit flex justify-center flex-col items-center bg-white'>
                <Box className='w-full'>
                    <Heading as='h1' size='xl' className='text-db w-full text-center mb-2'>Thank You!</Heading>
                    <Text fontSize='md' className='text-db w-full uppercase text-center'>{`Thank you for answering this survey! `}</Text>
                    <Text as='i' color='gray' fontSize='sm'>Please check your email to confirm your survey submision</Text>
                </Box>
                <CheckIcon size={'180'} color={'#1c4f92'} />
                <Box className='w-5/6 md:w-3/5 place-items-center space-y-3'>
                    <Text fontSize='md' className='text-db w-full uppercase text-center'>{` For any urgent concerns, feel free to contact us.`}</Text>
                    <Box className=' space-y-3 flex flex-col place-items-center'>
                        <Box className='flex space-x-1 justify-center items-center'>
                            <PhoneIcon size={'28'} color={'#1C437E'} />
                            <Text fontSize='md' className='text-db w-full uppercase text-center'>{` 0999 513 5916`}</Text>
                        </Box>
                        <Box className='flex space-x-1 justify-center items-center'>
                            <MailIcon size={'24'} color={'#1C437E'} />
                            <Text fontSize='md' className='text-db w-full text-center'>{` pentagonmaritimeservicescorp@gmail.com`}</Text>
                        </Box>
                        <Box className='flex space-x-1 justify-center items-center'>
                            <FacebookIcon size={'24'} color={'#1C437E'} />
                            <Text className='text-db w-full text-xs md:text-base text-center'>{` https://www.facebook.com/Pentagonmaritimeservicescorp`}</Text>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </section>
    </main>
    </>
    )
}