<template>
  <div>
    <b-card title="我的资产">
      <h6 class="card-subtitle text-muted mb-2">Your {{ TokenSymbol }} Token Balance:</h6>
      <b-card-text>{{ YourTokenAmount }}</b-card-text>
<!-- 
      <a href="#" class="card-link btn btn-outline-primary btn-sm">Buy Tokens</a>
      <b-link href="#" class="card-link btn btn-outline-primary btn-sm">Sell Tokens</b-link>
      <b-button variant="btn btn-outline-primary btn-sm" @click="DeployTokens">Deploy Tokens</b-button>
      <b-button variant="btn btn-outline-primary btn-sm" @click="ViewBalance">查看余额</b-button>
      <b-button variant="btn btn-outline-primary btn-sm" @click="UpdateETHPrice">更新ETH价格</b-button>
      <b-button variant="btn btn-outline-primary btn-sm" @click="UpdateEvent">过滤事件</b-button> -->
    </b-card>
    <b-card-group deck class="mt-3">
      <b-card header="Buy Tokens" header-tag="header">
        <b-card-text>
          100 {{ TokenSymbol }} Token = 1 BNB Token
          <b-form-input v-model="buyTokenAmount" :type="'number'" @input="BuyTokenInputChange" placeholder="请输入买入Token数量"></b-form-input>
        </b-card-text>
        <b-button href="#" @click="BuyTokens" variant="primary">Buy Tokens</b-button>
        <br />
        {{ buyTokenAmountTipmsg }}
      </b-card>

      <b-card header-tag="header">
        <template #header>
          <h6 class="mb-0">Sell Tokens</h6>
        </template>
        <b-card-text>
          <b-form-input v-model="sellTokenAmount" :type="'number'" @input="SellTokenInputChange" placeholder="请输入卖出Token数量"></b-form-input>
        </b-card-text>
        <b-button href="#" @click="SellTokens" variant="primary">Sell Tokense</b-button>
        <br />
        {{ sellTokenAmountTipmsg }}
      </b-card>
    </b-card-group>
    <b-card-group deck class="mt-3">

      <b-card>
        <b-card-text>
          <b-list-group>
            <b-list-group-item>Vendor {{ TokenSymbol }} Token Balance:</b-list-group-item>
            <b-list-group-item>{{ VendorTokenAmount }}</b-list-group-item>
            <b-list-group-item>Vendor BNB Token Balance:</b-list-group-item>
            <b-list-group-item>{{ VendorETHTokenAmount }}</b-list-group-item>
          </b-list-group>

        </b-card-text>
      </b-card>
    </b-card-group>

    <div id="paenl">
      <b-row>
        <b-col class="text-left">
          <h5 class="mt-5">Buy/Sell Token Events:</h5>
        </b-col>
      </b-row>
      <b-row class="border-top border-primary">
          <b-col>
            <b-table striped hover :fields="fields" :items="FilterEvents" responsive="sm">
              <template #cell(blockHash)="data">
                <b class="text-info">{{ data.item.blockHash.substring(0,20) }}...</b>
              </template>
              <template #cell(event)="data">
                <div v-if="data.item.event === 'BuyTokens'" class="bg-success text-white">{{ data.item.event }}</div>
                <div v-else-if="data.item.event === 'SellTokens'" class="bg-danger text-white">{{ data.item.event }}</div>
              </template>
               <template #cell(account)="data">
                {{ data.item.account.substring(0, 5) }}...{{ data.item.account.substring(data.item.account.length-5) }}
              </template>
               <template #cell(action)="data">
                 <div v-if="data.item.event === 'BuyTokens'">
                  Buy {{ data.item.amountOfETH }} BNB To Get {{ data.item.amountOfTokens }} {{ TokenSymbol }} Tokens
                </div>
                 <div v-else-if="data.item.event === 'SellTokens'">
                  Sell {{ data.item.amountOfTokens }} {{ TokenSymbol }} Tokens To Get {{ data.item.amountOfETH }} BNB
                </div>
              </template>
            </b-table>
          </b-col>
      </b-row>
    </div>
    <b-modal ref="modal-err" title="Error">{{ ErrMsg }}</b-modal>
  </div>
</template>

<script>
const { utils } = require("ethers");
export default {
  name: 'IndexPage',
  layout: 'layoutWeb3Address',
  data() {
    return {
      fields: [
          // A virtual column that doesn't exist in items
          { key: 'blockHash', label: 'Txn Hash', thClass:'text-center' },
          { key: 'event', label: 'Event', class:'text-center' },
          // A column that needs custom formatting
          { key: 'account', label: 'Account', thClass:'text-center' },
          { key: 'action', label: 'Action', thClass:'text-center' },
        ],
      buyTokenAmount: null,
      buyTokenAmountTipmsg: '',
      sellTokenAmount: null,
      sellTokenAmountTipmsg: '',
      ErrMsg : null,
    }
  },
  // 当其依赖的属性的值发生变化的时，计算属性会重新计算
  computed: {
      YourTokenAmount: function () {
          return utils.formatEther(this.$store.state.StateAccount.yourTokenAmount)
      },
      VendorTokenAmount: function () {
          return utils.formatEther(this.$store.state.StateAccount.vendorTokenAmount)
      },
      VendorETHTokenAmount: function () {
          return utils.formatEther(this.$store.state.StateAccount.vendorETHTokenAmount)
      },
      FilterEvents: function () {
          return this.$store.state.StateAccount.Events
      },
      TokenSymbol: function(){
          return this.$store.state.StateAccount.tokenSymbol
      }
  },
  methods: {
    UpdateEvent(){
      var obj = this.$MSHK;
      obj.Event_FilterEvent();
      obj.Event_UpdateTokenSymbol();
    },
    UpdateETHPrice(){
      var obj = this.$MSHK;
      obj.Event_UpdateBNBPrice()
    },
    BuyTokenInputChange(){
      this.buyTokenAmountTipmsg = '$'+ (this.buyTokenAmount / 100 * parseFloat(this.$store.state.StateAccount.bnbPrice.valueString)).toFixed(8)
    },
    SellTokenInputChange(){
      this.sellTokenAmountTipmsg = '$'+ (this.sellTokenAmount / 100 * parseFloat(this.$store.state.StateAccount.bnbPrice.valueString)).toFixed(8)
    },
    // Buy Token 
    BuyTokens(){
      var amount = parseFloat(this.buyTokenAmount)
      if(isNaN(amount)){
        this.ErrMsg = "请输入要买入Token 所需要的 ETH 数量"
        this.$refs['modal-err'].show()
        return
      }

      var obj = this.$MSHK;
      obj.Event_BuyTokens(amount.toString())
    },
    // Sell Token 
    SellTokens(){
      var amount = parseFloat(this.sellTokenAmount)
      if(isNaN(amount)){
        this.ErrMsg = "请输入要卖出Token的数量"
        this.$refs['modal-err'].show()
        return
      }

      var obj = this.$MSHK;
      obj.Event_SellTokens(amount.toString())
    },
    ViewBalance(){
      var obj = this.$MSHK;
      obj.Event_UpdateVendorBalance();
    },
    // 部署合约
    async DeployTokens(){
      var obj = this.$MSHK;
      // 部署合约
      await obj.Event_DeployContractWithEthers();
      // 更新余额
      await obj.Event_UpdateVendorBalance();
    },
    // 初始化页面所需事件
    async Init(){
      var obj = this.$MSHK;
      await obj.Init();

      // await obj.Event_RequestAccount()
    },
  },
  mounted() {
    // 初始化通用js
    this.Init()
  }
}
</script>
