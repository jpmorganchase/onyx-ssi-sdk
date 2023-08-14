// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

enum RegistrationState {
  Unregistered,
  Active,
  Deactivated
}

contract DIDRegistryOnChain {
  error INVALID_REQUEST();

  /**
   * @notice Maps ID hash to address for fast verification.
   */
  mapping(bytes32 => uint168) public registry;

  event DIDAttributeChanged(address indexed identity, bytes32 name, bytes value, uint256 validTo, uint256 previousChange);

  /**
   * @notice Adds an ID
   *
   * @param _method ID domain
   * @param _id ID address
   */
  function register(string calldata _method, address _id) external {
    if (msg.sender != _id) {
      revert INVALID_REQUEST();
    }
    uint168 record = (uint168(uint160(_id)) << 8) | uint8(RegistrationState.Active);
    bytes32 hash = keccak256(abi.encodePacked('did:', _method, ':', _id));
    registry[hash] = record;
    emit DIDAttributeChanged(_id, 'isActive', 'true', block.timestamp + 10000, 0);
  }

  /**
   * @notice Removes an ID
   *
   * @param _method ID method
   * @param _id ID address
   */
  function deactivate(string calldata _method, address _id) external {
    if (msg.sender != _id) {
      revert INVALID_REQUEST();
    }
    bytes32 hash = keccak256(abi.encodePacked('did:', _method, ':', _id));
    uint168 record = registry[hash];
    address recordAddress = address(uint160(record >> 8));
    RegistrationState recordState = RegistrationState(uint8(record));

    if (recordAddress == _id && recordState == RegistrationState.Active) {
      record = uint168((uint160(_id) << 8) | uint8(RegistrationState.Deactivated));
      registry[hash] = record;

      emit DIDAttributeChanged(_id, 'isActive', 'false', block.timestamp + 10000, 0); // TODO: Validity???
    }
  }

  function isActive(string calldata _method, address _id) public view returns (bool status) {
    bytes32 hash = keccak256(abi.encodePacked('did:', _method, ':', _id));
    uint168 record = registry[hash];
    address recordAddress = address(uint160(record >> 8));
    RegistrationState recordState = RegistrationState(uint8(record));

    status = recordAddress == _id && recordState == RegistrationState.Active;
  }

  function isActiveHash(bytes32 _did) public view returns (bool status) {
    uint168 record = registry[_did];
    // address recordAddress = address(uint160(record >> 8)); TODO: should it be compared to decoded address from the _did?
    RegistrationState recordState = RegistrationState(uint8(record));

    status = recordState == RegistrationState.Active;
  }

  // TODO: These are copied from the existing registry contract so as to not break stuff
  //       This needs rework.
  function setAttribute(
    address identity,
    address actor,
    bytes32 name,
    bytes calldata value,
    uint256 validity
  ) internal {
    if (msg.sender != identity) {
      revert INVALID_REQUEST();
    }
    bytes32 hash = keccak256(abi.encodePacked('did:', 'onyxidentity', ':', identity));
    emit DIDAttributeChanged(identity, name, value, block.timestamp + validity, 0);
    //changed[identity] = block.number;
  }

  function setAttribute(
    address identity,
    bytes32 name,
    bytes calldata value,
    uint256 validity
  ) public {
    setAttribute(identity, msg.sender, name, value, validity);
  }
}