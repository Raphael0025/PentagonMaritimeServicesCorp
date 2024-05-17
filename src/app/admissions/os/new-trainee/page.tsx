'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link'
import ProgressTracker from '../../../../Components/ProgressTracker';

export default function NewTrainee() {
    const router = useRouter();
    const searchParams = useSearchParams()
    
    const url = `${searchParams}`

    // Function to change the URL pathname
    const changePathname = () => {
        if(url === 'step2='){
            router.push('new-trainee?step3');
        } else {
            router.push('new-trainee?step2');
        }
    }

    return (
        <main>
            <ProgressTracker />
            <section className='h-full w-full text-neutral-950'>
                Main New Trainee
                <button className='h-32 w-full text-neutral-950' onClick={changePathname}>Click</button>
            </section>
        </main>
    )
}
