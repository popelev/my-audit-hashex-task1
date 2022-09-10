# My audit practice. Hashex Academy. Task 1


## Table of contents

- [1 Disclaimer](#1-disclaimer)
- [2 Overview](#2-overview)
  - [2.1 Summary](#21-summary)
    - [Audit Details](#audit-details)
  - [2.2 Contracts](#22-contracts)
- [3 Found Issues](#3-found-issues)
  - [C1. GLDToken](#c1-gldtoken)
  - [C2. Sale](#c2-sale)
- [4 Contracts](#4-contracts)
  - [C2 GLDToken](#c2-gldtoken)
    - [C2-01. Issue title](#c2-01-issue-title)
  - [C2 Sale](#c2-sale)
    - [C2-0?. transferFrom in constructor](#c2-0-transferfrom-in-constructor)
    - [C2-0?. Issue title](#c2-0-issue-title)
    - [C2-0?. Issue title](#c2-0-issue-title)
    - [C2-0?. Issue title](#c2-0-issue-title)
    - [C2-0?. Issue title](#c2-0-issue-title)
    - [C2-0?. Issue title](#c2-0-issue-title)
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


#### Audit Details

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
| C2-0  |          |        |          |
| C2-0  |          |        |          |
| C2-0  |          |        |          |
| C2-0  |          |        |          |
| C2-0  |          |        |          |
| C2-0  |          |        |          |
| C2-0  |          |        |          |


________________
## 4 Contracts
________________
### C2 GLDToken
ERC-777 token. No issues were found.
________________
#### C2-01. Issue title

**Description**

**Remediation**
________________
### C2 Sale
Contract for sale ERC-777 token with timelock of withdraw. Price of token is constant
________________
#### C2-0?. transferFrom in constructor
Can not "transferFrom" in constructor without allowance.
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
________________
#### C2-0?. Issue title
Not used "import ERC20.sol".

2. SWC-116 Block values as a proxy for time:
   Magic number changed on named constant varible

```solidity
modifier onlyAfterSale {
    require(block.timestamp > 1661790839, "sale not ended");
    _;
}
```
________________
#### C2-0?. Issue title
"transfer" function is not recomended for use

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
________________
#### C2-0?. Issue title
Incorrect calculation "tokensPurchased" (without decimals)

```solidity
uint256 tokensPurchased = msg.value / PRICE;
```
________________
#### C2-0?. Issue title
Recomend add function "withdrawNotSoldTokens" to contract
________________
#### C2-0?. Issue title
Recomend add events
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


