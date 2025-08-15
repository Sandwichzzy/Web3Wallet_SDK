import { useWallet } from "../provider";
import { useEffect, useState } from "react";

interface ConnectionButtonProps {
  label?: string;
  showBalance?: boolean;
  showNetwork?: boolean;
  showAddress?: boolean;
  size?: "sm" | "md" | "lg";
  customClassName?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onChainChange?: (chainId: number) => void;
  onBalanceChange?: (balance: string) => void;
}

const ConnectionButton = ({
  label = "连接钱包",
  showBalance = true,
  showNetwork = true,
  showAddress = true,
  size = "md",
  customClassName = "",
  onConnect,
  onDisconnect,
  onChainChange,
  onBalanceChange,
}: ConnectionButtonProps) => {
  const {
    disconnect,
    isConnected,
    address,
    chainId,
    balance,
    chains,
    isConnecting,
    error,
    openModal,
    switchChain,
  } = useWallet();

  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // 获取当前网络信息
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

  // 获取网络图标颜色
  const getNetworkColor = (chainId: number | null) => {
    if (!chainId) return "bg-gray-500";

    switch (chainId) {
      case 1:
        return "bg-blue-500"; // Ethereum Mainnet
      case 137:
        return "bg-purple-500"; // Polygon
      case 56:
        return "bg-yellow-500"; // BSC
      case 11155111:
        return "bg-green-500"; // sepolia
      default:
        return "bg-gray-500";
    }
  };

  // 处理网络切换
  const handleNetworkSwitch = async (targetChainId: number) => {
    if (!isConnected) {
      alert("请先连接钱包");
      return;
    }

    if (targetChainId === chainId) {
      setShowNetworkDropdown(false);
      return;
    }

    try {
      setIsSwitchingNetwork(true);
      await switchChain(targetChainId.toString());
      if (onChainChange) {
        onChainChange(targetChainId);
      }
      setShowNetworkDropdown(false);
    } catch (error) {
      console.error("Failed to switch network:", error);
      alert(
        `网络切换失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-2",
    md: "text-base px-4 py-3",
    lg: "text-lg px-6 py-4",
  };

  const buttonSize = sizeClasses[size];

  // 处理连接成功回调
  useEffect(() => {
    if (isConnected && onConnect) {
      onConnect();
    }
  }, [isConnected, onConnect]);

  // 处理网络变化回调
  useEffect(() => {
    if (chainId && onChainChange) {
      onChainChange(chainId);
    }
  }, [chainId, onChainChange]);

  // 处理余额变化回调
  useEffect(() => {
    if (balance && onBalanceChange) {
      onBalanceChange(balance);
    }
  }, [balance, onBalanceChange]);

  // 处理断开连接
  const handleDisconnect = async () => {
    try {
      await disconnect();
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error("Failed to disconnect wallet", error);
    }
  };

  // 未连接状态 - 显示连接按钮
  if (!isConnected) {
    return (
      <div className={`inline-flex ${customClassName}`}>
        <button
          className={`${buttonSize} bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg`}
          onClick={openModal}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>连接中...</span>
            </>
          ) : (
            <>
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>{label}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // 已连接状态 - 显示钱包信息
  return (
    <div className={`inline-flex items-center space-x-3 ${customClassName}`}>
      {/* 网络信息 - 可点击切换 */}
      {showNetwork && (
        <div className="relative">
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
            disabled={isSwitchingNetwork}
          >
            <div
              className={`w-3 h-3 rounded-full ${getNetworkColor(chainId)}`}
            ></div>
            <span className="text-sm font-medium text-gray-700">
              {currentChain
                ? currentChain.name
                : `Chain ID: ${chainId || "Unknown"}`}
            </span>
            {!isSwitchingNetwork && (
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  showNetworkDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
            {isSwitchingNetwork && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </button>

          {/* 网络选择下拉菜单 */}
          {showNetworkDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-2">
                  选择网络
                </div>
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors duration-150 ${
                      chain.id === chainId
                        ? "bg-blue-50 border border-blue-200"
                        : ""
                    }`}
                    onClick={() => handleNetworkSwitch(chain.id)}
                    disabled={isSwitchingNetwork}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${getNetworkColor(
                        chain.id
                      )}`}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {chain.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {chain.currency.symbol} • {chain.id}
                      </div>
                    </div>
                    {chain.id === chainId && (
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 点击外部关闭下拉菜单 */}
          {showNetworkDropdown && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNetworkDropdown(false)}
            />
          )}
        </div>
      )}

      {/* 余额信息 */}
      {showBalance && (
        <div className="px-3 py-2 bg-green-100 rounded-lg">
          <span className="text-sm font-medium text-green-700">
            {formatBalance(balance)} {currentChain?.currency?.symbol || "ETH"}
          </span>
        </div>
      )}

      {/* 地址信息 */}
      {showAddress && address && (
        <div className="px-3 py-2 bg-blue-100 rounded-lg">
          <span className="text-sm font-medium text-blue-700 font-mono">
            {formatAddress(address)}
          </span>
        </div>
      )}

      {/* 断开连接按钮 */}
      <button
        className={`${buttonSize} bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg`}
        onClick={handleDisconnect}
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>断开</span>
      </button>

      {/* 错误提示 */}
      {error && (
        <div className="px-3 py-2 bg-red-100 border border-red-300 rounded-lg">
          <span className="text-sm text-red-700">{error.message}</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionButton;
