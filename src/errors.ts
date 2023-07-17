export class AxiosRequestFailureError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AxiosRequestFailureError';
        Error.captureStackTrace(this, AxiosRequestFailureError);
    }
}

export class ReadFileJsonFailureError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ReadFileJsonFailureError';
        Error.captureStackTrace(this, ReadFileJsonFailureError);
    }
}

export class SchemaValidationFailureError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SchemaValidationFailureError';
        Error.captureStackTrace(this, SchemaValidationFailureError);
    }
}

export class JsonParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'JsonParseError';
        Error.captureStackTrace(this, JsonParseError);
    }
}

export class DIDMethodFailureError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DIDMethodFailureError';
        Error.captureStackTrace(this, DIDMethodFailureError);
    }
}

export class KeyTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'KeyTypeError';
        Error.captureStackTrace(this, KeyTypeError);
    }
}