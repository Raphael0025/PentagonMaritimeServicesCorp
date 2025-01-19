'use client'

import { Image, Box, Step, StepDescription, StepIcon, StepIndicator, StepNumber, StepSeparator, StepStatus, StepTitle, Stepper, useSteps, } from '@chakra-ui/react'
import 'animate.css';
import { useState, useEffect } from 'react';

interface StepperProps {
    step: number;
    onStepChange?: (step: number) => void;
}

export default function NavStepper ({
    step, 
    onStepChange = () => {}
}: StepperProps){
    const steps = [
        { title: `Trainee's Information`, description: ``},
        { title: `Training Details`, description: ``},
        { title: `Review Form`, description: ``},
        { title: `Completed`, description: ``},
    ]
    
    const [path, setPath] = useState<number>(step)
    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
      })

    useEffect(() => {
        setPath(step)
        setActiveStep(step)
    }, [step])

    const handleStepChange = (newStep: number) => {
        setPath(newStep); 
        setActiveStep(newStep)
        onStepChange(newStep); 
    }

    return(
        <section className='w-full flex justify-center items-center text-white h-20 animate__animated animate__fadeInLeft'>
            <div className='w-full bg-pt' style={{ position: 'relative', height: '80px'}}>
                <Image src={'/blurred_crop_old_fmb3.jpg'} alt="fill image" width='100%' height='100%' />
                <div style={{ content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#333333', opacity: 0.8, }} />
            </div>
            <section className="absolute w-full flex justify-center items-center h-20">
                <Box w={{base: '100%', md: '50%'}} className='px-3'>
                    <Stepper index={activeStep}>
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>
                                <Box flexShrink='0' display={{base: 'none', md: 'block'}}>
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription color='white'>{step.description}</StepDescription>
                                </Box>
                            <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>
                </Box>
            </section>
        </section>
    )
}