import { JWTPayload } from 'did-jwt';
import { DIDMethodFailureError } from '../../../src/errors';
import {
    DEFAULT_CONTEXT,
    EthrDIDMethod,
    JWTService,
    KeyDIDMethod,
    PROOF_OF_NAME,
    SCHEMA_VALIDATOR,
    VERIFIABLE_CREDENTIAL,
} from '../../../src/services/common';
import {
    createAndSignCredentialJWT,
    createCredential,
    createCredentialFromSchema,
    revokeCredential,
} from '../../../src/services/issuer/credential';
import { KEY_ALG } from '../../../src/utils';

describe('credential utilities', () => {
    const issuer = {
        did: 'did:ethr:maticmum:0xA765CFD161AA0B6f95cb1DC1d933BFf6FAb0ABeE',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey:
                '027b942c04885bfdcc2497a9a94b2bdf915483cc2c5b5bffd7e86dcf021d731855',
            privateKey:
                '0x40dd06c69267386d198939c64580714e9526cea274f13f76b6b16e431d7caaa9',
        },
    };
    const holder = {
        did: 'did:ethr:maticmum:0x076231A475b8F905f71f45580bD00642025c4e0D',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey:
                '02f034136f204a02045c17f977fa9ac36362fe5a86524b464a56a26cbfb0754e23',
            privateKey:
                '0xd42a4eacb5cf7758ae07e12f3b3971b643b6c78f18972eb5444ffd66e03bac15',
        },
    };
    const vc = {
        did: 'did:ethr:maticmum:0x076231A475b8F905f71f45580bD00642025c4e0D',
        keyPair: {
            algorithm: KEY_ALG.ES256K,
            publicKey:
                '02f034136f204a02045c17f977fa9ac36362fe5a86524b464a56a26cbfb0754e23',
            privateKey:
                '0xd42a4eacb5cf7758ae07e12f3b3971b643b6c78f18972eb5444ffd66e03bac15',
        },
    };

    const subjectData = {
        name: 'Ollie',
    };

    it('Successfully Creates Credential Object', async () => {
        const credential = createCredential(
            issuer.did,
            holder.did,
            subjectData,
            [PROOF_OF_NAME],
        );

        expect(credential).toBeDefined();
        expect(credential['@context']).toEqual([DEFAULT_CONTEXT]);
        expect(credential.type).toEqual([VERIFIABLE_CREDENTIAL, PROOF_OF_NAME]);
        expect(credential.issuer).toEqual({ id: issuer.did });
        expect(credential.credentialSubject).toEqual({
            ...subjectData,
            id: holder.did,
        });
        expect(credential.issuanceDate).toBeDefined();
    });

    it('Successfully Creates Credential Object with additional properties', async () => {
        const additionalParams = {
            id: vc.did,
            credentialStatus: {
                id: 'https://example.edu/status/24',
                type: 'CredentialStatusList2017',
            },
            credentialSchema: {
                id: 'https://example.org/examples/degree.json',
                type: 'JsonSchemaValidator2018',
            },
            expirationDate: '2024-01-01T19:23:24Z',
        };
        const credential = createCredential(
            issuer.did,
            holder.did,
            subjectData,
            [PROOF_OF_NAME],
            additionalParams,
        );

        expect(credential).toBeDefined();
        expect(credential['@context']).toEqual([DEFAULT_CONTEXT]);
        expect(credential.type).toEqual([VERIFIABLE_CREDENTIAL, PROOF_OF_NAME]);
        expect(credential.issuer).toEqual({ id: issuer.did });
        expect(credential.credentialSubject).toEqual({
            ...subjectData,
            id: holder.did,
        });
        expect(credential.issuanceDate).toBeDefined();
        expect(credential.credentialStatus).toBeDefined();
        expect(credential.credentialStatus).toEqual(
            additionalParams.credentialStatus,
        );
        expect(credential.credentialSchema).toBeDefined();
        expect(credential.credentialSchema).toEqual(
            additionalParams.credentialSchema,
        );
        expect(credential.expirationDate).toBeDefined();
        expect(credential.expirationDate).toEqual(
            additionalParams.expirationDate,
        );
        expect(credential.id).toBeDefined();
        expect(credential.id).toEqual(additionalParams.id);
    });

    it('Successfully Creates Credential Object from Schema', async () => {
        const credential = await createCredentialFromSchema(
            'schemaLocation',
            issuer.did,
            holder.did,
            subjectData,
            PROOF_OF_NAME,
        );

        expect(credential).toBeDefined();
        expect(credential['@context']).toEqual([DEFAULT_CONTEXT]);
        expect(credential.type).toEqual([VERIFIABLE_CREDENTIAL, PROOF_OF_NAME]);
        expect(credential.issuer).toEqual({ id: issuer.did });
        expect(credential.credentialSubject).toEqual({
            ...subjectData,
            id: holder.did,
        });
        expect(credential.issuanceDate).toBeDefined();
        expect(credential.credentialSchema).toBeDefined();
        expect(credential.credentialSchema).toEqual({
            id: 'schemaLocation',
            type: SCHEMA_VALIDATOR,
        });
    });

    it('Successfully Creates and Signs VC JWT', async () => {
        const credential = await createAndSignCredentialJWT(
            issuer,
            holder.did,
            subjectData,
            [PROOF_OF_NAME],
        );

        expect(credential).toBeDefined();
        const jwtService = new JWTService();
        const decodedVC = jwtService.decodeJWT(credential);
        expect(decodedVC).toBeDefined();
        expect(decodedVC?.header).toBeDefined();
        expect(decodedVC?.payload).toBeDefined();
        expect(decodedVC?.signature).toBeDefined();
        expect(decodedVC?.header.alg).toEqual(issuer.keyPair.algorithm);
        expect(decodedVC?.header.typ).toEqual(jwtService.name);
        const payload = decodedVC?.payload as JWTPayload;
        expect(payload.vc['@context']).toEqual([DEFAULT_CONTEXT]);
        expect(payload.vc.type).toEqual([VERIFIABLE_CREDENTIAL, PROOF_OF_NAME]);
        expect(payload.vc.credentialSubject).toEqual(subjectData);
        expect(payload.nbf).toBeDefined();
        expect(payload.iss).toEqual(issuer.did);
        expect(payload.sub).toEqual(holder.did);
    });

    it.todo('Successfully creates and signs VC JSON-LD');

    it('Successfully Revokes Credential using DID', async () => {
        const ethrMethod = new EthrDIDMethod({
            registry: '0x',
            name: 'test',
            rpcUrl: 'testurl',
        });
        ethrMethod.deactivate = jest.fn().mockResolvedValueOnce(true);
        const deactivated = await revokeCredential(vc, ethrMethod);
        expect(deactivated).toBeDefined();
        expect(deactivated).toBeTruthy();
    });

    it('Revocation fails when Revocation transaction fails', async () => {
        const ethrMethod = new EthrDIDMethod({
            registry: '0x',
            name: 'test',
            rpcUrl: 'testurl',
        });
        ethrMethod.deactivate = jest
            .fn()
            .mockRejectedValueOnce(
                new DIDMethodFailureError('Error deactivating'),
            );
        await expect(revokeCredential(vc, ethrMethod)).rejects.toThrowError(
            DIDMethodFailureError,
        );
    });

    it('Revocation Fails with did method that doesnt support deactivation', async () => {
        const keyMethod = new KeyDIDMethod();
        const key = await keyMethod.create();
        await expect(revokeCredential(key, keyMethod)).rejects.toThrowError(
            DIDMethodFailureError,
        );
    });
});
