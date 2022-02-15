
const { generateList, getMerkleRoot } = require("../test/functions/index");
const list = require("../data.json");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Vesting = await ethers.getContractFactory("Vesting")
    const vesting = await Vesting.deploy("0xBF54EfdfF72Cdd3dE7b219bB8B41332A6cC96C9e");

    console.log(getDeploymentCost(vesting));


    /// Creates a merkleroot from the list.
    const { root } = getMerkleRoot(list);
    await vesting.addMerkleData(root);
    console.log("Vesting deployed to:", vesting.address);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


const getDeploymentCost = (deployment) => {
    const gasLimit = deployment.deployTransaction.gasLimit;
    const gasPrice = deployment.deployTransaction.gasPrice;
    const deployCost = ethers.utils.formatUnits(gasLimit.mul(gasPrice).toString(), "18");

    return "Deploy cost: ", `${deployCost} ETHER`;
}