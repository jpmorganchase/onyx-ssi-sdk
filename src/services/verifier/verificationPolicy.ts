import { VerifiableCredential } from "did-jwt-vc";
import { VerifiablePresentation } from "did-jwt-vc/src";

export interface VerificationPolicy {
    name: string;
    verify(vc: VerifiableCredential| VerifiablePresentation): Promise<VerificationResult>
}

export class VerificationResult {
    success: boolean
    errors: Error[] = []

    constructor(success, errors?) {
        this.success = success
        this.errors = errors
    }
}