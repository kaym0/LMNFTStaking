const { ethers } = require("ethers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const fs = require("fs");

const accounts = [
    "0x5f8e122B6286CB158130306E8DE94fF62dCa2aa7",
    "0xD9B14Ae501F6Ec30409C0687e022E5841560a0c0",
    "0x1Fd59E39b5318B1fa625efCfeCf3FeBfAEb388a1",
    "0xD961ea8778Ad218564e412700fc61d768C9D9a64",
    "0xa248BffadEd33a0c3860e3dEACe0D0C68E3a7a0E",
    "0xf17Fc0aa8DAE14a3f1CeC2088cc6b26aeE99CacB",
    "0xA8470f9744fF2a7935AAa3A704f97A1A69f65ED2",
    "0x0579412B462f539e2718045F6C77E8913F17e91A",
    "0xe3cD1116280265F6b6a81a3975d4568e1F77ceBa",
];

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

const getMerkleTree = (testList) => {};

const getMerkleData = (account, testList) => {
    try {
        const accountData = testList.find((o) => o.account == account);
        const leafNodes = testList.map((item) => abi.encode(["address", "uint256"], [item.account, item.startAmount]));
        const merkleTree = new MerkleTree(leafNodes, keccak256, { hashLeaves: true, sortPairs: true });
        const root = merkleTree.getHexRoot();
        const leaf = keccak256(abi.encode(["address", "uint256"], [accountData.account, accountData.startAmount]));
        const proof = merkleTree.getHexProof(leaf);

        console.log(merkleTree.verify(proof, leaf, root));
        return {
            root,
            leaf,
            proof,
        };
    } catch (error) {
        console.log("Account is not in the list");
    }
};

let arr =[]
for (var i = 0; i < 5000; i++) {
arr.push(i);
}

fs.writeFileSync("test.txt", JSON.stringify(arr));
const testList = generateTestList(accounts);

console.log(testList);

const merkleData = getMerkleData(accounts[0], testList);
