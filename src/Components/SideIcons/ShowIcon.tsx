interface IconProps {
    size: string;
}
export default function ShowIcon({size}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
            <g fill="#1c4f92">
                <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0" />
                <path d="M21.894 11.553C19.736 7.236 15.904 5 12 5c-3.903 0-7.736 2.236-9.894 6.553a1 1 0 0 0 0 .894C4.264 16.764 8.096 19 12 19c3.903 0 7.736-2.236 9.894-6.553a1 1 0 0 0 0-.894M12 17c-2.969 0-6.002-1.62-7.87-5C5.998 8.62 9.03 7 12 7c2.969 0 6.002 1.62 7.87 5c-1.868 3.38-4.901 5-7.87 5" />
            </g>
        </svg>
        </>
    )
}