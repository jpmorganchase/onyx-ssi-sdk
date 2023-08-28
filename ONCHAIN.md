# Exploring Onyx SSI OnChain

## Overview
The set of W3C decentralized identity standards are by default off chain, meaning a blockchain is not required to implement them. Verifiable Credentials exist in Holder's Digital Wallets and are not stored on a blockchain. Storage on a blockchain is computationally expensive and compromises the privacy of the VC subject. 

Onyx is exploring how the Onyx SSI SDK can be used to enhance web3 use cases. Many web3 use cases involve smart contracts on a blockchain, so in this hackathon you have the opportunity to investigate how W3C Verifiable Credentials can be used to solve identity for on chain use cases.

## Sample Contracts

In this branch we provide a [sample DIDRegistry](src/services/common/did/contracts/metadata/DIDRegistryOnChain.sol) and a sample [Verifier Contract](src/services/common/did/contracts/metadata/Verifier.sol). 

### Verifier Contract
The Verifier contract performs verification of the Verifiable Credential, just as a Verifier service running locally or in AWS would.

When verifying a W3C credential, the Verifier performs:
* digital signature verification
* status checks of the DIDs within the credential

The first check can be done with [OpenZepplin](https://docs.openzeppelin.com/contracts/2.x/utilities) utilities.

The second check requires communication between the Verifier and the DIDRegistry contract. 

How the Verifier implements these checks depends on the Verifiable Credential structure. In this starter branch, the Verifiable Credential structure given as input to the [`verifyCredential`](src/services/common/did/contracts/Verifier.sol#L96) function is defined [here](src/services/common/did/contracts/IVerifier.sol#L23)

### DIDRegistry Contract
The DIDRegistry contract is an extension of the contract used for did:ethr. A few modifications needed to be made to support the DIDs within the VC had been hashed and that the status check needed to be available as a function for another contract to call.

This sample contract maintains a mapping of DID hash to DID status. A DID's status can either be Unregistered, Active or Deactivated. The DIDs are hashed to keep the DID string to a fixed length. An `isActive` function is included so the Verifier contract can check a given DID's status by calling this function.

## Privacy Problem
The [OnChain Verifiable Credential structure](src/services/common/did/contracts/IVerifier.sol#L23) has an [OnChainCredentialSubject](src/services/common/did/contracts/IVerifier.sol#L5) type where credential claims can be included. Unfortunately, if we include these claims, when the VC gets sent on chain, they are now public to anyone with access to the blockchain these contracts are deployed on.

**The goal of this challenge is how can we prove claims to a Verifier running on chain while keeping the VC claims private.**

## ZK Materials

### ZK Intro
Experimenting with ZKP seems like a natural next step to solve this privacy problem. 

### ZK Toolkits

### Where to Start
If you are going to explore sending Verifiable Credentials OnChain as your identity solution for a web3 use case, you will most likely need to modify/extend this SDK. 


