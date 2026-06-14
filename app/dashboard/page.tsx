"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Calendar as CalendarIcon, Dumbbell, FileText, User, MoreHorizontal, CheckCircle2, XCircle, Clock } from "lucide-react"
import React, { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
    getDashboardBookings,
    updateBookingStatus,
    updatePaymentStatus,
} from "@/app/actions/dashboard-actions"
import { formatInTimeZone } from "date-fns-tz"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { AddBookingDialog } from "@/components/admin/add-booking-dialog"
import { EditBookingDialog } from "@/components/admin/edit-booking-dialog"
import { ManageResourcesTab } from "@/components/admin/manage-resources-tab"
import { ManageTimetableTab } from "@/components/admin/manage-timetable-tab"
import { ManageShowcaseTab } from "@/components/admin/manage-showcase-tab"
import { Trash2, Edit } from "lucide-react"

const TIMEZONE = "America/New_York"

export default function DashboardPage() {
    const [bookings, setBookings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingBooking, setEditingBooking] = useState<any>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    const fetchBookings = async () => {
        setIsLoading(true)
        const res = await getDashboardBookings()
        if (res.success) {
            setBookings(res.bookings)
        } else {
            toast.error("Failed to load bookings")
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    const handleStatusChange = async (id: string, newStatus: string) => {
        const toastId = toast.loading("Updating status...")
        const res = await updateBookingStatus(id, newStatus)
        if (res.success) {
            toast.success("Status updated", { id: toastId })
            fetchBookings()
        } else {
            toast.error("Failed to update status", { id: toastId })
        }
    }

    const handlePaymentChange = async (id: string, newStatus: string) => {
        const toastId = toast.loading("Updating payment...")
        const res = await updatePaymentStatus(id, newStatus)
        if (res.success) {
            toast.success("Payment marked as received", { id: toastId })
            fetchBookings()
        } else {
            toast.error("Failed to update payment", { id: toastId })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this booking?")) return

        const toastId = toast.loading("Deleting booking...")
        const { deleteBooking } = await import("@/app/actions/dashboard-actions")
        const res = await deleteBooking(id)
        if (res.success) {
            toast.success("Booking deleted successfully", { id: toastId })
            fetchBookings()
        } else {
            toast.error("Failed to delete booking", { id: toastId })
        }
    }

    const upcomingBookings = bookings.filter(b => new Date(b.start_time) > new Date() && b.status !== "cancelled")
    const nextSession = upcomingBookings.length > 0 ? upcomingBookings[upcomingBookings.length - 1] : null

    // Helper: format a date as YYYY-MM-DD in eastern time to compare days reliably
    const getDayString = (date: Date) => formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd")

    const selectedDateString = selectedDate ? getDayString(selectedDate) : ""
    const bookingsForSelectedDate = bookings.filter(b =>
        selectedDate && getDayString(new Date(b.start_time)) === selectedDateString
    ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
            {/* Sidebar/Nav (Simplified as top bar for now) */}
            <div className="border-b border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="font-serif text-lg sm:text-xl font-bold text-primary truncate pr-2">HORIZON OPTICAL <span className="hidden sm:inline">— STAFF</span></div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4 sm:p-8">
                <h1 className="text-3xl font-serif font-bold mb-2">Horizon Optical Admin Portal</h1>
                <p className="text-muted-foreground mb-8">Manage designer showcase, patient appointments, and clinic schedules.</p>

                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            {nextSession ? (
                                <>
                                    <div className="text-xl font-bold truncate">
                                        {formatInTimeZone(new Date(nextSession.start_time), TIMEZONE, "MMM d, h:mm a")}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{nextSession.client_name}</p>
                                </>
                            ) : (
                                <div className="text-muted-foreground text-sm">No upcoming appointments</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{bookings.filter(b => b.payment_status === "pending" && b.status !== "cancelled").length}</div>
                            <p className="text-xs text-muted-foreground">Appointments awaiting direct billing or clinic payment</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(bookings.map(b => b.client_email)).size}</div>
                            <p className="text-xs text-muted-foreground">Unique emails registered</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="showcase" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="showcase">Showcase Customizer</TabsTrigger>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="timetable">Timetable</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <Card className="border-border bg-card">
                            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle>Appointment Roster</CardTitle>
                                    <CardDescription>All your scheduled consultations and their payment/billing statuses.</CardDescription>
                                </div>
                                <AddBookingDialog onBookingAdded={fetchBookings} />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="py-8 text-center text-muted-foreground">Loading roster...</div>
                                ) : bookings.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">No appointments found.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                                                    <th className="p-3 font-medium">Client</th>
                                                    <th className="p-3 font-medium">Date & Time (ET)</th>
                                                    <th className="p-3 font-medium">Service</th>
                                                    <th className="p-3 font-medium text-center">Payment</th>
                                                    <th className="p-3 font-medium text-center">Status</th>
                                                    <th className="p-3 font-medium"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookings.map((booking) => (
                                                    <tr key={booking.id} className={`border-b border-border last:border-0 hover:bg-muted/20 ${booking.status === "cancelled" ? "opacity-50" : ""}`}>
                                                        <td className="p-3">
                                                            <div className="font-semibold text-foreground">{booking.client_name}</div>
                                                            <div className="text-xs text-muted-foreground">{booking.client_email}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div>{formatInTimeZone(new Date(booking.start_time), TIMEZONE, "MMM d, yyyy")}</div>
                                                            <div className="text-muted-foreground">{formatInTimeZone(new Date(booking.start_time), TIMEZONE, "h:mm a")} - {formatInTimeZone(new Date(booking.end_time), TIMEZONE, "h:mm a")}</div>
                                                        </td>
                                                        <td className="p-3 capitalize">{booking.service_type} ({booking.session_type})</td>
                                                        <td className="p-3 text-center">
                                                            <Badge variant={booking.payment_status === "paid" ? "default" : "secondary"} className={booking.payment_status === "paid" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"}>
                                                                {booking.payment_status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Badge variant={booking.status === "cancelled" ? "destructive" : "outline"}>
                                                                {booking.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    {booking.payment_status === "pending" && (
                                                                        <DropdownMenuItem onClick={() => handlePaymentChange(booking.id, "paid")}>
                                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                                            Mark as Paid (E-Transfer Rcvd)
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem onClick={() => setEditingBooking(booking)}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit Details
                                                                    </DropdownMenuItem>
                                                                    {booking.status !== "cancelled" && (
                                                                        <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "cancelled")} className="text-amber-600">
                                                                            <XCircle className="mr-2 h-4 w-4" />
                                                                            Cancel Appointment
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem onClick={() => handleDelete(booking.id)} className="text-destructive">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete Permanently
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="schedule">
                        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
                            <Card className="p-3 w-fit mx-auto md:mx-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md"
                                />
                            </Card>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold font-serif">
                                    {selectedDate ? formatInTimeZone(selectedDate, TIMEZONE, "EEEE, MMMM do, yyyy") : "Select a date"}
                                </h3>

                                {bookingsForSelectedDate.length === 0 ? (
                                    <div className="p-8 text-center bg-card rounded-lg border border-dashed">
                                        <p className="text-muted-foreground">No bookings on this date.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {bookingsForSelectedDate.map(booking => (
                                            <Card key={booking.id} className={`p-4 ${booking.status === 'cancelled' ? 'opacity-50' : ''}`}>
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Clock className="w-4 h-4 text-primary" />
                                                            <span className="font-medium">
                                                                {formatInTimeZone(new Date(booking.start_time), TIMEZONE, "h:mm a")} - {formatInTimeZone(new Date(booking.end_time), TIMEZONE, "h:mm a")} ET
                                                            </span>
                                                        </div>
                                                        <h4 className="font-semibold text-lg">{booking.client_name}</h4>
                                                        <p className="text-sm text-muted-foreground">{booking.client_email}</p>
                                                    </div>

                                                    <div className="flex flex-col items-start sm:items-end gap-2">
                                                        <div className="flex gap-2">
                                                            <Badge variant={booking.status === "cancelled" ? "destructive" : "outline"}>
                                                                {booking.status}
                                                            </Badge>
                                                            <Badge variant={booking.payment_status === "paid" ? "default" : "secondary"} className={booking.payment_status === "paid" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}>
                                                                {booking.payment_status}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-sm font-medium capitalize text-primary">{booking.service_type} ({booking.session_type})</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="timetable">
                        <ManageTimetableTab />
                    </TabsContent>

                    <TabsContent value="resources">
                        <ManageResourcesTab />
                    </TabsContent>

                    <TabsContent value="showcase">
                        <ManageShowcaseTab />
                    </TabsContent>
                </Tabs>

                <EditBookingDialog
                    booking={editingBooking}
                    open={!!editingBooking}
                    onOpenChange={(open) => !open && setEditingBooking(null)}
                    onBookingUpdated={fetchBookings}
                />
            </main>
        </div>
    )
}
