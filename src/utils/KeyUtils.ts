import { publicKeyCreate } from 'secp256k1';
import { isString } from 'lodash'
import { KeyTypeError } from '../errors';
export class KeyUtils {

    static readonly PUBLIC_KEY_LENGTH = 32;
    static readonly PRIVATE_KEY_LENGTH = 64;

    /**
     * Returns the public key for the given private key
     * @param {string} privateKey the private key for which to find the public key for
     * @returns {string} the public key in hex
     */
    static privateKeyToPublicKey(privateKey: string): string {
        if(!this.isHexPrivateKey(privateKey)) {
            throw new KeyTypeError('private key should be hex')
        }
        const noprefixPrivateKey = privateKey.slice(0, 2) === '0x' ? privateKey.slice(2) : privateKey;
        const privateKeyBuffer = Buffer.from(noprefixPrivateKey, 'hex');
        return Buffer.from(publicKeyCreate(privateKeyBuffer)).toString('hex');
    }

    /**
     * Checks if given private key is in hex format
     * @param key private key
     * @returns true if private key in hex format, false otherwise
     */
    static isHexPrivateKey(key: string | Uint8Array): boolean {
        if (!isString(key)) {
            return false;
        }
        const hexMatcher = /^(0x)?([a-fA-F0-9]{64}|[a-fA-F0-9]{128})$/
        return hexMatcher.test(key as string)
    }

    /**
     * Checks if given public key is in hex format
     * @param key public key
     * @param strict if public key needs 0x prefix
     * @returns true if public key in hex format, false otherwise
     */
    static isHexPublicKey(key: string | Uint8Array, strict = false): boolean {
        if (!isString(key)) {
            return false;
        }
        const hexMatcher = strict ? /^(0x)([a-fA-F0-9]{66})$/ : /^(0x)?([a-fA-F0-9]{66})$/
        return hexMatcher.test(key as string)
    }

    /**
     * Checks if given private key is bytes
     * 
     * @param key private key
     * @returns true if private key is correct number of bytes
     */
    static isBytesPrivateKey(key: string | Uint8Array): boolean {
        return !isString(key) && key.length === KeyUtils.PRIVATE_KEY_LENGTH;
    }

    /**
     * Checks if given public key is bytes
     * 
     * @param key public key
     * @returns true if public key is correct number of bytes
     */
    static isBytesPublicKey(key: string | Uint8Array): boolean {
        return !isString(key) && key.length === KeyUtils.PUBLIC_KEY_LENGTH;
    }
}

/**
 * ENUM for the keyPair algorithms supported in this SDK
 * ES256K is for use with did:ethr
 * EdDSA is for use with did:key
 */
export enum KEY_ALG {
    ES256K = "ES256K",
    EdDSA = "EdDSA"
}
  
/**
 * Data model for a KeyPair type
 * KeyPairs are used for Digital Signature verification of VerifiableCredentials
 * Depending on the algorithm used, keys can be in the form of a hex string or byte array
 */
export interface KeyPair {
    algorithm: KEY_ALG,
    publicKey: string | Uint8Array,
    privateKey: string | Uint8Array
}

