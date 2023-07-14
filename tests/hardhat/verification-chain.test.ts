// import { Resolver } from "did-resolver"
// import { getResolver as getKeyResolver} from 'key-did-resolver'
// import { getResolver as getEthrResolver} from 'ethr-did-resolver'
// import { DEFAULT_CONTEXT, EthrDIDMethod, VERIFIABLE_CREDENTIAL, VERIFIABLE_PRESENTATION } from "../../src/services/common"
// import { verifyCredentialJWT, verifyDID, verifyDIDs, verifyPresentationJWT } from "../../src/services/verifier/verification"
// import { DIDMethodFailureError } from "../../src/errors"
// import { ethers } from 'hardhat'
// import { expect } from 'chai'
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// describe('verification utilities - requiring didresolver', () => {
//     const VC_PAYLOAD_JWT_ETHR = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MDQxMzcwMDQsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiT2xsaWUifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5vcmcvZXhhbXBsZXMvZGVncmVlLmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYVZhbGlkYXRvcjIwMTgifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5lZHUvc3RhdHVzLzI0IiwidHlwZSI6IkNyZWRlbnRpYWxTdGF0dXNMaXN0MjAxNyJ9fSwic3ViIjoiZGlkOmV0aHI6bWF0aWNtdW06MHg1Rjg4MGE2ZUI3N2MxMkRiMmUxNEYyOWJmRTNiMWFhZjk0Qzk1NTA4IiwianRpIjoiZGlkOmV0aHI6bWF0aWNtdW06MHgyMGIxY0JCNTU0MjU5Rjc2MzZGQjQ4NzUzNkExN0UwRTcyMjQ4MzY4IiwibmJmIjoxNjg0NDMxMjY2LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweDQzODMzYWVCYzAxOGVkYzU4RDc3NjViYUI0OUI2MWM2RDFlOWQ1NGYifQ.hX-56L8cspoihl7tNYJwuvqhnW3XRYbJY1Hsu5HAEgJFcZGG-3yD2qCgawzLKT2twf9fcz8nBccbCuiyonUjAg'
//     const VC_PAYLOAD_OBJECT = {
//         '@context': [DEFAULT_CONTEXT],
//         type: [VERIFIABLE_CREDENTIAL],
//         issuer: {
//             id: 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'
//         },
//         credentialSubject: {
//             id: 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'
//         },
//         issuanceDate: "2023-01-01T19:23:24Z",
//         proof: {}
//     }
//     const VP_PAYLOAD_JWT = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKaGJHY2lPaUpGVXpJMU5rc2lMQ0owZVhBaU9pSktWMVFpZlEuZXlKbGVIQWlPakUzTURReE16Y3dNRFFzSW5aaklqcDdJa0JqYjI1MFpYaDBJanBiSW1oMGRIQnpPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1ERTRMMk55WldSbGJuUnBZV3h6TDNZeElsMHNJblI1Y0dVaU9sc2lWbVZ5YVdacFlXSnNaVU55WldSbGJuUnBZV3dpTENKUWNtOXZaazltVG1GdFpTSmRMQ0pqY21Wa1pXNTBhV0ZzVTNWaWFtVmpkQ0k2ZXlKdVlXMWxJam9pVDJ4c2FXVWlmU3dpWTNKbFpHVnVkR2xoYkZOamFHVnRZU0k2ZXlKcFpDSTZJbWgwZEhCek9pOHZaWGhoYlhCc1pTNXZjbWN2WlhoaGJYQnNaWE12WkdWbmNtVmxMbXB6YjI0aUxDSjBlWEJsSWpvaVNuTnZibE5qYUdWdFlWWmhiR2xrWVhSdmNqSXdNVGdpZlN3aVkzSmxaR1Z1ZEdsaGJGTjBZWFIxY3lJNmV5SnBaQ0k2SW1oMGRIQnpPaTh2WlhoaGJYQnNaUzVsWkhVdmMzUmhkSFZ6THpJMElpd2lkSGx3WlNJNklrTnlaV1JsYm5ScFlXeFRkR0YwZFhOTWFYTjBNakF4TnlKOWZTd2ljM1ZpSWpvaVpHbGtPbVYwYUhJNmJXRjBhV050ZFcwNk1IaEdOa1JrTWtZek1EUmhZemMzWkRsa01EUTVORGhqTkRnek1VVkJOak0yTkdNMU5qa3pOV1kzSWl3aWFuUnBJam9pWkdsa09tVjBhSEk2YldGMGFXTnRkVzA2TUhoaU9UTm1RekpDWWpaa05HWTVZek01UlRaaU1Ea3lZVVUwTVRsbE1VSmpNREkyTURReE56UkJJaXdpYm1KbUlqb3hOamd6TmpRNU1qQXdMQ0pwYzNNaU9pSmthV1E2WlhSb2NqcHRZWFJwWTIxMWJUb3dlREJFWkRJMk9UZGlRakE1WXpBMlEwVkNaR0ZGTVRJeVFUZzROVFk1TmpRd04yUXdZV0V3UWpBaWZRLm00ODF2SUVWYWpZb0ZZZDJjVi10S2QxSmpfckRKUHdwU2JNQXlOT3E5NTQxYk5sRk9JNlJySVBvbnJiTzFiaWdkTE8xU1NQVWdxU2lWVW9qZlNzY0VRIl19LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweDA3NjIzMUE0NzViOEY5MDVmNzFmNDU1ODBiRDAwNjQyMDI1YzRlMEQifQ.k6wmeflMFAQ-kvGhoC0TC-EXbVeW6ftknhNiENYA5Xjif-jP6d8JstcQzFSAE2ojyqMdsPuUGipi0eRxh1IlrA'
//     const VP_PAYLOAD_OBJECT = {
//         '@context': [DEFAULT_CONTEXT],
//         type: [VERIFIABLE_PRESENTATION],
//         holder: 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR',
//         verifier: [],
//         proof: {}
//     }
//     const DID_KEY = 'did:key:z6MkwC8aK5KwHn9ou4iX9AxF2YbGS8ecjhfxezV73NzDnWPV'

