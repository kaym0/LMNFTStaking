const fs = require("fs");
const { F_OK } = require("fs");
//const Factory = artifacts.require("Factory")
//const LMNFT = artifacts.require("LaunchMyNFT")
const TestToken = artifacts.require("TestToken");
const Vesting = artifacts.require("Vesting");
const web3 = require("web3");
const { generateList, getMerkleRoot } = require("../test/functions/index");
const list = require("../data.json");

module.exports = async function deployContract(deployer, network, accounts) {
    //await deployer.deploy(Factory);
    //await deployer.deploy(LMNFT);
    await deployer.deploy(TestToken);
    const token = await TestToken.deployed();
    await deployer.deploy(Vesting, token.address);
    const vest = await Vesting.deployed();
    await token.transfer(vest.address, "25000000000000000000000000");
    const { root } = getMerkleRoot(list);
    console.log("root", root);
    await vest.addMerkleData(root);
};
