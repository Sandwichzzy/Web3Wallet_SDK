//区块链网络配置
export type Chain = {
  id: number;
  name: string;
  rpcUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer: {
    name: string;
    url: string;
  };
};

//钱包状态
export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  ensName: string | null;
  error: Error | null;
  chains: Chain[];
  provider: any;
}

//钱包上下文值
export interface WalletContextValue extends WalletState {
  connect: (walletID: string) => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
}

//钱包配置
export interface Wallet {
  id: string;
  name: string;
  icon: string;
  connector: () => Promise<any>;
  description?: string;
  installed?: boolean;
  downloadLink?: string;
}

//钱包提供者配置
export type WalletProviderProps = {
  children: React.ReactNode;
  chains: Chain[];
  wallets: Wallet[];
  provider: any;
  autoConnect?: boolean;
};
