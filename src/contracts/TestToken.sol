/// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor () ERC20("Test", "TestToken") {
        _mint(msg.sender, 145800000.0004 ether);
    }
}