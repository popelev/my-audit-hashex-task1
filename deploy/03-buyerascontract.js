/* Imports */
const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const sale = await ethers.getContract("FixedSale", deployer)

    const deployArgs = [sale.address]
    log(" " + deployArgs)
    /* Deply contract */
    log("Deploy BuyerAsContract contract")
    const buyerAsContract = await deploy("BuyerAsContract", {
        from: deployer,
        args: deployArgs,
        log: true,
        waitConformations: network.config.blockConfirmations || 1,
    })
    /* Verify contract */
    log("Contract BuyerAsContract deployed!")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(buyerAsContract.address, deployArgs)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "buyerAsContract", "main"]
