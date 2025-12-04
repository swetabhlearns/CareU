import BookingList from '@/components/BookingList';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-background pt-32 pb-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

            <div className="container mx-auto px-6">
                <header className="mb-12 animate-reveal">
                    <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-primary mb-4 tracking-tighter">My Dashboard</h1>
                    <p className="text-xl text-muted-foreground font-body font-light">Manage your upcoming care appointments and history.</p>
                </header>

                <section>
                    <h2 className="text-2xl font-heading font-bold mb-6 text-primary tracking-tight">Your Bookings</h2>
                    <BookingList />
                </section>
            </div>
        </main>
    );
}
