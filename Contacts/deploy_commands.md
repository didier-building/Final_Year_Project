# 🚀 AgriChain Deployment Commands

## 📋 Quick Deployment Guide

### **Local Development (Anvil)**
```bash
# Start Anvil in one terminal
anvil

# Deploy to Anvil in another terminal
cd Contacts
mox run deploy
```

### **Sepolia Testnet (via Alchemy)**
```bash
# Set your Sepolia private key in .env
echo "SEPOLIA_PRIVATE_KEY=your_private_key_here" >> .env

# Test connection first (optional)
cd Contacts
uv run python test_sepolia_connection.py

# Deploy to Sepolia
mox run deploy_sepolia --network sepolia
```

### **Using Moccasin Network Commands**
```bash
# Deploy to specific networks
mox run deploy --network anvil
mox run deploy_sepolia --network sepolia

# Check available networks
mox networks list

# Get network info
mox networks show sepolia
```

## 🔧 Environment Setup

### **1. Local Development**
```bash
# .env file
ANVIL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEFAULT_NETWORK=anvil
```

### **2. Sepolia Testnet (Alchemy)**
```bash
# .env file
SEPOLIA_PRIVATE_KEY=your_sepolia_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/z4apY4f867mavN6qu0m9dY0NqMbpgopv
DEFAULT_NETWORK=sepolia
```

## 📊 Post-Deployment

### **Update Backend Configuration**
```bash
# Copy contract address from deployment output
# Update backend_api/.env
CONTRACT_ADDRESS=0x...
NETWORK=sepolia  # or anvil
```

### **Test Deployment**
```bash
cd backend_api
uv run manage.py shell -c "
from blockchain.services import web3_service
print('Network:', web3_service.network)
print('Connected:', web3_service.is_connected())
print('Total produces:', web3_service.get_total_produces())
"
```

## 🔍 Verification

### **Automatic Verification**
- Contracts deployed to Sepolia will be automatically verified
- Verification happens after successful deployment
- Check Etherscan link in deployment output

### **Manual Verification**
If automatic verification fails:
```bash
mox verify --network sepolia CONTRACT_ADDRESS
```

## 🌟 Features

✅ **Automatic account setup**
✅ **Network detection**
✅ **Balance checking**
✅ **Contract verification**
✅ **Explorer links**
✅ **Sample data creation**
✅ **Error handling**

## 📞 Troubleshooting

### **Common Issues:**

1. **"SEPOLIA_PRIVATE_KEY not set"**
   - Add your private key to .env file
   - Make sure it's without 0x prefix

2. **"Insufficient funds"**
   - Get Sepolia ETH from faucets
   - Check balance with: `mox accounts list`

3. **"Network not found"**
   - Check moccasin.toml configuration
   - Verify network name spelling

4. **"Verification failed"**
   - Contract still works, verification is optional
   - Try manual verification later
