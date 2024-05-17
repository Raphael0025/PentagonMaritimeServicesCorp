'use client'

import Image from "next/image";
import Link from 'next/link'
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UnderMaintenance from '@/Components/UnderMaintenance'

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams()
  
  const url = `${searchParams}`

  // Function to change the URL pathname
  const changePathname = () => {
      router.push('/admissions/ol/new-trainee');
  }
  
  const handleLogin = () => {
    router.push('/login');
  }

  // Function to remove custom token from local storage
  const removeTokenFromLocalStorage = () => {
    localStorage.removeItem('customToken');
};

// UseEffect to handle cleanup when the component unmounts
useEffect(() => {
    return () => {
        // Call the function to remove token from local storage when the component unmounts
        removeTokenFromLocalStorage();
    };
}, []);

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <UnderMaintenance />
      <button onClick={changePathname}>Click here to be directed to admissions online</button>
      <button onClick={handleLogin}>Click here to be directed to Login</button>
      <Link href='/enterprise-portal/home'>Go to Enterprise Portal</Link>
    </main>
  );
}
