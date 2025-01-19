interface IconProps {
    size: string;
    color: string;
}
export default function HistryIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
            <g fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="M12 8v4l2 2" />
                <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
            </g>
        </svg>
        </>
    )
}