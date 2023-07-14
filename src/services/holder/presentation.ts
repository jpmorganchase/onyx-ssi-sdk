import { DEFAULT_CONTEXT, DID, DIDWithKeys, JWTService, VERIFIABLE_PRESENTATION } from "../common";
import {CreatePresentationOptions, PresentationPayload, VerifiableCredential, VerifiablePresentation } from 'did-jwt-vc'
import { JWTPayload } from "did-jwt";

/**
 * Creates a {@link PresentationPayload} from supplied Holder DID
 * and Verifiable Credentials
 * 
 * The Verifiable Presentation object created follows the 
 * [W3C Verifiable Presentation standards](https://www.w3.org/TR/vc-data-model/#presentations-0)
 * This Presentation object has not been signed.
 * 
 * @param holderDid DID of the subject presenting the Verifiable Credentials
 * @param verifiableCredentials list of {@link VerifiableCredential}s to be included in the
 * Verifiable Presentation
 * @param additionalProperties other W3C spec compliant properties of a VP
 * @returns a `PresentationPayload` representing the W3C Verifiable Presentation object
 */
export function createPresentation(
    holderDid: DID,
    verifiableCredentials: VerifiableCredential[],
    additionalProperties?: Partial<PresentationPayload>
) : PresentationPayload {
    let presentation: Partial<PresentationPayload> = {}

    presentation["@context"] = [DEFAULT_CONTEXT]
    presentation.type = VERIFIABLE_PRESENTATION
    presentation.holder = holderDid
    presentation.verifiableCredential = verifiableCredentials

    presentation = Object.assign(presentation, additionalProperties)

    return presentation as PresentationPayload

}

/**
 * Creates a Verifiable Presentation JWT from {@link DIDWithKeys} and
 * {@link VerifiableCredential}
 * 
 * This method first creates the Presentation object from the Holder keys and the supplied
 * Verifiable Credentials. This object becomes the payload that is transformed into the 
 * [JWT encoding](https://www.w3.org/TR/vc-data-model/#jwt-encoding)
 * described in the [W3C VC spec](https://www.w3.org/TR/vc-data-model)
 *
 * `DIDWithKeys` is used to sign the JWT that encodes the Verifiable Presentation.
 * 
 * @param holder DID and Keypair of the Holder (the Entity signing the Presentation)
 * @param verifiableCredentials list of {@link VerifiableCredential}s to be included in the
 * Verifiable Presentation
 * @param options Use these options to customize the creation of the JWT Credential
 * @returns a `Promise` that resolves to the Verifiable Presentation JWT
 */
export async function createAndSignPresentationJWT(
    holder: DIDWithKeys,
    verifiableCredentials: VerifiableCredential[],
    options?: CreatePresentationOptions
): Promise<string> {
    const payload = createPresentation(holder.did, verifiableCredentials)
    const jwtService = new JWTService()
    return await jwtService.signVP(holder, payload, options)

}

/**
 * Helper function to retrieve the Verifiable Credentials from a Verifiable Presentation
 * 
 * @param vp the Verifiable Presentation
 * @returns the list of Verifiable Credentials included in the Presentation
 */
export function getCredentialsFromVP(vp: VerifiablePresentation): VerifiableCredential[] {
    const jwtService = new JWTService()
    if(typeof vp === 'string') {
        const decoded = jwtService.decodeJWT(vp)?.payload as JWTPayload
        return decoded.vp.verifiableCredential
    } else {
        throw TypeError('Ony JWT supported for Verifiable Presentations')
    }
}
