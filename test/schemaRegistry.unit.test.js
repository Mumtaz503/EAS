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
        it("Should return the schema Data", async () => {
          const data = {
            name: "Mumtaz Ahmad",
            dateOfBirth: 19970622,
            nationality: "Pakistani",
            residence: "Pakistan",
          };

          const transactionResponse = await createSchema
            .connect(userSigner)
            .registerSchema(data);

          const transactionReciept = await transactionResponse.wait(1);

          const schemaUID = transactionReciept.logs[0].topics[1];

          const schema = await schemaRegistry.getSchema(schemaUID);

          console.log(`Schema for ${user}:\n`, schema[3]);

          const schemaENcoder = new SchemaEncoder(
            "string name, uint64 dateOfBirth, string nationality, string residence, bool isValid"
          );

          const encodedData = schemaENcoder.encodeData([
            { name: "name", value: data.name, type: "string" },
            { name: "dateOfBirth", value: data.dateOfBirth, type: "uint64" },
            { name: "nationality", value: data.nationality, type: "string" },
            { name: "residence", value: data.residence, type: "string" },
            { name: "isValid", value: true, type: "bool" },
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
          const rec = await tx.wait(1);

          const UidFromCall = rec.logs[0].data;

          const isAttestationValidT = await eas.isAttestationValid(UidFromCall);

          console.log(`Attestation Status: ${isAttestationValidT}`);
        });
      });
    });
