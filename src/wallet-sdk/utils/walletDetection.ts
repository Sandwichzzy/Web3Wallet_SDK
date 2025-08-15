/**
 * 钱包检测工具函数
 * 用于检测各种Web3钱包是否已安装
 */

// 检测MetaMask是否已安装
export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;

  return (
    typeof (window as any).ethereum !== "undefined" &&
    (window as any).ethereum.isMetaMask === true
  );
}

// 检测Coinbase Wallet是否已安装
export function isCoinbaseWalletInstalled(): boolean {
  if (typeof window === "undefined") return false;

  return (
    typeof (window as any).coinbaseWalletExtension !== "undefined" &&
    (window as any).coinbaseWalletExtension !== null
  );
}

// 检测WalletConnect是否可用
export function isWalletConnectAvailable(): boolean {
  if (typeof window === "undefined") return false;

  // WalletConnect通常通过库导入使用，这里检查是否有相关的全局对象
  return (
    typeof (window as any).WalletConnect !== "undefined" ||
    typeof (window as any).WalletConnectClient !== "undefined"
  );
}

// 检测Trust Wallet是否已安装
export function isTrustWalletInstalled(): boolean {
  if (typeof window === "undefined") return false;

  return (
    typeof (window as any).ethereum !== "undefined" &&
    (window as any).ethereum.isTrust === true
  );
}

// 检测Brave Wallet是否已安装
export function isBraveWalletInstalled(): boolean {
  if (typeof window === "undefined") return false;

  return (
    typeof (window as any).ethereum !== "undefined" &&
    (window as any).ethereum.isBraveWallet === true
  );
}

// 通用钱包检测函数
export function detectWalletInstallation(walletId: string): boolean {
  switch (walletId.toLowerCase()) {
    case "metamask":
      return isMetaMaskInstalled();
    case "coinbase":
      return isCoinbaseWalletInstalled();
    case "trust":
      return isTrustWalletInstalled();
    case "brave":
      return isBraveWalletInstalled();
    case "walletconnect":
      return isWalletConnectAvailable();
    default:
      return false;
  }
}

// 获取所有已安装的钱包ID列表
export function getInstalledWallets(): string[] {
  const wallets = ["metamask", "coinbase", "trust", "brave", "walletconnect"];
  return wallets.filter((walletId) => detectWalletInstallation(walletId));
}

// 检测是否有任何钱包已安装
export function hasAnyWalletInstalled(): boolean {
  return getInstalledWallets().length > 0;
}

// 监听钱包安装事件（如果浏览器支持）
export function setupWalletInstallationListener(
  callback: () => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleWalletInstalled = () => {
    callback();
  };

  // 监听自定义钱包安装事件
  window.addEventListener("wallet-installed", handleWalletInstalled);

  // 监听ethereum对象变化（适用于某些钱包）
  let ethereumCheckInterval: NodeJS.Timeout;

  if (typeof (window as any).ethereum === "undefined") {
    ethereumCheckInterval = setInterval(() => {
      if (typeof (window as any).ethereum !== "undefined") {
        callback();
        clearInterval(ethereumCheckInterval);
      }
    }, 1000);
  }

  // 返回清理函数
  return () => {
    window.removeEventListener("wallet-installed", handleWalletInstalled);
    if (ethereumCheckInterval) {
      clearInterval(ethereumCheckInterval);
    }
  };
}
