require("dotenv-flow").config();
const { toWei} = require("web3-utils");

const mockWethTestAbi = require("./MockWethTest.json").abi;
const Web3 = require("web3");
// const contractAddress = "0x3b878601A16691800CDebEdBaf266e4ad0972adF";
// const web3 = new Web3("https://data-seed-prebsc-2-s3.binance.org:8545/");

const contractAddress = "0xE89B08dFbeaC29Bcccf54AAA41B9cf5237749e9D";
const web3 = new Web3("https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");

const senderAddress =  process.env.SENDER_ADDRESS;
const senderKey =  process.env.SENDER_PRIVATE_KEY;

(async () => {
  try {
    // await deposit(toWei("0.01"));
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