//     const DID_ETHR = 'did:ethr:maticmum:0x076231A475b8F905f71f45580bD00642025c4e0D'

//     let oneResolver: Resolver
//     let combinedResolver: Resolver
//     let ethrDidMethod: EthrDIDMethod

//     async function deployDidRegistry() {
//         const [owner] = await ethers.getSigners()
//         const DidRegistry = await ethers.getContractFactory('EthereumDIDRegistry')
//         const didRegistry = await DidRegistry.deploy()
//         await didRegistry.deployed()
//         return { didRegistry }
//     }
//     before(async () => {
//         const { didRegistry } = await loadFixture(deployDidRegistry)
        
//         const keyResolver = getKeyResolver()
//         const ethrResolver = getEthrResolver({
//             name: 'maticmum',
//             provider: didRegistry.provider,
//             registry: didRegistry.address,
//             chainId: 31337
//             })
//             oneResolver = new Resolver({
//                 ...keyResolver})
//             combinedResolver = new Resolver({
//                 ...keyResolver,
//                  ...ethrResolver})

//         ethrDidMethod = new EthrDIDMethod({
//             name: 'maticmum',
//             provider: didRegistry.provider,
//             registry: didRegistry.address,
//             chainId: 31337
//         })
//     })

//         it('Succeeds verifying VC JWT, did:key', async () => {
//             //TODO
//         })
    
//         it('Succeeds verifying VC JWT, did:ethr', async () => {
//             const res = await verifyCredentialJWT(VC_PAYLOAD_JWT_ETHR, combinedResolver)
//             expect(res).true
//         })
    
//         // it('Succeeds verifying VC JWT with options', async () => {
//         //     //TODO
//         // })
    
//         // it('Succeeds verifying VP JWT with date options', async () => {
//         //     //TODO
//         // })
    
//         it('Fails to verify VC JWT, missing resolver', async () => {
//             expect(verifyCredentialJWT(VC_PAYLOAD_JWT_ETHR, oneResolver))
//             .to.be.revertedWith('')
//         })
    
//         it('Fails to verify VC JWT, not jwt', async () => {
//             expect(verifyCredentialJWT(VC_PAYLOAD_OBJECT, combinedResolver))
//             .to.be.revertedWith('')
//         })
    
//         // it('Succeeds verifying VP JWT, did:key', async () => {
//         //     //TODO
//         // })
    
