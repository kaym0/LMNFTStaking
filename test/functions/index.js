const { ethers } = require("ethers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const abi = ethers.utils.defaultAbiCoder;

const generateTestList = (accounts) => {
    accounts.pop(0);
    const list = [];
    accounts.forEach((account) => {
        list.push({
            account: account,
            startAmount: ethers.utils.parseUnits("100", "18").toString(),
        });
    });

    return list;
};

const getMerkleRoot = (testList) => {
    try {
        const leafNodes = testList.map((item) => ethers.utils.hexStripZeros(abi.encode(["address", "uint256"], [item.account, item.startAmount])));
        const merkleTree = new MerkleTree(leafNodes, keccak256, { hashLeaves: true, sortPairs: true });
        const root = merkleTree.getHexRoot();
        return {
            root,
        };
    } catch (error) {
        console.log("Account does not exist");
    }
};

const getMerkleData = (account, startAmount, testList) => {
    try {
        const accountData = testList.find((o) => o.account == account);
        const leafNodes = testList.map((item) => ethers.utils.hexStripZeros(abi.encode(["address", "uint256"], [item.account, item.startAmount])));
        const merkleTree = new MerkleTree(leafNodes, keccak256, { hashLeaves: true, sortPairs: true });
        const root = merkleTree.getHexRoot();
        const leaf = keccak256(ethers.utils.hexStripZeros(abi.encode(["address", "uint256"], [account, startAmount])));
        const proof = merkleTree.getHexProof(leaf);

        return {
            root,
            leaf,
            proof,
        };
    } catch (error) {
        console.log("Account does not exist");
    }
};

const advanceTime = (time) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [time],
                id: new Date().getTime(),
            },
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            }
        );
    });
};

const advanceTimeAndBlock = async (time) => {
    await advanceTime(time);
    await advanceBlock();
    return Promise.resolve(web3.eth.getBlock("latest"));
};

const advanceBlock = () => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_mine",
                id: new Date().getTime(),
            },
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                const newBlockHash = web3.eth.getBlock("latest").hash;

                return resolve(newBlockHash);
            }
        );
    });
};


module.exports = {
    getMerkleRoot: getMerkleRoot,
    generateTestList: generateTestList,
    getMerkleData: getMerkleData,
    advanceTime: advanceTime,
    advanceTimeAndBlock: advanceTimeAndBlock,
};
