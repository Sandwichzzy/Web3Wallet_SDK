React Web3 DIY 钱包连接组件开发任务（自定义 Web3 钱包账户 SDK）
描述：使用 wagmi + ethers +viem 编写一个钱包连接组件, 风格类似 Rainbowkit

1. React Context 的使用 ：全局状态管理（ 用户地址/链 ID/余额全局存储...）,封装可复用的 Context 组件
2. 支持 MetaMask/Coinbase/钱包 APP 接入, 实现多钱包类型兼容
3. 使用 EIP-1193 标准实现 ：与以太坊提供者交互
4. 网络切换逻辑 ：通过 wallet_addEthereumChain 方法,实现多网络配置切换功能。
5. 钱包检测机制 ：自动检查 MetaMask/Coinbase 等安装状态，前端界面显示钱包是否安装，未安装点击跳转安装界面
6. 响应式更新 ：监听账户和链 ID 变化

最终构建： 构建 UMDJS 库，可以在主流前端浏览器环境运行，依赖于 react 框架（ 对 SDK 体积做一定优化 ）

前端界面

1. 连接钱包按钮
2. WalletModal：显示连接钱包弹窗，点击对应钱包进行连接
3. 连接成功后，显示选择的网络，账户地址，余额（监听账户和链 ID 变化）
