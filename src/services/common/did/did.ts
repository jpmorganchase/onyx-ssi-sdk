import { DIDResolutionResult, DIDResolver, Resolver } from 'did-resolver'
import { KeyPair } from '../../../utils/KeyUtils';

/**
 * Represents a W3C DID
 */
export type DID = string;

export interface DIDMethod {
    name: string;
    create: () => Promise<DIDWithKeys>;
    generateFromPrivateKey: (arg0: string | Uint8Array) => Promise<DIDWithKeys>;
    resolve: (arg0: DID) => Promise<DIDResolutionResult>;
    update: (arg0: DIDWithKeys, arg1: string | Uint8Array) => Promise<boolean>;
    deactivate: (arg0: DIDWithKeys) => Promise<boolean>;
    isActive: (arg0: DID) => Promise<boolean>;
    getIdentifier: (arg0: DID) => string;
    getDIDResolver: () => Record<string, DIDResolver>;
}

/**
 * Helper method that creates {@link Resolver} from the provided DIDMethods
 * 
 * @param supportedMethods didMethods to add to the Resolver
 * @returns Resolver that can resolve any of the supported DIDMethods
 */
export function getSupportedResolvers(supportedMethods: DIDMethod[]): Resolver {
    let resolvers: Record<string, DIDResolver> = {}
    supportedMethods.forEach(function (r) {
        const record = r.getDIDResolver()
        resolvers = {...resolvers, ...record}
    })
    return new Resolver(resolvers)
}

/**
 * Data model of a DID and its associated KeyPair
 */
export interface DIDWithKeys {
    did: DID,
    keyPair: KeyPair
}