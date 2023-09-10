# Selective Disclosure

Selective disclosure enables a Holder of a Verifiable Credential to choose which pieces of information will be revealed to a Verifier. This gives the Holder more flexibility and enables them to only share the information needed by the recipient without having to claim multiple atomic credentials.

There are different ways of performing selective disclosure with Verifiable Credentials including BBS+ signatures and SD-JWT. In this challenge we would like to explore implementing the SD-JWT spec. However, other selective disclosure implementations are welcome.

**Goal**: Provide support for creating a Verifiable Credential represented as a JWT that supports selective disclosure of claim values conforming to the SD-JWT spec.

## Spec

### SD-JWT

A [Selective Disclosure JSON Web Token (SD-JWT)](https://www.ietf.org/archive/id/draft-ietf-oauth-selective-disclosure-jwt-04.html) is a type of JSON Web Token in which the claims in the body are hashed, making them unreadable without disclosure. 
The original values of the claims can only be revealed by providing the necessary disclosures.

* [Shorter explanation]( https://api-pilot.ebsi.eu/docs/specs/guidelines/selective-disclosure-sd-jwt) of spec from EBSI
* [Reference Implementation](https://github.com/christianpaquin/sd-jwt)

### Functionality to Implement
To complete this challenge, the below should be implemented:
* Functions to support Issuance of SD-JWT Verifiable Credential by an Issuer
* Functions to support Presentation of an SD-JWT Verifiable Credential from the Holder to a Verifier
* Functions to support Verification of an SD-JWT Verifiable Credential by a Verifier

## Where to Start/Implementation Details

Create a new sdjwt.ts file and implement the sd-jwt spec for issuance, presentation, and verification of a selective disclosure Verifiable Credential.

### Issuance of SD-JWT
1. Issuer creates Verifiable Credential as usual
2. Issuer transforms Credential into an SD-JWT
3. Issuer sends SD-JWT and all disclosures to holder

#### Transfomation of VC into SD-JWT
1. all or some of claims transformed into disclosures (salt + attributename + given value)
2. disclosure converted to base64 string
3. disclosure put into hash function
4. the hashed disclosured are what gets included in the SD-JWT in `_sd` jwt field of credentialSubject

Example sd-jwt:
"eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRpZDplYnNpOnp2SFdYMzU5QTNDdmZKbkNZYUFpQWRlI0YwcjVPeXRfbGFodnZ6Nk1XbFlzM21jWU5LWmlpUWRVZnF2OHRzaEhOOXcifQ.eyJpc3MiOiJkaWQ6ZWJzaTp6dkhXWDM1OUEzQ3ZmSm5DWWFBaUFkZSIsInN1YiI6ImRpZDprZXk6ejJkbXpEODFjZ1B4OFZraTdKYnV1TW1GWXJXUGdZb3l0eWtVWjNleXFodDFqOUtic0RiVlpYZGIzanpDYWdFU3lZNEVFMng3WWp4M2dOd2N0b0V1UkNLS0RyZE5QM0hQRnRHOFJUdkJpWVN0VDVnaEJIaEhpekgyRHk2eFF0VzNQZDJTZWNpekw5YjJqekRDTXI3S2E1Y1JBV1pGd3Zxd0F0d1RUN3hldDc2OXk5RVJoNiIsIm5iZiI6IjIwMjMtMDEtMDFUMDA6MDA6MDBaIiwiZXhwIjoiMjAzMy0wMS0wMVQwMDowMDowMFoiLCJqdGkiOiI5YmNjOWFhYS0zYmRjLTQ0MTQtOTQ1MC03MzljMjk1Yzc1MmMiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiXSwiaWQiOiI5YmNjOWFhYS0zYmRjLTQ0MTQtOTQ1MC03MzljMjk1Yzc1MmMiLCJ0eXBlIjpbIlZlcmlmaWFibGVBdHRlc3RhdGlvbiIsIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiU3R1ZGVudElEIl0sImlzc3VlciI6ImRpZDplYnNpOnp2SFdYMzU5QTNDdmZKbkNZYUFpQWRlIiwidmFsaWRGcm9tIjoiMjAyMy0wMS0wMVQwMDowMDowMFoiLCJ2YWxpZFVudGlsIjoiMjAzMy0wMS0wMVQwMDowMDowMFoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDprZXk6ejJkbXpEODFjZ1B4OFZraTdKYnV1TW1GWXJXUGdZb3l0eWtVWjNleXFodDFqOUtic0RiVlpYZGIzanpDYWdFU3lZNEVFMng3WWp4M2dOd2N0b0V1UkNLS0RyZE5QM0hQRnRHOFJUdkJpWVN0VDVnaEJIaEhpekgyRHk2eFF0VzNQZDJTZWNpekw5YjJqekRDTXI3S2E1Y1JBV1pGd3Zxd0F0d1RUN3hldDc2OXk5RVJoNiIsIl9zZCI6WyJ6U21JbVdIUEp6UTdSeDhaRzBJWWhVRjFPemo4ZjE3d0RLSkdoeFVrcmRVIiwiVDRSbkRtMWNsVkxDYXYyTXJzZWw2c05NejhwcUdDZU1ycnBfX1lyVl8tdyIsIlNGUVRqcjkxSWtQaTZiZXRRMEVZczVyZEoyVGJNZXNKR2Z0RjZoN2hqVEEiXSwic3R1ZGVudCI6dHJ1ZX0sImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL2FwaS1waWxvdC5lYnNpLmV1L3RydXN0ZWQtc2NoZW1hcy1yZWdpc3RyeS92Mi9zY2hlbWFzLzB4MjMwMzllNjM1NmVhNmI3MDNjZTY3MmU3Y2ZhYzBiNDI3NjViMTUwZjYzZGY3OGUyYmQxOGFlNzg1Nzg3ZjZhMiIsInR5cGUiOiJGdWxsSnNvblNjaGVtYVZhbGlkYXRvcjIwMjEifSwiX3NkX2FsZyI6InNoYS0yNTYifX0.wC1jmebWUSVQYO18DluQhYUbTXDpvWuBSQv3apiiP3OdHlyPMRmFjX7jWPshjaWQkasuL_DBJ-IQufgDzT8z7Q~WyIyR0xDNDJzS1F2ZUNmR2ZyeU5STjl3IiwgImZhbWlseU5hbWUiLCAiQ2Fycm9sbCJd~WyJlbHVWNU9nM2dTTklJOEVZbnN4QV9BIiwgImdpdmVuTmFtZSIsICJMZXdpcyJd~WyI2SWo3dE0tYTVpVlBHYm9TNXRtdlZBIiwgImJpcnRoRGF0ZSIsICIxODMyLTAxLTI3Il0"

### Presenting a SD-JWT
1. Holder shares the SD-JWT with concatenated disclosures appended to JWT by ~

### Verifying a SD-JWT
1. Verifier receives disclosures and SD-JWT
2. Confirms that shared disclosures are part of SD-JWT by hashing the received disclosures and comparing the hashed values with the values present in SD-JWT

## Testing
The functionality added for this challenge should be unit tested. Tests can be added [here](../../../../tests/unit/signatures)

## Criteria For Completion
* All [functionality](#Functionality-to-Implement) has been implemented
* Code written has corresponding unit tests (90% coverage)
* Code is well documented
* Code passes CI github action (building, linting, and testing of SDK)
