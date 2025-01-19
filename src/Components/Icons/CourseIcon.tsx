interface IconProps {
    size: string;
    color: string;
}

export default function FolderIcon({size, color}: IconProps){
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
	<path fill={color} d="M24 30H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16.618l-5-2.5l-5 2.5V4H8v24h16v-4h2v4a2.003 2.003 0 0 1-2 2m-3-14.118l3 1.5V4h-6v13.382Z" />
</svg>
}