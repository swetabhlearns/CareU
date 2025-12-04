'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export async function getBookings(userId: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const adminSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const { data, error } = await adminSupabase
        .from('bookings')
        .select('*, services(*)')
        .eq('user_id', userId)
        .order('scheduled_at', { ascending: true });

    if (error) {
        console.error('Error fetching bookings:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
