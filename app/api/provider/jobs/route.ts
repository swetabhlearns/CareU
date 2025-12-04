import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const { providerId } = await request.json();

        if (!providerId) {
            return NextResponse.json({ error: 'Provider ID required' }, { status: 400 });
        }

        // Fetch services owned by this user
        const { data: services } = await supabaseAdmin
            .from('services')
            .select('id')
            .eq('provider_id', providerId);

        if (!services || services.length === 0) {
            return NextResponse.json({ jobs: [] });
        }

        const serviceIds = services.map((s: any) => s.id);

        // Fetch bookings for these services
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                services (name, hourly_rate),
                users (name, email, phone)
            `)
            .in('service_id', serviceIds)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ jobs: bookings || [] });
    } catch (error: any) {
        console.error("Error fetching provider jobs:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
