"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
    Activity, 
    Calendar as CalendarIcon, 
    FileText, 
    User, 
    MoreHorizontal, 
    CheckCircle2, 
    XCircle, 
    Clock,
    Sparkles,
    Search,
    SlidersHorizontal,
    Trash2,
    Edit,
    CalendarX,
    UserCheck,
    AlertCircle
} from "lucide-react"
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

const TIMEZONE = "America/New_York"

export default function DashboardPage() {
    const [bookings, setBookings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingBooking, setEditingBooking] = useState<any>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("")
    const [serviceFilter, setServiceFilter] = useState("all")
    const [paymentFilter, setPaymentFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

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

    // Roster filtering logic
    const filteredBookings = bookings.filter(b => {
        const name = b.client_name?.toLowerCase() || ""
        const email = b.client_email?.toLowerCase() || ""
        const query = searchTerm.toLowerCase()
        const matchesSearch = name.includes(query) || email.includes(query)
        const matchesService = serviceFilter === "all" || b.service_type === serviceFilter
        const matchesPayment = paymentFilter === "all" || b.payment_status === paymentFilter
        const matchesStatus = statusFilter === "all" || b.status === statusFilter
        return matchesSearch && matchesService && matchesPayment && matchesStatus
    })

    const getInitials = (name: string) => {
        if (!name) return "P"
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    const renderServiceBadge = (service: string, session: string) => {
        switch (service) {
            case "exam":
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5" />
                        Eye Exam <span className="text-[10px] opacity-75 font-normal">({session === 'in-person' ? 'In-Person' : 'Virtual'})</span>
                    </Badge>
                )
            case "lens":
                return (
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        CL Fitting <span className="text-[10px] opacity-75 font-normal">({session === 'in-person' ? 'In-Person' : 'Virtual'})</span>
                    </Badge>
                )
            case "adjustment":
                return (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20 px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Adjustment <span className="text-[10px] opacity-75 font-normal">({session === 'in-person' ? 'In-Person' : 'Virtual'})</span>
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="bg-muted text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                        {service}
                    </Badge>
                )
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
            {/* Staff Header Topbar */}
            <div className="border-b border-border bg-card shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="font-serif text-lg sm:text-xl font-bold tracking-tight text-primary truncate pr-2">
                        HORIZON OPTICAL <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-primary/10 ml-2">STAFF PORTAL</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
                {/* Greeting banner */}
                <div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight mb-2">Clinic Dashboard</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Streamlined scheduler, designer catalog customize dashboard, and patient portals resource management.</p>
                </div>

                {/* Dashboard statistics panel */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Statistic 1: Next Appointment */}
                    <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-3 top-3 h-24 w-24 text-primary/5 group-hover:scale-110 transition-transform">
                            <CalendarIcon className="h-full w-full" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next Consultation</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent className="pt-2">
                            {nextSession ? (
                                <div className="space-y-1">
                                    <div className="text-lg sm:text-xl font-bold text-foreground truncate">
                                        {formatInTimeZone(new Date(nextSession.start_time), TIMEZONE, "MMM d, h:mm a")}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                        {nextSession.client_name}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-muted-foreground text-sm py-1">No upcoming appointments</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistic 2: Pending Payments */}
                    <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-3 top-3 h-24 w-24 text-amber-500/5 group-hover:scale-110 transition-transform">
                            <AlertCircle className="h-full w-full" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Billing</CardTitle>
                            <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
                        </CardHeader>
                        <CardContent className="pt-1">
                            <div className="text-3xl font-extrabold text-foreground">
                                {bookings.filter(b => b.payment_status === "pending" && b.status !== "cancelled").length}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">Direct billing or clinic payment required</p>
                        </CardContent>
                    </Card>

                    {/* Statistic 3: Unique Patients */}
                    <Card className="bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-3 top-3 h-24 w-24 text-indigo-500/5 group-hover:scale-110 transition-transform">
                            <UserCheck className="h-full w-full" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Patients</CardTitle>
                            <User className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent className="pt-1">
                            <div className="text-3xl font-extrabold text-foreground">
                                {new Set(bookings.map(b => b.client_email)).size}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">Unique patients registered in clinic</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard tab container */}
                <Tabs defaultValue="showcase" className="space-y-6">
                    {/* Navigation Tab Bar - Scrollable on mobile, Grid on desktop */}
                    <div className="bg-muted/30 p-1.5 rounded-xl border border-border/80">
                        <TabsList className="flex w-full overflow-x-auto justify-start border-0 bg-transparent p-0 pb-2 gap-1 md:pb-0 md:grid md:grid-cols-5 md:h-11 tabs-scrollbar">
                            <TabsTrigger 
                                value="showcase" 
                                className="flex-1 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                <Sparkles className="h-4 w-4" />
                                <span>Showcase</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="overview" 
                                className="flex-1 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                <FileText className="h-4 w-4" />
                                <span>Overview</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="schedule" 
                                className="flex-1 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                <CalendarIcon className="h-4 w-4" />
                                <span>Schedule</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="timetable" 
                                className="flex-1 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                <Clock className="h-4 w-4" />
                                <span>Timetable</span>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="resources" 
                                className="flex-1 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                <User className="h-4 w-4" />
                                <span>Resources</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* TAB CONTENT: Showcase Customizer */}
                    <TabsContent value="showcase" className="mt-0 outline-none">
                        <ManageShowcaseTab />
                    </TabsContent>

                    {/* TAB CONTENT: Overview (Roster Table) */}
                    <TabsContent value="overview" className="mt-0 outline-none">
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-5">
                                <div>
                                    <CardTitle className="text-xl">Appointment Roster</CardTitle>
                                    <CardDescription>Manage, search, and edit clinic consultations and billing statuses.</CardDescription>
                                </div>
                                <AddBookingDialog onBookingAdded={fetchBookings} />
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {/* Search and Filter Header Bar */}
                                <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-muted/20 p-3 rounded-lg border border-border/40">
                                    <div className="relative w-full lg:w-96">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search client by name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/60"
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                            <SlidersHorizontal className="h-3.5 w-3.5" />
                                            <span>Filters:</span>
                                        </div>
                                        <select
                                            value={serviceFilter}
                                            onChange={(e) => setServiceFilter(e.target.value)}
                                            className="h-8 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="all">All Services</option>
                                            <option value="exam">Eye Exam</option>
                                            <option value="lens">CL Fitting</option>
                                            <option value="adjustment">Glasses Adjustment</option>
                                        </select>
                                        <select
                                            value={paymentFilter}
                                            onChange={(e) => setPaymentFilter(e.target.value)}
                                            className="h-8 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="all">All Payments</option>
                                            <option value="paid">Paid</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="h-8 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="pending">Pending</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        {(searchTerm || serviceFilter !== "all" || paymentFilter !== "all" || statusFilter !== "all") && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSearchTerm("")
                                                    setServiceFilter("all")
                                                    setPaymentFilter("all")
                                                    setStatusFilter("all")
                                                }}
                                                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                                            >
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                                        <span>Loading clinic roster...</span>
                                    </div>
                                ) : filteredBookings.length === 0 ? (
                                    <div className="py-12 text-center border rounded-xl border-dashed border-border/80 text-muted-foreground bg-muted/5">
                                        <CalendarX className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
                                        <p className="font-semibold text-foreground mb-1">No appointments found</p>
                                        <p className="text-xs max-w-sm mx-auto">Try adjusting your filters or search query, or add a manual appointment.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-border/60">
                                        <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/40 text-muted-foreground/80">
                                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Patient</th>
                                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Date & Time (ET)</th>
                                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Service</th>
                                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-center">Payment</th>
                                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                                                    <th className="p-4 w-12"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredBookings.map((booking) => {
                                                    const initials = getInitials(booking.client_name)
                                                    return (
                                                        <tr key={booking.id} className={`border-b border-border last:border-0 hover:bg-muted/10 transition-colors ${booking.status === "cancelled" ? "opacity-50" : ""}`}>
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shadow-sm">
                                                                        {initials}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-foreground">{booking.client_name}</div>
                                                                        <div className="text-xs text-muted-foreground font-mono">{booking.client_email}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 font-medium">
                                                                <div>{formatInTimeZone(new Date(booking.start_time), TIMEZONE, "MMM d, yyyy")}</div>
                                                                <div className="text-xs text-muted-foreground mt-0.5">{formatInTimeZone(new Date(booking.start_time), TIMEZONE, "h:mm a")} - {formatInTimeZone(new Date(booking.end_time), TIMEZONE, "h:mm a")}</div>
                                                            </td>
                                                            <td className="p-4">
                                                                {renderServiceBadge(booking.service_type, booking.session_type)}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <Badge variant="outline" className={booking.payment_status === "paid" ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1" : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"}>
                                                                    {booking.payment_status === "paid" ? <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" /> : <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400 animate-pulse" />}
                                                                    <span className="capitalize">{booking.payment_status}</span>
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <Badge variant="outline" className={booking.status === "cancelled" ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1" : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"}>
                                                                    {booking.status === "cancelled" ? <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" /> : <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                                                                    <span className="capitalize">{booking.status}</span>
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full">
                                                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-52">
                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                        <DropdownMenuSeparator />
                                                                        {booking.payment_status === "pending" && (
                                                                            <DropdownMenuItem onClick={() => handlePaymentChange(booking.id, "paid")} className="cursor-pointer">
                                                                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                                                                Mark as Paid
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuItem onClick={() => setEditingBooking(booking)} className="cursor-pointer">
                                                                            <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                            Edit Details
                                                                        </DropdownMenuItem>
                                                                        {booking.status !== "cancelled" && (
                                                                            <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "cancelled")} className="text-amber-600 cursor-pointer">
                                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                                Cancel Appointment
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuItem onClick={() => handleDelete(booking.id)} className="text-destructive cursor-pointer">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete Booking
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB CONTENT: Schedule (Timeline / Calendar View) */}
                    <TabsContent value="schedule" className="mt-0 outline-none">
                        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
                            {/* Calendar selection block */}
                            <Card className="p-4 shadow-sm border border-border/80 bg-card w-full max-w-sm mx-auto md:mx-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md"
                                />
                            </Card>

                            {/* Chronological Daily Timeline */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                    <h3 className="text-xl font-semibold font-serif text-foreground">
                                        {selectedDate ? formatInTimeZone(selectedDate, TIMEZONE, "EEEE, MMMM do, yyyy") : "Select a date"}
                                    </h3>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary font-medium text-xs rounded-full px-3 py-1">
                                        {bookingsForSelectedDate.length} {bookingsForSelectedDate.length === 1 ? "Appointment" : "Appointments"}
                                    </Badge>
                                </div>

                                {bookingsForSelectedDate.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-dashed border-border/80 text-center">
                                        <CalendarX className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                        <h4 className="text-base font-semibold text-foreground mb-1">No Consultations Scheduled</h4>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            There are no appointments scheduled for this date. You can register manual client entries on the "Overview" page.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative pl-6 border-l-2 border-primary/20 ml-3.5 space-y-6">
                                        {bookingsForSelectedDate.map(booking => {
                                            const isCancelled = booking.status === 'cancelled'
                                            return (
                                                <div key={booking.id} className="relative group">
                                                    {/* Timeline node */}
                                                    <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center transition-all group-hover:scale-125 ${isCancelled ? 'bg-muted-foreground' : 'bg-primary shadow-sm'}`} />
                                                    
                                                    <Card className={`transition-all hover:border-primary/30 hover:shadow-sm ${isCancelled ? 'opacity-65 bg-muted/5 border-dashed' : 'bg-card border-border/80'}`}>
                                                        <CardContent className="p-5">
                                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        <span>
                                                                            {formatInTimeZone(new Date(booking.start_time), TIMEZONE, "h:mm a")} - {formatInTimeZone(new Date(booking.end_time), TIMEZONE, "h:mm a")} ET
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="font-semibold text-lg text-foreground tracking-tight">{booking.client_name}</h4>
                                                                    <p className="text-sm text-muted-foreground font-mono">{booking.client_email}</p>
                                                                    {booking.client_phone && (
                                                                        <p className="text-xs text-muted-foreground mt-0.5">Phone: {booking.client_phone}</p>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-col items-start sm:items-end gap-2">
                                                                    <div className="flex gap-2">
                                                                        <Badge variant="outline" className={booking.status === "cancelled" ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold" : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold"}>
                                                                            <span className="capitalize">{booking.status}</span>
                                                                        </Badge>
                                                                        <Badge variant="outline" className={booking.payment_status === "paid" ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold" : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold"}>
                                                                            <span className="capitalize">{booking.payment_status}</span>
                                                                        </Badge>
                                                                    </div>
                                                                    <span className="text-sm font-semibold capitalize text-primary flex items-center gap-1.5 mt-1">
                                                                        {booking.service_type === 'exam' && <Activity className="h-3.5 w-3.5" />}
                                                                        {booking.service_type === 'lens' && <Sparkles className="h-3.5 w-3.5" />}
                                                                        {booking.service_type === 'adjustment' && <Clock className="h-3.5 w-3.5" />}
                                                                        {booking.service_type === 'exam' ? 'Eye Exam' : booking.service_type === 'lens' ? 'CL Fitting' : 'Adjustment'}
                                                                        <span className="text-xs text-muted-foreground font-normal">({booking.session_type === 'in-person' ? 'In-Person' : 'Virtual'})</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* TAB CONTENT: Timetable (Availability Rules) */}
                    <TabsContent value="timetable" className="mt-0 outline-none">
                        <ManageTimetableTab />
                    </TabsContent>

                    {/* TAB CONTENT: Resources Management */}
                    <TabsContent value="resources" className="mt-0 outline-none">
                        <ManageResourcesTab />
                    </TabsContent>
                </Tabs>

                {/* Edit details dialog overlay */}
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
