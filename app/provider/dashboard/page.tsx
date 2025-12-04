'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function ProviderDashboard() {
    const { user, authenticated, ready, login } = usePrivy();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (ready && authenticated && user?.id) {
            fetchJobs();
        }
    }, [ready, authenticated, user?.id]);

    const fetchJobs = async () => {
        try {
            const response = await fetch('/api/provider/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ providerId: user!.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch jobs');
            }

            setJobs(data.jobs || []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const markComplete = async (bookingId: string) => {
        setActionLoading(bookingId);
        const toastId = toast.loading("Marking job as done...");

        try {
            const response = await fetch('/api/provider/jobs/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    status: 'in_review',
                    providerId: user!.id
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success("Job marked as done!", {
                id: toastId,
                description: "Waiting for user confirmation.",
            });
            fetchJobs();
        } catch (error: any) {
            toast.error("Failed to update job", {
                id: toastId,
                description: error.message,
            });
        } finally {
            setActionLoading(null);
        }
    };

    if (!ready) return null;
    if (!authenticated) return <div className="pt-32 text-center"><Button onClick={login}>Login to View Jobs</Button></div>;

    return (
        <div className="min-h-screen bg-background pt-32 pb-12 px-6">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-4xl font-heading font-bold mb-2">Provider Dashboard</h1>
                <p className="text-muted-foreground mb-8">Manage your assigned jobs and track earnings.</p>

                {loading ? (
                    <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : jobs.length === 0 ? (
                    <Card className="glass-panel text-center p-12">
                        <p className="text-xl text-muted-foreground">No jobs assigned yet.</p>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {jobs.map((job) => (
                            <Card key={job.id} className="glass-panel border-white/10 overflow-hidden">
                                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold font-heading">{job.services.name}</h3>
                                            <Badge variant="outline" className={`
                                                ${job.status === 'confirmed' ? 'border-primary text-primary' : ''}
                                                ${job.status === 'in_review' ? 'border-blue-400 text-blue-400' : ''}
                                                ${job.status === 'completed' ? 'border-green-500 text-green-500' : ''}
                                            `}>
                                                {job.status === 'in_review' ? 'Waiting for User' : job.status}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {new Date(job.scheduled_at).toLocaleDateString()} at {new Date(job.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <span className="text-white/20">|</span>
                                            {job.duration_hours} Hours
                                        </p>
                                        <p className="text-sm text-white/60">
                                            Client: {job.users.name || job.users.email}
                                        </p>
                                        {job.notes && <p className="text-sm italic text-white/40">"{job.notes}"</p>}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 min-w-[140px]">
                                        <div className="text-2xl font-bold text-primary">${job.services.hourly_rate * job.duration_hours}</div>

                                        {job.status === 'confirmed' && (
                                            <Button
                                                onClick={() => markComplete(job.id)}
                                                disabled={actionLoading === job.id}
                                                className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                                            >
                                                {actionLoading === job.id ? <Loader2 className="animate-spin" /> : "Mark Done"}
                                            </Button>
                                        )}

                                        {job.status === 'in_review' && (
                                            <Button disabled variant="outline" className="w-full opacity-50 cursor-not-allowed">
                                                Pending Review
                                            </Button>
                                        )}

                                        {job.status === 'completed' && (
                                            <div className="flex items-center text-green-500 font-medium">
                                                <CheckCircle className="w-5 h-5 mr-2" /> Paid
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
