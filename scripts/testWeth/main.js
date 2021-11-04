require("dotenv-flow").config();
const { toWei} = require("web3-utils");

const mockWethTestAbi = require("./MockWethTest.json").abi;
const Web3 = require("web3");
// const contractAddress = "0x64f9C81FBe0AcB30Ca12238368c23727f47579e5";
// const contractAddress = "0x9ccc5fAa06fEd1e510ACFA4F593C0a3d63A502cc";//MockWethTestNonUpgradeable
// const contractAddress = "0x71c4D6b1a8Ed90EFFb89d5C72b358714428b5bd3";//Upgradeable without assert
// const contractAddress = "0x22b9EE438d47efe3a7CB3d8bDdD99BFD497CC4aB";//Upgradeable with unwrap gate

// const web3 = new Web3("https://data-seed-prebsc-2-s3.binance.org:8545/");


const contractAddress = "0x22461789BAB725E8C51cc738D78945E2C433B385";
const web3 = new Web3("https://bsc-dataseed.binance.org/");

// const contractAddress = "0x0B7384a37B0098f996Ff5afc35ec4709cD61b3d4";
// const web3 = new Web3("https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");

const senderAddress =  process.env.SENDER_ADDRESS;
const senderKey =  process.env.SENDER_PRIVATE_KEY;

(async () => {
  try {
    //await deposit(toWei("0.0001"));
    await withdraw(toWei("0.00001"));
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

// BSC without assert
// *** Deploying proxy for MockWethTest ***
//         Signer:  0xD40Ebb14A61B7d5691246a6437EeaC5ac7cE4D7e
//         Args:  [ '0xae13d989dac2f0debff460ac112a837c89baa7cd' ]
//         reuseProxy:  true
//         Found deployed proxies:  0
//         No deployed proxies found, deploying a new one
// Waiting 1 block confirmations for tx 0xcced52b49ecd391b7acceff8166791ff568c6c47a605b1ee6a1f86c04942a571 ...
//         Implementation address: 0xBF1D27ab90dAF30D3a9983aa83b8A1B206184890
//         New proxy deployed:  0x64f9C81FBe0AcB30Ca12238368c23727f47579e5




//BSC Without assert
// *** Deploying proxy for MockWethTest ***
//         Signer:  0xD40Ebb14A61B7d5691246a6437EeaC5ac7cE4D7e
//         Args:  [ '0xae13d989dac2f0debff460ac112a837c89baa7cd' ]
//         reuseProxy:  true
//         Found deployed proxies:  0
//         No deployed proxies found, deploying a new one
// Waiting 1 block confirmations for tx 0xcf1a9a763c9539d2074c2fff3dfb1817e34fd0f228aeb3925c01b950ca41ea2b ...
//         Implementation address: 0x02a94609A232da73ce7a2342FD3DEA226Aa980B7
//         New proxy deployed:  0x71c4D6b1a8Ed90EFFb89d5C72b358714428b5bd3


// TEST WITH WETH GATE
// *** Deploying proxy for MockWethTestWithGate ***
//         Signer:  0xD40Ebb14A61B7d5691246a6437EeaC5ac7cE4D7e
//         Args:  [
//   '0xae13d989dac2f0debff460ac112a837c89baa7cd',
//   '0xDcE3016dB5c28752EDBA6a18172d4A6f7917D5b6'
// ]
//         reuseProxy:  true
//         Found deployed proxies:  0
//         No deployed proxies found, deploying a new one
// Waiting 1 block confirmations for tx 0x27932e04d26d31b060bd5fb26becfc6ff65ad71cdcc2eb0fa88e7ec6d341e879 ...
//         Implementation address: 0x873935EA69De2E595692283cA22A12B229829e25
//         New proxy deployed:  0x22b9EE438d47efe3a7CB3d8bDdD99BFD497CC4aB




// BSC MAINNET
// Nothing to compile
// ********************************************************************************
//         Start deploy WethWithdrawProblem contract
//         from DEPLOYER 0x26299C8DE35C172732Fba6a6Af0F2d6E8A0Cd12c
// ********************************************************************************

// *** Deploying proxy for WethWithdrawProblem ***
//         Signer:  0x26299C8DE35C172732Fba6a6Af0F2d6E8A0Cd12c
//         Args:  [ '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' ]
//         reuseProxy:  true
//         Found deployed proxies:  0
//         No deployed proxies found, deploying a new one
// Waiting 1 block confirmations for tx 0xe2f77bdeb7d4a6ddd8498e1a832a9349b6e4d81d9d618b82da56df93289cd7cc ...
//         Implementation address: 0xD8986c8A5aE8bA4257Ca9aEa62995f05C03610e9
//         New proxy deployed:  0x22461789BAB725E8C51cc738D78945E2C433B385