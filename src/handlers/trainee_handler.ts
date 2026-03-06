import { TRAINING } from '@/types/trainees';

export const handleResults = (result: number) => {
    switch(result){
        case 1:
            return 'INCOMPLETE'
        case 2:
            return 'PASSED'
        case 3:
            return 'FAILED'
        default:
            return ''
    }
}

export const handleRegStatus = (status: number) => {
    switch(status){
        case 0:
            return 'Acknowledge';
        case 1:
            return 'Acknowledged';
        case 2:
            return 'To Enroll';
        case 3:
            return 'Enrolled';
        case 4:
            return 'On-Hold';
        case 5:
            return 'Pending';
        case 6:
            return 'Graduated';
        case 7:
            return 'Cancelled';
        case 8:
            return 'Absent';
        case 9:
            return 'Non-Appearance';
        default:
            return 'null';
    }
}

export const handleCertStatus = (status: number) => {
    switch(status){
        case 0:
            return 'PENDING';
        case 1:
            return 'UNCLAIMED';
        case 2:
            return 'RELEASED';
        default:
            return 'null';
    }
}

export const shortenMonth = (month: string): string => {
    const monthMap: { [key: string]: string } = {
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
};
export const formatDateToShort = (dateString: string): string => {
    // Parse the input string into a Date object
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date string");
    }

    // Force the year to the current year
    const currentYear = new Date().getFullYear();
    date.setFullYear(currentYear);
    
    // Format the date to "MMM DD" (e.g., "Apr 21")
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to reformat training schedule
export const reformatSchedule = (schedule: string): string => {
    // Regular expression to match different date formats
    const regex = /(?:\w+, )?(\w+ \d+)(?: (?:to|-) (?:\w+, )?(\w+ \d+))(?:, (\d{4}))?/;

    return schedule.replace(regex, (match, startDate, endDate, year) => {
        // Extract and shorten month names
        const [startMonth, startDay] = startDate.split(' ');
        const [endMonth, endDay] = endDate ? endDate.split(' ') : [startMonth, startDay];

        // Format result as "Sep 19 - Sep 21" or "Sep 19" if no end date
        const formattedStartDate = `${shortenMonth(startMonth)} ${startDay}`;
        const formattedEndDate = endDate ? `${shortenMonth(endMonth)} ${endDay}` : '';

        return endDate ? `${formattedStartDate} - ${formattedEndDate}` : formattedStartDate;
    });
}

export const reformatTrainingSched = (startD: string, endD: string): string => {
    const split_startD = startD.split(',')
    const split_endD = endD.split(',')

    const currDate = new Date()
    const currYear = currDate.getFullYear()

    if(endD === ''){
        return `${startD}, ${currYear}`
    } else {
        return `${split_startD[1]} - ${split_endD[1]}, ${split_startD[0]} - ${split_endD[0]}`
    }
}

export const validateEnrolledDates = (trainings: TRAINING[]): string | null => {
    if(!trainings || trainings.length === 0) return 'No trainings found.'

    const formatDate = (date: Date) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    const firstDate = formatDate(new Date(trainings[0].date_enrolled.toDate()))
    const allDatesMatch = trainings.every((training) => formatDate(training.date_enrolled.toDate()) === firstDate)
    return allDatesMatch ? firstDate : null
}