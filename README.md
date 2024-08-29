# alchemy-pay-poc

To run this, follow the terminal commands:
```azure
npm init -y
npm install express dotenv web3
node src/server.js
```
Then in another window, run:
```azure
curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -d '{
  "appId": "testAppId",
  "orderNo": "testOrderNo",
  "crypto": "DIMO",
  "network": "polygon",
  "address": "0xTestWalletAddress",
  "status": "PAY_SUCCESS",
  "txHash": "0xFakeTxHash1234567890abcdef",
  "newSignature": "fakeSignatureForTesting"
}'

```
This is just an example payload for testing purposes