import { ethers } from "ethers";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const VLaunch = await ethers.getContractFactory("VLaunch");
    const vlaunch = await VLaunch.deploy("0xBF54EfdfF72Cdd3dE7b219bB8B41332A6cC96C9e");
    //const vlaunch = await (await ethers.getContractFactory("MyContract")).attach("0xC89C55c62128B8aE7Cb1c4923733585Ca709eA74");

    for (let i = 0; i < addresses.length; i++) {
        await vlaunch.updateUserAmount(addresses[i], amounts[i]);
        console.log();
    }

    console.log("VLaunch deployed to:", vlaunch.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
