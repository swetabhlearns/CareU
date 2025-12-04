const { ethers } = require('ethers');

// Configuration
const RPC_URL = 'https://sepolia.base.org';
const WALLET_ADDRESS = '0xb78dd920478088c7EEE1331333dCbDaaED36Cb21';

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    try {
        const balance = await provider.getBalance(WALLET_ADDRESS);
        console.log(`Balance for ${WALLET_ADDRESS}:`);
        console.log(`${ethers.formatEther(balance)} ETH`);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

main();
