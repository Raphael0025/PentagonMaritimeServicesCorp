interface IconProps {
    size: string;
    color: string;
}

export default function StopIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
            <path fill="#fbffffff" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5.75 5.75l12.5 12.5M12 21a9 9 0 1 1 0-18a9 9 0 0 1 0 18">
            </path>
        </svg>
        </>
    )
}