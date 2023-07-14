import { JWTPayload } from "did-jwt"
import { DEFAULT_CONTEXT, JWTService, VERIFIABLE_PRESENTATION } from "../../../src/services/common"
import { createAndSignPresentationJWT, createPresentation } from "../../../src/services/holder/presentation"
import { KEY_ALG } from "../../../src/utils"

describe('presentation utilities', () => {

    const didWithKeys = {
        did: 'did:ethr:maticmum:0xA765CFD161AA0B6f95cb1DC1d933BFf6FAb0ABeE',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey: '027b942c04885bfdcc2497a9a94b2bdf915483cc2c5b5bffd7e86dcf021d731855',
            privateKey: '0x40dd06c69267386d198939c64580714e9526cea274f13f76b6b16e431d7caaa9'
        }
    }

    const VC_1 = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MDQxMzcwMDQsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiT2xsaWUifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5vcmcvZXhhbXBsZXMvZGVncmVlLmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYVZhbGlkYXRvcjIwMTgifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5lZHUvc3RhdHVzLzI0IiwidHlwZSI6IkNyZWRlbnRpYWxTdGF0dXNMaXN0MjAxNyJ9fSwic3ViIjoiZGlkOmV0aHI6bWF0aWNtdW06MHg1Rjg4MGE2ZUI3N2MxMkRiMmUxNEYyOWJmRTNiMWFhZjk0Qzk1NTA4IiwianRpIjoiZGlkOmV0aHI6bWF0aWNtdW06MHgyMGIxY0JCNTU0MjU5Rjc2MzZGQjQ4NzUzNkExN0UwRTcyMjQ4MzY4IiwibmJmIjoxNjg0NDMxMjY2LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweDQzODMzYWVCYzAxOGVkYzU4RDc3NjViYUI0OUI2MWM2RDFlOWQ1NGYifQ.hX-56L8cspoihl7tNYJwuvqhnW3XRYbJY1Hsu5HAEgJFcZGG-3yD2qCgawzLKT2twf9fcz8nBccbCuiyonUjAg'
    const VC_2 = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiUHJvb2ZPZk5hbWUiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsibmFtZSI6IkFuZ2VsYSJ9fSwic3ViIjoiZGlkOmV0aHI6bWF0aWNtdW06MHg1NzdBMzcwRkVGNjYxNjY5MjcxNWUzMGRFNzAzOUZlNTEwM0ExMkI3IiwibmJmIjoxNjg0NDMxMjY2LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweEE3NjVDRkQxNjFBQTBCNmY5NWNiMURDMWQ5MzNCRmY2RkFiMEFCZUUifQ.o5_CyRlzXBYl2U0vcxp3URAkveMuWUWtXOsIxA3xM1j3TfYtClR-vJ7deTlq2p_S_uew0xCTfiIQ0qvWkyUnng'

    it('Successfully Creates Presentation Object with 1 VC', async () => {

        const presentation = createPresentation(didWithKeys.did, [VC_1])

        expect(presentation["@context"]).toEqual([DEFAULT_CONTEXT])
        expect(presentation.type).toEqual(VERIFIABLE_PRESENTATION)
        expect(presentation.holder).toEqual(didWithKeys.did)
        expect(presentation.verifiableCredential?.length).toEqual(1)
    })

    it('Successfully Creates Presentation Object with 2 VCs', async () => {

        const presentation = createPresentation(didWithKeys.did, [VC_1, VC_2])

        expect(presentation["@context"]).toEqual([DEFAULT_CONTEXT])
        expect(presentation.type).toEqual(VERIFIABLE_PRESENTATION)
        expect(presentation.holder).toEqual(didWithKeys.did)
        expect(presentation.verifiableCredential?.length).toEqual(2)
    })

    it('Successfully Creates Presentation Object with 1 VC for a specific Verifier', async () => {
        const verifier = 'did:key:z6MkwC8aK5KwHn9ou4iX9AxF2YbGS8ecjhfxezV73NzDnWPV'
        const presentation = createPresentation(didWithKeys.did, [VC_1, VC_2], {verifier})

        expect(presentation["@context"]).toEqual([DEFAULT_CONTEXT])
        expect(presentation.type).toEqual(VERIFIABLE_PRESENTATION)
        expect(presentation.holder).toEqual(didWithKeys.did)
        expect(presentation.verifiableCredential?.length).toEqual(2)
        expect(presentation.verifier).toEqual(verifier)
    })
    
    it('Successfully Creates Presentation Object with additional properties', async () => {
        const issuanceDate = "2023-05-18T17:34:26.000Z"
        const expirationDate = "2024-05-18T17:34:26.000Z"
        const id = 'did:key:z6MkwC8aK5KwHn9ou4iX9AxF2YbGS8ecjhfxezV73NzDnWPV'
        const presentation = createPresentation(didWithKeys.did, [VC_1, VC_2], {id, expirationDate, issuanceDate })

        expect(presentation["@context"]).toEqual([DEFAULT_CONTEXT])
        expect(presentation.type).toEqual(VERIFIABLE_PRESENTATION)
        expect(presentation.holder).toEqual(didWithKeys.did)
        expect(presentation.verifiableCredential?.length).toEqual(2)
        expect(presentation.expirationDate).toEqual(expirationDate)
        expect(presentation.issuanceDate).toEqual(issuanceDate)
        expect(presentation.id).toEqual(id)
    })

    it('Successfully Creates and Signs VP JWT', async () => {

        const presentation = await createAndSignPresentationJWT(didWithKeys, [VC_1])

        expect(presentation).toBeDefined()
        const jwtService = new JWTService()
        const decodedVP = jwtService.decodeJWT(presentation)
        expect(decodedVP).toBeDefined()
        expect(decodedVP?.header).toBeDefined()
        expect(decodedVP?.payload).toBeDefined()
        expect(decodedVP?.signature).toBeDefined()
        expect(decodedVP?.header.alg).toEqual(didWithKeys.keyPair.algorithm)
        expect(decodedVP?.header.typ).toEqual(jwtService.name)
        const payload = decodedVP?.payload as JWTPayload
        expect(payload.vp['@context']).toEqual([DEFAULT_CONTEXT])
        expect(payload.vp.type).toEqual([VERIFIABLE_PRESENTATION])
        expect(payload.vp.verifiableCredential.length).toEqual(1)
        expect(payload.iss).toEqual(didWithKeys.did)
    })

    it('Successfully Creates and Signs VP JWT with domain and challenge', async () => {

        const presentation = await createAndSignPresentationJWT(didWithKeys, [VC_1], 
            {domain: 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR', challenge: '123xyz'})

        expect(presentation).toBeDefined()
        const jwtService = new JWTService()
        const decodedVP = jwtService.decodeJWT(presentation)
        expect(decodedVP).toBeDefined()
        expect(decodedVP?.header).toBeDefined()
        expect(decodedVP?.payload).toBeDefined()
        expect(decodedVP?.signature).toBeDefined()
        expect(decodedVP?.header.alg).toEqual(didWithKeys.keyPair.algorithm)
        expect(decodedVP?.header.typ).toEqual(jwtService.name)
        const payload = decodedVP?.payload as JWTPayload
        expect(payload.vp['@context']).toEqual([DEFAULT_CONTEXT])
        expect(payload.vp.type).toEqual([VERIFIABLE_PRESENTATION])
        expect(payload.vp.verifiableCredential.length).toEqual(1)
        expect(payload.iss).toEqual(didWithKeys.did)
        expect(payload.aud).toBeDefined()
        expect(payload.aud).toEqual(['did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'])
        expect(payload.nonce).toBeDefined()
        expect(payload.nonce).toEqual('123xyz')
    })
})