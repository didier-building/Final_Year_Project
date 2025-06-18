
# AgriChain: Blockchain-Based Agricultural Supply Chain Platform

## 🎯 Project Overview

AgriChain is a decentralized platform that connects farmers directly with buyers by leveraging blockchain technology. It ensures secure, transparent, and traceable transactions of agricultural produce.

## 🏗️ Tech Stack

- **Smart Contract:** Vyper + Moccasin (Sepolia Testnet)
- **Backend:** Django + Django REST Framework + Web3.py
- **Frontend:** React Native (Expo)
- **Wallet:** MetaMask via WalletConnect

## 🔄 Modules & Features

### 👨‍🌾 Farmer Features
- Register produce with name, quantity, and price
- View produce listed
- Track sales and ownership status

### 🧑‍💼 Buyer Features
- Browse listed produce from farmers
- Purchase produce directly using MetaMask
- View purchase history

## 🔗 Blockchain Functions

- `listProduce(produce_name, quantity, price)` — Farmer lists new produce
- `buyProduce(produce_id)` — Buyer purchases produce and transfers ETH
- `getProduceDetails(produce_id)` — Get full traceable details

## 🗂️ Project Structure

```
AgriChain/
├── contracts/               # Vyper smart contracts
├── scripts/                 # Deployment scripts
├── backend_api/             # Django REST API
├── frontend/                # React Native frontend
├── build/                   # ABI + bytecode
└── README.md
```

## 📆 Weekly Plan

### ✅ Day 1: Smart Contract
- Write and compile Vyper contract with produce listing and buying logic

### ✅ Day 2: Django Backend
- Setup DRF API
- Create endpoints: `/api/produce/<id>/`, `/api/produce/listed/`

### ✅ Day 3-5: React Native App
- Farmer: Register produce screen, view listed
- Buyer: Marketplace screen, buy screen, transaction flow

### ✅ Day 6: Wallet Integration
- Connect MetaMask with WalletConnect
- Send transactions via `ethers.js`

### ✅ Day 7: Final Integration
- Test all modules end-to-end
- Prepare documentation and demo

## 📝 Deliverables

- Functional mobile app (React Native)
- Smart contract deployed to Sepolia
- Django API serving blockchain data
- Clean README and project report PDF

 #It's Me to Save the Farmers' Yeilds🌱🌱...Respect🙏 to Y'all farmers👊. 
