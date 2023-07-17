
import { validate } from 'jsonschema'
import { SchemaValidationFailureError } from '../../../errors'
import { HelperUtils } from '../../../utils/HelperUtils'

export class SchemaManager {

    /**
     * Reads in a [JSON schema](https://json-schema.org/specification-links.html#draft-7) 
     * for a Verifiable Credential from a remote location
     * 
     * Once retrieved from the remote location, the schema will be validated using `jsonschema`
     * 
     * @param schemaLocation - the remote location of the schema file
     * @returns a `Promise` that resolves to a Verifiable Credential {@link JsonSchema} object.
     * Will throw `SchemaValidationFailureError` if the schema cannot be retrieved or if validation fails
     */
    static async getSchemaRemote(schemaLocation: string): Promise<JsonSchema> {
        const schema = await HelperUtils.axiosHelper(schemaLocation)
        const validated = await this.validateSchema(schema)
        if(!validated) {
            throw new SchemaValidationFailureError('Retrieved Schema failed validation')
        }
        return schema;
        
    }

    /**
     * Reads in a [JSON schema](https://json-schema.org/specification-links.html#draft-7) 
     * for a Verifiable Credential from a local file location
     * 
     * Once retrieved from the location, the schema will be validated using jsonschema
     * 
     * @param schemaLocation - the file path of the schema file
     * @returns a `Promise` that resolves to a Verifiable Credential {@link JsonSchema} object.
     * Will throw an `SchemaValidationFailureError` if schema cannot be retrieved or if valiation fails
     */
    static async getSchemaFromFile(schemaLocation: string): Promise<JsonSchema> {
        const schema = await HelperUtils.fileReaderJSON(schemaLocation) as JsonSchema     
        const validated = await this.validateSchema(schema)
        if(!validated) {
            throw new SchemaValidationFailureError('Retrieved Schema failed validation')
        }
        return schema
    }

    /**
     * Helper function used in validating the JSON schema
     * 
     * Every {@link JsonSchema} defines a `$schema` property that defines the
     * spec for JSON based format used for defining the structure of JSON data
     * This method retrieves the spec to validate the schema against
     * 
     * https://json-schema.org/specification-links.html contains the available drafts
     * Currently in this implementation we use [draft-07](http://json-schema.org/draft-07/schema#)
     * 
     * 
     * @param schema the {@link JsonSchema} containing the schema spec to retrieve
     * @returns a `Promise` resolving to {@link JSON}. 
     * Will throw an Error if no schema property is defined, if the get request fails, or if parsing fails
     */
    static async getSchemaSpec(schema: JsonSchema): Promise<JSON> {
        const schemaUrl = schema['$schema']
        if(!schemaUrl) {
            throw new ReferenceError('$schema not found in provided json')
        }
        const spec = await HelperUtils.axiosHelper(schemaUrl)
        if(typeof spec === 'object') {
            return spec
        }
        return HelperUtils.parseJSON(spec)          
    }

    /**
     * Helper function to validate a JSON schema against its defined spec
     * 
     * First the spec defined in the schema is fetched and `validate` from jsonschema is
     * used to do the schema validation
     * 
     * @param schema The {@link JsonSchema} to be validated
     * @returns a `Promise` that resolves to if the validation succeeded, Error thrown if not
     */
    static async validateSchema(schema: JsonSchema): Promise<boolean> {
        const schemaSpec = await this.getSchemaSpec(schema)
        return validate(schema, schemaSpec, {throwError: true}).valid
    }

    /**
     * Checks if a given [`credentialSubject`](https://www.w3.org/TR/vc-data-model/#credential-subject) 
     * object from a Verifiable Credential conforms to the 
     * [`credentialSchema`](https://www.w3.org/TR/vc-data-model/#data-schemas) defined 
     * in the Verifiable Credential
     * 
     * `validate` from jsonschema is used to do the schema validation
     * 
     * Verifying the `credentialSubject` structure is a check the Verifier can perform
     * to validate a Verifiable Credential
     * 
     * 
     * @param credentialSubject the data object to be validated
     * @param schema the `JsonSchema` that the `credentialSubject` should conform to
     * @returns a `Promise` that resolves to if the validation succeeded. 
     * Throws jsonschema ValidationError if something goes wrong
     */
    static validateCredentialSubject(credentialSubject: object, schema: JsonSchema): boolean {
        return validate(credentialSubject, schema, {throwError: true}).valid
    }
}

/**
 * This is the data model that describes a JSON Schema of a Verifiable Credential
 * This structure is an implementation of the 
 * [JSON Schema spec](https://json-schema.org/specification-links.html#draft-7)
 * 
 */
export interface JsonSchema {
    '$schema': string
    type: string,
    required: string[],
    additionalProperties: boolean,
    properties: {[key: string]: JsonSchemaProperty},
}

/**
 * The data model for describing a property of a JSON Schema
 */
export interface JsonSchemaProperty {
    type: string,
    pattern?: string,
}

/**
 * The data model for the [`credentialSchema`](https://www.w3.org/TR/vc-data-model/#data-schemas) 
 * property of a Verifiable Credential
 * 
 * The `id` is the url pointing to the Json Schema
 * The `type` is the Json Schema spec the Json Schema correpsonds to
 */
export type CredentialSchema = {
    id: string
    type: string
}

/**
 * This defines the default type of CredentialSchema used in Verifiable Credentials
 * Currently it is [JsonSchemaValidator2018](https://datatracker.ietf.org/doc/draft-handrews-json-schema/), 
 * however the W3C is defining a new spec specifically for Verifiable Credential Schemas called 
 * [CredentialSchema2022](https://w3c.github.io/vc-json-schema/)
 */
export const SCHEMA_VALIDATOR = 'JsonSchemaValidator2018'