//         it('Succeeds verifying VP JWT, did:ethr', async () => {
//             const res = await verifyPresentationJWT(VP_PAYLOAD_JWT, combinedResolver)
//             expect(res).true
//         })
    
//         // it('Succeeds verifying VP JWT with options', async () => {
//         //     //TODO
//         // })
    
//         // it('Succeeds verifying VP JWT with date options', async () => {
//         //     //TODO
//         // })
    
//         it('Fails to verify VP JWT, missing resolver', async () => {
//             expect(verifyPresentationJWT(VP_PAYLOAD_JWT, oneResolver))
//             .to.be.revertedWith('')
//         })
    
//         it('Fails to verify VC JWT, not jwt', async () => {
//             expect(verifyPresentationJWT(VP_PAYLOAD_OBJECT, combinedResolver))
//             .to.be.revertedWith('')
//         })
    
//         it('Succeeds verifying did:key', async () => {
//             const res = await verifyDID(DID_KEY, combinedResolver)
//             expect(res).true
//         })
    
//         it('Succeeds verifying new did:ethr', async () => {
//             const res = await verifyDID(DID_ETHR, combinedResolver)
//             expect(res).true
//         })
    
//         // it('Succeeds verifying updated did:ethr', async () => {
//         //     //TODO
//         // })
    
//         // it('Succeeds verifying did:ethr deactivated', async () => {
//         //     //TODO
//         // })
    
//         it('Fails verifying did:ethr, no resolver', async () => {
//             expect(verifyDID(DID_ETHR, oneResolver))
//             .to.be.revertedWith('')
//         })
    
//         // it('Succeeds verifying VC DIDs, did:key, jwt', async () => {
//         //     //TODO
//         // })
    
//         it('Succeeds verifying VC DIDs, did:ethr, jwt', async () => {
//             const res = await verifyDIDs(VC_PAYLOAD_JWT_ETHR, combinedResolver)
//             expect(res).true
//         })
    
//         it('Succeeds verifying VC DIDs, did:key, object', async () => {
//             const res = await verifyDIDs(VC_PAYLOAD_OBJECT, combinedResolver)
//             expect(res).true
//         })
    
//         // it('Succeeds verifying VC DIDs, did:ethr, issuer deactivated', async () => {
//         //     //TODO
//         // })
    
//         // it('Succeeds verifying VC DIDs, did:ethr, holder deactivated', async () => {
//         //     //TODO
//         // })
    
//         it('Fails verifying VC DIDs, did:key, object - credSub missing', async () => {
//             const res = await verifyDIDs({...VC_PAYLOAD_OBJECT, credentialSubject: {}}, combinedResolver)
//             expect(res).false
//         })
    
//         // it('Fails verifying VC DIDs, missing issuer', async () => {
//         //     //TODO - is this possible?
//         // })
    
//         // it('Fails verifying VC DIDs, missing holder', async () => {
//         //     //TODO - is this possible?
//         // })
    
//         // it('Succeeds verifying VC Expiration, jwt', async () => {
//         //     //TODO - fix
//         //     // const res = verifyExpiry(VC_PAYLOAD_JWT)
//         //     // expect(res).toBeTruthy()
//         // })

//         // it('Succeeds verifying VC Revocation, jwt', async () => {
//         //     //TODO
//         //     const res = await verifyRevocationStatus(VC_PAYLOAD_JWT, didResolver)
//         //     //expect(res).toBeTruthy()
//         // })
    
//         // it('Succeeds verifying VC Revocation, object', async () => {
//         //     //TODO
//         //     const res = await verifyRevocationStatus({...VC_PAYLOAD_OBJECT, id: DID_KEY}, didResolver)
//         //     //expect(res).toBeTruthy()
//         // })
    
//         // it('Succeeds verifying VC Revocation did:ethr, object', async () => {
//         //     //TODO
//         //     const res = await verifyRevocationStatus({...VC_PAYLOAD_OBJECT, id: DID_ETHR}, didResolver)
//         // })
    
//         // it('Succeeds rejecting empty VC Revocation id, object', async () => {
//         //     const res = await verifyRevocationStatus(VC_PAYLOAD_OBJECT, didResolver)
//         //     expect(res).toBeFalsy()
//         // })
// })