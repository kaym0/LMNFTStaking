require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

const key = process.env.PRIVATE_KEY;
const rpc_mainnet = process.env.MAINNET_RPC;
const rpc_rinkeby = process.env.RINKEBY_RPC;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1
      }
    }
  },
  paths: {
    sources: "./src/contracts"
  },
  networks: {
    hardhat: {
    },
    localhost: {
      gasPrice: 30000000000
    },
    rinkeby: {
      url: process.env.RINKEBY,
      accounts: [key]
    },
    mainnet: {
      url: process.env.MAINNET,
      accounts: [key]
    }
  },
};
