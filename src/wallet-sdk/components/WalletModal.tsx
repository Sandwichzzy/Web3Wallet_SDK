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
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="bg-white p-4 rounded-lg relative">
        <h2 className="text-2xl font-bold">Select a wallet</h2>
        {/* 渲染钱包列表 */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onSelectWallet(wallet);
              }}
            >
              <img
                src={wallet.icon}
                alt={wallet.name}
                className="w-6 h-6 mr-2"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{wallet.name}</div>
                <div className="text-xs text-gray-500">
                  {wallet.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
