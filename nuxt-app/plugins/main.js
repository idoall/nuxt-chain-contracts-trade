import Vue from 'vue'
import Web3 from 'web3'
import Contract from 'web3-eth-contract'
import ERC20MSHKTokenABI from '~/static/ABI/ERC20MSHKToken.json' // 引入 Truffle 编译后的合约文件
import ERC20MSHKTokenVendorABI from '~/static/ABI/ERC20MSHKTokenVendor.json' // 引入 Truffle 编译后的合约文件
import {
  ethers,utils
} from 'ethers'


function mshk(store) {
  this.store = store;
  this.Web3 = null;
  this.DefaultProvider = null;
  this.Debug = true;
  this.MainChainId = 56;
  // const provider = ethers.providers.getDefaultProvider('ropsten')
  //   this.DefaultProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');;
//   this.Signer = null;
  this.msg = '';
}
// 初始化
mshk.prototype.Init = async function () {
  if (!window.ethereum) {
    console.log('%c Non-Ethereum browser detected. You should consider trying MetaMask!https://metamask.io/download/', 'background: #222; color: #bada55');
    return;
  }
  var obj = this;

  obj.InitEvent();
}

// 初始化所有事件
mshk.prototype.InitEvent = async function () {
  var obj = this;
  obj.InitEthereumEvent();

  // 获取当前网络状态
  await obj.Event_InitEthersNetWork()

  // 获取当前登录用户
  await obj.Event_InitEthersAccount()

  // 更新余额
  await obj.Event_UpdateVendorBalance();
  
  // // 初始化买、卖事件
  await obj.Event_FilterEvent();

  // 初始化代币符号
  await obj.Event_UpdateTokenSymbol();

  // 更新 BNB 价格
  await obj.Event_UpdateBNBPrice();
}

// 连接 MetaMask
mshk.prototype.Event_ConnectMeatMask = async function () {
  var obj = this;

  const provider = obj.getProvider();

  // Use the `eth_requestAccounts` method to trigger metamask signing
  await provider.send("eth_requestAccounts", []);
  
  const chainResponse = await provider.send('eth_chainId',[])
  const chainId = Web3.utils.hexToNumber(chainResponse)
  if (chainId == 56) {
    obj.InitEvent();
  }else{
    try{
      // 切换网络
      const switchEthereumChain = await provider.send('wallet_switchEthereumChain',[{chainId: Web3.utils.numberToHex(56)}])

      console.log('switchEthereumChain',switchEthereumChain)
    } catch (err) {
      if (err.message.indexOf('wallet_addEthereumChain') !== -1) {
        await obj.Event_AddBSCChainToMeatMask()
      }else{
        console.log('wallet_switchEthereumChain Error:', err)
      }
    }
  }
}


// add BSCChain to MetaMask
mshk.prototype.Event_AddBSCChainToMeatMask = async function () {
  var obj = this;

  const provider = obj.getProvider();

  try{
    // Use the `eth_requestAccounts` method to trigger metamask signing
    const result = await provider.send("wallet_addEthereumChain", [{
      chainId: Web3.utils.numberToHex(56), // 目标链ID,根据Ethereum RPC 方法，必须将链的整数 ID 指定为十六进制字符串。
      chainName: 'Binance Smart Chain Mainnet', // 网络名称
      nativeCurrency: { // name使用、symbol和decimals字段 描述链的主网代币
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      },
      rpcUrls: ['https://bsc-dataseed.binance.org'], // 指定一个或多个指向可用于与链通信的 RPC 端点的 URL 节点
      blockExplorerUrls: ['https://www.bscscan.com'] // 一个或多个指向链的区块浏览器网站的 URL
    }]);
    
    console.log('Event_AddBSCChainToMeatMask',result)
  }catch(err){
    console.log('wallet_addEthereumChain Error:',err)
  }
  
}



mshk.prototype.getProvider = function () {
  // 使用指定 JSONRpc
  // var JSONRpcURL = 'http://127.0.0.1:8545'
  // const provider = new ethers.providers.JsonRpcProvider(JSONRpcURL);

  // Web3Provider 包装了一个标准的 Web3 提供程序，这是
  // MetaMask 作为 window.ethereum 注入每个页面的内容
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  
  // 能够名称访问指定网络
  // https://docs.ethers.io/v5/api/providers/#providers--networks
  // const provider = ethers.providers.getDefaultProvider('ropsten')
  return provider
}

