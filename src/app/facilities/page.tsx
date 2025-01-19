'use client'

import { Box, Image, Text, Grid, GridItem } from '@chakra-ui/react'
import 'animate.css';
import { BannerView, ElementView, CardOverlay, BannerComponent } from '@/Components/SiteComponents'

export default function Home() {

    return (
        <main className='pb-10'>
            <BannerView initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0,}} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                <BannerComponent title='Our Facilities' image='./Images/ContactUs.jpg' content={`Train with confidence in our advanced simulator facilities, featuring cutting-edge technology for realistic, hands-on experiences in navigation, ship handling, and emergency response.`} />
            </BannerView>
            <Box px={{base: '5%', md: '20%', lg: '15%'}} py='8' bgColor='#fbffff'>
                <Grid w='100%' templateRows='repeat(2, 1fr)' templateColumns={{base: '1fr', md: 'repeat(4, 1fr)', lg: 'repeat(4, 1fr)'}} gap={4}>
                    <GridItem colSpan={2}>
                        <BannerView initial={{opacity: 0, x: -50, y: 50}} animate={{opacity: 1, x: 0, y: 0}} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                            <CardOverlay title='Full Mission Bridge Simulation' redirect={'/'}
                                    content={`Our Full Mission Bridge Simulator (FMBS), powered by Transas, delivers a cutting-edge maritime training experience with a 270° panoramic view. This immersive system replicates real-world ship operations, equipping trainees with the skills needed to navigate safely and...`} 
                                    image='./Images/FMB/WideScreen.jpg'
                            />
                        </BannerView>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <BannerView initial={{opacity: 0, x: 50, y: 50}} animate={{opacity: 1, x: 0, y: 0}} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                            <CardOverlay title='ECDIS & ARPA/ROPA Simulation' redirect={'/'}
                                    content={`The ECDIS & ARPA/ROPA Simulation is designed to offer participants an immersive, real-time training environment for navigating and maneuvering ships using advanced electronic systems. This simulation integrates...`} 
                                    image='./Images/MB/Front.jpg'
                            />
                        </BannerView>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut'>
                            <CardOverlay title='Engine Room Simulation' redirect={'/'}
                                    content={`The Engine Room Simulator provides an in-depth, realistic environment for training personnel in the operation and management of a ship's engine room. This simulation includes various engine systems, and control systems, allowing trainees to understand the intricacies of...`} 
                                    image='./Images/ERS/Front.jpg'
                            />
                        </ElementView>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut'>
                            <CardOverlay title='Liquid Cargo Handling Simulation' redirect={'/'}
                                    content={`The Liquid Cargo Handling Simulation offers a comprehensive training module focused on the safe and efficient management of liquid cargo operations on board vessels. The simulation covers various aspects such as the loading, unloading, and transfer of liquid cargo, as well as...`} 
                                    image='./Images/FMB/WideScreen.jpg'
                            />
                        </ElementView>
                    </GridItem>
                </Grid>
            </Box>
        </main>
    );
}
