import type { Wallet } from "../types";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onSelectWallet: (wallet: Wallet) => void;
  connecting: boolean;
  error: Error | null;
}

const WalletModal = ({
  isOpen,
  onClose,
  wallets,
  onSelectWallet,
  connecting,
  error,
}: WalletModalProps) => {
  if (!isOpen) return null;

  const handleWalletSelect = (wallet: Wallet) => {
    if (wallet.installed) {
      onSelectWallet(wallet);
    } else if (wallet.downloadLink) {
      // 打开下载链接
      window.open(wallet.downloadLink, "_blank");
    }
  };

  const getWalletStatusText = (wallet: Wallet) => {
    if (wallet.installed) {
      return "已安装";
    } else {
      return "未安装";
    }
  };

  const getWalletStatusColor = (wallet: Wallet) => {
    if (wallet.installed) {
      return "text-green-600";
    } else {
      return "text-red-600";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg relative max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题和关闭按钮 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">选择钱包</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        )}

        {/* 连接状态 */}
        {connecting && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-700 text-sm">正在连接钱包...</p>
            </div>
          </div>
        )}

        {/* 钱包列表 */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                wallet.installed
                  ? "hover:bg-gray-100 border border-gray-200"
                  : "bg-gray-50 border border-gray-200 opacity-75"
              }`}
              onClick={() => handleWalletSelect(wallet)}
            >
              {/* 钱包图标 */}
              <div className="flex-shrink-0 mr-4">
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  className="w-10 h-10 rounded-full"
                />
              </div>

              {/* 钱包信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {wallet.name}
                  </div>
                  <span
                    className={`text-xs font-medium ${getWalletStatusColor(
                      wallet
                    )}`}
                  >
                    {getWalletStatusText(wallet)}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {wallet.description}
                </div>

                {/* 未安装钱包的下载提示 */}
                {!wallet.installed && wallet.downloadLink && (
                  <div className="mt-2 text-xs text-blue-600">
                    点击安装 {wallet.name}
                  </div>
                )}
              </div>

              {/* 箭头图标 */}
              <div className="flex-shrink-0 ml-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            选择已安装的钱包进行连接，或点击未安装的钱包进行下载
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
