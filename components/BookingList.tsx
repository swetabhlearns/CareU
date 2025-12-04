'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Database } from '@/types/database';
import { getBookings } from '@/app/actions/getBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    services: Database['public']['Tables']['services']['Row'];
};

export default function BookingList() {
    const { user, authenticated } = usePrivy();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBookings() {
            if (!user?.id) return;

            const { success, data, error } = await getBookings(user.id);

            if (!success) {
                console.error('Error fetching bookings:', error);
            } else {
                setBookings((data as any) || []);
            }
            setLoading(false);
        }

        if (authenticated) {
            fetchBookings();
        } else if (!authenticated && !loading) {
            setLoading(false);
        }
    }, [user, authenticated]);

    if (!authenticated) {
        return <p>Please login to view your bookings.</p>;
    }

    if (loading) {
        return <p>Loading bookings...</p>;
    }

    if (bookings.length === 0) {
        return (
            <Card className="bg-secondary/30 border-none shadow-inner">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg font-medium">No bookings found.</p>
                    <p className="text-sm text-muted-foreground/80 mt-2">Your scheduled care appointments will appear here.</p>
                </CardContent>
            </Card>
        );
    }

    const confirmCompletion = async (bookingId: string) => {
        setActionLoading(bookingId);
        const toastId = toast.loading("Releasing funds...");

        try {
            const response = await fetch('/api/bookings/release', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success("Funds Released Successfully!", {
                id: toastId,
                description: `Transaction Hash: ${result.txHash.slice(0, 10)}...`,
            });

            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            toast.error("Failed to release funds", {
                id: toastId,
                description: error.message,
            });
            setActionLoading(null);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-stagger-1">
            {bookings.map((booking) => (
                <Card key={booking.id} className="group border-none glass-panel hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <CardHeader className="bg-secondary/20 border-b border-secondary/20 pb-4">
                        <div className="flex justify-between items-start">
                            <CardTitle className="font-heading font-bold text-xl text-primary line-clamp-1 tracking-tight">
                                {booking.services?.name || 'Service'}
                            </CardTitle>
                            <span className={`px-3 py-1 rounded-full text-xs font-body font-bold uppercase tracking-wider shadow-sm ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'in_review' ? 'bg-blue-100 text-blue-700' :
                                    booking.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                {booking.status === 'in_review' ? 'Action Required' : booking.status}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <span className="font-body font-medium">
                                {format(new Date(booking.scheduled_at), 'PPP')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                <Clock className="h-4 w-4" />
                            </div>
                            <span className="font-body font-medium">
                                {format(new Date(booking.scheduled_at), 'p')} ({booking.duration_hours}h)
                            </span>
                        </div>

                        {booking.status === 'in_review' && (
                            <div className="mt-4 pt-4 border-t border-border/40">
                                <p className="text-sm font-bold text-blue-500 mb-2">Provider marked as done.</p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            disabled={actionLoading === booking.id}
                                            className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white rounded-lg font-body font-bold transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                                        >
                                            {actionLoading === booking.id ? (
                                                <>Processing...</>
                                            ) : (
                                                "Confirm & Release Funds"
                                            )}
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="glass-panel border-white/10">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-heading text-xl">Confirm Job Completion?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-muted-foreground font-body">
                                                This action will permanently release the funds held in escrow to the provider.
                                                Only confirm if you are satisfied with the service.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-full font-body">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => confirmCompletion(booking.id)}
                                                className="bg-green-500 hover:bg-green-600 text-white rounded-full font-body font-bold"
                                            >
                                                Yes, Release Funds
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}

                        {booking.notes && (
                            <div className="mt-4 pt-4 border-t border-border/40">
                                <p className="text-sm text-muted-foreground italic line-clamp-2 font-body font-light">
                                    "{booking.notes}"
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
