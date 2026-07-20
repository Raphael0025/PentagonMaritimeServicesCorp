'use client'

import { Box, Image, Text, Grid, GridItem } from '@chakra-ui/react'
import { BannerView, ElementView, CardOverlay, BannerComponent } from '@/Components/SiteComponents'

export default function Home() {
    const trainingRM = ['TRAINING-ROOM/rm1.png', 'TRAINING-ROOM/rm3.png', 'TRAINING-ROOM/rm6.jpg']
    const regArr = ['RECEPTION/rec1.jpg', 'RECEPTION/rec2.jpg', 'RECEPTION/rec2.jpg', 'RECEPTION/rec3.jpg', 'RECEPTION/rec4.jpg', 'RECEPTION/miniBar.png',]
    const lchsArr = ['LCHS/img1.jpg', 'LCHS/img2.jpg', 'LCHS/img3.jpg', 'LCHS/img4.jpg']
    const fmbArr = ['FMB/img1.jpg', 'FMB/img2.jpg', 'FMB/img3.jpg', 'FMB/img4.jpg']
    const mbArr = ['MB/img1.jpg', 'MB/img2.jpg', 'MB/img3.jpg', 'MB/img4.jpg', 'MB/img5.jpg', 'MB/img6.jpg', 'MB/img7.jpg']
    const ersArr = ['ERS/img1.jpg', 'ERS/img2.jpg', 'ERS/img3.jpg', 'ERS/img4.jpg', 'ERS/img5.jpg', 'ERS/img6.jpg', 'ERS/img7.jpg']
    const siteArr = ['PRACTICAL-SITE/fireBrick.png', 'PRACTICAL-SITE/img1.png', 'PRACTICAL-SITE/img2.png', 'PRACTICAL-SITE/img3.png', 'PRACTICAL-SITE/img4.png', 'PRACTICAL-SITE/img5.jpg', 'PRACTICAL-SITE/img6.jpg', 'PRACTICAL-SITE/img7.jpg', 'PRACTICAL-SITE/img8.jpg']

    return (
        <main className='pb-10'>
            <Box mt='-90px'>
                <BannerView initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0,}} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                    <BannerComponent title='Our Facilities' image='./Images/ContactUs.jpg' content={`Train with confidence in our advanced simulator facilities, featuring cutting-edge technology for realistic, hands-on experiences in navigation, ship handling, and emergency response.`} />
                </BannerView>
            </Box>
            <Box px={{base: '5%', md: '20%', lg: '15%'}} py='8' bgColor='#fbffff'>
                <Grid w='100%' templateRows={'repeat(3, 1fr)'} templateColumns={{base: '1fr', md: 'repeat(4, 1fr)', lg: 'repeat(4, 1fr)'}} gap={3}>
                    <GridItem colSpan={2}>
                        <BannerView initial={{opacity: 0, x: -50, y: 50}} animate={{opacity: 1, x: 0, y: 0}} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                            <CardOverlay title='Full Mission Bridge Simulation'  
                                    content={`Our Full Mission Bridge Simulator (FMBS), powered by Transas, delivers a cutting-edge maritime training experience with a 180° panoramic view. This immersive system replicates real-world ship operations, equipping trainees with the skills needed to navigate safely and...`} 
                                    image='./Images/FMB/WideScreen.jpg'
                                    imgArr={fmbArr}
                            />
                        </BannerView>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <BannerView initial={{opacity: 0, x: 50, y: 50}} animate={{opacity: 1, x: 0, y: 0}} transition={{duration: 0.3, delay: 1, ease: 'linear'}}>
                            <CardOverlay title='ECDIS & ARPA/ROPA Simulation'  
                                    content={`The ECDIS & ARPA/ROPA Simulation is designed to offer participants an immersive, real-time training environment for navigating and maneuvering ships using advanced electronic systems. This simulation integrates...`} 
                                    image='./Images/MB/Front.jpg'
                                    imgArr={mbArr}
                            />
                        </BannerView>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut'>
                            <CardOverlay title='Engine Room Simulation'  
                                    content={`The Engine Room Simulator provides an in-depth, realistic environment for training personnel in the operation and management of a ship's engine room. This simulation includes various engine systems, and control systems, allowing trainees to understand the intricacies of...`} 
                                    image='./Images/ERS/Front.jpg'
                                    imgArr={ersArr}
                            />
                        </ElementView>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut'>
                            <CardOverlay title='Liquid Cargo Handling Simulation'  
                                    content={`The Liquid Cargo Handling Simulation offers a comprehensive training module focused on the safe and efficient management of liquid cargo operations on board vessels. The simulation covers various aspects such as the loading, unloading, and transfer of liquid cargo, as well as...`} 
                                    image='./Images/LCHS/FRONT.jpg'
                                    imgArr={lchsArr}
                            />
                        </ElementView>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut'>
                            <CardOverlay title='Registration & Reception'  
                                    content={`Our dedicated Registration and Reception Area is designed to make your enrollment, document submission, and inquiries as smooth, welcoming, and efficient as possible....`} 
                                    image='./Images/RECEPTION/Front.jpg'
                                    imgArr={regArr}
                            />
                        </ElementView>
                    </GridItem>
                    <GridItem colSpan={2}>
                        <ElementView addView='animate__fadeInRight' removeView='animate__fadeOut'>
                            <CardOverlay title='Training Rooms'  
                                    content={`Our Training Rooms are meticulously structured to provide an optimal learning environment for theoretical instruction and interactive discussions. Designed with seafarer comfort and high-tech instruction in mind, these spaces bridge the gap between classroom theory and real-world maritime application...`} 
                                    image='./Images/TRAINING-ROOM/rm1.png'
                                    imgArr={trainingRM}
                            />
                        </ElementView>
                    </GridItem>
                    <GridItem colSpan={{base: 2, md: 4}} rowSpan={1}>
                        <ElementView addView='animate__fadeInLeft' removeView='animate__fadeOut'>
                            <CardOverlay title='Practical Site-Batangas'  
                                    content={`At Pentagon Maritime, we believe that true emergency readiness cannot be learned from a textbook. That's why our Practical Training Facility in Batangas is designed to replicate the exact conditions seafarers face in critical situations at sea. ...`} 
                                    image='./Images/PRACTICAL-SITE/POOL-AREA.jpg'
                                    imgArr={siteArr}
                            />
                        </ElementView>
                    </GridItem>
                </Grid>
            </Box>
        </main>
    );
}
