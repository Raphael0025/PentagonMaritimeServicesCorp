import React, { useState, useEffect } from 'react';
import Image from 'next/image'

const Clock: React.FC = () => {
    const [currentDate, setCurrentDate] = useState<string>(new Date().toDateString());

    useEffect(() => {
        const timerID = setInterval(() => tick(), 1000); // Update every second
        return () => {
        clearInterval(timerID); // Cleanup
        };
    }, []);

    const tick = () => {
        setCurrentDate(new Date().toDateString()); // Update current date
    }

    return (
        <div className='text-center flex space-x-3 place-items-center justify-center items-center' style={{width: '140px'}}>
            <Image priority src='/icons/calendar.png' width={20} height={20} alt='calendar' />
            <p>{currentDate}</p>
        </div>
    );
}

export default Clock;
