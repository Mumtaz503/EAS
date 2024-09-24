const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat.config");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = await deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  log("-------------------------------------------------");
  log("Deploying ResolverContract...");

  const eas = networkConfig[chainId].eas;
  const targetAttester = deployer;
  const constructorArgs = [eas, targetAttester];

  const resolverContract = await deploy("ResolverContract", {
    from: deployer,
    log: true,
    args: constructorArgs,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("Successfully deployed ResolverContract");
  log("-------------------------------------------------");
};

module.exports.tags = ["all", "Resolver"];
