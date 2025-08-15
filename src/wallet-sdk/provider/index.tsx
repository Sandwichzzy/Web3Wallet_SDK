import React from "react";
import { useContext, createContext, useState, useEffect, useMemo } from "react";
import type {
  WalletContextValue,
  WalletProviderProps,
  WalletState,
  Wallet,
} from "../types";
import WalletModal from "../components/WalletModal";

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
  wallets,
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

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (autoConnect) {
      // connect()
    }
  }, [autoConnect]);

  const value: WalletContextValue = {
    ...state,
    connect: async (walletID: string) => {
      try {
        const wallet = walletsMap[walletID];
        if (!wallet) {
          throw new Error("Wallet not found");
        }
        setState({
          ...state,
          isConnecting: true,
        });
        try {
          const { chainId, address } = await wallet.connector();
          setState({
            ...state,
            isConnected: true,
            address,
            chainId,
          });
        } catch (error) {
          setState({
            ...state,
            isConnected: false,
            error: error as Error,
          });
        }
      } catch (error) {
        setState({
          ...state,
          isConnected: false,
          error: error as Error,
        });
      }
    },
    disconnect: async () => {},
    switchChain: async () => {},
    openModal: function (): void {
      setModalOpen(true);
    },
    closeModal: function (): void {
      setModalOpen(false);
    },
  };

  const walletsMap = useMemo(() => {
    return wallets.reduce((acc, wallet) => {
      acc[wallet.id] = wallet;
      return acc;
    }, {} as Record<string, Wallet>);
  }, [wallets]);

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        wallets={wallets}
        onSelectWallet={(wallet) => value.connect(wallet.id)}
        connecting={false}
        error={null}
      />
    </WalletContext.Provider>
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
