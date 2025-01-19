import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import { CalendarIcon } from './SideIcons';

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
            <CalendarIcon size={'20'} color={'#1C437E'} />
            <p>{currentDate}</p>
        </div>
    );
}

export default Clock;
