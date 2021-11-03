const { deployProxy } = require("../deploy-utils");
const debridgeInitParams = require("../../assets/debridgeInitParams");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deployer } = await getNamedAccounts();

  console.log('*'.repeat(80));
  console.log(`\tStart deploy Test WETH contract`);
  console.log(`\tfrom DEPLOYER ${deployer}`);
  console.log('*'.repeat(80));

  const deployInitParams = debridgeInitParams[network.name];
  if (!deployInitParams) return;
  const wethAddress = deployInitParams.external.WETH;

  const { contract: mockWethTestInstance, isDeployed } = await deployProxy("MockWethTest", deployer, [
    wethAddress
  ], true);




};

module.exports.tags = ["16_test_weth"];
module.exports.dependencies = [''];
