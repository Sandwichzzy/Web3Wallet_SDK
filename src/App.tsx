import { WalletProvider, ConnectionButton } from "./wallet-sdk";
import type { Chain, Wallet } from "./wallet-sdk/types";
import { metamaskWallet } from "./wallet-sdk/connectors/metamask";
import { coinbaseWallet } from "./wallet-sdk/connectors/coinbase";

declare global {
  interface Window {
    ethereum: any;
  }
}

const chains: Chain[] = [
  {
    id: 1,
    name: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
  },
  {
    id: 11155111,
    name: "SEPOLIA",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    currency: {
      name: "Sepolia",
      symbol: "SEP",
      decimals: 18,
    },
    blockExplorer: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
    },
  },
  {
    id: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    currency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    blockExplorer: {
      name: "Polygonscan",
      url: "https://polygonscan.com",
    },
  },
  {
    id: 56,
    name: "BSC",
    rpcUrl: "https://bsc-dataseed.binance.org",
    currency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    blockExplorer: {
      name: "BscScan",
      url: "https://bscscan.com",
    },
  },
];

const wallets: Wallet[] = [metamaskWallet, coinbaseWallet];

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <WalletProvider chains={chains} wallets={wallets} autoConnect={true}>
        <div className="max-w-4xl mx-auto px-4">
          <ConnectionButton />
        </div>
      </WalletProvider>
    </div>
  );
}

export default App;
