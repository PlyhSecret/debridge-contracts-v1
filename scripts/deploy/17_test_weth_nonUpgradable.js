const { deployProxy } = require("../deploy-utils");
const debridgeInitParams = require("../../assets/debridgeInitParams");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  console.log('*'.repeat(80));
  console.log(`\tStart deploy Test WETH contract non upgradable`);
  console.log(`\tfrom DEPLOYER ${deployer}`);
  console.log('*'.repeat(80));

  const deployInitParams = debridgeInitParams[network.name];
  if (!deployInitParams) return;
  const wethAddress = deployInitParams.external.WETH;

  await deploy("MockWethTestNonUpgradeable", {
    from: deployer,
    args: [wethAddress],
    // deterministicDeployment: true,
    log: true,
    waitConfirmations: 1
  });
};

module.exports.tags = ["17_test_weth_nonUpgradable"];
module.exports.dependencies = [''];
