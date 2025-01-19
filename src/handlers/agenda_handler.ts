import Swal from 'sweetalert2'
import { Reminder_Agenda } from '@/types/agendas'
import { format } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

export const getDailyReminders = async (reminders: Reminder_Agenda[] | null) => {
    if(!reminders){return {remindersArr: []}}
    
    const curr_date = new Date();
    const curr_date_str = curr_date.toDateString(); // Get the date part as a string

    const remindersArr = reminders.filter(reminder => {
        const reminder_date = reminder.selectedDate instanceof Timestamp
            ? reminder.selectedDate.toDate()
            : reminder.selectedDate;
        const reminder_date_str = reminder_date.toDateString(); // Get the date part as a string
        return reminder_date_str === curr_date_str; // Compare the date parts as strings
    })
    return { remindersArr }
}