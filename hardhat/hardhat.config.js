require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan")

// Dotenv 是一个零依赖模块，它将环境变量从 .env 文件加载到 process.env 中
require("dotenv").config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"
const BSCMAIN_RPC_URL = process.env.BSCMAIN_RPC_URL || "https://bsc-dataseed.binance.org/"
const BSCTESTNET_RPC_URL = process.env.BSCTESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545"
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "Your etherscan API key"
const REPORT_GAS = process.env.REPORT_GAS || false

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: { //https://hardhat.org/metamask-issue.html#metamask-chainid-issue
      chainId: 1337
    },
    localhost: {
      chainId: 31337,
    },
    bscmain: {
      url: BSCMAIN_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      //accounts: {
      //     mnemonic: MNEMONIC,
      // },
      gasPrice: 225000000000,
      saveDeployments: true,
      chainId: 56,
    },
    bsctestnet: {
      url: BSCTESTNET_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 97,
      gasPrice: 20000000000,
      // accounts: {mnemonic: mnemonic}
    },
  },

  etherscan: {
    // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
      bsc: BSCSCAN_API_KEY,
      bscTestnet:BSCSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  contractSizer: {
    runOnCompile: false,
    only: ["Raffle"],
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
      default: 1,
    },
  },
  mocha: {
      timeout: 200000, // 200 seconds max for running tests
  },
};