import dotenv from 'dotenv';
dotenv.config();

import express, { raw } from 'express';
const app = express();
import cors from 'cors';
import * as nearAPI from 'near-api-js';
import { KeyPair, utils } from 'near-api-js';
const { keyStores } = nearAPI;
const { Contract } = nearAPI;
const myKeyStore = new keyStores.InMemoryKeyStore();



app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: ['https://spearonnear.github.io/SpearHit', 'https://ashikurrahman25.github.io','https://spearonnear.github.io', '*'] }));

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
let contract: nearAPI.Contract;
let account: nearAPI.Account;

const setup = async () => {

  console.log("setup");
  const PRIVATE_KEY = "ed25519:5Rn4YVZ2s1BtCgHJ2AGzGGQcs9rdkPipo4KPhR99pmtcE9unvS5LnM4eDU5kKT6KmEouqocvnpVsLRfh7ZCcXuku"; // Directly use the private key
  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  await myKeyStore.setKey('testnet', 'sptreasurer.testnet', keyPair);
  
  const near = await connect(
    testConfig
  );


  account = await near.account("sptreasurer.testnet");
  const methodOptions = {
    viewMethods: [''],
    changeMethods: [`send_ft_to_user`],
    useLocalViewExecution: true 
  };

  contract = new Contract(account,"spearpxy.testnet",
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


app.get('/spbl', async (req, res) => {

    const near = await connect(
      testConfig
    );


  const account = await near.account('splaunch.testnet');

  const methodOptions = {
    viewMethods: ['ft_balance_of'],
    changeMethods: [],
    useLocalViewExecution: true 
  };

  contract = new Contract(account,"splaunch.testnet",
  methodOptions
);

  try {
    const { account_id } = req.query;
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

app.post('/claimMock', async (req, res) => {

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


  res.json({ success: true, message: "Successfully claimed reward!",txnLink:`https://testnet.nearblocks.io/txns/${functionCallResult.transaction_outcome.id}` });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/claim', async (req, res) => {

  try {

    console.log(req.body)
    const { recipient, amount } = req.body;


    if (!recipient) {
      return res.status(400).json({ error: 'Missing "greeting" in the request body.' });
    }

      

    const functionCallResult = await account.functionCall({
      contractId: 'spearpxy.testnet',
      methodName: 'send_ft_to_user',
      args: {
        recipient,
        amount,
      },
      gas: BigInt (100000000000000), // attached GAS (optional)
      attachedDeposit: BigInt(1) // attached deposit in yoctoNEAR (optional)
    });


    function isFailureStatus(status: any): status is { Failure: any } {
      return status && typeof status === 'object' && 'Failure' in status;
    }
    
    function isSuccessStatus(status: any): status is { SuccessValue: any } {
      return status && typeof status === 'object' && 'SuccessValue' in status;
    }

    function stringifyWithDepth(obj:any, depth = 5) {
      return JSON.stringify(obj, (key, value) => (depth && typeof value === 'object' && value !== null) ? {...value, depth: depth - 1} : value, 2);
    }
    
    function getExecutionError(error: any): string | null {
      if (error && error.ActionError && error.ActionError.kind && error.ActionError.kind.FunctionCallError) {
        return error.ActionError.kind.FunctionCallError.ExecutionError || null;
      }
      return null;
    }

    // Check for overall transaction success
    if (isSuccessStatus(functionCallResult.status)) {
      // console.log('Transaction succeeded:', functionCallResult.status.SuccessValue);
    } else {
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
          } else {
            console.error('Detailed error info:', outcomeStatus.Failure);
          }
        } else if (isSuccessStatus(outcomeStatus)) {
          // console.log('Receipt outcome succeeded:', outcomeStatus.SuccessValue);
        } else {
          // console.log('Receipt outcome status:', outcomeStatus);
        }
      });
    }

    let result:any;
    if(status === 'success'){
      result ={ success: true, message: "Successfully claimed reward!",txnLink:`https://testnet.nearblocks.io/txns/${functionCallResult.transaction_outcome.id}` }
    }
    else{
      result = { success: false, message: exception ,txnLink:`null`}
    }
  res.json(result);

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
