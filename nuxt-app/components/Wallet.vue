<template>
    <div>
        BNB:<b-icon-currency-dollar></b-icon-currency-dollar>
        {{ BNBPrice }}
        &nbsp;&nbsp;&nbsp;&nbsp;
        <b-icon-wallet></b-icon-wallet>
        {{ Account }}
        &nbsp;&nbsp;
        <b-button pill class="btn-md" @click="Connect" v-show="ConnectShow" variant="outline-secondary">{{ ConnectText }}</b-button>
    </div>
</template>
<script>
export default {
    name: 'Wallet',
    computed: {
        BNBPrice: function(){
            return this.$store.state.StateAccount.bnbPrice.valueString
        },
        Account: function(){
            return this.$store.state.StateAccount.account && this.$store.state.StateAccount.account.length != 0 ? this.$store.state.StateAccount.account[0].substring(0, 5) + '...' + this.$store.state.StateAccount.account[0].substring(this.$store.state.StateAccount.account[0].length-5) : ''
        },
        ConnectShow: function(){
            return !this.$store.state.StateAccount.chainId || this.$store.state.StateAccount.chainId!=56 || !this.$store.state.StateAccount.account || this.$store.state.StateAccount.account.length == 0
        },
        ConnectText:function(){
            if(!this.$store.state.StateAccount.account){
                return 'Connect BNB Chain'
            }else if(this.$store.state.StateAccount.chainId!=56){
                return 'Switch BNB Chain'
            }
            return 'Connect BNB Chain'
        }
    },
    methods: {
        async Connect() {
            if (window.ethereum) {
                var obj = this.$MSHK;
                await obj.Event_ConnectMeatMask();
            } else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!https://metamask.io/download/')
            }
        }
    },
    mounted() {
    }
}
</script>