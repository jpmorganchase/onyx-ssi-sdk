import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            accounts: [
                {
                    privateKey: '0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f',
                    //  address: '0xf3beac30c498d9e26865f34fcaa57dbb935b0d74',
                    //  publicKey: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
                    balance: '1000000000000000000000',
                }]
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.9",
            },
            {
                version: "0.8.6",
            },
            {
                version: "0.8.3",
            },
        ],
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    paths: {
        sources: "./tests/contracts",
        tests: "./tests/hardhat",
        cache: "./tests/cache",
        artifacts: "./tests/artifacts",
    },
    mocha: {
        timeout: 180000, // 3 mins max for running tests
    },
};

export default config;