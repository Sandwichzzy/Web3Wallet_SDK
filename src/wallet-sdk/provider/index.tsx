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

// 初始状态
const initialState: WalletState = {
  address: "",
  chainId: 0,
  isConnecting: false,
  isConnected: false,
  ensName: "",
  error: null,
  chains: [],
  provider: undefined,
  balance: "0",
};

// 初始上下文值
const initialContextValue: WalletContextValue = {
  ...initialState,
  connect: async () => {},
  disconnect: async () => {},
  switchChain: async () => {},
  openModal: () => {},
  closeModal: () => {},
  getBalance: async () => "0",
};

const WalletContext = createContext<WalletContextValue>(initialContextValue);

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  chains,
  wallets,
  autoConnect,
}) => {
  const [state, setState] = useState<WalletState>({ ...initialState, chains });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [detectedWallets, setDetectedWallets] = useState<Wallet[]>(wallets);

  // 钱包映射表
  const walletsMap = useMemo(() => {
    return detectedWallets.reduce((acc, wallet) => {
      acc[wallet.id] = wallet;
      return acc;
    }, {} as Record<string, Wallet>);
  }, [detectedWallets]);

  // 更新钱包安装状态
  const checkWalletInstallation = useCallback(() => {
    const updatedWallets = wallets.map((wallet) => ({
      ...wallet,
      installed: detectWalletInstallation(wallet.id),
    }));
    setDetectedWallets(updatedWallets);
  }, [wallets]);

  // 重置钱包状态
  const resetWalletState = useCallback(() => {
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
    localStorage.removeItem("wallet-sdk:last-wallet");
  }, []);

  // 更新余额
  const updateBalance = useCallback(async (address: string, provider: any) => {
    try {
      if (!provider || !address) return;

      console.log("开始获取余额:", {
        address,
        providerType: provider.constructor?.name,
      });

      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);

      console.log("余额获取成功:", formattedBalance);
      setBalance(formattedBalance);
      setState((prev) => ({ ...prev, balance: formattedBalance }));
    } catch (error: any) {
      console.error("Failed to get balance:", error);

      // 网络错误时跳过余额更新
      if (
        error.code === "NETWORK_ERROR" ||
        error.message?.includes("network changed")
      ) {
        console.log("检测到网络错误，跳过余额更新");
        return;
      }

      // 其他错误时设置余额为0
      setBalance("0");
      setState((prev) => ({ ...prev, balance: "0" }));
    }
  }, []);

  // 重新创建provider并更新余额
  const recreateProviderAndUpdateBalance = useCallback(async () => {
    if (!state.address || !currentWallet) return;

    try {
      console.log("重新创建provider并更新余额...");
      const result = await currentWallet.connector();
      const { provider: newProvider } = result;

      setState((prev) => ({ ...prev, provider: newProvider }));
      if (newProvider) {
        await updateBalance(state.address, newProvider);
      }
    } catch (error) {
      console.error("重新创建provider失败:", error);
    }
  }, [state.address, currentWallet, updateBalance]);

  // 钱包检测逻辑
  useEffect(() => {
    checkWalletInstallation();

    const cleanup = setupWalletInstallationListener(checkWalletInstallation);
    const handleVisibilityChange = () => {
      if (!document.hidden) checkWalletInstallation();
    };
    const handleFocus = () => checkWalletInstallation();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      cleanup();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkWalletInstallation]);

  // 事件监听器
  useEffect(() => {
    const handleAccountsChanged = (event: CustomEvent) => {
      const newAccounts = event.detail.accounts;
      if (newAccounts?.length > 0) {
        setState((prev) => ({ ...prev, address: newAccounts[0] }));
        if (state.provider) {
          updateBalance(newAccounts[0], state.provider);
        }
      } else {
        resetWalletState();
      }
    };

    const handleChainChanged = (event: CustomEvent) => {
      const newChainId = event.detail.chainId;
      console.log("检测到链切换事件:", newChainId);
      setState((prev) => ({ ...prev, chainId: newChainId }));

      // 延迟更新余额，等待网络稳定
      setTimeout(async () => {
        if (state.address && state.provider) {
          try {
            console.log("链切换后延迟更新余额...");
            await updateBalance(state.address, state.provider);
          } catch (error) {
            console.log("链切换后余额更新失败，等待重新连接:", error);
          }
        }
      }, 2000);
    };

    const handleWalletDisconnected = () => resetWalletState();

    // 添加事件监听器
    const events: [string, EventListener][] = [
      [
        "wallet-sdk:wallet-accounts-changed",
        handleAccountsChanged as EventListener,
      ],
      ["wallet-sdk:wallet-chain-changed", handleChainChanged as EventListener],
      ["wallet-sdk:wallet-disconnected", handleWalletDisconnected],
    ];

    events.forEach(([event, handler]) => {
      window.addEventListener(event, handler);
    });

    return () => {
      events.forEach(([event, handler]) => {
        window.removeEventListener(event, handler);
      });
    };
  }, [state.provider, state.address, updateBalance, resetWalletState]);

  // 自动连接
  useEffect(() => {
    if (!autoConnect) return;

    const savedWalletId = localStorage.getItem("wallet-sdk:last-wallet");
    if (savedWalletId && wallets.find((w) => w.id === savedWalletId)) {
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
  }, [autoConnect, wallets]);

  // 网络切换逻辑
  const switchChain = useCallback(
    async (chainId: string) => {
      try {
        console.log("Provider switchChain 开始:", {
          chainId,
          hasProvider: !!state.provider,
          providerType: state.provider?.constructor?.name,
          hasRequestMethod: typeof state.provider?.request === "function",
          currentWallet: currentWallet?.name,
        });

        if (!state.provider || !currentWallet) {
          throw new Error("No wallet connected");
        }

        const targetChain = chains.find(
          (chain) => chain.id.toString() === chainId
        );
        if (!targetChain) {
          throw new Error("Chain not supported");
        }

        console.log("目标网络:", targetChain);

        // 尝试切换网络
        try {
          console.log("尝试直接切换网络...");
          await state.provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
          });
          console.log("网络切换成功");
        } catch (switchError: any) {
          console.log(
            "直接切换失败，错误代码:",
            switchError.code,
            "错误信息:",
            switchError.message
          );

          // 如果切换失败，尝试添加网络
          if (switchError.code === 4902) {
            console.log("网络不存在，尝试添加网络...");
            const chainParams = {
              chainId: `0x${parseInt(chainId).toString(16)}`,
              chainName: targetChain.name,
              nativeCurrency: {
                name: targetChain.currency.name,
                symbol: targetChain.currency.symbol,
                decimals: targetChain.currency.decimals,
              },
              rpcUrls: [targetChain.rpcUrl],
              blockExplorerUrls: [targetChain.blockExplorer.url],
            };

            try {
              await state.provider.request({
                method: "wallet_addEthereumChain",
                params: [chainParams],
              });
              console.log("网络添加成功");
            } catch (addError: any) {
              if (addError.code === -32602) {
                console.log("参数错误，尝试使用标准配置...");
                await state.provider.request({
                  method: "wallet_addEthereumChain",
                  params: [chainParams],
                });
                console.log("使用标准配置添加网络成功");
              } else {
                throw addError;
              }
            }
          } else {
            throw switchError;
          }
        }

        // 更新状态并重新创建provider
        setState((prev) => ({ ...prev, chainId: parseInt(chainId) }));
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await recreateProviderAndUpdateBalance();
      } catch (error) {
        console.error("Provider switchChain 失败:", error);
        setState((prev) => ({ ...prev, error: error as Error }));
        throw error;
      }
    },
    [state.provider, currentWallet, chains, recreateProviderAndUpdateBalance]
  );

  // 连接钱包
  const connect = useCallback(
    async (walletID: string) => {
      try {
        const wallet = walletsMap[walletID];
        if (!wallet) throw new Error("Wallet not found");
        if (!wallet.installed)
          throw new Error(`${wallet.name} is not installed`);

        setState((prev) => ({ ...prev, isConnecting: true, error: null }));

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
          balance: "0",
        }));

        setCurrentWallet(wallet);
        localStorage.setItem("wallet-sdk:last-wallet", walletID);

        if (address && provider) {
          updateBalance(address, provider);
        }

        setModalOpen(false);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: error as Error,
        }));
      }
    },
    [walletsMap, updateBalance]
  );

  // 断开连接
  const disconnect = useCallback(async () => {
    try {
      if (state.provider && typeof state.provider.disconnect === "function") {
        await state.provider.disconnect();
      }
      if (state.provider?.removeAllListeners) {
        state.provider.removeAllListeners();
      }
    } catch (error) {
      console.error("Disconnect error:", error);
    } finally {
      resetWalletState();
    }
  }, [state.provider, resetWalletState]);

  // 获取余额
  const getBalance = useCallback(async (): Promise<string> => {
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
  }, [state.address, state.provider, balance, updateBalance]);

  const value: WalletContextValue = {
    ...state,
    connect,
    disconnect,
    switchChain,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    getBalance,
  };

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
