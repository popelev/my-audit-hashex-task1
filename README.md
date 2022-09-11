# My audit practice. Hashex Academy. Task 1


## Table of contents

- [1 Disclaimer](#1-disclaimer)
- [2 Overview](#2-overview)
  - [2.1 Summary](#21-summary)
  - [2.2 Contracts](#22-contracts)
- [3 Found Issues](#3-found-issues)
  - [C1. GLDToken](#c1-gldtoken)
  - [C2. Sale](#c2-sale)
- [4 Contracts](#4-contracts)
  - [C1. GLDToken](#c1-gldtoken)
  - [C2 Sale](#c2-sale)
    - [C2-01. Constructor Business logic](#c2-01-constructor-business-logic)
    - [C2-02. Unchecked math](#c2-02-unchecked-math)
    - [C2-03. Logic depend on gas costs](#c2-03-logic-depend-on-gas-costs)
    - [C2-04. Block values as a proxy for time:](#c2-04-block-values-as-a-proxy-for-time)
    - [C2-05. Code With No Effects](#c2-05-code-with-no-effects)
    - [C2-06. Withdraw Business logic](#c2-06-withdraw-business-logic)
    - [C2-07. Best practices ecommendations](#c2-07-best-practices-ecommendations)
- [Appendix A - Issuse severity classification](#appendix-a---issuse-severity-classification)
  - [Critical](#critical)
  - [High](#high)
  - [Medium](#medium)
  - [Low](#low)
  - [Info](#info)
- [Appendix B - List of examined issue types](#appendix-b---list-of-examined-issue-types)
________________
## 1 Disclaimer

________________
## 2 Overview

### 2.1 Summary

* **Project Name:** practice-hashex-academy-task1
* **Source URL :** https://gist.github.com/kataloo/3674868bf07de6a98e68edff8622ed5d
* **Platform:** Ethereum
* **Language:** Solidity
* **Auditor:** Fedor Popelev 

________________

### 2.2 Contracts
Souce code was copied from source file to [audit project](https://github.com/popelev/my-audit-hashex-task1)

| Path                     |             MD5 Hash              | Description|
| :----------------------: | :-------------------------------: |:----------:|
| contracts/TaskSource.sol |  c033ca008658644afdf4b42422a42550 |Souce code  |
| contracts/FixedTask.sol |       |Code with fixed issues after audit  |

This files contain next contracts:

| Path                     |   Contract name   |   Address  |
| :----------------------: | :---------------: | :--------: |
| contracts/TaskSource.sol |  GLDToken         |            |
| contracts/TaskSource.sol |  Sale             |            |


________________
## 3 Found Issues  

|        | Critical | High     | Medium   | Low | Informational | 
|:------:|:--------:|:--------:|:--------:|:---:|:-------------:|
| Open   | **0**        |  0       | 0        | 0   |0              |
| Closed | **0**        |  0       | 0        | 0   |0              |

### C1. GLDToken

No issues were found.

### C2. Sale

| id    | Severity | Title                                         | Status | 
| ----- | -------- | --------------------------------------------- | ------ |
| C2-01 | Critical | [Title 1]()| Resolved |
| C2-02 |          |        |          |
| C2-03 |          |        |          |
| C2-04 |          |        |          |
| C2-05 |          |        |          |
| C2-06 |          |        |          |



________________
## 4 Contracts

### C1. GLDToken

No issues were found.
________________
### C2 Sale
Contract for sale ERC-777 token with timelock of withdraw. Price of token is constant.
________________
#### C2-01. Constructor Business logic
**Description:**
Can't transfer tokens with `transferFrom` function in constructor, because this contract does not have allowance to transfer from `msg.sender`.
`Sale` contract can't recieve allowance before it will be deployed, because `GLDToken.approve`  need address of `Sale` contract as parameter.
```solidity
constructor(uint256 _amountToSell, GLDToken _token) {
    token = _token;
    token.transferFrom(msg.sender, address(this), _amountToSell);
}

```

**Recommendation:**
Split constructor for two functions. After deploy `Sale` contract to network, owner of tokens should give allowance to `Sale` contract to transfer tokens. And after that call  `putOnSale()`
```solidity
constructor(GLDToken _token) {
    token = _token;
}

function putOnSale(uint256 _amountToSell) external onlyOwner {
    require(token.transferFrom(msg.sender, address(this), _amountToSell), "transfer failed");
    setAvailableAmountForSale(token.balanceOf(address(this)));
}

```
________________
#### C2-02. Unchecked math
**Description:**
Incorrect calculation `tokensPurchased` (without decimals)

Token has decimal digits (18 numbers after point). Current logic ignore that: 
```solidity
uint256 tokensPurchased = msg.value / PRICE;
```
For example:
msg.value = 1 ether  
PRICE = 0.2 ether  
tokensPurchased = 5, but must be 5000000000000000000

**Recommendation:**
Add  `token.decimals()` in calculation
```solidity
uint256 tokensPurchased = msg.value * 10**token.decimals() / PRICE
```
________________
#### C2-03. Logic depend on gas costs
**Description:**
Any smart contract that uses `transfer()`  is taking a hard dependency on gas costs by forwarding a fixed amount of gas: 2300.
```solidity
function withdrawEther(address payable recipient) external onlyOwner {
    recipient.transfer(address(this).balance);
}
```

**Recommendation:**
Our recommendation is to stop using `transfer()` and switch to using `call()` instead:
```solidity
function withdrawEther(address payable recipient) external onlyOwner {
	(bool success, ) = recipient.call{value: address(this).balance}("");
	require(success, "transfer failed");
}
```
________________
#### C2-04. Block values as a proxy for time:

**Description:**
SWC-116. `block.timestamp` used as proxy for time
```solidity
modifier onlyAfterSale {
    require(block.timestamp > 1661790839, "sale not ended");
    _;
}
```

**Recommendation:**
* Developers should write smart contracts with the notion that block values are not precise, and the use of them can lead to unexpected effects. Alternatively, they may make use oracles.

* Magic number change to named constant varible.
________________
#### C2-05. Code With No Effects
**Description:**
Imported `ERC20` contract never used.
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```

**Recommendation:**
Delete this line.
________________
#### C2-06. Withdraw Business logic
**Description:**
After finish of sale some amout of tokens can be not sold

**Recommendation:**
We recommend add function `withdrawNotSoldTokens()` to contract for withdraw not sold tokens
________________
#### C2-07. Best practices ecommendations
* Add events.
* Use one style of varible naming averywhere. Rename input varible `recipient` to `_recipient`
```solidity
function withdrawEther(address payable recipient)
```
________________
## Appendix A - Issuse severity classification 

### Critical
Issues that may cause an unlimited loss of funds or entirely break the contract workflow.  Malicious code (including malicious modifi cation of libraries) is also treated as a critical severity issue. These issues must be fi xed before deployments or fi xed in already running projects as soon as possible.

### High
Issues that may lead to a limited loss of funds, break interaction with users, or other contracts under specifi c conditions. Also, issues in a smart contract, that allow a privileged 
account the ability to steal or block other users' funds.

### Medium
Issues that do not lead to a loss of funds directly, but break the contract logic. May lead to failures in contracts operation.

### Low
Issues that are of a non-optimal code character, for instance, gas optimization tips, unused variables, errors in messages.

### Info
Issues that do not impact the contract operation. Usually, info severity issues are related to code best practices, e.g. style guide.

________________
## Appendix B - List of examined issue types

* Business logic overview
* Functionality checks
* Following best practices
* Access control and authorization
* Reentrancy attacks
* Unchecked math
* Timestamp dependence
* Forcibly sending ether to a contract
* Usage of deprecated code
* Weak sources of randomness
* ~~Front-run attacks~~
* ~~DoS with (unexpected) revert~~
* ~~DoS with block gas limit~~
* ~~Transaction-ordering dependence~~
* ~~ERC/BEP and other standards violation~~
* ~~Implicit visibility levels~~
* ~~Excessive gas usage~~
* ~~Shadowing state variables~~


