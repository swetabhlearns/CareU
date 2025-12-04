import ServiceCard from '@/components/ServiceCard';
import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function ServicesPage() {
    const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false }) as any;

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Error loading services: {error.message}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pt-40 pb-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-6">
                <header className="mb-16 text-center animate-reveal">
                    <h1 className="text-6xl md:text-8xl font-heading font-extrabold text-primary mb-6 tracking-tighter leading-none">Our Services</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-body font-light text-balance">
                        Curated care options designed for your comfort and well-being.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-stagger-1">
                    {services?.map((service: any) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>

                {services?.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No services found. Please check your database seeding.
                    </div>
                )}
            </div>
        </main>
    );
}
