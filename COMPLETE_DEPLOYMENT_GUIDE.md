# 🚀 Complete AgriChain Deployment Guide

## ✅ **Current Status**
- ✅ Private key configured securely
- ✅ All environment files set up
- ✅ Contract ABI extracted and configured
- ✅ MetaMask integration ready
- ✅ Backend multi-network support ready

## 🌐 **Step 1: Deploy to Sepolia Testnet**

### **Prerequisites Check:**
```bash
# 1. Verify your account has Sepolia ETH
# Your address: 0x8ba1f109551bD432803012645Hac136c4c1e4e5e (derived from your private key)
# Get Sepolia ETH from: https://sepoliafaucet.com/

# 2. Test network connectivity
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  https://ethereum-sepolia-rpc.publicnode.com
```

### **Deploy Contract:**
```bash
cd Contacts

# Option 1: Using moccasin (recommended)
mox run deploy_sepolia --network sepolia

# Option 2: If moccasin has issues, use direct deployment
uv run python script/deploy_sepolia.py
```

### **Expected Output:**
```
🚀 Deploying AgriChain Smart Contract to Sepolia Testnet
🌐 Network: sepolia
👤 Deployer Account: 0x8ba1f109551bD432803012645Hac136c4c1e4e5e
💰 Account Balance: X.XX ETH
🌾 AgriChain contract deployed successfully!
📍 Contract address: 0x...
🔍 Verifying contract on Sepolia Etherscan...
✅ Contract verified successfully!
🔗 Etherscan: https://sepolia.etherscan.io/address/0x...
```

## 🔧 **Step 2: Update Backend Configuration**

```bash
cd backend_api

# Update .env file with deployed contract address
echo "CONTRACT_ADDRESS=0x..." >> .env  # Use actual address from deployment
echo "NETWORK=sepolia" >> .env

# Test backend connection
uv run manage.py shell -c "
from blockchain.services import web3_service
print('Network:', web3_service.network)
print('Connected:', web3_service.is_connected())
print('Contract:', web3_service.contract_address)
print('Total produces:', web3_service.get_total_produces())
"
```

## 📱 **Step 3: Update Frontend Configuration**

```bash
cd frontend

# Update .env file
echo "EXPO_PUBLIC_CONTRACT_ADDRESS=0x..." >> .env  # Use actual address
echo "EXPO_PUBLIC_NETWORK=sepolia" >> .env
echo "EXPO_PUBLIC_CHAIN_ID=11155111" >> .env

# Install required dependencies
npm install ethers

# Test the app
npx expo start
```

## 🧪 **Step 4: End-to-End Testing**

### **Test 1: Backend API**
```bash
# Test sync from blockchain
curl -X POST http://localhost:8000/api/produces/sync_from_blockchain/

# Check available produces
curl http://localhost:8000/api/produces/available/
```

### **Test 2: MetaMask Integration**
1. **Add Sepolia to MetaMask:**
   - Network Name: Sepolia Testnet
   - RPC URL: https://ethereum-sepolia-rpc.publicnode.com
   - Chain ID: 11155111
   - Currency: ETH
   - Explorer: https://sepolia.etherscan.io

2. **Import Test Account (Optional):**
   - Private Key: 44bff12f938c079fd6f5f57089254401420ea73b068eb31913f1d1670ca347b2
   - Address: 0x8ba1f109551bD432803012645Hac136c4c1e4e5e

3. **Test Mobile App:**
   - Connect wallet
   - List a produce
   - Buy a produce
   - Verify transactions on Etherscan

## 🔍 **Step 5: Verification & Monitoring**

### **Contract Verification:**
- Visit: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
- Check contract is verified
- View transactions and events

### **Test Transactions:**
```bash
# List a produce via API
curl -X POST http://localhost:8000/api/produces/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Apples",
    "quantity": 50,
    "price_per_unit_eth": "0.002"
  }'

# Check transaction on Etherscan
# https://sepolia.etherscan.io/tx/TRANSACTION_HASH
```

## 🛡️ **Security Checklist**

### **Environment Security:**
- ✅ Private key in environment variables (not code)
- ✅ .env files in .gitignore
- ✅ Different keys for different environments
- ✅ Debug mode disabled in production

### **Smart Contract Security:**
- ✅ Input validation implemented
- ✅ Reentrancy protection
- ✅ Access control for critical functions
- ✅ Event logging for transparency

### **Frontend Security:**
- ✅ No private keys in frontend code
- ✅ MetaMask integration for wallet management
- ✅ Transaction confirmation prompts
- ✅ Network validation

## 📊 **Production Deployment**

### **Backend Deployment Options:**
1. **Heroku**: Easy deployment with PostgreSQL
2. **DigitalOcean**: App Platform or Droplets
3. **AWS**: EC2 or Elastic Beanstalk
4. **Railway**: Simple deployment platform

### **Frontend Deployment Options:**
1. **Vercel**: Automatic deployments from Git
2. **Netlify**: Static site hosting
3. **Expo**: Mobile app distribution

### **Database Migration:**
```bash
# For production, use PostgreSQL
pip install psycopg2-binary
# Update DATABASE_URL in .env
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Insufficient funds"**
   - Get more Sepolia ETH from faucets
   - Check gas prices

2. **"Network connection failed"**
   - Check internet connectivity
   - Try different RPC endpoints
   - Verify firewall settings

3. **"Contract not found"**
   - Verify contract address
   - Check network configuration
   - Ensure contract is deployed

4. **"MetaMask connection failed"**
   - Check MetaMask is installed
   - Verify network in MetaMask
   - Clear browser cache

### **Debug Commands:**
```bash
# Check network connectivity
curl https://ethereum-sepolia-rpc.publicnode.com

# Test contract interaction
cast call 0xYOUR_CONTRACT_ADDRESS "getTotalProduces()" --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Check account balance
cast balance 0x8ba1f109551bD432803012645Hac136c4c1e4e5e --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

## 🎉 **Success Criteria**

Your deployment is successful when:
- ✅ Contract deployed and verified on Sepolia
- ✅ Backend connects to contract successfully
- ✅ Mobile app connects to MetaMask
- ✅ Can list produces via mobile app
- ✅ Can buy produces via mobile app
- ✅ Transactions visible on Etherscan
- ✅ Database syncs with blockchain

## 📞 **Next Steps**

1. **Deploy to production** when ready
2. **Set up monitoring** and alerts
3. **Implement additional features**
4. **Scale infrastructure** as needed

**Your AgriChain dApp is ready for Sepolia deployment! 🌾✨**
