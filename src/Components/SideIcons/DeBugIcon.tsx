interface IconProps {
    size: string;
    color: string;
}
export default function DeBugIcon({size, color}: IconProps){
    return(
        <>
            <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 14 14">
                <g fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 12.5h-2a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V4m-13-.5h13M6 6.5l1.3 1.3M6 13.5l1.3-1.3M7 10H5.5M13 6.5l-1.3 1.3m1.3 5.7l-1.3-1.3" />
                    <path d="M7 9a2.5 2.5 0 1 1 5 0v2a2.5 2.5 0 0 1-5 0zm5 1h1.5M7 9.5h5" />
                </g>
            </svg>
        </>
    )
}