'use client'

import React, { useEffect } from 'react'
import lottie from 'lottie-web'
import animationData from './wheel-ship.json' // Import the JSON animation file

export default function ShipOnPhone(){
    useEffect(() => {
        // Load the Lottie animation
        const container = document.getElementById('lottie-container');
        if (container) { // Check if container is not null
            const animation = lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: animationData // Pass the imported animation data
            });

            // Cleanup function
            return () => {
                animation.destroy(); // Destroy the animation when the component unmounts
            };
        }
    }, []);  // Empty dependency array ensures the effect runs only once

    return (
        <>{/* Container for the Lottie animation */}
            <div id="lottie-container" style={{ width: '100%', height: '800px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}></div>
        </>
    );
}