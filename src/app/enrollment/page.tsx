'use client'

import { Box, Image, Text, Modal, ModalOverlay, Link, Tabs, TabList, TabPanels, Tab, TabPanel, OrderedList, List, ListItem, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton} from '@chakra-ui/react'
import { BannerView, ElementView, BannerComponent } from '@/Components/SiteComponents'

import React from "react"

export default function Page(){

    return(
    <>
        <Box bgColor='#fbffff'>
            <BannerView initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0,}} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                <BannerComponent title='Admissions' image='./Images/ContactUs.jpg' content={`Welcome! Here you'll find all the information you need to enroll in your desired course.`} />
            </BannerView>
            <BannerView initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0,}} transition={{duration: 0.4, delay: 1.5, ease: 'linear'}}>
                <Box px={{base: '5%', md: '5%', lg: '20%'}} pt='4'>
                    <Text fontSize='2xl' py={3} color='blue.700' fontWeight='700'>Modes of Enrollment</Text>
                    <Tabs variant='enclosed'>
                        <TabList>
                            <Tab>New Trainees</Tab>
                            <Tab>Existing Trainees</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Box px={{base: '0', md: '8', lg: '8'}} display='flex' flexDir={{base: 'column', md: 'row', lg: 'row'}} justifyContent='space-between' >
                                    <Box _hover={{'& .card': {transform: 'translateY(-10px)'}}} w={{base: '100%', md: '50%'}} mr={{base: 0, md: 5, lg: 5}}>
                                        <BannerView initial={{opacity: 0, x: -100, y: 20}} animate={{opacity: 1, x: 0, y: 0,}} transition={{duration: 0.4, delay: 1.5, ease: 'linear'}}>
                                            <Box className='card space-y-2' transition='transform 0.4s ease-in-out' w='100%' mt='4' p={4} borderRadius='10px' borderWidth='2px' shadow='xl'>
                                                <Text fontSize='xl' fontWeight='800' color='blue.700'>Online Enrollment</Text>
                                                <Box px='5'>
                                                    <OrderedList className='space-y-3' color='gray.600' fontWeight='400' fontSize='lg'>
                                                        <ListItem >
                                                            <Text>{`Go to `} 
                                                                <Text as='span' color='blue.600' fontWeight='bold'>
                                                                    <Link href='/admissions/ol/forms'>admissions/ol/forms</Link>
                                                                </Text>
                                                                . Click on <Text as='span' fontWeight='bold'>New</Text> and complete the registration form with accurate and detailed information.
                                                            </Text>
                                                            <Text py='2' as='i' fontWeight='bold' fontSize='sm'>Reminder: Ensure that all required photos are clear and meet the necessary standards.</Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>{`In the Next Step, select your desired course training(s), training schedule and preferred mode of payment.`}</Text>
                                                            <Text>
                                                                Be sure to click 
                                                                <Text as='span' fontWeight='bold' color='blue.400'> Insert Course </Text>
                                                                before proceeding to the following step.
                                                            </Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>{`Afterwards, please review the details carefully on the next step, make sure all the details are correct.`}</Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>
                                                                For the Payment, you can either pay the training fee on-site or you can pay online via
                                                                <Text as='span' fontWeight='bold' color='blue.400'> GCash. </Text>
                                                                Contact our office for the payment process.
                                                            </Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>{`Take a screenshot or a photo of your proof of payment and send it to the Pentagon Maritime's official Facebook messenger or email for validation.`}</Text>
                                                            <Text fontWeight='bold'>
                                                                Email:<Text fontWeight='normal' as='span' color='blue.400'> pentagonmaritimecorp@gmail.com</Text>
                                                            </Text>
                                                            <Text fontWeight='bold'>
                                                                Facebook: <Link fontWeight='normal' color='blue.400' target='_blank' href='https://www.facebook.com/Pentagonmaritimeservicescorp'>m.me/Pentagonmaritimeservicescorp</Link>
                                                            </Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>
                                                                Prepare the necessary requirements for submission on or before the start of your training.
                                                            </Text>
                                                        </ListItem>
                                                    </OrderedList>
                                                </Box>
                                            </Box>
                                        </BannerView>
                                    </Box>
                                    <Box _hover={{'& .card': {transform: 'translateY(-10px)'}}} w={{base: '100%', md: '50%'}} h='100%'>
                                        <BannerView initial={{opacity: 0, x: 100, y: 20}} animate={{opacity: 1, x: 0, y: 0,}} transition={{duration: 0.4, delay: 1.5, ease: 'linear'}}>
                                            <Box className='card space-y-2' transition='transform 0.4s ease-in-out' w='100%' mt='4' p={4} borderRadius='10px' borderWidth='2px' shadow='xl'>
                                                <Text fontSize='xl' fontWeight='800' color='blue.700'>Onsite Enrollment</Text>
                                                <Box px='5'>
                                                    <OrderedList className='space-y-3' color='gray.600' fontWeight='400' fontSize='lg'>
                                                        <ListItem className='space-y-3'>
                                                            <Box>
                                                                <Text>Visit our training center during office hours</Text>
                                                                <Text  ps='2' as='span' fontWeight='bold' color='blue.400'> Operating Hours: </Text>
                                                                <Text ps='2' >{`Mon-Fri 8:00AM - 5:00PM`}</Text>
                                                                <Text ps='2' >{`Sat 8:00AM - 2:00PM`}</Text>
                                                            </Box>
                                                            <Box>
                                                                <Text ps='2' as='span' fontWeight='bold' color='blue.400'> Location: </Text>
                                                                <Text ps='2' >{`2/F 801, Building United Nations Ave. 1000 Ermita NCR, City of Manila, First District Philippines`}</Text>
                                                                <Text ps='4' as='span' fontSize='sm' fontWeight='bold' color='blue.400'> Landmarks: </Text>
                                                                <Text ps='4' fontSize='sm'> Near Timesplaza | KFC | NBI | LRT (UN Ave. Station)</Text>
                                                            </Box>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>Fill out the Registration form provided.</Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>{`Pay the required amount indicated on the registration form at the Cashier's window.`}</Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>Get the Receipt or wait for further instructions.</Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>Prepare the necessary requirements for submission on or before the start of your training.</Text>
                                                        </ListItem>
                                                    </OrderedList>
                                                </Box>
                                            </Box>
                                        </BannerView>
                                    </Box>
                                </Box>
                            </TabPanel>
                            <TabPanel>
                                <Box px={{base: '0', md: '8', lg: '8'}} display='flex' flexDir={{base: 'column', md: 'row', lg: 'row'}} justifyContent='space-between' >
                                    <Box _hover={{'& .card': {transform: 'translateY(-10px)'}}} w={{base: '100%', md: '50%'}} mr={{base: 0, md: 5, lg: 5}}>
                                        <BannerView initial={{opacity: 0, x: -100, y: 20}} animate={{opacity: 1, x: 0, y: 0,}} transition={{duration: 0.4, delay: 1.5, ease: 'linear'}}>
                                            <Box className='card space-y-2' transition='transform 0.4s ease-in-out' w='100%' mt='4' p={4} borderRadius='10px' borderWidth='2px' shadow='xl'>
                                                <Text fontSize='xl' fontWeight='800' color='blue.700'>Online Enrollment</Text>
                                                <Box px='5'>
                                                    <OrderedList className='space-y-3' color='gray.600' fontWeight='400' fontSize='lg'>
                                                        <ListItem >
                                                            <Text>{`Go to `} 
                                                                <Text as='span' color='blue.600' fontWeight='bold'>
                                                                    <Link href='/admissions/ol/forms'>admissions/ol/forms</Link>
                                                                </Text>
                                                                . Click on <Text as='span' fontWeight='bold'>Re-Enrolled</Text>
                                                            </Text>
                                                            <Text>
                                                                Enter your Last Name, First Name, and SRN for verification. Once verified, you will be redirected to the registration form where your personal information will auto-display. If any of your information needs updating, please make the necessary changes.
                                                            </Text>
                                                            <Text py='2' as='i' fontWeight='bold' fontSize='sm'>Reminder: Ensure that all required photos are clear and meet the necessary standards.</Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>{`In the Next Step, select your desired course training(s), training schedule and preferred mode of payment.`}</Text>
                                                            <Text>
                                                                Be sure to click 
                                                                <Text as='span' fontWeight='bold' color='blue.400'> Insert Course </Text>
                                                                before proceeding to the following step.
                                                            </Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>{`Afterwards, please review the details carefully on the next step, make sure all the details are correct.`}</Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>
                                                                For the Payment, you can either pay the training fee on-site or you can pay online via
                                                                <Text as='span' fontWeight='bold' color='blue.400'> GCash. </Text>
                                                                Contact our office for the payment process.
                                                            </Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>{`Take a screenshot or a photo of your proof of payment and send it to the Pentagon Maritime's official Facebook messenger or email for validation.`}</Text>
                                                            <Text fontWeight='bold'>
                                                                Email:<Text fontWeight='normal' as='span' color='blue.400'> pentagonmaritimecorp@gmail.com</Text>
                                                            </Text>
                                                            <Text fontWeight='bold'>
                                                                Facebook: <Link fontWeight='normal' color='blue.400' target='_blank' href='https://www.facebook.com/Pentagonmaritimeservicescorp'>m.me/Pentagonmaritimeservicescorp</Link>
                                                            </Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>
                                                                Prepare the necessary requirements for submission on or before the start of your training.
                                                            </Text>
                                                        </ListItem>
                                                    </OrderedList>
                                                </Box>
                                            </Box>
                                        </BannerView>
                                    </Box>
                                    <Box _hover={{'& .card': {transform: 'translateY(-10px)'}}} w={{base: '100%', md: '50%'}} h='100%'>
                                        <BannerView initial={{opacity: 0, x: 100, y: 20}} animate={{opacity: 1, x: 0, y: 0,}} transition={{duration: 0.4, delay: 1.5, ease: 'linear'}}>
                                            <Box className='card space-y-2' transition='transform 0.4s ease-in-out' w='100%' mt='4' p={4} borderRadius='10px' borderWidth='2px' shadow='xl'>
                                                <Text fontSize='xl' fontWeight='800' color='blue.700'>Onsite Enrollment</Text>
                                                <Box px='5'>
                                                    <OrderedList className='space-y-3' color='gray.600' fontWeight='400' fontSize='lg'>
                                                        <ListItem className='space-y-3'>
                                                            <Box>
                                                                <Text>Visit our training center during office hours</Text>
                                                                <Text  ps='2' as='span' fontWeight='bold' color='blue.400'> Operating Hours: </Text>
                                                                <Text ps='2' >{`Mon-Fri 8:00AM - 5:00PM`}</Text>
                                                                <Text ps='2' >{`Sat 8:00AM - 2:00PM`}</Text>
                                                            </Box>
                                                            <Box>
                                                                <Text ps='2' as='span' fontWeight='bold' color='blue.400'> Location: </Text>
                                                                <Text ps='2' >{`2/F 801, Building United Nations Ave. 1000 Ermita NCR, City of Manila, First District Philippines`}</Text>
                                                                <Text ps='4' as='span' fontSize='sm' fontWeight='bold' color='blue.400'> Landmarks: </Text>
                                                                <Text ps='4' fontSize='sm'> Near Timesplaza | KFC | NBI | LRT (UN Ave. Station)</Text>
                                                            </Box>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>Fill out the Registration form provided.</Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>{`Pay the required amount indicated on the registration form at the Cashier's window.`}</Text>
                                                        </ListItem>
                                                        <ListItem >
                                                            <Text>Get the Receipt or wait for further instructions before the start of your training.</Text>
                                                        </ListItem>
                                                    </OrderedList>
                                                </Box>
                                            </Box>
                                        </BannerView>
                                    </Box>
                                </Box>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </BannerView>
            <Box px={{base: '5%', md: '5%', lg: '20%'}} pb='10'>
                <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut' >
                    <Text fontSize='2xl' color='blue.700' fontWeight='700'>Requirements</Text>
                    <Text fontSize='lg' color='gray.500' fontWeight='400'>The following requirements must be submitted or shown to the Registrations before admission to any training program.</Text>
                </ElementView>
                <List pt='5' px={{base: '5', md: '0', lg: '0'}}  styleType={'circle'}>
                    <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut' >
                        <ListItem>
                            <Box fontSize='lg' display='block' fontWeight='400' color='gray.600'>
                                <Text fontWeight='700'>Valid ID</Text>
                                <Text fontSize='base' px='3'>{`Preferrable: Philippine Passport or Seaman's Book.`}</Text>
                            </Box>
                        </ListItem>
                    </ElementView>
                    <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut' >
                        <ListItem>
                            <Box fontSize='lg' display='block' fontWeight='400' color='gray.600'>
                                <Text fontWeight='700'>ID Picture</Text>
                                <Text fontSize='base' px='3'>{`2" x 2" photograph on plain white background taken not more than six months prior to submission.`}</Text>
                            </Box>
                        </ListItem>
                    </ElementView>
                </List>
            </Box>
        </Box>
    </>
    )
}