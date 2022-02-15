//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ILaunchMyNft {
    function init(bytes calldata data) external;
}

contract Factory {
    constructor() {}
    event Deployed (address indexed deployed);

    function launch (address implementation, bytes memory data) external returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, implementation))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "Contract failed to deploy.");
        emit Deployed(instance);

        ILaunchMyNft(instance).init(data);
    }
}