interface IconProps {
    size: string;
    color: string;
}

export default function CalendarIcon({size, color}: IconProps){
    return(
        <>
            <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 512 512">
                <rect width="416" height="384" x="48" y="80" fill="none" stroke={`${color}`} strokeLinejoin="round" strokeWidth="32" rx="48" />
                <circle cx="296" cy="232" r="24" fill={`${color}`} />
                <circle cx="376" cy="232" r="24" fill={`${color}`} />
                <circle cx="296" cy="312" r="24" fill={`${color}`} />
                <circle cx="376" cy="312" r="24" fill={`${color}`} />
                <circle cx="136" cy="312" r="24" fill={`${color}`} />
                <circle cx="216" cy="312" r="24" fill={`${color}`} />
                <circle cx="136" cy="392" r="24" fill={`${color}`} />
                <circle cx="216" cy="392" r="24" fill={`${color}`} />
                <circle cx="296" cy="392" r="24" fill={`${color}`} />
                <path fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M128 48v32m256-32v32" />
                <path fill="none" stroke={`${color}`} strokeLinejoin="round" strokeWidth="32" d="M464 160H48" />
            </svg>
        </>
    )
}