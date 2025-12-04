'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Changed from '@/lib/supabase/client'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Retained CardHeader, CardTitle
import { ShieldCheck, HeartPulse, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'provider' | 'admin' | null>(null);

  useEffect(() => {
    if (ready && authenticated && user?.id) {
      fetchUserRole();
    }
  }, [ready, authenticated, user?.id]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id }),
      });
      const data = await response.json();
      if (data.role) {
        setRole(data.role);
      }
    } catch (error) {
      console.error("Error fetching role:", error);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Background Effects - Neo Sleek */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Hero Section */}
      <header className="container mx-auto px-6 py-24 md:py-32 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-body font-bold uppercase tracking-widest mb-8 animate-reveal opacity-0 backdrop-blur-md">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          Next Gen Care
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-extrabold text-foreground mb-8 leading-[0.85] animate-stagger-1 tracking-tighter">
          Care that <br />
          <span className="text-primary">Evolves.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-xl md:text-2xl text-muted-foreground font-body font-light leading-relaxed animate-stagger-2 text-balance">
          Connect with vetted nurses, drivers, and helpers. <br />
          <span className="text-white font-medium">Instant. Reliable. Human.</span>
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5 animate-stagger-3">
          {!authenticated ? (
            <>
              <Button
                size="lg"
                onClick={login}
                className="bg-primary hover:bg-primary/90 text-black text-xl font-body font-bold px-10 py-8 h-auto rounded-full shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(204,255,0,0.5)]"
              >
                Login as User
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/provider/onboarding')}
                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white text-xl font-body font-medium px-10 py-8 h-auto rounded-full transition-all backdrop-blur-sm"
              >
                Login as Provider
              </Button>
            </>
          ) : role === 'provider' ? (
            <>
              <Button
                size="lg"
                onClick={() => router.push('/provider/dashboard')}
                className="bg-primary hover:bg-primary/90 text-black text-xl font-body font-bold px-10 py-8 h-auto rounded-full shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(204,255,0,0.5)]"
              >
                Go to Provider Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/provider/onboarding')} // Or edit profile page if we had one
                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white text-xl font-body font-medium px-10 py-8 h-auto rounded-full transition-all backdrop-blur-sm"
              >
                Edit Service Profile
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => router.push('/services')}
                className="bg-primary hover:bg-primary/90 text-black text-xl font-body font-bold px-10 py-8 h-auto rounded-full shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(204,255,0,0.5)]"
              >
                Browse Services
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white text-xl font-body font-medium px-10 py-8 h-auto rounded-full transition-all backdrop-blur-sm"
              >
                My Bookings
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="glass-panel border-white/10 text-foreground transition-all duration-500 hover:scale-105 hover:neon-glow group">
            <CardHeader>
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <CardTitle className="text-3xl font-heading font-bold">Verified Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-body font-light leading-relaxed text-lg">
                Every caregiver is rigorously vetted, background-checked, and certified. Peace of mind is our baseline.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/10 text-foreground transition-all duration-500 hover:scale-105 hover:neon-glow group">
            <CardHeader>
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                <HeartPulse className="h-7 w-7" />
              </div>
              <CardTitle className="text-3xl font-heading font-bold">Specialized Care</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-body font-light leading-relaxed text-lg">
                Tailored support for chronic conditions. From complex medication schedules to gentle mobility aid.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/10 text-foreground transition-all duration-500 hover:scale-105 hover:neon-glow group">
            <CardHeader>
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                <Clock className="h-7 w-7" />
              </div>
              <CardTitle className="text-3xl font-heading font-bold">Flexible Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-body font-light leading-relaxed text-lg">
                Book exactly what you need. A quick check-in, a few hours of help, or full-day companionship.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-muted-foreground font-body text-sm">
            © 2025 ChronicCare. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="/services" className="text-muted-foreground hover:text-primary transition-colors font-body font-medium">Find Care</a>
            <a href="/provider/onboarding" className="text-muted-foreground hover:text-primary transition-colors font-body font-medium flex items-center gap-2">
              Become a Provider <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div >
  );
}
