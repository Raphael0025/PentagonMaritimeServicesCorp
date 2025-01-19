

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
        case 2:
            return 'Acknowledged';
        case 3:
            return 'Enrolled';
        case 4:
            return 'On-Hold';
        case 5:
            return 'Pending';
        case 6:
            return 'Graduated';
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