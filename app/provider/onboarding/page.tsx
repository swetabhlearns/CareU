'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProviderOnboarding() {
    const { user, authenticated, login, ready } = usePrivy();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        if (ready && authenticated && user?.id) {
            checkExistingProvider();
        } else if (ready && !authenticated) {
            setCheckingStatus(false);
        }
    }, [ready, authenticated, user?.id]);

    const checkExistingProvider = async () => {
        console.log("Checking if user is provider...", user?.id);
        try {
            if (!user?.id) return;

            const { data, error } = await supabase
                .from('services')
                .select('id')
                .eq('provider_id', user.id)
                .maybeSingle(); // Use maybeSingle to avoid error if not found

            if (error) {
                console.error("Supabase check error:", error);
                // Don't alert here, just let them create profile if check fails? 
                // Or maybe alert to debug.
                // alert("Error checking provider status: " + error.message);
                setCheckingStatus(false);
                return;
            }

            if (data) {
                console.log("User is provider, redirecting...");
                router.push('/provider/dashboard');
            } else {
                console.log("User is not a provider yet.");
                setCheckingStatus(false);
            }
        } catch (error: any) {
            console.error("Check failed:", error);
            toast.error("Something went wrong checking your profile: " + error.message);
            setCheckingStatus(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (!user?.id) {
            toast.error("You must be logged in.");
            setLoading(false);
            return;
        }

        const formData = new FormData(e.currentTarget);
        const toastId = toast.loading("Creating service profile...");

        const newService = {
            provider_id: user.id,
            email: user.email?.address, // Send email to ensure user record is created
            name: formData.get('name'),
            type: formData.get('type'),
            hourly_rate: parseFloat(formData.get('rate') as string),
            description: formData.get('description'),
            image_url: `https://placehold.co/600x400?text=${encodeURIComponent(formData.get('name') as string)}`, // Placeholder for now
            availability: { mon: ["09:00", "17:00"] } // Default availability
        };

        try {
            const response = await fetch('/api/services/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newService),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Failed to create service');

            toast.success("Service Created Successfully!", {
                id: toastId,
            });
            setTimeout(() => router.push('/dashboard'), 2000);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create service", {
                id: toastId,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!ready || checkingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
                <Card className="max-w-md w-full glass-panel text-center p-8">
                    <h2 className="text-2xl font-heading font-bold mb-4">Become a Provider</h2>
                    <p className="text-muted-foreground mb-6">Login to offer your services on ChronicCare.</p>
                    <Button onClick={login} size="lg" className="w-full rounded-full">Login to Start</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

            <div className="container mx-auto max-w-2xl">
                <Card className="glass-panel border-white/10">
                    <CardHeader>
                        <CardTitle className="text-3xl font-heading font-bold text-center">Create Your Service Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Service Name (e.g., "Nurse Sarah")</Label>
                                <Input id="name" name="name" required className="bg-background/50 h-12 rounded-xl" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Service Type</Label>
                                    <Select name="type" required>
                                        <SelectTrigger className="bg-background/50 h-12 rounded-xl">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Nurse">Nurse</SelectItem>
                                            <SelectItem value="Driver">Driver</SelectItem>
                                            <SelectItem value="House Help">House Help</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rate">Hourly Rate ($)</Label>
                                    <Input id="rate" name="rate" type="number" min="0" step="0.01" required className="bg-background/50 h-12 rounded-xl" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description & Qualifications</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    required
                                    placeholder="Describe your experience, certifications, and what you offer..."
                                    className="bg-background/50 min-h-[120px] rounded-xl resize-none"
                                />
                            </div>



                            <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                {loading ? 'Creating Profile...' : 'Publish Service'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
