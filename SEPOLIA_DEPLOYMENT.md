# 🚀 AgriChain Sepolia Testnet Deployment Guide

## 📋 Prerequisites

### 1. **Sepolia ETH**
- Get Sepolia ETH from faucets:
  - [Sepolia Faucet](https://sepoliafaucet.com/)
  - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
  - [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)
- You'll need at least 0.05 ETH for deployment and testing

### 2. **Private Key**
- Create a new wallet for testnet (NEVER use mainnet keys)
- Export the private key (without 0x prefix)
- Fund it with Sepolia ETH

### 3. **Alchemy RPC (Recommended)**
- ✅ Already configured with your Alchemy endpoint
- Better reliability and performance than public RPCs
- Rate limits: 300 requests/second on free tier
- Dashboard: https://dashboard.alchemy.com/

## 🔧 Step-by-Step Deployment

### **Step 1: Configure Environment**

1. **Update root .env file:**
```bash
# Add your Sepolia private key
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key_here
```

2. **Create backend Sepolia config:**
```bash
cp backend_api/.env.sepolia backend_api/.env
# Edit the file with your actual values
```

### **Step 2: Deploy Smart Contract**

```bash
cd Contacts
# Make sure you have Sepolia ETH in your wallet
uv run python script/deploy_sepolia.py
```

**Expected Output:**
```
🚀 Deploying AgriChain Smart Contract to Sepolia Testnet
👤 Deployer Account: 0x...
💰 Account Balance: 0.1 ETH
✅ Contract deployed successfully!
📍 Contract address: 0x...
🔗 View on Etherscan: https://sepolia.etherscan.io/address/0x...
```

### **Step 3: Update Backend Configuration**

1. **Update backend .env:**
```bash
CONTRACT_ADDRESS=0x... # From deployment output
NETWORK=sepolia
```

2. **Test backend connection:**
```bash
cd backend_api
uv run manage.py shell -c "
from blockchain.services import web3_service
print('Connected:', web3_service.is_connected())
print('Total produces:', web3_service.get_total_produces())
"
```

### **Step 4: Deploy Backend (Optional)**

For production deployment, consider:
- **Heroku**: Easy deployment with PostgreSQL
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2 or Elastic Beanstalk
- **Railway**: Simple deployment platform

### **Step 5: Update Frontend**

1. **Update frontend environment:**
```bash
cp frontend/.env.sepolia frontend/.env
# Update API_BASE_URL with your backend URL
```

2. **Build and deploy frontend:**
```bash
cd frontend
npx expo build:web
# Deploy to Vercel, Netlify, or your hosting provider
```

## 🧪 Testing on Sepolia

### **Test Contract Functions:**

1. **List a produce:**
```bash
# Use your mobile app or test via API
curl -X POST https://your-backend.com/api/produces/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tomatoes",
    "quantity": 10,
    "price_per_unit_eth": "0.001"
  }'
```

2. **Buy a produce:**
```bash
# Use mobile app with buyer's private key
# Or test via API endpoint
```

3. **View on Etherscan:**
- Visit: `https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS`
- Check transactions and events

## 🔍 Monitoring & Debugging

### **Check Contract Status:**
```bash
# In Django shell
from blockchain.services import web3_service
print(f"Network: {web3_service.network}")
print(f"Contract: {web3_service.contract_address}")
print(f"Connected: {web3_service.is_connected()}")
```

### **View Transactions:**
- **Etherscan**: https://sepolia.etherscan.io/
- **Your contract**: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

### **Common Issues:**

1. **"Insufficient funds"**
   - Get more Sepolia ETH from faucets
   - Check gas prices

2. **"Contract not deployed"**
   - Verify contract address in .env
   - Check deployment transaction on Etherscan

3. **"Network mismatch"**
   - Ensure all components use Sepolia (chain ID 11155111)
   - Check RPC URL configuration

## 🚀 Production Considerations

### **Security:**
- Use environment variables for all secrets
- Never commit private keys to git
- Use different keys for different environments
- Enable HTTPS for all endpoints

### **Performance:**
- ✅ Using Alchemy RPC (already configured)
- Implement proper error handling
- Add retry logic for failed transactions
- Monitor gas prices via Alchemy dashboard

### **Monitoring:**
- Set up alerts for failed transactions
- Monitor contract events
- Track user activity
- Log important operations

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables
3. Test contract functions on Etherscan
4. Check Sepolia network status

**Happy deploying! 🌾✨**
