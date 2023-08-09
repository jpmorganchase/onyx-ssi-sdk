# Verifier

The Verifiers in an SSI Ecosystem are the Entities who verify the Verifiable Credentials/Presentations presented to them by the Holders. In the verification process of a Credential, the verifier must be able to determine who issued the credential, that the credential has not been tampered with, and that the credential is not expired or been revoked. Verifiers may also choose to verify specific claims in the Credential depending on the use case. A Verifier determines what Credential types it accepts and the Issuers it trusts. A key point is that the Verifier never has to communicate directly with the Issuer to verify information about the Holder.

## SDK Features

* Digital Signature Verification (JWT)
* Credential Revocation Verification
* DID status Verification
* Issuance date Verification
* Expiration date Verification
* Credential Schema Verification

### Setup DID Resolvers

[DID Resolvers](https://www.w3.org/TR/did-core/#resolution) are used for signature verification and DID status verification.

Current DIDs used in this SDK are did:key and did:ethr. As we support more DID methods, we will also need to add support for their Resolvers.

```shell
  //setup did:ethr configs
  const ethrProvider = {
    name: 'maticmum', 
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/', 
    registry: "0x41D788c9c5D335362D713152F407692c5EEAfAae"
  }
    
  //create did resolvers
  const ethrResolver = getEthrResolver(ethrProvider)
  const keyResolver = getKeyResolver()
  const didResolver = new Resolver({
      ...ethrResolver, 
      ...keyResolver})
```

This SDK also provides a helper method `getSupportedResolvers` to extract the Resolver from defined DIDMethods.

``` shell
const keyMethod = new KeyDIDMehod()
const ethrMethod = new EthrDIDMethod(...)
const didResolver = getSupportedResolvers([keyMethod, ethrMethod])

```

### Digital Signature Verification

This SDK currently supports Verifiable Credentials and Presentations in JWT format. An important check of Credential Verification is that the digital signature of the Credential was signed by the Issuer defined in the Credential and the digital signature of the Presentation was signed by the Holder defined in the Presentation.

#### Credential JWT Verification

`verifyCredentialJWT` verifies that the Issuer DID is Entity that signed the VC. It can also optionally verify that the VC JWT is valid (i.e. issuance, not issued before, and expiry dates are all valid) and that the format of the VC is correct.

This function relies on the [`verifyCredential`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/index.ts#L228) method from did-jwt-vc.

```shell
    const vc = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiUHJvb2ZPZk5hbWUiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsibmFtZSI6IkFuZ2VsYSJ9fSwic3ViIjoiZGlkOmV0aHI6bWF0aWNtdW06MHgyMWFDM2FlNEZjZkM0QTdhOWU4MjJFNjM4NDkxZDc2MjU1OUU5MTllIiwibmJmIjoxNjgwODgzMTc5LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweDcyMkFBOUEzMzNFOTJGYTZBZGVjOUE1N2E2YjZEYUY4MzBBMmY3YmUifQ.TcMJinuMuNQpyZkQ9wxqNkOx9SHpGe6iANXWPMl1etyNbzCrnZhidII6SjwkAu3dcWyjQiT1vCCZKd9HywiJWQ'
    const options: VerifyCredentialOptions = {}

    // returns a boolean
    const verified = await verifyCredentialJWT(vc, didResolver, options)
```

[`VerifyCredentialOptions`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L260) is defined in did-jwt-vc.

``` shell

interface VerifyCredentialOptions{
  removeOriginalFields?: boolean
  policies?: VerifyCredentialPolicies
  audience?: string
  callbackUrl?: string
  resolver?: Resolvable
  skewTime?: number
  /** See https://www.w3.org/TR/did-spec-registries/#verification-relationships */
  proofPurpose?: ProofPurposeTypes
  policies?: JWTVerifyPolicies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any
}

interface VerifyCredentialPolicies {
  // tweak the time at which the credential should be valid (UNIX timestamp, in seconds)
  now?: number
  // when false skips issuanceDate check
  issuanceDate?: boolean
  // when false skips expirationDate check
  expirationDate?: boolean
  // when false skips format checks
  format?: boolean

  [x: string]: any
  ```

#### Presentation JWT Verification

`verifyPresentationJWT` verifies that the Subject DID is the Entity that signed the VP. If a challenge and audience options were used in signing the VP, this function also verifies that the Presentation contains the challenge in the JWT nonce and that the VP audience is a match. It can also optionally verify that the VP JWT is valid (i.e. issuance, not issued before, and expiry dates are all correct). In addition, an option to check the format of the VP and included VCs is provided.

This function relies on the [`verifyPresentation`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/index.ts#L287) function from did-jwt-vc.

``` shell
    
    const vp = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKaGJHY2lPaUpGVXpJMU5rc2lMQ0owZVhBaU9pSktWMVFpZlEuZXlKMll5STZleUpBWTI5dWRHVjRkQ0k2V3lKb2RIUndjem92TDNkM2R5NTNNeTV2Y21jdk1qQXhPQzlqY21Wa1pXNTBhV0ZzY3k5Mk1TSmRMQ0owZVhCbElqcGJJbFpsY21sbWFXRmliR1ZEY21Wa1pXNTBhV0ZzSWl3aVVISnZiMlpQWms1aGJXVWlYU3dpWTNKbFpHVnVkR2xoYkZOMVltcGxZM1FpT25zaWJtRnRaU0k2SWtGdVoyVnNZU0o5ZlN3aWMzVmlJam9pWkdsa09tVjBhSEk2YldGMGFXTnRkVzA2TUhneU1XRkRNMkZsTkVaalprTTBRVGRoT1dVNE1qSkZOak00TkRreFpEYzJNalUxT1VVNU1UbGxJaXdpYm1KbUlqb3hOamd3T0Rnek1UYzVMQ0pwYzNNaU9pSmthV1E2WlhSb2NqcHRZWFJwWTIxMWJUb3dlRGN5TWtGQk9VRXpNek5GT1RKR1lUWkJaR1ZqT1VFMU4yRTJZalpFWVVZNE16QkJNbVkzWW1VaWZRLlRjTUppbnVNdU5RcHlaa1E5d3hxTmtPeDlTSHBHZTZpQU5YV1BNbDFldHlOYnpDcm5aaGlkSUk2U2p3a0F1M2RjV3lqUWlUMXZDQ1pLZDlIeXdpSldRIl19LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweDk2MThBNDk0MGY0ZkZBMTYwNDU5ZGJENTI1Y0UzN0M5OTk0NWZFMDcifQ.2Ma25BNlm0KVKYYNAhDo4ppjKZkYuyqxFy8v9gexwX_m646L0CAAhKGs2MYdPVBVVaar5K8w9ucVaUTvo7x4TQ'

    const options: VerifyPresentationOptions = {}
    const verified = await verifyPresentationJWT(vp, didResolver, options)
```

[`VerifyPresentationOptions`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L297) type is defined in did-jwt-vc.

``` shell
interface VerifyPresentationOptions{
  domain?: string
  challenge?: string
  removeOriginalFields?: boolean
  policies?: VerifyCredentialPolicies
  audience?: string
  callbackUrl?: string
  resolver?: Resolvable
  skewTime?: number
  /** See https://www.w3.org/TR/did-spec-registries/#verification-relationships */
  proofPurpose?: ProofPurposeTypes
  policies?: JWTVerifyPolicies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any
}
```

##### Verifying Credentials Within the VP

`verifyPresentationJWT` enables verification of the JWT presented by the Holder. In order to verify Credentials within the Presentation, a helper method `getCredentialsFromVP` is provided to get the included [`VerifiableCredential`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L191)s.

``` shell
    const credentials = getCredentialsFromVP(vp)

    for (let cred of credentials) {
        await verifyCredentialJWT(cred, didResolver)
    }
```

### DID Verification

VC Verification involves verifying that the Issuer DID and the Subject DID contained in the VC are active (i.e. not revoked). `verifyDIDs` is an additional check and takes in the `VerifiableCredential` object.

``` shell
const verified = await verifyDIDs(vc, didResolver)
```

### VC Revocation Verification

VC Verification involves verifying that the VC has not been revoked. Revocation is currently solved by giving the VC a DID and managing its status in the DIDRegistry. `verifyRevocation` is an additional check and takes in the `VerifiableCredential` object.

``` shell
const verified = await verifyRevocation(vc, didResolver)
```

### Expiration Date Verification

Expiration date can be verified as part of the JWT verification using the `VerifyCredentialOptions`, however we provide it as a separate function here. `verifyExpiry` takes in the `VerifiableCredential` object.

``` shell
const verified = verifyExpiry(vc)
```

### Issuance Date Verification

Issuance date can be verified as part of the JWT verification using the `VerifyCredentialOptions` parameter, however we provide it as a separate function here. `verifyIssuanceDate` takes in the `VerifiableCredential` object.

``` shell
const verified = verifyIssuanceDate(vc)
```

### Credential Schema Verification

If a VC contains a `credentialSchema` property, the `credentialSubject` structure can be validated using the `verifySchema` function. It takes the `VerifiableCredential` object as well as a boolean to determine how the schema should be retreived (local file=true or remote location=false).

``` shell
const verified = await verifySchema(vc, true)
```
