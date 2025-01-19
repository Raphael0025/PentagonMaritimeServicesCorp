interface IconProps {
    size: string;
    color: string;
}
export default function CourseIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
            <g fill="none" stroke={`${color}`} strokeLinecap="round" strokeWidth="2">
                <path d="M4 19V5a2 2 0 0 1 2-2h13.4a.6.6 0 0 1 .6.6v13.114" />
                <path strokeLinejoin="round" d="M8 3v8l2.5-1.6L13 11V3" />
                <path d="M6 17h14M6 21h14" />
                <path strokeLinejoin="round" d="M6 21a2 2 0 1 1 0-4" />
            </g>
        </svg>
        </>
    )
}