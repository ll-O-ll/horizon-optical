"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createAdminBooking } from "@/app/actions/dashboard-actions"
import { fromZonedTime, formatInTimeZone } from "date-fns-tz"

const TIMEZONE = "America/New_York"

export function AddBookingDialog({ onBookingAdded }: { onBookingAdded: () => void }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        date: "",
        startTime: "",
        endTime: "",
        serviceType: "exam",
        sessionType: "in-person"
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (!formData.date || !formData.startTime || !formData.endTime) {
            toast.error("Please fill in all date and time fields")
            return
        }

        setIsLoading(true)
        try {
            // Compose the date/time in Eastern Time regardless of browser TZ
            const startDateTimeStr = `${formData.date} ${formData.startTime}:00`
            const endDateTimeStr = `${formData.date} ${formData.endTime}:00`
            
            const startDate = fromZonedTime(startDateTimeStr, TIMEZONE)
            const endDate = fromZonedTime(endDateTimeStr, TIMEZONE)

            // Past appointment validation removed – admins can set past appointments

            if (endDate <= startDate) {
                toast.error("End time must be after start time")
                setIsLoading(false)
                return
            }

            const res = await createAdminBooking({
                clientName: formData.clientName,
                clientEmail: formData.clientEmail,
                clientPhone: formData.clientPhone,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                serviceType: formData.serviceType,
                sessionType: formData.sessionType,
            })

            if (res.success) {
                toast.success("Manual booking created successfully")
                setOpen(false)
                setFormData(prev => ({
                    ...prev,
                    date: "",
                    startTime: "",
                    endTime: ""
                }))
                onBookingAdded()
            } else {
                console.error("Server error creating booking:", res.error)
                toast.error(`Failed to create manual booking: ${res.error || "Unknown error"}`)
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error)
            toast.error("An unexpected error occurred while saving")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Add Manual Appointment</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit} autoComplete="off">
                    <DialogHeader>
                        <DialogTitle>Add Manual Appointment</DialogTitle>
                        <DialogDescription>
                            Block out time on your calendar for a client without requiring payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clientName" className="text-right">Name</Label>
                            <Input id="clientName" name="clientName" value={formData.clientName} onChange={handleInputChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clientEmail" className="text-right">Email</Label>
                            <Input id="clientEmail" name="clientEmail" type="email" value={formData.clientEmail} onChange={handleInputChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="clientPhone" className="text-right">Phone</Label>
                    <Input id="clientPhone" name="clientPhone" type="tel" value={formData.clientPhone} onChange={handleInputChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Date</Label>
                            <Input 
                                id="date" 
                                name="date" 
                                type="date" 
                                
                                value={formData.date} 
                                onChange={handleInputChange} 
                                className="col-span-3" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startTime" className="text-right">Start Time</Label>
                            <Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleInputChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endTime" className="text-right">End Time</Label>
                            <Input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleInputChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="serviceType" className="text-right">Service</Label>
                            <div className="col-span-3">
                                <Select name="serviceType" value={formData.serviceType} onValueChange={(val) => handleSelectChange('serviceType', val)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select service" />
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
                            <Label htmlFor="sessionType" className="text-right">Location</Label>
                            <div className="col-span-3">
                                <Select name="sessionType" value={formData.sessionType} onValueChange={(val) => handleSelectChange('sessionType', val)} required>
                                    <SelectTrigger>
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
                        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Appointment"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
