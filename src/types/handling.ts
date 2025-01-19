import Swal from 'sweetalert2';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/controller'
import{ CoursesById } from './courses'
import{ CourseCount } from './document'
import{ HistoryLog } from './utils'
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

// Function to generate a random four-digit number
export const generateUserCode = () => {
    return Math.floor(1000 + Math.random() * 9000);
}
    
export const parseTrainingSchedule = (trainingSched: string): [Date | null, Date | null] => {
    // Check if the training schedule is a range (contains "to")
    if (trainingSched.includes("to")) {
        // Example: "Mon, September 23 to Fri, September 27"
        const dates = trainingSched.split(" to ").map(dateStr => new Date(dateStr));
        return [dates[0], dates[1]]; // Return both start and end dates
    } else {
        // Example: "Mon, September 23"
        return [new Date(trainingSched), null]; // Return only the start date
    }
}

// export const getTotalTraineesData = async (trainees: ExtendedTraineeDetails[] | null, courses: CoursesById[] | null, registrations: ExtendedRegistrationDetails[] | null, trainings: ExtendedTrainingDetails[] | null ) => {
    
//     if (!trainees || !registrations || !trainings) {
//         return { sortedMergedRegistrations: [], total: 0, online: 0, onsite: 0, agent: 0, walkin: 0, socMed: 0, company: 0, others: 0, byMonth: Array(12).fill(0), agentArr: Array(12).fill(0), walkArr: Array(12).fill(0), socMedArr: Array(12).fill(0), companyArr: Array(12).fill(0), othersArr: Array(12).fill(0), enrolledCourses: {}, currTotal: 0 };
//     }
    
//     const courseArr : CourseCount = {}

//     courses?.forEach(courseCode => {
//         courseArr[courseCode.course_code] = 0
//     })

//     trainings.forEach(training =>{
//         if(training.training_status !== 'Cancelled'){
//             courseArr[training.course]++
//         }
//     })

//     const enrolledCourses = Object.entries(courseArr)
//     .filter(([courseCode, count]) => count > 0).sort(([, countA], [, countB]) => countB - countA)
//     .slice(0, 10).reduce((acc, [courseCode, count]) => {
//         acc[courseCode] = count;
//         return acc;
//     }, {} as CourseCount)

//     const today = new Date();

//     // Filter trainees added on the current date
//     const todayTrainees = trainees.filter(trainee => {
//         const traineeAdded = trainee.trainee_added as any;
//         const traineeDate = (traineeAdded instanceof Timestamp)
//             ? (traineeAdded as Timestamp).toDate()
//             : new Date(traineeAdded);
//         return isSameDay(traineeDate, today);
//     });

//     // Filter trainees based on registration type
//     const onlineTotal = registrations.filter(reg => reg.registration === 'online').length;
//     const onsiteTotal = registrations.filter(reg => reg.registration === 'onsite').length;

//     // Count trainees based on marketing classification
//     const agent = trainees.filter(trainee => trainee.marketing === 'agent').length;
//     const walkin = trainees.filter(trainee => trainee.marketing === 'walk-in').length;
//     const socMed = trainees.filter(trainee => trainee.marketing === 'soc-med').length;
//     const company = trainees.filter(trainee => trainee.marketing === 'company').length;
//     const others = trainees.filter(trainee => trainee.marketing === 'others').length;

//     // Count trainees by month
//     const byMonth = Array(12).fill(0);
//     const agentArr = Array(12).fill(0);
//     const walkArr = Array(12).fill(0);
//     const socMedArr = Array(12).fill(0);
//     const companyArr = Array(12).fill(0);
//     const othersArr = Array(12).fill(0);

