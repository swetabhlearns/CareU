import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export default async function ServiceDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { data: service, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single() as any;

    if (error || !service) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background py-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-secondary/20 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/3 -translate-y-1/3"></div>

            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Image Section */}
                    <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl animate-reveal">
                        {service.image_url ? (
                            <img
                                src={service.image_url}
                                alt={service.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-secondary/30 text-muted-foreground">
                                No Image Available
                            </div>
                        )}
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold text-primary shadow-md uppercase tracking-wider">
                            {service.type}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-center animate-stagger-1">
                        <Link
                            href="/services"
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mb-6"
                        >
                            ← Back to Services
                        </Link>

                        <h1 className="text-5xl font-serif font-bold text-primary mb-4 leading-tight">{service.name}</h1>
                        <p className="text-3xl font-bold text-accent mb-8">
                            ${service.hourly_rate}<span className="text-lg text-muted-foreground font-normal">/hr</span>
                        </p>

                        <div className="prose prose-lg prose-headings:font-serif prose-p:text-muted-foreground max-w-none mb-10">
                            {service.description}
                        </div>

                        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 mb-10">
                            <h3 className="text-lg font-serif font-bold mb-4 text-primary">Availability</h3>
                            <div className="flex flex-wrap gap-3">
                                {service.availability && typeof service.availability === 'object' && 'days' in service.availability ? (
                                    (service.availability as any).days.map((day: string) => (
                                        <span key={day} className="px-4 py-2 bg-secondary/50 text-primary rounded-full text-sm font-medium border border-primary/5">
                                            {day}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">Contact for availability</span>
                                )}
                            </div>
                        </div>

                        <div className="animate-stagger-2">
                            <BookingForm serviceId={service.id} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
