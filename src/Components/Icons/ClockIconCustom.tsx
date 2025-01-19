interface IconProps {
    size: string;
    color: string;
}

export default function ClockIconCustom({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
            <g fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" />
                <path d="M12 7v5l3 3" />
            </g>
        </svg>
        </>
    )
}