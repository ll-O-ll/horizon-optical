import { addMinutes, addDays, startOfDay, format, isBefore, isAfter, parseISO, setHours, setMinutes } from 'date-fns';
import { toZonedTime, formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/New_York'; // GMT-05:00 Eastern Time - Toronto

export interface TimeSlot {
    startTime: Date;
    endTime: Date;
    formattedTime: string; // e.g. "9:00 AM"
    isAvailable: boolean;
}

export interface BusySlot {
    startTime: string; // ISO String
    endTime: string;   // ISO String
}

// Helper to parse "HH:mm" strings to dates within a specific day (in Eastern Time)
// Note: `fromZonedTime` inherently accounts for Daylight Saving Time (e.g. EDT vs EST).
// For example, on March 8th (DST transition), 6 PM EST logically becomes 6 PM EDT (UTC-4).
function createDateFromTime(day: Date, timeStr: string): Date {
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const d = String(day.getDate()).padStart(2, '0');

    const localString = `${year}-${month}-${d} ${timeStr}:00`;
    return fromZonedTime(localString, TIMEZONE);
}

// 0: Sunday, 1: Monday, ..., 6: Saturday
export const availabilityRules: Record<number, { start: string; end: string }[]> = {
    0: [{ start: '07:00', end: '22:00' }], // Sun: 7am - 10pm
    1: [
        { start: '07:00', end: '09:00' }, // Mon: 7am - 9am
        { start: '17:00', end: '19:00' }  // Mon: 5pm - 7pm
    ],
    2: [
        { start: '07:00', end: '09:00' }, // Tue: 7am - 9am
        { start: '17:00', end: '19:00' }  // Tue: 5pm - 7pm
    ],
    3: [
        { start: '07:00', end: '09:00' }, // Wed: 7am - 9am
        { start: '19:00', end: '22:00' }  // Wed: 7pm - 10pm
    ],
    4: [
        { start: '07:00', end: '09:00' }, // Thu: 7am - 9am
        { start: '19:00', end: '22:00' }  // Thu: 7pm - 10pm
    ],
    5: [
        { start: '07:00', end: '09:00' }, // Fri: 7am - 9am
        { start: '17:00', end: '22:00' }  // Fri: 5pm - 10pm
    ],
    6: [{ start: '07:00', end: '22:00' }]  // Sat: 7am - 10pm
};

export function getAvailableSlots(date: Date, busySlots: BusySlot[] = [], dbRules: any[] = []): TimeSlot[] {
    // The calendar picker returns a local Date representing midnight on the chosen day.
    // We treat its YYYY-MM-DD as the intended day in the Eastern Timezone.
    const dayOfWeek = date.getDay();
    
    // Map dbRules into the expected structure if provided, else rely on availabilityRules fallback
    let rulesForDay: { start: string, end: string, interval_minutes: number }[] = [];
    if (dbRules && dbRules.length > 0) {
        rulesForDay = dbRules
            .filter(r => r.day_of_week === dayOfWeek)
            .map(r => ({ start: r.start_time, end: r.end_time, interval_minutes: r.interval_minutes || 60 }));
    } else {
        rulesForDay = (availabilityRules[dayOfWeek] || []).map(r => ({ ...r, interval_minutes: 60 }));
    }


    let slots: TimeSlot[] = [];
    const now = new Date(); // To ensure we don't book in the past

    for (const rule of rulesForDay) {
        let currentSlotStart = createDateFromTime(date, rule.start);
        const ruleEnd = createDateFromTime(date, rule.end);
        const interval = rule.interval_minutes || 60;

        // Generate slots
        while (addMinutes(currentSlotStart, 60) <= ruleEnd) {
            const currentSlotEnd = addMinutes(currentSlotStart, 60);

            // Only add if it's in the future (plus a 1-hour buffer so they can't book right now)
            if (isAfter(currentSlotStart, addMinutes(now, 60))) {

                // Check if this slot overlaps with any busy slots from the database
                const isOverlapping = busySlots.some((busy) => {
                    const busyStart = new Date(busy.startTime);
                    const busyEnd = new Date(busy.endTime);
                    // Overlap happens if (SlotStart < BusyEnd) && (SlotEnd > BusyStart)
                    return currentSlotStart < busyEnd && currentSlotEnd > busyStart;
                });

                if (!isOverlapping) {
                    slots.push({
                        startTime: currentSlotStart,
                        endTime: currentSlotEnd,
                        formattedTime: formatInTimeZone(currentSlotStart, TIMEZONE, 'h:mm a'),
                        isAvailable: true
                    });
                }
            }
            // Move to the next slot according to the customized interval spacing
            currentSlotStart = addMinutes(currentSlotStart, interval);
        }
    }

    return slots;
}
