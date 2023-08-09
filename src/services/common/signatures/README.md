# Digital Signatures

## Overview

Digital Signatures are how Verifiable Credentials are cryptographically verified.

In the SSI ecosystem, an Issuer of a Credential will digitally sign a Credential object with its private key before it issues it to the Holder. The Holder will then take that signed Credential and present it to a Verifier. The Verifier will perform digital signature verification on the Credential to ensure that it came from the correct Issuer.

Eliptic Curve Cryptography(ECC) is used to create a digital signature from a message and a private key.

Digital Signature Verification takes the original message and corresponding signature and uses the ECC to calculate the public key that corresponds to the private key that signed the message. If this public key matches the public key of the expected identity, then ownership over the private key that signed the message is proven.

The 2 main proof types (digital signatures) outlined in the [W3C spec](https://www.w3.org/TR/vc-data-model/#proofs-signatures) are [JWT](https://www.w3.org/TR/vc-data-model/#json-web-token) and [JSON-LD](https://www.w3.org/TR/vc-data-model/#data-integrity-proofs)

### JWT Basics

A JWT consists of 3 parts: `[header].[payload].[signature]`
* The Header is used to identify the algorithm used to generate the signature
* The Payload consists of the claims
* The Signature is the digital signature (JWS)

A Verifiable Credential can be encoded into JWT claims with the signature being a JWS. The W3C Spec outlines the [details of this conversion](https://www.w3.org/TR/vc-data-model/#jwt-encoding).

The JWT Credential represents an external proof type of the W3C standard, as the proof wraps the Credential data model, instead of being included in the data, as with the JSON-LD proof type.

### JSON-LD Basics

JSON-LD proofs are an example of an embedded proof type and rely on [Linked Data Signatures](https://www.w3.org/TR/vc-data-model/#data-integrity-proofs).

## SDK Functionality

### Interface

The 2 methods included in the `Signature` interface are `signVC` and `signVP`.

Implementations of this interface are required to take in the signing keys, the payload, and signing options to create the Credential Proof. The output is currently a `string` representing the JWT, however as new proof types are added, this type may change.

This interface is intended to support different proof types depending on SSI Ecosystem standards. We look to support json-ld, ebsi, and sd-jwt types in the future.

``` shell
    signVC(keys: DIDWithKeys, token: CredentialPayload, configs?: CreateCredentialOptions): Promise<string>;
    signVP(keys: DIDWithKeys, token: PresentationPayload, configs?: CreatePresentationOptions): Promise<string>;
```

### JWT

The SDK implementation of the JWT proof type relies on the [did-jwt-vc](https://github.com/decentralized-identity/did-jwt-vc) and [did-jwt](https://github.com/decentralized-identity/did-jwt) packages.  

Signing a VC requires an `Issuer`, `CredentialPayload` and `CreateCredentialOptions` as inputs to the [`createVerifiableCredentialJwt`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/index.ts#L75) function in did-jwt-vc.

Signing a VP requires an `Issuer`, `PresentationPayload` and `CreatePresentationOptions` as inputs to the [`createVerifiablePresentationJwt`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/index.ts#L134) function in did-jwt-vc.
#### Signing Options

[did-jwt-vc](https://github.com/decentralized-identity/did-jwt-vc) allows for more complex signing options from the [`CreateCredentialOptions`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L236) and [`CreatePresentationOptions`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L297) types.

```shell
/**
 * Represents the Creation Options that can be passed to the `createVerifiableCredentialJwt` method. Provides options of signing the JWT
 */
interface CreateCredentialOptions {
   /**
   * Determines whether the JSON->JWT transformation will remove the original fields from the input payload.
   * See https://www.w3.org/TR/vc-data-model/#jwt-encoding
   *
   * @default true
   */
  removeOriginalFields?: boolean
    /**
   * Allows including or overriding some header parameters of the resulting JWT.
   * If the issuer or holder does not list an `alg`, than `header` will be used
   */
  header?: Partial<JWTHeader>
  /**
  * did of Entity signing the JWT
  */
  issuer: string
  /**
  * Signer
  */
  signer: Signer
  expiresIn?: number
  canonicalize?: boolean
}
```

```shell
/**
 * Represents the Creation Options that can be passed to the `createVerifiablePresentationJwt` method.
 */
interface CreatePresentationOptions extends CreateCredentialOptions {
  domain?: string //added to `aud` JWT claim
  challenge?: string //added to `nonce` JWT claim
}
```
#### How to Use

The below details how to create a Credential object and sign as a JWT string.

```shell

    //Issuer keys for signing
    const didKey = new KeyDIDMethod();
    const issuerKeyDid = await didKey.create();

    //subject DID and data
    const subjectDID = await didKey.create();
    const subjectData = {
        "name": "Ollie"
    }

    //create VC from subject data
    const vc = await createCredential(
        issuerKeyDid.did, subjectDID.did, subjectData, PROOF_OF_NAME, additionalParams)

    //create credential options
    const options = {}

    //Use JWT signing service to sign the VC with the issuer keys
    const jwtService = new JWTService()
    const jwt = await jwtService.signVC(issuerKeyDid, vc, options)
```

### JSON-LD

This section is to be implemented.

`DIDWithKeys` and `CredentialPayload` types will be able to create the JSON-LD proof type.
If additional options are required to create the proof `CreateCredentialOptions` can be extended or replaced with a different structure.


