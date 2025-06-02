// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AdminAccess {
    address public adminWallet;

    constructor() {
        adminWallet = msg.sender; // set deployer as admin
    }

    function isAdmin(address user) public view returns (bool) {
        return user == adminWallet;
    }
}
