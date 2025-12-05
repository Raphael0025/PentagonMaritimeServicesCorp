import { reformatTrainingSched, reformatSchedule } from "./trainee_handler"

// Helper function to get the formatted date string
export const currentYear = new Date().getFullYear()
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const fullMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const splitTextAtWordBoundary = (text: string, limit: number) => {
    if (text.length <= limit) return [text, '']; // If text is shorter than the limit, no need to split
    const splitIndex = text.lastIndexOf(' ', limit); // Find the last space before the limit
    if (splitIndex === -1) return [text, '']; // If no space is found, return the entire text
    return [text.slice(0, splitIndex), text.slice(splitIndex + 1)]; // Split at the space
}

export const getFormatDate = (dateRange: string): string => {
    // Regular expression to extract the month and day from the input
    const regex = /(?:\w+, )?(\w+) (\d+)(?: - (?:\w+, )?(\w+) (\d+))?/
    const match = dateRange.match(regex)
    const year = new Date().getFullYear()

    if (!match) {
        throw new Error("Invalid date range format")
    }
    
    const [, startMonth, startDay, endMonth, endDay] = match
    // If the months are the same, format as "Oct 07-09"
    if (startMonth === endMonth) {
        return `${startMonth} ${startDay}-${endDay}, ${year}`
    }
    // If the months are different, format as "Oct 31 - Nov 01"
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}

export const getFormattedDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0') // Ensure day is 2 digits
    const month = months[date.getMonth()] // Get month name from the `months` array
    const weekday = daysOfWeek[date.getDay()] // Get the year, though it's not used in the final string
    
    return `${weekday}, ${month} ${day}`; // Return in "Month Day" format (e.g., "Nov 11")
}

export const getFormatDateWithTime = (date: Date | null): string => {
    if(!date) return 'cannot format date'
    return date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true})
}

export const trainingModeColor = (value: string) => {
    switch(value){
        case 'f2f':
            return 'cyan.900';
        case 'f2fm':
            return 'cyan.400';
        case 'f2ft':
            return 'cyan.600';
        case 'f2fp':
            return 'cyan.800';
        case 'ol':
            return 'blue.100';
        case 'olm':
            return 'blue.300';
        case 'olt':
            return 'blue.500';
        case 'olp':
            return 'blue.700';
        case 'blended':
            return 'orange.400';
        default:
            return '';
    }
}

export const trainingModeFontColor = (value: string) => {
    switch(value){
        case 'f2ft':
        case 'olt':
        case 'olp':
        case 'f2f':
            return 'white';
        default:
            return '';
    }
}

export const backgroundColor = (value: number) => {
    switch(value){
        case 3:
            return '';
        case 4:
            return 'blue.400';
        case 5:
            return 'yellow.400';
        case 6:
            return 'green.400';
        case 7:
            return 'red.500';
        case 8:
            return 'red.400';
        default:
            return '';
    }
}

export const BackgroundTypeColor = (value: string) => {
    switch(value.toLowerCase()){
        case 'announcement':
            return 'yellow.50'
        case 'alert':
            return 'red.50'
        case 'info':
            return 'blue.50'
        default:
            return 'No Match'
    }
}

export const FontTypeColor = (value: string) => {
    switch(value.toLowerCase()){
        case 'announcement':
            return 'yellow.700'
        case 'alert':
            return 'red.700'
        case 'info':
            return 'blue.700'
        default:
            return 'No Match'
    }
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
    }
};

export const marketBGColor = (val: string): string => {
    switch(val.toLowerCase()){
        case 'company':
            return 'blue.200'
        case 'agent':
            return 'teal.200'
        case 'walk-in':
            return 'orange.200'
        case 'fb':
            return 'blue.700'
        case 'consultancy':
            return 'green.200'
        case 'others':
            return 'gray.200'
        default:
            return 'No Match'
    }
}

export const marketFontColor = (val: string): string => {
    switch(val.toLowerCase()){
        case 'fb':
            return 'white'
        default:
            return 'No Match'
    }
}

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