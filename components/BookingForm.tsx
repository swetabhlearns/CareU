'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';



export default function BookingForm({ serviceId }: { serviceId: string }) {
    const { user, authenticated, login } = usePrivy();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            serviceId,
            userId: user?.id,
            date: `${formData.get('date')}T${formData.get('time')}:00Z`,
            price: "0.000001", // Hardcoded for testing
            notes: formData.get('notes'),
            duration: formData.get('duration')
        };

        const toastId = toast.loading("Processing booking on blockchain...");

        try {
            const response = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Booking failed');

            toast.success("Booking Confirmed!", {
                id: toastId,
                description: `Transaction Hash: ${result.txHash.slice(0, 10)}...`,
            });

            // Wait a moment to show success message before redirecting
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (error: any) {
            toast.error("Booking Failed", {
                id: toastId,
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!authenticated) {
        return (
            <Card className="bg-secondary/30 border-none shadow-none">
                <CardContent className="pt-8 text-center pb-8">
                    <p className="text-primary mb-6 font-medium text-lg">Please login to book this service.</p>
                    <Button onClick={login} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-lg shadow-lg shadow-primary/20">
                        Login to Book
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none glass-panel overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/5 pb-6">
                <CardTitle className="font-heading font-bold text-2xl text-primary tracking-tight">Book Service</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-muted-foreground font-body font-medium">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                name="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 h-12 rounded-xl font-body"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time" className="text-muted-foreground font-body font-medium">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                name="time"
                                required
                                className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 h-12 rounded-xl font-body"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration" className="text-muted-foreground font-body font-medium">Duration</Label>
                        <Select name="duration" defaultValue="1">
                            <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 h-12 rounded-xl font-body">
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1" className="font-body">1 Hour</SelectItem>
                                <SelectItem value="2" className="font-body">2 Hours</SelectItem>
                                <SelectItem value="3" className="font-body">3 Hours</SelectItem>
                                <SelectItem value="4" className="font-body">4 Hours</SelectItem>
                                <SelectItem value="8" className="font-body">8 Hours (Full Day)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-muted-foreground font-body font-medium">Notes / Special Requirements</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Any specific instructions..."
                            className="resize-none bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 rounded-xl min-h-[100px] font-body"
                            rows={3}
                        />
                    </div>



                    <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-14 text-lg font-body font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                        {loading ? 'Processing on Blockchain...' : 'Confirm Booking'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
