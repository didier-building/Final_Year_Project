import React, { createContext, useContext } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  return (
    <WalletContext.Provider value={null}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}

// Wrap your app with <WalletProvider> in App.js
// Example usage: const wallet = useWallet();
