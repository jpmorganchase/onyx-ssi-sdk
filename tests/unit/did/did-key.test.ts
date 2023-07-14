import { randomBytes } from 'crypto';
import { DIDMethodFailureError } from '../../../src/errors';
import { KeyDIDMethod } from '../../../src/services/common/did'
import { KeyUtils, KEY_ALG } from '../../../src/utils';

describe('did:key utilities', () => {
    const keyDIDMethod = new KeyDIDMethod()
    const KEY_IDENTIFIER_LENGTH = 48;

    it('Successfully creates a new did:key', async () => {
        const didKey = await keyDIDMethod.create();

        expect(didKey.did.startsWith(`did:${keyDIDMethod.name}`)).toBe(true)
        expect(didKey.keyPair.privateKey).toBeDefined()
        expect(didKey.keyPair.publicKey).toBeDefined()
        expect(didKey.keyPair.algorithm).toBeDefined()
        expect(didKey.did.length).toEqual(`did:${keyDIDMethod.name}:`.length + KEY_IDENTIFIER_LENGTH)
        expect(didKey.keyPair.algorithm).toEqual(KEY_ALG.EdDSA)
        expect(didKey.keyPair.privateKey.length).toEqual(KeyUtils.PRIVATE_KEY_LENGTH)
        expect(didKey.keyPair.publicKey.length).toEqual(KeyUtils.PUBLIC_KEY_LENGTH)
    })

    it('Successfully generates a did:key from existing private key', async () => {
        const didKey = await keyDIDMethod.create();
        const privateKey = didKey.keyPair.privateKey;
        const didKeyDup = await keyDIDMethod.generateFromPrivateKey(privateKey)

        expect(didKeyDup.did.startsWith(`did:${keyDIDMethod.name}`)).toBe(true)
        expect(didKeyDup.keyPair.privateKey).toBeDefined()
        expect(didKeyDup.keyPair.publicKey).toBeDefined()
        expect(didKeyDup.keyPair.algorithm).toBeDefined()
        expect(didKeyDup.did).toEqual(didKey.did)
        expect(didKeyDup.keyPair.algorithm).toEqual(didKey.keyPair.algorithm)
        expect(didKey.keyPair.privateKey).toEqual(didKey.keyPair.privateKey)
        expect(didKey.keyPair.publicKey).toEqual(didKey.keyPair.publicKey)
    })

    it('Generation of did:key from existing private key in hex format fails', async () => {
        const privateKey = '0x69af672c46812a314eacbd90d6ee24cf5c03c4f46205f0b9b6fa2a079295e838'

        await expect(keyDIDMethod.generateFromPrivateKey(privateKey))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('Generation of did:key from private key with incorrect byte count fails', async () => {
        const privateKey = randomBytes(33)

        await expect(keyDIDMethod.generateFromPrivateKey(privateKey))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('Resolution of did:key succeeds', async () => {
        const didKey = await keyDIDMethod.create();
        const result = await keyDIDMethod.resolve(didKey.did)

        expect(result).toBeTruthy()
        expect(result.didDocument).toBeDefined()
        expect(result.didDocument?.id).toEqual(didKey.did)
    })

    it('Resolution of incorrect did method fails', async () => {
        const wrongDid = 'did:fail:1234'
        await expect(keyDIDMethod.resolve(wrongDid))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('Resolution of invalid did fails', async () => {
        const wrongDid = 'did:key:1234'
        await expect(keyDIDMethod.resolve(wrongDid))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('Updating did:key not supported', async () => {
        const didKey = await keyDIDMethod.create();
        const publicKey = randomBytes(33)
        await expect(keyDIDMethod.update(didKey, publicKey))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('Deleting did:key not supported', async () => {
        const didKey = await keyDIDMethod.create();
        await expect(keyDIDMethod.deactivate(didKey))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('did:key active status true', async () => {
        const didKey = 'did:key:z6MknTPcEV35uZA4tT8BdHES5WcgHakzycdizi35qJWzNLD9'
        const active = await keyDIDMethod.isActive(didKey)

        expect(active).toBe(true)
    })

    it('did:key in incorrect format false', async () => {
        const didKey = 'did:key:123'
        const active = await keyDIDMethod.isActive(didKey)

        expect(active).toBe(false)
    })

    it('extraction of did:key identifier succeeds', async () => {
        const didKey = 'did:key:z6MknTPcEV35uZA4tT8BdHES5WcgHakzycdizi35qJWzNLD9'
        const active = keyDIDMethod.getIdentifier(didKey)

        expect(active).toBe('z6MknTPcEV35uZA4tT8BdHES5WcgHakzycdizi35qJWzNLD9')
    })

    it('extraction of did:key identifier incorrect format fails', async () => {
        const didKey = 'did:key:123'

        expect(() => keyDIDMethod.getIdentifier(didKey))
            .toThrow(DIDMethodFailureError)
    })

    it('check format of did:key identifier succeeds', async () => {
        const didKey = 'did:key:z6MknTPcEV35uZA4tT8BdHES5WcgHakzycdizi35qJWzNLD9'
        const format = keyDIDMethod.checkFormat(didKey)

        expect(format).toBeTruthy()
    })

    it('check format of did:key identifier incorrect format fails', async () => {
        const didKey = 'did:key:123'
        const format = keyDIDMethod.checkFormat(didKey)

        expect(format).toBeFalsy()
    })
})