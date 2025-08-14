import React from "react";
import { useContext, createContext, useState, useEffect } from "react";
import type {
  WalletContextValue,
  WalletProviderProps,
  WalletState,
} from "../types";

const WalletContext = createContext<WalletContextValue>({
  connect: async () => {},
  disconnect: async () => {},
  switchChain: async () => {},
  openModal: function (): void {},
  closeModal: function (): void {},
  address: "",
  chainId: 0,
  ensName: null,
  error: null,
  chains: [],
  provider: undefined,
  isConnecting: false,
  isConnected: false,
});

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  chains,
  provider,
  autoConnect,
}) => {
  const [state, setState] = useState<WalletState>({
    address: "",
    chainId: 0,
    isConnecting: false,
    isConnected: false,
    ensName: "",
    error: null,
    chains,
    provider,
  });

  useEffect(() => {
    if (autoConnect) {
      // connect()
    }
  }, [autoConnect]);

  const value: WalletContextValue = {
    ...state,
    connect: async () => {},
    disconnect: async () => {},
    switchChain: async () => {},
    openModal: function (): void {},
    closeModal: function (): void {},
  };
  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export default WalletProvider;
