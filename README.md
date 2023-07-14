# Onyx SSI

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
npm install @inprd/ssi
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

## Full SSI Ecosystem Example

Issuance - Claiming - Verification of W3C Credential/Presentation

```shell

//DID Key
const didKey = new KeyDIDMethod()

//DID Ethr configs
const ethrProvider = {name: 'maticmum', 
    chainId: 80001, 
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

## Open Source Identity Packages used
* [did-resolver](https://github.com/decentralized-identity/did-resolver)
* [ethr-did-resolver](https://github.com/decentralized-identity/ethr-did-resolver)
* [key-did-resolver](https://github.com/ceramicnetwork/js-did/tree/main/packages/key-did-resolver)
* [did-jwt-vc](https://github.com/decentralized-identity/did-jwt-vc)
* [did-jwt](https://github.com/decentralized-identity/did-jwt)


## Opportunities for SDK development

* json-ld signature support
* other DID method support
* Revocation - CredentialStatusList support
* communication support for DIDComm, OIDC, Presentation exchange
* selective disclosure support (sd-jwt)

