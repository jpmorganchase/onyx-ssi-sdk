import { ValidationError } from "jsonschema";
import { AxiosRequestFailureError, JsonParseError, ReadFileJsonFailureError, SchemaValidationFailureError } from "../../../src/errors";
import { SchemaManager } from "../../../src/services/common";
import { HelperUtils } from "../../../src/utils";

describe('schema utilities', () => {

    it('Successfully retrieves schema spec', async () => {
        HelperUtils.axiosHelper = jest.fn().mockResolvedValueOnce({data: sampleDraft})
        const result = await SchemaManager.getSchemaSpec(nameSchema)
        
        expect(result).toBeTruthy()
        expect(result).toBeDefined()
        expect(HelperUtils.axiosHelper).toBeCalledTimes(1)
    })

    it('Successfully retrieves schema spec from string', async () => {
        HelperUtils.axiosHelper= jest.fn().mockResolvedValueOnce({data: JSON.stringify(sampleDraft)})
        const result = await SchemaManager.getSchemaSpec(nameSchema)
        
        expect(result).toBeTruthy()
        expect(result).toBeDefined()
        expect(HelperUtils.axiosHelper).toBeCalledTimes(1)
    })

    it('Fails retrieving schema spec from failed axios call', async () => {
        HelperUtils.axiosHelper = jest.fn().mockRejectedValueOnce(new AxiosRequestFailureError(''))
        await expect(SchemaManager.getSchemaSpec(nameSchema))
            .rejects.toThrowError(AxiosRequestFailureError)
        
        expect(HelperUtils.axiosHelper).toBeCalledTimes(1)
    })

    it('Fails retrieving schema spec from string as invalid json', async () => {
        HelperUtils.axiosHelper = jest.fn().mockResolvedValueOnce('badjson')
        await expect(SchemaManager.getSchemaSpec(nameSchema))
            .rejects.toThrowError(JsonParseError)
        
        expect(HelperUtils.axiosHelper).toBeCalledTimes(1)
    })

    it('Fails retrieving schema spec if no schema defined', async () => {
        await expect(SchemaManager.getSchemaSpec({...nameSchema, "$schema":""}))
            .rejects.toThrowError(ReferenceError)
    })

    it('Validation of schema succeeds', async () => {
        HelperUtils.axiosHelper = jest.fn().mockResolvedValueOnce({data: sampleDraft})
        const result = await SchemaManager.validateSchema(nameSchema)

        expect(result).toBeTruthy()
    })

    it('Successfully retrieves schema from remote location', async () => {
        HelperUtils.axiosHelper = jest.fn().mockResolvedValueOnce(nameSchema)
        SchemaManager.validateSchema = jest.fn().mockResolvedValueOnce(true)
        const result = await SchemaManager.getSchemaRemote('')
        
        expect(result).toBeTruthy()
        expect(result).toBeDefined()
        expect(result).toEqual(nameSchema)
        expect(HelperUtils.axiosHelper).toBeCalledTimes(1)
    })

    it('Schema retrieval from remote location fails from axios error', async () => {
        HelperUtils.axiosHelper = jest.fn().mockRejectedValueOnce(new AxiosRequestFailureError(''))
        SchemaManager.validateSchema = jest.fn().mockResolvedValueOnce(true)
        await expect(SchemaManager.getSchemaRemote(''))
            .rejects.toThrowError(AxiosRequestFailureError)
    })

    it('Schema retrieval from remote location fails from validation error', async () => {
        HelperUtils.axiosHelper = jest.fn().mockResolvedValueOnce(nameSchema)
        SchemaManager.validateSchema = jest.fn().mockResolvedValueOnce(false)
        await expect(SchemaManager.getSchemaRemote(''))
            .rejects.toThrowError(SchemaValidationFailureError)
    })

    it('Successfully retrieves schema from file location', async () => {
        HelperUtils.fileReaderJSON = jest.fn().mockReturnValueOnce(nameSchema)
        SchemaManager.validateSchema = jest.fn().mockResolvedValueOnce(true)
        const result = await SchemaManager.getSchemaFromFile('')
        
        expect(result).toBeTruthy()
        expect(result).toBeDefined()
        expect(result).toEqual(nameSchema)
        expect(HelperUtils.fileReaderJSON).toBeCalledTimes(1)
    })

    it('Schema retrieval from file location fails from file error', async () => {
        HelperUtils.fileReaderJSON = jest.fn().mockRejectedValueOnce(new ReadFileJsonFailureError(''))
        SchemaManager.validateSchema = jest.fn().mockResolvedValueOnce(true)
        await expect(SchemaManager.getSchemaFromFile(''))
            .rejects.toThrowError(ReadFileJsonFailureError)
    })

    it('Schema retrieval from file location fails from validation error', async () => {
        HelperUtils.fileReaderJSON = jest.fn().mockReturnValueOnce(JSON.stringify(nameSchema))
        SchemaManager.validateSchema = jest.fn().mockResolvedValueOnce(false)
        await expect(SchemaManager.getSchemaFromFile(''))
            .rejects.toThrowError(SchemaValidationFailureError)
    })


    it('Successfully validates credential subject from schema', async () => {
        const result = await SchemaManager.validateCredentialSubject(nameCredentialSubject, nameSchema)
        
        expect(result).toBeDefined()
        expect(result).toBeTruthy()  
    })

    it('Rejects a credential subject with additional properties', async () => {

        expect(() => SchemaManager.validateCredentialSubject(
            {...nameCredentialSubject, id: "did:key:123"}, nameSchema))
            .toThrowError(ValidationError)
    })

    //can we test mixing schema draft specs??


    const nameCredentialSubject = {
        name: "Ollie"
    }
    const nameSchema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "required": ["name"],
        "additionalProperties": false,
        "properties": {
            "name": {
                "type": "string"
            }
        }
    }

    const sampleDraft =     {
        '$schema': 'http://json-schema.org/draft-07/schema#',
        '$id': 'http://json-schema.org/draft-07/schema#',
        title: 'Core schema meta-schema',
        definitions: {
            schemaArray: { type: 'array', minItems: 1, items: [Object] },
            nonNegativeInteger: { type: 'integer', minimum: 0 },
            nonNegativeIntegerDefault0: { allOf: [Array] },
            simpleTypes: { enum: [Array] },
            stringArray: { type: 'array', items: [Object], uniqueItems: true, default: [] }
        },
        type: [ 'object', 'boolean' ],
        properties: {
            '$id': { type: 'string', format: 'uri-reference' },
            '$schema': { type: 'string', format: 'uri' },
            '$ref': { type: 'string', format: 'uri-reference' },
            '$comment': { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            default: true,
            readOnly: { type: 'boolean', default: false },
            writeOnly: { type: 'boolean', default: false },
            examples: { type: 'array', items: true },
            multipleOf: { type: 'number', exclusiveMinimum: 0 },
            maximum: { type: 'number' },
            exclusiveMaximum: { type: 'number' },
            minimum: { type: 'number' },
            exclusiveMinimum: { type: 'number' },
            maxLength: { '$ref': '#/definitions/nonNegativeInteger' },
            minLength: { '$ref': '#/definitions/nonNegativeIntegerDefault0' },
            pattern: { type: 'string', format: 'regex' },
            additionalItems: { '$ref': '#' },
            items: { anyOf: [Array], default: true },
            maxItems: { '$ref': '#/definitions/nonNegativeInteger' },
            minItems: { '$ref': '#/definitions/nonNegativeIntegerDefault0' },
            uniqueItems: { type: 'boolean', default: false },
            contains: { '$ref': '#' },
            maxProperties: { '$ref': '#/definitions/nonNegativeInteger' },
            minProperties: { '$ref': '#/definitions/nonNegativeIntegerDefault0' },
            required: { '$ref': '#/definitions/stringArray' },
            additionalProperties: { '$ref': '#' },
            definitions: { type: 'object', additionalProperties: [Object], default: {} },
            properties: { type: 'object', additionalProperties: [Object], default: {} },
            patternProperties: {
                type: 'object',
                additionalProperties: [Object],
                propertyNames: [Object],
                default: {}
            },
            dependencies: { type: 'object', additionalProperties: [Object] },
            propertyNames: { '$ref': '#' },
            const: true,
            enum: { type: 'array', items: true, minItems: 1, uniqueItems: true },
            type: { anyOf: [Array] },
            format: { type: 'string' },
            contentMediaType: { type: 'string' },
            contentEncoding: { type: 'string' },
            if: { '$ref': '#' },
            then: { '$ref': '#' },
            else: { '$ref': '#' },
            allOf: { '$ref': '#/definitions/schemaArray' },
            anyOf: { '$ref': '#/definitions/schemaArray' },
            oneOf: { '$ref': '#/definitions/schemaArray' },
            not: { '$ref': '#' }
        },
        default: true
    }
})