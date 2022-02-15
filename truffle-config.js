require("dotenv").config();
const { API_URL, MNEMONIC } = process.env;
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("babel-register");
require("babel-polyfill");
const web3 = require("web3");

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            gasPrice: web3.utils.toWei("200", "gwei"),
            network_id: "*", // Match any network id
        },
        mainnet: {
            provider: () => new HDWalletProvider(MNEMONIC, ""),
            network_id: 1,
            gasPrice: web3.utils.toWei("200", "gwei"),
            gas: 5500000,
            confirmations: 4,
            timeoutBlocks: 200,
            skipDryRun: false,
        },
        mumbai: {
            provider: () => new HDWalletProvider(MNEMONIC, ""),
            network_id: 80001,
            confirmations: 10,
            timeoutBlocks: 200,
            skipDryRun: true,
        },
        rinkeby: {
            provider: () => new HDWalletProvider(MNEMONIC, ""),
            network_id: 4,
            confirmations: 0,
            timeoutBlocks: 0,
            skipDryRun: true,
        },
        polygon: {
            provider: () => new HDWalletProvider(MNEMONIC, ""),
            network_id: 137,
            confirmations: 10,
            timeoutBlock: 200,
            skipDryRun: false,
        },
        ropsten: {
            provider: () => new HDWalletProvider(MNEMONIC, ``),
            network_id: 3, // Ropsten's id
            gas: 5500000, // Ropsten has a lower block limit than mainnet
            confirmations: 2, // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
        },
        bsc: {
            provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
            network_id: 56,
            confirmations: 10,
            timeoutBlocks: 200,
            skipDryRun: true,
        },
    },
    compilers: {
        solc: {
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1,
                },
            },
            version: "0.8.11",
        },
    },
    contracts_directory: "./src/contracts/",
    contracts_build_directory: "./src/abis/",
};
