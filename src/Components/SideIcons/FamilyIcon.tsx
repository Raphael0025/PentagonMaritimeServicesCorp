interface IconProps {
    size: string;
    color: string;
}
export default function FamilyIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 48 48">
            <g fill="none" stroke={`${color}`} strokeLinecap="round" strokeWidth="4">
                <path d="M10 19s-5.143 2-6 9m34-9s5.143 2 6 9m-26-9s4.8 1.167 6 7m6-7s-4.8 1.167-6 7m-4 8s-4.2.75-6 6m14-6s4.2.75 6 6" />
                <circle cx="24" cy="31" r="5" strokeLinejoin="round" />
                <circle cx="34" cy="14" r="6" strokeLinejoin="round" />
                <circle cx="14" cy="14" r="6" strokeLinejoin="round" />
            </g>
        </svg>
        </>
    )
}