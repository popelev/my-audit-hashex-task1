const { expect, assert } = require("chai")
const { network, deployments, ethers, getNamedAccounts, getChainId, waffle } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip //("features", function () {})
    : describe("Sale. Unit", async function () {
          let gldToken, saleContract
          let accounts
          let deployer, customer1
          let PRICE
          const chainId = network.config.chainId

          //const provider = waffle.provider

          beforeEach(async function () {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployer = (await getNamedAccounts()).deployer
              customer1 = (await getNamedAccounts()).user1

              await deployments.fixture(["all"])
              gldToken = await ethers.getContract("FixedGLDToken", deployer)
              saleContract = await ethers.getContract("FixedSale", deployer)
              PRICE = saleContract.PRICE()
              const saleAmount = ethers.utils.parseEther(".0")
              gldToken.approve(saleContract.address, saleAmount)
              saleContract.putOnSale(saleAmount)
          })

          describe("constructor", async function () {
              it("Initialize correctly", async function () {
                  expect(true)
              })
          })
      })
