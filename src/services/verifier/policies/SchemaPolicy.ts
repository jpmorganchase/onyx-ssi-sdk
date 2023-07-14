import { VerifiableCredential } from "did-jwt-vc";
import { VerificationPolicy, VerificationResult } from "../verificationPolicy";
import { verifySchema } from "../verification";

export class SchemaPolicy implements VerificationPolicy {
    isFile: boolean
    name = 'Verify Verifiable Credential Schema Date'
    constructor(isFile: boolean) {
        this.isFile = isFile
    }
    
    async verify(vc: VerifiableCredential): Promise<VerificationResult> {
        try {
            return new VerificationResult(await verifySchema(vc, this.isFile))
        } catch (err) {
            return new VerificationResult(false, err)
        }
    }
}