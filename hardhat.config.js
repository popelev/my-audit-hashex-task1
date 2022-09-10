require("@nomicfoundation/hardhat-toolbox")
require("solidity-coverage")
require("hardhat-gas-reporter")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    solidity: "0.8.15",
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        //coinmarketcap: COINMARKETCAP_API_KEY,
        coin: "ETH",
    },
}
