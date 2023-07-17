module.exports = {
    env: {
        browser: true,
        es2021: true,
        commonjs: true,
        node: true,
        jest: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    rules: {   
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }
        ],
        "@typescript-eslint/indent": "error"     
    }
}