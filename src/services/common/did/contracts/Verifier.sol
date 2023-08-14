// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

import '@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';

import './IDIDRegistry.sol';
import './IVerifier.sol';

/**
 * @title A smart contract for verifying W3C Verifiable Credentials
 * @dev This contract requires a deployed DID registry contract to function correctly.
 * @custom:experimental This is an experimental contract.
 */
contract Verifier is IVerifier, OwnableUpgradeable, UUPSUpgradeable {
  using ECDSAUpgradeable for bytes32;

  IDIDRegistry public registry;
  bytes32 private rootIssuer;
  mapping(bytes32 => bool) private knownIssuers;
  mapping(bytes32 => uint256) private didNonce;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /// @notice Contract initialzier
  /// @param _owner The owner of this contract
  /// @param _rootIssuer The Keccack256 hashed form of the DID
  function initialize(
    address _owner,
    bytes32 _rootIssuer
  ) public initializer {
    __Ownable_init();
    __UUPSUpgradeable_init();
    _transferOwnership(_owner);

    rootIssuer = _rootIssuer;
  }

   function _authorizeUpgrade(address) internal override onlyOwner {}

  /// @notice Sets the root issuer for the chain of trust
  /// @dev This is an optional setting. However, if set allows the root issuer to be
  /// @dev used as a trust anchor for a given chain of trust
  /// @param _rootIssuer The Keccack256 hashed form of the DID
  function setRootIssuer(bytes32 _rootIssuer) external onlyOwner {
    rootIssuer = _rootIssuer;
  }

  /// @notice Adds an issuer from the known issuer list
  /// @dev The primary VC issuer's DID must be in this list for verification to pass.
  /// @param _issuer The Keccack256 hashed form of the DID
  function addKnownIssuer(bytes32 _issuer) external onlyOwner {
    knownIssuers[_issuer] = true;
  }

  /// @notice Removes an issuer from the known issuer list
  /// @param _issuer The Keccack256 hashed form of the DID
  function removeKnownIssuer(bytes32 _issuer) external onlyOwner {
    delete knownIssuers[_issuer];
  }

  /// @notice Sets the DID registry
  /// @dev This registry is what is used during verification to look up the status
  /// @dev of the DIDs.
  /// @param _registry  The registry address
  function setRegistryAddress(IDIDRegistry _registry) external onlyOwner {
    registry = _registry;
  }

  /// @notice Returns the nonce for a given DID
  /// @param _did The Keccack256 hashed form of the DID
  /// @return The nonce value
  function getNonce(bytes32 _did) external view returns (uint256) {
    return didNonce[_did];
  }

  /// @notice Converts an address to a DID then generates the Keccack256 hash of it
  /// @param _a An address
  /// @return The Keccack256 hash
  function toHashedDid(address _a) private pure returns (bytes32) {
    bytes memory prefix = 'did:onchain:'; /// NOTE: TBD, how to set this? Constant, Argument or Initialized?
    return keccak256(abi.encodePacked(prefix, _a));
  }

  /// @notice Verifies a single credential
  /// @dev Performs basic checks such DID validity, expiry and signature validation.
  /// @dev VerificationResult events are emitted to explain why a verification may have failed.
  /// @param _credential An object representing a verifiable credential
  /// @param _issuerVcProofValue The proof value from a credential held by the issuer of this credential
  /// @param _presentationId The id of the presentation for which this check is being performed. This is purely for reporting.
  /// @return True if the credential passed all checks, False if any failed.
  function verifyCredential(
    OnChainVerifiableCredential memory _credential,
    bytes memory _issuerVcProofValue,
    bytes32 _presentationId
  ) private returns (bool) {
    if (!registry.isActiveHash(_credential.id)) {
      emit VerificationResult(_presentationId, false, 'REVOKED');
      return false;
    }

    if (!registry.isActiveHash(_credential.credentialSubject.id)) {
      emit VerificationResult(_presentationId, false, 'SUBJECT_DID_DEACTIVATED');
      return false;
    }

    if (!registry.isActiveHash(_credential.issuer)) {
      emit VerificationResult(_presentationId, false, 'ISSUER_DID_DEACTIVATED');
      return false;
    }

    bytes32 vcHash = keccak256(
      abi.encode(
        _credential.id,
        _credential.credentialSubject.id,
        _credential.issuer,
        _credential.expirationDate,
        _credential.issuanceDate,
        _credential.types,
        _credential.credentialSubject.data,
        _issuerVcProofValue
      )
    );

    address signer = vcHash.toEthSignedMessageHash().recover(_credential.proof.proofValue);
    bytes32 hashedSigner = toHashedDid(signer);

    if (_credential.issuer != hashedSigner) {
      emit VerificationResult(_presentationId, false, 'INVALID_PROOF');
      return false;
    }

    // NOTE: TBD, Accuracy of block.timestamp permits a small window for an expired credential
    // to pass this check
    if (_credential.expirationDate < block.timestamp) {
      emit VerificationResult(_presentationId, false, 'EXPIRED');
      return false;
    }

    // Note: TBD, will return during round 2 pass
    // if (_credential.issuanceDate >= block.timestamp) {
    //   // TODO: `>` or `>=` ?
    //   emit VerificationResult(_presentationId, false, 'NOT_VALID_YET');
    //   return false;
    // }

    return true;
  }

  /// @notice Verifies a Presentation and the Credentials inside it
  /// @dev All the embedded credentials and the presentation itself must be valid for verification to succeed
  /// @dev VerificationResult events are emitted to explain why a verification may have failed.
  /// @dev An external DID registry is required for verification
  /// @param _presentation An object representing a verifiable presentation
  /// @param _presentationSender the address of the presenation sender as reported to the caller of this function
  /// @return True if the  passed all checks, False if any failed.
  function verifyChain(OnChainVerifiablePresentation memory _presentation, address _presentationSender) public override returns (bool) {
    if (registry == IDIDRegistry(address(0))) {
      emit VerificationResult(_presentation.id, false, 'REGISTRY_NOT_INITIALIZED');
      return false;
    }

    uint256 length = _presentation.verifiableCredential.length;

    if (!(length > 0)) {
      emit VerificationResult(_presentation.id, false, 'CREDENTIALS_MISSING');
      return false;
    }

    if (_presentation.verifiableCredential[0].credentialSubject.id != toHashedDid(_presentationSender)) {
      emit VerificationResult(_presentation.id, false, 'PRESENTATION_INVALID_CALLER');
      return false;
    }

    if (rootIssuer != 0 && _presentation.verifiableCredential[length - 1].issuer != rootIssuer) {
      emit VerificationResult(_presentation.id, false, 'ROOT_ISSUER_UNRECOGNIZED');
      return false;
    }

    if (!knownIssuers[_presentation.verifiableCredential[0].issuer]) {
      emit VerificationResult(_presentation.id, false, 'ISSUER_UNRECOGNIZED');
      return false;
    }

    if (_presentation.proof.nonce != didNonce[_presentation.verifiableCredential[0].credentialSubject.id]) {
      emit VerificationResult(_presentation.id, false, 'INVALID_NONCE');
      return false;
    }

    bytes32 runningHash = keccak256(abi.encode(_presentation.proof.nonce));

    // Verify each VC is valid
    for (uint256 i = 0; i != length; i++) {
      bytes memory issuerVcProof = '0xDECAFBAD'; // TODO: This really necessary?
      if (i + 1 < length) {
        issuerVcProof = _presentation.verifiableCredential[i + 1].proof.proofValue;
      }

      bool result = verifyCredential(_presentation.verifiableCredential[i], issuerVcProof, _presentation.id);
      if (!result) {
        return false;
      }

      runningHash = keccak256(
        abi.encode(
          runningHash,
          _presentation.verifiableCredential[i].id,
          _presentation.verifiableCredential[i].credentialSubject.id,
          _presentation.verifiableCredential[i].issuer,
          _presentation.verifiableCredential[i].expirationDate,
          _presentation.verifiableCredential[i].issuanceDate,
          _presentation.verifiableCredential[i].types,
          _presentation.verifiableCredential[i].credentialSubject.data,
          _presentation.verifiableCredential[i].proof.proofValue
        )
      );
    }

    address signer = runningHash.toEthSignedMessageHash().recover(_presentation.proof.proofValue);
    bytes32 signerHashed = toHashedDid(signer);

    if (signerHashed != _presentation.verifiableCredential[0].credentialSubject.id) {
      emit VerificationResult(_presentation.id, false, 'PRESENTATION_INVALID_PROOF');
      return false;
    }

    ++didNonce[_presentation.verifiableCredential[0].credentialSubject.id];

    emit VerificationResult(_presentation.id, true, '');
    return true;
  }
}
