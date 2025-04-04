// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Fundl} from "../src/Fundl.sol";

contract FundlScript is Script {
    Fundl public fundl;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        fundl = new Fundl();

        vm.stopBroadcast();
    }
}
