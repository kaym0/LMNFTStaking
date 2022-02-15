const { assert } = require("chai");
const truffleAssert = require("truffle-assertions");
const web3 = require("web3");
const { ethers } = require("ethers");
const Factory = artifacts.require("Factory");
const LMNFT = artifacts.require("LaunchMyNFT");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

/// s.toString() shortcut.
function s(a) {
    return a.toString();
}

function parse(a) {
    return Number(web3.utils.fromWei(a, "ether"));
}

const getMerkleProof = (whitelist, account) => {
    const leafNodes = whitelist.map((address) => address);
    const merkleTree = new MerkleTree(leafNodes, keccak256, { hashLeaves: true, sortPairs: true });
    const root = merkleTree.getHexRoot();
    const leaf = keccak256(account);
    const proof = merkleTree.getHexProof(leaf);

    return {
        root: root,
        leaf: leaf,
        proof: proof,
    };
};

const BN = ethers.BigNumber;
const abiCoder = ethers.utils.defaultAbiCoder;

const cost = "1000";
const whitelistCost = "500";

require("chai").use(require("chai-as-promised")).should();

contract("Factory: LMNFT", (accounts) => {
    let launch;
    let clone;
    let factory;
    const bytecode = abiCoder.encode(
        ["address[]", "uint256[]", "string", "string", "string", "bool", "address", "uint256", "uint256", "uint256"],
        [[accounts[0]], ["1"], "LMNFT", "LMNFT", "https://google.com/", true, accounts[0], cost, whitelistCost, "500"]
    );
    const whitelist = [accounts[0], accounts[1], accounts[2], accounts[3], accounts[4], accounts[5]];

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

    describe("setWhitelist", async () => {
        const { root } = getMerkleProof(whitelist, accounts[0]);

        it("original: successs as owner", async () => {
            await launch.setWhitelist(root, { from: accounts[0] });
        });

        it("original: fails as non-owner", async () => {
            await truffleAssert.fails(launch.setWhitelist(root, { from: accounts[5] }));
        });

        it("clone: successs as owner", async () => {
            await clone.setWhitelist(root, { from: accounts[0] });
        });
        it("clone: fails as non-owner", async () => {
            await truffleAssert.fails(clone.setWhitelist(root, { from: accounts[5] }));
        });
    });

    describe("whitelistActive", async () => {
        it("Whitelist inactive in primary contract", async () => {
            const active = await launch.whitelistActive();
            assert.equal(active, true);
        });
        it("Whitelist inactive in clone contract", async () => {
            const active = await clone.whitelistActive();
            assert.equal(active, true);
        });
    });

    describe("whitelistMint", async () => {
        it("original: Successfully mints as whitelist member", async () => {
            const { proof } = getMerkleProof(whitelist, accounts[0]);
            await launch.whitelistMint(proof, {
                from: accounts[0],
                value: whitelistCost,
            });
        });

        it("original: Successfully mints as whitelist member", async () => {
            const { proof } = getMerkleProof(whitelist, accounts[1]);
            await launch.whitelistMint(proof, {
                from: accounts[1],
                value: whitelistCost,
            });
        });

        it("original: Fails to mint second time as whitelisted", async () => {
            const { proof } = getMerkleProof(whitelist, accounts[0]);
            await truffleAssert.fails(
                launch.whitelistMint(proof, {
                    from: accounts[0],
                    value: whitelistCost,
                })
            );
        });

        it("clone: Successfully mints as whitelist member", async () => {
            const { proof } = getMerkleProof(whitelist, accounts[0]);
            await clone.whitelistMint(proof, {
                from: accounts[0],
                value: whitelistCost,
            });
        });

        it("clone: Successfully mints as whitelist member", async () => {
            const { proof } = getMerkleProof(whitelist, accounts[1]);
            await clone.whitelistMint(proof, {
                from: accounts[1],
                value: whitelistCost,
            });
        });

        it("clone: Fails to mint second time as whitelisted", async () => {
            const { proof } = getMerkleProof(whitelist, accounts[0]);
            await truffleAssert.fails(
                clone.whitelistMint(proof, {
                    from: accounts[0],
                    value: whitelistCost,
                })
            );
        });
    });

    describe("original.mint()", async () => {});

    describe("mint()", async () => {
        it("original: Fails, whitelist is active!", async () => {
            await truffleAssert.fails(launch.mint({ from: accounts[0], value: "1" }));
        });

        it("clone: Fails, whitelist is active!", async () => {
            await truffleAssert.fails(clone.mint({ from: accounts[0], value: "1" }));
        });
    });

    describe("toggleWhitelist()", async () => {
        it("original: success as owner", async () => {
            await launch.toggleWhitelist({ from: accounts[0] });
        });

        it("original: fails as non-owner", async () => {
            await truffleAssert.fails(launch.toggleWhitelist({ from: accounts[1] }));
        });

        it("clone: success as owner", async () => {
            await clone.toggleWhitelist({ from: accounts[0] });
        });

        it("clone: fails as non-owner", async () => {
            await truffleAssert.fails(clone.toggleWhitelist({ from: accounts[1] }));
        });
    });

    describe("mint() (after whitelist disabled", async () => {
        it("original: success", async () => {
            await launch.mint({
                from: accounts[0],
                value: cost,
            });
        });

        it("original: fails: insufficient funds", async () => {
            await truffleAssert.fails(
                launch.mint({
                    from: accounts[0],
                    value: "1",
                })
            );
        });

        it("original: fails: too many funds", async () => {
            await truffleAssert.fails(
                launch.mint({
                    from: accounts[0],
                    value: "1000000000",
                })
            );
        });

        it("clone: success", async () => {
            await clone.mint({
                from: accounts[0],
                value: cost,
            });
        });

        it("clone: fails: insufficient funds", async () => {
            await truffleAssert.fails(
                clone.mint({
                    from: accounts[0],
                    value: "1",
                })
            );
        });

        it("clone: fails: too many funds", async () => {
            await truffleAssert.fails(
                clone.mint({
                    from: accounts[0],
                    value: "1000000000",
                })
            );
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
    describe("", async () => {});
});
