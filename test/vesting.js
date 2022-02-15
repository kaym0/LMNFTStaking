const { assert } = require("chai");
const truffleAssert = require("truffle-assertions");
const web3 = require("web3");
const { ethers } = require("ethers");
const Vesting = artifacts.require("Vesting");
const Token = artifacts.require("TestToken");
const MerkleTree = require("merkletreejs");
const { advanceTimeAndBlock, getMerkleRoot, getMerkleData, generateTestList } = require("./functions/index.js");

/// s.toString() shortcut.
function s(a) {
    return a.toString();
}

function parse(a) {
    return Number(web3.utils.toWei(a, "ether"));
}

function formatUnits(a) {
    return web3.utils.fromWei(a.toString(), "ether").toString();
}

const BN = ethers.BigNumber;
const abiCoder = ethers.utils.defaultAbiCoder;

require("chai").use(require("chai-as-promised")).should();

contract("Factory: LMNFT", (accounts) => {
    const testList = generateTestList(accounts);
    let vesting;
    let token;

    const timeTest = async (account, time, expectedAmount) => {
        const oneYear = 31536000;

        await advanceTimeAndBlock(time);

        const userData = testList.find((o) => o.account == account);
        const { proof } = getMerkleData(userData.account, userData.startAmount, testList);
        await vesting.claim(userData.startAmount, proof, {
            from: account,
        });

        const balanceUser = await token.balanceOf(account);
        assert.equal(Number(formatUnits(balanceUser)).toFixed(0), expectedAmount);
    };

    const testClaimable = async (account, expectedAmount) => {
        const userData = testList.find((o) => o.account == account);
        const { proof } = getMerkleData(userData.account, userData.startAmount, testList);

        const claimable = await vesting.claimable(userData.startAmount, proof, {
            from: account,
        });

        assert.equal(Number(formatUnits(claimable)).toFixed(0), expectedAmount);
    };

    before(async () => {
        vesting = await Vesting.deployed();
        token = await Token.deployed();

        await token.transfer(
            vesting.address,
            ethers.utils.parseUnits("900", "18", {
                from: accounts[0],
            })
        );
    });

    describe("totalSupply()", async () => {
        it("fetches total supply", async () => {
            const totalSupply = await vesting.totalSupply();

            assert.equal(formatUnits(totalSupply), "900");
        });
    });

    describe("addMerkleData()", async () => {
        it("owner: successfully sets merkleroot", async () => {
            const { root } = getMerkleRoot(testList);
            await vesting.addMerkleData(root, {
                from: accounts[0],
            });
        });

        it("non-owner: fails to set merkleroot", async () => {
            const { root } = getMerkleRoot(testList);
            await truffleAssert.fails(
                vesting.addMerkleData(root, {
                    from: accounts[2],
                })
            );
        });
    });

    describe("claim() in future", async () => {
        it("claims at 0.25 year", async () => {
            await timeTest(accounts[1], 31536000 / 4, "25");
        });
        it("claims at 0.5 year", async () => {
            await timeTest(accounts[2], 31536000 / 4, "50");
        });
        it("claims at 0.75 year", async () => {
            await timeTest(accounts[3], 31536000 / 4, "75");
        });
        it("claims at 1 year", async () => {
            await timeTest(accounts[4], 31536000 / 4, "100");
        });
        it("claims at 5 years", async () => {
            await timeTest(accounts[5], 31536000 / 4, "100");
        });
    });

    describe("remainingBalance", async () => {
        const balanceTest = async (account, expectedAmount) => {
            const userData = testList.find((o) => o.account == account);
            const { proof } = getMerkleData(userData.account, userData.startAmount, testList);

            const remaining = await vesting.remainingBalance(userData.startAmount, proof, {
                from: account,
            });

            assert.equal(Number(formatUnits(remaining)).toFixed(0), expectedAmount);
        };

        it("Retrieves remaining balance for accounts[1]: 75", async () => {
            await balanceTest(accounts[1], "75");
        });
        it("Retrieves remaining balance for accounts[2]: 50", async () => {
            await balanceTest(accounts[2], "50");
        });
        it("Retrieves remaining balance for accounts[3]: 25", async () => {
            await balanceTest(accounts[3], "25");
        });
        it("Retrieves remaining balance for accounts[4]: 0", async () => {
            await balanceTest(accounts[4], "0");
        });
        it("Retrieves remaining balance for accounts[5]: 0", async () => {
            await balanceTest(accounts[5], "0");
        });

        it("Retrieves remaining balance for accounts[6]: 100", async () => {
            await balanceTest(accounts[6], "100");
        });
    });

    describe("claimable", async () => {
        it("Retrieves claimable amount for accounts[1]: 75", async () => {
            await testClaimable(accounts[1], "75");
        });
        it("Retrieves claimable amount for accounts[2]: 50", async () => {
            await testClaimable(accounts[2], "50");
        });
        it("Retrieves claimable amount for accounts[3]: 25", async () => {
            await testClaimable(accounts[3], "25");
        });
        it("Retrieves claimable amount for accounts[4]: 0", async () => {
            await testClaimable(accounts[4], "0");
        });
        it("Retrieves claimable amount for accounts[5]: 0", async () => {
            await testClaimable(accounts[5], "0");
        });
        it("Retrieves claimable amount for accounts[6]: 100", async () => {
            await testClaimable(accounts[6], "100");
        });
    });

    describe("emergencyWithdraw", async () => {
        it("owner: successfully withdraws", async () => {
            await vesting.emergencyWithdraw({
                from: accounts[0],
            });
        });
        it("non-owner: fails to withdraw", async () => {
            await truffleAssert.fails(
                vesting.emergencyWithdraw({
                    from: accounts[1],
                })
            );
        });
    });
});
