interface IconProps {
    size: string;
    color: string;
}

export default function EditIcon({size, color}: IconProps){
    return <svg xmlns="http://www.w3.org/2000/svg" width={`${size}`} height={`${size}`} viewBox="0 0 24 24">
            <g fill="none" stroke={`${color}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1l1-4Z" />
            </g>
        </svg>
}