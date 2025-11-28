import React from 'react'

interface IconProps {
    size: string;
    color: string;
}

export default function AnnouncementIcon({size, color}: IconProps){
    return(
        <>
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
                <g fill="none">
                    <path fill={color} fill-opacity="0.16" d="M10.575 5.217L3.517 17a1.667 1.667 0 0 0 1.425 2.5h14.116a1.666 1.666 0 0 0 1.425-2.5L13.426 5.217a1.666 1.666 0 0 0-2.85 0"/>
                    <path stroke={color} stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M12 16h.008M12 10v3m-1.425-7.783L3.517 17a1.667 1.667 0 0 0 1.425 2.5h14.116a1.666 1.666 0 0 0 1.425-2.5L13.426 5.217a1.666 1.666 0 0 0-2.85 0"/>
                </g>
            </svg>
        </>
    )
}