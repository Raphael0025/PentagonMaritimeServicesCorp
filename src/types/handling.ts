// Function to generate a random four-digit number
export const generateUserCode = () => {
    return Math.floor(1000 + Math.random() * 9000);
};
    
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

export const formatTime = (time: string): string => {
    const [start, end] = time.split(' - ');
  
    const convertTo12Hour = (time: string) => {
      let [hours, minutes] = time.split(':').map(Number);
      const suffix = hours >= 12 ? 'p.m.' : 'a.m.';
      hours = hours % 12 || 12; // Convert 0 and 12 to 12
      return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
    };
  
    return `${convertTo12Hour(start)} - ${convertTo12Hour(end)}`;
}

export const formatDateToWords = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};

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