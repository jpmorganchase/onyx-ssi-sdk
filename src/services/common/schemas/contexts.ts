import { Url, documentLoaderFactory } from '@transmute/jsonld-document-loader';
import axios from 'axios';

/**
 * Manager to provide a method to interpret dids to a json object.
 */
export class ContextManager {
    /**
     * Creates a document loader that is responsible for mapping did contexts to a json object.
     * The document loader will retrieve the associated context from a payload to use to interpret the schema subject.
     *
     * @returns a document loader function
     */
    createDocumentLoader() {
        // For more information see: https://github.com/transmute-industries/verifiable-data/tree/main/packages/jsonld-document-loader
        return documentLoaderFactory.build({
            ['https://']: async (iri: Url) => {
                const { data } = await axios.get(iri);
                return data;
            },
        });
    }
}

/**
 * Default schema needed to validate a JSON-LD credential properties.
 */
export const DEFAULT_CONTEXT = 'https://www.w3.org/2018/credentials/v1';
/**
 * Uses publicly supported schema. For unique schema, create a new context.
 */
export const SCHEMA_CONTEXT = 'https://schema.org/docs/jsonldcontext.jsonld';
