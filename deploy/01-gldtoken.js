/* Imports */
const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("Deployr: " + deployer)
    const initialSupply = ethers.utils.parseEther("10.0")
    const deployArgs = [initialSupply, []]
    log(" " + deployArgs)
    /* Deply contract */
    log("Deploy GLDToken contract")
    const gldToken = await deploy("FixedGLDToken", {
        from: deployer,
        args: deployArgs,
        log: true,
        waitConformations: network.config.blockConfirmations || 1,
    })
    /* Verify contract */
    log("Contract GLDToken deployed!")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(gldToken.address, deployArgs)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "gldToken", "main"]
