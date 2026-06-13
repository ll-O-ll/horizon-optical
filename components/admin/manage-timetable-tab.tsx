"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { getTimetableRules, updateTimetableRules } from "@/app/actions/timetable-actions";

type TimeBlock = {
    start_time: string;
    end_time: string;
    interval_minutes: number;
};

type DaySchedule = {
    day_of_week: number;
    blocks: TimeBlock[];
};

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

export function ManageTimetableTab() {
    const [schedule, setSchedule] = useState<DaySchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchRules = async () => {
        setIsLoading(true);
        try {
            const res = await getTimetableRules();
            if (res.success && res.rules) {
                // Group rules by day_of_week
                const grouped: DaySchedule[] = DAYS.map((_, index) => ({
                    day_of_week: index,
                    blocks: []
                }));

                res.rules.forEach((r: any) => {
                    const day = grouped.find(d => d.day_of_week === r.day_of_week);
                    if (day) {
                        day.blocks.push({ 
                            start_time: r.start_time, 
                            end_time: r.end_time,
                            interval_minutes: r.interval_minutes || 60
                        });
                    }
                });

                // Sort blocks by start time
                grouped.forEach(day => {
                    day.blocks.sort((a, b) => a.start_time.localeCompare(b.start_time));
                });

                setSchedule(grouped);
            } else {
                toast.error("Failed to load timetable rules.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while loading rules.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleAddBlock = (dayIndex: number) => {
        setSchedule(prev => prev.map(d => {
            if (d.day_of_week === dayIndex) {
                return {
                    ...d,
                    blocks: [...d.blocks, { start_time: "09:00", end_time: "17:00", interval_minutes: 60 }]
                };
            }
            return d;
        }));
    };

    const handleRemoveBlock = (dayIndex: number, blockIndex: number) => {
        setSchedule(prev => prev.map(d => {
            if (d.day_of_week === dayIndex) {
                return {
                    ...d,
                    blocks: d.blocks.filter((_, i) => i !== blockIndex)
                };
            }
            return d;
        }));
    };

    const handleUpdateBlock = (dayIndex: number, blockIndex: number, field: "start_time" | "end_time" | "interval_minutes", value: string | number) => {
        setSchedule(prev => prev.map(d => {
            if (d.day_of_week === dayIndex) {
                const newBlocks = [...d.blocks];
                newBlocks[blockIndex] = { ...newBlocks[blockIndex], [field]: value };
                return { ...d, blocks: newBlocks };
            }
            return d;
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const toastId = toast.loading("Saving availability rules...");

        try {
            // Flatten the schedule back to an array of rules
            const rulesToSave: any[] = [];
            schedule.forEach(day => {
                day.blocks.forEach(block => {
                    rulesToSave.push({
                        day_of_week: day.day_of_week,
                        start_time: block.start_time,
                        end_time: block.end_time,
                        interval_minutes: block.interval_minutes
                    });
                });
            });

            const res = await updateTimetableRules(rulesToSave);
            if (res.success) {
                toast.success("Availability updated successfully!", { id: toastId });
                await fetchRules();
            } else {
                toast.error("Failed to update availability.", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card className="border-border bg-card">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>Timetable {"&"} Availability</CardTitle>
                    <CardDescription>Configure your weekly repeatable availability blocks.</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Rules
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6">
                    {schedule.map((day) => (
                        <div key={day.day_of_week} className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start border-b border-border pb-6 last:border-0 last:pb-0">
                            <div className="w-32 font-medium text-foreground pt-2">
                                {DAYS[day.day_of_week]}
                            </div>

                            <div className="flex-1 space-y-3 w-full">
                                {day.blocks.length === 0 ? (
                                    <div className="text-sm text-muted-foreground py-2 px-3 bg-muted/30 rounded-md border border-dashed">
                                        Unavailable
                                    </div>
                                ) : (
                                    day.blocks.map((block, idx) => (
                                        <div key={idx} className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="time"
                                                    value={block.start_time}
                                                    onChange={(e) => handleUpdateBlock(day.day_of_week, idx, "start_time", e.target.value)}
                                                    className="w-[120px]"
                                                    required
                                                />
                                                <span className="text-muted-foreground">to</span>
                                                <Input
                                                    type="time"
                                                    value={block.end_time}
                                                    onChange={(e) => handleUpdateBlock(day.day_of_week, idx, "end_time", e.target.value)}
                                                    className="w-[120px]"
                                                    required
                                                />
                                                <select
                                                    className="flex h-10 w-[140px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={block.interval_minutes || 60}
                                                    onChange={(e) => handleUpdateBlock(day.day_of_week, idx, "interval_minutes", parseInt(e.target.value))}
                                                >
                                                    <option value={15}>15 min slots</option>
                                                    <option value={30}>30 min slots</option>
                                                    <option value={45}>45 min slots</option>
                                                    <option value={60}>60 min slots</option>
                                                </select>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemoveBlock(day.day_of_week, idx)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}

                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2 text-xs h-8"
                                    onClick={() => handleAddBlock(day.day_of_week)}
                                >
                                    <Plus className="h-3 w-3" /> Add Time Block
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end border-t border-border pt-6">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    );
}
