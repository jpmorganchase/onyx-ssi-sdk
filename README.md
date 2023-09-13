### NOTE - All hackathon submissions for the Digital Identity Hackathon (Sept 12 - Oct 8) need to be sent to the hackathon organizer, Encode club. PRs will not be considered as offical submissions for the Digital Identity hackathon.

# Onyx SSI SDK

Create SSI Ecosystems following W3C Standards for [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) and [DIDs](https://www.w3.org/TR/did-core/)

* Create and verify Verifiable Credentials and Verifiable Presentations
* Support for [did:ethr](https://github.com/decentralized-identity/ethr-did-resolver/blob/master/doc/did-method-spec.md) and [did:key](https://w3c-ccg.github.io/did-method-key/)
* Support for JWT as digital proof
* Support for Verifiable Credential Schemas

## How to Use REPO

### Prerequisites

* Nodejs v16

### Installation

``` shell
npm install @jpmorganchase/onyx-ssi-sdk
```

### Build

This project is built to support both CommonJS and ECMAScript Module Formats

The CommonJS format is configured in `configs/tsconfig.cjs.json` and the ECMAScript is configured in `configs/tsconfig.esm.json` 

``` shell
npm install
npm run build
```
### Tests

Unit Tests: `npm run test`

Hardhat: 
``` shell 
npx hardhat compile
npx hardhat test
```

## Navigating the SDK
* [DID Management](https://github.com/jpmorganchase/onyx-ssi-sdk/tree/main/src/services/common/did): Create, Resolve, Update, and Delete the 2 supported DID Methods (did:key and did:ethr)
* [Credential Schema Management](https://github.com/jpmorganchase/onyx-ssi-sdk/tree/main/src/services/common/schemas): Example of 4 Credential Types and their schemas as well as helper methods for Schema Management
* [JWT Signatures](https://github.com/jpmorganchase/onyx-ssi-sdk/tree/main/src/services/common/signatures): Sign Verifiable Credentials as JWTs
* [Issuer](https://github.com/jpmorganchase/onyx-ssi-sdk/tree/main/src/services/issuer): All functionality required to be a Credential Issuer
* [Holder](https://github.com/jpmorganchase/onyx-ssi-sdk/tree/main/src/services/holder): All functionality required to be a Credential Holder
* [Verifier](https://github.com/jpmorganchase/onyx-ssi-sdk/tree/main/src/services/verifier): All functionality to perform basic Credential verification
* [KeyUtils](https://github.com/jpmorganchase/onyx-ssi-sdk/blob/main/src/utils/KeyUtils.ts): Helper functions for SDK supported keys

## Full SSI Ecosystem Example

For examples of how to use the SDK, check out our [onyx-ssi-sdk-examples repo](https://github.com/jpmorganchase/onyx-ssi-sdk-examples)

Below code shows the VC Creation, VP Presentation and Verification of W3C Credential/Presentation.

```shell

//DID Key
const didKey = new KeyDIDMethod()

//DID Ethr configs
const ethrProvider = {
    name: 'maticmum', 
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/', 
    registry: "0x41D788c9c5D335362D713152F407692c5EEAfAae"}
   
console.log('-----------------VC Issuance---------------')
       
//create DID for Issuer (did:ethr)
const didEthr = new EthrDIDMethod(ethrProvider)
const issuerEthrDid = await didEthr.create();
   
//create DID for Holder of Credential (did:key)
const holderDID = await didKey.create();
   
//create DID for VC to support Revocation of Credential
const vcDID = await didEthr.create();
   
//Create a 'Proof of Name' VC
const subjectData = {
    "name": "Ollie"
}
   
//Additonal parameters can be added to VC including:
//vc id, expirationDate, credentialStatus, credentialSchema, etc
const additionalParams = {
    id: vcDID.did,
    expirationDate: "2024-01-01T19:23:24Z",
}
   
const vc = await createCredential(
    issuerEthrDid.did, holderDID.did, subjectData, PROOF_OF_NAME, additionalParams)
console.log(JSON.stringify(vc, null, 2))
   
const jwtService = new JWTService()
const jwtVC = await jwtService.signVC(issuerEthrDid, vc)
console.log(jwtVC)
   
console.log('-----------------VC Presentation---------------')
   
//Create Presentation from VC JWT
const vp = await createPresentation(holderDID.did, [jwtVC])
console.log(JSON.stringify(vp, null, 2))
   
const jwtVP = await jwtService.signVP(holderDID, vp)
console.log(jwtVP)
   
console.log('----------------------VERIFY VC/VP------------------')
       
//create DID resolvers
const ethrResolver = getEthrResolver(ethrProvider)
const keyResolver = getKeyResolver()
const didResolver = new Resolver({
    ...ethrResolver, 
    ...keyResolver})
   
   
//Verify VC JWT from Issuer
const resultVc = await verifyCredentialJWT(jwtVC, didResolver)
console.log(resultVc)
       
//Verify VP JWT from Holder
const resultVp = await verifyPresentationJWT(jwtVP, didResolver)
console.log(resultVp)
```

## Standards and Specifications
* [W3C Verifiable Credentials 1.0](https://www.w3.org/TR/vc-data-model/)
* [Decentralized Identifiers v1.0](https://w3c.github.io/did-core/)
* [did:key spec](https://w3c-ccg.github.io/did-method-key/)
* [did:ethr spec](https://github.com/decentralized-identity/ethr-did-resolver/blob/master/doc/did-method-spec.md)
  
## Open Source Identity Packages
* [did-resolver](https://github.com/decentralized-identity/did-resolver)
* [ethr-did-resolver](https://github.com/decentralized-identity/ethr-did-resolver)
* [key-did-resolver](https://github.com/ceramicnetwork/js-did/tree/main/packages/key-did-resolver)
* [did-jwt-vc](https://github.com/decentralized-identity/did-jwt-vc)
* [did-jwt](https://github.com/decentralized-identity/did-jwt)

## SDK Hackathon Challenges
As part of the hackathon we are offering 5 challenges to help improve our SDK.

To participate in these challenges please fork this repo, implement your changes, and submit your branch to Encode. We are not accepting PRs on this repo through the duration of the hackathon.

* [DIDs](https://github.com/jpmorganchase/onyx-ssi-sdk/blob/dids-hackathon/src/services/common/did/DIDS.md): Add support for a new DID method or support the Universal Resolver
* [JSON-LD Credentials](https://github.com/jpmorganchase/onyx-ssi-sdk/blob/jsonld-hackathon/src/services/common/schemas/JSONLD.md): Provide support for JSON-LD Credentials
* [Revocation](https://github.com/jpmorganchase/onyx-ssi-sdk/blob/revocation-hackathon/src/services/common/revocation/README.md): Implement a new Credential Revocation scheme
* [SD-JWT](https://github.com/jpmorganchase/onyx-ssi-sdk/blob/sdjwt-hackathon/src/services/common/signatures/SDJWT.md): Implement the emerging SD-JWT spec for selective disclosure
* [Communication](https://github.com/jpmorganchase/onyx-ssi-sdk/blob/oidc-hackathon/src/services/communication/oidc/README.md): Implement support for OIDC, DIDComm or Presentation Exchange
