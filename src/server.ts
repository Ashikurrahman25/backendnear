import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();
import cors from 'cors';
import * as nearAPI from 'near-api-js';
const { keyStores } = nearAPI;
const myKeyStore = new keyStores.InMemoryKeyStore();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: ['http://localhost:3000', 'https://nearvidia.com'] }));

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

const setup = async () => {
  const near = await connect(
    testConfig
  );
  return near;
};

app.get('/', async (req, res) => {
  res.send('Hello World');
});

app.get('/balance', async (req, res) => {

  res.header('Access-Control-Allow-Origin', 'https://ashikurrahman25.github.io'); // Allow your specific origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const { walletId } = req.query;
    const near = await setup();
    const account = await near.account(walletId as string);
    const balance = await account.getAccountBalance();
    res.json({ balance });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
