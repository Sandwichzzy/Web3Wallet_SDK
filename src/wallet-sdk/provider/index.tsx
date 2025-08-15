import React from "react";
import {
  useContext,
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ethers } from "ethers";
import type {
  WalletContextValue,
  WalletProviderProps,
  WalletState,
  Wallet,
} from "../types";
import WalletModal from "../components/WalletModal";
import {
  detectWalletInstallation,
  setupWalletInstallationListener,
} from "../utils/walletDetection";

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
  balance: "0",
  getBalance: async () => "0",
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
    provider: undefined,
    balance: "0",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [detectedWallets, setDetectedWallets] = useState<Wallet[]>(wallets);

  // 检测钱包安装状态的函数
  const checkWalletInstallation = useCallback(() => {
    const updatedWallets = wallets.map((wallet) => ({
      ...wallet,
      installed: detectWalletInstallation(wallet.id),
    }));

    setDetectedWallets(updatedWallets);
  }, [wallets]);

  // 余额更新函数
  const updateBalance = useCallback(async (address: string, provider: any) => {
    try {
      if (provider && address) {
        const balance = await provider.getBalance(address);
        const formattedBalance = ethers.formatEther(balance);
        setBalance(formattedBalance);
        // 同时更新Provider状态
        setState((prev) => ({
          ...prev,
          balance: formattedBalance,
        }));
      }
    } catch (error) {
      console.error("Failed to get balance:", error);
      setBalance("0");
      setState((prev) => ({
        ...prev,
        balance: "0",
      }));
    }
  }, []);

  // 钱包检测逻辑
  useEffect(() => {
    // 初始检测
    checkWalletInstallation();

    // 设置钱包安装监听器
    const cleanup = setupWalletInstallationListener(() => {
      checkWalletInstallation();
    });

    // 监听页面可见性变化，当用户切换回页面时重新检测
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkWalletInstallation();
      }
    };

    // 监听页面焦点变化
    const handleFocus = () => {
      checkWalletInstallation();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      cleanup();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkWalletInstallation]);

  // 设置事件监听器
  useEffect(() => {
    const handleAccountsChanged = (event: CustomEvent) => {
      const newAccounts = event.detail.accounts;
      if (newAccounts && newAccounts.length > 0) {
        setState((prev) => ({
          ...prev,
          address: newAccounts[0],
        }));
        // 更新余额
        if (state.provider) {
          updateBalance(newAccounts[0], state.provider);
        }
      } else {
        // 账户断开连接
        setState((prev) => ({
          ...prev,
          address: "",
          isConnected: false,
          balance: "0",
        }));
        setBalance("0");
      }
    };

    const handleChainChanged = (event: CustomEvent) => {
      const newChainId = event.detail.chainId;
      setState((prev) => ({
        ...prev,
        chainId: newChainId,
      }));
      // 链切换后更新余额
      if (state.address && state.provider) {
        updateBalance(state.address, state.provider);
      }
    };

    const handleWalletDisconnected = () => {
      setState((prev) => ({
        ...prev,
        address: "",
        chainId: 0,
        isConnected: false,
        provider: undefined,
        balance: "0",
      }));
      setBalance("0");
      setCurrentWallet(null);
    };

    // 添加事件监听器
    window.addEventListener(
      "wallet-sdk:wallet-accounts-changed",
      handleAccountsChanged as EventListener
    );
    window.addEventListener(
      "wallet-sdk:wallet-chain-changed",
      handleChainChanged as EventListener
    );
    window.addEventListener(
      "wallet-sdk:wallet-disconnected",
      handleWalletDisconnected
    );

    return () => {
      window.removeEventListener(
        "wallet-sdk:wallet-accounts-changed",
        handleAccountsChanged as EventListener
      );
      window.removeEventListener(
        "wallet-sdk:wallet-chain-changed",
        handleChainChanged as EventListener
      );
      window.removeEventListener(
        "wallet-sdk:wallet-disconnected",
        handleWalletDisconnected
      );
    };
  }, [state.provider, state.address, updateBalance]);

  // 自动连接逻辑
  useEffect(() => {
    if (autoConnect) {
      // 尝试自动连接
      const savedWalletId = localStorage.getItem("wallet-sdk:last-wallet");
      if (savedWalletId) {
        const wallet = wallets.find((w) => w.id === savedWalletId);
        if (wallet) {
          // 延迟执行，确保value已经定义
          setTimeout(() => {
            const connectWallet = async () => {
              try {
                const wallet = wallets.find((w) => w.id === savedWalletId);
                if (wallet) {
                  await value.connect(wallet.id);
                }
              } catch (error) {
                console.error("Auto connect failed:", error);
              }
            };
            connectWallet();
          }, 100);
        }
      }
    }
  }, [autoConnect, wallets]);

  const value: WalletContextValue = {
    ...state,
    connect: async (walletID: string) => {
      try {
        const wallet = walletsMap[walletID];
        if (!wallet) {
          throw new Error("Wallet not found");
        }

        // 检查钱包是否已安装
        if (!wallet.installed) {
          throw new Error(`${wallet.name} is not installed`);
        }

        setState((prev) => ({
          ...prev,
          isConnecting: true,
          error: null,
        }));

        try {
          const result = await wallet.connector();
          const { chainId, address, provider } = result;

          setState((prev) => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            address,
            chainId,
            provider,
            error: null,
            balance: "0", // 初始余额，稍后会通过updateBalance更新
          }));

          setCurrentWallet(wallet);

          // 保存最后连接的钱包
          localStorage.setItem("wallet-sdk:last-wallet", walletID);

          // 获取并设置余额
          if (address && provider) {
            updateBalance(address, provider);
          }

          // 关闭弹窗
          setModalOpen(false);
        } catch (error) {
          setState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            error: error as Error,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: error as Error,
        }));
      }
    },

    disconnect: async () => {
      try {
        if (currentWallet && state.provider) {
          // 如果有断开连接方法，调用它
          if (typeof state.provider.disconnect === "function") {
            await state.provider.disconnect();
          }

          // 移除所有监听器
          if (state.provider.removeAllListeners) {
            state.provider.removeAllListeners();
          }
        }

        // 重置状态
        setState((prev) => ({
          ...prev,
          address: "",
          chainId: 0,
          isConnected: false,
          provider: undefined,
          error: null,
          balance: "0",
        }));

        setBalance("0");
        setCurrentWallet(null);

        // 清除本地存储
        localStorage.removeItem("wallet-sdk:last-wallet");
      } catch (error) {
        console.error("Disconnect error:", error);
        // 即使出错也要重置状态
        setState((prev) => ({
          ...prev,
          address: "",
          chainId: 0,
          isConnected: false,
          provider: undefined,
          error: error as Error,
          balance: "0",
        }));
        setBalance("0");
        setCurrentWallet(null);
      }
    },

    switchChain: async (chainId: string) => {
      try {
        if (!state.provider || !currentWallet) {
          throw new Error("No wallet connected");
        }

        const targetChain = chains.find(
          (chain) => chain.id.toString() === chainId
        );
        if (!targetChain) {
          throw new Error("Chain not supported");
        }

        // 尝试切换网络
        try {
          await state.provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${parseInt(chainId).toString(16)}`,
                chainName: targetChain.name,
                nativeCurrency: targetChain.currency,
                rpcUrls: [targetChain.rpcUrl],
                blockExplorerUrls: [targetChain.blockExplorer.url],
              },
            ],
          });
        } catch (addError: any) {
          // 如果网络已存在，尝试切换
          if (addError.code === 4902) {
            await state.provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
            });
          } else {
            throw addError;
          }
        }

        // 更新状态
        setState((prev) => ({
          ...prev,
          chainId: parseInt(chainId),
        }));

        // 更新余额
        if (state.address && state.provider) {
          updateBalance(state.address, state.provider);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
        }));
        throw error;
      }
    },

    openModal: function (): void {
      setModalOpen(true);
    },

    closeModal: function (): void {
      setModalOpen(false);
    },

    getBalance: async (): Promise<string> => {
      if (state.address && state.provider) {
        try {
          await updateBalance(state.address, state.provider);
          return balance;
        } catch (error) {
          console.error("Failed to get balance:", error);
          return "0";
        }
      }
      return "0";
    },
  };

  const walletsMap = useMemo(() => {
    return detectedWallets.reduce((acc, wallet) => {
      acc[wallet.id] = wallet;
      return acc;
    }, {} as Record<string, Wallet>);
  }, [detectedWallets]);

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        wallets={detectedWallets}
        onSelectWallet={(wallet) => value.connect(wallet.id)}
        connecting={state.isConnecting}
        error={state.error}
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
