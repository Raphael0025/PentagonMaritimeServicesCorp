interface IconProps {
    size: string;
    color: string;
}

export default function CheckIcon({size, color}: IconProps){
    return(
        <>
            <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 48 48">
                <g fill="none" stroke={`${color}`} strokeLinejoin="round" strokeWidth="4">
                    <path d="M24 44a19.937 19.937 0 0 0 14.142-5.858A19.937 19.937 0 0 0 44 24a19.938 19.938 0 0 0-5.858-14.142A19.937 19.937 0 0 0 24 4A19.938 19.938 0 0 0 9.858 9.858A19.938 19.938 0 0 0 4 24a19.937 19.937 0 0 0 5.858 14.142A19.938 19.938 0 0 0 24 44Z" />
                    <path strokeLinecap="round" d="m16 24l6 6l12-12" />
                </g>
            </svg>
        </>
    )
}