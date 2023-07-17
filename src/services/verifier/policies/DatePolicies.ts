import { VerifiableCredential } from "did-jwt-vc";
import { VerificationPolicy, VerificationResult } from "../verificationPolicy";
import { verifyExpiry, verifyIssuanceDate } from "../verification";

export class IssueDatePolicy implements VerificationPolicy {
    name = 'Verify Verifiable Credential Issuance Date'
    
    async verify(vc: VerifiableCredential): Promise<VerificationResult> {
        try {
            return new VerificationResult(await verifyIssuanceDate(vc))
        } catch (err) {
            return new VerificationResult(false, err)
        }
    }
}

export class ExpirationDatePolicy implements VerificationPolicy {
    name = 'Verify Verifiable Credential Expiration Date'
    
    async verify(vc: VerifiableCredential): Promise<VerificationResult> {
        try {
            return new VerificationResult(await verifyExpiry(vc))
        } catch (err) {
            return new VerificationResult(false, err)
        }
    }
    
}