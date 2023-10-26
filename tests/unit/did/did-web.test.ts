import { Resolver } from "did-resolver";
import { randomBytes } from "crypto";
import { DIDMethodFailureError } from "../../../src/errors";
import {  getSupportedResolvers } from "../../../src/services/common";
import { KEY_ALG, KeyUtils } from "../../../src/utils";
import { WebDIDMethod } from "../../../src/services/common/did/did-web";


describe('did:web utilities', () => {
    let didResolver: Resolver
    let webDidMethod: WebDIDMethod
    
    const SAMPLE_DID = {
        "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/secp256k1recovery-2020/v2"],
        "id": "did:web:mattr.global",
        "verificationMethod": [{
            "id": "did:web:mattr.global#0x3b18dCa02FA6945aCBbE2732D8942781B410E0F9",
            "type": "EcdsaSecp256k1RecoveryMethod2020",
            "controller": "did:web:mattr.global",
            "blockchainAccountId": "eip155:1:0x89a932207c485f85226d86f7cd486a89a24fcc12"
        }],
        "authentication": [
            "did:web:mattr.global#0x3b18dCa02FA6945aCBbE2732D8942781B410E0F9"
        ],
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey: ' 0456b642b139f7771e53f280efbfef62994fd9ecab806eb082b4883df5802fcbbdcbd5cd378372407a78fc86bff619b28c0c19104dc18d886c8e4914a33a8bee1b',
            privateKey: '13f38a1233fae4e85fa3bc76110b8fefcd07ecf75f1393218e67e49024ffab3f'
        }
    }

    const DID_DOC = {
        didDocumentMetadata: {},
        didResolutionMetadata: { contentType: 'application/did+ld+json' },
        didDocument: {
        }
    }

    beforeAll (async () => {
        webDidMethod = new WebDIDMethod("mattr.global", {
            name: 'maticmum',
            rpcUrl: 'https://rpc-mumbai.maticvigil.com/', 
            registry: "0x41D788c9c5D335362D713152F407692c5EEAfAae"})
        
        didResolver = getSupportedResolvers([webDidMethod]);
    })

    it('Successfully create did:web', async () => {
        const res = await webDidMethod.create();
        expect(res.did).toContain("did:web:mattr.global");
        expect(KeyUtils.isHexPrivateKey(res.keyPair.privateKey)).toEqual(true)
        expect(KeyUtils.isHexPublicKey(res.keyPair.publicKey)).toBeTruthy()
        expect(res.keyPair.algorithm).toEqual(KEY_ALG.ES256K)

        const doc = await didResolver.resolve(res.did)
        expect(doc.didResolutionMetadata.error).toBeFalsy()
    })

    it('Successfully create did:web from private key', async () => {
        const res = await webDidMethod.generateFromPrivateKey(SAMPLE_DID.keyPair.privateKey)
        expect(res).toBeDefined()
        expect(res.did).toBeDefined()
        expect(res.did).toEqual(SAMPLE_DID.id)
        expect(res.keyPair.privateKey).toBeDefined()
        expect(KeyUtils.isHexPrivateKey(res.keyPair.privateKey)).toBeTruthy()
        expect(res.keyPair.privateKey).toEqual(SAMPLE_DID.keyPair.privateKey)
        expect(res.keyPair.publicKey).toBeDefined()
        expect(KeyUtils.isHexPublicKey(res.keyPair.publicKey)).toBeTruthy()
        expect(res.keyPair.publicKey).toEqual(SAMPLE_DID.keyPair.publicKey)
        expect(res.keyPair.algorithm).toEqual(KEY_ALG.ES256K)
        
        const doc = await didResolver.resolve(res.did)
        expect(doc).toBeDefined()
        expect(doc.didResolutionMetadata.error).toBeFalsy()
    })

    it('Rejects generation from non-hex private key', async () => {
        const pk = await randomBytes(64)
        await expect(webDidMethod.generateFromPrivateKey(pk))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('Successfully resolve did:web identifier', async () => {
        const res = await webDidMethod.resolve(SAMPLE_DID.id)
        expect(res).toBeDefined()
        expect(res.didDocument).toBeDefined()
        expect(res.didDocument?.id).toEqual(SAMPLE_DID.id)
        expect(res.didResolutionMetadata.error).toBeFalsy()
    })

    it('Resolution fails with did:key', async () => {
        const didKey = 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'
        expect(webDidMethod.resolve(didKey))
            .rejects.toThrowError(DIDMethodFailureError)
    })

    it('Successfully extract did:web:mattr.global identifier', async () => {
        expect(webDidMethod.getIdentifier('did:web:mattr.global#0x3b18dCa02FA6945aCBbE2732D8942781B410E0F9'))
            .toEqual('0x3b18dCa02FA6945aCBbE2732D8942781B410E0F9')
        expect(true).toEqual(true)
    })

    it('Successfully extract did:web identifier', async () => {
        expect(webDidMethod.getIdentifier('did:web:0x3b18dCa02FA6945aCBbE2732D8942781B410E0F9'))
            .toEqual('0x3b18dCa02FA6945aCBbE2732D8942781B410E0F9')
        expect(true).toEqual(true)
    })

    it('Fails to extract incorrect did:web identifier', async () => {
        expect(() => webDidMethod.getIdentifier('did:web:mattr.global#0x3b18dCa02FA6945aCBbE2732D8942781B410E0F9'))
            .toThrowError(DIDMethodFailureError)
    })

    it('Fails to extract incorrect did:web identifier', async () => {
        expect(() => webDidMethod.getIdentifier('did:0x3b18dCa02FA6945aCBbE2732D8942781B410E0F9'))
            .toThrowError(DIDMethodFailureError)
    })

    it('Successfully checks did:web isActive', async () => {
        webDidMethod.resolve = jest.fn().mockResolvedValueOnce(DID_DOC)
        const res = await webDidMethod.isActive(SAMPLE_DID.id)
        expect(res).toBeTruthy()
    })

    it('Successfully checks active did:web isActive', async () => {
        webDidMethod.resolve = jest.fn().mockResolvedValueOnce({...DID_DOC, didDocumentMetadata:  { deactivated: false, versionId: '35961950', updated: '2023-05-23T20:59:17Z' }})
        const res = await webDidMethod.isActive(SAMPLE_DID.id)
        expect(res).toBeTruthy()
    })

    it('Successfully checks deactivated did:web isActive', async () => {
        webDidMethod.resolve = jest.fn().mockResolvedValueOnce({...DID_DOC, didDocumentMetadata:  { deactivated: true, versionId: '35961950', updated: '2023-05-23T20:59:17Z' }})
        const res = await webDidMethod.isActive(SAMPLE_DID.id)
        expect(res).toBeFalsy()
    })
})