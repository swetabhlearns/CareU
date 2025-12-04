'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
    const { user, login, logout, authenticated, ready } = usePrivy();
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
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 rounded-full glass-panel transition-all duration-300 hover:shadow-[0_0_20px_rgba(204,255,0,0.1)] hover:-translate-y-0.5 hover:bg-white/5 border border-white/10">
            <div className="px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-heading font-extrabold text-primary flex items-center gap-2 transition-transform hover:scale-105 tracking-tight">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-heading text-sm font-bold shadow-md">CC</span>
                    <span className="hidden sm:inline">ChronicCare</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    {/* Common Links or Public Links could go here */}

                    {authenticated && role === 'customer' && (
                        <>
                            <Link href="/services" className="text-muted-foreground hover:text-primary font-medium transition-colors font-body text-sm tracking-wide hover:underline underline-offset-4 decoration-accent decoration-2">
                                Find Care
                            </Link>
                            <Link href="/dashboard" className="text-muted-foreground hover:text-primary font-medium transition-colors font-body text-sm tracking-wide hover:underline underline-offset-4 decoration-accent decoration-2">
                                My Bookings
                            </Link>
                        </>
                    )}

                    {authenticated && role === 'provider' && (
                        <Link href="/provider/dashboard" className="text-muted-foreground hover:text-primary font-medium transition-colors font-body text-sm tracking-wide hover:underline underline-offset-4 decoration-accent decoration-2">
                            Provider Dashboard
                        </Link>
                    )}
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center gap-2">
                    {authenticated ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                                await logout();
                                router.push('/');
                            }}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 font-body rounded-full transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    ) : (
                        <Button onClick={login} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-body font-semibold rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30">
                            <User className="h-4 w-4" />
                            Login
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
}