// 卖出 Token
mshk.prototype.Event_SellTokens = async function (val) {
  var obj = this;

  const abi = ERC20MSHKTokenVendorABI.abi;
  const vendorContractAddress = obj.store.state.StateAccount.vendorContractAddress;
  const provider = obj.getProvider();

  const signer = await provider.getSigner()
  const vendorContract = new ethers.Contract(vendorContractAddress, abi, signer);

  const sellTx = await vendorContract.connect(signer).sellTokens(utils.parseEther(val));
  if(obj.Debug){
    console.log('SellTokens transaction',sellTx);
  }
  obj.Event_UpdateVendorBalance();  // 更新 Vendor 余额

  // 过滤买、卖Token事件
  obj.Event_FilterEvent();
}

// 买入 Token
mshk.prototype.Event_BuyTokens = async function (val) {
  var obj = this;

  const abi = ERC20MSHKTokenVendorABI.abi;
  const tokenContractAddress = obj.store.state.StateAccount.tokenContractAddress;
  const vendorContractAddress = obj.store.state.StateAccount.vendorContractAddress;
  const provider = obj.getProvider();

  // 获取帐户签名
  const signer = await provider.getSigner()

  // 创建一个合约实例
  const vendorContract = new ethers.Contract(vendorContractAddress, abi, signer);

  // 获取 代币替换比例
  const tokensPerEth = await vendorContract.tokensPerEth();

  // 按比例计算 Token 买入数量
  val = (parseFloat(val)/tokensPerEth).toString()
 
  // 买入 Token
  // const gasPrice = ethers.utils.formatUnits(await provider.getGasPrice(), 'gwei')
  const options = {
    // gasLimit: 1500000, 
    // gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei'),
    value:utils.parseEther(val)
  }
 
  const buyTx = await vendorContract.connect(signer).buyTokens(options)
  if(obj.Debug){
    console.log('BuyTokens transaction',buyTx);
  }
  obj.Event_UpdateVendorBalance();  // 更新 Vendor 余额

  const yourAddress = obj.store.state.StateAccount.account[0];
  const tokenContract = new ethers.Contract(tokenContractAddress, ERC20MSHKTokenABI.abi, signer);
  const approveTx =  await tokenContract.connect(signer).approve(vendorContractAddress,utils.parseEther(val).mul(tokensPerEth))
  if(obj.Debug){
    console.log('BuyToken approve transaction',approveTx);
  }

  const vendorAllowance = await tokenContract.allowance(yourAddress, vendorContract.address);
  if(obj.Debug){
    console.log('BuyToken vendorAllowance',utils.formatEther(vendorAllowance))
  }
  // 过滤买、卖Token事件
  obj.Event_FilterEvent();

}

mshk.prototype.Event_FilterEvent = async function(){
  var obj = this;


  const chainId = obj.store.state.StateAccount.chainId;
  if(chainId!=obj.MainChainId && obj.Debug){
    console.log('Event_FilterEvent chainId ', chainId, ' is not', obj.MainChainId)
    return
  }

  const vendorContractAddress = obj.store.state.StateAccount.vendorContractAddress;
  const provider = obj.getProvider();

  // 获取帐户签名
  const signer = await provider.getSigner()

  // 创建一个合约实例
  const abi = ERC20MSHKTokenVendorABI.abi;
  const vendorContract = new ethers.Contract(vendorContractAddress, abi, signer);


  const blockLastNum = await provider.getBlockNumber()

  var events = [];
  // 过滤事件
  const buyTokenEvent = await vendorContract.queryFilter(vendorContract.filters.BuyTokens(), blockLastNum-5000, blockLastNum)
  buyTokenEvent.forEach(v => {
    events.push({
      event:v.event,
      blockHash: v.blockHash,
      blockNumber: v.blockNumber,
      account: v.args.buyer,
      amountOfETH: ethers.utils.formatUnits(v.args.amountOfETH),
      amountOfTokens: ethers.utils.formatUnits(v.args.amountOfTokens),
    });
  });
  // console.log('buyToken Event', buyTokenEvent)

  // 过滤事件
  const sellTokenEvent = await vendorContract.queryFilter(vendorContract.filters.SellTokens(), blockLastNum-5000, blockLastNum)
  // console.log('sellToken Event', sellTokenEvent)
  sellTokenEvent.forEach(v => {
    events.push({
      event:v.event,
      blockHash: v.blockHash,
      blockNumber: v.blockNumber,
      account: v.args.seller,
      amountOfETH: ethers.utils.formatUnits(v.args.amountOfETH),
      amountOfTokens: ethers.utils.formatUnits(v.args.amountOfTokens),
    });
  });
  events.sort((a, b) => b.blockNumber - a.blockNumber);
  obj.store.commit('StateAccount/addEvents', events) // 全局存储地址
  if(obj.Debug){
    console.log('FilterEvent',events);
  }
}

