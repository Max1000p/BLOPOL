require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-truffle5");
require("./node_modules/hardhat-deploy");
require('dotenv').config();

const PK = process.env.PK || "";
const RPC_URL = process.env.RPC_URL || "";
const PKMUMBAI = process.env.PKMUMBAI || "";
const RPC_URLMUMBAI = process.env.RPC_URLMUMBAI || "";


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      initialBaseFeePerGas: 0,
      chainId: 31337
    },
    goerli: {
      url: RPC_URL,
      accounts: [`${PK}`],
      chainID: 5,
    },
    mumbai: {
      url: RPC_URLMUMBAI,
      accounts: [`${PKMUMBAI}`],
      chainID: 80001,
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.18"
      }
    ]
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 100,
    },
    viaIR: true,
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
  },
};