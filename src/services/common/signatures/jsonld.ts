import { CredentialPayload, CreateCredentialOptions, PresentationPayload, CreatePresentationOptions } from "did-jwt-vc";
import { DIDWithKeys } from "../did/did";
import { SignatureService } from "./signatures";
import { Ed25519Signature2018, Ed25519VerificationKey2018 } from "@transmute/ed25519-signature-2018";
import { verifiable } from '@transmute/vc.js'

export class JSONLDService implements SignatureService {
    async signVC(_keys: DIDWithKeys, _token: CredentialPayload, _configs?: CreateCredentialOptions | undefined): Promise<string> {
        const { did, keyPair: keys } = _keys;
        const nim = did.split(':').pop();
        
        const key = await Ed25519VerificationKey2018.from({
            id: `${did}#${nim}`,
            type: "Ed25519VerificationKey2018", // Used for legacy and compability; Ed25519Signature2020 is for greenfield
            controller: did,
            publicKeyBase58: keys.publicKey,
            privateKeyBase58: keys.privateKey
        });

        
        const credential = {
            '@context': _token["@context"],
            id: _token.id,
            type: _token.type,
            issuer: _token.issuer,
            issuanceDate: _token.issuanceDate instanceof Date ? _token.issuanceDate.toISOString() : _token.issuanceDate,
            credentialSubject: _token.credentialSubject,
        }
        
        const vc = await verifiable.credential.create({
            credential,
            format: ["vc"],
            // TODO: Need to write a document Loader see digital bazaar for implementation
            // https://github.com/digitalbazaar/jsonld-signatures/blob/main/lib/documentLoader.js
            documentLoader: (iri) => { 
                return new Promise((resolve) => { resolve({document: {iri: iri }, documentUrl: ""}) })
            }, 
            suite: new Ed25519Signature2018({
                key
            })
        })
        // Stringify the credential for compability between languages 
        // and conform to the SignatureService's function signature
        return JSON.stringify(vc)
        
    }
    async signVP(_keys: DIDWithKeys, _token: PresentationPayload, _configs?: CreatePresentationOptions | undefined): Promise<string> {
        throw new Error("Method not implemented.");
    }
    
    name = 'jsonld'

}