//     trainees.forEach(trainee => {
//         const traineeAdded = trainee.trainee_added as any;
//         const traineeDate = (traineeAdded instanceof Timestamp)
//             ? (traineeAdded as Timestamp).toDate()
//             : new Date(traineeAdded);
//         const monthIndex = traineeDate.getMonth();
//         byMonth[monthIndex]++;
//         if (trainee.marketing === 'agent') agentArr[monthIndex]++;
//         else if (trainee.marketing === 'walk-in') walkArr[monthIndex]++;
//         else if (trainee.marketing === 'soc-med') socMedArr[monthIndex]++;
//         else if (trainee.marketing === 'company') companyArr[monthIndex]++;
//         else if (trainee.marketing === 'others') othersArr[monthIndex]++;
//     });

//     // Combine RegistrationDetails and TraineeDetails
//     const mergedRegistrations = registrations
//     .map((registration: ExtendedRegistrationDetails) => {
//         const trainee = trainees.find((t: ExtendedTraineeDetails) => t.id === registration.ref_id);
//         if (trainee) {
//             const { id, ...traineeWithoutId } = trainee;
//             return {
//                 trainee_id: id,
//                 ...traineeWithoutId,
//                 ...registration,
//             };
//         }
//         return null;
//     }).filter((item) => item !== null);

//     // Sort merged data by enrolled_date in descending order and slice the top 10
//     const sortedMergedRegistrations = mergedRegistrations
//     .filter((a): a is CombinedTraineeRegistrationDetails => a !== null && a.enrolled_date !== null) // Type guard to ensure non-null
//     .sort((a, b) => {
//         // Convert enrolled_date string to Date
//         const dateA = new Date(a.enrolled_date);
//         const dateB = new Date(b.enrolled_date);

//         return dateB.getTime() - dateA.getTime();
//     })
//     .slice(0, 10);
//     // Return all counts
//     return { sortedMergedRegistrations, total: trainees.length, online: onlineTotal, onsite: onsiteTotal, agent, walkin, socMed, company, others, byMonth, agentArr, walkArr, socMedArr, companyArr, othersArr, enrolledCourses, currTotal: todayTrainees.length };
// }

const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

//Discount function
export const calculateDiscountedTotalPrice = (originalPrice: number, discountPercentage: number) => {
    // Convert discount percentage to a decimal value
    const discountDecimal = discountPercentage / 100;
    
    // Calculate the discount amount
    const discountAmount = originalPrice * discountDecimal;
    
    // Calculate the discounted price
    const discountedPrice = originalPrice - discountAmount;
    
    return discountedPrice;
}

export const getCurrentFormattedDateTime = () => {
    const now = new Date();
    const formattedDate = format(now, 'eeee, MMM d, yyyy');
    const formattedTime = format(now, 'hh:mm a');
    return `${formattedDate} at ${formattedTime}`;
} 

type SweetAlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'

export type ToastStatus = 'success' | 'error' | 'warning' | 'info'

export const showTitleTextIcon = (title: string = '', text: string = '', icon: SweetAlertIcon) => {
    Swal.fire({
        title: title,
        text: `${text}.`,
        icon: icon,
    });
}

export const getStatusStyles = (status: string) => {
    switch (status) {
        case 'For Verification':
        case 'PENDING':
            return { backgroundColor: '#FFA500', color: '#000' }; // Orange background, white text
        case 'Verified':
            return { backgroundColor: '#10B981', color: '#000' }; // Green background, white text
        case 'Cancelled':
            return { backgroundColor: '#FF0000', color: '#fff' }; // Red background, white text
        case 'Awaiting Schedule': // Or any better phrase you prefer
        case 'Incoming Courses': // Or any better phrase you prefer
            return { backgroundColor: '#85C4ED', color: '#000' }; // Grey background, white text
        case 'Ongoing Training':
            return { backgroundColor: '#0D70AB', color: '#fff' }; // Blue background, white text
        case 'Completed':
        case 'RELEASED':
            return { backgroundColor: '#16A34A', color: '#fff' }; // Black background, white text
        case 'ENROLLED':
        case 'PASSED':
            return { backgroundColor: '#10B981', color: '#000' }; // Black background, white text
        case 'FAILED':
            return { backgroundColor: '#FF0000', color: '#fff' }; // Black background, white text
        case 'INCOMPLETE':
        case 'BACKDATED':
            return { backgroundColor: '#85C4ED', color: '#000' }; // Black background, white text
        default:
            return { backgroundColor: '#000000', color: '#fff' }; // Default black background, white text
    }
};

