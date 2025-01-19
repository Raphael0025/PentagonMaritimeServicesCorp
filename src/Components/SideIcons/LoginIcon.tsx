interface IconProps {
    size: string;
    color: string;
}
export default function LoginIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
            <path fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9m6-9l-4-4m4 4l-4 4m4-4H5" />
        </svg>
        </>
    )
}