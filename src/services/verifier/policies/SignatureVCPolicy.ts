import { VerifiableCredential } from "did-jwt-vc";
import { VerificationPolicy, VerificationResult } from "../verificationPolicy";
import { Resolvable } from "did-resolver";
import { verifyCredentialJWT } from "../verification";

export class SignatureVCPolicy implements VerificationPolicy {
    resolver: Resolvable
    constructor(didResolver: Resolvable) {
        this.resolver = didResolver
    }
    name = 'Verify Digital Signature of Verifiable Credential'
    
    async verify(vc: VerifiableCredential): Promise<VerificationResult> {
        try {
            return new VerificationResult(await verifyCredentialJWT(vc, this.resolver))
        } catch (err) {
            return new VerificationResult(false, err)
        }
    }
    
}