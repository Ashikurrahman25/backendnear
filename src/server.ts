import dotenv from 'dotenv';
dotenv.config();

import express, { raw } from 'express';
const app = express();
import cors from 'cors';
import * as nearAPI from 'near-api-js';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers/provider';
import { KeyPair, utils } from 'near-api-js';
const { keyStores } = nearAPI;
const { Contract } = nearAPI;
const myKeyStore = new keyStores.InMemoryKeyStore();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: ['http://localhost:3000', 'https://nearvidia.com', 'http://localhost:52042', 'https://ashikurrahman25.github.io'] }));

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
let contract: nearAPI.Contract;
let account;
const setup = async () => {

  console.log("setup");
  const PRIVATE_KEY = "ed25519:UvQcP2QzWxguaqSCpcNJv6tCVL52sBZeySoFHMEsGYgYZ2gzJHnMXe93dGRoSp7vJjLxssvfrx6pEAzP1YvWUoH"; // Directly use the private key
  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  // console.log('KeyPair:', keyPair); // Debug: print the key pair
  await myKeyStore.setKey('testnet', 'splaunch.testnet', keyPair);
  
  const near = await connect(
    testConfig
  );

  

  const account = await near.account("splaunch.testnet");
  const methodOptions = {
    viewMethods: ['ft_balance_of', 'get_greeting'],
    changeMethods: ['ft_transfer', 'set_greeting'],
    useLocalViewExecution: true 
  };

  contract = new Contract(account,"splaunch.testnet",
  methodOptions
);
console.log("Setup Done");

  return near;


};


 setup();
app.get('/', async (req, res) => {
  res.send('Hello World');
});

app.get('/balance', async (req, res) => {

    res.header('Access-Control-Allow-Origin', '*'); // Allow your specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const { walletId } = req.query;
    const near = await setup();
    const account = await near.account(walletId as string);
    const _bal = await account.getAccountBalance();
    const balance = (Number(_bal.total)/Math.pow(10,24)).toFixed(2);

    res.json({  balance });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

app.get('/get_greeting', async (req, res) => {
  try {
  const greeting = await (contract as any)['get_greeting']()
    res.json({ greeting });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.get('/spearbalance', async (req, res) => {


  res.header('Access-Control-Allow-Origin', '*'); // Allow your specific origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const { account_id } = req.body;
    console.log(account_id)
  const _bal = await (contract as any)['ft_balance_of']({
    account_id:account_id
  })

  const balance = _bal/Math.pow(10,8)

  
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});



app.get('/getAllPlayerPoints', async (req, res) => {
  try {
  const playerPoints = await (contract as any)['getAllPlayerPoints']()
    res.json({ playerPoints });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.post('/set_greeting', async (req, res) => {
  try {

    const { greeting } = req.body;

    if (!greeting) {
      return res.status(400).json({ error: 'Missing "greeting" in the request body.' });
    }

    // Call the contract's set_greeting method
    const result = await (contract as any)['set_greeting']({ greeting });


    console.log(result);

    res.json({ success: true, message: "Successfully updated greeting message!" });

  } catch (error: any) {
    res.status(500).json({ error:"New " + error.message });
  }
});

app.post('/claim', async (req, res) => {


  res.header('Access-Control-Allow-Origin', 'https://ashikurrahman25.github.io'); // Allow your specific origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {

    console.log(req.body)
    const { receiver_id, amount, memo } = req.body;


    if (!receiver_id) {
      return res.status(400).json({ error: 'Missing "greeting" in the request body.' });
    }

      
  const near = await connect(
    testConfig
  );

    const acc = await near.account('splaunch.testnet');
    const functionCallResult = await acc.functionCall({
      contractId: 'splaunch.testnet',
      methodName: 'ft_transfer',
      args: {
        receiver_id,
        amount,
        memo
      },
      gas: BigInt (100000000000000), // attached GAS (optional)
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

  console.log(functionCallResult.transaction_outcome.id)
  res.json({ success: true, message: "Successfully claimed reward!",txnLink:`https://testnet.nearblocks.io/txns/${functionCallResult.transaction_outcome.id}` });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
