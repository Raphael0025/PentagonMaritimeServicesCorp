interface IconProps {
    size: string;
    color: string;
}
export default function FeedbackIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 32 32">
            <path fill={`${color}`} d="M19.95 15.89c.18.08.37.11.55.11c.41 0 .81-.17 1.1-.48L23.94 13H27c1.65 0 3-1.35 3-3V5c0-1.65-1.35-3-3-3h-8c-1.65 0-3 1.35-3 3v4.99c0 1.65 1.35 3 3 3v1.5c0 .63.37 1.17.95 1.4M18 5c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1h-3.94L21 13.22V11h-2c-.55 0-1-.45-1-1zm-7.5 13c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3s3-1.35 3-3s-1.35-3-3-3m0 19.99c-2.9 0-5.12-.8-6.62-2.368c-1.931-2.015-1.886-4.585-1.881-4.838v-.017C2 21.26 3.26 20 4.82 20h11.36c1.55 0 2.82 1.259 2.82 2.817v.01c.004.182.06 2.77-1.88 4.805C15.62 29.201 13.4 30 10.5 30zm-5.68-7.992c-.45 0-.82.37-.82.82v.006c-.003.143-.028 2.025 1.34 3.44c1.1 1.149 2.84 1.728 5.16 1.728s4.05-.58 5.16-1.728c1.4-1.449 1.35-3.387 1.34-3.407c0-.49-.37-.859-.82-.859z" />
        </svg>
        </>
    )
}