// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract GLDToken is ERC777 {
    constructor(uint256 initialSupply, address[] memory defaultOperators)
        ERC777("Gold", "GLD", defaultOperators)
    {
        _mint(msg.sender, initialSupply, "", "");
    }
}

contract Sale is Ownable {
    mapping(address => uint256) public purchasedTokens;
    uint256 constant PRICE = 0.2 ether;
    GLDToken public token;

    constructor(uint256 _amountToSell, GLDToken _token) {
        token = _token;
        token.transferFrom(msg.sender, address(this), _amountToSell);
    }

    modifier onlyAfterSale() {
        require(block.timestamp > 1661790839, "sale not ended");
        _;
    }

    function buyTokens() external payable {
        require(msg.value > 0, "zero amount");
        require(msg.sender == tx.origin, "only eoa");
        uint256 tokensPurchased = msg.value / PRICE;
        purchasedTokens[msg.sender] =
            purchasedTokens[msg.sender] +
            tokensPurchased;
    }

    function withdraw() external onlyAfterSale {
        require(
            token.transfer(msg.sender, purchasedTokens[msg.sender]),
            "transfer failed"
        );
        purchasedTokens[msg.sender] = 0;
    }

    function withdrawEther(address payable recipient) external onlyOwner {
        recipient.transfer(address(this).balance);
    }
}
