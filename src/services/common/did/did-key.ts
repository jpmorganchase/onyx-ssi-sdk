import { DIDResolutionResult, DIDResolver, Resolver } from "did-resolver";
import {randomBytes} from "crypto"
import { DID, DIDMethod, DIDWithKeys } from "./did";
import { KeyUtils, KEY_ALG } from "../../../utils";
import { getResolver } from "key-did-resolver";
import { Ed25519KeyPair } from '@transmute/ed25519-key-pair';
import { DIDMethodFailureError } from "../../../errors";
export class KeyDIDMethod implements DIDMethod {
    name = 'key';

    /**
      * Creates a new EdDSA keypair and corresponding DID following did:key method
      * 
      * @returns a `Promise` that resolves to {@link DIDWithKeys}
      */
    async create(): Promise<DIDWithKeys> {
        const seed = () => {
            return randomBytes(32)
        }

        const key = await Ed25519KeyPair.generate({
            secureRandom: seed})

        return {
            did: key.controller,
            keyPair: {
                algorithm: KEY_ALG.EdDSA,
                publicKey: key.publicKey,
                privateKey: key.privateKey as Uint8Array,
            }
        }
    }

    /**
     * Creates a DID given a private key
     * Used when an EdDSA keypair has already been generated and is going to be used as a DID
     * 
     * @param privateKey - private key to be used in creation of a did:key DID
     * @returns a `Promise` that resolves to {@link DIDWithKeys}
     * Throws `DIDMethodFailureError` if supplied private key not in correct format
     */
    async generateFromPrivateKey(privateKey: string | Uint8Array): Promise<DIDWithKeys> {
        if (!KeyUtils.isBytesPrivateKey(privateKey)) {
            throw new DIDMethodFailureError('private key not in correct byte format')
        }
        const bytes = new Uint8Array((privateKey as Uint8Array).subarray(0,32))
          
        const key = await Ed25519KeyPair.generate({ secureRandom: () => bytes })
        return {
            did: key.controller,
            keyPair: {
                algorithm: KEY_ALG.EdDSA,
                publicKey: key.publicKey,
                privateKey: key.privateKey as Uint8Array,
            }
        }
    }

    /**
     * Resolves a DID using the resolver from key-did-resolver to a {@link DIDResolutionResult} 
     * that contains the DIDDocument and associated Metadata
     * 
     * Uses key-did-resolver and did-resolver
     * 
     * @param did - DID to be resolved to its DIDDocument
     * @returns a `Promise` that resolves to `DIDResolutionResult` defined in did-resolver
     * Throws `DIDMethodFailureError` if resolution failed
     */
    async resolve(did: DID ): Promise<DIDResolutionResult> {
        const keyDidResolver = new Resolver(getResolver());
        const result = await keyDidResolver.resolve(did);
        if (result.didResolutionMetadata.error) {
            throw new DIDMethodFailureError(`DID Resolution failed for ${did}, ${result.didResolutionMetadata.error}`)
        }
        return result;
    }

    /**
     * did:key does not support update
     */
    async update(_did: DIDWithKeys, _publicKey: string | Uint8Array): Promise<boolean> {
        throw new DIDMethodFailureError('did:key does not support Update')
    }

    /**
     * did:key does not support deactivate
     */
    async deactivate(_did: DIDWithKeys): Promise<boolean> {
        throw new DIDMethodFailureError('did:key does not support Delete')
    }

    /**
     * Since did:key cannot be updated or deactivated, the status will always be active
     * 
     * @param did - DID to check status of
     * @returns a `Promise` that always resolves to true if DID is in correct format
     * Throws `DIDMethodFailureError` otherwise
     */
    async isActive(did: DID): Promise<boolean> {
        return this.checkFormat(did)

    }

    /**
     * Helper function to return the Identifier from a did:key string
     * 
     * @param did - DID string
     * @returns the Identifier section of the DID
     * Throws `DIDMethodFailureError` if format check fails
     */
    getIdentifier(did: DID): string {
        if(!this.checkFormat(did)) {
            throw new DIDMethodFailureError('DID format incorrect')
        }
        return `${did.substring(did.indexOf(':', did.indexOf(':') + 1) + 1)}`;
    }

    /**
     * Helper function to check format of a did:key
     * 
     * Correct format is did:key:{alphanumeric identifier of 48 characters}
     * 
     * @param did - DID string
     * @returns true if format check passes
     */
    checkFormat(did: DID): boolean {
        const keyMatcher = /(did:key:)([a-zA-Z0-9]{48})$/
        return keyMatcher.test(did as string)
    }

    /**
     * Getter method for did:key Resolver from key-did-resolver
     * 
     * @returns type that is input to new {@link Resolver} from did-resolver
     */
    getDIDResolver(): Record<string, DIDResolver> {
        return getResolver()
    }

}