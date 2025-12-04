const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('--- Starting Deployment ---');

    // 1. Compile
    console.log('Compiling Escrow.sol...');
    const contractPath = path.resolve(__dirname, '../contracts', 'Escrow.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'Escrow.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        output.errors.forEach((err) => {
            console.error(err.formattedMessage);
        });
        if (output.errors.some(e => e.severity === 'error')) {
            throw new Error('Compilation failed');
        }
    }

    const contractFile = output.contracts['Escrow.sol']['BookingEscrow'];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    console.log('Compilation successful!');

    // 2. Deploy
    const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
    const PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY;

    if (!RPC_URL || !PRIVATE_KEY) {
        throw new Error('Missing env variables (RPC_URL or PRIVATE_KEY)');
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Deploying with wallet: ${wallet.address}`);

    // Check balance again just in case
    const balance = await provider.getBalance(wallet.address);
    console.log(`Wallet Balance: ${ethers.formatEther(balance)} ETH`);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();

    console.log('Waiting for deployment transaction...');
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`\nSUCCESS! Contract Deployed at: ${address}`);
    console.log('-----------------------------------');
    console.log('Please add this to your .env.local:');
    console.log(`NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
