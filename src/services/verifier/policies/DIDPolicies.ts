import { VerifiableCredential } from "did-jwt-vc";
import { VerificationPolicy, VerificationResult } from "../verificationPolicy";
import { Resolvable } from "did-resolver";
import { verifyDIDs } from "../verification";

export class DIDPolicy implements VerificationPolicy {
    resolver: Resolvable
    constructor(didResolver: Resolvable) {
        this.resolver = didResolver
    }
    name = 'Verify Issuer and Holder DIDs of Verifiable Credential'
    
    async verify(vc: VerifiableCredential): Promise<VerificationResult> {
        try {
            return new VerificationResult(await verifyDIDs(vc, this.resolver))
        } catch (err) {
            return new VerificationResult(false, err)
        }
    }
    
}