import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const { bookingId, status, providerId } = await request.json();

        if (!bookingId || !status || !providerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify that the provider owns the service linked to this booking
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('service_id, services(provider_id)')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Check ownership
        // @ts-ignore
        if (booking.services.provider_id !== providerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update status
        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            // @ts-ignore
            .update({ status })
            .eq('id', bookingId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error updating booking:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
