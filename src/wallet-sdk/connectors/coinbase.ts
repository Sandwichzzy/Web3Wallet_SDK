import type { Wallet } from "../types";
import { ethers } from "ethers";
import { isCoinbaseWalletInstalled } from "../utils/walletDetection";

const connectCoinbaseWallet = async () => {
  try {
    if (!isCoinbaseWalletInstalled()) {
      throw new Error("Coinbase Wallet not installed");
    }
    //创建一个coinbase的provider
    const coinbaseProvider = (window as any).coinbaseWalletExtension;
    const provider = new ethers.BrowserProvider(coinbaseProvider);
    //请求连接账户
    const accounts = await coinbaseProvider.request({
      method: "eth_requestAccounts",
    });
    //获取用户的钱包地址
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const { chainId } = await provider.getNetwork();

    //监听账号连接变化
    coinbaseProvider?.on("accountsChanged", (accounts: string[]) => {
      window.dispatchEvent(
        new CustomEvent("wallet-sdk:wallet-accounts-changed", {
          detail: {
            accounts: accounts,
          },
        })
      );
    });

    //监听区块链网络切换
    coinbaseProvider?.on("chainChanged", (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      window.dispatchEvent(
        new CustomEvent("wallet-sdk:wallet-chain-changed", {
          detail: {
            chainId: newChainId,
          },
        })
      );
    });

    //监听钱包切换
    coinbaseProvider?.on("disconnect", (error: any) => {
      window.dispatchEvent(
        new CustomEvent("wallet-sdk:wallet-disconnected", {
          detail: {
            error: error,
          },
        })
      );
    });

    return {
      provider,
      signer,
      address,
      chainId,
      accounts,
      disconnect: async () => {
        provider.removeAllListeners();
      },
    };
  } catch (error) {
    console.error("Error connecting Coinbase Wallet:", error);
    throw error;
  }
};

export const coinbaseWallet: Wallet = {
  id: "coinbase",
  name: "Coinbase Wallet",
  icon: "https://assets.coinbase.com/assets/coinbase-wallet-icon-16x16.png",
  connector: connectCoinbaseWallet,
  description:
    "Coinbase Wallet is a secure and easy-to-use wallet for managing your digital assets.",
  installed: isCoinbaseWalletInstalled(),
  downloadLink: "https://wallet.coinbase.com/",
};

export default coinbaseWallet;
