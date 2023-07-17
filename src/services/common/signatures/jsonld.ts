import { CredentialPayload, CreateCredentialOptions, PresentationPayload, CreatePresentationOptions } from "did-jwt-vc";
import { DIDWithKeys } from "../did/did";
import { SignatureService, } from "./signatures";

export class JSONLDService implements SignatureService {
    async signVC(_keys: DIDWithKeys, _token: CredentialPayload, _configs?: CreateCredentialOptions | undefined): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async signVP(_keys: DIDWithKeys, _token: PresentationPayload, _configs?: CreatePresentationOptions | undefined): Promise<string> {
        throw new Error("Method not implemented.");
    }
    
    name = 'jsonld'

}

