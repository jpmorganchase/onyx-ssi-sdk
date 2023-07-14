
import { DIDResolutionResult, DIDResolver, Resolver } from "did-resolver";
import { ethers } from 'ethers'
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { Contract } from '@ethersproject/contracts'
import { Wallet } from "@ethersproject/wallet";
import { DID, DIDMethod, DIDWithKeys } from "./did";
import { KeyUtils, KEY_ALG } from "../../../utils";
import { DIDMethodFailureError } from "../../../errors";
import { EthereumDIDRegistry, getResolver } from "ethr-did-resolver";

export class EthrDIDMethod implements DIDMethod {
    name = 'ethr';
    providerConfigs: ProviderConfigs;
    web3Provider: Provider

    constructor(providerConfigs: ProviderConfigs) {
        this.providerConfigs = providerConfigs
        this.web3Provider = providerConfigs.provider ? providerConfigs.provider : new JsonRpcProvider(providerConfigs.rpcUrl);
    }

    /**
     * 
     * Creates a new ES256K keypair and corresponding DID following did:ethr method
     * 
     * @returns a `Promise` that resolves to {@link DIDWithKeys}
     */
    async create(): Promise<DIDWithKeys> {       
        const account = await ethers.Wallet.createRandom();
        const privateKey = account.privateKey
        const publicKey = KeyUtils.privateKeyToPublicKey(privateKey)
        const did = `did:ethr:${this.providerConfigs.name}:${account.address}` 

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
     * 
     * Resolves a DID using the resolver from ethr-did-resolver to a {@link DIDResolutionResult} 
     * that contains the DIDDocument and associated Metadata 
     * 
     * Uses ethr-did-resolver and did-resolver
     * 
     * @param did - the DID to be resolved
     * @returns a `Promise` that resolves to `DIDResolutionResult` defined in did-resolver
     * Throws `DIDMethodFailureError` if resolution failed
     */
    async resolve(did: DID): Promise<DIDResolutionResult> {
        const ethrDidResolver = new Resolver(getResolver(this.providerConfigs));
        const result = await ethrDidResolver.resolve(did);
        if (result.didResolutionMetadata.error) {
            throw new DIDMethodFailureError(`DID Resolution failed for ${did}, ${result.didResolutionMetadata.error}`)
        }
        return result
    }

    /**
     * This update method is used specifically to support key rotation of did:ethr.
     * This SDK may be enhanced with other appropriate update methods for did:ethr
     * 
     * Calls setAttribute function on the DIDRegistry for the given DID.
     * Other attributes of the DIDDocument can be updated by calling the setAttribute
     * method, however for this method specifically focuses on the key rotation use case.
     * 
     * Calling this method requires sending a tx to the blockchain. If the configured
     * blockchain requires gas, the DID being updated must be able to pay for the gas as
     * its private key is being used to sign the blockchain tx.
     * 
     * @param did - DID to be updated
     * @param newPublicKey - the new public key in hex format to be added to DIDDocument
     * @returns `Promise` that resolves to a `boolean` describing if the update failed or
     * succeeded. 
     * Throws `DIDMethodFailureError` if the supplied public key is not in the expected format
     * or if sending tx fails
     */
    async update(did: DIDWithKeys, newPublicKey: string | Uint8Array): Promise<boolean> {
        if (!KeyUtils.isHexPublicKey(newPublicKey, true)) {
            throw new DIDMethodFailureError('new public key not in hex format')
        }
        
        const wallet = new Wallet(did.keyPair.privateKey as string, this.web3Provider);
        const address = await wallet.connect(this.web3Provider).getAddress()
        const contractAddress = this.providerConfigs.registry
        const registry= new Contract(contractAddress, EthereumDIDRegistry.abi, wallet)
        const tx = await registry.setAttribute(
            address,
            ethers.utils.formatBytes32String('did/pub/Secp256k1/veriKey/hex'),
            newPublicKey,
            10000000000000,
        )

        const receipt = await tx.wait();
        if(!receipt || !receipt.status) {
            throw new DIDMethodFailureError('Error updating')
        }
        return Promise.resolve(true);
    }

    /**
     * Deactivates a DID on the Ethr DIDRegistry
     * 
     * According to the did:ethr spec, a deactivated DID is when the owner property of 
     * the identifier MUST be set to 0x0
     * 
     * Calling this method requires sending a tx to the blockchain. If the configured
     * blockchain requires gas, the DID being updated must be able to pay for the gas as
     * its private key is being used to sign the blockchain tx.
     * 
     * @param did - DID to be deactivated
     * @returns `Promise` that resolves to a `boolean` describing if the update failed or
     * succeeded. 
     * Throws `DIDMethodFailureError` if sending tx fails.
     */
    async deactivate(did: DIDWithKeys): Promise<boolean> {
        const address = this.convertDIDToAddress(did.did);
        const wallet = new Wallet(did.keyPair.privateKey as string, this.web3Provider);
        const contractAddress = this.providerConfigs.registry
        //sets id of didDoc to 0x0
        const registry= new Contract(contractAddress, EthereumDIDRegistry.abi, wallet)
        const tx = await registry.changeOwner(
            address,
            '0x0000000000000000000000000000000000000000'
        )
        const receipt = await tx.wait();
        if(!receipt || !receipt.status) {
            throw new DIDMethodFailureError('Error deactivating')
        }
        return Promise.resolve(true);
    }

    /**
     * Helper function to check if a given DID has an active status.
     * Resolves the DID to its DIDDocument and checks the metadata for the deactivated flag
     * 
     * Is active if the DIDDocument does not have metadata or deactivated flag isn't on the metadata
     * Is deactivated if deactivated flag set to true
     * 
     * @param did - DID to check status of
     * @returns a `Promise` that resolves to a `boolean` describing if the DID is active
     * (true if active, false if deactivated)
     */
    async isActive(did: DID): Promise<boolean> {
        const didResult = await this.resolve(did)
        return !didResult.didDocumentMetadata.deactivated
    }

    /**
     * Helper function to return the Identifier from a did:ethr string
     * 
     * @param did - DID string
     * @returns the Identifier section of the DID
     * Throws `DIDMethodFailureError` if DID not in correct format or a valid address
     */
    getIdentifier(did: DID): string {
        return this.convertDIDToAddress(did)
    }

    /**
     * Returns an Ethereum address extracted from the identifier of the DID.
     * The returned address is compatible with the Solidity "address" type in a contract call
     * argument.
     * @param {DID} did - DID to convert into an Ethereum address
     * @returns {string} Etheruem address extracted from the identifier of `did`
     * Throws `DIDMethodFailureError` if DID not in correct format or a valid address
     */
    convertDIDToAddress(did: DID): string {
        let address;
        const format = did.split(':')
        switch(format.length) {
            case 3: {
                address = `${did.substring(did.indexOf(':', did.indexOf(':') + 1) + 1)}`;
                break;
            }
            case 4: {
                address = `${did.substring(did.indexOf(':', did.indexOf(':', did.indexOf(':') + 1) + 1) + 1)}`;
                break;
            }
            default: {
                throw new DIDMethodFailureError(`did:ethr ${did} not in correct format`)
            }
        }
        try {
            ethers.utils.getAddress(address)
        } catch (err) {
            throw new DIDMethodFailureError(`Cannot convert identifier in ${did} to an Ethereum address`);
        }
        return address;
    }


    /**
     * Getter method for did:ethr Resolver from ethr-did-resolver
     * @returns type that is input to new {@link Resolver} from did-resolver
     */
    getDIDResolver(): Record<string, DIDResolver> {
        return getResolver(this.providerConfigs)
    }

}

/**
 * Used as input to `EthrDidMethod` constructor
 * Provides configurations of Ethereum-based network required for did:ethr functionality
 */
export interface ProviderConfigs {
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
