// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FixedGLDToken is ERC777 {
    constructor(uint256 initialSupply, address[] memory defaultOperators)
        ERC777("Gold", "GLD", defaultOperators)
    {
        _mint(msg.sender, initialSupply, "", "");
    }
}

contract FixedSale is Ownable {
    uint256 public constant PRICE = 0.2 ether;
    uint256 public immutable endOfSale;
    FixedGLDToken public immutable token;

    mapping(address => uint256) public purchasedTokens;

    event TokensPutOnSale(uint256 amountToSell);
    event TokensSold(address buyer, uint256 etherAmount, uint256 tokenAmount);
    event TokensWithdraw(address owner, uint256 amount);
    event OwnerWithdrawNotSoldTokens(address recipient, uint256 amount);
    event EtherWithdraw(address recipient, uint256 amount);

    constructor(FixedGLDToken _token, uint256 _endOfSale) {
        token = _token;
        endOfSale = _endOfSale;
    }

    function putOnSale(uint256 amountToSell) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), amountToSell), "transfer failed");
        setAvailableAmountForSale(token.balanceOf(address(this)));

        emit TokensPutOnSale(amountToSell);
    }

    modifier onlyAfterSale() {
        require(block.timestamp > endOfSale, "sale not ended");
        _;
    }
    modifier onlyEOA() {
        require(msg.sender == tx.origin, "only eoa");
        _;
    }

    function buyTokens() external payable onlyEOA {
        uint256 availableTokens = getAvailableAmountForSale();
        require(availableTokens > 0, "all tokens sold");

        uint256 availableEthers = msg.value;
        require(availableEthers > 0, "zero amount");

        uint256 tokenDecimals = token.decimals();
        uint256 tokensPurchasedBeforPoint = availableEthers / PRICE;
        availableEthers = availableEthers - tokensPurchasedBeforPoint * PRICE;
        uint256 tokensPurchasedAfterPoint = (availableEthers * 10**tokenDecimals) / PRICE;

        uint256 tokensPurchased = tokensPurchasedBeforPoint *
            10**tokenDecimals +
            tokensPurchasedAfterPoint;
        require(availableTokens >= tokensPurchased, "not enough token for sale");

        setAvailableAmountForSale(availableTokens - tokensPurchased);
        purchasedTokens[msg.sender] = purchasedTokens[msg.sender] + tokensPurchased;

        emit TokensSold(msg.sender, msg.value, tokensPurchased);
    }

    function withdraw() external onlyAfterSale {
        uint256 tokenAmout = purchasedTokens[msg.sender];
        require(tokenAmout > 0, "nothing to withdraw");
        purchasedTokens[msg.sender] = 0;
        require(token.transfer(msg.sender, tokenAmout), "transfer failed");

        emit TokensWithdraw(msg.sender, tokenAmout);
    }

    function withdrawNotSoldTokens(address recipient) external onlyOwner onlyAfterSale {
        uint256 tokenAmout = getAvailableAmountForSale();
        require(tokenAmout > 0, "nothing to withdraw");
        setAvailableAmountForSale(0);
        require(token.transfer(recipient, tokenAmout), "transfer failed");

        emit OwnerWithdrawNotSoldTokens(recipient, tokenAmout);
    }

    function withdrawEther(address payable recipient) external onlyOwner {
        uint256 etherAmout = address(this).balance;
        require(etherAmout > 0, "nothing to withdraw");
        (bool success, ) = recipient.call{value: etherAmout}("");
        require(success, "transfer failed");

        emit EtherWithdraw(recipient, etherAmout);
    }

    function getAvailableAmountForSale() public view returns (uint256) {
        return purchasedTokens[address(this)];
    }

    function setAvailableAmountForSale(uint256 newAmount) internal {
        purchasedTokens[address(this)] = newAmount;
    }
}

contract BuyerAsContract {
    FixedSale sale;

    constructor(FixedSale _sale) {
        sale = _sale;
    }

    function buy() external payable {
        sale.buyTokens{value: address(this).balance}();
    }
}
