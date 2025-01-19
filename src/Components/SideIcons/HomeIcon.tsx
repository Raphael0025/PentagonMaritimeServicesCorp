interface IconProps {
    size: string;
    color: string;
}
export default function HomeIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 256 256">
            <path fill={`${color}`} d="m228 84.38l-87.9-68.29l-.26-.2a19.92 19.92 0 0 0-23.66 0l-.26.2L28 84.38a20 20 0 0 0-7.09 22l32 107.51l.08.26A19.93 19.93 0 0 0 72 228h112a19.93 19.93 0 0 0 19-13.87l.08-.26l32-107.51A20 20 0 0 0 228 84.38M181 204H75L44.62 101.87L128 37.09l83.38 64.78Z" />
        </svg>
        </>
    )
}