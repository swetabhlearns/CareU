import { NextResponse } from 'next/server';
import { serverWallet, getEscrowContract } from '@/lib/web3';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ethers } from 'ethers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId } = body;

        if (!serverWallet) {
            return NextResponse.json({ success: false, error: "Server Wallet not configured" }, { status: 500 });
        }

        console.log(`[Relayer] Releasing funds for Booking ${bookingId}`);

        // 1. Get Booking UUID
        const { data: booking, error: dbError } = await (supabaseAdmin
            .from('bookings') as any)
            .select('*')
            .eq('id', bookingId)
            .single();

        if (dbError || !booking) throw new Error("Booking not found");

        // Convert UUID to uint256 for Solidity (Hash it)
        const bookingIdHash = ethers.toBigInt(ethers.keccak256(ethers.toUtf8Bytes(bookingId)));

        console.log(`[Relayer] Releasing on-chain...`);

        // 2. Call Smart Contract
        const escrowContract = getEscrowContract();
        const tx = await escrowContract.releaseFunds(bookingIdHash);

        console.log(`[Relayer] Release Tx Sent: ${tx.hash}`);

        // Wait for 1 confirmation
        await tx.wait(1);

        // 3. Update Supabase
        const { error: updateError } = await (supabaseAdmin
            .from('bookings') as any)
            .update({
                status: 'completed',
                notes: `Funds Released. Tx: ${tx.hash}`
            })
            .eq('id', bookingId);

        if (updateError) console.error("Failed to update booking status", updateError);

        return NextResponse.json({
            success: true,
            message: "Funds Released",
            txHash: tx.hash
        });

    } catch (error: any) {
        console.error("[Relayer Release Error]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
