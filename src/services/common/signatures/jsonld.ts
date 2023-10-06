import axios from 'axios';
import {
    CredentialPayload,
    CreateCredentialOptions,
    PresentationPayload,
    CreatePresentationOptions,
} from 'did-jwt-vc';
import {
    Ed25519Signature2018,
    Ed25519VerificationKey2018,
} from '@transmute/ed25519-signature-2018';
import { verifiable } from '@transmute/vc.js';
import { Url, documentLoaderFactory } from '@transmute/jsonld-document-loader';
import { VerifiableCredential } from '@transmute/vc.js/dist/types/VerifiableCredential';
import { DIDWithKeys } from '../did/did';
import { SignatureService } from './signatures';
import { KEY_ALG, KeyUtils } from '../../../utils';

export class JSONLDService implements SignatureService {
    /**
     *
     * @param keys - `DIDWithKeys` - the DID and the keypair that will sign the token
     * @param token - `CredentialPayload` - the Credential object
     * @param _configs Currently not supported yet.
     * @returns JSON stringified JSON-LD token
     */
    async signVC(
        keys: DIDWithKeys,
        token: CredentialPayload,
        _configs?: CreateCredentialOptions | undefined,
    ): Promise<string> {
        const key = await this.createEd25519VerificationKey(keys);

        const { id, type, issuer, issuanceDate, credentialSubject } = token;

        let credential: VerifiableCredential = {
            '@context': token['@context'],
            type,
            issuer,
            issuanceDate:
                issuanceDate instanceof Date
                    ? issuanceDate.toISOString()
                    : issuanceDate,
            credentialSubject,
        };

        if (id !== undefined) {
            credential = { ...credential, id };
        }

        const documentLoader = this.createDocumentLoader();

        // https://www.npmjs.com/package/@transmute/ed25519-signature-2018
        // https://github.com/transmute-industries/verifiable-data/tree/main/packages/vc.js#transmutevcjs
        const vc = await verifiable.credential.create({
            credential,
            format: ['vc'],
            documentLoader: (iri) => {
                return documentLoader(iri);
            },
            suite: new Ed25519Signature2018({
                key,
            }),
        });

        // Stringify the credential for compability between languages
        // and conform to the SignatureService's function signature

        if (vc.items.length === 0) {
            throw new Error('There are no items found in the credential.');
        }
        return JSON.stringify(vc.items[0]);
    }
    async signVP(
        _keys: DIDWithKeys,
        _token: PresentationPayload,
        _configs?: CreatePresentationOptions | undefined,
    ): Promise<string> {
        // https://github.com/transmute-industries/verifiable-data/tree/main/packages/vc.js#verify-presentation
        throw new Error('Method not implemented.');
    }

    /**
     * Creates a verification key to sign the credential.
     *
     * @param keys `DIDWithKeys` to use in signing the credential.
     * @returns `Ed25519VerificationKey2018` the verification key to sign the credential.
     */
    async createEd25519VerificationKey(
        keys: DIDWithKeys,
    ): Promise<Ed25519VerificationKey2018> {
        const { did, keyPair } = keys;
        const id = did.split(':').pop();

        if (keys.keyPair.algorithm !== KEY_ALG.EdDSA) {
            throw new Error(
                'Key must have EdDSA algorithm to be converted into an Ed25519VerificationKey2018',
            );
        }

        const base58Keys = KeyUtils.encodeToBase58(keyPair);

        return await Ed25519VerificationKey2018.from({
            id: `${did}#${id}`,
            type: 'Ed25519VerificationKey2018', // Used for legacy and compability; Ed25519Signature2020 is for greenfield
            controller: did,
            publicKeyBase58: base58Keys.publicKey,
            privateKeyBase58: base58Keys.privateKey,
        });
    }

    createDocumentLoader() {
        // https://github.com/transmute-industries/verifiable-data/tree/main/packages/jsonld-document-loader
        return documentLoaderFactory.build({
            ['https://']: async (iri: Url) => {
                const { data } = await axios.get(iri);
                return data;
            },
        });
    }

    name = 'jsonld';
}
