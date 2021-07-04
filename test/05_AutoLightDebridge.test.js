const Web3 = require("web3");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS, permit } = require("./utils.spec");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const { MAX_UINT256 } = require("@openzeppelin/test-helpers/src/constants");
const FullAggregator = artifacts.require("FullAggregator");
const LightVerifier = artifacts.require("LightVerifier");
const MockLinkToken = artifacts.require("MockLinkToken");
const MockToken = artifacts.require("MockToken");
const Debridge = artifacts.require("LightDebridge");
const WrappedAsset = artifacts.require("WrappedAsset");
const CallProxy = artifacts.require("CallProxy");
const DefiController = artifacts.require("DefiController");
const WETH9 = artifacts.require("WETH9");
const { toWei, fromWei, toBN } = web3.utils;
const MAX = web3.utils.toTwosComplement(-1);
const Tx = require("ethereumjs-tx");
const bscWeb3 = new Web3(process.env.TEST_BSC_PROVIDER);
const oracleKeys = JSON.parse(process.env.TEST_ORACLE_KEYS);
const bobPrivKey =
  "0x79b2a2a43a1e9f325920f99a720605c9c563c61fb5ae3ebe483f83f1230512d3";

contract("AutoLightDebridge", function([alice, bob, carol, eve, fei, devid]) {
  const reserveAddress = devid;
  before(async function() {
    this.mockToken = await MockToken.new("Link Token", "dLINK", 18, {
      from: alice,
    });
    this.linkToken = await MockLinkToken.new("Link Token", "dLINK", 18, {
      from: alice,
    });
    this.oraclePayment = toWei("0.001");
    this.minConfirmations = 3;
    this.amountThreshold = toWei("1000");
    this.fullAggregatorAddress = "0x72736f8c88bd1e438b05acc28c58ac21c5dc76ce";
    this.aggregatorInstance = new web3.eth.Contract(
      FullAggregator.abi,
      this.fullAggregatorAddress
    );
    this.confirmationThreshold = 5;
    this.excessConfirmations = 3;
    this.lightAggregator = await LightVerifier.new(
      this.minConfirmations,
      this.confirmationThreshold,
      this.excessConfirmations,
      {
        from: alice,
      }
    );
    this.initialOracles = [
      {
        address: alice,
        admin: alice,
      },
      {
        address: bob,
        admin: carol,
      },
      {
        address: carol,
        admin: eve,
      },
      {
        address: eve,
        admin: carol,
      },
      {
        address: fei,
        admin: eve,
      },
      {
        address: devid,
        admin: carol,
      },
    ];
    for (let oracle of this.initialOracles) {
      await this.lightAggregator.addOracle(oracle.address, {
        from: alice,
      });
    }
    this.defiController = await DefiController.new({
      from: alice,
    });
    this.callProxy = await CallProxy.new({
      from: alice,
    });
    const minAmount = toWei("1");
    const maxAmount = toWei("100000000000");
    const fixedFee = toWei("0.00001");
    const transferFee = toWei("0.001");
    const minReserves = toWei("0.2");
    const supportedChainIds = [42];
    const isSupported = true;
    this.weth = await WETH9.new({
      from: alice,
    });
    this.debridge = await deployProxy(Debridge, [
      this.excessConfirmations,
      minAmount,
      maxAmount,
      minReserves,
      this.amountThreshold,
      this.lightAggregator.address,
      this.callProxy.address.toString(),
      supportedChainIds,
      [
        {
          transferFee,
          fixedFee,
          isSupported,
        },
      ],
      this.defiController.address,
    ]);
  });

  context("Test managing assets", () => {
    const isSupported = true;
    it("should add external asset if called by the admin", async function() {
      const tokenAddress = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
      const chainId = 56;
      const minAmount = toWei("100");
      const maxAmount = toWei("100000000000");
      const fixedFee = toWei("0.00001");
      const transferFee = toWei("0.01");
      const amountThreshold = toWei("10000000000000");
      const minReserves = toWei("0.2");
      const supportedChainIds = [42, 3];
      const name = "MUSD";
      const symbol = "Magic Dollar";
      const wrappedAsset = await WrappedAsset.new(
        name,
        symbol,
        alice,
        [this.debridge.address],
        {
          from: alice,
        }
      );
      await this.debridge.addExternalAsset(
        tokenAddress,
        wrappedAsset.address,
        chainId,
        minAmount,
        maxAmount,
        minReserves,
        amountThreshold,
        supportedChainIds,
        [
          {
            transferFee,
            fixedFee,
            isSupported,
          },
          {
            transferFee,
            fixedFee,
            isSupported,
          },
        ],
        {
          from: alice,
        }
      );
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      const debridge = await this.debridge.getDebridge(debridgeId);
      const supportedChainInfo = await this.debridge.getChainIdSupport(
        debridgeId,
        3
      );
      assert.equal(debridge.chainId.toString(), chainId);
      assert.equal(debridge.minAmount.toString(), minAmount);
      assert.equal(debridge.maxAmount.toString(), maxAmount);
      assert.equal(supportedChainInfo.fixedFee.toString(), fixedFee);
      assert.equal(supportedChainInfo.transferFee.toString(), transferFee);
      assert.equal(debridge.collectedFees.toString(), "0");
      assert.equal(debridge.balance.toString(), "0");
      assert.equal(debridge.minReserves.toString(), minReserves);
    });

    it("should add external native asset if called by the admin", async function() {
      const tokenAddress = "0x0000000000000000000000000000000000000000";
      const chainId = 42;
      const minAmount = toWei("0.0001");
      const maxAmount = toWei("100000000000");
      const amountThreshold = toWei("10000000000000");
      const fixedFee = toWei("0.00001");
      const transferFee = toWei("0.01");
      const minReserves = toWei("0.2");
      const supportedChainIds = [42, 3];
      const name = "MUSD";
      const symbol = "Magic Dollar";
      const wrappedAsset = await WrappedAsset.new(
        name,
        symbol,
        alice,
        [this.debridge.address],
        {
          from: alice,
        }
      );
      await this.debridge.addExternalAsset(
        tokenAddress,
        wrappedAsset.address,
        chainId,
        minAmount,
        maxAmount,
        minReserves,
        amountThreshold,
        supportedChainIds,
        [
          {
            transferFee,
            fixedFee,
            isSupported,
          },
          {
            transferFee,
            fixedFee,
            isSupported,
          },
        ],
        {
          from: alice,
        }
      );
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      const debridge = await this.debridge.getDebridge(debridgeId);
      const supportedChainInfo = await this.debridge.getChainIdSupport(
        debridgeId,
        3
      );
      assert.equal(debridge.chainId.toString(), chainId);
      assert.equal(debridge.minAmount.toString(), minAmount);
      assert.equal(debridge.maxAmount.toString(), maxAmount);
      assert.equal(supportedChainInfo.fixedFee.toString(), fixedFee);
      assert.equal(supportedChainInfo.transferFee.toString(), transferFee);
      assert.equal(debridge.collectedFees.toString(), "0");
      assert.equal(debridge.balance.toString(), "0");
      assert.equal(debridge.minReserves.toString(), minReserves);
    });

    it("should add native asset if called by the admin", async function() {
      const tokenAddress = this.mockToken.address;
      const chainId = await this.debridge.chainId();
      const minAmount = toWei("100");
      const maxAmount = toWei("100000000000");
      const amountThreshold = toWei("10000000000000");
      const fixedFee = toWei("0.00001");
      const transferFee = toWei("0.01");
      const minReserves = toWei("0.2");
      const supportedChainIds = [42, 3];
      await this.debridge.addNativeAsset(
        tokenAddress,
        minAmount,
        maxAmount,
        minReserves,
        amountThreshold,
        supportedChainIds,
        [
          {
            transferFee,
            fixedFee,
            isSupported,
          },
          {
            transferFee,
            fixedFee,
            isSupported,
          },
        ],
        {
          from: alice,
        }
      );
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      const debridge = await this.debridge.getDebridge(debridgeId);
      const supportedChainInfo = await this.debridge.getChainIdSupport(
        debridgeId,
        3
      );
      assert.equal(debridge.tokenAddress, tokenAddress);
      assert.equal(debridge.chainId.toString(), chainId);
      assert.equal(debridge.minAmount.toString(), minAmount);
      assert.equal(debridge.maxAmount.toString(), maxAmount);
      assert.equal(supportedChainInfo.fixedFee.toString(), fixedFee);
      assert.equal(supportedChainInfo.transferFee.toString(), transferFee);
      assert.equal(debridge.collectedFees.toString(), "0");
      assert.equal(debridge.balance.toString(), "0");
      assert.equal(debridge.minReserves.toString(), minReserves);
    });

    it("should reject adding external asset if called by the non-admin", async function() {
      await expectRevert(
        this.debridge.addExternalAsset(
          ZERO_ADDRESS,
          ZERO_ADDRESS,
          0,
          0,
          0,
          0,
          0,
          [0],
          [
            {
              transferFee: 0,
              fixedFee: 0,
              isSupported: false,
            },
          ],
          {
            from: bob,
          }
        ),
        "onlyAdmin: bad role"
      );
    });

    it("should reject setting native asset if called by the non-admin", async function() {
      await expectRevert(
        this.debridge.addNativeAsset(
          ZERO_ADDRESS,
          0,
          0,
          0,
          0,
          [0],
          [
            {
              transferFee: 0,
              fixedFee: 0,
              isSupported: false,
            },
          ],
          {
            from: bob,
          }
        ),
        "onlyAdmin: bad role"
      );
    });
  });

  context("Test send method", () => {
    it("should send native tokens from the current chain", async function() {
      const tokenAddress = ZERO_ADDRESS;
      const chainId = await this.debridge.chainId();
      const receiver = bob;
      const amount = toBN(toWei("1"));
      const claimFee = toBN(toWei("0.1"));
      const data = "0x";
      const chainIdTo = 42;
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      const balance = toBN(await web3.eth.getBalance(this.debridge.address));
      const debridge = await this.debridge.getDebridge(debridgeId);
      const supportedChainInfo = await this.debridge.getChainIdSupport(
        debridgeId,
        chainIdTo
      );
      const fees = toBN(supportedChainInfo.transferFee)
        .mul(amount)
        .div(toBN(toWei("1")))
        .add(toBN(supportedChainInfo.fixedFee));
      await this.debridge.autoSend(
        debridgeId,
        receiver,
        amount,
        chainIdTo,
        reserveAddress,
        claimFee,
        data,
        {
          value: amount,
          from: alice,
        }
      );
      const newBalance = toBN(await web3.eth.getBalance(this.debridge.address));
      const newDebridge = await this.debridge.getDebridge(debridgeId);
      assert.equal(balance.add(amount).toString(), newBalance.toString());
      assert.equal(
        debridge.collectedFees.add(fees).toString(),
        newDebridge.collectedFees.toString()
      );
    });

    it("should send ERC20 tokens from the current chain", async function() {
      const tokenAddress = this.mockToken.address;
      const chainId = await this.debridge.chainId();
      const receiver = bob;
      const amount = toBN(toWei("100"));
      const claimFee = toBN(toWei("1"));
      const data = "0x";
      const chainIdTo = 42;
      await this.mockToken.mint(alice, amount, {
        from: alice,
      });
      await this.mockToken.approve(this.debridge.address, amount, {
        from: alice,
      });
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      const balance = toBN(
        await this.mockToken.balanceOf(this.debridge.address)
      );
      const debridge = await this.debridge.getDebridge(debridgeId);
      const supportedChainInfo = await this.debridge.getChainIdSupport(
        debridgeId,
        chainIdTo
      );
      const fees = toBN(supportedChainInfo.transferFee)
        .mul(amount)
        .div(toBN(toWei("1")))
        .add(toBN(supportedChainInfo.fixedFee));
      await this.debridge.autoSend(
        debridgeId,
        receiver,
        amount,
        chainIdTo,
        reserveAddress,
        claimFee,
        data,
        {
          from: alice,
        }
      );
      const newBalance = toBN(
        await this.mockToken.balanceOf(this.debridge.address)
      );
      const newDebridge = await this.debridge.getDebridge(debridgeId);
      assert.equal(balance.add(amount).toString(), newBalance.toString());
      assert.equal(
        debridge.collectedFees.add(fees).toString(),
        newDebridge.collectedFees.toString()
      );
    });

    it("should reject sending too mismatched amount of native tokens", async function() {
      const tokenAddress = ZERO_ADDRESS;
      const receiver = bob;
      const chainId = await this.debridge.chainId();
      const amount = toBN(toWei("1"));
      const claimFee = toBN(toWei("0.1"));
      const data = "0x";
      const chainIdTo = 42;
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      await expectRevert(
        this.debridge.autoSend(
          debridgeId,
          receiver,
          amount,
          chainIdTo,
          reserveAddress,
          claimFee,
          data,
          {
            value: toWei("0.1"),
            from: alice,
          }
        ),
        "send: amount mismatch"
      );
    });

    it("should reject sending too few tokens", async function() {
      const tokenAddress = ZERO_ADDRESS;
      const receiver = bob;
      const chainId = await this.debridge.chainId();
      const amount = toBN(toWei("0.1"));
      const chainIdTo = 42;
      const claimFee = toBN(toWei("0.01"));
      const data = "0x";
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      await expectRevert(
        this.debridge.autoSend(
          debridgeId,
          receiver,
          amount,
          chainIdTo,
          reserveAddress,
          claimFee,
          data,
          {
            value: amount,
            from: alice,
          }
        ),
        "send: amount too low"
      );
    });

    it("should reject sending tokens to unsupported chain", async function() {
      const tokenAddress = ZERO_ADDRESS;
      const receiver = bob;
      const chainId = await this.debridge.chainId();
      const amount = toBN(toWei("1"));
      const claimFee = toBN(toWei("0.1"));
      const data = "0x";
      const chainIdTo = chainId;
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      await expectRevert(
        this.debridge.autoSend(
          debridgeId,
          receiver,
          amount,
          chainIdTo,
          reserveAddress,
          claimFee,
          data,
          {
            value: amount,
            from: alice,
          }
        ),
        "send: wrong targed chain"
      );
    });

    it("should reject sending tokens originated on the other chain", async function() {
      const tokenAddress = ZERO_ADDRESS;
      const receiver = bob;
      const amount = toBN(toWei("1"));
      const claimFee = toBN(toWei("0.1"));
      const data = "0x";
      const chainIdTo = 42;
      const debridgeId = await this.debridge.getDebridgeId(42, tokenAddress);
      await expectRevert(
        this.debridge.autoSend(
          debridgeId,
          receiver,
          amount,
          chainIdTo,
          reserveAddress,
          claimFee,
          data,
          {
            value: amount,
            from: alice,
          }
        ),
        "send: not native chain"
      );
    });
  });

  context("Test mint method", () => {
    let debridgeId;
    const receiver = bob;
    const amount = toBN(toWei("9"));
    const claimFee = toBN(toWei("1"));
    const data = "0x";

    const nonce = 1;
    const tokenAddress = "0x0000000000000000000000000000000000000000";
    const chainId = 42;
    let currentChainId;

    before(async function() {
      debridgeId = await this.debridge.getDebridgeId(chainId, tokenAddress);
      currentChainId = await this.debridge.chainId();
      const submission = await this.debridge.getAutoSubmisionId(
        debridgeId,
        chainId,
        currentChainId,
        amount,
        receiver,
        nonce,
        reserveAddress,
        claimFee,
        data
      );
      this.signatures = [];
      for (let i = 0; i < oracleKeys.length; i++) {
        const oracleKey = oracleKeys[i];
        this.signatures.push(
          (await bscWeb3.eth.accounts.sign(submission, oracleKey)).signature
        );
      }
    });

    it("should mint when the submission is approved", async function() {
      const debridge = await this.debridge.getDebridge(debridgeId);
      const wrappedAsset = await WrappedAsset.at(debridge.tokenAddress);
      const balance = toBN(await wrappedAsset.balanceOf(receiver));
      await this.debridge.autoMint(
        debridgeId,
        chainId,
        receiver,
        amount,
        nonce,
        this.signatures,
        reserveAddress,
        claimFee,
        data,
        {
          from: alice,
        }
      );
      const newBalance = toBN(await wrappedAsset.balanceOf(receiver));
      const submissionId = await this.debridge.getAutoSubmisionId(
        debridgeId,
        chainId,
        currentChainId,
        amount,
        receiver,
        nonce,
        reserveAddress,
        claimFee,
        data
      );
      const isSubmissionUsed = await this.debridge.isSubmissionUsed(
        submissionId
      );
      assert.equal(balance.add(amount).toString(), newBalance.toString());
      assert.ok(isSubmissionUsed);
    });

    it("should reject minting with unconfirmed submission", async function() {
      const nonce = 4;
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      await expectRevert(
        this.debridge.autoMint(
          debridgeId,
          chainId,
          receiver,
          amount,
          nonce,
          [],
          reserveAddress,
          claimFee,
          data,
          {
            from: alice,
          }
        ),
        "autoMint: not confirmed"
      );
    });

    it("should reject minting twice", async function() {
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      await expectRevert(
        this.debridge.autoMint(
          debridgeId,
          chainId,
          receiver,
          amount,
          nonce,
          [],
          reserveAddress,
          claimFee,
          data,
          {
            from: alice,
          }
        ),
        "mint: already used"
      );
    });
  });

  context("Test burn method", () => {
    const claimFee = "9000000000000";
    const data = "0x";

    it("should burning when the amount is suficient", async function() {
      const tokenAddress = "0x0000000000000000000000000000000000000000";
      const chainIdTo = 42;
      const receiver = alice;
      const amount = toBN("999000000000000");
      const debridgeId = await this.debridge.getDebridgeId(
        chainIdTo,
        tokenAddress
      );
      const debridge = await this.debridge.getDebridge(debridgeId);
      const wrappedAsset = await WrappedAsset.at(debridge.tokenAddress);
      const balance = toBN(await wrappedAsset.balanceOf(bob));
      await wrappedAsset.approve(this.debridge.address, amount, {
        from: bob,
      });
      const deadline = MAX_UINT256;
      const signature = await permit(
        wrappedAsset,
        bob,
        this.debridge.address,
        amount,
        deadline,
        bobPrivKey
      );
      await this.debridge.autoBurn(
        debridgeId,
        receiver,
        amount,
        chainIdTo,
        reserveAddress,
        claimFee,
        data,
        deadline,
        signature,
        {
          from: bob,
        }
      );
      const newBalance = toBN(await wrappedAsset.balanceOf(bob));
      assert.equal(balance.sub(amount).toString(), newBalance.toString());
      const newDebridge = await this.debridge.getDebridge(debridgeId);
      const supportedChainInfo = await this.debridge.getChainIdSupport(
        debridgeId,
        chainIdTo
      );
      const fees = toBN(supportedChainInfo.transferFee)
        .mul(amount)
        .div(toBN(toWei("1")))
        .add(toBN(supportedChainInfo.fixedFee));
      assert.equal(
        debridge.collectedFees.add(fees).toString(),
        newDebridge.collectedFees.toString()
      );
    });

    it("should reject burning from current chain", async function() {
      const tokenAddress = ZERO_ADDRESS;
      const chainId = await this.debridge.chainId();
      const receiver = bob;
      const amount = toBN(toWei("1"));
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      const deadline = 0;
      const signature = "0x";
      await expectRevert(
        this.debridge.autoBurn(
          debridgeId,
          receiver,
          amount,
          42,
          reserveAddress,
          claimFee,
          data,
          deadline,
          signature,
          {
            from: alice,
          }
        ),
        "burn: native asset"
      );
    });

    it("should reject burning too few tokens", async function() {
      const tokenAddress = "0x0000000000000000000000000000000000000000";
      const chainId = 42;
      const receiver = bob;
      const amount = toBN("10");
      const debridgeId = await this.debridge.getDebridgeId(
        chainId,
        tokenAddress
      );
      const deadline = 0;
      const signature = "0x";
      await expectRevert(
        this.debridge.autoBurn(
          debridgeId,
          receiver,
          amount,
          chainId,
          reserveAddress,
          claimFee,
          data,
          deadline,
          signature,
          {
            from: alice,
          }
        ),
        "burn: amount too low"
      );
    });
  });

  context("Test claim method", () => {
    const claimFee = toBN(toWei("0.001"));
    const data = "0x";

    const tokenAddress = ZERO_ADDRESS;
    const receiver = bob;
    const amount = toBN(toWei("0.9"));
    const nonce = 4;
    let chainId;
    let chainIdFrom = 87;
    let debridgeId;
    let erc20DebridgeId;

    before(async function() {
      chainId = await this.debridge.chainId();
      debridgeId = await this.debridge.getDebridgeId(chainId, tokenAddress);
      erc20DebridgeId = await this.debridge.getDebridgeId(
        chainId,
        this.mockToken.address
      );
      const curentChainSubmission = await this.debridge.getAutoSubmisionId(
        debridgeId,
        chainIdFrom,
        chainId,
        amount,
        receiver,
        nonce,
        reserveAddress,
        claimFee,
        data
      );
      this.ethSignatures = [];
      for (let i = 0; i < oracleKeys.length; i++) {
        const oracleKey = oracleKeys[i];
        this.ethSignatures.push(
          (await bscWeb3.eth.accounts.sign(curentChainSubmission, oracleKey))
            .signature
        );
      }
      const erc20Submission = await this.debridge.getAutoSubmisionId(
        erc20DebridgeId,
        chainIdFrom,
        chainId,
        amount,
        receiver,
        nonce,
        reserveAddress,
        claimFee,
        data
      );
      this.erc20Signatures = [];
      for (let i = 0; i < oracleKeys.length; i++) {
        const oracleKey = oracleKeys[i];
        this.erc20Signatures.push(
          (await bscWeb3.eth.accounts.sign(erc20Submission, oracleKey))
            .signature
        );
      }
    });

    it("should claim native token when the submission is approved", async function() {
      const debridge = await this.debridge.getDebridge(debridgeId);
      const balance = toBN(await web3.eth.getBalance(receiver));
      await this.debridge.autoClaim(
        debridgeId,
        chainIdFrom,
        receiver,
        amount,
        nonce,
        this.ethSignatures,
        reserveAddress,
        claimFee,
        data,
        {
          from: alice,
        }
      );
      const newBalance = toBN(await web3.eth.getBalance(receiver));
      const submissionId = await this.debridge.getAutoSubmisionId(
        debridgeId,
        chainIdFrom,
        chainId,
        amount,
        receiver,
        nonce,
        reserveAddress,
        claimFee,
        data
      );
      const isSubmissionUsed = await this.debridge.isSubmissionUsed(
        submissionId
      );
      const newDebridge = await this.debridge.getDebridge(debridgeId);
      assert.equal(balance.add(amount).toString(), newBalance.toString());
      assert.equal(
        debridge.collectedFees.toString(),
        newDebridge.collectedFees.toString()
      );
      assert.ok(isSubmissionUsed);
    });

    it("should claim ERC20 when the submission is approved", async function() {
      const debridge = await this.debridge.getDebridge(erc20DebridgeId);
      const balance = toBN(await this.mockToken.balanceOf(receiver));
      await this.debridge.autoClaim(
        erc20DebridgeId,
        chainIdFrom,
        receiver,
        amount,
        nonce,
        this.erc20Signatures,
        reserveAddress,
        claimFee,
        data,
        {
          from: alice,
        }
      );
      const newBalance = toBN(await this.mockToken.balanceOf(receiver));
      const submissionId = await this.debridge.getAutoSubmisionId(
        erc20DebridgeId,
        chainIdFrom,
        chainId,
        amount,
        receiver,
        nonce,
        reserveAddress,
        claimFee,
        data
      );
      const isSubmissionUsed = await this.debridge.isSubmissionUsed(
        submissionId
      );
      const newDebridge = await this.debridge.getDebridge(erc20DebridgeId);
      assert.equal(balance.add(amount).toString(), newBalance.toString());
      assert.equal(
        debridge.collectedFees.toString(),
        newDebridge.collectedFees.toString()
      );
      assert.ok(isSubmissionUsed);
    });

    it("should reject claiming with unconfirmed submission", async function() {
      const nonce = 1;
      await expectRevert(
        this.debridge.autoClaim(
          debridgeId,
          chainIdFrom,
          receiver,
          amount,
          nonce,
          [],
          reserveAddress,
          claimFee,
          data,
          {
            from: alice,
          }
        ),
        "autoClaim: not confirmed"
      );
    });

    it("should reject claiming twice", async function() {
      await expectRevert(
        this.debridge.autoClaim(
          debridgeId,
          chainIdFrom,
          receiver,
          amount,
          nonce,
          [],
          reserveAddress,
          claimFee,
          data,
          {
            from: alice,
          }
        ),
        "claim: already used"
      );
    });
  });
});
