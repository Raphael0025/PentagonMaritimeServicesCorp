'use client'

import { useState, useEffect} from 'react';
import {BackDatedAnalytics, DatedAnalytics} from '@/Components/Page/Training/Analytics'

export default function Page(){
    const [isDated, setIsDated] = useState<boolean>(true)

    useEffect(() => {
        const bdHandler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
                setIsDated(prev => !prev)
            }
        };
        window.addEventListener('keydown', bdHandler);
        return () => window.removeEventListener('keydown', bdHandler);
    }, [])

    return (
        <>
            {/* Debug indicator (OPTIONAL - remove if you want fully hidden) */}
            {/* <Text fontSize="xs" color="gray.400">Press CTRL + ALT + D to toggle</Text> */}

            {isDated ? <DatedAnalytics /> : <BackDatedAnalytics />}
        </>
    );

    return null
    
}