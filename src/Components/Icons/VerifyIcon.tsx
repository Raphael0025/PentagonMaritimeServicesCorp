interface IconProps {
    size: string;
    color: string;
}

export default function VerifyIcon({size, color}: IconProps){
    return(
        <>
        <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
            <path fill={`${color}`} d="m17.275 20.25l3.475-3.45l-1.05-1.05l-2.425 2.375l-.975-.975l-1.05 1.075zM6 9h12V7H6zm12 14q-2.075 0-3.537-1.463T13 18t1.463-3.537T18 13t3.538 1.463T23 18t-1.463 3.538T18 23M3 22V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v6.675q-.475-.225-.975-.375T19 11.075V5H5v14.05h6.075q.125.775.388 1.475t.687 1.325L12 22l-1.5-1.5L9 22l-1.5-1.5L6 22l-1.5-1.5zm3-5h5.075q.075-.525.225-1.025t.375-.975H6zm0-4h7.1q.95-.925 2.213-1.463T18 11H6zm-1 6.05V5z" />
        </svg>
        </>
    )
}