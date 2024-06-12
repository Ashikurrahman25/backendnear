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
app.use((0, cors_1.default)({ origin: ['http://localhost:3000', 'https://nearvidia.com'] }));
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
//"account_id":"splaunch.testnet","public_key":"ed25519:5aisAqwijq1segvM9LxABeo9iEGVg8nJKZrn3Pcq8HSX","private_key":"ed25519:UvQcP2QzWxguaqSCpcNJv6tCVL52sBZeySoFHMEsGYgYZ2gzJHnMXe93dGRoSp7vJjLxssvfrx6pEAzP1YvWUoH"
//ed25519:bMc9FpDZqiCzEXovFcPnWjMwggErxboRMiUkmtL4t2EutykFr6ZnHVA6RzgvRF8VuwYpU7141PPqB7HnPjtF1kA
let contract;
let account;
const setup = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("setup");
    const PRIVATE_KEY = "ed25519:UvQcP2QzWxguaqSCpcNJv6tCVL52sBZeySoFHMEsGYgYZ2gzJHnMXe93dGRoSp7vJjLxssvfrx6pEAzP1YvWUoH"; // Directly use the private key
    const keyPair = near_api_js_1.KeyPair.fromString(PRIVATE_KEY);
    // console.log('KeyPair:', keyPair); // Debug: print the key pair
    yield myKeyStore.setKey('testnet', 'splaunch.testnet', keyPair);
    const near = yield connect(testConfig);
    const account = yield near.account("splaunch.testnet");
    const methodOptions = {
        viewMethods: ['ft_balance_of', 'get_greeting'],
        changeMethods: ['ft_transfer', 'set_greeting'],
        useLocalViewExecution: true
    };
    contract = new Contract(account, "splaunch.testnet", methodOptions);
    console.log("Setup Done");
    return near;
});
setup();
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('Hello World');
}));
app.get('/balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header('Access-Control-Allow-Origin', 'https://ashikurrahman25.github.io'); // Allow your specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        const { walletId } = req.query;
        const near = yield setup();
        const account = yield near.account(walletId);
        const balance = yield account.getAccountBalance();
        res.json({ balance });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
}));
app.get('/get_greeting', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const greeting = yield contract['get_greeting']();
        res.json({ greeting });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
app.get('/spearbalance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header('Access-Control-Allow-Origin', 'https://ashikurrahman25.github.io'); // Allow your specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        const { account_id } = req.body;
        console.log(account_id);
        const balance = yield contract['ft_balance_of']({
            account_id: account_id
        });
        res.json({ balance });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
app.get('/getAllPlayerPoints', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playerPoints = yield contract['getAllPlayerPoints']();
        res.json({ playerPoints });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
app.post('/set_greeting', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { greeting } = req.body;
        if (!greeting) {
            return res.status(400).json({ error: 'Missing "greeting" in the request body.' });
        }
        // Call the contract's set_greeting method
        const result = yield contract['set_greeting']({ greeting });
        console.log(result);
        res.json({ success: true, message: "Successfully updated greeting message!" });
    }
    catch (error) {
        res.status(500).json({ error: "New " + error.message });
    }
}));
app.post('/claim', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.header('Access-Control-Allow-Origin', 'https://ashikurrahman25.github.io'); // Allow your specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
        // Call the contract's set_greeting method
        // const result = await (contract as any)['ft_transfer'](
        // {
        //   receiver_id: receiver_id,
        //   amount: amount,
        //   memo:memo
        // }
        // ,"10000000000000"
        // ,"1"
        // );
        // // Extract transaction hash from the function call result
        // const transactionHash = functionCallResult.transaction.hash;
        // // Extract transaction status using the transaction hash
        // const transactionStatus = await near.connection.provider.txStatus(transactionHash, acc.accountId);
        // // Extract and log the contract execution logs
        // const logs = transactionStatus.receipts_outcome.flatMap(outcome => outcome.outcome.logs);
        // // Log the transaction receipt
        // const receipt = transactionStatus.transaction_outcome;
        // return {
        //   logs,
        //   receipt,
        // };
        console.log(functionCallResult.transaction_outcome.id);
        res.json({ success: true, message: "Successfully claimed reward!", txnLink: `https://testnet.nearblocks.io/txns/${functionCallResult.transaction_outcome.id}` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
