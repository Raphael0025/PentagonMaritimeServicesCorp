'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

export function Providers({children}: { children: React.ReactNode}) {
    const router = useRouter();

// Function to remove custom token from local storage
const removeTokenFromLocalStorage = () => {
    localStorage.removeItem('customToken');
    localStorage.removeItem('pfpToken');
};

useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    const removeTokenAt6PM = () => {
        const now = new Date();
        const targetTime = new Date(now);
        targetTime.setHours(18, 0, 0, 0); // Set the target time to 6:00 PM
        
        const timeUntil6PM = targetTime.getTime() - now.getTime();
        
        if (timeUntil6PM > 0) {
            timeoutId = setTimeout(() => {
                router.push('/login')
                removeTokenFromLocalStorage()
            }, timeUntil6PM);
        }
    };

    removeTokenAt6PM();

    // Cleanup: Clear the timeout when component unmounts
    return () => {
        clearTimeout(timeoutId);
    };
}, []);
    
    return <ChakraProvider>{children}</ChakraProvider>
}