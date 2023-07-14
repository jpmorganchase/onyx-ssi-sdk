import { Resolvable } from 'did-resolver'
import { VerifiableCredential, VerifiablePresentation, verifyCredential, VerifyCredentialOptions, verifyPresentation, VerifyPresentationOptions } from "did-jwt-vc"
import { DID, SchemaManager } from '../common';
import { decodeJWT } from 'did-jwt';
import { DIDMethodFailureError } from '../../errors';
/**
 * Provides verification of a Verifiable Credential JWT
 * 
 * It uses the {@link verifyCredential} method from did-jwt-vc. This performs JWT
 * validation (digital signature, date verification) and optionally performs format validation
 * of the Verifiable Credential against the W3C standards. The options parameter can be 
 * configured to customize what features of the Credential and JWT are validated by the 
 * did-jwt-vc and did-jwt packages
 * 
 * 
 * @param vc {@link VerifiableCredential} to be verified. Either a JWT or W3C VC with proof.
 * @param didResolver a configured `Resolver` (or an implementation of `Resolvable`) that can provide the DID document
 *   of the JWT issuer
 * @param options optional tweaks to the verification process
 * @returns a `Promise` that resolves to a boolean or rejects with 
 * `TypeError` if the input is not W3C compliant
 * `Error` thrown from did-jwt if any jwt verification fails
 */
export async function verifyCredentialJWT(
    vc: VerifiableCredential,
    didResolver: Resolvable,
    options?: VerifyCredentialOptions
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
) : Promise<boolean> {
    if(typeof vc === 'string') {
        const verified = await verifyCredential(vc, didResolver, options)
        return verified.verified
    }
    throw TypeError('Ony JWT supported for Verifiable Credentials')
}

/**
 * Provides verification of a Verifiable Presentation JWT
 * 
 * It uses the {@link verifyPresentation} method from did-jwt-vc. This performs JWT
 * validation (digital signature, date verification) and optionally performs format validation
 * of the Verifiable Presentation against the W3C standards. The options parameter can be 
 * configured to customize what features of the Presentation and JWT are validated by the 
 * did-jwt-vc and did-jwt packages.  * This function will not do any validation of the internal 
 * VerifiableCredentials except for format validation
 * 
 * 
 * @param vc {@link VerifiablePresentation} to be verified. Either a JWT or W3C VP with proof.
 * @param didResolver a configured `Resolver` (or an implementation of `Resolvable`) that can provide the DID document
 *   of the JWT issuer
 * @param options optional tweaks to the verification process
 * @returns a `Promise` that resolves to a boolean or rejects with 
 * `TypeError` if the input is not W3C compliant
 */
export async function verifyPresentationJWT(
    vp: VerifiablePresentation,
    didResolver: Resolvable,
    options?: VerifyPresentationOptions
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
) : Promise<boolean> {
    if(typeof vp === 'string') {
        const verified = await verifyPresentation(vp, didResolver, options)
        return verified.verified
    }
    throw TypeError('Ony JWT supported for Verifiable Presentations')

}

/**
 * Verify that a DID has an active status.
 * 
 * Resolves the DID to its DIDDocument and checks the metadata for the deactivated flag
 * 
 * true if the DID does not have metadata or deactivated flag isn't on metadata
 * false if deactivated flag set to true
 * 
 * @param did the DID to be verified
 * @param didResolver a configured `Resolver` (or an implementation of `Resolvable`) that can provide the DID document
 *   of a DID
 * @returns a `Promise` that resolves to if the DID is active
 */
export async function verifyDID(did: DID, didResolver: Resolvable): Promise<boolean> {
    const didResult = await didResolver.resolve(did)
    if(didResult.didResolutionMetadata.error) {
        throw new DIDMethodFailureError(didResult.didResolutionMetadata.error)
    }
    return !didResult.didDocumentMetadata.deactivated
    
}

