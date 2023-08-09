# Issuer

The Issuers in an SSI Ecosystem are the Entities responsible for issuing Verifiable Credentials (VCs) to Holders. Depending on the Credential type, the Issuer may need to authenticate or request some information from the Holder to create the Credential. An important part of Credential issuance is the signing of the Credential by the Issuer. The digital signature of the Credential ensures that it has not been tampered with and that it came from the Entity who signed it.

## SDK Features

* Issuer DID Creation
* Create and Import VC schemas
* Create signed VCs (JWT)
* Sign VCs using ed25519 and secp256K1
* Credential management (revocation)

### Create DID

An Issuer needs a DID to identify itself in an SSI Ecoystem. Verifiers need to verify that a trusted Issuer has signed Verifiable Credentials presented by Holders. This is done by resolving the Issuer DID to its public key and performing digital signature verification. 

This SDK supports 2 DID methods, did:key and did:ethr

#### did:key

```shell

    const didKey = new KeyDIDMethod();
    const holderKeyDid = await didKey.create();
```

#### did:ethr

See did:ethr for provider details

```shell

    //provider configs for did:ethr
    const ethrProvider = {
        name: 'maticmum', 
        rpcUrl: 'https://rpc-mumbai.maticvigil.com/', 
        registry: "0x41D788c9c5D335362D713152F407692c5EEAfAae"
    }
    
    const didEthr = new EthrDIDMethod(ethrProvider)
    const holderEthrDid = await didEthr.create();
```

### Schema Management

An Issuer determines the types of Credentials it will issue. Each of those Credential Types has a set of claims that form the `credentialSubject` property of a VC. The structure of these claims is defined by a schema. Schemas tell Holders what kind of information will be included in the VC and provide the Verifiers a way to confirm that the claims of the VCs are of the correct type and format. Schemas should be accessible by all entities of the SSI ecosystem. The implementation of schema management is determined by the SSI ecosystem, but this SDK provides some helper functions.

