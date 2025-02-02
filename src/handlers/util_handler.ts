
import { Timestamp } from 'firebase/firestore'

// Helper function to get the formatted date string
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const fullMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const getFormattedDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0') // Ensure day is 2 digits
    const month = months[date.getMonth()] // Get month name from the `months` array
    const weekday = daysOfWeek[date.getDay()] // Get the year, though it's not used in the final string
    
    return `${weekday}, ${month} ${day}`; // Return in "Month Day" format (e.g., "Nov 11")
}

const borderTextColorMap: Record<string, Record<number, string>> = {
    status: {
        0: 'blue.700',
        1: 'yellow.700',
        2: 'green.700',
        3: 'red.700',
    },
    prio: {
        0: 'yellow.700',
        1: 'green.700',
        2: 'red.700',
    },
    category: {
        0: 'blue.700',
        1: 'green.700',
    },
};

const bgColorMap: Record<string, Record<number, string>> = {
    status: {
        0: 'blue.50',
        1: 'yellow.50',
        2: 'green.50',
        3: 'red.50',
    },
    prio: {
        0: 'yellow.50',
        1: 'green.50',
        2: 'red.50',
    },
    category: {
        0: 'blue.50',
        1: 'green.50',
    },
};

export const getBorderTextColor = (val: number, type: string): string => {
    return borderTextColorMap[type]?.[val] || 'No Value';
};

export const getBGColor = (val: number, type: string): string => {
    return bgColorMap[type]?.[val] || 'No Value';
};

export const getFormattedDateYear = (date: Date): string => {
    const currYear = date.getFullYear()
    const day = date.getDate().toString().padStart(2, '0') // Ensure day is 2 digits
    const month = months[date.getMonth()] // Get month name from the `months` array
    const weekday = daysOfWeek[date.getDay()] // Get the year, though it's not used in the final string
    
    return `${weekday}, ${month} ${day}, ${currYear}`; // Return in "Month Day" format (e.g., "Nov 11")
}

export const getFormatTimeDate = (date: Date): string => {
    const currYear = date.getFullYear()
    const day = date.getDate().toString().padStart(2, '0') // Ensure day is 2 digits
    const month = months[date.getMonth()] // Get month name from the `months` array
    const weekday = daysOfWeek[date.getDay()] // Get the year, though it's not used in the final string
    
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${weekday}, ${month} ${day}, ${currYear} at ${hours}:${minutes} ${period}`; // Return in "Month Day" format (e.g., "Nov 11")
}

export function generateTicketID(): string {
    const now = new Date();

    // Format each part of the timestamp
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
    const day = now.getDate().toString().padStart(2, '0'); // DD
    const year = now.getFullYear().toString().slice(-2); // YY (last two digits)
    const hours = now.getHours().toString().padStart(2, '0'); // HH
    const minutes = now.getMinutes().toString().padStart(2, '0'); // MM
    const seconds = now.getSeconds().toString().padStart(2, '0'); // SS

    // Combine all parts to create the timestamp
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

    // Return the ticket ID
    return `TKT-${timestamp}`;
}


export const convertVal = (val: number, type: string): string => {
    switch(type){
        case 'prio':
            return val === 0 ? 'Low' : val === 1 ? 'Medium' : 'High';
        case 'category':
                return val === 0 ? 'Software' : 'Hardware';
        case 'status':
            return val === 0 ? 'Open' : val === 1 ? 'In Progress' : val === 2 ? 'Resolved' : 'Closed';
        default:
            return 'Not Found';
    }
}