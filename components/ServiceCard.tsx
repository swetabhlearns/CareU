import Link from 'next/link';
import { Database } from '@/types/database';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Service = Database['public']['Tables']['services']['Row'];

export default function ServiceCard({ service }: { service: Service }) {
    return (
        <Card className="group overflow-hidden border-none glass-panel hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative h-64 w-full overflow-hidden">
                {service.image_url ? (
                    <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-secondary/30 text-muted-foreground">
                        No Image Available
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm uppercase tracking-wider border border-primary/10">
                    {service.type}
                </div>
            </div>

            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-3xl font-heading font-bold text-primary leading-none group-hover:text-accent transition-colors duration-300 tracking-tight">{service.name}</CardTitle>
                </div>
                <div className="mt-2">
                    <span className="text-xl font-heading font-bold text-primary/80">
                        ${service.hourly_rate}<span className="text-sm font-body text-muted-foreground font-normal">/hr</span>
                    </span>
                </div>
            </CardHeader>

            <CardContent className="flex-grow relative z-10">
                <p className="text-muted-foreground line-clamp-3 leading-relaxed text-balance font-body font-light">
                    {service.description}
                </p>
            </CardContent>

            <CardFooter className="pt-4 relative z-10">
                <Button asChild className="w-full bg-primary hover:bg-accent text-primary-foreground rounded-xl h-12 text-base font-body font-medium shadow-lg shadow-primary/10 transition-all duration-300 hover:shadow-accent/30 group-hover:translate-y-0 translate-y-2 opacity-90 group-hover:opacity-100">
                    <Link href={`/services/${service.id}`}>
                        View Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