Currently this SDK provides functionality to retrieve schemas from a local file location or a remote URL location. See here for [more details](../common/schemas/README.md#how-to-create)

Once an Issuer has defined the credential types and schemas it will use for its VCs, the `credentialSchema` property of the VC can be used. See the [example](#credentialschema) below for how to add a schema to a VC.

### Verifiable Credentials

A [W3C Verifiable Credential](https://www.w3.org/TR/vc-data-model/#basic-concepts) is a verifiable set of claims about a subject that is signed by an Issuer.

The properties required to create a Verifiable Credential object are:
* Issuer DID - defines who issued the Credential and is used to perform digital signature verification
* Subject DID - defines who the Credential claims are about
* Credential Type - the type of the Credential, possibly defined by a schema
* Subject Data - the claims about the subject of the Credential

Additional parameters can be specified according to the [VC spec](https://www.w3.org/TR/vc-data-model/#basic-concepts).

Common parameters include: 
* `expirationDate` - when the Credential expires
* `credentialStatus` - location to determine the revocation status of the Credential
* `credentialSchema` - location of the credential schema
* `termsOfUse` - tells the recipient what actions it needs to follow to accept the Credential
* `evidence` - additional supporting information about the Credential claims

#### Credential Creation
`createCredential` creates an unsigned Verifiable Credential object.

``` shell
function createCredential(
    issuerDID: DID,
    subjectDID: DID,
    credentialSubject: CredentialSubject,
    credentialType: string,
    additionalProperties?: Partial<CredentialPayload>
) : CredentialPayload
```

#### CredentialPayload Type

This type defines a W3C Verifiable Credential. [`CredentialPayload`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L100) is defined in did-jwt-vc.  

```shell

type CredentialPayload {
  '@context': string | string[]
  id?: string
  type: string | string[]
  issuer: IssuerType
  issuanceDate: DateType
  expirationDate?: DateType
  credentialSubject: Extensible<{
    id?: string
  }>
  credentialStatus?: CredentialStatus
  evidence?: any
  termsOfUse?: any
}
```
#### Create Credential Usage

```shell

// DID of VC subject
const subjectDid 

// DID of VC for Revocation
const vcDID = await didEthr.create();

// subject data
const subjectData = {
     "name": "Ollie"
}

const additionalParams = {
     id: vcDID.did
}

// Credential Payload object
const vc = await createCredential(
    issuerKeyDid.did, subjectDid, subjectData, PROOF_OF_NAME, additionalParams)

```

#### Common Customizations

##### credentialSchema

Use to specify the location of the Credential Schema.

``` shell
const additionalParams = {
  credentialSchema: {
    id: "https://example.org/examples/degree.json",
    type: "JsonSchemaValidator2018"
  }
}
```

##### credentialStatus

Use to specify where to check the Credential's revocation status.

``` shell
const additionalParams = {
    credentialStatus: {
        id: "https://example.edu/status/24",
        type: "CredentialStatusList2017"
    }
}
```
##### expirationDate

Use to specify the date of Credential expiration - the date should be in ISO format.

``` shell

//create and ISO date example
const date = new Date();
isoDate.setTime(currentTimeInSeconds * 1000);
const isoDate = date.toISOString()

const additionalParams = {
    expirationDate: "2020-01-01T19:23:24Z",
}
```

#### Create Verifiable Credential from Schema
`createVerifiableCredentialFromSchema` creates an unsigned Credential and automatically sets the `credentialSchema` property of the VC to the provided schema location.

### Signing Verifiable Credentials

The essential component of Verifiable Credentials is that they are digitally signed by the Entity that creates and issues them. Signing the Credential ensures that the Verifier can prove that the Credential has not been tampered with and that the Issuer defined in the Credential is the Entity that signed the Credential.

This SDK currently only supports [JWT](../common/signatures/README.md#jwt).

#### Separate VC Creation and Signing

The code below separates VC creation and VC signature into 2 function calls to create a JWT.

```shell

    //first create the unsigned credential
    const vc = createCredential(...)

    //define any signing options
    const options: CreateCredentialOptions

    //create a jwt signing service object and provide issuer keys to sign the VC with the provided options
    const jwtService = new JWTService()
    const jwt = await jwtService.signVC(issuerKeyDid, vc, options)
```

#### Combine VC Creation and Signing

The code below uses the combined `createAndSignCredentialJWT` to create a JWT.

```shell

    //subject DID and data
    const subjectDID2 = await didEthr.create();
    const subjectData2 = {
        "name": "Angela"
    }

    //define any signing options
    const options: CreateCredentialOptions
    
    // returns the signed VC as a JWT string
    const jwt2 = await createAndSignCredentialJWT(
        issuerEthrDid,
        subjectDID2.did,
        subjectData2,
        PROOF_OF_NAME,
        {},
        options)  
```

#### Credential Signing Options

[`CreateCredentialOptions`](https://github.com/decentralized-identity/did-jwt-vc/blob/master/src/types.ts#L236) is defined in did-jwt-vc.

```shell
interface CreateCredentialOptions {
  removeOriginalFields?: boolean
  header?: Partial<JWTHeader>
  issuer: string
  signer: Signer
  expiresIn?: number
  canonicalize?: boolean
}
```

[More details](../../services/common/signatures/README.md#signing-options) about JWT signature options

### Verifiable Credential Revocation

Currently revocation is handled by providing the VC with a DID. This DID can be deactivated by the Issuer when the VC is revoked. A Verifier will check the VC DID's status to verify if the VC is not revoked.

The DID used must support deactivation, so the VC DID must be did:ethr.

In the future, this will be replaced by using a StatusList in the `credentialStatus` field. We will also consider other revocation options.

``` shell
    const vcDID = await didEthr.create();
    const additionalParams = {
        id: vcDID.did
    }

    const vc = await createAndSignCredentialJWT(
        issuer, subjectDID, subjectData, PROOF_OF_NAME, additionalParams)

    //revocation - deactivation of VC DID
    await didEthr.deactivate(vcDID)

```
