interface IconProps {
    size: string;
    color: string;
}
export default function ListIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 512 512">
            <path fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M160 144h288M160 256h288M160 368h288" />
            <circle cx="80" cy="144" r="16" fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
            <circle cx="80" cy="256" r="16" fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
            <circle cx="80" cy="368" r="16" fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
        </svg>
        </>
    )
}