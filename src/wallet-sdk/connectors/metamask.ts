import { ethers } from "ethers";
import type { Wallet } from "../types";
import { isMetaMaskInstalled } from "../utils/walletDetection";

const connectorMetamask = async (): Promise<any> => {
  // 检查是否安装了MetaMask
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask not installed");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);

    const { chainId } = await provider.getNetwork();
    //获取用户的钱包地址
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    //监听账号连接变化
    window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
      if (newAccounts.length > 0) {
        window.dispatchEvent(
          new CustomEvent("wallet-sdk:wallet-accounts-changed", {
            detail: {
              accounts: newAccounts,
            },
          })
        );
      } else if (newAccounts.length === 0) {
        window.dispatchEvent(new CustomEvent("wallet-sdk:wallet-disconnected"));
      }
    });

    //监听区块链网络切换
    window.ethereum.on("chainChanged", (newChainIdHex: string) => {
      const newChainId = parseInt(newChainIdHex, 16);
      window.dispatchEvent(
        new CustomEvent("wallet-sdk:wallet-chain-changed", {
          detail: {
            chainId: newChainId,
          },
        })
      );
    });

    return { accounts, chainId, address, signer, provider };
  } catch (error) {
    throw new Error("Failed to connect to MetaMask" + error);
  }
};

export const metamaskWallet: Wallet = {
  id: "metamask",
  name: "MetaMask",
  icon: "https://assets.coingecko.com/coins/images/13864/large/MetaMask_2019.png?1696501629",
  connector: connectorMetamask,
  description: "MetaMask wallet",
  installed: isMetaMaskInstalled(),
  downloadLink: "https://metamask.io/download/",
};

export default metamaskWallet;
