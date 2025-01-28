import { Courses } from '@/types/courses'
import { Timestamp } from 'firebase/firestore'

export const HoliDates = [
    { date: "01-01", holidayName: `New Year's Day` },
    { date: "04-09", holidayName: "Araw ng Kagitingan" },
    { date: "05-01", holidayName: "Labor Day" },
    { date: "06-12", holidayName: "Independence Day" },
    { date: "08-26", holidayName: "National Heroes Day" },
    { date: "11-30", holidayName: "Bonifacio Day" },
    { date: "12-25", holidayName: "Christmas Day" },
    { date: "12-30", holidayName: "Rizal Day" },
    { date: "02-10", holidayName: "Chinese New Year" },
    { date: "03-28", holidayName: "Maundy Thursday" },
    { date: "03-29", holidayName: "Good Friday" },
    { date: "03-30", holidayName: "Black Saturday" },
    { date: "11-01", holidayName: `All Saints' Day` },
    { date: "11-02", holidayName: `All Souls' Day` },
    { date: "12-08", holidayName: "Feast of the Immaculate Conception" }
]

export const formatTimestampToTimeString = (timestamp: Timestamp): string => {
    const date = timestamp.toDate(); // Convert Timestamp to Date
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Format minutes to two digits
    const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM or PM

    hours = hours % 12; // Convert hours to 12-hour format
    hours = hours ? hours : 12; // If hours is 0, make it 12

    return `${hours}:${minutes} ${ampm}`;  // Return in "HH:MM" format
};

export const generateCourseCode = (course: Courses): string => {
    // Get the first three letters of the course name, capitalized
    const namePart = course.course_name.slice(0, 3).toUpperCase();

    // Generate a random 3-digit number
    const randomPart = Math.floor(100 + Math.random() * 900).toString();

    // Combine the parts to form a 6-character code
    return `${namePart}${randomPart}`;
}

export const formatTime = (startTime: Timestamp, endTime?: Timestamp): string => {
    if (!startTime) return ''; // Return empty string if timeRange is not defined
    const formatTimestamp = (timestamp: Timestamp): string => {
        const date = timestamp.toDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        // Convert to 12-hour format and determine AM/PM
        const period = hours >= 12 ? 'p.m.' : 'a.m.';
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
        const formattedMinutes = minutes.toString().padStart(2, '0');

        return `${formattedHours}:${formattedMinutes} ${period}`;
    };
    
    // Format startTime and endTime if provided
    const formattedStartTime = formatTimestamp(startTime);
    const formattedEndTime = endTime ? formatTimestamp(endTime) : '';

    // Return the formatted time range
    return formattedEndTime ? `${formattedStartTime} - ${formattedEndTime}` : formattedStartTime;
}

// Helper function to get the formatted date string
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const getFormattedDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0') // Ensure day is 2 digits
    const month = months[date.getMonth()] // Get month name from the `months` array
    const weekday = daysOfWeek[date.getDay()] // Get the year, though it's not used in the final string
    
    return `${weekday}, ${month} ${day}`; // Return in "Month Day" format (e.g., "Nov 11")
}

// Helper function to calculate the end of a range given the start date and duration
const getEndOfWeek = (startDate: Date, days: number): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1);
    return endDate;
}

// Non-Promo Date Generator
export const generateDateBefore = (startDay: string, numberOfWeeks: number, numberOfDays: string): string[] => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const lastMonth = currentMonth - 1

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const startDayIndex = daysOfWeek.indexOf(startDay)

    const startDate = new Date(currentYear, lastMonth, 1)

    let currentDateIterator = startDate;
    while (currentDateIterator.getDay() !== startDayIndex) {
        currentDateIterator.setDate(currentDateIterator.getDate() + 1);
    }

    const dateRanges: string[] = [];

    for (let i = 0; i < numberOfWeeks; i++) {
        const endOfWeek = getEndOfWeek(currentDateIterator, parseInt(numberOfDays));
        const formattedStartDate = getFormattedDate(currentDateIterator);
        const formattedEndDate = getFormattedDate(endOfWeek);

        const range = numberOfDays === "1" ? '' : ` to ${formattedEndDate}`;
        
        dateRanges.push(`${formattedStartDate}${range}`);
        
        currentDateIterator.setDate(currentDateIterator.getDate() + 7); // Move to the next week
    }

    return dateRanges;
}

// Non-Promo Date Generator
export const generateDateRanges = (startDay: string, numberOfWeeks: number, numberOfDays: string): string[] => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const startDayIndex = daysOfWeek.indexOf(startDay)

    const startDate = new Date(currentYear, currentMonth, 1)

    let currentDateIterator = startDate;
    while (currentDateIterator.getDay() !== startDayIndex) {
        currentDateIterator.setDate(currentDateIterator.getDate() + 1);
    }

    const dateRanges: string[] = [];

    for (let i = 0; i < numberOfWeeks; i++) {
        const endOfWeek = getEndOfWeek(currentDateIterator, parseInt(numberOfDays));
        const formattedStartDate = getFormattedDate(currentDateIterator);
        const formattedEndDate = getFormattedDate(endOfWeek);

        const range = numberOfDays === "1" ? '' : ` to ${formattedEndDate}`;
        
        // Only include ranges that haven’t completely passed
        if (endOfWeek >= currentDate) {
            dateRanges.push(`${formattedStartDate}${range}`);
        }

        currentDateIterator.setDate(currentDateIterator.getDate() + 7); // Move to the next week
    }

    return dateRanges;
}
