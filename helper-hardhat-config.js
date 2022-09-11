/* Imports */
const { ethers } = require("hardhat")

const networkConfig = {
    31337: {
        name: "hardhat",
        subscriptionId: "7410",
        entranceFee: ethers.utils.parseEther("0.01"),
        callbackGasLimit: "500000",
        mintFee: "10000000000000000",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
