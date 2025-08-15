import { useWallet } from "../provider";
import { useState } from "react";
import { ethers } from "ethers";

interface ConnectionButtonProps {
  lable?: string;
  showBalance?: boolean;
  size?: "sm" | "md" | "lg";
  customClassName?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onChainChange?: (chainId: number) => void;
  onBalanceChange?: (balance: string) => void;
}

const ConnectionButton = ({
  lable,
  showBalance,
  size,
  customClassName,
  onConnect,
  onDisconnect,
  onChainChange,
  onBalanceChange,
}: ConnectionButtonProps) => {
  const {
    connect,
    disconnect,
    isConnected,
    address,
    chainId,
    ensName,
    error,
    openModal,
    closeModal,
  } = useWallet();

  //展示钱包余额
  const [balance, setBalance] = useState<string | null>("");

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-2",
    lg: "text-lg px-4 py-3",
  };

  // 设置默认尺寸
  const buttonSize = size || "md";

  const handleConnect = async () => {
    try {
      await connect("injected");
    } catch (error) {
      console.error("Failed to connect wallet", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet", error);
    }
  };

  if (!isConnected) {
    return (
      <button
        className={`${sizeClasses[buttonSize]} bg-blue-500 text-white rounded-md ${customClassName}`}
        onClick={openModal}
      >
        {lable}
      </button>
    );
  } else {
    return (
      <button
        className={`${sizeClasses[buttonSize]} bg-blue-500 text-white rounded-md ${customClassName}`}
        onClick={handleDisconnect}
      >
        {lable}
      </button>
    );
  }
};

export default ConnectionButton;
