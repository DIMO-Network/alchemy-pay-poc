require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const Web3 = require('web3');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Load environment variables
const apiKey = process.env.API_KEY;
const appSecret = process.env.APP_SECRET;
const cryptoAddress = process.env.CRYPTO_ADDRESS;
const network = process.env.NETWORK;
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const walletAddress = process.env.WALLET_ADDRESS;
const contractAddress = process.env.CONTRACT_ADDRESS;

// Serve the index.html with populated values
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Webhook endpoint calls burnDimo
// When a payment is successful, Alchemy Pay sends notif to webhook endpoint
app.post('/webhook', (req, res) => {
    const payload = req.body;
    const { appId, orderNo, crypto, network, address, status, txHash } = payload;

    if (verifySignature(payload)) {
        if (status === 'PAY_SUCCESS') {
            console.log(`Payment success for order ${orderNo}.`);
            burnDimo(txHash);
        }
    } else {
        res.status(400).send('Invalid signature');
    }

    res.status(200).send('Webhook received');
});

function verifySignature(payload) {
    const { appId, orderNo, crypto, network, address, newSignature } = payload;
    const signatureString = appId + orderNo + crypto + network + address;
    const calculatedSignature = crypto
        .createHmac('sha256', appSecret)
        .update(signatureString)
        .digest('hex');

    return calculatedSignature === newSignature;
}

// Checks tx status on chain
async function burnDimo(txHash) {
    const web3 = new Web3(`https://polygon-mumbai.infura.io/v3/${infuraProjectId}`);
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    // receipt shows if tx was successful (receipt.status)

    // if tx is confirmed we burn $DIMO and invoke smart contract
    if (receipt.status) {
        await contract.methods.burnDimo().send({ from: walletAddress });
        console.log('DIMO tokens burned successfully.');
    }
}

// Placeholder
const contractABI = [
    // Contract's ABI
];

app.listen(3000, () => console.log('Server running on port 3000'));
