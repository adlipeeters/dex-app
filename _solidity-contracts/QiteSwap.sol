//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./QitePool.sol";

contract QiteSwap is Ownable {
    address[] public allPairs;

    mapping(address => mapping(address => QitePool)) public getPair;

    event PairCreated(
        address indexed token1,
        address indexed token2,
        address pair
    );

    constructor() Ownable(msg.sender) {}

    function createPairs(
        address token1,
        address token2,
        string calldata token1Name,
        string calldata token2Name
    ) external returns (address) {
        require(token1 != token2, "Identical address is not allowed");
        require(
            address(getPair[token1][token2]) == address(0),
            "Pair already exists"
        );

        string memory liquidityTokenName = string(
            abi.encodePacked("Liquidity-", token1Name, "-", token2Name)
        );

        string memory liquidityTokenSymbol = string(
            abi.encodePacked("LP-", token1Name, "-", token2Name)
        );

        QitePool qitePool = new QitePool(
            token1,
            token2,
            liquidityTokenName,
            liquidityTokenSymbol
        );

        qitePool.transferOwnership(owner());

        getPair[token1][token2] = qitePool;
        getPair[token2][token1] = qitePool;
        allPairs.push(address(qitePool));

        emit PairCreated(token1, token2, address(qitePool));

        return address(qitePool);
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function getPairs() external view returns (address[] memory) {
        return allPairs;
    }
}
