import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md mb-8 font-body">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8">
                <Link href="/">Return Home</Link>
            </Button>
        </div>
    );
}