export const calculateAge = (date: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
    }
    return age;
}

export const formatTime = (timeRange: string): string => {
    if (!timeRange) return ""; // Return empty string if timeRange is not defined
    return timeRange.split(' - ').map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return time; // Return unchanged if invalid format
        const period = hours < 12 ? 'a.m.' : 'p.m.';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }).join(' - ');
}

export const formatDateToWords = (dateString: string): string => {
    if(!dateString) {return ''}
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};

export const formatDateWithDayToWords = (dateString: string): string => {
    if(!dateString) {return ''}
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

export const formatDate = (date: Date): string => {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};

export const formatDateWithDay = (date: Date | null): string => {
    if (!date) return 'Invalid Date'; // Return a fallback if the date is null or undefined

    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};

export const formatTimeVal = (time: Date): string => {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    return time.toLocaleTimeString('en-US', options);
}

export const parsingTimestamp = (date: Timestamp | Date): Date => {
    return date instanceof Timestamp ? date.toDate() : new Date(date)
}

export const parseDate = (dateString: string | number): Date => {
    // Handle Firebase timestamps
    if (typeof dateString === 'object' && (dateString as { seconds?: number }).seconds) {
        return new Date((dateString as { seconds: number }).seconds * 1000);
    }
    // Handle ISO strings or other formats directly parsable by Date
    return new Date(dateString);
};

export const parseDateToStr = (schedule: string) => {
    const [startDate] = schedule.split('to').map(dateStr => dateStr.trim());
    const [month, day] = startDate.split(' ');
    const currentYear = new Date().getFullYear();
    return new Date(`${month} ${day}, ${currentYear}`);
}

export const formatMonthYear = (date: Date) => {
    const options = { year: 'numeric', month: 'long' } as const;
    return date.toLocaleDateString('en-US', options);
}

export const reduceWeekDay = (schedule: string) => {
    // Regular expression to match days at the start or after "to"
    const daysPattern = /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s?/g;
    // Replace matching patterns with an empty string
    return schedule.replace(daysPattern, '').trim();
}

export const convertDateRange = (dateRange: string): string => {
    if (!dateRange) return ''

    const cleanedDateRange = dateRange.replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), /gi, '');

    // Split the range into start and end dates
    const dates = cleanedDateRange.split(' to ');

    // Extract the month and day from the start date
    const [startMonth, startDay] = dates[0].split(' ');

    // Convert month names to their abbreviated forms
    const abbreviatedMonth = (month: string) => {
        const monthMap: Record<string, string> = {
            January: 'Jan',
            February: 'Feb',
            March: 'Mar',
            April: 'Apr',
            May: 'May',
            June: 'Jun',
            July: 'Jul',
            August: 'Aug',
            September: 'Sep',
            October: 'Oct',
            November: 'Nov',
            December: 'Dec'
        };
        return monthMap[month] || month;
    }

    const startMonthAbbrev = abbreviatedMonth(startMonth);

    // Check if there is an end date
    if (dates.length === 2) {
        const [endMonth, endDay] = dates[1].split(' ');
        const endMonthAbbrev = abbreviatedMonth(endMonth);
    
        // Return the formatted date range
        return `${startMonthAbbrev} ${startDay} - ${endMonthAbbrev} ${endDay}`;
    } else {
      // Return the single date formatted
        return `${startMonthAbbrev} ${startDay}`;
    }
}

