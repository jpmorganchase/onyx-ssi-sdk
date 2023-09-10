# OIDC for Verifiable Credentials
All 3 Entities that make up the Trust Triangle (Issuer, Holder, and Verifier) need a standard way of communicating with each other to share Credentials. Specs to standardize this communication flow have arisen including OIDC, DIDComm, Presentation Exchange flow. In this challenge we would like to explore implementing the OpenID Connect standards for Credential Issuance and Credential Presentation.

**Goal**: Provide support for credential issuance and presentation exchange via the OpenID Connect (OIDC) standards.

The OIDC standard has been enhanced to provide support specifically for Verifiable Credentials. An introduction to these standards can be found [here](https://medium.com/decentralized-identity/where-to-begin-with-oidc-and-siop-7dd186c89796)

* [OIDC4VC for Issuance](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html)
* [OIDC4VP for Presentation](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)

## OIDC4VC (OIDC for Credential Issuance) Spec
Some helpful resources that break down Credential Issuance Requirements:
* https://ec.europa.eu/digital-building-blocks/wikis/display/EBSIDOC/EBSI+Verifiable+Credentials+Explained?preview=/597952490/668537204/(EBSI).(EDU-MATERIAL).(OID4VC).(v1.5.9).pdf
* https://api-conformance.ebsi.eu/docs/ct/issue-to-holder-functional-flows
* https://api-conformance.ebsi.eu/docs/ct/verifiable-credential-issuance-guidelines-v3

### Functionality to Implement
* Functions to support Issuer side of communication
* Functions to support Wallet (holder) side of communication

### Where to Start/Implementation Details

OIDC4VC functionality can be added to this `oidc` folder. Structure is up to the implementer.

There are 2 flows available for Credential Issuance, Authorization Code flow or a new pre-authorized flow. The functionality outlined below is for the authorization code flow

#### Issuer
* Frontend to initiate connection request with Wallet (QR code, wallet redirect)
* [Extend OAuth2 metadata to include Credential info](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#credential-issuer-metadata)
* [Setup OAuth2 Authorization server with authorization code flow](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#name-oauth-20)
  * [Authorization endpoint](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#authorization_endpoint): process authorization request and return authorization code
  * [Token endpoint](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#token_endpoint): validates authorization code and returns access token
* [Oauth2 protected credential endpoint](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#credential-endpoint): validate access token and optional challenge and return VC

#### Wallet
* OAuth2 authorization code flow (Authorization Request and Token Request)
* [Create Credential Request](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#name-credential-request) and send to credential endpoint: 

## OIDC4VP (OIDC for Credential Presentation) Spec
Some helpful resources that break down Credential Presentation Requirements:
* https://api-conformance.ebsi.eu/docs/ct/verifier-functional-flows
* https://api-conformance.ebsi.eu/docs/ct/verifiable-presentation-exchange-guidelines-v3
  
OIDC4VP uses [Presentation Exchange Flow](https://identity.foundation/presentation-exchange/)

### Functionality to Implement
* Functions to support Wallet (holder) side of communication
* Functions to support Verifier side of communication

### Where to Start/Implementation Details

OIDC4VP functionality can be added to this `oidc` folder. Structure is up to the implementer.

#### Wallet
* Parse SIOP request
* [Construct Presentation response](https://openid.net/specs/openid-connect-4-verifiable-presentations-1_0-07.html#section-8.1.2)

#### Verifier
* Provide "Connect with Credentials" option for Wallet
* [Add `vp_format` metadata parameters in openid-configuration](https://openid.net/specs/openid-connect-4-verifiable-presentations-1_0-07.html#name-rp-metadata)
* [Generate SIOP request](https://openid.net/specs/openid-connect-4-verifiable-presentations-1_0-07.html#section-8.1.1)
* [Parse Presentation response](https://openid.net/specs/openid-connect-4-verifiable-presentations-1_0-07.html#name-token-response-including-vp) from Wallet (`id_token` and `vp_token`)
* Verify VP from `vp_token`

## Testing

The functionality added for this challenge should be unit tested. Tests can be added [here](../../../../../../tests/unit) in a new `oidc` folder.

## Criteria for Completion
* All [functionality](#Functionality-to-Implement) for either (or both) OIDC4VC and OIDC4VP have been implemented
* Code written has corresponding unit tests (90% coverage)
* Code is well documented
* Code passes CI github action (building, linting, and testing of SDK)
* Proof by example

# Other Communication standards
This challenge is not limited to OIDC. Submissions for implementing [DIDComm](https://identity.foundation/didcomm-messaging/spec/v2.0/) or [Presentation Exchange](https://identity.foundation/presentation-exchange/spec/v2.0.0/) will also be accepted.
