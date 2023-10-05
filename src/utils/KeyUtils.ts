import { publicKeyCreate } from 'secp256k1';
import { isString } from 'lodash'
import { KeyTypeError } from '../errors';
import bs58 from 'bs58'

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

    /**
     * Takes a key pair and encodes the keys in base58 format.
     * 
     * @param keys `KeyPair` the keys to be encoded to base58 
     * @returns Public and Private keys encoded in base58
     */
    static encodeToBase58(keys: KeyPair): Omit<KeyPair, 'algorithm'> {    
        const { publicKey, privateKey } = keys

        const pubString = !isString(publicKey) ? bs58.encode(publicKey) : publicKey
        const pubKey = this.isHexPrivateKey(pubString) 
            ? bs58.encode(Buffer.from(pubString, 'hex')) 
            : bs58.encode(Buffer.from(pubString, 'base64')) 

        const privString = !isString(privateKey) ? bs58.encode(privateKey) : privateKey
        const privKey = this.isHexPrivateKey(privString) 
            ? bs58.encode(Buffer.from(privString.replace(/^0x/,''), 'hex')) 
            : bs58.encode(Buffer.from(privString, 'base64')) 

        return { publicKey: pubKey, privateKey: privKey}
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
