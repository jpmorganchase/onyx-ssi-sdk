// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

/// Various structs for representing a W3C credential as close to spec as possible given contraints
struct OnChainCredentialSubject {
  bytes32 id;
  bytes data;
}

struct OnChainProof {
  bytes types;
  bytes verificationMethod;
  bytes proofValue;
}

struct OnChainPresentationProof {
  bytes types;
  bytes verificationMethod;
  bytes proofValue;
  uint256 nonce;
}

struct OnChainVerifiableCredential {
  bytes32 id;
  OnChainCredentialSubject credentialSubject;
  bytes32 issuer;
  uint256 expirationDate;
  uint256 issuanceDate;
  bytes types;
  OnChainProof proof;
}

struct OnChainVerifiablePresentation {
  bytes32 id;
  OnChainVerifiableCredential[] verifiableCredential;
  OnChainPresentationProof proof;
}

/// @notice Interface for Verifier smart contract
interface IVerifier {
  event VerificationResult(bytes32 indexed id, bool result, string reason);

  function getNonce(bytes32 _did) external view returns (uint256);

  function verifyChain(OnChainVerifiablePresentation memory presentation, address _presentationSender) external returns (bool);
}
