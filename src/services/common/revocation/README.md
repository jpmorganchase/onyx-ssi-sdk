# Credential Revocation

Some types of Verifiable Credentials require the ability to be revoked by the Entity that issued them. An example could be a University Credential that needs to be revoked once the student (Credential holder) has graduated. The [W3C Verifiable Credential spec](https://www.w3.org/TR/vc-data-model/#status) has a property to track the status of a Credential. Upon receiving a Credential, a Verifier should check that the Credential has not been revoked. The Verifier should not have to contact the Issuer of the Credential to verify this information. Revocation Registries and Status Lists have been outlined as solutions for verifying Credential status.

The implementation we would like to support in this challenge is [StatusList2021](https://www.w3.org/TR/vc-status-list/).

**Goal:** Provide support for creating a revocable Verifiable Credential following StatusList2021.

## Spec

### StatusList2021

The basic idea of [StatusList2021](https://www.w3.org/TR/vc-status-list/) is that the Issuer keeps a bitstring list of all Verifiable Credentials it has issued. Each credential is associated with a position in the list. The value at the position is either 0 - not revoked, or 1 - revoked. 

This status list is published by the Issuer as a verifiable credential with a type of `StatusList2021Credential`

### Functionality to Implement
* Function to create [StatusList Credential](#StatusList-Credential)
* Function to generate [`credentialStatus` field](#StatusList2021Entry) for revokable credentials
* Function to check the revocation status of a Credential

## Where to Start/Implementation Details

Please fork this repo and use this starter branch.

StatusList2021 functionality can be added to this revocation folder. Structure is up to the implementer.

### StatusList Credential

The Status List is published by the Issuer and is a Verifiable Credential. 
The Issuer creates a Verifiable Credential that contains information about the Status List 

The Status List details are included in `credentialSubject` field of Verifiable Credential

``` shell
{
  "id": "https://example.com/credentials/status/3",
  "type": ["VerifiableCredential", "StatusList2021Credential"],
  "credentialSubject": {
    "id": "https://example.com/status/3#list",
    "type": "StatusList2021",
    "statusPurpose": "revocation",
    "encodedList": "H4sIAAAAAAAAA-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA"
  },
...
}
```
* id - (optional) the url of this Credential
* type - should contain `StatusList2021Credential`
* credentialSubject
  * type - `StatusList2021`
  * statusPurpose - `revocation`
  * encodedList - the compressed and base64 encoded value of the bit-string


### StatusList2021Entry

When the Issuer issues a Verifiable Credential that is revokable, they will include an entry in the `credentialStatus` field.
This Entry contains the information needed to check this Credential's status in the Status List credential.

``` shell
"credentialStatus": {
  "id": "https://example.com/credentials/status/3#94567",
  "type": "StatusList2021Entry",
  "statusPurpose": "revocation",
  "statusListIndex": "94567",
  "statusListCredential": "https://example.com/credentials/status/3"
}
```

* id - a URL identifying the status information for the verifiable credential
* type - `StatusList2021Entry`
* statusPurpose - `revocation`
* statusListIndex - the bit position of the credential within the bit-string
* statusListCredential - the URL of the StatusList2021Credential credential that encapsulates the bit-string (should match the `id` field of StatusList Credential)

### CredentialStatus Check

Provide a function for the Verifier to use to check the `credentialStatus` property of a revokable Credential

## Testing
The functionality added for this challenge should be unit tested. Tests can be added [here](../../../../tests/unit) in a new `revocation` folder.

## Criteria for Completion
* All [functionality](#Functionality-to-Implement) has been implemented
* Code written has corresponding unit tests (90% coverage)
* Code is well documented
* Code passes CI github action (building, linting, and testing of SDK)

