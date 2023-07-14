import { DIDWithKeys } from "../did/did";
import { CreateCredentialOptions, CreatePresentationOptions, CredentialPayload, PresentationPayload } from 'did-jwt-vc'

export interface SignatureService {
    name: string;
    signVC(keys: DIDWithKeys, token: CredentialPayload, configs?: CreateCredentialOptions): Promise<string>;
    signVP(keys: DIDWithKeys, token: PresentationPayload, configs?: CreatePresentationOptions): Promise<string>;
}