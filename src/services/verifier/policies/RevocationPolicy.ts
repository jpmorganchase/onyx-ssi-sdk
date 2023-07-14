import { VerifiableCredential } from "did-jwt-vc";
import { VerificationPolicy, VerificationResult } from "../verificationPolicy";
import { verifyRevocationStatus } from "../verification";
import { Resolvable } from "did-resolver";

export class RevocationPolicy implements VerificationPolicy {
    resolver: Resolvable
    constructor(didResolver: Resolvable) {
        this.resolver = didResolver
    }
    name = 'Verify Verifiable Credential Revocation Status'
    
    async verify(vc: VerifiableCredential): Promise<VerificationResult> {
        try {
            return new VerificationResult(await verifyRevocationStatus(vc, this.resolver))
        } catch (err) {
            return new VerificationResult(false, err)
        }
    }
}