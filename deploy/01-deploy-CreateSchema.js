const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat.config");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = await deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  log("-------------------------------------------------");
  log("Deploying CreateSchema...");

  const resolver = await ethers.getContract("ResolverContract");
  const resolverAddress = resolver.target;
  const schemaRegistry = networkConfig[chainId].schemaRegistry;

  const args = [schemaRegistry, resolverAddress];

  const schemaRegistryDeploy = await deploy("CreateSchema", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("Successfully deployed SchemaRegistry");
  log("-------------------------------------------------");
};

module.exports.tags = ["all", "Registry"];
