export const state = () => ({
  account : [],
  signer: null,
  network: null,
  chainId: null,
  ETHChain_ETHUSDContractAddress:'0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  BSCCHain_BNBUSDContractAddress:'0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
  // tokenContractAddress: null, // 主合约地址
  // vendorContractAddress: null, // Vendor 合约地址
  tokenContractAddress: '0x6c20241e181bcD183CB4d01a2582cbD2303d718d', // 主合约地址
  vendorContractAddress: '0x211a15463F48494eaA741f97107Bdd71488c305c', // Vendor 合约地址
  tokenSymbol: '',
  yourTokenAmount: 0,
  vendorTokenAmount: 0,
  vendorETHTokenAmount: 0,
  bnbPrice:0,
  Events:[]
})

export const mutations = {
  addEvents(state, val){
    state.Events = val;
  },
  setBNBPrice(state, val){
    state.bnbPrice = val
  },
  setAccount(state, val){
    state.account = val
  },
  setSigner(state, val){
    state.signer = val
  },
  setNetWork(state, val){
    state.network = val;
    state.chainId = val.chainId;
  },
  setChainId(state, val){
    state.chainId = val
  },
  setTokenSymbol(state, val){
    state.tokenSymbol = val
  },
  setTokenContractAddress(state, val){
    state.tokenContractAddress = val
  },
  setVendorContractAddress(state, val){
    state.vendorContractAddress = val
  },
  setYourTokenAmount(state, val){
    state.yourTokenAmount = val
  },
  setVendorTokenAmount(state, val){
    state.vendorTokenAmount = val
  },
  setVendorETHTokenAmount(state, val){
    state.vendorETHTokenAmount = val
  },
}
