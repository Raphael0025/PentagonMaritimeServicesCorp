interface IconProps {
    size: string;
    color: string;
}
export default function GovtIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
            <path fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14.047a10.63 10.63 0 0 0-6.422 1.435c-1.415.842-5.125 2.562-2.865 4.715C3.816 21.248 5.045 22 6.59 22H13m2.5-15.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M18 14c-1.267 0-2.088.808-3.06 1.102c-.394.12-.592.18-.672.264s-.103.207-.15.454c-.5 2.638.594 5.078 3.204 6.027c.28.102.42.153.679.153c.257 0 .398-.051.678-.153c2.61-.95 3.704-3.389 3.203-6.027c-.047-.247-.07-.37-.15-.454s-.278-.144-.673-.264C20.088 14.808 19.266 14 18 14" color={`${color}`} />
        </svg>
        </>
    )
}