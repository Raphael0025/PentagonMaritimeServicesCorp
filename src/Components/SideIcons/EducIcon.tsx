interface IconProps {
    size: string;
    color: string;
}
export default function EducIcon({size, color}: IconProps){
    return(
        <>
            <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
                <path fill={`${color}`} d="M6 20h7v2H6c-1.11 0-2-.89-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8.54l-1.5-.82l-.5.28V4h-5v8l-2.5-2.25L8 12V4H6zm18-3l-5.5-3l-5.5 3l5.5 3zm-9 2.09v2L18.5 23l3.5-1.91v-2L18.5 21z" />
            </svg>
        </>
    )
}