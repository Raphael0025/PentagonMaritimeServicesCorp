interface IconProps {
    size: string;
    color: string;
}
export default function PurchaseIcon({size, color}: IconProps){
    return(
        <>
            <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
                <path fill={`${color}`} d="M7 15h3a1 1 0 0 0 0-2H7a1 1 0 0 0 0 2M19 5H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3m1 12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6h16Zm0-8H4V8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1Z" />
            </svg>
        </>
    )
}