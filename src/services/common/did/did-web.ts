import { DIDResolutionResult, DIDResolver, Resolver } from "did-resolver";
import { DID, DIDMethod, DIDWithKeys } from "./did";
import { KeyUtils, KEY_ALG } from "../../../utils";
import { getResolver } from "key-did-resolver";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { DIDMethodFailureError } from "../../../errors";
import { ethers } from 'ethers'
import { ProviderConfigs } from "./did-ethr";
import { Wallet } from "@ethersproject/wallet";

export class WebDIDMethod implements DIDMethod {
    /**
     * did:web DID document using an ethereum address
     */
    name = 'web';
    domain: string;
    providerConfigs: ProviderConfigs;
    web3Provider: Provider;

    constructor(domain: string, providerConfigs: ProviderConfigs) {
        this.domain = domain;
        this.providerConfigs = providerConfigs;
        this.web3Provider = providerConfigs.provider ? providerConfigs.provider : new JsonRpcProvider(providerConfigs.rpcUrl);
    }

    /**
      * Create request will create a Web DID document that will contain ES256K key.
      * 
      * @returns a `Promise` that resolves to {@link DIDWithKeys}
      */
    async create(): Promise<DIDWithKeys> {
        const account = await ethers.Wallet.createRandom();
        const privateKey = account.privateKey
        const publicKey = KeyUtils.privateKeyToPublicKey(privateKey)

        const id = `did:web:${this.domain}`;
        const didDoc = {
            "@context": [
                "https://w3.org/ns/did/v1",
            ],
            id,
            "authentication": [
                `${id}#${publicKey}`
            ],
        };

        return {
            did: didDoc.id,
            keyPair: {
                algorithm: KEY_ALG.ES256K,
                publicKey,
                privateKey
            }
        }
    }

    /**
     * From did:ethr
     * Creates a DID given a private key
     * Used when an ES256K keypair has already been generated and is going to be used as a DID
     * 
     * @param privateKey - private key to be used in creation of a did:ethr DID
     * @returns a `Promise` that resolves to {@link DIDWithKeys}
     * Throws `DIDMethodFailureError` if private key is not in hex format
     */
    async generateFromPrivateKey(privateKey: string | Uint8Array): Promise<DIDWithKeys> {
        if (!KeyUtils.isHexPrivateKey(privateKey)) {
            throw new DIDMethodFailureError('new public key not in hex format')
        }
        const publicKey = KeyUtils.privateKeyToPublicKey(privateKey as string)
        const address = new Wallet(privateKey as string, this.web3Provider).address
        const did = `did:ethr:${this.providerConfigs.name}:${address}`
        const identity: DIDWithKeys = {
            did,
            keyPair: {
                algorithm: KEY_ALG.ES256K,
                publicKey,
                privateKey
            }
        }
        return identity;
    }

    /**
     * Resolves a DID using the resolver from web-did-resolver to a {@link DIDResolutionResult} 
     * that contains the DIDDocument and associated Metadata
     * 
     * Uses web-did-resolver and did-resolver
     * 
     * @param did - DID to be resolved to its DIDDocument
     * @returns a `Promise` that resolves to `DIDResolutionResult` defined in did-resolver
     * Throws `DIDMethodFailureError` if resolution failed
     */
    async resolve(did: DID ): Promise<DIDResolutionResult> {
        const webDidResolver = new Resolver(getResolver());
        const result = await webDidResolver.resolve(did);
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