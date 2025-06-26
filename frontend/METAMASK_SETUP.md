# 🦊 MetaMask Integration Setup

## 📦 Required Dependencies

Install these packages in your React Native project:

```bash
cd frontend
npm install ethers
# or
yarn add ethers
```

## 🔧 Environment Configuration

Add these to your `.env` file:

```bash
# Contract Configuration
EXPO_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
EXPO_PUBLIC_NETWORK=sepolia  # or 'anvil' for local

# Network Settings
EXPO_PUBLIC_CHAIN_ID=11155111  # Sepolia
EXPO_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/z4apY4f867mavN6qu0m9dY0NqMbpgopv
```

## 🎯 Integration Steps

### 1. **Add Contract ABI**

Copy your contract ABI from `Contacts/out/AgriChain.json` to `frontend/src/services/web3Service.js`:

```javascript
// Replace AGRICHAIN_ABI with your actual ABI
const AGRICHAIN_ABI = [
  // Paste your ABI here
];
```

### 2. **Update Your Screens**

Add wallet connection to your screens:

```javascript
import React from 'react';
import { View } from 'react-native';
import WalletConnect from '../components/WalletConnect';
import { useWeb3 } from '../hooks/useWeb3';

export default function YourScreen() {
  const { isConnected, listProduce, buyProduce } = useWeb3();

  const handleListProduce = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const result = await listProduce('Tomatoes', 100, 0.001);
      console.log('Listed successfully:', result);
    } catch (error) {
      console.error('Failed to list:', error);
    }
  };

  return (
    <View>
      <WalletConnect />
      {/* Your existing UI */}
    </View>
  );
}
```

## 🌐 Network Setup for Users

### **Automatic Network Addition**

Your app will automatically prompt users to add Sepolia network to MetaMask.

### **Manual Network Addition**

Users can manually add Sepolia to MetaMask:

**Network Details:**
- **Network Name**: Sepolia Testnet
- **RPC URL**: `https://eth-sepolia.g.alchemy.com/v2/z4apY4f867mavN6qu0m9dY0NqMbpgopv`
- **Chain ID**: `11155111`
- **Currency Symbol**: `ETH`
- **Block Explorer**: `https://sepolia.etherscan.io`

## 💰 Getting Test ETH

Users need Sepolia ETH for transactions:

1. **Alchemy Faucet**: https://sepoliafaucet.com/
2. **Chainlink Faucet**: https://faucets.chain.link/sepolia
3. **Infura Faucet**: https://www.infura.io/faucet/sepolia

## 🔒 Security Considerations

### **For Users:**
- Never share private keys
- Always verify contract addresses
- Check transaction details before signing
- Use hardware wallets for large amounts

### **For Developers:**
- Validate all inputs
- Use proper error handling
- Implement transaction confirmations
- Add loading states for better UX

## 🧪 Testing

### **Local Testing (Anvil):**
```bash
# Start Anvil
anvil

# Import Anvil account to MetaMask
# Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# This gives you 10,000 ETH for testing
```

### **Sepolia Testing:**
1. Deploy contract to Sepolia
2. Get Sepolia ETH from faucets
3. Test all functions (list, buy, view)
4. Verify transactions on Etherscan

## 🎨 UI/UX Best Practices

### **Connection Flow:**
1. Show "Connect Wallet" button
2. Check if MetaMask is installed
3. Request account access
4. Verify correct network
5. Display connection status

### **Transaction Flow:**
1. Show transaction details
2. Estimate gas costs
3. Request user confirmation
4. Show pending state
5. Display success/error results
6. Provide transaction links

### **Error Handling:**
- MetaMask not installed
- User rejected connection
- Wrong network
- Insufficient funds
- Transaction failed

## 📱 Mobile Considerations

### **MetaMask Mobile:**
- Users can use MetaMask mobile browser
- Or connect via WalletConnect (requires additional setup)

### **Alternative Wallets:**
- Trust Wallet
- Coinbase Wallet
- Rainbow Wallet
- (All support WalletConnect)

## 🔗 Useful Links

- **MetaMask Docs**: https://docs.metamask.io/
- **Ethers.js Docs**: https://docs.ethers.org/
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
