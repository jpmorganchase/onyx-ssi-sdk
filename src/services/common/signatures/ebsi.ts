
//ebsi spec specific signing criteria
//based on https://ec.europa.eu/digital-building-blocks/wikis/display/EBSIDOC/E-signing+and+e-sealing+Verifiable+Credentials+and+Verifiable+Presentations#EsigningandesealingVerifiableCredentialsandVerifiablePresentations-HowtosignVCandVP

//instead of using did-jwt-vc library, require certain jwt attributes exist for VC and VP
//might require harder restriction for credentialPayload input...can define type extension here

//export type EBSICredentialPayload extends CredentialPayload