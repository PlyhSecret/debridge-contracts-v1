const Web3 = require("web3");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = require("./utils.spec");
const { MAX_UINT256 } = require("@openzeppelin/test-helpers/src/constants");
const { toWei } = web3.utils;
const { BigNumber } = require("ethers");

const transferFeeBps = 50;
const fixedNativeFee = toWei("0.00001");
const isSupported = true;
const supportedChainIds = [42, 56];
const excessConfirmations = 4;

// found in hardhat node log
const implAddress = "0x7fb85e2cb067110f44263abbaf0127ecb507e015";

contract("DeBridgeGate Proxy Initialization", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    alice = this.signers[0];
    other = this.signers[1];
    this.initializerArgs = [
      excessConfirmations,
      other.address.toString(),
      other.address.toString(),
      other.address.toString(),
      supportedChainIds,
      [
        {
          transferFeeBps,
          fixedNativeFee,
          isSupported,
        },
        {
          transferFeeBps,
          fixedNativeFee,
          isSupported,
        },
      ],
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      alice.address,
    ];

    this.DebridgeFactory = await ethers.getContractFactory("DeBridgeGate", alice.address);

    this.proxy = await upgrades.deployProxy(this.DebridgeFactory, this.initializerArgs);
    this.impl = await ethers.getContractAt("DeBridgeGate", implAddress);
  });

  context("After setters executed through PROXY", () => {
    beforeEach(async function () {
      await this.proxy.setAggregator(other.address, true, {
        from: alice.address,
      });
      await this.proxy.setDefiController(other.address, {
        from: alice.address,
      });
    });

    it("states are available in PROXY only", async function () {
      assert.equal(await this.proxy.defiController(), other.address);
      assert.equal(await this.proxy.signatureVerifier(), other.address);
    });

    it("PROXY left initialized and unable to initialize again", async function () {
      await expectRevert(this.proxy.initialize(...this.initializerArgs), "Initializable: contract is already initialized");
    });

    it("states in IMPLEMENTATION are independent and clean", async function () {
      assert.equal(await this.impl.defiController(), ZERO_ADDRESS);
      assert.equal(await this.impl.signatureVerifier(), ZERO_ADDRESS);
    });
  });

  context("After attacker directly initializes implementation", () => {
    beforeEach(async function () {
      await this.impl.initialize(...this.initializerArgs);
    });

    it("state was recorded in IMPLEMENTATION only (unable to initialize again)", async function () {
      await expectRevert(this.impl.initialize(...this.initializerArgs), "Initializable: contract is already initialized");
    });
  });
});
