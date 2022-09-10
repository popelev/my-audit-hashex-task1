# HashEx Cyber Academy. Task 1. Audit

Task Source - https://github.com/popelev/hashex-task1-audit/blob/master/contracts/TaskSource.sol  
My version of contract - https://github.com/popelev/hashex-task1-audit/blob/master/contracts/FixedTask.sol

0. Can not "transferFrom" in Sale constructor without allowance.
   Sale contract can not recieve allowance before it will be deployed, because we need address Sale contract for give allowance.

```solidity
constructor(uint256 _amountToSell, GLDToken _token) {
    token = _token;
    token.transferFrom(msg.sender, address(this), _amountToSell);
}

```

Constructor splited for two functions. Befor call "putOnSale" msg.sender should give allowance to Sale contract

```solidity
constructor(GLDToken _token) {
    token = _token;
}

function putOnSale(uint256 _amountToSell) external onlyOwner {
    require(token.transferFrom(msg.sender, address(this), _amountToSell), "transfer failed");
    setAvailableAmountForSale(token.balanceOf(address(this)));
}

```

1. Not used "import ERC20.sol".

2. SWC-116 Block values as a proxy for time:
   Magic number changed on named constant varible

```solidity
modifier onlyAfterSale {
    require(block.timestamp > 1661790839, "sale not ended");
    _;
}
```

3. "transfer" function is not recomended for use

```solidity
function withdrawEther(address payable recipient) external onlyOwner {
    recipient.transfer(address(this).balance);
}

```

"transfer" -> "call":

```solidity
function withdrawEther(address payable recipient) external onlyOwner {
    recipient.call{ value: address(this).balance };
}

```

4. Incorrect calculation "tokensPurchased" (without decimals)

```solidity
uint256 tokensPurchased = msg.value / PRICE;
```

5. Recomend add function "withdrawNotSoldTokens" to contract

6. Recomend add events
