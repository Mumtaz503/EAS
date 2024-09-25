// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {ISchemaRegistry} from "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import {ISchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/ISchemaResolver.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract CreateSchema {
    using Strings for uint256;

    struct VerificationData {
        string name;
        uint64 dateOfBirth; // YYYYMMDD
        string nationality;
        string residence;
    }

    ISchemaRegistry private immutable i_schemaRegistery;
    ISchemaResolver private immutable i_schemaResolver;

    mapping(bytes32 => string) private s_schemaUIDToVerificationData;

    constructor(address _schemaRegistery, address _resolver) {
        i_schemaRegistery = ISchemaRegistry(_schemaRegistery);
        i_schemaResolver = ISchemaResolver(_resolver);
    }

    function registerSchema(
        VerificationData calldata _verificationDataObj
    ) external returns (bytes32) {
        uint64 dobFromCalldata = _verificationDataObj.dateOfBirth;

        string memory dob = uint256(dobFromCalldata).toString();

        string memory schema = string(
            abi.encodePacked(
                "Name",
                ": ",
                _verificationDataObj.name,
                " | ",
                "Date Of Birth",
                ": ",
                dob,
                " | ",
                "Nationality",
                ": ",
                _verificationDataObj.nationality,
                " | ",
                "Residence",
                ": ",
                _verificationDataObj.residence
            )
        );
        bool revokable = true;

        bytes32 schemaUID = i_schemaRegistery.register(
            schema,
            i_schemaResolver,
            revokable
        );

        s_schemaUIDToVerificationData[schemaUID] = schema;

        return schemaUID;
    }
}
