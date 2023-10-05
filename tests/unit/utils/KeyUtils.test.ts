import { randomBytes } from "crypto"
import { KeyTypeError } from "../../../src/errors"
import { KeyDIDMethod } from "../../../src/services/common"
import { KEY_ALG, KeyUtils } from "../../../src/utils"

describe('key utilities', () => {

    const ethrKeys = {
        did: 'did:ethr:maticmum:0x076231A475b8F905f71f45580bD00642025c4e0D',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey: '02f034136f204a02045c17f977fa9ac36362fe5a86524b464a56a26cbfb0754e23',
            privateKey: '0xd42a4eacb5cf7758ae07e12f3b3971b643b6c78f18972eb5444ffd66e03bac15'
        }
    }

    it('Successfully converts ES256K private key to public key', async () => {
        const pubKey = KeyUtils.privateKeyToPublicKey(ethrKeys.keyPair.privateKey)
        expect(pubKey).toBeDefined()
        expect(pubKey).toEqual(ethrKeys.keyPair.publicKey)
    })

    it('Fails converting private key with wrong length to public key', async () => {
        expect(() => KeyUtils.privateKeyToPublicKey('0x1234'))
            .toThrowError(KeyTypeError)

    })

    it('Check for hex private key succeeds', async () => {
        const check = KeyUtils.isHexPrivateKey(ethrKeys.keyPair.privateKey)
        expect(check).toBeTruthy()
    })

    it('Check for hex private key fails', async () => {
        const check = KeyUtils.isHexPrivateKey('0x1234')
        expect(check).toBeFalsy()
    })

    it('Check for hex private key fails when given public key', async () => {
        const check = KeyUtils.isHexPrivateKey(ethrKeys.keyPair.publicKey)
        expect(check).toBeFalsy()
    })

    it('Check for hex private key fails when given uint8array', async () => {
        const keymethod = new KeyDIDMethod()
        const key = await keymethod.create()
        const check = KeyUtils.isHexPrivateKey(key.keyPair.privateKey)
        expect(check).toBeFalsy()
    })

    it('Check for hex public key succeeds', async () => {
        const check = KeyUtils.isHexPublicKey(ethrKeys.keyPair.publicKey)
        expect(check).toBeTruthy()
    })

    it('Check for hex public key fails', async () => {
        const check = KeyUtils.isHexPublicKey('0x1234')
        expect(check).toBeFalsy()
    })

    it('Check for hex public key fails when given public key', async () => {
        const check = KeyUtils.isHexPublicKey(ethrKeys.keyPair.privateKey)
        expect(check).toBeFalsy()
    })

    it('Check for hex public key fails when given uint8array', async () => {
        const keymethod = new KeyDIDMethod()
        const key = await keymethod.create()
        const check = KeyUtils.isHexPublicKey(key.keyPair.publicKey)
        expect(check).toBeFalsy()
    })

    it('Check for bytes private key succeeds', async () => {
        const keymethod = new KeyDIDMethod()
        const key = await keymethod.create()
        const check = KeyUtils.isBytesPrivateKey(key.keyPair.privateKey)
        expect(check).toBeTruthy()
    })

    it('Check for private key fails, wrong number of bytes', async () => {
        const bytes = randomBytes(22)
        const check = KeyUtils.isBytesPrivateKey(bytes)
        expect(check).toBeFalsy()
    })

    it('Check for bytes private key fails when given public key', async () => {
        const keymethod = new KeyDIDMethod()
        const key = await keymethod.create()
        const check = KeyUtils.isBytesPrivateKey(key.keyPair.publicKey)
        expect(check).toBeFalsy()
    })

    it('Check for bytes private key fails when given hex', async () => {
        const check = KeyUtils.isBytesPrivateKey(ethrKeys.keyPair.privateKey)
        expect(check).toBeFalsy()
    })

    it('Check for bytes public key succeeds', async () => {
        const keymethod = new KeyDIDMethod()
        const key = await keymethod.create()
        const check = KeyUtils.isBytesPublicKey(key.keyPair.publicKey)
        expect(check).toBeTruthy()
    })

    it('Check for public key fails, wrong number of bytes', async () => {
        const bytes = randomBytes(22)
        const check = KeyUtils.isBytesPublicKey(bytes)
        expect(check).toBeFalsy()
    })

    it('Check for bytes public key fails when given private key', async () => {
        const keymethod = new KeyDIDMethod()
        const key = await keymethod.create()
        const check = KeyUtils.isBytesPublicKey(key.keyPair.privateKey)
        expect(check).toBeFalsy()
    })

    it('Check for bytes public key fails when given hex string', async () => {
        const check = KeyUtils.isBytesPublicKey(ethrKeys.keyPair.publicKey)
        expect(check).toBeFalsy()
    })

    it('Encodes hex private and public keys to base58', async () => {
        const keys = KeyUtils.encodeToBase58(ethrKeys.keyPair)
        expect(keys).toEqual({
            privateKey: "FHCrE9cdRAsUPZnekn3NLqpA3wrE3bSMZbxEpYiarp4t", 
            publicKey: "bEFmiyrTt15wzXeE6b1HgDpFF8ji4JZmJQSt2qqABaKNK3pPnbpxAz86rcrpYERowhc"
        })
    })
})