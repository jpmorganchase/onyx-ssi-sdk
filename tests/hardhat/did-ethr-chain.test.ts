import { EthrDIDMethod } from "../../src/services/common";
import { Resolver } from "did-resolver";
import { getResolver as getEthrResolver} from 'ethr-did-resolver'
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from 'chai'
import { KEY_ALG, KeyUtils } from "../../src/utils";
import { randomBytes } from "crypto";


describe('did:ethr utilities', () => {

    let didResolver: Resolver
    let ethrDidMethod: EthrDIDMethod
    
    async function deployDidRegistry() {
        const DidRegistry = await ethers.getContractFactory('EthereumDIDRegistry')
        const didRegistry = await DidRegistry.deploy()
        await didRegistry.deployed()
        return { didRegistry }
    }
    //Same DID as defined in hardhat config
    const SAMPLE_DID = {
        did: 'did:ethr:maticmum:0xF3beAC30C498D9E26865F34fCAa57dBB935b0D74',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479',
            privateKey: '0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
        }
    }

    const UNFUNDED_DID = {
        did: 'did:ethr:maticmum:0x023C86cEF4e6e23a95A6d01D4C610d17D747E56F',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey: '03e76c5d0b958b5e3db5fb447fedf46b72c8629f97ac8242bc7b58edb6695c332f',
            privateKey: '0x21db39eaf59a3660f75f0ba1f659211cabfe5327b7a0dadcbd48c41af710eb21'
        }
    }

    before(async () => {
        const { didRegistry } = await loadFixture(deployDidRegistry)
        const ethrResolver = getEthrResolver({
            name: 'maticmum',
            provider: didRegistry.provider,
            registry: didRegistry.address,
            chainId: 31337
        })
        didResolver = new Resolver({
            ...ethrResolver})
        ethrDidMethod = new EthrDIDMethod({
            name: 'maticmum',
            provider: didRegistry.provider,
            registry: didRegistry.address,
            chainId: 31337
        })
    })

    it('Successfully create did:ethr', async () => {
        const res = await ethrDidMethod.create()
        expect(res.did).contain('did:ethr:maticmum')
        expect(KeyUtils.isHexPrivateKey(res.keyPair.privateKey)).equals(true)
        expect(KeyUtils.isHexPublicKey(res.keyPair.publicKey)).true
        expect(res.keyPair.algorithm).equals(KEY_ALG.ES256K)

        const doc = await didResolver.resolve(res.did)
        expect(doc.didResolutionMetadata.error).undefined
    })

    it('Successfully create did:ethr from private key', async () => {
        const res = await ethrDidMethod.generateFromPrivateKey(SAMPLE_DID.keyPair.privateKey)
        expect(res).not.undefined
        expect(res.did).not.undefined
        expect(res.did).equal(SAMPLE_DID.did)
        expect(res.keyPair.privateKey).not.undefined
        expect(KeyUtils.isHexPrivateKey(res.keyPair.privateKey)).true
        expect(res.keyPair.privateKey).equal(SAMPLE_DID.keyPair.privateKey)
        expect(res.keyPair.publicKey).not.undefined
        expect(KeyUtils.isHexPublicKey(res.keyPair.publicKey)).true
        expect(res.keyPair.publicKey).equal(SAMPLE_DID.keyPair.publicKey)
        expect(res.keyPair.algorithm).equal(KEY_ALG.ES256K)
        
        const doc = await didResolver.resolve(res.did)
        expect(doc).not.undefined
        expect(doc.didResolutionMetadata.error).undefined
    })

    it('Rejects generation from non-hex private key', async () => {
        const pk = await randomBytes(64)
        expect(ethrDidMethod.generateFromPrivateKey(pk))
            .to.be.revertedWith('TypeError: new public key not in hex format')
    })

    it('Successfully resolve did:ethr identifier', async () => {
        const res = await ethrDidMethod.resolve(SAMPLE_DID.did)
        expect(res).not.undefined
        expect(res.didDocument).not.undefined
        expect(res.didDocument?.id).equal(SAMPLE_DID.did)
        expect(res.didResolutionMetadata.error).undefined
    })

    it('Resolution fails with did:key', async () => {
        const didKey = 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'
        expect(ethrDidMethod.resolve(didKey))
            .to.be.revertedWith('DIDMethodFailureError')
    })

    it('Successfully updates did:ethr', async () => {
        const publicKey = '0x03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
        const res = await ethrDidMethod.update(SAMPLE_DID, publicKey)
        expect(res).true

        const doc = await didResolver.resolve(SAMPLE_DID.did)
        expect(doc).not.undefined
        expect(doc.didResolutionMetadata.error).undefined
        expect(doc.didDocumentMetadata.updated).not.undefined
    })

    it('Update did:ethr fails with non hex public key', async () => {
        expect(ethrDidMethod.update(SAMPLE_DID, '0x1234'))
            .to.be.revertedWith('TypeError: new public key not in hex format')
    })

    it('Update did:ethr fails with unfunded did', async () => {
        const publicKey = '0x03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
        expect(ethrDidMethod.update(UNFUNDED_DID, publicKey))
            .to.be.revertedWith('Error')
    })

    it('Successfully deactivates did:ethr', async () => {
        const res = await ethrDidMethod.deactivate(SAMPLE_DID)
        expect(res).true

        const doc = await didResolver.resolve(SAMPLE_DID.did)
        expect(doc).not.undefined
        expect(doc.didResolutionMetadata.error).undefined
        expect(doc.didDocumentMetadata.deactivated).not.undefined
        expect(doc.didDocumentMetadata.deactivated).true

        const isActive = await ethrDidMethod.isActive(SAMPLE_DID.did)
        expect(isActive).false
    })
})