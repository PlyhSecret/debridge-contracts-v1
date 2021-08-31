const DeBridgeGate = artifacts.require("DeBridgeGate");
const SignatureVerifier = artifacts.require("SignatureVerifier");
const CallProxy = artifacts.require("CallProxy");
const FeeProxy = artifacts.require("FeeProxy");
const DefiController = artifacts.require("DefiController");
const { getWeth } = require("./utils");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = async function(deployer, network) {
  // if (network == "test") return;

  const debridgeInitParams = require("../assets/debridgeInitParams")[network];
  let debridgeInstance;
  let weth = await getWeth(deployer, network);
  console.log("weth: " + weth);

//   function initialize(
//     uint8 _excessConfirmations,
//     address _signatureVerifier,
//     address _confirmationAggregator,
//     address _callProxy,
//     IWETH _weth,
//     address _feeProxy,
//     address _defiController
// )
  await deployProxy(
    DeBridgeGate,
    [
      debridgeInitParams.excessConfirmations,
      SignatureVerifier.address.toString(),
      ZERO_ADDRESS, //ConfirmationAggregator.address.toString(),
      CallProxy.address.toString(),
      weth,
      FeeProxy.address.toString(),
      DefiController.address.toString(),
    ],
    { deployer }
  );
  aggregatorInstance = await SignatureVerifier.deployed();
  debridgeInstance = await DeBridgeGate.deployed();

  console.log("DeBridgeGate: " + debridgeInstance.address);

  await aggregatorInstance.setDebridgeAddress(
    debridgeInstance.address.toString()
  );

  console.log("aggregator setDebridgeAddress: " + debridgeInstance.address.toString());
};
