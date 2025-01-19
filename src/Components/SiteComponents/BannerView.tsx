'use client'

import { motion, MotionProps } from 'framer-motion'

interface BannerProps{
    initial: MotionProps['initial'];
    animate: MotionProps['animate'];
    transition: MotionProps['transition'];
    children: React.ReactNode;
}

export default function BannerView({initial, animate, transition, children}: BannerProps){
    return(
    <div style={{overflow: 'hidden'}}>
        <motion.div 
            initial={initial}
            animate={animate}
            transition={transition}
        >
            {children}
        </motion.div>
    </div>
    )
}