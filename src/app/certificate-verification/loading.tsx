'use client'

import Loader from '@/Components/Loader'

export default function Loading(){
    return (
        <div className='w-full overflow-hidden flex gap-4 h-dvh justify-center items-center bg-wave flex-col py-6 pr-6 '>
            <Loader />
        </div>
    )
}