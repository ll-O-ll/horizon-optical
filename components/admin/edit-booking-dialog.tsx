"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { updateBookingDetails } from "@/app/actions/dashboard-actions"
import { formatInTimeZone, fromZonedTime } from "date-fns-tz"

const TIMEZONE = "America/New_York"

export function EditBookingDialog({
    booking,
    open,
    onOpenChange,
    onBookingUpdated
}: {
    booking: any,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    onBookingUpdated: () => void
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        date: "",
        startTime: "",
        endTime: "",
        serviceType: "",
        sessionType: ""
    })

    // Initialize form data when dialog opens or booking changes
    useEffect(() => {
        if (booking && open) {
            const startDate = new Date(booking.start_time)
            const endDate = new Date(booking.end_time)

            const dateStr = formatInTimeZone(startDate, TIMEZONE, "yyyy-MM-dd")
            const startTimeStr = formatInTimeZone(startDate, TIMEZONE, "HH:mm")
            const endTimeStr = formatInTimeZone(endDate, TIMEZONE, "HH:mm")

            setFormData({
                clientName: booking.client_name,
                clientEmail: booking.client_email,
                clientPhone: booking.client_phone || "",
                date: dateStr,
                startTime: startTimeStr,
                endTime: endTimeStr,
                serviceType: booking.service_type,
                sessionType: booking.session_type
            })
        }
    }, [booking, open])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        // Construct new date objects in Eastern Time
        const startDateTimeStr = `${formData.date} ${formData.startTime}:00`
        const endDateTimeStr = `${formData.date} ${formData.endTime}:00`

        const startDate = fromZonedTime(startDateTimeStr, TIMEZONE)
        const endDate = fromZonedTime(endDateTimeStr, TIMEZONE)

        if (endDate <= startDate) {
            toast.error("End time must be after start time")
            setIsLoading(false)
            return
        }

        const startIso = startDate.toISOString()
        const endIso = endDate.toISOString()

        const data = {
            clientName: formData.clientName,
            clientEmail: formData.clientEmail,
            clientPhone: formData.clientPhone,
            startTime: startIso,
            endTime: endIso,
            serviceType: formData.serviceType,
            sessionType: formData.sessionType,
        }

        const res = await updateBookingDetails(booking.id, data)

        if (res.success) {
            toast.success("Booking updated successfully")
            onOpenChange(false)
            onBookingUpdated()
        } else {
            toast.error("Failed to update booking")
        }

        setIsLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (!booking) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-xl">
                <form onSubmit={handleSubmit} autoComplete="off">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-lg text-foreground">Edit Appointment</DialogTitle>
                        <DialogDescription>
                            Modify details for {booking.client_name}'s consultation session.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 text-sm">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-clientName" className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</Label>
                            <Input id="edit-clientName" name="clientName" value={formData.clientName} onChange={handleChange} className="col-span-3 rounded-lg h-9 bg-background/50 border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-clientEmail" className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</Label>
                            <Input id="edit-clientEmail" name="clientEmail" type="email" value={formData.clientEmail} onChange={handleChange} className="col-span-3 rounded-lg h-9 bg-background/50 border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-clientPhone" className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</Label>
                            <Input id="edit-clientPhone" name="clientPhone" type="tel" value={formData.clientPhone} onChange={handleChange} className="col-span-3 rounded-lg h-9 bg-background/50 border-border" placeholder="e.g. 647-555-0199" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-date" className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</Label>
                            <Input 
                                id="edit-date" 
                                name="date" 
                                type="date" 
                                value={formData.date} 
                                onChange={handleChange} 
                                className="col-span-3 rounded-lg h-9 bg-background/50 border-border" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-startTime" className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Time</Label>
                            <Input id="edit-startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} className="col-span-3 rounded-lg h-9 bg-background/50 border-border" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-endTime" className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Time</Label>
                            <Input id="edit-endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} className="col-span-3 rounded-lg h-9 bg-background/50 border-border" required />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-serviceType" className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</Label>
                            <div className="col-span-3">
                                <Select name="serviceType" value={formData.serviceType} onValueChange={(val) => handleSelectChange('serviceType', val)} required>
                                    <SelectTrigger className="rounded-lg h-9 bg-background/50 border-border">
                                        <SelectValue placeholder="Select a service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="exam">Eye Exam ($105)</SelectItem>
                                        <SelectItem value="lens">CL Fitting ($30)</SelectItem>
                                        <SelectItem value="adjustment">Glasses Adjustment (Free)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-sessionType" className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</Label>
                            <div className="col-span-3">
                                <Select name="sessionType" value={formData.sessionType} onValueChange={(val) => handleSelectChange('sessionType', val)} required>
                                    <SelectTrigger className="rounded-lg h-9 bg-background/50 border-border">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in-person">In-Person</SelectItem>
                                        <SelectItem value="virtual">Virtual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading} className="rounded-full h-9 px-4">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="rounded-full h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/95">
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
