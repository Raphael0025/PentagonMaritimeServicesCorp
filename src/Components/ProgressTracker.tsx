'use client'

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import 'animate.css';

export default function ProgressTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    
    const url = `${searchParams}`
        
    return (
        <section className='bg-pt w-full flex justify-center text-white h-20 animate__animated animate__fadeInLeft'>
            <section className="absolute w-3/4 h-20 flex justify-center items-center">
                <div className='w-40 flex flex-col justify-center items-center '>
                    <span className='circle step-active flex justify-center items-center'>1</span>
                    <span>{`Trainee's Information`}</span>
                </div>  
                <hr className={`line w-1/5 ${url === 'registration=' || url === 'registration+step2=' || url === 'registration+completed=' || url === 'registration+review=' ? 'step-active' : 'step-inactive'}`} />
                <div className='w-40 flex flex-col justify-center items-center '>
                    <span className={`circle ${url === 'registration=' || url === 'registration+step2=' || url === 'registration+completed=' || url === 'registration+review=' ? 'step-active' : 'step-inactive'} flex justify-center items-center`}>2</span>
                    <span>{`Training Details`}</span>
                </div>
                <hr className={`line w-1/5 ${url === 'registration+completed=' || url === 'registration+review=' ? 'step-active' : 'step-inactive'}`} />
                <div className='w-40 flex flex-col justify-center items-center '>
                    <span className={`circle ${url === 'registration+completed=' || url === 'registration+review=' ? 'step-active' : 'step-inactive'} flex justify-center items-center`}>3</span>
                    <span>{`Review Form`}</span>
                </div>
                <hr className={`line w-1/5 ${url === 'registration+completed=' ? 'step-active' : 'step-inactive'}`} />
                <div className='w-40 flex flex-col justify-center items-center '>
                    <span className={`circle ${url === 'registration+completed=' ? 'step-active' : 'step-inactive'} flex justify-center items-center`}>4</span>
                    <span>{`Completed`}</span>
                </div>
            </section>
            
        </section>
    )
}
