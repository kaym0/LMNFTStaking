const { assert } = require("chai");
const truffleAssert = require("truffle-assertions");
const web3 = require("web3");
const { ethers } = require("ethers");
const Factory = artifacts.require("Factory");
const LMNFT = artifacts.require("LaunchMyNFT");

/// s.toString() shortcut.
function s(a) {
    return a.toString();
}

function parse(a) {
    return Number(web3.utils.fromWei(a, "ether"));
}

const BN = ethers.BigNumber;
const abiCoder = ethers.utils.defaultAbiCoder;

require("chai").use(require("chai-as-promised")).should();

contract("Factory: LMNFT", (accounts) => {
    let launch;
    let clone;
    let factory;
    const bytecode = abiCoder.encode(
        ["address[]", "uint256[]", "string", "string", "string", "bool", "address", "uint256", "uint256", "uint256"],
        [[accounts[0]], ["1"], "LMNFT", "LMNFT", "https://google.com/", false, accounts[0], "2", "0", "5"]
    );

    before(async () => {
        factory = await Factory.deployed();
        launch = await LMNFT.deployed();
    });

    describe("setup base contract", async () => {
        it("successfully sets up", async () => {
            await launch.init(bytecode);
        });
    });

    describe("launch()", async () => {
        it("Successfully launches contract", async () => {
            const minimalProxyDeployment = await factory.launch(launch.address, bytecode);
            const proxyAddress = minimalProxyDeployment.receipt.rawLogs[1].address;
            clone = await LMNFT.at(proxyAddress);
        });
    });

    describe("whitelistActive", async () => {
        it("Whitelist inactive in primary contract", async () => {
            const active = await launch.whitelistActive();
            assert.equal(active, false);
        });
        it("Whitelist inactive in clone contract", async () => {
            const active = await clone.whitelistActive();
            assert.equal(active, false);
        });
    });

    describe("original.mint()", async () => {
        it("Successful mint from original contract", async () => {
            await launch.mint({ from: accounts[0], value: "2" });
        });
    });

    describe("mint()", async () => {
        it("Mints 1 with correct ether", async () => {
            await clone.mint({ from: accounts[0], value: "2" });
        });
        it("Mints 1 with correct ether", async () => {
            await clone.mint({ from: accounts[0], value: "2" });
        });
        it("Mints 1 with correct ether", async () => {
            await clone.mint({ from: accounts[0], value: "2" });
        });
        it("Mints 1 with correct ether", async () => {
            await clone.mint({ from: accounts[0], value: "2" });
        });

        it("Fails with greater than correct ether", async () => {
            await truffleAssert.fails(clone.mint({ from: accounts[0], value: "1" }));
        });

        it("Fails with less than correct ether", async () => {
            await truffleAssert.fails(clone.mint({ from: accounts[0], value: "1" }));
        });

        it("Mints final NFT with correct ether", async () => {
            await clone.mint({ from: accounts[0], value: "2" });
        });

        it("Fails minting above max supply", async () => {
            await truffleAssert.fails(clone.mint({ from: accounts[0], value: "2" }));
        });
    });

    describe("tokenURI", async () => {
        it("original contract", async () => {
            const tokenURI = await launch.tokenURI("0");
            assert.equal("https://google.com/0.json", tokenURI);
        });

        it("original contract", async () => {
            const tokenURI = await launch.tokenURI("1");
            assert.equal("https://google.com/1.json", tokenURI);
        });

        it("clone contract", async () => {
            const tokenURI = await clone.tokenURI("0");
            assert.equal("https://google.com/0.json", tokenURI);
        });

        it("clone contract", async () => {
            const tokenURI = await clone.tokenURI("1");
            assert.equal("https://google.com/1.json", tokenURI);
        });
    });

    describe("setWhitelist", async () => {
        it("original: successs as owner", async () => {
            await launch.setWhitelist("0x2e2f0c284a71d888677ac422ea9938b44d65dafbef8d13a291c91564ee001c56", { from: accounts[0] });
        });

        it("original: fails as non-owner", async () => {
            await truffleAssert.fails(launch.setWhitelist("0x2e2f0c284a71d888677ac422ea9938b44d65dafbef8d13a291c91564ee001c56", { from: accounts[5] }));
        });

        it("clone: successs as owner", async () => {
            await clone.setWhitelist("0x2e2f0c284a71d888677ac422ea9938b44d65dafbef8d13a291c91564ee001c56", { from: accounts[0] });
        });
        it("clone: fails as non-owner", async () => {
            await truffleAssert.fails(clone.setWhitelist("0x2e2f0c284a71d888677ac422ea9938b44d65dafbef8d13a291c91564ee001c56", { from: accounts[5] }));
        });
    });

    describe("", async () => {});
});
