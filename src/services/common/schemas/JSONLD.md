# JSON-LD Credentials

JSON-LD is an extension of JSON and provides a way to refer to contexts and vocabularies to better interpret JSON objects. JSON-LD provides a way to give JSON attribute-value pairs more meaning. In an SSI Ecosystem, the Issuer, Holder and Verifier services need to have a shared vocabulary of Verifiable Credential types of that Ecosystem. When Issuers define a new Credential Type they also make a reference available that explains the structure and content of the Credential. 

The way this is done is through the `@context` field of the JSON object. This contains the URIs where a machine reading the JSON can look up more about what specific terms in the JSON object mean. 

JSON-LD VCs enable the use of more complex proof types including Linked Data Proofs, BBS+, and Zero Knowledge Proofs.

**Goal: Provide support for creating JSON-LD Verifiable Credentials.**

## Spec

### JSON-LD

The W3C has written the [JSON-LD spec](https://www.w3.org/TR/json-ld11/)

The W3C VC spec outlines [how to use the `@context` property](https://www.w3.org/TR/vc-data-model/#contexts) to create JSON-LD Verifiable Credentials.

JSON-LD VCs can be signed as a JWT or a [Linked Data Proof](https://www.w3.org/TR/vc-data-model/#data-integrity-proofs). The [W3C VC Implementation Guideline](https://w3c.github.io/vc-imp-guide/#proof-formats) gives some benefits and drawbacks for combining JSON-LD Credential model with different proof formats.

### Functionality to Implement
* Function to customize/add to the `@context` property of the Verifiable Credential
* Function that creates the `@context` definition given a Credential Type and corresponding Credential Schema written in JSON
* Optional functionality includes providing the ability to sign the JSON-LD VC with a Linked Data Proof type.

## Where to Start/Implementation Details
The Onyx SDK provides a starter [contexts.ts](./contexts.ts) file. Here you can add the necessary helper functions to enhance the `@context` property of a Verifiable Credential for a given credential.

The Onyx SDK also provides a starter [jsonld.ts](../signatures/jsonld.ts) which you can implement signing the VC as a jsonld signature.

### Helpful Resources
* jsonld: https://github.com/digitalbazaar/jsonld.js - helper package for jsonld
* jsonld-signatures: https://github.com/digitalbazaar/jsonld-signatures/tree/main - functions to sign jsonld document
* vc-js: https://github.com/digitalbazaar/vc - can be used as an example of how to sign with json ld. This package uses jsonld-signatures

## Testing
The functionality added for this challenge should be unit tested. Tests can be added [here](../../../../tests/unit/schemas)

## Criteria for Completion
* All functionality has been implemented and doesn't break (without fixing) jwt signature implementation
* Code written has corresponding unit tests (90% coverage)
* Code is well documented
* Code passes CI github action (building, linting, and testing of SDK)
