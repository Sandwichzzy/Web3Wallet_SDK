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
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/56HjACR3rieEsXnBAsET7",
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
    name: "Sepolia",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/56HjACR3rieEsXnBAsET7",
    currency: {
      name: "Sepolia Ether",
      symbol: "ETH",
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
    rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/56HjACR3rieEsXnBAsET7",
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
];

const wallets: Wallet[] = [metamaskWallet, coinbaseWallet];

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <WalletProvider chains={chains} wallets={wallets} autoConnect={true}>
        <ConnectionButton />
      </WalletProvider>
    </div>
  );
}

export default App;
