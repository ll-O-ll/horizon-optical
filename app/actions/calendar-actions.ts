"use server";

import { getBusySlots, getTimetableRulesData } from "@/lib/nhost";
import { availabilityRules as defaultAvailabilityRules } from "@/lib/availability";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "America/New_York";

export async function checkAvailability(dateStr: string) {
    try {
        const date = new Date(dateStr);

        // Check from the start of the selected day until the end of that day
        const searchStart = startOfDay(date);
        const searchEnd = endOfDay(addDays(date, 1));

        const [busyResult, rulesResult] = await Promise.all([
            getBusySlots(searchStart.toISOString(), searchEnd.toISOString()),
            getTimetableRulesData()
        ]);

        let busySlots = [];
        if (!busyResult.success) {
            console.error("Failed to fetch availability from Nhost");
        } else {
            busySlots = busyResult.busySlots;
        }

        let rules = rulesResult.success && rulesResult.rules && rulesResult.rules.length > 0 
            ? rulesResult.rules 
            : null;

        // If no rules in DB, format default local rules into the expected format
        if (!rules) {
            rules = [];
            Object.entries(defaultAvailabilityRules).forEach(([dayStr, blocks]) => {
                blocks.forEach(block => {
                    rules.push({
                        day_of_week: parseInt(dayStr, 10),
                        start_time: block.start,
                        end_time: block.end
                    });
                });
            });
        }

        return { busySlots, rules };
    } catch (error) {
        console.error("Error in checkAvailability action", error);
        return { busySlots: [], rules: [] };
    }
}
