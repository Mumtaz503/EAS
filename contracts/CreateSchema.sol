// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {ISchemaRegistry} from "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import {ISchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/ISchemaResolver.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract CreateSchema {
    using Strings for uint256;

    ISchemaRegistry private immutable i_schemaRegistery;
    ISchemaResolver private immutable i_schemaResolver;

    bytes32 private s_schemaUID;

    constructor(address _schemaRegistery, address _resolver) {
        i_schemaRegistery = ISchemaRegistry(_schemaRegistery);
        i_schemaResolver = ISchemaResolver(_resolver);
    }

    function registerSchema(string calldata _name, uint256 _dob) external {
        string memory dob = _dob.toString();

        string memory schema = string(abi.encodePacked(_name, ": ", dob));
        bool revokable = true;

        bytes32 schemaUID = i_schemaRegistery.register(
            schema,
            i_schemaResolver,
            revokable
        );

        s_schemaUID = schemaUID;
    }

    function getSchemaUID() public view returns (bytes32) {
        return s_schemaUID;
    }
}
