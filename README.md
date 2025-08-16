# Web3 Wallet Connect SDK

一个功能完整的 React Web3 钱包连接组件库，类似 Rainbowkit 风格，支持多钱包类型和多网络切换。

## ✨ 功能特性

- 🔗 **多钱包支持**：MetaMask、Coinbase Wallet 等主流钱包
- 🌐 **多网络切换**：支持 Ethereum、Polygon、Sepolia 等网络
- 📱 **响应式设计**：现代化的 UI 设计，支持移动端和桌面端
- 🔄 **自动重连**：支持钱包断开后的自动重连
- 💰 **余额显示**：实时显示钱包余额和网络信息
- 🎯 **钱包检测**：自动检测钱包安装状态，未安装时提供下载链接
- 🎯 **EIP-1193 标准**: 遵循以太坊提供者标准

## 🚀 快速开始

### 安装依赖

```bash
npm install ethers react react-dom
# 或者使用 pnpm
pnpm add ethers react react-dom
```

### 基础使用

```tsx
import { WalletProvider, ConnectionButton } from "./wallet-sdk";
import { metamaskWallet, coinbaseWallet } from "./wallet-sdk/connectors";

// 配置支持的区块链网络
const chains = [
  {
    id: 1,
    name: "Ethereum",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
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
  // 添加更多网络...
];

// 配置支持的钱包
const wallets = [metamaskWallet, coinbaseWallet];

function App() {
  return (
    <WalletProvider chains={chains} wallets={wallets} autoConnect={true}>
      <ConnectionButton />
    </WalletProvider>
  );
}
```

## 📚 API 文档

### WalletProvider

钱包连接的核心提供者组件，管理全局钱包状态。

#### Props

| 属性          | 类型        | 默认值  | 说明                       |
| ------------- | ----------- | ------- | -------------------------- |
| `chains`      | `Chain[]`   | `[]`    | 支持的区块链网络列表       |
| `wallets`     | `Wallet[]`  | `[]`    | 支持的钱包列表             |
| `autoConnect` | `boolean`   | `false` | 是否自动连接上次使用的钱包 |
| `children`    | `ReactNode` | -       | 子组件                     |

#### 状态值

```tsx
const {
  address, // 当前连接的钱包地址
  chainId, // 当前网络 ID
  isConnected, // 是否已连接
  isConnecting, // 是否正在连接
  balance, // 当前余额
  chains, // 支持的网络列表
  error, // 错误信息
  connect, // 连接钱包方法
  disconnect, // 断开连接方法
  switchChain, // 切换网络方法
  openModal, // 打开钱包选择弹窗
  getBalance, // 获取余额方法
} = useWallet();
```

### ConnectionButton

主要的钱包连接按钮组件，支持连接、断开、网络切换等功能。

#### Props

| 属性              | 类型                   | 默认值       | 说明             |
| ----------------- | ---------------------- | ------------ | ---------------- |
| `label`           | `string`               | `"连接钱包"` | 按钮显示文本     |
| `showBalance`     | `boolean`              | `true`       | 是否显示余额     |
| `showNetwork`     | `boolean`              | `true`       | 是否显示网络信息 |
| `showAddress`     | `boolean`              | `true`       | 是否显示地址     |
| `size`            | `"sm" \| "md" \| "lg"` | `"md"`       | 按钮大小         |
| `customClassName` | `string`               | `""`         | 自定义 CSS 类名  |

#### 回调函数

```tsx
<ConnectionButton
  onConnect={() => console.log("钱包已连接")}
  onDisconnect={() => console.log("钱包已断开")}
  onChainChange={(chainId) => console.log("网络已切换:", chainId)}
  onBalanceChange={(balance) => console.log("余额已更新:", balance)}
/>
```

### WalletModal

钱包选择弹窗组件，显示可用的钱包列表。

### WalletDetailModal

钱包详情弹窗组件，显示地址、余额、网络等详细信息。

## 🔧 配置说明

### 网络配置

```tsx
interface Chain {
  id: number; // 网络 ID
  name: string; // 网络名称
  rpcUrl: string; // RPC 节点 URL
  currency: {
    name: string; // 货币名称
    symbol: string; // 货币符号
    decimals: number; // 小数位数
  };
  blockExplorer: {
    name: string; // 区块浏览器名称
    url: string; // 区块浏览器 URL
  };
}
```

### 钱包配置

```tsx
interface Wallet {
  id: string; // 钱包唯一标识
  name: string; // 钱包显示名称
  icon: string; // 钱包图标
  connector: () => Promise<any>; // 连接器函数
  description?: string; // 钱包描述
  installed?: boolean; // 是否已安装
  downloadLink?: string; // 下载链接
}
```

## 🎨 自定义样式

组件使用 Tailwind CSS 进行样式设计，支持通过 `customClassName` 属性进行样式覆盖：

```tsx
<ConnectionButton customClassName="my-custom-button" size="lg" />
```

## 📱 支持的钱包

### MetaMask

- 自动检测安装状态
- 支持账户切换和网络切换
- 响应式状态更新

### Coinbase Wallet

- 自动检测安装状态
- 提供下载链接（未安装时）
- 完整的连接流程

## 🌐 支持的网络

- **Ethereum Mainnet** (ID: 1)
- **Sepolia Testnet** (ID: 11155111)
- **Polygon Mainnet** (ID: 137)
- 支持自定义网络配置

## 🔄 事件系统

SDK 使用自定义事件进行状态同步：

- `wallet-sdk:wallet-accounts-changed` - 账户变化事件
- `wallet-sdk:wallet-chain-changed` - 网络变化事件
- `wallet-sdk:wallet-disconnected` - 断开连接事件

## 🚨 错误处理

SDK 提供完善的错误处理机制：

- 网络连接错误
- 钱包连接失败
- 网络切换失败
- 余额获取失败

## 📦 项目结构

```
src/wallet-sdk/
├── components/           # UI 组件
│   ├── ConnectionButton.tsx      # 主要连接按钮
│   ├── WalletModal.tsx           # 钱包选择弹窗
│   └── WalletDetailModal.tsx     # 钱包详情弹窗
├── connectors/           # 钱包连接器
│   ├── metamask.ts              # MetaMask 连接器
│   └── coinbase.ts              # Coinbase 连接器
├── provider/             # 状态管理
│   └── index.tsx                # WalletProvider 实现
├── utils/                # 工具函数
│   └── walletDetection.ts       # 钱包检测工具
├── types.ts              # 类型定义
└── index.ts              # 主入口文件
```

## 🛠️ 开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请提交 Issue 或联系开发团队。

---

**注意**: 这是一个开发中的项目，API 可能会有变化。在生产环境使用前，请确保充分测试。
