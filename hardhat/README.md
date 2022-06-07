# 如何使用ERC20代币实现买、卖功能并完成Dapp部署

> [如何使用ERC20代币实现买、卖功能并完成Dapp部署](https://mshk.top/2022/05/nuxt-node-ethers-hardhot-erc20-vendor/)

> [Demo](http://example.mshk.top/nuxt-chain-contracts-trade/)

![mshk.top](https://img.mshk.top/202205/20200531.gif)

# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```



# 部署到BSC网络

在根目录增加 `.env` 文件，写入您的变量
```
PRIVATE_KEY=Your PRIVATE KEY
BSCSCAN_API_KEY=Your BSCSCAN API Key
```

# 部署到测试网络
$ npx hardhat run deployments/deployToken.js --network bsctestnet
MSHKToken deployed to: 0x2572346dc2873c4257C3D4B5D7C18e45bf1c6825
MSHKTokenVendor deployed to: 0x8357393bBc9F67d2c049cB11926b884997d4C3F2

# 测试网络 - 验证合约 - 主合约
$ npx hardhat verify --network bsctestnet --contract contracts/ERC20MSHKToken.sol:ERC20MSHKToken 0x2572346dc2873c4257C3D4B5D7C18e45bf1c6825
Nothing to compile
Successfully submitted source code for contract
contracts/ERC20MSHKToken.sol:ERC20MSHKToken at 0x2572346dc2873c4257C3D4B5D7C18e45bf1c6825
for verification on the block explorer. Waiting for verification result...

Successfully verified contract ERC20MSHKToken on Etherscan.
https://testnet.bscscan.com/address/0x2572346dc2873c4257C3D4B5D7C18e45bf1c6825#code

# 测试网络 - 验证合约 - Vendor 合约
$ npx hardhat verify --network bsctestnet --contract contracts/ERC20MSHKTokenVendor.sol:ERC20MSHKTokenVendor 0x8357393bBc9F67d2c049cB11926b884997d4C3F2 0x2572346dc2873c4257C3D4B5D7C18e45bf1c6825
Nothing to compile
Successfully submitted source code for contract
contracts/ERC20MSHKTokenVendor.sol:ERC20MSHKTokenVendor at 0x8357393bBc9F67d2c049cB11926b884997d4C3F2
for verification on the block explorer. Waiting for verification result...

Successfully verified contract ERC20MSHKTokenVendor on Etherscan.
https://testnet.bscscan.com/address/0x8357393bBc9F67d2c049cB11926b884997d4C3F2#code

```