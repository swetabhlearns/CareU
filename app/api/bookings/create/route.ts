import { NextResponse } from 'next/server';
import { serverWallet, getEscrowContract } from '@/lib/web3';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ethers } from 'ethers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { serviceId, userId, price, date } = body;

        if (!serverWallet) {
            return NextResponse.json({ success: false, error: "Server Wallet not configured" }, { status: 500 });
        }

        console.log(`[Relayer] Processing booking for User ${userId}`);

        // 1. Ensure User Exists (Upsert)
        // We need the user's email to be passed from the frontend or we can try to get it if we had a server-side privy client, 
        // but for now let's assume the frontend sends it or we just create the ID.
        // Ideally, the frontend should send the email.
        const { email } = body;

        const { error: userError } = await (supabaseAdmin
            .from('users') as any)
            .upsert({
                id: userId,
                email: email,
                role: 'customer' // Default to customer
            }, { onConflict: 'id' });

        if (userError) {
            console.error("[User Upsert Error]", userError);
            // Continue, but it might fail if user doesn't exist
        }

        // 2. Create Booking in Supabase (Status: Pending)
        const { data: bookingData, error: dbError } = await (supabaseAdmin
            .from('bookings') as any)
            .insert([
                {
                    user_id: userId,
                    service_id: serviceId,
                    scheduled_at: date,
                    status: 'pending',
                    notes: 'Processing Blockchain Transaction...'
                }
            ])
            .select()
            .single();

        if (dbError) throw dbError;

        const bookingUUID = (bookingData as any).id;

        // Convert UUID to uint256 for Solidity (Hash it)
        const bookingIdHash = ethers.toBigInt(ethers.keccak256(ethers.toUtf8Bytes(bookingUUID)));

        // Simulate a Provider Address (In real app, fetch from 'services' table)
        const providerAddress = "0x000000000000000000000000000000000000dEaD";

        console.log(`[Relayer] Minting Booking ${bookingUUID} on-chain...`);

        // 2. Call Smart Contract
        const escrowContract = getEscrowContract();
        // Use a tiny amount for testing (0.000001 ETH) instead of full price
        const tx = await escrowContract.createBooking(bookingIdHash, providerAddress, {
            value: ethers.parseEther("0.000001")
        });

        console.log(`[Relayer] Tx Sent: ${tx.hash}`);

        // Wait for 1 confirmation
        await tx.wait(1);

        // 3. Update Supabase with Tx Hash
        const { error: updateError } = await (supabaseAdmin
            .from('bookings') as any)
            .update({
                status: 'confirmed',
                notes: `Tx Hash: ${tx.hash}`
            })
            .eq('id', bookingUUID);

        if (updateError) console.error("Failed to update booking with hash", updateError);

        return NextResponse.json({
            success: true,
            message: "Booking confirmed on-chain",
            booking: bookingData,
            txHash: tx.hash
        });

    } catch (error: any) {
        console.error("[Relayer Error Details]:", error);
        console.error("[Relayer Error Stack]:", error.stack);
        return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
    }
}
