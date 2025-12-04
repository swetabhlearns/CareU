'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function createBooking(prevState: any, formData: FormData) {
    const serviceId = formData.get('serviceId') as string;
    const userId = formData.get('userId') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const duration = formData.get('duration') as string;
    const notes = formData.get('notes') as string;

    if (!userId || !serviceId || !date || !time) {
        return { message: 'Missing required fields', success: false };
    }

    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

    // Use Service Role Key to bypass RLS for this server action
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create a new client instance with the service key
    const { createClient } = await import('@supabase/supabase-js');
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Ensure User Exists
    const { data: existingUser } = await adminSupabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

    if (!existingUser) {
        const { error: createUserError } = await adminSupabase.from('users').insert({
            id: userId,
            email: 'user@example.com', // Placeholder, ideally passed from form or Privy token
            name: 'New User', // Placeholder
        });

        if (createUserError) {
            console.error('Error creating user:', createUserError);
            return { message: 'Failed to sync user profile.', success: false };
        }
    }

    // 2. Create Booking
    const { error } = await adminSupabase.from('bookings').insert({
        user_id: userId,
        service_id: serviceId,
        scheduled_at: scheduledAt,
        duration_hours: parseInt(duration),
        notes: notes,
        status: 'pending',
    } as any);

    if (error) {
        console.error('Booking error:', error);
        return { message: 'Failed to create booking: ' + error.message, success: false };
    }

    revalidatePath('/dashboard');
    return { message: 'Booking created successfully!', success: true };
}
