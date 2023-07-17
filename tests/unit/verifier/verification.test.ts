import { verifyCredentialJWT, verifyDID, verifyDIDs, verifyExpiry, verifyIssuanceDate, verifyPresentationJWT, verifyRevocationStatus, verifySchema } from "../../../src/services/verifier/verification"
import { DEFAULT_CONTEXT, EthrDIDMethod, KeyDIDMethod, SCHEMA_VALIDATOR, SchemaManager, VERIFIABLE_CREDENTIAL, VERIFIABLE_PRESENTATION, getSupportedResolvers } from '../../../src/services/common'
import { Resolver } from "did-resolver"
import { DIDMethodFailureError } from "../../../src/errors"

describe('verification utilities', () => {

    //VC with did:ethr, expiration, credentialSchema, credentialStatus, VC id
    const VC_PAYLOAD_JWT_ETHR = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MDQxMzcwMDQsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiT2xsaWUifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5vcmcvZXhhbXBsZXMvZGVncmVlLmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYVZhbGlkYXRvcjIwMTgifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5lZHUvc3RhdHVzLzI0IiwidHlwZSI6IkNyZWRlbnRpYWxTdGF0dXNMaXN0MjAxNyJ9fSwic3ViIjoiZGlkOmV0aHI6bWF0aWNtdW06MHg1Rjg4MGE2ZUI3N2MxMkRiMmUxNEYyOWJmRTNiMWFhZjk0Qzk1NTA4IiwianRpIjoiZGlkOmV0aHI6bWF0aWNtdW06MHgyMGIxY0JCNTU0MjU5Rjc2MzZGQjQ4NzUzNkExN0UwRTcyMjQ4MzY4IiwibmJmIjoxNjg0NDMxMjY2LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweDQzODMzYWVCYzAxOGVkYzU4RDc3NjViYUI0OUI2MWM2RDFlOWQ1NGYifQ.hX-56L8cspoihl7tNYJwuvqhnW3XRYbJY1Hsu5HAEgJFcZGG-3yD2qCgawzLKT2twf9fcz8nBccbCuiyonUjAg'
    //VC with did:key
    const VC_PAYLOAD_JWT_KEY = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiUHJvb2ZPZk5hbWUiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsibmFtZSI6IkFuZ2VsYSJ9fSwic3ViIjoiZGlkOmtleTp6Nk1rcTUycXp3WnNodHZ2akx5NEwzZXBpVlRUMXVDZHhldGU3MWcyZDdNOWg5NkgiLCJuYmYiOjE2ODQ5NDk0MDEsImlzcyI6ImRpZDprZXk6ejZNa2hhaVpBOFlHUjg2M3JnZTNKTnR6cEE2cUtwbm85SFRoNHVjUnNNTWlwbzVXIn0.1IQrzPGTMyc7tUQSkxuDGbIjt2t556QYTotxC7wkm8eT3appXSP-6VlLPSuC1Uk50XYPO0r2HlOqKqHLqee4DA'
    //VC with did:key, expiration, vc id, credentialSchema, credentialStatus
    const VC_PAYLOAD_JWT_KEY_OPTIONS = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTY2MzYyNzcsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQW5nZWxhIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2V4YW1wbGUub3JnL2V4YW1wbGVzL2RlZ3JlZS5qc29uIiwidHlwZSI6Ikpzb25TY2hlbWFWYWxpZGF0b3IyMDE4In0sImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2V4YW1wbGUuZWR1L3N0YXR1cy8yNCIsInR5cGUiOiJDcmVkZW50aWFsU3RhdHVzTGlzdDIwMTcifX0sInN1YiI6ImRpZDprZXk6ejZNa3FMUE5YWnJWa1hXV0JwS0ZpZXZ4S3BBMmtINVkzYzQzVXhEamdCcTdvRWNUIiwianRpIjoiZGlkOmtleTp6Nk1rdVo3NFJqQkVDSkhkSlhyZlA4eWo5Z3BNVEV1aURWa3RFTjdIUlBNTUNvVEMiLCJuYmYiOjE2ODUwMTM4NzcsImlzcyI6ImRpZDprZXk6ejZNa2pFRnozbWNHTHU3SFRYQUFHMkhKQmlKZTdWR2VUQVRVcml2S0xqZndySlFGIn0.9Dn95yw2-ZxnKDe7huYaVioE_U7Q9cHBzRkDNwa6_S1E0LRHiof_28U6g4exgkLHdWUyRvbmlpJIrUlYZIDWCw'
    //VC with did:key, invalid expiration, vc id, credentialSchema and credentialStatus
    const VC_PAYLOAD_JWT_KEY_EXP = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTM0NzgzOTUsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQW5nZWxhIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2V4YW1wbGUub3JnL2V4YW1wbGVzL2RlZ3JlZS5qc29uIiwidHlwZSI6Ikpzb25TY2hlbWFWYWxpZGF0b3IyMDE4In0sImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2V4YW1wbGUuZWR1L3N0YXR1cy8yNCIsInR5cGUiOiJDcmVkZW50aWFsU3RhdHVzTGlzdDIwMTcifX0sInN1YiI6ImRpZDprZXk6ejZNa29ZblBHYnd4V1ZQV1U2TnU1MkxHdllWRmIxNldTZWZ3SnRGeWZmWnRMNWtIIiwianRpIjoiZGlkOmtleTp6Nk1rcWRZMUZVR3lreW9Fb3JTTE44Z3dSNGhKYWRvVVd6RXp1QUNqbkZtc1V2dkIiLCJuYmYiOjE2ODUwMTQzOTUsImlzcyI6ImRpZDprZXk6ejZNa2tzc28yRXkzRlBnSENhU21Wd3lxOEJwVUNNTHB0VzlHcUZEeTRlSmpkeWJlIn0.--25EU2TEkaKo7BOg4b-VcjNUknGfSTcuxID5eAqb0vuJnm4QLBz3KWIhyHJtUpGvsuNrVfu8NtDgFG3JuRuCw'
    
    const VC_PAYLOAD_OBJECT = {
        '@context': [DEFAULT_CONTEXT],
        type: [VERIFIABLE_CREDENTIAL],
        issuer: {
            id: 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'
        },
        credentialSubject: {
            id: 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'
        },
        issuanceDate: "2023-01-01T19:23:24Z",
        proof: {}
    }

    it('Succeeds verifying VC Expiration, object', async () => {
        const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000); 
        const futureDate = new Date();
        futureDate.setTime(currentTimeInSeconds * 1000);
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const res = verifyExpiry({...VC_PAYLOAD_OBJECT, expirationDate: futureDate.toISOString()})
        expect(res).toBeTruthy()
    })

    it('Succeeds verifying VC Expiration, jwt', async () => {
        const res = verifyExpiry(VC_PAYLOAD_JWT_KEY_OPTIONS)
        expect(res).toBeTruthy()
    })

    it('Succeeds rejecting VC Expiration, jwt', async () => {
        const res = verifyExpiry(VC_PAYLOAD_JWT_KEY_EXP)
        expect(res).toBeFalsy()
    })

    it('Succeeds rejecting no VC Expiration, jwt', async () => {
        expect(() => verifyExpiry(VC_PAYLOAD_JWT_KEY))
            .toThrowError(Error)
    })

    it('Succeeds rejecting past VC Expiration, object', async () => {
        const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000); 
        const futureDate = new Date();
        futureDate.setTime(currentTimeInSeconds * 1000);
        futureDate.setFullYear(futureDate.getFullYear() - 1);

        const res = verifyExpiry({...VC_PAYLOAD_OBJECT, issuanceDate: futureDate.toISOString()})
        expect(res).toBeFalsy()
    })

    it('Succeeds rejecting empty VC Expiration, object', async () => {
        const res = verifyExpiry({...VC_PAYLOAD_OBJECT, expirationDate: ''})
        expect(res).toBeFalsy()
    })

    it('Succeeds verifying VC IssuanceDate, jwt', async () => {
        const res = verifyIssuanceDate(VC_PAYLOAD_JWT_ETHR)
        expect(res).toBeTruthy()
    })

    it('Succeeds verifying VC IssuanceDate, object', async () => {
        const res = verifyIssuanceDate(VC_PAYLOAD_OBJECT)
        expect(res).toBeTruthy()
    })

    it('Succeeds rejecting future VC IssuanceDate, object', async () => {
        const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000); 
        const futureDate = new Date();
        futureDate.setTime(currentTimeInSeconds * 1000);
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        const res = verifyIssuanceDate({...VC_PAYLOAD_OBJECT, issuanceDate: futureDate.toISOString()})
        expect(res).toBeFalsy()
    })

    it('Succeeds rejecting empty VC IssuanceDate, object', async () => {
        const res = verifyIssuanceDate({...VC_PAYLOAD_OBJECT, issuanceDate: ''})
        expect(res).toBeFalsy()
    })

    it('Succeeds verifying VC schema, jwt', async () => {
        SchemaManager.getSchemaFromFile = jest.fn().mockResolvedValueOnce({})
        SchemaManager.validateCredentialSubject = jest.fn().mockReturnValueOnce(true)
        const res = await verifySchema(VC_PAYLOAD_JWT_ETHR, true)
        expect(res).toBeTruthy()
    })

    it('Succeeds rejecting VC schema, jwt', async () => {
        SchemaManager.getSchemaFromFile = jest.fn().mockResolvedValueOnce({})
        SchemaManager.validateCredentialSubject = jest.fn().mockReturnValueOnce(false)
        const res = await verifySchema(VC_PAYLOAD_JWT_ETHR, true)
        expect(res).toBeFalsy()
    })

    it('Succeeds verifying VC schema, object', async () => {
        SchemaManager.getSchemaFromFile = jest.fn().mockResolvedValueOnce({})
        SchemaManager.validateCredentialSubject = jest.fn().mockReturnValueOnce(true)
        const res = await verifySchema({...VC_PAYLOAD_OBJECT,
            credentialSchema: {
                id: 'testLocation',
                type: SCHEMA_VALIDATOR
            }}, true)
        expect(res).toBeTruthy()
    })

    it('Succeeds rejecting VC schema, object', async () => {
        SchemaManager.getSchemaRemote = jest.fn().mockResolvedValueOnce({})
        SchemaManager.validateCredentialSubject = jest.fn().mockReturnValueOnce(false)
        const res = await verifySchema({...VC_PAYLOAD_OBJECT,
            credentialSchema: {
                id: 'testLocation',
                type: SCHEMA_VALIDATOR
            }}, false)
        expect(res).toBeFalsy()
    })
    it('Succeeds rejecting VC schema without schema, object', async () => {
        SchemaManager.getSchemaFromFile = jest.fn().mockResolvedValueOnce({})
        SchemaManager.validateCredentialSubject = jest.fn().mockReturnValueOnce(false)
        const res = await verifySchema(VC_PAYLOAD_OBJECT, true)
        expect(res).toBeFalsy()
    })
})

