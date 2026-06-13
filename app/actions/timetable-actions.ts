"use server";

import { getTimetableRulesData, upsertTimetableRulesData, TimetableRule } from "@/lib/nhost";
import { availabilityRules as defaultAvailabilityRules } from "@/lib/availability";

export async function getTimetableRules() {
    const result = await getTimetableRulesData();
    if (result.success && result.rules && result.rules.length > 0) {
        return { success: true, rules: result.rules };
    }
    
    // Fallback to default memory rules if none in DB (or if DB error)
    const fallbackRules: TimetableRule[] = [];
    Object.entries(defaultAvailabilityRules).forEach(([dayStr, blocks]) => {
        blocks.forEach(block => {
            fallbackRules.push({
                day_of_week: parseInt(dayStr, 10),
                start_time: block.start,
                end_time: block.end,
                interval_minutes: 60
            });
        });
    });
    
    return { success: true, rules: fallbackRules, isFallback: true };
}

export async function updateTimetableRules(rules: Omit<TimetableRule, 'id'>[]) {
    // Only pass day_of_week, start_time, end_time
    const rulesToInsert = rules.map(rule => ({
        day_of_week: rule.day_of_week,
        start_time: rule.start_time,
        end_time: rule.end_time,
        interval_minutes: rule.interval_minutes || 60
    }));
    
    const result = await upsertTimetableRulesData(rulesToInsert);
    return result;
}
