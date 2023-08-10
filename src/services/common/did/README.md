# Decentralized Identifiers (DIDs)

## DID Overview

Decentralized Identitifiers are unique identifiers that can refer to any subject (ie: person, organization, data model, entity, thing, etc). They have been standardized by the [W3C spec](https://www.w3.org/TR/did-core/). DIDs are an essential component in an SSI Ecosystem as they give an identity to every entity.

### Characteristics of a DID
* Decentralized: the identifier does not depend on a centralized authority to create it
* Persistent: once an identifier is created, it permanently identifies the subject
* Resolvable: given the identifier you can find out relevant metadata
* Cryptographically Verifiable: there's a way to cryptographically prove identity and ownership of the DID

### DID Format

`did:example:1234xyz`

`did` is the Scheme

`example` is the Method (defines how to interact with the DID)

`1234xyz` is the unique Identifier

### DID Document
Every DID associates with a [DID Document](https://www.w3.org/TR/did-core/#did-documents). The DID Document contains information about how to interact with the DID. The resolved DID Document format is most commonly JSON or JSON-LD.

#### DID Document Properties
* Subject: owner of the DID Document, expressed as `id` property
* Controller: entity authorized to make changes to the DID Document
* Verification Methods: public keys of the subject to be used in authentication, assertion, verification of the subject
* Services: define ways of communicating with the DID subject

More info on [Advanced use of DID Documents](https://www.w3.org/TR/did-spec-registries/)

### DID Method
The DID method is the way by which the DID and its associated DID Document are created, resolved, updated, and deactivated. Each DID method defines a spec as to how these 4 operations are implemented.

* Create: specifies how a DID and DID Document is created for a subject
* Resolve: specifies how a resolver, given a DID, returns the associated DID Document
* Update: specifies how a DID Controller can update a DID Document (ie: support key rotation)
* Deactivate: specifies how a DID Controller can deactivate a DID

#### Available DID methods
Many implementations of the DID specification exist. Not all DID methods require use of a blockchain, and there are pros and cons to using specific methods. The list of available DID methods are [here](https://www.w3.org/TR/did-spec-registries/#did-methods) or [here](https://diddirectory.com/)

The DID methods currently supported in this SDK are [did:key](https://w3c-ccg.github.io/did-method-key/) and [did:ethr](https://github.com/decentralized-identity/ethr-did-resolver/blob/master/doc/did-method-spec.md)

## DID Operations in this SDK
### CRUD

Every DID method defines Create, Resolve, Update and Delete functions for the DID.

The SDK provides a `DIDMethod` interface to abstract these functions.

#### Create

* `create` generates a keypair and creates a DID from it
* `generateFromPrivateKey` creates a DID given a private key

Both return `DIDWithKeys` object

``` shell

interface DIDWithKeys {
    did: DID,
    keyPair: KeyPair
  }

interface KeyPair {
    algorithm: KEY_ALG,
    publicKey: string | Uint8Array,
    privateKey: string | Uint8Array
  }

```

#### Resolve

`resolve` returns [`DIDResolutionResult`](https://github.com/decentralized-identity/did-resolver/blob/master/src/resolver.ts#L27) from did-resolver

``` shell
interface DIDResolutionResult {
  '@context'?: 'https://w3id.org/did-resolution/v1' | string | string[]
  didResolutionMetadata: DIDResolutionMetadata
  didDocument: DIDDocument | null
  didDocumentMetadata: DIDDocumentMetadata
}
```
Every DID method used in this SDK will be compatible with [did-resolver](https://github.com/decentralized-identity/did-resolver).

#### Update

If the DID method supports updating a DID, the `update` method will be implemented. One important update functionality is key rotation.

#### Delete

If the DID method supports deletion of a DID, the `deactivate` method will be implemented.

### Helper functions
The SDK provides helper functions to assist with DIDs.

* `isActive` provides a way to check if a given DID has an active status
* `getIdentifier` provides a way for the Identifier portion of the DID to be extracted from the DID string
* `getDIDResolver` provides a way for the DID method's Resolver to be retrieved
* `getSupportedResolvers` creates a [Resolver](https://github.com/decentralized-identity/did-resolver/blob/master/src/resolver.ts#L338) from the provided DIDMethods

## SDK Supported DID Methods

### did:key

[did:key](https://w3c-ccg.github.io/did-method-key/) is a self resolving identifier. The public key is stored directly in the identifier of the DID, enabling local resolution. As such, did:key does not support key rotation or deactivation.

SDK implementation uses [edDSA keypair algorithm](https://github.com/transmute-industries/verifiable-data/tree/main/packages/ed25519-key-pair) to create the public/private keypair and associated DID. It uses the [key-did-resolver](https://github.com/ceramicnetwork/js-did/tree/main/packages/key-did-resolver) to perform resolution to a DID Document.

format: `did:key:{base58 encoded ed25519-pub public key}`

### did:ethr

[did:ethr](https://github.com/decentralized-identity/ethr-did-resolver/blob/master/doc/did-method-spec.md) stores DID Documents in a smart contract deployed on an Ethereum-based blockchain. The DID Document is resolved based on Events emitted by the smart contract. As such, it supports key rotation and revocation.

SDK implemenation uses ES256K keypair algorithm and [ethr-did-resolver](https://github.com/decentralized-identity/ethr-did-resolver). The DIDRegistry to deploy on an Ethereum-compatible registry is located in [ethr-did-registry](https://github.com/uport-project/ethr-did-registry/blob/master/contracts/EthereumDIDRegistry.sol). The identifier is expected by this SDK to be an ethereum address or a hex encoded public key string.

format: `did:ethr:{network}:{ethereum address or public-key-hex}`

Using did:ethr with a network that uses gas (ie Ethereum or Polygon), requires the DID to have funds to pay for the `update` and `deactivate` functions. After creation of the DID, funds will needed to be transferred to that account address.

#### Provider Configs
did:ethr takes a required `ProviderConfig` argument that defines how to communicate with the DIDRegistry.

``` shell
interface ProviderConfigs {
   /**
     * Contract address of deployed DIDRegistry
     */
    registry: string
    /**
     * The name of the network or the HEX encoding of the chainId.
     * This is used to construct DIDs on this network: `did:ethr:<name>:0x...`.
     */
    name: string
    description?: string
    /**
     * A JSON-RPC endpoint that can be used to broadcast transactions or queries to this network
     */
    rpcUrl?: string
    /**
     * ethers {@link Provider} type that can be used instead of rpcURL
     * One of the 2 must be provided for did-ethr. Provider will be
     * chosen over URL if both are given
     */
    provider?: Provider
}

```
