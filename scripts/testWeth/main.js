require("dotenv-flow").config();
const { toWei} = require("web3-utils");

const mockWethTestAbi = require("./MockWethTest.json").abi;
const Web3 = require("web3");
const contractAddress = "0x64f9C81FBe0AcB30Ca12238368c23727f47579e5";
const web3 = new Web3("https://data-seed-prebsc-2-s3.binance.org:8545/");

// const contractAddress = "0x0B7384a37B0098f996Ff5afc35ec4709cD61b3d4";
// const web3 = new Web3("https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");

const senderAddress =  process.env.SENDER_ADDRESS;
const senderKey =  process.env.SENDER_PRIVATE_KEY;

(async () => {
  try {
    //await deposit(toWei("0.01"));
    await withdraw(toWei("0.001"));
  } catch (e) {
    console.log(e);
    // Deal with the fact the chain failed
  }
})();


async function deposit(amount) {
  console.log(`Start deposit: ${amount}`);
  const contractInstance = new web3.eth.Contract(mockWethTestAbi, contractAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const nonce = await web3.eth.getTransactionCount(senderAddress);

  let tx =
  {
    from: senderAddress,
    to: contractAddress,
    gas: 300000,
    value: amount,
    gasPrice: gasPrice,
    nonce,
    //function deposit() public payable
    data: contractInstance.methods
      .deposit()
      .encodeABI(),
  };
  try {
    console.log(JSON.stringify(tx));
  }
  catch (err) { }
  signedTx = await web3.eth.accounts.signTransaction(tx, senderKey);

  console.log(signedTx);

  try {
    console.log(JSON.stringify(signedTx));
  }
  catch (err) { }

  web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .then((tx) => {
      console.log(JSON.stringify(tx));
    })
    .catch((e) => {
      console.error(e);
    });
}



async function withdraw(amount) {
    console.log(`Start withdraw: ${amount}`);
    const contractInstance = new web3.eth.Contract(mockWethTestAbi, contractAddress);
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(senderAddress);

    let tx =
    {
      from: senderAddress,
      to: contractAddress,
      gas: 300000,
      value: 0,
      gasPrice: gasPrice,
      nonce,
      //function withdraw(uint wad) public
      data: contractInstance.methods
        .withdraw(amount)
        .encodeABI(),
    };
    try {
      console.log(JSON.stringify(tx));
    }
    catch (err) { }
    signedTx = await web3.eth.accounts.signTransaction(tx, senderKey);

    console.log(signedTx);

    try {
      console.log(JSON.stringify(signedTx));
    }
    catch (err) { }

    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .then((tx) => {
        console.log(JSON.stringify(tx));
      })
      .catch((e) => {
        console.error(e);
      });
  }



// KOVAN
// *** Deploying proxy for MockWethTest ***
//         Signer:  0xD40Ebb14A61B7d5691246a6437EeaC5ac7cE4D7e
//         Args:  [ '0xd0a1e359811322d97991e03f863a0c30c2cf029c' ]
//         reuseProxy:  true
//         Found deployed proxies:  0
//         No deployed proxies found, deploying a new one
// Waiting 1 block confirmations for tx 0x19ed4fd156d5143c2d45b92577a9ace35258799bffa27fcfe5b1c160b06a84d9 ...
//         Implementation address: 0x4B6C3F0E632D6f2EeBb9A801ED536C0fA6C2dAC7
//         New proxy deployed:  0x0B7384a37B0098f996Ff5afc35ec4709cD61b3d4

// BSC
// *** Deploying proxy for MockWethTest ***
//         Signer:  0xD40Ebb14A61B7d5691246a6437EeaC5ac7cE4D7e
//         Args:  [ '0xae13d989dac2f0debff460ac112a837c89baa7cd' ]
//         reuseProxy:  true
//         Found deployed proxies:  0
//         No deployed proxies found, deploying a new one
// Waiting 1 block confirmations for tx 0xcced52b49ecd391b7acceff8166791ff568c6c47a605b1ee6a1f86c04942a571 ...
//         Implementation address: 0xBF1D27ab90dAF30D3a9983aa83b8A1B206184890
//         New proxy deployed:  0x64f9C81FBe0AcB30Ca12238368c23727f47579e5