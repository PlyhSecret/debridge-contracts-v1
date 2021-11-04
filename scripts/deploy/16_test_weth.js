const { deployProxy } = require("../deploy-utils");
const debridgeInitParams = require("../../assets/debridgeInitParams");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deployer } = await getNamedAccounts();

  console.log('*'.repeat(80));
  console.log(`\tStart deploy WethWithdrawProblem contract`);
  console.log(`\tfrom DEPLOYER ${deployer}`);
  console.log('*'.repeat(80));

  const deployInitParams = debridgeInitParams[network.name];
  if (!deployInitParams) return;
  const wethAddress = deployInitParams.external.WETH;
  //"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; WBNB mainnet


  const { contract: mockWethTestInstance, isDeployed } = await deployProxy("WethWithdrawProblem", deployer, [
    wethAddress
  ], true);
};

module.exports.tags = ["16_test_weth"];
module.exports.dependencies = [''];
