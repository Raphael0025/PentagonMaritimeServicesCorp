'use client'

import React, { useEffect, useRef } from 'react'
import 'animate.css'

interface ComponentProps {
    addView: string;
    removeView: string;
    children: React.ReactNode;
}

export default function ElementView({addView, removeView, children}: ComponentProps){
    const componentRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if(entry.isIntersecting && entry.intersectionRatio > 0){
                    entry.target.classList.remove(removeView)
                    entry.target.classList.add(addView)
                } else {
                    entry.target.classList.remove(addView)
                    entry.target.classList.add(removeView)
                }
            })
        })

        const currRef = componentRef.current
        if(currRef){
            observer.observe(currRef)
        }
        return() => {
            if(currRef){
                observer.unobserve(currRef)
            }
        }
    },[])

    return(
    <div ref={componentRef} className='animate__animated'>
        {children}
    </div>
    )
}