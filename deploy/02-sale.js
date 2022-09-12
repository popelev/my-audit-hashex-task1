/* Imports */
const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const gldToken = await ethers.getContract("FixedGLDToken", deployer)

    const deployArgs = [gldToken.address, 0]
    log(" " + deployArgs)
    /* Deply contract */
    log("Deploy Sale contract")
    const sale = await deploy("FixedSale", {
        from: deployer,
        args: deployArgs,
        log: true,
        waitConformations: network.config.blockConfirmations || 1,
    })
    /* Verify contract */
    log("Contract Sale deployed!")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(sale.address, deployArgs)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "sale", "main"]