describe('verification utilities - requiring didresolver', () => {
    //VC with did:ethr, vc id, expiration, credentialSchema and credentialStatus
    const VC_PAYLOAD_JWT_ETHR = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MDQxMzcwMDQsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiT2xsaWUifSwiY3JlZGVudGlhbFNjaGVtYSI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5vcmcvZXhhbXBsZXMvZGVncmVlLmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYVZhbGlkYXRvcjIwMTgifSwiY3JlZGVudGlhbFN0YXR1cyI6eyJpZCI6Imh0dHBzOi8vZXhhbXBsZS5lZHUvc3RhdHVzLzI0IiwidHlwZSI6IkNyZWRlbnRpYWxTdGF0dXNMaXN0MjAxNyJ9fSwic3ViIjoiZGlkOmV0aHI6bWF0aWNtdW06MHg1Rjg4MGE2ZUI3N2MxMkRiMmUxNEYyOWJmRTNiMWFhZjk0Qzk1NTA4IiwianRpIjoiZGlkOmV0aHI6bWF0aWNtdW06MHgyMGIxY0JCNTU0MjU5Rjc2MzZGQjQ4NzUzNkExN0UwRTcyMjQ4MzY4IiwibmJmIjoxNjg0NDMxMjY2LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweDQzODMzYWVCYzAxOGVkYzU4RDc3NjViYUI0OUI2MWM2RDFlOWQ1NGYifQ.hX-56L8cspoihl7tNYJwuvqhnW3XRYbJY1Hsu5HAEgJFcZGG-3yD2qCgawzLKT2twf9fcz8nBccbCuiyonUjAg'
    //VC with did:key
    const VC_PAYLOAD_JWT_KEY = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiUHJvb2ZPZk5hbWUiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsibmFtZSI6IkFuZ2VsYSJ9fSwic3ViIjoiZGlkOmtleTp6Nk1rcTUycXp3WnNodHZ2akx5NEwzZXBpVlRUMXVDZHhldGU3MWcyZDdNOWg5NkgiLCJuYmYiOjE2ODQ5NDk0MDEsImlzcyI6ImRpZDprZXk6ejZNa2hhaVpBOFlHUjg2M3JnZTNKTnR6cEE2cUtwbm85SFRoNHVjUnNNTWlwbzVXIn0.1IQrzPGTMyc7tUQSkxuDGbIjt2t556QYTotxC7wkm8eT3appXSP-6VlLPSuC1Uk50XYPO0r2HlOqKqHLqee4DA'
    //VC with did:key, expiration, vc id, credentialSchema and credentialStatus
    const VC_PAYLOAD_JWT_KEY_OPTIONS = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTY2MzYyNzcsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQW5nZWxhIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2V4YW1wbGUub3JnL2V4YW1wbGVzL2RlZ3JlZS5qc29uIiwidHlwZSI6Ikpzb25TY2hlbWFWYWxpZGF0b3IyMDE4In0sImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2V4YW1wbGUuZWR1L3N0YXR1cy8yNCIsInR5cGUiOiJDcmVkZW50aWFsU3RhdHVzTGlzdDIwMTcifX0sInN1YiI6ImRpZDprZXk6ejZNa3FMUE5YWnJWa1hXV0JwS0ZpZXZ4S3BBMmtINVkzYzQzVXhEamdCcTdvRWNUIiwianRpIjoiZGlkOmtleTp6Nk1rdVo3NFJqQkVDSkhkSlhyZlA4eWo5Z3BNVEV1aURWa3RFTjdIUlBNTUNvVEMiLCJuYmYiOjE2ODUwMTM4NzcsImlzcyI6ImRpZDprZXk6ejZNa2pFRnozbWNHTHU3SFRYQUFHMkhKQmlKZTdWR2VUQVRVcml2S0xqZndySlFGIn0.9Dn95yw2-ZxnKDe7huYaVioE_U7Q9cHBzRkDNwa6_S1E0LRHiof_28U6g4exgkLHdWUyRvbmlpJIrUlYZIDWCw'
    //VC with did:key, invalid expiration, vc id, credentialSchema and credentialStatus
    const VC_PAYLOAD_JWT_KEY_EXP = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTM0NzgzOTUsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQcm9vZk9mTmFtZSJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJuYW1lIjoiQW5nZWxhIn0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2V4YW1wbGUub3JnL2V4YW1wbGVzL2RlZ3JlZS5qc29uIiwidHlwZSI6Ikpzb25TY2hlbWFWYWxpZGF0b3IyMDE4In0sImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwczovL2V4YW1wbGUuZWR1L3N0YXR1cy8yNCIsInR5cGUiOiJDcmVkZW50aWFsU3RhdHVzTGlzdDIwMTcifX0sInN1YiI6ImRpZDprZXk6ejZNa29ZblBHYnd4V1ZQV1U2TnU1MkxHdllWRmIxNldTZWZ3SnRGeWZmWnRMNWtIIiwianRpIjoiZGlkOmtleTp6Nk1rcWRZMUZVR3lreW9Fb3JTTE44Z3dSNGhKYWRvVVd6RXp1QUNqbkZtc1V2dkIiLCJuYmYiOjE2ODUwMTQzOTUsImlzcyI6ImRpZDprZXk6ejZNa2tzc28yRXkzRlBnSENhU21Wd3lxOEJwVUNNTHB0VzlHcUZEeTRlSmpkeWJlIn0.--25EU2TEkaKo7BOg4b-VcjNUknGfSTcuxID5eAqb0vuJnm4QLBz3KWIhyHJtUpGvsuNrVfu8NtDgFG3JuRuCw'
    
    const VC_PAYLOAD_OBJECT = {
        '@context': [DEFAULT_CONTEXT],
        type: [VERIFIABLE_CREDENTIAL],
        issuer: {
            id: 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'
        },
        credentialSubject: {
            id: 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR'
        },
        issuanceDate: "2023-01-01T19:23:24Z",
        proof: {}
    }
    //VP with did:ethr
    const VP_PAYLOAD_JWT_ETHR = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKaGJHY2lPaUpGVXpJMU5rc2lMQ0owZVhBaU9pSktWMVFpZlEuZXlKbGVIQWlPakUzTURReE16Y3dNRFFzSW5aaklqcDdJa0JqYjI1MFpYaDBJanBiSW1oMGRIQnpPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1ERTRMMk55WldSbGJuUnBZV3h6TDNZeElsMHNJblI1Y0dVaU9sc2lWbVZ5YVdacFlXSnNaVU55WldSbGJuUnBZV3dpTENKUWNtOXZaazltVG1GdFpTSmRMQ0pqY21Wa1pXNTBhV0ZzVTNWaWFtVmpkQ0k2ZXlKdVlXMWxJam9pVDJ4c2FXVWlmU3dpWTNKbFpHVnVkR2xoYkZOamFHVnRZU0k2ZXlKcFpDSTZJbWgwZEhCek9pOHZaWGhoYlhCc1pTNXZjbWN2WlhoaGJYQnNaWE12WkdWbmNtVmxMbXB6YjI0aUxDSjBlWEJsSWpvaVNuTnZibE5qYUdWdFlWWmhiR2xrWVhSdmNqSXdNVGdpZlN3aVkzSmxaR1Z1ZEdsaGJGTjBZWFIxY3lJNmV5SnBaQ0k2SW1oMGRIQnpPaTh2WlhoaGJYQnNaUzVsWkhVdmMzUmhkSFZ6THpJMElpd2lkSGx3WlNJNklrTnlaV1JsYm5ScFlXeFRkR0YwZFhOTWFYTjBNakF4TnlKOWZTd2ljM1ZpSWpvaVpHbGtPbVYwYUhJNmJXRjBhV050ZFcwNk1IaEdOa1JrTWtZek1EUmhZemMzWkRsa01EUTVORGhqTkRnek1VVkJOak0yTkdNMU5qa3pOV1kzSWl3aWFuUnBJam9pWkdsa09tVjBhSEk2YldGMGFXTnRkVzA2TUhoaU9UTm1RekpDWWpaa05HWTVZek01UlRaaU1Ea3lZVVUwTVRsbE1VSmpNREkyTURReE56UkJJaXdpYm1KbUlqb3hOamd6TmpRNU1qQXdMQ0pwYzNNaU9pSmthV1E2WlhSb2NqcHRZWFJwWTIxMWJUb3dlREJFWkRJMk9UZGlRakE1WXpBMlEwVkNaR0ZGTVRJeVFUZzROVFk1TmpRd04yUXdZV0V3UWpBaWZRLm00ODF2SUVWYWpZb0ZZZDJjVi10S2QxSmpfckRKUHdwU2JNQXlOT3E5NTQxYk5sRk9JNlJySVBvbnJiTzFiaWdkTE8xU1NQVWdxU2lWVW9qZlNzY0VRIl19LCJpc3MiOiJkaWQ6ZXRocjptYXRpY211bToweDA3NjIzMUE0NzViOEY5MDVmNzFmNDU1ODBiRDAwNjQyMDI1YzRlMEQifQ.k6wmeflMFAQ-kvGhoC0TC-EXbVeW6ftknhNiENYA5Xjif-jP6d8JstcQzFSAE2ojyqMdsPuUGipi0eRxh1IlrA'
    //VP with did:key
    const VP_PAYLOAD_JWT_KEY = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKaGJHY2lPaUpGWkVSVFFTSXNJblI1Y0NJNklrcFhWQ0o5LmV5SjJZeUk2ZXlKQVkyOXVkR1Y0ZENJNld5Sm9kSFJ3Y3pvdkwzZDNkeTUzTXk1dmNtY3ZNakF4T0M5amNtVmtaVzUwYVdGc2N5OTJNU0pkTENKMGVYQmxJanBiSWxabGNtbG1hV0ZpYkdWRGNtVmtaVzUwYVdGc0lpd2lVSEp2YjJaUFprNWhiV1VpWFN3aVkzSmxaR1Z1ZEdsaGJGTjFZbXBsWTNRaU9uc2libUZ0WlNJNklrRnVaMlZzWVNKOWZTd2ljM1ZpSWpvaVpHbGtPbXRsZVRwNk5rMXJjVFV5Y1hwM1duTm9kSFoyYWt4NU5Fd3paWEJwVmxSVU1YVkRaSGhsZEdVM01XY3laRGROT1dnNU5rZ2lMQ0p1WW1ZaU9qRTJPRFE1TkRrME1ERXNJbWx6Y3lJNkltUnBaRHByWlhrNmVqWk5hMmhoYVZwQk9GbEhVamcyTTNKblpUTktUblI2Y0VFMmNVdHdibTg1U0ZSb05IVmpVbk5OVFdsd2J6VlhJbjAuMUlRcnpQR1RNeWM3dFVRU2t4dURHYklqdDJ0NTU2UVlUb3R4Qzd3a204ZVQzYXBwWFNQLTZWbExQU3VDMVVrNTBYWVBPMHIySGxPcUtxSExxZWU0REEiXX0sImlzcyI6ImRpZDprZXk6ejZNa3BZYWk0cjlFdDVzYkY0NTRVdU1HWmlvcDRxNEJkamdWRlZRNzhOSEpWZEpuIn0.zNhfS0QhzkOIr2cCw--jqgNAsi1K5AC8hEEiKuXxzjwI6rlu-Fwqyv2W80v56HfDEoxwTGzT0_9_lQPIrYeDDA'
    //VP with did:key and did:ethr aud
    const VP_PAYLOAD_JWT_KEY_AUD = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iXSwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKaGJHY2lPaUpGWkVSVFFTSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmxlSEFpT2pFMk5UTTBOemd6T1RVc0luWmpJanA3SWtCamIyNTBaWGgwSWpwYkltaDBkSEJ6T2k4dmQzZDNMbmN6TG05eVp5OHlNREU0TDJOeVpXUmxiblJwWVd4ekwzWXhJbDBzSW5SNWNHVWlPbHNpVm1WeWFXWnBZV0pzWlVOeVpXUmxiblJwWVd3aUxDSlFjbTl2Wms5bVRtRnRaU0pkTENKamNtVmtaVzUwYVdGc1UzVmlhbVZqZENJNmV5SnVZVzFsSWpvaVFXNW5aV3hoSW4wc0ltTnlaV1JsYm5ScFlXeFRZMmhsYldFaU9uc2lhV1FpT2lKb2RIUndjem92TDJWNFlXMXdiR1V1YjNKbkwyVjRZVzF3YkdWekwyUmxaM0psWlM1cWMyOXVJaXdpZEhsd1pTSTZJa3B6YjI1VFkyaGxiV0ZXWVd4cFpHRjBiM0l5TURFNEluMHNJbU55WldSbGJuUnBZV3hUZEdGMGRYTWlPbnNpYVdRaU9pSm9kSFJ3Y3pvdkwyVjRZVzF3YkdVdVpXUjFMM04wWVhSMWN5OHlOQ0lzSW5SNWNHVWlPaUpEY21Wa1pXNTBhV0ZzVTNSaGRIVnpUR2x6ZERJd01UY2lmWDBzSW5OMVlpSTZJbVJwWkRwclpYazZlalpOYTI5WmJsQkhZbmQ0VjFaUVYxVTJUblUxTWt4SGRsbFdSbUl4TmxkVFpXWjNTblJHZVdabVduUk1OV3RJSWl3aWFuUnBJam9pWkdsa09tdGxlVHA2TmsxcmNXUlpNVVpWUjNscmVXOUZiM0pUVEU0NFozZFNOR2hLWVdSdlZWZDZSWHAxUVVOcWJrWnRjMVYyZGtJaUxDSnVZbVlpT2pFMk9EVXdNVFF6T1RVc0ltbHpjeUk2SW1ScFpEcHJaWGs2ZWpaTmEydHpjMjh5UlhrelJsQm5TRU5oVTIxV2QzbHhPRUp3VlVOTlRIQjBWemxIY1VaRWVUUmxTbXBrZVdKbEluMC4tLTI1RVUyVEVrYUtvN0JPZzRiLVZjak5Va25HZlNUY3V4SUQ1ZUFxYjB2dUpubTRRTEJ6M0tXSWh5SEp0VXBHdnN1TnJWZnU4TnREZ0ZHM0p1UnVDdyJdfSwiaXNzIjoiZGlkOmtleTp6Nk1rcndmOHB0ZkRlekFpN0NzVmhWcTFyd3FwVnFLaWNyWjRGbTZhOXRrcU05SHciLCJhdWQiOlsiZGlkOmV0aHI6bWF0aWNtdW06MHgwNDM4N2JlNkMxOENDODNGQTI1NmY0ODg4YUZFRjg0NDVlRUIwZUQ3Il19.d620gw_nMqFTOBLkntaY6Yu7bPRK_rf0u6yKMlviFuPrZhPLx1GxSqzxU064BYBxkHHXNmRw-k9WXcC_AkAUAw'
    
    const VP_PAYLOAD_OBJECT = {
        '@context': [DEFAULT_CONTEXT],
        type: [VERIFIABLE_PRESENTATION],
        holder: 'did:key:z6Mkmo5LhWKseUg9SnDrfAirNqeL6LWX5DhFXF4RpQQprQNR',
        verifier: [],
        proof: {}
    }
    const DID_KEY = 'did:key:z6MkwC8aK5KwHn9ou4iX9AxF2YbGS8ecjhfxezV73NzDnWPV'

    const DID_ETHR = 'did:ethr:maticmum:0x04387be6C18CC83FA256f4888aFEF8445eEB0eD7'

    const DID_DOC = {
        didDocumentMetadata: {},
        didResolutionMetadata: { contentType: 'application/did+ld+json' },
        didDocument: {
        }
    }
    let oneResolver: Resolver
    let combinedResolver: Resolver

    beforeAll (async () => {
        const keyMethod = new KeyDIDMethod()
        const ethrMethod = new EthrDIDMethod({
            name: 'maticmum',
            rpcUrl: 'https://rpc-mumbai.maticvigil.com/', 
            registry: "0x41D788c9c5D335362D713152F407692c5EEAfAae"})

        oneResolver = getSupportedResolvers([keyMethod])
        combinedResolver = getSupportedResolvers([keyMethod, ethrMethod])
    })

    it('Succeeds verifying VC JWT, did:key', async () => {
        const res = await verifyCredentialJWT(VC_PAYLOAD_JWT_KEY, combinedResolver)
        expect(res).toBeTruthy()
    })
    
    it('Succeeds verifying VC JWT, did:ethr', async () => {
        const res = await verifyCredentialJWT(VC_PAYLOAD_JWT_ETHR, combinedResolver)
        expect(res).toBeTruthy()
    })
    
    it('Succeeds verifying VC JWT with options', async () => {
        const res = await verifyCredentialJWT(VC_PAYLOAD_JWT_KEY_OPTIONS, combinedResolver, {
            policies : {
                format: true
            }
        })
        expect(res).toBeTruthy()
    })
    
    it('Succeeds verifying VC JWT with date options', async () => {
        const res = await verifyCredentialJWT(VC_PAYLOAD_JWT_KEY_OPTIONS, combinedResolver, {
            policies: {
                issuanceDate: true,
                expirationDate: true
            } 
        })
        expect(res).toBeTruthy()
    })

    it('Throws error verifying VC JWT with date options, invalid expiration', async () => {
        await expect(verifyCredentialJWT(VC_PAYLOAD_JWT_KEY_EXP, combinedResolver, {
            policies: {
                issuanceDate: true,
                expirationDate: true
            } 
        })).rejects.toThrowError(Error)     
    })

    // it('Throws error verifying VC JWT with date options, no expiration', async () => {
    //     await expect(verifyCredentialJWT(VC_PAYLOAD_JWT_KEY, combinedResolver, {
    //         policies: {
    //             issuanceDate: true,
    //             expirationDate: true
    //         } 
    //     })).rejects.toThrowError(Error)     
    // })
    
    it('Fails to verify VC JWT, missing resolver', async () => {
        await expect(verifyCredentialJWT(VC_PAYLOAD_JWT_ETHR, oneResolver))
            .rejects.toThrowError(Error)
    })
    
    it('Fails to verify VC JWT, not jwt', async () => {
        await expect(verifyCredentialJWT(VC_PAYLOAD_OBJECT, combinedResolver))
            .rejects.toThrowError(TypeError)
    })
    
    it('Succeeds verifying VP JWT, did:key', async () => {
        const res = await verifyPresentationJWT(VP_PAYLOAD_JWT_KEY, combinedResolver)
        expect(res).toBeTruthy()
    })
    
    it('Succeeds verifying VP JWT, did:ethr', async () => {
        const res = await verifyPresentationJWT(VP_PAYLOAD_JWT_ETHR, combinedResolver)
        expect(res).toBeTruthy()
    })
    
    it('Succeeds verifying VP JWT with audience', async () => {
        const res = await verifyPresentationJWT(VP_PAYLOAD_JWT_KEY_AUD, combinedResolver, {
            policies : {
                expirationDate: true,
                issuanceDate: true,
                format: true,
            },
            audience: DID_ETHR
        })
        expect(res).toBeTruthy()
    })

    it('Succeeds rejecting VP JWT with wrong audience', async () => {
        await expect(verifyPresentationJWT(VP_PAYLOAD_JWT_KEY_AUD, combinedResolver, {
            policies : {
                expirationDate: true,
                issuanceDate: true,
                format: true,
            },
            audience: DID_KEY
        })).rejects.toThrowError(Error)
    })
    
    it('Fails to verify VP JWT, missing resolver', async () => {
        expect(verifyPresentationJWT(VP_PAYLOAD_JWT_ETHR, oneResolver))
            .rejects.toThrowError(Error)
    })
    
    it('Fails to verify VC JWT, not jwt', async () => {
        expect(verifyPresentationJWT(VP_PAYLOAD_OBJECT, combinedResolver))
            .rejects.toThrowError(TypeError)
    })
    
    it('Succeeds verifying did:key', async () => {
        const res = await verifyDID(DID_KEY, combinedResolver)
        expect(res).toBeTruthy()
    })
    
    it('Fails verifying did:ethr, no resolver', async () => {
        expect(verifyDID(DID_ETHR, oneResolver))
            .rejects.toThrowError(Error)
    })

    it('Fails verifying empty did', async () => {
        expect(verifyDID('', oneResolver))
            .rejects.toThrowError(DIDMethodFailureError)
    })
    
    it('Succeeds verifying VC DIDs, did:key, jwt', async () => {
        const res = await verifyDIDs(VC_PAYLOAD_JWT_KEY, combinedResolver)
        expect(res).toBeTruthy()
    })
    
    it('Succeeds verifying VC DIDs, did:ethr, jwt', async () => {
        const res = await verifyDIDs(VC_PAYLOAD_JWT_ETHR, combinedResolver)
        expect(res).toBeTruthy()
    })
    
    it('Succeeds verifying VC DIDs, did:key, object', async () => {
        const res = await verifyDIDs(VC_PAYLOAD_OBJECT, combinedResolver)
        expect(res).toBeTruthy()
    })
    
    it('Fails verifying VC DIDs, did:key, object - credSub missing', async () => {
        const res = await verifyDIDs({...VC_PAYLOAD_OBJECT, credentialSubject: {}}, combinedResolver)
        expect(res).toBeFalsy()
    })

    it('Succeeds verifying new did:ethr', async () => {
        combinedResolver.resolve = jest.fn().mockResolvedValueOnce(DID_DOC)
        const res = await verifyDID(DID_ETHR, combinedResolver)
        expect(res).toBeTruthy()
    })

    it('Succeeds verifying updated did:ethr', async () => {
        combinedResolver.resolve = jest.fn().mockResolvedValueOnce({...DID_DOC, didDocumentMetadata:  { versionId: '35961950', updated: '2023-05-23T20:59:17Z' }})
        const res = await verifyDID(DID_ETHR, combinedResolver)
        expect(res).toBeTruthy()
    })

    it('Succeeds verifying deactivated did:ethr', async () => {
        combinedResolver.resolve = jest.fn().mockResolvedValueOnce({...DID_DOC, didDocumentMetadata:  { deactivated: true, versionId: '35961950', updated: '2023-05-23T20:59:17Z' }})
        const res = await verifyDID(DID_ETHR, combinedResolver)
        expect(res).toBeFalsy()
    })
    
    it('Fails verifying VC DIDs, missing issuer', async () => {
        const res = await verifyDIDs({...VC_PAYLOAD_OBJECT, issuer: {id: ''}}, combinedResolver)
        expect(res).toBeFalsy()
    })
    
    it('Fails verifying VC DIDs, missing holder', async () => {
        const res = await verifyDIDs({...VC_PAYLOAD_OBJECT, credentialSubject: {id: ''}}, combinedResolver)
        expect(res).toBeFalsy()
    })

    it('Succeeds verifying VC Revocation, jwt - jti', async () => {
        combinedResolver.resolve = jest.fn().mockResolvedValueOnce(DID_DOC)
        const res = await verifyRevocationStatus(VC_PAYLOAD_JWT_ETHR, combinedResolver)
        expect(res).toBeTruthy()
    })
    
    it('Succeeds verifying VC Revocation, object', async () => {
        combinedResolver.resolve = jest.fn().mockResolvedValueOnce(DID_DOC)
        const res = await verifyRevocationStatus({...VC_PAYLOAD_OBJECT, id: DID_ETHR}, combinedResolver)
        expect(res).toBeTruthy()
    })
    it('Succeeds rejecting empty VC Revocation id, object', async () => {
        const res = await verifyRevocationStatus(VC_PAYLOAD_OBJECT, combinedResolver)
        expect(res).toBeFalsy()
    })
})