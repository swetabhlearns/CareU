import { ethers } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY;

if (!RPC_URL || !PRIVATE_KEY) {
    console.error("Missing Web3 Environment Variables. Check .env.local");
}

// Initialize Provider (Connection to Base Sepolia)
export const provider = new ethers.JsonRpcProvider(RPC_URL);

// Initialize Wallet (The "Relayer" that signs transactions)
// We use a check here to prevent crashes during build time if env vars are missing
export const serverWallet = PRIVATE_KEY
    ? new ethers.Wallet(PRIVATE_KEY, provider)
    : null;

const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || process.env.ESCROW_CONTRACT_ADDRESS;

const ESCROW_ABI = [
    "function createBooking(uint256 bookingId, address provider) external payable",
    "function releaseFunds(uint256 bookingId) external",
    "function refund(uint256 bookingId) external",
    "event BookingCreated(uint256 indexed bookingId, address indexed provider, uint256 amount)"
];

export const getEscrowContract = () => {
    if (!serverWallet) throw new Error("Server Wallet not initialized");

    if (!ESCROW_ADDRESS) {
        console.error("DEBUG: Environment Variables Keys:", Object.keys(process.env));
        console.error("DEBUG: ESCROW_ADDRESS is missing. Checked NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS and ESCROW_CONTRACT_ADDRESS");
        throw new Error("Escrow Contract Address not set");
    }

    return new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, serverWallet);
};

export const getContract = (address: string, abi: any) => {
    if (!serverWallet) throw new Error("Server Wallet not initialized");
    return new ethers.Contract(address, abi, serverWallet);
};
