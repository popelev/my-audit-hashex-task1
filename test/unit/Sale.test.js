const { expect, assert } = require("chai")
const { network, deployments, ethers, getNamedAccounts, getChainId, waffle } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip //("features", function () {})
    : describe("Sale. Unit", async function () {
          let gldToken, saleContract, saleContractUser1
          let accounts
          let deployer, user1
          let PRICE
          let initSaleAmount
          const chainId = network.config.chainId

          xdescribe("Befor give to Sale contract allowance to transfer tokens from deployer", async function () {
              beforeEach(async function () {
                  accounts = await ethers.getSigners()
                  deployer = (await getNamedAccounts()).deployer

                  initSaleAmount = ethers.utils.parseEther("10.0")
                  await deployments.fixture(["all"])
                  gldToken = await ethers.getContract("FixedGLDToken", deployer)
                  saleContract = await ethers.getContract("FixedSale", deployer)
                  PRICE = BigNumber.from(saleContract.PRICE())
              })

              describe("Initialize", async function () {
                  it("Sale contract has not allowance to transfer tokens from deployer account", async function () {
                      expect(await gldToken.allowance(deployer, saleContract.address)).to.equal(0)
                  })
                  it("All ERC777 tokens on deployer balance", async function () {
                      expect(await gldToken.balanceOf(deployer)).to.equal(initSaleAmount)
                  })
                  it("Sale contract has not tokens ", async function () {
                      expect(await gldToken.balanceOf(saleContract.address)).to.equal(0)
                  })
              })

              describe("Put on sale", async function () {
                  it("Revert transaction if try to put on sale without allowance", async function () {
                      await expect(saleContract.putOnSale(initSaleAmount)).to.be.reverted
                  })
              })
          })

          describe("After give to Sale contract allowance to transfer tokens from deployer and put on sale", async function () {
              beforeEach(async function () {
                  accounts = await ethers.getSigners()
                  deployer = (await getNamedAccounts()).deployer
                  user1 = (await getNamedAccounts()).user1

                  initSaleAmount = ethers.utils.parseEther("10.0")
                  await deployments.fixture(["all"])
                  gldToken = await ethers.getContract("FixedGLDToken", deployer)
                  saleContract = await ethers.getContract("FixedSale", deployer)
                  saleContractUser1 = await ethers.getContract("FixedSale", user1)

                  PRICE = saleContract.PRICE()

                  await gldToken.approve(saleContract.address, initSaleAmount)
                  await saleContract.putOnSale(initSaleAmount)
              })

              xdescribe("Put on Sale correctly", async function () {
                  it("All ERC777 tokens on Sale contract", async function () {
                      expect(await gldToken.balanceOf(saleContract.address)).to.equal(
                          initSaleAmount
                      )
                  })
                  it("Deployer has not tokens ", async function () {
                      expect(await gldToken.balanceOf(deployer)).to.equal(0)
                  })
              })

              describe("Buy", async function () {
                  it("Buy event detected", async function () {
                      expect(
                          await saleContractUser1.buyTokens({
                              value: PRICE,
                          })
                      ).to.emit(saleContractUser1, "TokensSold")
                  })
                  it("Buy 1 token", async function () {
                      await saleContractUser1.buyTokens({
                          value: PRICE,
                      })
                      expect(await saleContractUser1.purchasedTokens(user1)).to.equal(
                          ethers.utils.parseEther("1.0")
                      )
                  })
                  it("Buy 0.5 token", async function () {
                      await saleContractUser1.buyTokens({
                          value: ethers.utils.parseEther("0.1"),
                      })
                      expect(await saleContractUser1.purchasedTokens(user1)).to.equal(
                          ethers.utils.parseEther("0.5")
                      )
                  })
                  it("Buy 1 and 0.25 tokens one by one (1.25 in total)", async function () {
                      await saleContractUser1.buyTokens({
                          value: ethers.utils.parseEther("0.2"),
                      })
                      await saleContractUser1.buyTokens({
                          value: ethers.utils.parseEther("0.05"),
                      })
                      expect(await saleContractUser1.purchasedTokens(user1)).to.equal(
                          ethers.utils.parseEther("1.25")
                      )
                  })
                  it("Reverted if send no ethers", async function () {
                      await expect(
                          saleContractUser1.buyTokens({
                              value: ethers.utils.parseEther("0"),
                          })
                      ).to.be.revertedWith("zero amount")
                  })
                  it("Reverted if not enough tokens for sale", async function () {
                      await expect(
                          saleContractUser1.buyTokens({
                              value: ethers.utils.parseEther("50"),
                          })
                      ).to.be.revertedWith("not enough token for sale")
                  })
                  it("Reverted if all tokens sold", async function () {
                      await saleContractUser1.buyTokens({ value: ethers.utils.parseEther("2") })
                      await expect(
                          saleContractUser1.buyTokens({
                              value: ethers.utils.parseEther("1"),
                          })
                      ).to.be.revertedWith("all tokens sold")
                  })
              })
          })
      })
