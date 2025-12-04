import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { provider_id, name, type, hourly_rate, description, image_url, availability } = body;

        if (!provider_id || !name || !hourly_rate) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        console.log(`[API] Creating service for Provider ${provider_id}`);

        // 1. Ensure User Exists (Upsert)
        const { error: userError } = await (supabaseAdmin
            .from('users') as any)
            .upsert({
                id: provider_id,
                email: body.email,
                role: 'provider' // Set role to provider immediately
            }, { onConflict: 'id' });

        if (userError) {
            console.error("[User Upsert Error]", userError);
            // Continue anyway, maybe it exists? If not, next step will fail.
        }

        // 2. Create Service
        const { data, error } = await (supabaseAdmin
            .from('services') as any)
            .insert([
                {
                    provider_id,
                    name,
                    type,
                    hourly_rate,
                    description,
                    image_url,
                    availability
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("[Supabase Error]", error);
            throw error;
        }

        return NextResponse.json({ success: true, service: data });

    } catch (error: any) {
        console.error("[Service Create Error]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
