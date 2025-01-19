interface IconProps{
    size: string;
    color: string;    
}

export default function SearchIcon({size, color}: IconProps) {
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 12 12">
            <path fill={color} fillRule="evenodd" d="M8.5 5.5a3 3 0 1 1-6 0a3 3 0 0 1 6 0m-.393 3.668a4.5 4.5 0 1 1 1.06-1.06l2.613 2.612a.75.75 0 1 1-1.06 1.06z" clipRule="evenodd" />
        </svg>
        </>
    )
}