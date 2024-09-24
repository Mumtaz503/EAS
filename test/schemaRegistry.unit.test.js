const { expect, assert } = require("chai");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat.config");
const { network, getNamedAccounts, ethers, deployments } = require("hardhat");
const { AbiCoder } = require("ethers");
const {
  SchemaEncoder,
  ZERO_BYTES32,
} = require("@ethereum-attestation-service/eas-sdk");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("EAS unit tests", function () {
      let createSchema,
        resolverContract,
        attester,
        eas,
        schemaRegistry,
        deployer,
        deployerSIgner,
        user,
        signer,
        userSigner;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        user = (await getNamedAccounts()).user;
        signer = await ethers.provider.getSigner();
        userSigner = await ethers.getSigner(user);
        deployerSIgner = await ethers.getSigner(deployer);
        await deployments.fixture(["all"]);
        createSchema = await ethers.getContract("CreateSchema", deployer);
        resolverContract = await ethers.getContract(
          "ResolverContract",
          deployer
        );
        eas = await ethers.getContractAt(
          "EAS",
          "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
          signer
        );
        schemaRegistry = await ethers.getContractAt(
          "SchemaRegistry",
          "0xA7b39296258348C78294F95B872b282326A97BDF",
          signer
        );
      });
      describe("registerSchema", () => {
        it("Should return a schema UID", async () => {
          const name = "mumtaz";
          const date = new Date("1997-06-22");
          const unixDate = Math.floor(date.getTime() / 1000);

          const transactionResponse = await createSchema
            .connect(userSigner)
            .registerSchema(name, unixDate);
          await transactionResponse.wait(1);

          const schemaUID = await createSchema.getSchemaUID();
          console.log("schemaUID", schemaUID);

          const schemaEncoder = new SchemaEncoder(
            "string _name, bool _isValid"
          );

          const encodedData = schemaEncoder.encodeData([
            { name: "_name", value: name, type: "string" },
            { name: "_isValid", value: true, type: "bool" },
          ]);

          const tx = await eas.attest({
            schema: schemaUID,
            data: {
              recipient: user,
              expirationTime: 0,
              revocable: true,
              refUID: ZERO_BYTES32,
              data: encodedData,
              value: ethers.parseEther("0"),
            },
          });
          const txRec = await tx.wait(1);

          const UidFromCall = txRec.logs[0].data;

          const isAttestationValidT = await eas.isAttestationValid(UidFromCall);

          console.log(`Attestation Status: ${isAttestationValidT}`);
        });
      });
    });
