interface IconProps {
    size: string;
    color: string;
}

export default function TicketIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
            <g fill="none" stroke={color} strokeLinecap="round" strokeWidth={4}>
                <path strokeLinejoin="round" d="M34 30v-1.011A2.99 2.99 0 0 1 36.989 26v0a2.99 2.99 0 0 1 2.989 2.985l.012 8.2A6.805 6.805 0 0 1 33.185 44h-7.538a13.93 13.93 0 0 1-11.192-5.637l-4.265-5.757a2.99 2.99 0 0 1-.162-3.32v0a2.992 2.992 0 0 1 4.682-.576L16 30V16a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v11.875v-6.849A3.026 3.026 0 0 1 25.026 18v0a3.026 3.026 0 0 1 3.027 3.026V29v-1.101a2.974 2.974 0 0 1 2.973-2.974v0A2.974 2.974 0 0 1 34 27.899z">
                </path>
                <path d="M32 4v8">
                </path>
                <path strokeLinejoin="round" d="M16 20H6v-4c2 0 4-1.5 3.974-4S8 8 6 8V4h36v4c-2 0-3.948 1.5-3.974 4S40 16 42 16v4H28">
                </path>
            </g>
        </svg>
        </>
    )
}