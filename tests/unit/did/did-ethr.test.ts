import { Resolver } from "did-resolver";
import { randomBytes } from "crypto";
import { DIDMethodFailureError } from "../../../src/errors";
import { EthrDIDMethod, getSupportedResolvers } from "../../../src/services/common";
import { KEY_ALG, KeyUtils } from "../../../src/utils";


describe('did:ethr utilities', () => {

    let didResolver1: Resolver
    let didResolver2: Resolver
    let ethrDidMethod: EthrDIDMethod
    let ethrDidMethod2: EthrDIDMethod
    
    const SAMPLE_DID = {
        did: 'did:ethr:maticmum:0x076231A475b8F905f71f45580bD00642025c4e0D',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey: '02f034136f204a02045c17f977fa9ac36362fe5a86524b464a56a26cbfb0754e23',
            privateKey: '0xd42a4eacb5cf7758ae07e12f3b3971b643b6c78f18972eb5444ffd66e03bac15'
        }
    }

    const SAMPLE_DID_2 = {
        did: 'did:ethr:0x80001:0x076231A475b8F905f71f45580bD00642025c4e0D',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey: '02f034136f204a02045c17f977fa9ac36362fe5a86524b464a56a26cbfb0754e23',
            privateKey: '0xd42a4eacb5cf7758ae07e12f3b3971b643b6c78f18972eb5444ffd66e03bac15'
        }
    }

    const DID_DOC = {
        didDocumentMetadata: {},
        didResolutionMetadata: { contentType: 'application/did+ld+json' },
        didDocument: {
        }
    }

    beforeAll (async () => {
        ethrDidMethod = new EthrDIDMethod({
            name: 'maticmum',
            rpcUrl: 'https://rpc-mumbai.maticvigil.com/', 
            registry: "0x41D788c9c5D335362D713152F407692c5EEAfAae"})
        

        ethrDidMethod2 = new EthrDIDMethod({
            name: '0x80001', 
            rpcUrl: 'https://rpc-mumbai.maticvigil.com/', 
            registry: "0x41D788c9c5D335362D713152F407692c5EEAfAae"})

        didResolver1 = getSupportedResolvers([ethrDidMethod])
        didResolver2 = getSupportedResolvers([ethrDidMethod2])
    })

    it('Successfully create did:ethr', async () => {
        const res = await ethrDidMethod.create()
        expect(res.did).toContain('did:ethr:maticmum')
        expect(KeyUtils.isHexPrivateKey(res.keyPair.privateKey)).toEqual(true)
        expect(KeyUtils.isHexPublicKey(res.keyPair.publicKey)).toBeTruthy()
        expect(res.keyPair.algorithm).toEqual(KEY_ALG.ES256K)

        const doc = await didResolver1.resolve(res.did)
        expect(doc.didResolutionMetadata.error).toBeFalsy()
    })


    it('Successfully create did:ethr - chainId', async () => {
        const res = await ethrDidMethod2.create()
        expect(res.did).toContain('did:ethr:0x80001')
        expect(KeyUtils.isHexPrivateKey(res.keyPair.privateKey)).toEqual(true)
        expect(KeyUtils.isHexPublicKey(res.keyPair.publicKey)).toBeTruthy()
        expect(res.keyPair.algorithm).toEqual(KEY_ALG.ES256K)

        const doc = await didResolver2.resolve(res.did)
        expect(doc.didResolutionMetadata.error).toBeFalsy()
    })

    it('Successfully create did:ethr from private key', async () => {
        const res = await ethrDidMethod.generateFromPrivateKey(SAMPLE_DID.keyPair.privateKey)
        expect(res).toBeDefined()
        expect(res.did).toBeDefined()
        expect(res.did).toEqual(SAMPLE_DID.did)
        expect(res.keyPair.privateKey).toBeDefined()
        expect(KeyUtils.isHexPrivateKey(res.keyPair.privateKey)).toBeTruthy()
        expect(res.keyPair.privateKey).toEqual(SAMPLE_DID.keyPair.privateKey)
        expect(res.keyPair.publicKey).toBeDefined()
        expect(KeyUtils.isHexPublicKey(res.keyPair.publicKey)).toBeTruthy()
        expect(res.keyPair.publicKey).toEqual(SAMPLE_DID.keyPair.publicKey)
        expect(res.keyPair.algorithm).toEqual(KEY_ALG.ES256K)
        
        const doc = await didResolver1.resolve(res.did)
        expect(doc).toBeDefined()
        expect(doc.didResolutionMetadata.error).toBeFalsy()
    })

    it('Rejects generation from non-hex private key', async () => {
        const pk = await randomBytes(64)
        await expect(ethrDidMethod.generateFromPrivateKey(pk))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('Successfully resolve did:ethr identifier', async () => {
        const res = await ethrDidMethod.resolve(SAMPLE_DID.did)
        expect(res).toBeDefined()
        expect(res.didDocument).toBeDefined()
        expect(res.didDocument?.id).toEqual(SAMPLE_DID.did)
        expect(res.didResolutionMetadata.error).toBeFalsy()
    })

    it('Successfully resolve did:ethr identifier - chain id', async () => {
        const res = await ethrDidMethod2.resolve(SAMPLE_DID_2.did)
        expect(res).toBeDefined()
        expect(res.didDocument).toBeDefined()
        expect(res.didDocument?.id).toEqual(SAMPLE_DID_2.did)
        expect(res.didResolutionMetadata.error).toBeFalsy()
    })

    it('Resolution fails with did:key', async () => {
        const didKey = 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'
        expect(ethrDidMethod.resolve(didKey))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('Successfully extract did:ethr:maticmum identifier', async () => {
        expect(ethrDidMethod.getIdentifier('did:ethr:maticmum:0xDE5e9Cb48C36e3D53514CF24bcD987cD963f9B02'))
            .toEqual('0xDE5e9Cb48C36e3D53514CF24bcD987cD963f9B02')
        expect(true).toEqual(true)
    })

    it('Successfully extract did:ethr identifier', async () => {
        expect(ethrDidMethod.getIdentifier('did:ethr:0xDE5e9Cb48C36e3D53514CF24bcD987cD963f9B02'))
            .toEqual('0xDE5e9Cb48C36e3D53514CF24bcD987cD963f9B02')
        expect(true).toEqual(true)
    })

    it('Fails to extract incorrect did:ethr identifier', async () => {
        expect(() => ethrDidMethod.getIdentifier('did:ethr:maticmum:0xDE5e9Cb48C36e3D53514CF24bcD987cD963f9B0'))
            .toThrowError(DIDMethodFailureError)
    })

    it('Fails to extract incorrect did:ethr identifier', async () => {
        expect(() => ethrDidMethod.getIdentifier('did:0xDE5e9Cb48C36e3D53514CF24bcD987cD963f9B02'))
            .toThrowError(DIDMethodFailureError)
    })

    it('Successfully checks did:ethr isActive', async () => {
        ethrDidMethod.resolve = jest.fn().mockResolvedValueOnce(DID_DOC)
        const res = await ethrDidMethod.isActive(SAMPLE_DID.did)
        expect(res).toBeTruthy()
    })

    it('Successfully checks active did:ethr isActive', async () => {
        ethrDidMethod.resolve = jest.fn().mockResolvedValueOnce({...DID_DOC, didDocumentMetadata:  { deactivated: false, versionId: '35961950', updated: '2023-05-23T20:59:17Z' }})
        const res = await ethrDidMethod.isActive(SAMPLE_DID.did)
        expect(res).toBeTruthy()
    })

    it('Successfully checks deactivated did:ethr isActive', async () => {
        ethrDidMethod.resolve = jest.fn().mockResolvedValueOnce({...DID_DOC, didDocumentMetadata:  { deactivated: true, versionId: '35961950', updated: '2023-05-23T20:59:17Z' }})
        const res = await ethrDidMethod.isActive(SAMPLE_DID.did)
        expect(res).toBeFalsy()
    })
})