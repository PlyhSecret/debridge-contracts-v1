const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractUpgrades tests ", function () {

  before(async function () {
    this.factory = await ethers.getContractFactory("MockSignatureVerifierUpgradeV1");
  });

  it("should deploy v1", async function () {
    // TODO
  });
});
