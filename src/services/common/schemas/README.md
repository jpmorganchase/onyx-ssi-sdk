# Schema and Context Management

## Schema Management

An important part of an SSI ecosystem is the ability for Issuers, Holders, and Verifiers to understand the types of Verifiable Credentials supported in the Ecosystem.  The Issuers are the Entities that define the types of Credentials they will issue to Holders. The Holders need to know what data will be included the Credentials they want to claim. And the Verifiers need to define the types of Credentials they will accept and know how to verify them.

Thus Credential Types and Schemas play an important role in defining an SSI Ecosystem. The Operator of an SSI Ecosystem can choose how they want to make the Credential Types and Schemas known to the participants. This SDK provides the ability to locally define Credential Types and Schemas and import them as JSON schemas. In future editions, these definitions may be moved to a separate repository for easier maintenance. Helper functions will be provided to assist in an Ecosystem's Schema management solution. This could be hosting remotely, storage on a blockchain, IPFS, etc.

### Credential Type

[W3C Credential Type](https://www.w3.org/TR/vc-data-model/#types) is a required property in a Verifiable Credential or Verifiable Presentation. `VerifiableCredential` and `VerifiablePresentation` are required types to be listed in a Verifiable Credential and Verifiable Presentation definition respectively. Additional types can be defined that signal to a Verifier the structure of the `credentialSubject` of the Credential. The Credential Type must be able to be dereferenced to a document containing machine-readable info about the type. This can be done through the [`@context`](https://www.w3.org/TR/vc-data-model/#contexts) property of the Verifiable Credential/Verifiable Presentation.

### Credential Schema

[W3C Schemas](https://www.w3.org/TR/vc-data-model/#data-schemas) help to enforce a specific structure on the subject data (`credentialSubject`) of a Verifiable Credential.

The Issuer can use the `credentialSchema` property to define the data structure of the `credentialSubject` of the Verifiable Credential.  When a Verifier receives a Credential with this property defined, it can optionally choose to verify that the structure of the `credentialSubject` matches the defined schema.

### Examples
The 4 Credential Types provided in this SDK are [`proofOfAddress`](definitions/proofOfAddress.json), [`proofOfName`](definitions/proofOfName.json), [`balanceCredential`](definitions/balanceCredential.json), [`verifiedCustomer`](definitions/verifiedCustomer.json). The schemas for these types are defined in the [definitions](definitions) folder as json files.

### How to Create

When defining a new schema, the `$schema` property needs to be specified so the defined schema can be validated.

To use a new schema in a VC, define a schema as a JSON file and add to the [definitions](definitions) folder.

Two helper functions are provided to retrieve the schema as a `JSONSchema` object.
* `getSchemaRemote` can be used for remotely hosted schemas. Specify the remote location to retrieve the schema as a `JsonSchema` object. 
* `getSchemaLocal` can be used for schemas stored on a local file path.

Both of these functions will first validate the schema and will return an error if it is not a valid JSONSchema defined in the `$schema` property.

`JsonSchema` is defined as:

```shell
interface JsonSchema {
    type: string,
    required: string[],
    additionalProperties: boolean,
    properties: {[key: string]: JsonSchemaProperty},
  }
```

### How to Verify

Some use cases may require verifying that a Verifiable Credential conforms to a particular schema type. We provide a helper function to achieve this verification step.

`validateCredentialSubject` is provided to easily validate that a `credentialSubject` object follows the defined schema.
Please make sure that the Verifier code can access the URI location of the schema that was defined in the Issuance of the Credential.

### Future Improvements

Currently schema definitions are defined in the definitions folder of the SDK. Depending on use case needs, the Onyx SDK will provide options for registering schemas publicly (either on chain or in a hosted location).

The current JSON Schema used is [draft-07](https://json-schema.org/specification-links.html#draft-7) and the SDK uses [`jsonschema`](https://github.com/tdegrunt/jsonschema) to validate these schemas. The W3C is working on a new [spec](https://www.w3.org/TR/vc-json-schema/) for Credential Schemas. Once this is finalized, this SDK will provide support for that spec as the default.

## Context Management

The [`@context`](https://www.w3.org/TR/vc-data-model/#contexts) property in the W3C spec is used to define attributes and values of the types inside the Verifiable Credential. The `@context` property can be composed of URIs that define context information. URIs used need to be able to be dereferenced.

This section is a work in progress, and enhancements from the community are welcome.
