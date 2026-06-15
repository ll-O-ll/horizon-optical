"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Loader2, Save, Clock, Calendar } from "lucide-react";
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
            <div className="flex justify-center items-center py-20 bg-card border rounded-xl border-border/85 shadow-sm">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Loading clinic timetable...</p>
                </div>
            </div>
        );
    }

    return (
        <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-5">
                <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-serif">
                        <Clock className="h-5 w-5 text-primary" />
                        Timetable {"&"} Availability
                    </CardTitle>
                    <CardDescription>Configure repeatable weekly hours and consultation slots for Horizon Optical.</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-sm font-medium h-9 px-4 rounded-full">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Rules
                </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="divide-y divide-border/50">
                    {schedule.map((day) => {
                        const hasBlocks = day.blocks.length > 0;
                        return (
                            <div key={day.day_of_week} className="flex flex-col md:grid md:grid-cols-12 gap-4 py-6 first:pt-0 last:pb-0 items-start">
                                {/* Weekday indicator & status badge */}
                                <div className="md:col-span-3 space-y-1.5 pt-1">
                                    <div className="font-semibold text-base text-foreground">
                                        {DAYS[day.day_of_week]}
                                    </div>
                                    <div>
                                        {hasBlocks ? (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/15 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                Closed
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Availability block inputs */}
                                <div className="md:col-span-9 space-y-4 w-full">
                                    {!hasBlocks ? (
                                        <div className="text-xs text-muted-foreground py-2 px-3 bg-muted/20 rounded-lg border border-dashed border-border/50 max-w-md">
                                            Unavailable for bookings on this day.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {day.blocks.map((block, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    {/* Unified Time Pill Row */}
                                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-background border border-border/70 p-2 rounded-xl shadow-sm">
                                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-muted/40 rounded-lg text-primary text-xs font-medium">
                                                            <Clock className="h-3.5 w-3.5" />
                                                        </div>
                                                        <Input
                                                            type="time"
                                                            value={block.start_time}
                                                            onChange={(e) => handleUpdateBlock(day.day_of_week, idx, "start_time", e.target.value)}
                                                            className="w-[90px] h-7 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 bg-transparent shadow-none"
                                                            required
                                                        />
                                                        <span className="text-xs text-muted-foreground/80 font-medium px-0.5">to</span>
                                                        <Input
                                                            type="time"
                                                            value={block.end_time}
                                                            onChange={(e) => handleUpdateBlock(day.day_of_week, idx, "end_time", e.target.value)}
                                                            className="w-[90px] h-7 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 bg-transparent shadow-none"
                                                            required
                                                        />
                                                        <span className="h-4 w-px bg-border/80 mx-1.5 hidden sm:block" />
                                                        <select
                                                            className="flex h-7 w-[110px] items-center justify-between rounded-md bg-transparent border-0 px-1 text-xs font-semibold text-primary focus:outline-none focus:ring-0"
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
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 transition-colors cursor-pointer"
                                                        onClick={() => handleRemoveBlock(day.day_of_week, idx)}
                                                        title="Remove time block"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2 text-xs h-8 px-3 rounded-full hover:bg-primary/5 hover:text-primary transition-all font-medium border-border/80"
                                        onClick={() => handleAddBlock(day.day_of_week)}
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Add Time Block
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
            <CardFooter className="bg-muted/15 flex justify-end border-t border-border/60 pt-6 pb-6 pr-6">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-sm font-medium h-10 px-5 rounded-full">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    );
}
