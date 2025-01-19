'use client'

import React from 'react'
import { Box, Image, Text, Link, ListItem, UnorderedList, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react'
import { BannerView, ElementView, } from '@/Components/SiteComponents'

export default function Page(){
    return(
    <Box px={{base: '5%', lg: '20%'}} py='5' pt='20' bgColor='#fbffff'>
        <BannerView initial={{opacity: 0, x: -50, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
            <Text textTransform='capitalize' fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }} fontWeight='800'>Privacy Policy</Text>
        </BannerView>

        <Box color='gray.600' fontSize='md' lineHeight='2rem' className='space-y-6' fontWeight='450'>
            <BannerView initial={{opacity: 0, x: 50, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                <Text>{`PENTAGON MARITIME SERVICES CORP. is committed to maintaining the privacy of users who access our Web site. This Privacy Policy Statement explains the types of information we gather and what we do with it. By using the Site, you agree to the terms and policies described in this Privacy Policy.`}</Text>
            </BannerView>
            <BannerView initial={{opacity: 0, x: -50, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                <Text>{`PENTAGON MARITIME SERVICES CORP. ensures the confidentiality of your information under Republic Act No. 10173 of the "Data Privacy Act of 2012" and will exert reasonable efforts to protect against its unauthorized use or disclosure.`}</Text>
            </BannerView>
            <BannerView initial={{opacity: 0, x: -50, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                <Text>{`In compliance with the requirement of the Data Privacy Act and it's implementing rules and regulations, we would like to inform you how we handle and protect the data you provide in the course of your transaction/s with PENTAGON.`}</Text>
            </BannerView>
            
            <BannerView initial={{opacity: 0, x: -50, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                <Text color='gray.700' fontSize='lg' fontWeight='800'>General Provisions</Text>
            </BannerView>
            <BannerView initial={{opacity: 0, x: -50, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                <Accordion allowMultiple>
                    <AccordionItem shadow='md'>
                        <AccordionButton  _expanded={{bgColor: 'blue.600'}} _hover={{bgColor: 'blue.300'}} display='flex' justifyContent='space-between' bgColor='blue.400' color='#fbffff'>
                            <Text fontSize='sm' textAlign='start'>Information Collection</Text>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel p='8' fontSize='sm'>
                            <Text>{`We collect your personal information. These may consist of written records and photographic images. Photographic images include official documentation as well as security recordings taken within the training center.`}</Text>
                        </AccordionPanel>
                    </AccordionItem>
                    <BannerView initial={{opacity: 0, x: 150, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                            <AccordionItem shadow='md'>
                                <AccordionButton  _expanded={{bgColor: 'blue.600'}} _hover={{bgColor: 'blue.300'}} display='flex' justifyContent='space-between' bgColor='blue.400' color='#fbffff'>
                                    <Text fontSize='sm' textAlign='start'>Personal Information of Other Individuals</Text>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel p='8' fontSize='sm'>{`If you supply us with personal data of other individuals, e.g., person/s to notify in case of emergency, parents/guardians, spouse, character references, and the like, we will assume that you have obtained the consent of these individuals before providing us with their personal information.`}</AccordionPanel>
                            </AccordionItem>
                    </BannerView>
                    <AccordionItem shadow='md'>
                        <AccordionButton  _expanded={{bgColor: 'blue.600'}} _hover={{bgColor: 'blue.300'}} display='flex' justifyContent='space-between' bgColor='blue.400' color='#fbffff'>
                            <Text fontSize='sm' textAlign='start'>Use of Personal Information for Legal and Other Purposes</Text>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel p='8' fontSize='sm'>
                            <Text>{`We may use and disclose personal information in connection with:`}</Text>
                            <UnorderedList styleType={'lower-roman'}>
                                <ListItem>for legitimate purposes.</ListItem>
                                <ListItem>to implement transaction/s which you request, allow or authorize.</ListItem>
                                <ListItem>to offer and provide new or related products and services of PENTAGON.</ListItem>
                                <ListItem>{`to comply with PENTAGON policies and it's reporting obligations under applicable laws.`}</ListItem>
                            </UnorderedList>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </BannerView>
            <BannerView initial={{opacity: 0, x: 150, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                <Text color='gray.700' fontSize='lg' fontWeight='800'>How We Secure and Retain You Information</Text>
                <Text>{`Pentagon Maritime stores information received from Registered Users on secure computers. Only a minimal number of Pentagon Employees have physical access to these computers.`}</Text>
                <Text>{`While we have taken measures to protect your information, please know that no computers or device is immune from intrusion; and information transmitted to the Site may need to pass through the network in order to transmit your information. Therefore, Pentagon Maritime cannot guarantee the absolute security or confidentiality of information transmitted to the Site.`}</Text>
                <Text>{`Unless otherwise provided by law or by institutional policies, we retain relevant personal data indefinitely for historical purposes. Otherwise, the personal data will be securely disposed of after the specified retention period.`}</Text>
            </BannerView>
            <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut'>
                <Text color='gray.700' fontSize='lg' fontWeight='800'>Contact Us</Text>
                <Text>{`Should you have any concern or question regarding your rights, this Data Privacy Policy, or any matter involving Pentagon Maritime Services Corp. and data privacy, you may contact:.`}</Text>
                <Box px='7' fontSize='sm' w={{base: '100%', md: '50%', lg: '35%'}} lineHeight={'1.5rem'}>
                    <Text color='gray.650' fontWeight='800'>Operations Manager</Text>
                    <Text>PENTAGON MARITIME SERVICES CORP.</Text>
                    <Text>{`2/F 801, Building United Nations Ave. 1000 Ermita NCR, City of Manila, First District Philippines`}</Text>
                    <Text>{`+639995135916`}</Text>
                    <Link color='blue.500' href='/pentagonmaritimeservices@gmail.com'>{`pentagonmaritimeservices@gmail.com`}</Link>
                </Box>
                <Text>
                    If you prefer to send an email you may click this 
                    <Link href='/contact-us' color='blue.500' mx='2' >Contact Us</Link> 
                    to be able to write your inquiries or concerns.
                </Text>
                <Text>{`In your email, please provide a detailed description of your inquiry or concern regarding any potential non-compliance with the Privacy Policy. This information will help us thoroughly investigate your concern.`}</Text>
            </ElementView>
            <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut'>
                <Text color='gray.700' fontSize='lg' fontWeight='800'>Copyright</Text>
                <Text>{`This website is safeguarded under the intellectual property laws governing copyrights and trademarks of the Republic of the Philippines. All rights are reserved. Any unauthorized use, reproduction, imitation, or infringement—whether direct or indirect—is strictly prohibited and may result in civil and criminal legal actions.`}</Text>
                <Text>{`PENTAGON MARITIME SERVICES CORP. does not accept unsolicited ideas, concepts, or proposals for new services or products through its website. Any such submissions received will not be treated as confidential, and PENTAGON MARITIME SERVICES CORP. reserves the right to use, disclose, or otherwise utilize the information in any way it deems appropriate`}</Text>
            </ElementView>
        </Box>
    </Box>
    )
}