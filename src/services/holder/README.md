# Holder

The Holders in an SSI Ecosystem are the Entities to whom a Verifiable Credential is issued. Holders are usually the subjects of the Credentials that they aquire and present to Verifiers. Holders communicate with Issuers to claim various types of Credentials which can contain any information about the Holder. In a built out SSI Ecosystem there will be many Issuers of different Credential types, so Holders can pick and choose which Credentials and Issuers they want to use. The Holders can use their Credentials by presenting them to Verifiers. Each Verifier determines the Credential types and Issuers it will accept. The key point is that the Holder is in control of its Credentials and thus its identity at all times. The Holder can choose what Credentials to claim and who to present them to.

## SDK Features

* Holder DID Creation
* Create signed VPs (JWT)
* Sign VPs using ed25519 and secp256K1

### Create DID

To claim a Verifiable Credential from an Issuer, a Holder needs to identify themselves with a DID. To create a Verifiable Presentation(VP) to present to a Verifier, the Holder needs to sign the requested Verifiable Credentials with its private key that corresponds to its DID. 

The SDK provides functionality to create a DID. Options available are did:key or did:ethr.

#### did:key

```shell

    const didKey = new KeyDIDMethod();
    const holderKeyDid = await didKey.create();
```

#### did:ethr

```shell

    //provider configs for did:ethr
    const ethrProvider = {
        name: 'maticmum',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com/', 
        registry: "0x41D788c9c5D335362D713152F407692c5EEAfAae"}
    
    const didEthr = new EthrDIDMethod(ethrProvider)
    const holderEthrDid = await didEthr.create();
```

### Verifiable Presentation

A [W3C Verifiable Presentation](https://www.w3.org/TR/vc-data-model/#presentations-0) is an optional tool used by Holders to present Verifiable Credentials. Verifiable Presentations allow Holders to aggregate all required Credentials by a Verifier and digitally sign them to prove the ownership of those Credentials to the Verifier.

The properties required to create a Verifiable Presentation object are:
* Holder DID - defines who created the Presentation and is used to perform digital signature verification
* VerifiableCredentials - the list of cryptographically verifiable credentials to be presented

Optional parameters can be specified according to the [VC spec](https://www.w3.org/TR/vc-data-model/#presentations-0). Common parameters include: 
* `id` - provides a unique identitifer for the presentation
* `issuanceDate` - when the Presentation was created
* `expirationDate` - when the Presentation expires
* `verifier` - list of verifiers the Presentation is intended for

#### Creating a Presentation

`createPresentation` creates an unsigned Verifiable Presentation.

``` shell
function createPresentation(
    holderDID: DID,
    verifiableCredentials: VerifiableCredential[]
) : PresentationPayload
```

#### PresentationPayload Interface

This type defines a [W3C Verifiable Presentation](https://www.w3.org/TR/vc-data-model/#presentations-0) object. [`PresentationPayload`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L152) is defined in did-jwt-vc.  

```shell
type PresentationPayload {
  '@context': string | string[]
  type: string | string[]
  id?: string
  verifiableCredential?: VerifiableCredential[]
  holder: string
  verifier?: string | string[]
  issuanceDate?: string
  expirationDate?: string
}
```

#### VerifiableCredential type

[`VerifiableCredential`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L191) defines a signed Verifiable Credential and is defined in did-jwt-vc. 

``` shell
type VerifiableCredential = JWT | Verifiable<W3CCredential>
```

#### Create Presentation Usage

```shell

// DID of subject
const subjectDid = await didKey.create();

//signed VCs as JWT strings or Verifiable<W3CCredential> objects
const vcs = [] 

// Presentation Payload object
const vp = await createPresentation(
    subjectDid, vcs)

```

### Signing Verifiable Presentations

The essential component of Verifiable Presentations is that they are digitally signed by the Entity that creates and presents them. Signing the Presentation ensures that the Verifier can prove that the Presentation and included Credentials have not been tampered with and that the Holder defined in the Presentation is the Entity that signed the Presentation.

This SDK currently only supports [JWT](../common/signatures/README.md#jwt).

#### Separate VP Creation and Signing

The code below separates VP creation and VP signature into 2 function calls to create a signed JWT.

```shell

    // create the unsigned vp
    const vp = await createPresentation(...)

    // define any signing options
    const options: CreatePresentationOptions

    // create a jwt signing service object and provide keys to sign the VP with the provided options
    const jwtService = new JWTService()
    const jwt = await jwtService.signVP(holderDid, vp, options)
```

#### Combine VP Creation and Signing

The code below uses the combined `createAndSignPresentationJWT` to create a signed JWT.

```shell

    // subject DID
    const subjectDID = await didEthr.create();

    // define any signing options
    const options: CreatePresentationOptions

    // returns the signed VP as a JWT string
    const vpJwt = await createAndSignPresentationJWT(
        subjectDID,
        vcs,
        options)  
```

#### Presentation options

[`CreatePresentationOptions`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L305) is defined in did-jwt-vc.

```shell
interface CreatePresentationOptions {
  domain?: string
  challenge?: string
  removeOriginalFields?: boolean
  header?: Partial<JWTHeader>
  issuer: string
  signer: Signer
  expiresIn?: number
  canonicalize?: boolean
}
```

[More details](../../services/common/signatures/README.md#signing-options) about JWT signature options