export const extractLastDate = (dateRange: string): string => {
    if (!dateRange) return '';

    // Remove the days of the week and commas
    const cleanedDateRange = dateRange.replace(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun), /gi, '');

    // Split the range into start and end dates
    const dates = cleanedDateRange.split(' to ');

    // If there are two dates, return the second (end) date
    if (dates.length === 2) {
        const [endMonth, endDay] = dates[1].split(' ');
        return `${endMonth.slice(0, 3)} ${endDay}`;
    } else {
        const [endMonth, endDay] = dates[0].split(' ');
        return `${endMonth.slice(0, 3)} ${endDay}`;
    }
}

// Promo Date generator
export const calculateDates = (startDateString: string, endDateString: string, numberOfDays: number): string[] => {

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const dates: string[] = [];
    const occurrenceDay = getDayOfWeek(startDate);

    while (startDate <= endDate) {
        if (startDate.getDay() === getDayNumber(occurrenceDay)) {
            const endDateOfWeek = new Date(startDate);
            endDateOfWeek.setDate(endDateOfWeek.getDate() + numberOfDays - 1);
            if(numberOfDays !== 1){
                dates.push(`${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} - ${endDateOfWeek.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}`)
            } else {
                dates.push(`${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}`)
            }
        }
        startDate.setDate(startDate.getDate() + 1);
    }
    return dates;
}

export const getFormattedDateRange = (startDate: Date, days: number) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };

    // If days is 1, return only the formatted start date
    if (days === 0) {
        const formattedStart = startDate.toLocaleDateString('en-US', options);
        return {
            dateRange: formattedStart, // Only one date
            endDate: startDate // Return the start date as the end date as well
        };
    } else {
        // Create end date object for more than 1 day
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);
    
        // Format the dates
        const formattedStart = startDate.toLocaleDateString('en-US', options);
        const formattedEnd = endDate.toLocaleDateString('en-US', options);
    
        // Return the formatted date range and end date
        return {
            dateRange: `${formattedStart} - ${formattedEnd}`,
            endDate: endDate // Return the end date as a Date object
        };
    }
}

export const formatPromoPeriod = (startDate: Date, endDate: Date, days: number) => {

    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
    const formatStart = startDate.toLocaleDateString('en-US', options)
    if(days === 1){
        return formatStart
    } else {
        const formatEnd = endDate.toLocaleDateString('en-US', options)
        return `${formatStart} - ${formatEnd}`
    }
}

const getDayOfWeek = (date: Date): string => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
}

function getDayNumber(day: string): number {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.indexOf(day.toLowerCase());
}

function getFormattedDate(date: Date): string {
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear(); 
    const abbreviatedDayOfWeek = dayOfWeek[date.getDay()];
    return `${abbreviatedDayOfWeek}, ${month} ${day}`;
}

// Non Promo Date generator
function getEndOfWeek(startOfWeek: Date, numOfDays: number): Date {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + ((numOfDays - 1))); // End of the week is 5 days after the start
    return endOfWeek;
}

// Non Promo Date generator
export const generateDateRanges = (startDay: string, numberOfWeeks: number, numberOfDays: string): string[] => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startDayIndex = daysOfWeek.indexOf(startDay);

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

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
        dateRanges.push(`${formattedStartDate} ${range}`);

        currentDateIterator.setDate(currentDateIterator.getDate() + 7); // Move to the next week
    }

    return dateRanges;
}

export const generateSlug = (slug: string) => {
    // Convert course name to lowercase and replace spaces with dashes
    return slug.toLowerCase().replace(/\s+/g, '-');
};

export const handleMarketing = (marketing: string) => {
    switch(marketing){
        case 'soc-med':
            return 'Social Media'
        case 'company':
            return 'Company'
        case 'others':
            return 'Others'
        case 'agent':
            return 'Agent'
        case 'walk-in':
            return 'Walk-In'
        default:
            return ''
    }
}