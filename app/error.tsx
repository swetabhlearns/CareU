'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-md mb-8 font-body">
                We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
                >
                    Try again
                </Button>
                <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="rounded-full px-8"
                >
                    Go Home
                </Button>
            </div>
        </div>
    );
}