/**
 * Verify that all the required DIDs in a {@link VerifiableCredential} exist and have an active status
 * 
 * @param vc the Verifiable Credential to verify the Issuer and Subject DIDs
 * @param didResolver a configured `Resolver` (or an implementation of `Resolvable`) that can provide the DID document
 *   of a DID
 * @returns a `Promise` that resolves to if the Credential DIDs are valid
 */
export async function verifyDIDs(vc: VerifiableCredential, didResolver: Resolvable): Promise<boolean> {
    let issuer
    let holder
    if(typeof vc === 'string') {
        const credential = decodeJWT(vc).payload
        issuer = credential.iss
        holder = credential.sub
    } else {
        issuer = vc.issuer.id
        holder = vc.credentialSubject.id
    }
    if (issuer && holder) {
        const issuerVerified = await verifyDID(issuer, didResolver)
        const holderVerified = await verifyDID(holder, didResolver)
        return issuerVerified && holderVerified
    }
    return false
}

/**
 * Verify the expiration date of a {@link VerifiableCredential}
 * 
 * @param vc `VerifiableCredential` to be verified
 * @returns boolean determining if the expirationDate is valid
 */
export function verifyExpiry(vc: VerifiableCredential): boolean {
    let expiryDate
    if(typeof vc === 'string') {
        const credential = decodeJWT(vc).payload
        if (!credential.exp) {
            throw new Error('No Expiration Date in JWT')
        }
        expiryDate = credential.exp * 1000
    } else {
        expiryDate = vc.expirationDate
    }
    if(expiryDate) {
        const currentDate = new Date()
        return currentDate < new Date(expiryDate);
    }
    return false
    
}

/**
 * Verify the issuance date of a {@link VerifiableCredential}
 * 
 * @param vc `VerifiableCredential` to be verified
 * @returns boolean determining if the issuanceDate is valid
 */
export function verifyIssuanceDate(vc: VerifiableCredential): boolean {
    let issuanceDate
    if(typeof vc === 'string') {
        const credential = decodeJWT(vc).payload
        if (!credential.nbf) {
            throw new Error('No Issuance Date in JWT')
        }
        issuanceDate = credential.nbf * 1000
    }else {
        issuanceDate = vc.issuanceDate
    }
    if(issuanceDate) {
        const currentDate = new Date()
        return new Date(issuanceDate) <= currentDate;
    }
    return false
}


/**
 * Verify the revocation status of an Onyx revocable Verifiable Credential
 * 
 * True if VC not revoked, false if revoked
 * 
 * @param vc VerifiableCredential` to be verified
 * @param didResolver a configured `Resolver` (or an implementation of `Resolvable`) that can provide the DID document
 *   of a DID
 * @returns a `Promise` that resolves to if the Verifiable Credential is active. 
 */
export async function verifyRevocationStatus(vc: VerifiableCredential, didResolver: Resolvable): Promise<boolean> {
    let vcId
    if(typeof vc === 'string') {
        const credential = decodeJWT(vc).payload
        vcId = credential.jti ? credential.jti : credential.vc.id
    } else {
        vcId = vc.id
    }
    if(vcId) {
        return await verifyDID(vcId, didResolver)
    }
    return false
}

/**
 * Verify that the `credentialSubject` conforms to the defined JSON Schema present
 * in the Verifiable Credential
 * 
 * @param vc VerifiableCredential` to be verified
 * @param isFile boolean if the schema location is a local file
 * @returns a `Promise` that resolves to if the schema check succeeded
 */
export async function verifySchema(vc: VerifiableCredential, isFile: boolean): Promise<boolean> {
    let credSchema
    let credSubject
    if(typeof vc === 'string') {
        const credential = decodeJWT(vc).payload
        credSchema = credential.vc.credentialSchema
        credSubject = credential.vc.credentialSubject
    }else {
        credSchema = vc.credentialSchema
        credSubject = vc.credentialSubject
    }
    if(credSchema) {
        const schema = isFile ?
            await SchemaManager.getSchemaFromFile(credSchema)
            : await SchemaManager.getSchemaRemote(credSchema)
        return SchemaManager.validateCredentialSubject(credSubject, schema)
    }
    return false

}