import React, { useState, useEffect } from 'react';
import ClockIcon from '@/Components/Icons/ClockIcon'

const Clock: React.FC = () => {
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const timerID = setInterval(() => tick(), 1000);
        tick(); // Update time immediately after mount
        return () => {
            clearInterval(timerID);
        };
    }, []);

    const tick = () => {
        setCurrentTime(new Date().toLocaleTimeString());
    }

    return (
        <div className='text-center flex space-x-3 place-items-center items-center' style={{width: '110px'}}>
            <ClockIcon />
            <p>{currentTime}</p>
        </div>
    );
}

export default Clock;
