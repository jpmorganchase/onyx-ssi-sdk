import { DEFAULT_CONTEXT, JSONLDService, VERIFIABLE_CREDENTIAL, VERIFIABLE_PRESENTATION } from "../../../src/services/common"
import { KEY_ALG } from "../../../src/utils"

describe('jsonld utilities', () => {
    const didWithKeys = {
        did: 'did:ethr:maticmum:0xA765CFD161AA0B6f95cb1DC1d933BFf6FAb0ABeE',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey: '027b942c04885bfdcc2497a9a94b2bdf915483cc2c5b5bffd7e86dcf021d731855',
            privateKey: '0x40dd06c69267386d198939c64580714e9526cea274f13f76b6b16e431d7caaa9'
        }
    }

    const context = [DEFAULT_CONTEXT]
    const credentialSubject = {
        id: "did:ethr:maticmum:0x5F880a6eB77c12Db2e14F29bfE3b1aaf94C95508",
        name: "Ollie"
    }
    const issuer = {
        id: didWithKeys.did
    }
    const type = [
        VERIFIABLE_CREDENTIAL,
        "ProofOfName"
    ]
    const issuanceDate = "2023-05-18T17:34:26.000Z"

    const VC_PAYLOAD = {
        '@context': context,
        credentialSubject,
        issuer,
        type,
        issuanceDate,
    }
    const holder = didWithKeys.did
    const verifiableCredential = ['eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MDQxMzcwMDQsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiT2xsaWUifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5vcmcvZXhhbXBsZXMvZGVncmVlLmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYVZhbGlkYXRvcjIwMTgifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5lZHUvc3RhdHVzLzI0IiwidHlwZSI6IkNyZWRlbnRpYWxTdGF0dXNMaXN0MjAxNyJ9fSwic3ViIjoiZGlkOmV0aHI6bWF0aWNtdW06MHg1Rjg4MGE2ZUI3N2MxMkRiMmUxNEYyOWJmRTNiMWFhZjk0Qzk1NTA4IiwianRpIjoiZGlkOmV0aHI6bWF0aWNtdW06MHgyMGIxY0JCNTU0MjU5Rjc2MzZGQjQ4NzUzNkExN0UwRTcyMjQ4MzY4IiwibmJmIjoxNjg0NDMxMjY2LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweDQzODMzYWVCYzAxOGVkYzU4RDc3NjViYUI0OUI2MWM2RDFlOWQ1NGYifQ.hX-56L8cspoihl7tNYJwuvqhnW3XRYbJY1Hsu5HAEgJFcZGG-3yD2qCgawzLKT2twf9fcz8nBccbCuiyonUjAg']

    const VP_PAYLOAD = {
        '@context': context,
        type: VERIFIABLE_PRESENTATION,
        holder,
        verifiableCredential
    }

    it('SignVC not implemented for jsonld', async () => {
        const jsonldService = new JSONLDService()
        await expect(jsonldService.signVC(didWithKeys, VC_PAYLOAD))
            .rejects.toThrowError(Error)
    })

    it('SignVP not implemented for jsonld', async () => {
        const jsonldService = new JSONLDService()
        await expect(jsonldService.signVP(didWithKeys, VP_PAYLOAD))
            .rejects.toThrowError(Error)
    })
})