mshk.prototype.strtodec = function(amount, dec){
  var stringf = ''
  for (var i = 0; i < dec; i++) {
    stringf = stringf + '0'
  }
  return amount + stringf
}

// 更新BNB当前价格
mshk.prototype.Event_UpdateBNBPrice = async function () {
  var obj = this;

  const chainId = obj.store.state.StateAccount.chainId;
  if(chainId!=obj.MainChainId && obj.Debug){
    console.log('Event_UpdateBNBPrice chainId ', chainId, ' is not', obj.MainChainId)
    obj.store.commit('StateAccount/setBNBPrice', {value:0, valueString:0})
    return
  }

  const yourAddress = obj.store.state.StateAccount.account && obj.store.state.StateAccount.account.length!=0?obj.store.state.StateAccount.account[0]:null;

  if(obj.Debug && !yourAddress){
    console.log('Event_UpdateBNBPrice yourAddress is null')
    obj.store.commit('StateAccount/setBNBPrice', {value:0, valueString:0})
    return
  }
  
  // 实例化 Web3
  obj.web3 = new Web3(window.ethereum)
  // 合约的ABI接口
  var aggregatorV3InterfaceABI = [{'inputs': [], 'name': 'decimals', 'outputs': [{'internalType': 'uint8', 'name': '', 'type': 'uint8'}], 'stateMutability': 'view', 'type': 'function'}, {'inputs': [], 'name': 'description', 'outputs': [{'internalType': 'string', 'name': '', 'type': 'string'}], 'stateMutability': 'view', 'type': 'function'}, {'inputs': [{'internalType': 'uint80', 'name': '_roundId', 'type': 'uint80'}], 'name': 'getRoundData', 'outputs': [{'internalType': 'uint80', 'name': 'roundId', 'type': 'uint80'}, {'internalType': 'int256', 'name': 'answer', 'type': 'int256'}, {'internalType': 'uint256', 'name': 'startedAt', 'type': 'uint256'}, {'internalType': 'uint256', 'name': 'updatedAt', 'type': 'uint256'}, {'internalType': 'uint80', 'name': 'answeredInRound', 'type': 'uint80'}], 'stateMutability': 'view', 'type': 'function'}, {'inputs': [], 'name': 'latestRoundData', 'outputs': [{'internalType': 'uint80', 'name': 'roundId', 'type': 'uint80'}, {'internalType': 'int256', 'name': 'answer', 'type': 'int256'}, {'internalType': 'uint256', 'name': 'startedAt', 'type': 'uint256'}, {'internalType': 'uint256', 'name': 'updatedAt', 'type': 'uint256'}, {'internalType': 'uint80', 'name': 'answeredInRound', 'type': 'uint80'}], 'stateMutability': 'view', 'type': 'function'}, {'inputs': [], 'name': 'version', 'outputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}], 'stateMutability': 'view', 'type': 'function'}]

  const provider = obj.getProvider();

  const signer = await provider.getSigner()

  const contract = new ethers.Contract(obj.store.state.StateAccount.BSCCHain_BNBUSDContractAddress, aggregatorV3InterfaceABI, signer);
  const decimals = await contract.decimals()
  const latestRound = await contract.latestRoundData()
  if(obj.Debug){
    console.log('decimals', decimals)
    console.log('latestRound', latestRound)
    console.log('当前价格:' + utils.formatUnits(obj.strtodec(latestRound.answer, 18 - decimals)))
  }
  obj.store.commit('StateAccount/setBNBPrice', {value:latestRound.answer, valueString:utils.formatUnits(obj.strtodec(latestRound.answer, 18 - decimals))}) // 全局存储地址
}

// 更新 Vendor 余额
mshk.prototype.Event_UpdateVendorBalance = async function () {
  var obj = this;

  
  const chainId = obj.store.state.StateAccount.chainId;
  if(chainId!=obj.MainChainId && obj.Debug){
    obj.store.commit('StateAccount/setVendorTokenAmount', 0);
    obj.store.commit('StateAccount/setVendorETHTokenAmount', 0);
    obj.store.commit('StateAccount/setYourTokenAmount', 0);
    console.log('Event_UpdateVendorBalance chainId ', chainId, ' is not', obj.MainChainId)
    return
  }

  const abi = ERC20MSHKTokenABI.abi;
  const tokenContractAddress = obj.store.state.StateAccount.tokenContractAddress;
  const vendorContractAddress = obj.store.state.StateAccount.vendorContractAddress;
  const yourAddress = obj.store.state.StateAccount.account && obj.store.state.StateAccount.account.length!=0?obj.store.state.StateAccount.account[0]:null;

  if(obj.Debug && !yourAddress){
    obj.store.commit('StateAccount/setVendorTokenAmount', 0);
    obj.store.commit('StateAccount/setVendorETHTokenAmount', 0);
    obj.store.commit('StateAccount/setYourTokenAmount', 0);
    console.log('Event_UpdateVendorBalance yourAddress is null')
    return
  }

  const provider = obj.getProvider();
  const tokenContract = new ethers.Contract(tokenContractAddress, abi, provider);


  const vendorTokenBalance = await tokenContract.balanceOf(vendorContractAddress);
  obj.store.commit('StateAccount/setVendorTokenAmount', vendorTokenBalance) // 全局存储地址
  if(obj.Debug){
    console.log('vendor Token Balance',ethers.utils.formatUnits(vendorTokenBalance,'wei'))
  }

  const vendorETHTokenBalance = await provider.getBalance(vendorContractAddress);
  obj.store.commit('StateAccount/setVendorETHTokenAmount', vendorETHTokenBalance) // 全局存储地址
  if(obj.Debug){
    console.log('vendor ETH Token Balance',ethers.utils.formatUnits(vendorETHTokenBalance,'wei'))
  }


  const yourTokenBalance = await tokenContract.balanceOf(yourAddress);
  obj.store.commit('StateAccount/setYourTokenAmount', yourTokenBalance) // 全局存储地址
  if(obj.Debug){
    console.log('your Token Balance',ethers.utils.formatUnits(yourTokenBalance,'wei'))
  }
}


// 更新 TokenSymbl
mshk.prototype.Event_UpdateTokenSymbol = async function () {
  var obj = this;

  const chainId = obj.store.state.StateAccount.chainId;
  if(chainId!=obj.MainChainId && obj.Debug){
    console.log('Event_UpdateTokenSymbol chainId ', chainId, ' is not', obj.MainChainId)
    return
  }

  const yourAddress = obj.store.state.StateAccount.account && obj.store.state.StateAccount.account.length!=0?obj.store.state.StateAccount.account[0]:null;

  if(obj.Debug && !yourAddress){
    console.log('Event_UpdateTokenSymbol yourAddress is null')
    return
  }

  const abi = ERC20MSHKTokenABI.abi;
  const tokenContractAddress = obj.store.state.StateAccount.tokenContractAddress;

  const provider = obj.getProvider();
  const tokenContract = new ethers.Contract(tokenContractAddress, abi, provider);
  const tokenSymbol = await tokenContract.symbol();
  obj.store.commit('StateAccount/setTokenSymbol', tokenSymbol) // 全局存储地址
  if(obj.Debug){
    console.log('Token Symbol',tokenSymbol)
  }
}

// 部署合约 使用 ethers
mshk.prototype.Event_DeployContractWithEthers = async function () {
  var obj = this;

  // 使用指定 JSONRpc
  const provider = obj.getProvider();

  // 使用私钥方式，用指定帐号部署
  const privateKey = null;
  // const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  // const wallet = new ethers.Wallet(privateKey, provider)
  // const factory = new ethers.ContractFactory(ERC20MSHKTokenABI.abi, ERC20MSHKTokenABI.bytecode, wallet)

  // 使用当前 metamask 帐号签名方式部署
  // const signer = null;
  const signer = await provider.getSigner()
  const factory = new ethers.ContractFactory(ERC20MSHKTokenABI.abi, ERC20MSHKTokenABI.bytecode, signer)

  // Set gas limit and gas price, using the default provider
  const gasPrice = ethers.utils.formatUnits(await provider.getGasPrice(), 'gwei')
  const options = {gasLimit: 1500000, gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei')}

  // 开始部署
  const tokenContract = await factory.deploy(options)
  try {
    await tokenContract.deployed()
  }catch(err){
    console.log('tokenContract.deployed() Error', err)
    return
  }

  // 全局存储地址
  obj.store.commit('StateAccount/setTokenContractAddress', tokenContract.address)
  if(obj.Debug){
    console.log(`Deployment successful! Contract Address: ${tokenContract.address}`)
  }

  // 调用  vendor 合约
  await obj.Event_DeployVendorContractWithEthers(tokenContract, provider, privateKey, signer)
}

// 部署合约 使用 ethers
mshk.prototype.Event_DeployVendorContractWithEthers = async function (tokenContract, provider, privateKey, signer) {
  var obj = this;

  var wallet;
  var factory
  

  if(privateKey){
    // 使用私钥方式，用指定帐号部署
     wallet = new ethers.Wallet(privateKey, provider)
     factory = new ethers.ContractFactory(ERC20MSHKTokenVendorABI.abi, ERC20MSHKTokenVendorABI.bytecode, wallet)
  }else if(signer){
    // 使用当前 metamask 帐号签名方式部署
    factory = new ethers.ContractFactory(ERC20MSHKTokenVendorABI.abi, ERC20MSHKTokenVendorABI.bytecode, signer)
  }
 
  // Set gas limit and gas price, using the default provider
  const gasPrice = ethers.utils.formatUnits(await provider.getGasPrice(), 'gwei')
  const options = {gasLimit: 1500000, gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei')}

  // 开始部署
  // 部署时带参数参考链接：https://docs.ethers.io/v5/api/contract/contract-factory/#ContractFactory-deploy
  const vendorContract = await factory.deploy(tokenContract.address,options)
  await vendorContract.deployed()

  // 全局存储地址
  obj.store.commit('StateAccount/setVendorContractAddress', vendorContract.address)
  if(obj.Debug){
    console.log(`Deployment successful! Vendor Contract Address: ${vendorContract.address}`)
  }

  // 向交易合约转帐 1000 个代币，所有代币
  // parseUnits("1.0");
  // { BigNumber: "1000000000000000000" }
  await tokenContract.transfer(vendorContract.address, ethers.utils.parseEther('1000'));
  if(obj.Debug){
    console.log("tokenContract transfer vendorContract Token:",ethers.utils.formatEther(ethers.utils.parseEther('1000')))
  }

  // 设置 合约所有者
  const acc = obj.store.state.StateAccount.account[0]
  // const acc = wallet.address
  await vendorContract.transferOwnership(acc);
  if(obj.Debug){
    console.log("vendorContract transferOwnership:",acc)
  }
}

// 部署合约 使用 web3
mshk.prototype.Event_DeployContractWithWeb3 = function () {
  var obj = this;

  var account = obj.store.state.StateAccount.account[0]

  var JSONRpcURL = 'ws://127.0.0.1:8545'
  Contract.setProvider(JSONRpcURL)
  var contract = new Contract(ERC20MSHKTokenABI.abi, account)
  contract.options.data = ERC20MSHKTokenABI.deployedBytecode
  contract.deploy({
      data: ERC20MSHKTokenABI.bytecode // 合约的字节码
    })
    .send({
      from: account, // 交易的发送地址
      gas: 1500000, // 交易提供的最大 Gas
      gasPrice: '30000000000000' // 用于此交易的以 wei 为单位的 gas 价格
    })
    .on('error', function (error) { // 如果在发送过程中发生错误，则触发。
      console.log('contract error:',error)
    })
    .on('transactionHash', function (transactionHash) { // 当交易哈希可用时触发。
      // console.log('contract transactionHash',transactionHash)
    })
    .on('receipt', function (receipt) { // 当交易收据可用时触发。来自合约的收据将没有属性，而是具有事件名称作为键和事件作为属性的属性。
    //   outMsg.push('Transaction:' + receipt.transactionHash) // 交易哈希
    //   outMsg.push('Contract created:' + receipt.contractAddress) // 合约创建的地址
    //   outMsg.push('Gas usage:' + receipt.gasUsed) // 使用的Gas
    //   outMsg.push('Block number:' + receipt.blockNumber) // 区块
    //   console.log(outMsg.join('<br/ >'))
        // console.log('contract receipt',receipt)
        const contractAddress = receipt.contractAddress
        obj.store.commit('StateAccount/setTokenContractAddress', contractAddress)
        if(obj.Debug){
          console.log('Event_DeployContract setTokenContractAddress:', contractAddress)
        }

        // 部署 Vendor 合约
        obj.Event_DeployVendorContractWithWeb3(JSONRpcURL, contractAddress)
    }).then(function (newContractInstance) {
      // obj.NewContract = newContractInstance // instance with the new contract address
      // console.log("contract newContractInstance._address", newContractInstance._address)

      
    })
}

// 部署 Vendor 合约  使用 web3
mshk.prototype.Event_DeployVendorContractWithWeb3 = function (provider,tokenAddress) {
    var obj = this;
    
    var account = obj.store.state.StateAccount.account[0]

    Contract.setProvider(provider)
    var contract = new Contract(ERC20MSHKTokenVendorABI.abi, tokenAddress)
    contract.options.data = ERC20MSHKTokenVendorABI.deployedBytecode
    contract.deploy({
        data: ERC20MSHKTokenVendorABI.bytecode,// 合约的字节码
        arguments:[tokenAddress] // 传递 Vendor 合约需要的参数
      })
      .send({
        from: account, // 交易的发送地址
        gas: 1500000, // 交易提供的最大 Gas
        gasPrice: '30000000000000' // 用于此交易的以 wei 为单位的 gas 价格
      })
      .on('error', function (error) { // 如果在发送过程中发生错误，则触发。
        console.log('contractVendor error:',error)
      })
      .on('transactionHash', function (transactionHash) { // 当交易哈希可用时触发。
        // console.log('contractVendor transactionHash',transactionHash)
      })
      .on('receipt', function (receipt) { // 当交易收据可用时触发。来自合约的收据将没有属性，而是具有事件名称作为键和事件作为属性的属性。
      //   outMsg.push('Transaction:' + receipt.transactionHash) // 交易哈希
      //   outMsg.push('Contract created:' + receipt.contractAddress) // 合约创建的地址
      //   outMsg.push('Gas usage:' + receipt.gasUsed) // 使用的Gas
      //   outMsg.push('Block number:' + receipt.blockNumber) // 区块
      //   console.log(outMsg.join('<br/ >'))
        // console.log('contractVendor receipt',receipt)

        obj.store.commit('StateAccount/setVendorContractAddress', receipt.contractAddress)
        if(obj.Debug){
          console.log('Event_DeployVendorContract setVendorContractAddress:', receipt.contractAddress)
        }
      }).then(function (newContractInstance) {
        // obj.NewContract = newContractInstance // instance with the new contract address
        // console.log("contractVendor newContractInstance._address", newContractInstance._address)
      })
  }


// 初始化 Event_InitEthersNetWork 事件
mshk.prototype.Event_InitEthersNetWork = async function () {
  var obj = this;

  const provider = obj.getProvider();
  const netWork = await provider.getNetwork()

  // 更新 netWork
  obj.store.commit('StateAccount/setNetWork', netWork)
  if(obj.Debug){
    console.log('Event_InitEthersNetWork StateAccount/setNetWork:', netWork, 'netWork.chainId',netWork.chainId)
  }
}


// 初始化 Event_InitEthereum 事件
mshk.prototype.Event_InitEthersAccount = async function () {
  var obj = this;
  // 当前钱切换用户时的事件
  const provider = obj.getProvider();
  const accounts = await provider.listAccounts()


  // Use the `eth_requestAccounts` method to trigger metamask signing
  // await provider.send("eth_requestAccounts", []);

  // 帐号变更时，设置帐号状态
  obj.store.commit('StateAccount/setAccount', accounts)
  // obj.store.commit('StateAccount/setAccount', null)
  if(obj.Debug){
    console.log('Event_InitEthersAccount StateAccount/setAccount:',accounts)
  }

}

// 初始化 InitEthereumEvent 事件
mshk.prototype.InitEthereumEvent = function () {
  var obj = this;

  // 当前钱切换用户时的事件
  window.ethereum.on('accountsChanged', (accounts) => {
    // 帐号变更时，设置帐号状态
    obj.store.commit('StateAccount/setAccount', accounts)
    if(obj.Debug){
      console.log('ethereum Event accountsChanged StateAccount/setAccount:', accounts)
    }
    obj.InitEvent();
  })
  window.ethereum.on('chainChanged', (chainId) => {
    obj.store.commit('StateAccount/setChainId', chainId)
    if(obj.Debug){
      console.log('ethereum Event chainChanged StateAccount/setChainId:', chainId)
    }
    obj.InitEvent();
  })
}



export default ({ app, $axios, store, route, redirect }) => {
    Vue.prototype.$MSHK = new mshk(store)
}