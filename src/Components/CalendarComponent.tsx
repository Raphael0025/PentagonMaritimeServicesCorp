"use client"

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { Draggable, DropArg } from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';
import { Dialog, Transition } from '@headlessui/react'
import { EventSourceInput } from '@fullcalendar/core/index.js'


export default function CalendarComponent(){
    return(
        <div className='col-span-8 min-h-fit z-0'>
            <FullCalendar
            aspectRatio={1.5}
            contentHeight={500}
            fixedWeekCount={false}
            initialView={'dayGridMonth'}
            plugins={[
                dayGridPlugin,
                interactionPlugin,
                timeGridPlugin,
                listPlugin 
            ]}
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,dayGridDay,listWeek'
            }} 
            />
        </div>
    )
}