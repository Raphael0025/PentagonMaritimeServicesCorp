export interface Reminder_Agenda{
    id: string;
    agenda_type: string;
    actor: string | null;
    createdAt: Date;
    status: boolean;
    requester: string;
    totalUsers: number;
    purpose: string;
    course: string;
    startTime: Date;
    endTime: Date;
    selectedDate: Date;
    duration: string;
}
export interface Add_Reminder{
    agenda_type: string;
    actor: string | null;
    createdAt: Date;
    status: boolean;
    requester: string;
    totalUsers: number;
    purpose: string;
    course: string;
    startTime: Date | null;
    endTime: Date | null;
    selectedDate: Date | null;
    duration: string;
}

export interface Task_Agenda{

}