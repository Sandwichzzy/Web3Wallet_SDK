import { createContext } from "react";
import type { WalletContextValue } from "../types";

// 初始上下文值
const initialContextValue: WalletContextValue = {
  address: "",
  chainId: 0,
  isConnecting: false,
  isConnected: false,
  ensName: "",
  error: null,
  chains: [],
  provider: undefined,
  balance: "0",
  connect: async () => {},
  disconnect: async () => {},
  switchChain: async () => {},
  openModal: () => {},
  closeModal: () => {},
  getBalance: async () => "0",
};

export const WalletContext =
  createContext<WalletContextValue>(initialContextValue);
