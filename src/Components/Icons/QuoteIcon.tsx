interface IconProps{
    size: string;
    color: string;
}

export default function QuoteIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16">
            <path d="M0 0h16v16H0z" fill="none" />
            <path fill={color} d="M3.516 7a3.5 3.5 0 1 1-3.5 3.5L0 10a7 7 0 0 1 7-7v2a4.97 4.97 0 0 0-3.536 1.464a5 5 0 0 0-.497.578q.269-.043.548-.043zm9 0a3.5 3.5 0 1 1-3.5 3.5L9 10a7 7 0 0 1 7-7v2a4.97 4.97 0 0 0-3.536 1.464a5 5 0 0 0-.497.578q.269-.043.549-.043z" />
        </svg>
        </>
    )
}