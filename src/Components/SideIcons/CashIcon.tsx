interface IconProps {
    size: string;
    color: string;
}

export default function CashIcon({size, color}: IconProps){
    return(
        <>
            <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
                <g fill="none" stroke={`${color}`} strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2 11l2.807-3.157A4 4 0 0 1 7.797 6.5H8m-6 13h5.5l4-3s.81-.547 2-1.5c2.5-2 0-5.166-2.5-3.5C8.964 12.857 7 14 7 14" />
                    <path d="M8 13.5V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a2 2 0 1 1 0-4a2 2 0 0 1 0 4m4.5-1.99l.01-.011m-9.01.011l.01-.011" />
                </g>
            </svg>
        </>
    )
}