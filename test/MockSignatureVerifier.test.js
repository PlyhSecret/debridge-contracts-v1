const { expectRevert } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS, permit } = require("./utils.spec");
const MockLinkToken = artifacts.require("MockLinkToken");
const MockToken = artifacts.require("MockToken");
const WrappedAsset = artifacts.require("WrappedAsset");
const MockFeeProxy = artifacts.require("MockFeeProxy");
const CallProxy = artifacts.require("CallProxy");
const IUniswapV2Pair = artifacts.require("IUniswapV2Pair");
const { MAX_UINT256 } = require("@openzeppelin/test-helpers/src/constants");
const { toWei} = web3.utils;
const { BigNumber } = require("ethers")

const bscWeb3 = new Web3(process.env.TEST_BSC_PROVIDER);
const oracleKeys = JSON.parse(process.env.TEST_ORACLE_KEYS);

function toBN(number){
  return BigNumber.from(number.toString())
}

const MAX = web3.utils.toTwosComplement(-1);
const bobPrivKey =
  "0x79b2a2a43a1e9f325920f99a720605c9c563c61fb5ae3ebe483f83f1230512d3";

const BPS = toBN(10000);

const ethChainId = 1;
const bscChainId = 56;
const hecoChainId = 256;

contract("MockSignatureVerifier",  function() {

  before(async function() {
    this.signers = await ethers.getSigners()
    aliceAccount=this.signers[0]
    bobAccount=this.signers[1]
    carolAccount=this.signers[2]
    eveAccount=this.signers[3]
    feiAccount=this.signers[4]
    devidAccount=this.signers[5]
    alice=aliceAccount.address
    bob=bobAccount.address
    carol=carolAccount.address
    eve=eveAccount.address
    fei=feiAccount.address
    devid=devidAccount.address
    treasury = devid;
    worker = alice;
    workerAccount = aliceAccount;

    const SignatureVerifierFactory = await ethers.getContractFactory("MockSignatureVerifier",alice);

    this.amountThreshols = toWei("1000");
    this.minConfirmations = 2;
    this.confirmationThreshold = 5; //Confirmations per block before extra check enabled.
    this.excessConfirmations = 7; //Confirmations count in case of excess activity.

    this.initialOracles = [
      {
        address: alice,
        admin: alice,
      },
      {
          account: bobAccount,
          address: bob,
          admin: carol
      },
      {
          account: carolAccount,
          address: carol,
          admin: eve,
      },
      {
          account: eveAccount,
          address: eve,
          admin: carol,
      },
      {
          account: feiAccount,
          address: fei,
          admin: eve,
      },
      {
          account: devidAccount,
          address: devid,
          admin: carol,
      },
    ];


    this.signatureVerifier= await upgrades.deployProxy(SignatureVerifierFactory, [
      this.minConfirmations,
      this.confirmationThreshold,
      this.excessConfirmations,
      alice,
      ZERO_ADDRESS
    ],
    {
      initializer: 'initializeMock',
      kind: 'transparent',
    });
    await this.signatureVerifier.deployed();
  });
  context("Configure contracts", () => {
    it("Initialize oracles", async function() {
      for (let oracle of this.initialOracles) {
        await this.signatureVerifier.addOracle(oracle.address, oracle.address, false, {
          from: alice,
        });
      }
    });
  });

  context("Test verify signatures", () => {
    before(async function() {
      this.submissionId = "0x30c2271f6b0398d2d34afe0629d1b599da908d31585436997281a5982701c09c";

      this.signatures = [];
      // this.signatures.push(
      //   await this.signers[0].signMessage(this.submissionId)
      // );
      // this.signatures.push(
      //   await this.signers[1].signMessage(this.submissionId)
      // );
      for (let wallet of this.signers) {
        //TODO:ethers has incorrect sign for messages starting 0x
        console.log( await wallet.signMessage(this.submissionId));
        this.signatures.push(
          await wallet.signMessage(this.submissionId)
        );
      }
    });

    it("test gas", async function() {
      console.log("count signature: " + this.signatures.length);
      let sendTx =  await this.signatureVerifier.testGas(this.submissionId, this.signatures);
      let receipt = await sendTx.wait();
      console.log(sendTx);
      console.log(receipt);
    });
  });

});
