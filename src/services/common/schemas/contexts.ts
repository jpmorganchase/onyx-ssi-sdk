import {
    Url,
    Did,
    documentLoaderFactory,
} from '@transmute/jsonld-document-loader';
import axios from 'axios';
import { Resolvable } from 'did-resolver';

/**
 * Manager to provide a method to interpret dids to a json object.
 */
export class ContextManager {
    /**
     * Creates a document loader that is responsible for mapping did contexts to a json object.
     * The document loader will retrieve the associated context from a payload to use to interpret the schema subject.
     *
     * @param didResolver `Resolvable` a did resolver to return the didDoc
     * @returns a document loader function
     */
    createDocumentLoader(didResolver?: Resolvable) {
        // For more information see: https://github.com/transmute-industries/verifiable-data/tree/main/packages/jsonld-document-loader
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let resolvers: any = {
            ['https://']: async (iri: Url) => {
                const { data } = await axios.get(iri);
                return data;
            },
        };

        if (didResolver !== undefined) {
            resolvers = {
                ['did:']: async (did: Did) => {
                    const res = await didResolver.resolve(did);
                    return res.didDocument;
                },
                ...resolvers,
            };
        }

        return documentLoaderFactory.build(resolvers);
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
