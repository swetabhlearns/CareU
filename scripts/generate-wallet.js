const { ethers } = require('ethers');

const wallet = ethers.Wallet.createRandom();
console.log('--- SAVE THESE DETAILS SECURELY ---');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('-----------------------------------');
