/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/?(*.)+(spec|test).[jt]s?(x)'],
    testPathIgnorePatterns: ["hardhat"],
    testTimeout: 60000,
    coverageReporters: [
        ['lcov', { projectRoot: '../' }],
        'text-summary',
    ],
    transformIgnorePatterns: ["/node_modules/(?!key-did-resolver/)"],
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: './configs/tsconfig.base.json',
            },
        ],
    },
};
