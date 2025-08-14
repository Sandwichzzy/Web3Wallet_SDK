import WalletProvider from "./wallet-sdk/provider";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

const chains = [
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

const wallets = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "https://assets.coingecko.com/coins/images/13864/large/MetaMask_2019.png?1696501629",
    connector: () => window.ethereum.request({ method: "eth_requestAccounts" }),
  },
];

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
      </WalletProvider>
    </>
  );
}

//

export default App;
