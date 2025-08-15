import { useWallet } from "../provider";
import { useState } from "react";

interface WalletDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletDetailModal = ({ isOpen, onClose }: WalletDetailModalProps) => {
  const { address, balance, chainId, disconnect, chains } = useWallet();
  const [copyStatus, setCopyStatus] = useState<string>("");

  if (!isOpen) return null;

  const currentChain = chains.find((chain) => chain.id === chainId);

  // 格式化地址显示
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 格式化余额显示
  const formatBalance = (bal: string) => {
    if (!bal || bal === "0") return "0";
    const num = parseFloat(bal);
    if (num < 0.001) return "< 0.001";
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(3);
    return num.toFixed(2);
  };

  // 复制地址
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address || "");
      setCopyStatus("已复制!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (error) {
      console.error("复制失败:", error);
      setCopyStatus("复制失败");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  // 断开连接
  const handleDisconnect = async () => {
    try {
      await disconnect();
      onClose();
    } catch (error) {
      console.error("断开连接失败:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg relative max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 头像和地址 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-800 font-mono">
            {formatAddress(address || "")}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatBalance(balance)} {currentChain?.currency?.symbol || "ETH"}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleCopyAddress}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-700">{copyStatus || "复制地址"}</span>
          </button>

          <button
            onClick={handleDisconnect}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-gray-700">断开连接</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDetailModal;
