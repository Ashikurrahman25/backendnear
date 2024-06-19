"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const nearAPI = __importStar(require("near-api-js"));
const near_api_js_1 = require("near-api-js");
const { keyStores } = nearAPI;
const { Contract } = nearAPI;
const myKeyStore = new keyStores.InMemoryKeyStore();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cors_1.default)({ origin: ['https://spearonnear.github.io/SpearHit', 'https://ashikurrahman25.github.io', 'https://spearonnear.github.io', '*'] }));
const { connect } = nearAPI;
const testConfig = {
    keyStore: myKeyStore, // first create a key store
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://testnet.mynearwallet.com/',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
};
const mainConfig = {
    keyStore: myKeyStore, // first create a key store
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://wallet.mainnet.near.org',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
};
//ed25519:5Rn4YVZ2s1BtCgHJ2AGzGGQcs9rdkPipo4KPhR99pmtcE9unvS5LnM4eDU5kKT6KmEouqocvnpVsLRfh7ZCcXuku --> Tresurer
//"account_id":"splaunch.testnet","public_key":"ed25519:5aisAqwijq1segvM9LxABeo9iEGVg8nJKZrn3Pcq8HSX","private_key":"ed25519:UvQcP2QzWxguaqSCpcNJv6tCVL52sBZeySoFHMEsGYgYZ2gzJHnMXe93dGRoSp7vJjLxssvfrx6pEAzP1YvWUoH"
//ed25519:bMc9FpDZqiCzEXovFcPnWjMwggErxboRMiUkmtL4t2EutykFr6ZnHVA6RzgvRF8VuwYpU7141PPqB7HnPjtF1kA
//{"account_id":"spprxy.testnet","public_key":"ed25519:3p4ThHdWbFTytHyJg5AcZ5ysn6BENwZ7MVGAS1Qirdv8","private_key":"ed25519:2ib34o82gCLjg5eoWnLgyBCKLgGyQMUQHi9ggXXJAkaDxG4LC9F68NXxME1mSS1TNPFBu3QQrWjaaeBGmSsbAGTi"}
let contract;
let account;
const setup = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("setup");
    const PRIVATE_KEY = "ed25519:5Rn4YVZ2s1BtCgHJ2AGzGGQcs9rdkPipo4KPhR99pmtcE9unvS5LnM4eDU5kKT6KmEouqocvnpVsLRfh7ZCcXuku"; // Directly use the private key
    const keyPair = near_api_js_1.KeyPair.fromString(PRIVATE_KEY);
    yield myKeyStore.setKey('testnet', 'sptreasurer.testnet', keyPair);
    const near = yield connect(testConfig);
    account = yield near.account("sptreasurer.testnet");
    const methodOptions = {
        viewMethods: [''],
        changeMethods: [`send_ft_to_user`],
        useLocalViewExecution: true
    };
    contract = new Contract(account, "spearpxy.testnet", methodOptions);
    console.log("Setup Done");
    return near;
});
setup();
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('Hello World');
}));
app.get('/balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletId } = req.query;
        const near = yield setup();
        const account = yield near.account(walletId);
        const _bal = yield account.getAccountBalance();
        const balance = (Number(_bal.total) / Math.pow(10, 24)).toFixed(2);
        res.json({ balance });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}));
app.get('/spbl', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const near = yield connect(testConfig);
    const account = yield near.account('splaunch.testnet');
    const methodOptions = {
        viewMethods: ['ft_balance_of'],
        changeMethods: [],
        useLocalViewExecution: true
    };
    contract = new Contract(account, "splaunch.testnet", methodOptions);
    try {
        const { account_id } = req.query;
        console.log(account_id);
        const _bal = yield contract['ft_balance_of']({
            account_id: account_id
        });
        const balance = _bal / Math.pow(10, 8);
        res.json({ balance });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
app.post('/claimMock', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { receiver_id, amount, memo } = req.body;
        if (!receiver_id) {
            return res.status(400).json({ error: 'Missing "greeting" in the request body.' });
        }
        const near = yield connect(testConfig);
        const acc = yield near.account('splaunch.testnet');
        const functionCallResult = yield acc.functionCall({
            contractId: 'splaunch.testnet',
            methodName: 'ft_transfer',
            args: {
                receiver_id,
                amount,
                memo
            },
            gas: BigInt(100000000000000), // attached GAS (optional)
            attachedDeposit: BigInt(1) // attached deposit in yoctoNEAR (optional)
        });
        res.json({ success: true, message: "Successfully claimed reward!", txnLink: `https://testnet.nearblocks.io/txns/${functionCallResult.transaction_outcome.id}` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
app.post('/claim', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { recipient, amount } = req.body;
        if (!recipient) {
            return res.status(400).json({ error: 'Missing "greeting" in the request body.' });
        }
        const functionCallResult = yield account.functionCall({
            contractId: 'spearpxy.testnet',
            methodName: 'send_ft_to_user',
            args: {
                recipient,
                amount,
            },
            gas: BigInt(100000000000000), // attached GAS (optional)
            attachedDeposit: BigInt(1) // attached deposit in yoctoNEAR (optional)
        });
        function isFailureStatus(status) {
            return status && typeof status === 'object' && 'Failure' in status;
        }
        function isSuccessStatus(status) {
            return status && typeof status === 'object' && 'SuccessValue' in status;
        }
        function stringifyWithDepth(obj, depth = 5) {
            return JSON.stringify(obj, (key, value) => (depth && typeof value === 'object' && value !== null) ? Object.assign(Object.assign({}, value), { depth: depth - 1 }) : value, 2);
        }
        function getExecutionError(error) {
            if (error && error.ActionError && error.ActionError.kind && error.ActionError.kind.FunctionCallError) {
                return error.ActionError.kind.FunctionCallError.ExecutionError || null;
            }
            return null;
        }
        // Check for overall transaction success
        if (isSuccessStatus(functionCallResult.status)) {
            // console.log('Transaction succeeded:', functionCallResult.status.SuccessValue);
        }
        else {
            // console.log('Transaction status:', functionCallResult.status);
        }
        let status = 'success';
        let exception = '';
        if (functionCallResult.receipts_outcome) {
            functionCallResult.receipts_outcome.forEach(outcome => {
                const outcomeStatus = outcome.outcome.status;
                if (isFailureStatus(outcomeStatus)) {
                    status = 'error';
                    // console.error('Transaction failed in outcome:', stringifyWithDepth (outcomeStatus.Failure));
                    // Extract the detailed execution error
                    const executionError = outcomeStatus.Failure.ActionError;
                    exception = executionError;
                    if (executionError) {
                        console.error('Execution error:', executionError);
                    }
                    else {
                        console.error('Detailed error info:', outcomeStatus.Failure);
                    }
                }
                else if (isSuccessStatus(outcomeStatus)) {
                    // console.log('Receipt outcome succeeded:', outcomeStatus.SuccessValue);
                }
                else {
                    // console.log('Receipt outcome status:', outcomeStatus);
                }
            });
        }
        let result;
        if (status === 'success') {
            result = { success: true, message: "Successfully claimed reward!", txnLink: `https://testnet.nearblocks.io/txns/${functionCallResult.transaction_outcome.id}` };
        }
        else {
            result = { success: false, message: exception, txnLink: `null` };
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
