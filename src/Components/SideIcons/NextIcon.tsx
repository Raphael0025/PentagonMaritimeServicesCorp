interface IconProps {
    size: string;
}
export default function NextIcon({size}: IconProps){
    return(
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 48 48">
            <g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4">
                <path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z" />
                <path strokeLinecap="round" d="m21 33l9-9l-9-9" />
            </g>
        </svg>
    )
}