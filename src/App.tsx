import { WalletProvider, ConnectionButton } from "./wallet-sdk";
import { ethers } from "ethers";
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
];

const wallets: Wallet[] = [metamaskWallet, coinbaseWallet];

function App() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return (
    <>
      <WalletProvider
        chains={chains}
        provider={provider}
        wallets={wallets}
        autoConnect={true}
      >
        <h1 className="text-3xl h-10 w-20 font-bold bg-red-500">test</h1>
        <ConnectionButton />
      </WalletProvider>
    </>
  );
}

//

export default App;
