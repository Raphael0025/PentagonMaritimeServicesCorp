import Link from 'next/link'
import ShipOnPhone from '@/Components/ShipOnPhone'

export default function NotFound() {
    return (
        <div className='flex bg-wave w-full relative space-y-6 md:space-y-0 h-dvh overflow-hidden justify-center md:items-start items-center flex-col md:flex-row'>
            <div className='container spacing-y'>
                <ShipOnPhone size={'700px'} />
            </div>
            <div className='container-second spacing-y'>
                <h2 className='text-4xl md:text-6xl font-bold'>Page Not Found</h2>
                <h2 className='text-md md:text-xl font-medium text-center' style={{color: '#a1a1a1'}}>Sorry, the page you are looking for does not exist.</h2>
                <h5 className='text-center'>Please click the link below to access the online registration form</h5>
                <Link className='rounded p-3 btn-primary' href="/admissions/ol/forms">Go to Online Registration Form</Link>
            </div>
        </div>
    )
}