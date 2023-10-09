# Digital Identity Hackathon Submission

​

## Submitted by: [Anonyome Labs](https://anonyome.com)

​

## SDK Specific Challenge

"JSON-LD  -  Enable the SDK to support signing Verifiable Credentials with Linked Data Proofs"
​

## Problem

The many different Decentralized Identity / Self-Sovereign Identity solutions often incorporate the same core standards (VCs, DIDs, etc.). However, they may differ in the specific signature methods and roots of trust (e.g., blockchains, ledgers, etc.) that they use. While VCs and DIDs are inherently interoperable, these choices can create incompatibilities.
​

## Solution

The core focus of the Anonyome Labs' submission is to increase _interoperability_
​
Adding JSON-LD formatted signatures to the Onyx SDK will help it to become interoperable with JSON-LD formatted signatures created with Ed25519Signature2018 proof block.
​
This will also enable platforms based on JSON-LD signatures (e.g., Anonyome Labs, Hyperledger Aries, ACA-Py, etc.) to more easily work with the Onyx SDK.
​

## Build Steps

To install and build:

```
npm install
npm run build
```

To run tests:

```
## Whole test suite
npm run test
## OR run tests for the specific suites
npm run test jsonld.test
npm run test verification.test
npm run test KeyUtils.test
```

## Presentation
[Anonyome Labs - Hackathon Submission.pdf](https://github.com/anonyome/onyx-ssi-sdk/files/12842701/Anonyome.Labs.-.Hackathon.Submission.pdf)

