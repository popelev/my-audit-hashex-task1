# My audit practice. Hashex Academy. Task 1

## Table of contents

-   [1 Disclaimer](#1-disclaimer)
-   [2 Overview](#2-overview)
    -   [2.1 Summary](#21-summary)
    -   [2.2 Contracts](#22-contracts)
-   [3 Found Issues](#3-found-issues)
    -   [C1. GLDToken](#c1-gldtoken)
    -   [C2. Sale](#c2-sale)
-   [4 Contracts](#4-contracts)
    -   [C1. GLDToken](#c1-gldtoken)
    -   [C2 Sale](#c2-sale)
        -   [C2-01. Constructor Business logic (Critical)](#c2-01-constructor-business-logic-critical)
        -   [C2-02. Unlimited token sale (Critical)](#c2-02-unlimited-token-sale-critical)
        -   [C2-03. Incorrect math of tokens purchase (Critical)](#c2-03-incorrect-math-of-tokens-purchase-critical)
        -   [C2-04. Logic depend on gas costs (High)](#c2-04-logic-depend-on-gas-costs-high)
        -   [C2-05. Block values as a proxy for time (Medium)](#c2-05-block-values-as-a-proxy-for-time-medium)
        -   [C2-06. Withdraw Business logic (Medium)](#c2-06-withdraw-business-logic-medium)
        -   [C2-07. Code With No Effects (Low)](#c2-07-code-with-no-effects-low)
        -   [C2-08. Best practices recommendations (Info)](#c2-08-best-practices-recommendations-info)
-   [Appendix A - Issuse severity classification](#appendix-a---issuse-severity-classification)
    -   [Critical](#critical)
    -   [High](#high)
    -   [Medium](#medium)
    -   [Low](#low)
    -   [Info](#info)
-   [Appendix B - List of examined issue types](#appendix-b---list-of-examined-issue-types)

---

## 1 Disclaimer

---

## 2 Overview

### 2.1 Summary

-   **Project Name:** practice-hashex-academy-task1
-   **Source URL :** https://gist.github.com/kataloo/3674868bf07de6a98e68edff8622ed5d
-   **Platform:** Ethereum
-   **Language:** Solidity
-   **Auditor:** Fedor Popelev

---

### 2.2 Contracts

Souce code was copied from source file to [audit project](https://github.com/popelev/my-audit-hashex-task1)

|           Path           |             MD5 Hash             |            Description             |
| :----------------------: | :------------------------------: | :--------------------------------: |
| contracts/TaskSource.sol | c033ca008658644afdf4b42422a42550 |             Souce code             |
| contracts/FixedTask.sol  |                                  | Code with fixed issues after audit |

This files contain next contracts:

|           Path           | Contract name | Address |
| :----------------------: | :-----------: | :-----: |
| contracts/TaskSource.sol |   GLDToken    |         |
| contracts/TaskSource.sol |     Sale      |         |

---

## 3 Found Issues

|        | Critical | High | Medium | Low | Informational |
| :----: | :------: | :--: | :----: | :-: | :-----------: |
|  Open  |  **0**   |  0   |   0    |  0  |       0       |
| Closed |  **0**   |  0   |   0    |  0  |       0       |

### C1. GLDToken

No issues were found.

### C2. Sale

| id    | Severity | Title                                                                                  | Status       |
| ----- | -------- | -------------------------------------------------------------------------------------- | ------------ |
| C2-01 | Critical | [Constructor Business logic](#c2-01-constructor-business-logic-critical)               | Resolved     |
| C2-02 | Critical | [Unlimited token sale](#c2-02-unlimited-token-sale-critical)                           | Resolved     |
| C2-03 | Critical | [Incorrect math of tokens purchase](#c2-03-incorrect-math-of-tokens-purchase-critical) | Resolved     |
| C2-04 | High     | [Logic depend on gas costs](#c2-04-logic-depend-on-gas-costs-high)                     | Resolved     |
| C2-05 | Medium   | [Block values as a proxy for time](#c2-06-block-values-as-a-proxy-for-time-Medium)     | Acknowledged |
| C2-06 | Medium   | [Withdraw Business logic](#c2-06-withdraw-business-logic-medium)                       | Resolved     |
| C2-07 | Low      | [Code With No Effects](#c2-07-code-with-no-effects-low)                                | Resolved     |
| C2-08 | Info     | [Best practices recommendations](#c2-08-best-practices-recommendations-info)           | Resolved     |

---

## 4 Contracts

### C1. GLDToken

No issues were found.

---

### C2 Sale

Contract for sale ERC-777 token with timelock of withdraw. Price of token is constant.

---

#### C2-01. Constructor Business logic (Critical)

**Description:**
It can't transfer tokens with `transferFrom` function in constructor, because this contract does not have allowance to transfer from `msg.sender`. `Sale` contract can't recieve allowance before it will be deployed, because `GLDToken.approve` need address of `Sale` contract as parameter.

```solidity
constructor(uint256 _amountToSell, GLDToken _token) {
    token = _token;
    token.transferFrom(msg.sender, address(this), _amountToSell);
}

```

**Recommendation:**
Split constructor for two functions. After deploy `Sale` contract to network, owner of tokens should give allowance to `Sale` contract to transfer tokens. And after that call `putOnSale()`. If `putOnSale` should be call only one time, then add additional condition.

```solidity
constructor(GLDToken _token) {
    token = _token;
}

function putOnSale(uint256 _amountToSell) external onlyOwner {
    require(token.transferFrom(msg.sender, address(this), _amountToSell), "transfer failed");
    setAvailableAmountForSale(token.balanceOf(address(this)));
}

```

---

#### C2-02. Unlimited token sale (Critical)

**Description:**
Maximum of sold tokens is unlimited. Posible situation when sold more tokens then availible to sale

**Recommendation:**
Add additional logic to control available tokens on sale and check this condition in `buyTokens()` function

```solidity
require(availableTokens >= tokensPurchased, "not enough token for sale");
```

---

#### C2-03. Incorrect math of tokens purchase (Critical)

**Description:**
Incorrect calculation `tokensPurchased` (without decimals)

Token has decimal digits (18 numbers after point). Current logic ignore that:

```solidity
uint256 tokensPurchased = msg.value / PRICE;
```

For example:
`msg.value` = 1 ether  
`PRICE` = 0.2 ether  
`tokensPurchased` = 5, but must be 5000000000000000000

**Recommendation:**
Add `token.decimals()` in calculation

```solidity
uint256 tokensPurchased = msg.value * 10**token.decimals() / PRICE
```

---

#### C2-04. Change state befor transfer tokens (High)

**Description:**
State varible with balance erased after transfer. ERC777 has hooks `_beforeTokenTransfer` which can be used for reentrency attack and transfer tokens few times.

```solidity
function withdraw() external onlyAfterSale {
    require(token.transfer(msg.sender, purchasedTokens[msg.sender]), "transfer failed");
    purchasedTokens[msg.sender] = 0;
}

```

**Recommendation:**
Our recommendation is to erase balance befor transfer and additional reentrancy guard:

```solidity
function withdraw() external onlyAfterSale {
    uint256 tokenAmout = purchasedTokens[msg.sender];
    purchasedTokens[msg.sender] = 0;
    require(token.transfer(msg.sender, tokenAmout), "transfer failed");
}

```

---

#### C2-05. Block values as a proxy for time (Medium)

**Description:**
SWC-116. `block.timestamp` used as proxy for time

```solidity
modifier onlyAfterSale {
    require(block.timestamp > 1661790839, "sale not ended");
    _;
}
```

**Recommendation:**

-   Developers should write smart contracts with the notion that block values are not precise, and the use of them can lead to unexpected effects. Alternatively, they may make use oracles.

-   Magic number change to named constant varible.

---

#### C2-06. Withdraw Business logic (Medium)

**Description:**
After finish of sale some amout of tokens can be not sold

**Recommendation:**
We recommend add function `withdrawNotSoldTokens()` to contract for withdraw not sold tokens

---

#### C2-04. Native transfer (Low)

**Description:**
Any smart contract that uses `transfer()`  is taking a hard dependency on gas costs by forwarding a fixed amount of gas: 2300.

```solidity
function withdrawEther(address payable recipient) external onlyOwner {
    recipient.transfer(address(this).balance);
}

```

**Recommendation:**
Our recommendation is to using `call()`:

```solidity
function withdrawEther(address payable recipient) external onlyOwner {
    (bool success, ) = recipient.call{ value: address(this).balance }("");
    require(success, "transfer failed");
}

```

---

#### C2-07. Code With No Effects (Low)

**Description:**
Imported `ERC20` contract never used.

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

```

**Recommendation:**
Delete this line.

---

#### C2-08. Best practicesr ecommendations (Info)

-   Add events.
-   Use one style of varible naming averywhere. Rename input varible `recipient` to `_recipient`

```solidity
function withdrawEther(address payable recipient)
```

---

## Appendix A - Issuse severity classification

### Critical

Issues that may cause an unlimited loss of funds or entirely break the contract workflow. Malicious code (including malicious modifi cation of libraries) is also treated as a critical severity issue. These issues must be fi xed before deployments or fi xed in already running projects as soon as possible.

### High

Issues that may lead to a limited loss of funds, break interaction with users, or other contracts under specifi c conditions. Also, issues in a smart contract, that allow a privileged
account the ability to steal or block other users' funds.

### Medium

Issues that do not lead to a loss of funds directly, but break the contract logic. May lead to failures in contracts operation.

### Low

Issues that are of a non-optimal code character, for instance, gas optimization tips, unused variables, errors in messages.

### Info

Issues that do not impact the contract operation. Usually, info severity issues are related to code best practices, e.g. style guide.

---

## Appendix B - List of examined issue types

-   Business logic overview
-   Functionality checks
-   Following best practices
-   Access control and authorization
-   Reentrancy attacks
-   Unchecked math
-   Timestamp dependence
-   Forcibly sending ether to a contract
-   Usage of deprecated code
-   Weak sources of randomness
-   ~~Front-run attacks~~
-   ~~DoS with (unexpected) revert~~
-   ~~DoS with block gas limit~~
-   ~~Transaction-ordering dependence~~
-   ~~ERC/BEP and other standards violation~~
-   ~~Implicit visibility levels~~
-   ~~Excessive gas usage~~
-   ~~Shadowing state variables~~
