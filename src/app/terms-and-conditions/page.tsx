'use client'

import React from 'react'
import { Box, Link, Text, UnorderedList, ListItem} from '@chakra-ui/react'
import { BannerView, ElementView, } from '@/Components/SiteComponents'

export default function Page(){
    return(
    <Box px={{base: '5%', lg: '20%'}} py='5' pt='20' bgColor='#fbffff'>
        <BannerView initial={{opacity: 0, x: -200, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.5, delay: 1, ease: 'linear'}}>
            <Text textTransform='capitalize' fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }} fontWeight='800'>Terms and conditions</Text>
        </BannerView>
        <Box color='gray.600' fontSize='md' lineHeight='2rem' className='space-y-6' fontWeight='450'>
            <BannerView initial={{opacity: 0, x: 200, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.5, delay: 1, ease: 'linear'}}>
                <Text>{`Welcome to the official website of Pentagon Maritime Services Corp. ("Company", "we", "our", or "us"). By accessing or using this website, you agree to comply with and be bound by the following terms and conditions of use ("Terms"), which govern your relationship with us regarding this Site. If you do not agree to these Terms, please refrain from using our Site.`}</Text>
            </BannerView>
            <BannerView initial={{opacity: 0, x: -200, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.5, delay: 1, ease: 'linear'}}>
                <Text>{`The Site is intended to provide information, and services to streamline maritime processes and facilitate seamless communication between seafarers, and our clients. You may use this Site for lawful purposes only. Activities such as sharing harmful content, misrepresenting information, or disrupting the Site's functionality are strictly prohibited. Certain features may require account registration. Users are responsible for ensuring the accuracy of their information and maintaining the confidentiality of their user credentials.`}</Text>
            </BannerView>
            <BannerView initial={{opacity: 0, x: 200, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.5, delay: 1, ease: 'linear'}}>
                <Text>{`All content, materials, and elements featured on this Site, including but not limited to the design, layout, appearance, graphics, videos, logos, icons, and overall presentation, are the exclusive property of Pentagon Maritime Services Corp. or its authorized licensors. These elements are protected under applicable intellectual property laws, including copyright, trademark, and design rights.`}</Text>
            </BannerView>
            <BannerView initial={{opacity: 0, x: -200, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.5, delay: 1, ease: 'linear'}}>
                <Text>{`Any reproduction, redistribution, modification, publication, or display of the Site's content or materials, in whole or in part, without prior written consent from Pentagon Maritime Services Corp. is strictly prohibited. This includes, but is not limited to:`}</Text>
            </BannerView>
            <BannerView initial={{opacity: 0, x: 200, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.5, delay: 1, ease: 'linear'}}>
                <UnorderedList styleType={'lower-roman'}>
                    <ListItem>{`Copying or imitating the Site's design, visual elements, or structure for personal or commercial purposes.`}</ListItem>
                    <ListItem>{`Using any images, videos, or multimedia assets from the Site without proper authorization.`}</ListItem>
                    <ListItem>{`Extracting and reusing content, whether manually or through automated tools, in any manner that violates copyright or intellectual property laws.`}</ListItem>
                </UnorderedList>
            </BannerView>
            <BannerView initial={{opacity: 0, x: -200, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.5, delay: 1, ease: 'linear'}}>
                <Text>{`The Site may contain links to external websites or third-party resources for the convenience of users. These links are provided solely as references or for informational purposes. Pentagon Maritime Services Corp. does not own, control, or have any direct affiliation with the content, services, or materials available on these external sites.`}</Text>
                <Text>{`You may not create a link to this website from another website or document without Pentagon's prior written consent.`}</Text>
            </BannerView>
            <BannerView initial={{opacity: 0, x: 200, }} animate={{opacity: 1, x: 0, }} transition={{duration: 0.5, delay: 1, ease: 'linear'}}>
                <Text>{`These Terms and Conditions are governed by the laws of the Republic of the Philippines. Any disputes arising from the use of the Site will be subject to the exclusive jurisdiction of Philippine courts.`}</Text>
            </BannerView>
        </Box>
    </Box>
    )
}