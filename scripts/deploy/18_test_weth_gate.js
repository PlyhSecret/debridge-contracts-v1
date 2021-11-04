const { deployProxy } = require("../deploy-utils");
const debridgeInitParams = require("../../assets/debridgeInitParams");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  console.log('*'.repeat(80));
  console.log(`\tStart deploy Test WETH contract upgradable with non upgradable gate`);
  console.log(`\tfrom DEPLOYER ${deployer}`);
  console.log('*'.repeat(80));

  const deployInitParams = debridgeInitParams[network.name];
  if (!deployInitParams) return;
  const wethAddress = deployInitParams.external.WETH;

  const mockWethGateInstance = await deploy("MockWethGate", {
    from: deployer,
    args: [wethAddress],
    log: true,
    waitConfirmations: 1
  });

  // console.log(mockWethGateInstance);

  const { contract: mockWethTestInstance, isDeployed } = await deployProxy("MockWethTestWithGate", deployer,
  [
    wethAddress,
    mockWethGateInstance.address
  ], true);



};

module.exports.tags = ["18_test_weth_gate"];
module.exports.dependencies = [''];
